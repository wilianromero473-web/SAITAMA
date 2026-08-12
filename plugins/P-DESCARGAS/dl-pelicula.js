import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { spawn, execFileSync } from 'child_process'

// =========================================================
// 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 • 𝐏𝐄𝐋𝐈́𝐂𝐔𝐋𝐀
// =========================================================

const SEARCH =
  'https://luxinfinity.vercel.app/api/search/youtube'

const UPDATE_INTERVAL = 3000

const DOWNLOAD_TIMEOUT =
  60 * 60 * 1000


// =========================================================
// 𝐁𝐔𝐒𝐂𝐀𝐑 𝐁𝐈𝐍𝐀𝐑𝐈𝐎
// =========================================================

function buscarBinario(nombre, rutas = []) {

  for (const ruta of rutas) {

    try {

      if (
        fs.existsSync(ruta)
      ) {
        return ruta
      }

    } catch {}
  }

  try {

    const resultado =
      execFileSync(
        'which',
        [nombre],
        {
          encoding: 'utf8',
          stdio: [
            'ignore',
            'pipe',
            'ignore'
          ]
        }
      ).trim()

    return resultado || null

  } catch {

    return null
  }
}


// =========================================================
// 𝐁𝐈𝐍𝐀𝐑𝐈𝐎𝐒
// =========================================================

const YTDLP =
  buscarBinario(
    'yt-dlp',
    [
      '/usr/local/bin/yt-dlp',
      '/usr/bin/yt-dlp'
    ]
  )

const FFMPEG =
  buscarBinario(
    'ffmpeg',
    [
      '/usr/bin/ffmpeg',
      '/usr/local/bin/ffmpeg'
    ]
  )

const NODE =
  buscarBinario(
    'node',
    [
      '/usr/bin/node',
      '/usr/local/bin/node'
    ]
  )


// =========================================================
// 𝐋𝐈𝐌𝐏𝐈𝐀𝐑 𝐍𝐎𝐌𝐁𝐑𝐄
// =========================================================

function limpiarNombre(
  nombre = ''
) {

  return String(nombre)

    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      ''
    )

    .replace(
      /\s+/g,
      ' '
    )

    .trim()

    .slice(
      0,
      100
    )

    || 'pelicula'
}


// =========================================================
// 𝐅𝐎𝐑𝐌𝐀𝐓𝐎 𝐃𝐄 𝐓𝐀𝐌𝐀𝐍̃𝐎
// =========================================================

function formatBytes(
  bytes = 0
) {

  if (
    !bytes ||
    bytes <= 0
  ) {
    return '0 B'
  }

  const unidades = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB'
  ]

  const i =
    Math.min(
      Math.floor(
        Math.log(bytes) /
        Math.log(1024)
      ),
      unidades.length - 1
    )

  return `${(
    bytes /
    Math.pow(1024, i)
  ).toFixed(2)} ${unidades[i]}`
}


// =========================================================
// 𝐁𝐀𝐑𝐑𝐀 𝐃𝐄 𝐏𝐑𝐎𝐆𝐑𝐄𝐒𝐎
// =========================================================

function progressBar(
  percent = 0,
  length = 22
) {

  percent =
    Math.max(
      0,
      Math.min(
        100,
        percent
      )
    )

  const filled =
    Math.round(
      (percent / 100) *
      length
    )

  return (
    '▰'.repeat(filled) +
    '▱'.repeat(
      length - filled
    )
  )
}


// =========================================================
// 𝐏𝐀𝐑𝐒𝐄𝐀𝐑 𝐏𝐑𝐎𝐆𝐑𝐄𝐒𝐎
// =========================================================

function parseProgress(
  line = ''
) {

  const percent =
    line.match(
      /(\d+(?:\.\d+)?)%/
    )

  const speed =
    line.match(
      /at\s+([0-9.]+\s*[KMGTP]?i?B\/s)/i
    )

  const eta =
    line.match(
      /ETA\s+([0-9:]+|Unknown)/i
    )

  return {

    percent:
      percent
        ? parseFloat(
            percent[1]
          )
        : 0,

    speed:
      speed
        ? speed[1]
        : 'Calculando...',

    eta:
      eta
        ? eta[1]
        : '--:--'
  }
}


// =========================================================
// 𝐓𝐀𝐌𝐀𝐍̃𝐎 𝐃𝐄 𝐂𝐀𝐑𝐏𝐄𝐓𝐀
// =========================================================

async function obtenerTamano(
  dir
) {

  let total = 0

  try {

    const archivos =
      await fs.promises.readdir(
        dir
      )

    for (
      const nombre
      of archivos
    ) {

      if (
        nombre.endsWith('.part') ||
        nombre.endsWith('.ytdl') ||
        nombre.endsWith('.temp')
      ) {
        continue
      }

      try {

        const stat =
          await fs.promises.stat(
            path.join(
              dir,
              nombre
            )
          )

        if (
          stat.isFile()
        ) {
          total += stat.size
        }

      } catch {}
    }

  } catch {}

  return total
}


// =========================================================
// 𝐁𝐔𝐒𝐂𝐀𝐑 𝐌𝐏𝟒
// =========================================================

async function buscarVideo(
  dir
) {

  let archivos = []

  try {

    archivos =
      await fs.promises.readdir(
        dir
      )

  } catch {

    return null
  }

  const candidatos = []

  for (
    const nombre
    of archivos
  ) {

    const lower =
      nombre.toLowerCase()

    if (
      lower.endsWith('.part') ||
      lower.endsWith('.ytdl') ||
      lower.endsWith('.json') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.vtt') ||
      lower.endsWith('.srt')
    ) {
      continue
    }

    const archivo =
      path.join(
        dir,
        nombre
      )

    try {

      const stat =
        await fs.promises.stat(
          archivo
        )

      if (
        stat.isFile() &&
        stat.size > 10000
      ) {

        candidatos.push({
          path: archivo,
          size: stat.size
        })
      }

    } catch {}
  }

  if (
    !candidatos.length
  ) {
    return null
  }

  candidatos.sort(
    (a, b) =>
      b.size - a.size
  )

  return candidatos[0]
}


// =========================================================
// 𝐇𝐀𝐍𝐃𝐋𝐄𝐑
// =========================================================

const handler = async (
  m,
  {
    conn,
    text
  }
) => {

  const query =
    String(
      text || ''
    ).trim()


  // =======================================================
  // 𝐕𝐀𝐋𝐈𝐃𝐀𝐑 𝐘𝐓-𝐃𝐋𝐏
  // =======================================================

  if (!YTDLP) {

    return m.reply(
`𝙀𝙧𝙧𝙤𝙧

𝙮𝙩-𝙙𝙡𝙥 𝙣𝙤 𝙚𝙨𝙩á 𝙞𝙣𝙨𝙩𝙖𝙡𝙖𝙙𝙤.`
    )
  }


  // =======================================================
  // 𝐕𝐀𝐋𝐈𝐃𝐀𝐑 𝐅𝐅𝐌𝐏𝐄𝐆
  // =======================================================

  if (!FFMPEG) {

    return m.reply(
`𝙀𝙧𝙧𝙤𝙧

𝙛𝙛𝙢𝙥𝙚𝙜 𝙣𝙤 𝙚𝙨𝙩á 𝙞𝙣𝙨𝙩𝙖𝙡𝙖𝙙𝙤.`
    )
  }


  // =======================================================
  // 𝐒𝐈𝐍 𝐁𝐔́𝐒𝐐𝐔𝐄𝐃𝐀
  // =======================================================

  if (!query) {

    return m.reply(
`𝙔𝙤𝙪𝙏𝙪𝙗𝙚 𝙋𝙚𝙡í𝙘𝙪𝙡𝙖

𝙀𝙨𝙘𝙧𝙞𝙗𝙚 𝙚𝙡 𝙣𝙤𝙢𝙗𝙧𝙚.

𝙀𝙟𝙚𝙢𝙥𝙡𝙤:

.𝙥𝙚𝙡𝙞𝙘𝙪𝙡𝙖 𝙎𝙝𝙧𝙚𝙠`
    )
  }


  let progressMsg = null
  let workDir = null
  let proceso = null

  let lastUpdate = 0
  let lastPercent = -1
  let updating = false


  try {

    // =====================================================
    // 𝐁𝐔́𝐒𝐐𝐔𝐄𝐃𝐀
    // =====================================================

    const {
      data
    } =
      await axios.get(
        SEARCH,
        {
          params: {
            query,
            limit: 10
          },

          timeout:
            30000
        }
      )


    const resultados =
      Array.isArray(
        data?.data
      )
        ? data.data
        : []


    if (
      !resultados.length
    ) {

      throw new Error(
        'No se encontraron resultados.'
      )
    }


    // =====================================================
    // 𝐄𝐋𝐄𝐆𝐈𝐑 𝐕𝐈́𝐃𝐄𝐎
    // =====================================================

    const result =
      resultados.find(
        video => {

          const segundos =
            Number(
              video?.duration?.seconds ||
              video?.durationSeconds ||
              0
            )

          return (
            video?.url &&
            segundos >= 3600
          )
        }
      )


    if (!result) {

      throw new Error(
        'No encontré una película de más de 1 hora.'
      )
    }


    const title =
      limpiarNombre(
        result.title ||
        'Película'
      )


    const duration =
      result?.duration?.text ||
      result?.duration?.timestamp ||
      'Desconocida'


    // =====================================================
    // 𝐂𝐀𝐑𝐏𝐄𝐓𝐀
    // =====================================================

    const tmpDir =
      path.resolve(
        './tmp'
      )

    await fs.promises.mkdir(
      tmpDir,
      {
        recursive: true
      }
    )


    workDir =
      path.join(
        tmpDir,
        `pelicula_${Date.now()}`
      )


    await fs.promises.mkdir(
      workDir,
      {
        recursive: true
      }
    )


    const output =
      path.join(
        workDir,
        'video.%(ext)s'
      )


    // =====================================================
    // 𝐌𝐄𝐍𝐒𝐀𝐉𝐄 𝐏𝐑𝐎𝐆𝐑𝐄𝐒𝐎
    // =====================================================

    progressMsg =
      await conn.sendMessage(
        m.chat,
        {
          text:
`𝙋𝙚𝙡í𝙘𝙪𝙡𝙖

𝙏í𝙩𝙪𝙡𝙤: ${title}

${progressBar(0)}

𝙋𝙧𝙤𝙜𝙧𝙚𝙨𝙤: 0%
𝙏𝙖𝙢𝙖ñ𝙤: 0 B
𝙑𝙚𝙡𝙤𝙘𝙞𝙙𝙖𝙙: Calculando...
𝙀𝙏𝘼: --:--`
        },
        {
          quoted: m
        }
      )


    // =====================================================
    // 𝐀𝐑𝐆𝐔𝐌𝐄𝐍𝐓𝐎𝐒
    // =====================================================

    const args = [

      result.url,

      '--format',
      'bv*+ba/b',

      '--merge-output-format',
      'mp4',

      '--remux-video',
      'mp4',

      '--output',
      output,

      '--no-playlist',

      '--newline',

      '--progress',

      '--retries',
      '15',

      '--fragment-retries',
      '15',

      '--file-access-retries',
      '10',

      '--retry-sleep',
      'exp=1:10',

      '--concurrent-fragments',
      '4',

      '--no-write-info-json',

      '--no-write-thumbnail',

      '--no-write-subs',

      '--ffmpeg-location',
      path.dirname(FFMPEG),

      '--no-part',

      '--force-overwrites'
    ]


    // =====================================================
    // 𝐉𝐒 𝐑𝐔𝐍𝐓𝐈𝐌𝐄
    // =====================================================

    if (NODE) {

      args.push(
        '--js-runtimes',
        `node:${NODE}`
      )
    }


    // =====================================================
    // 𝐈𝐍𝐈𝐂𝐈𝐀𝐑
    // =====================================================

    proceso =
      spawn(
        YTDLP,
        args,
        {
          cwd:
            workDir,

          stdio: [
            'ignore',
            'pipe',
            'pipe'
          ]
        }
      )


    // =====================================================
    // 𝐏𝐑𝐎𝐆𝐑𝐄𝐒𝐎
    // =====================================================

    async function actualizar(
      line
    ) {

      if (
        !line ||
        !line.includes('%')
      ) {
        return
      }


      const info =
        parseProgress(
          line
        )


      const porcentaje =
        Math.round(
          info.percent
        )


      if (
        porcentaje ===
        lastPercent
      ) {
        return
      }


      const ahora =
        Date.now()


      if (
        ahora -
        lastUpdate <
        UPDATE_INTERVAL
      ) {
        return
      }


      if (
        updating
      ) {
        return
      }


      if (
        !progressMsg?.key
      ) {
        return
      }


      lastPercent =
        porcentaje

      lastUpdate =
        ahora

      updating =
        true


      try {

        const size =
          await obtenerTamano(
            workDir
          )


        await conn.sendMessage(
          m.chat,
          {
            text:
`𝙋𝙚𝙡í𝙘𝙪𝙡𝙖

𝙏í𝙩𝙪𝙡𝙤: ${title}

${progressBar(
  porcentaje
)}

𝙋𝙧𝙤𝙜𝙧𝙚𝙨𝙤: ${porcentaje}%
𝙏𝙖𝙢𝙖ñ𝙤: ${formatBytes(size)}
𝙑𝙚𝙡𝙤𝙘𝙞𝙙𝙖𝙙: ${info.speed}
𝙀𝙏𝘼: ${info.eta}`,

            edit:
              progressMsg.key
          }
        )

      } catch {}

      updating =
        false
    }


    // =====================================================
    // 𝐒𝐓𝐃𝐎𝐔𝐓
    // =====================================================

    proceso.stdout.on(
      'data',
      chunk => {

        const lines =
          chunk
            .toString()
            .split(/\r?\n/)

        for (
          const line
          of lines
        ) {

          actualizar(
            line.trim()
          )
        }
      }
    )


    // =====================================================
    // 𝐒𝐓𝐃𝐄𝐑𝐑
    // =====================================================

    proceso.stderr.on(
      'data',
      chunk => {

        const lines =
          chunk
            .toString()
            .split(/\r?\n/)

        for (
          const line
          of lines
        ) {

          actualizar(
            line.trim()
          )
        }
      }
    )


    // =====================================================
    // 𝐄𝐒𝐏𝐄𝐑𝐀𝐑
    // =====================================================

    const exitCode =
      await new Promise(
        (
          resolve,
          reject
        ) => {

          const timeout =
            setTimeout(
              () => {

                try {
                  proceso.kill(
                    'SIGKILL'
                  )
                } catch {}

                reject(
                  new Error(
                    'La descarga superó el tiempo máximo permitido.'
                  )
                )

              },
              DOWNLOAD_TIMEOUT
            )


          proceso.once(
            'error',
            error => {

              clearTimeout(
                timeout
              )

              reject(
                error
              )
            }
          )


          proceso.once(
            'close',
            code => {

              clearTimeout(
                timeout
              )

              resolve(
                code
              )
            }
          )
        }
      )


    if (
      exitCode !== 0
    ) {

      throw new Error(
        `yt-dlp terminó con código ${exitCode}`
      )
    }


    // =====================================================
    // 𝐁𝐔𝐒𝐂𝐀𝐑 𝐀𝐑𝐂𝐇𝐈𝐕𝐎
    // =====================================================

    const video =
      await buscarVideo(
        workDir
      )


    if (!video) {

      throw new Error(
        'yt-dlp terminó, pero no se encontró el archivo MP4.'
      )
    }


    const extension =
      path.extname(
        video.path
      ).toLowerCase()


    if (
      extension !== '.mp4'
    ) {

      throw new Error(
        `El archivo obtenido no es MP4: ${extension}`
      )
    }


    const stat =
      await fs.promises.stat(
        video.path
      )


    // =====================================================
    // 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐃𝐎
    // =====================================================

    if (
      progressMsg?.key
    ) {

      await conn.sendMessage(
        m.chat,
        {
          text:
`𝙋𝙚𝙡í𝙘𝙪𝙡𝙖

𝙏í𝙩𝙪𝙡𝙤: ${title}

${progressBar(100)}

𝙋𝙧𝙤𝙜𝙧𝙚𝙨𝙤: 100%
𝙏𝙖𝙢𝙖ñ𝙤: ${formatBytes(
  stat.size
)}
𝙁𝙤𝙧𝙢𝙖𝙩𝙤: MP4

𝙀𝙣𝙫𝙞𝙖𝙣𝙙𝙤...`,

          edit:
            progressMsg.key
        }
      ).catch(
        () => {}
      )
    }


    // =====================================================
    // 𝐄𝐍𝐕𝐈𝐀𝐑
    // =====================================================

    await conn.sendMessage(
      m.chat,
      {
        video: {
          url:
            video.path
        },

        mimetype:
          'video/mp4',

        fileName:
          `${title}.mp4`,

        caption:
`𝙋𝙚𝙡í𝙘𝙪𝙡𝙖

𝙏í𝙩𝙪𝙡𝙤: ${title}
𝘿𝙪𝙧𝙖𝙘𝙞ó𝙣: ${duration}
𝙏𝙖𝙢𝙖ñ𝙤: ${formatBytes(
  stat.size
)}
𝙁𝙤𝙧𝙢𝙖𝙩𝙤: MP4`
      },
      {
        quoted:
          m
      }
    )


    // =====================================================
    // 𝐑𝐄𝐀𝐂𝐂𝐈𝐎́𝐍
    // =====================================================

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    ).catch(
      () => {}
    )


  } catch (e) {

    // =====================================================
    // 𝐋𝐈𝐌𝐏𝐈𝐀𝐑
    // =====================================================

    if (
      workDir
    ) {

      await rm(
        workDir,
        {
          recursive: true,
          force: true
        }
      ).catch(
        () => {}
      )
    }


    // =====================================================
    // 𝐑𝐄𝐀𝐂𝐂𝐈𝐎́𝐍
    // =====================================================

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(
      () => {}
    )


    // =====================================================
    // 𝐄𝐑𝐑𝐎𝐑
    // =====================================================

    const mensaje =
      String(
        e?.message ||
        e ||
        'Error desconocido'
      )


    if (
      progressMsg?.key
    ) {

      await conn.sendMessage(
        m.chat,
        {
          text:
`𝙀𝙧𝙧𝙤𝙧

𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙧:

${query}

${mensaje.slice(
  0,
  600
)}`,

          edit:
            progressMsg.key
        }
      ).catch(
        () => {}
      )

    } else {

      await m.reply(
`𝙀𝙧𝙧𝙤𝙧

𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙧:

${mensaje.slice(
  0,
  600
)}`
      )
    }


  } finally {

    if (
      proceso &&
      !proceso.killed
    ) {

      try {
        proceso.kill(
          'SIGTERM'
        )
      } catch {}
    }


    if (
      workDir
    ) {

      await rm(
        workDir,
        {
          recursive: true,
          force: true
        }
      ).catch(
        () => {}
      )
    }
  }
}


// =========================================================
// 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈𝐎́𝐍
// =========================================================

handler.command = [
  'pelicula',
  'peliculas',
  'pl',
  'pldl'
]

handler.tags = [
  'descargas'
]

handler.help = [
  'pelicula <nombre>'
]

export default handler