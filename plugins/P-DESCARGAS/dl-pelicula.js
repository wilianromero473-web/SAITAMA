import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { spawn, execFileSync } from 'child_process'

const SEARCH = 'https://luxinfinity.vercel.app/api/search/youtube'
const UPDATE_INTERVAL = 3000

// ═════════════════════════════════════
// 🔧 BUSCAR BINARIOS
// ═════════════════════════════════════

function buscarBinario(nombre, rutas = []) {
  for (const ruta of rutas) {
    try {
      if (fs.existsSync(ruta)) return ruta
    } catch {}
  }

  try {
    const resultado = execFileSync(
      'which',
      [nombre],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      }
    ).trim()

    return resultado || null
  } catch {
    return null
  }
}

const YTDLP = buscarBinario('yt-dlp', [
  '/usr/local/bin/yt-dlp',
  '/usr/bin/yt-dlp'
])

const FFMPEG = buscarBinario('ffmpeg', [
  '/usr/bin/ffmpeg',
  '/usr/local/bin/ffmpeg'
])

const ARIA2C = buscarBinario('aria2c', [
  '/usr/bin/aria2c',
  '/usr/local/bin/aria2c'
])

const NODE = buscarBinario('node', [
  '/usr/bin/node',
  '/usr/local/bin/node'
])

// ═════════════════════════════════════
// 🛠️ UTILIDADES
// ═════════════════════════════════════

function limpiarNombre(nombre = '') {
  return String(nombre)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || 'pelicula'
}

function formatBytes(bytes = 0) {
  if (!bytes || bytes <= 0) return '0 B'

  const unidades = ['B', 'KB', 'MB', 'GB', 'TB']

  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    unidades.length - 1
  )

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${unidades[i]}`
}

function progressBar(percent = 0, length = 22) {
  percent = Math.max(0, Math.min(100, percent))

  const filled = Math.round(
    (percent / 100) * length
  )

  return (
    '▰'.repeat(filled) +
    '▱'.repeat(length - filled)
  )
}

function parseProgress(line = '') {
  const percent =
    line.match(/(\d+(?:\.\d+)?)%/)

  const speed =
    line.match(
      /at\s+([0-9.]+\s*[KMGTP]?i?B\/s)/i
    )

  const eta =
    line.match(
      /ETA\s+([0-9:]+|Unknown)/i
    )

  return {
    percent: percent
      ? parseFloat(percent[1])
      : 0,

    speed: speed
      ? speed[1]
      : 'Calculando...',

    eta: eta
      ? eta[1]
      : '--:--'
  }
}

async function obtenerTamano(dir) {
  let total = 0

  try {
    const archivos =
      await fs.promises.readdir(dir)

    for (const nombre of archivos) {
      if (
        nombre.endsWith('.part') ||
        nombre.endsWith('.ytdl')
      ) continue

      try {
        const stat =
          await fs.promises.stat(
            path.join(dir, nombre)
          )

        if (stat.isFile()) {
          total += stat.size
        }
      } catch {}
    }
  } catch {}

  return total
}

async function buscarVideo(dir) {
  let archivos = []

  try {
    archivos =
      await fs.promises.readdir(dir)
  } catch {
    return null
  }

  const candidatos = []

  for (const nombre of archivos) {
    if (
      nombre.endsWith('.part') ||
      nombre.endsWith('.ytdl') ||
      nombre.endsWith('.json') ||
      nombre.endsWith('.jpg') ||
      nombre.endsWith('.jpeg') ||
      nombre.endsWith('.webp') ||
      nombre.endsWith('.png')
    ) continue

    const archivo =
      path.join(dir, nombre)

    try {
      const stat =
        await fs.promises.stat(archivo)

      if (
        stat.isFile() &&
        stat.size > 0
      ) {
        candidatos.push({
          path: archivo,
          size: stat.size
        })
      }
    } catch {}
  }

  if (!candidatos.length) return null

  candidatos.sort(
    (a, b) => b.size - a.size
  )

  return candidatos[0]
}

// ═════════════════════════════════════
// 🎬 HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  { conn, text }
) => {

  if (!YTDLP) {
    return m.reply(
      `╭━━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑 〕━━━⬣
┃
┃ yt-dlp no está instalado.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
    )
  }

  if (!FFMPEG) {
    return m.reply(
      `╭━━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑 〕━━━⬣
┃
┃ ffmpeg no está instalado.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
    )
  }

  if (!text?.trim()) {
    return m.reply(
      `╭━━━〔 🎬 𝐏𝐄𝐋𝐈́𝐂𝐔𝐋𝐀 〕━━━⬣
┃
┃ ✦ Uso:
┃   .pelicula nombre
┃
┃ ✦ Ejemplo:
┃   .pelicula shrek
┃
╰━━━━━━━━━━━━━━━━━━⬣`
    )
  }

  let progressMsg = null
  let workDir = null
  let proceso = null

  let lastUpdate = 0
  let lastPercent = -1
  let updating = false

  try {

    // ═══════════════════════════════
    // 🔎 BUSCAR
    // ═══════════════════════════════

    const { data } =
      await axios.get(
        SEARCH,
        {
          params: {
            query: text.trim(),
            limit: 10
          },
          timeout: 30000
        }
      )

    const resultados =
      Array.isArray(data?.data)
        ? data.data
        : []

    if (!resultados.length) {
      return m.reply(
        `╭━━━〔 ❌ 𝐒𝐈𝐍 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 〕━━━⬣
┃
┃ No encontré resultados.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
      )
    }

    // ═══════════════════════════════
    // 🎥 ELEGIR VIDEO
    // ═══════════════════════════════

    const result =
      resultados.find(v => {
        const segundos =
          Number(
            v?.duration?.seconds ||
            v?.durationSeconds ||
            0
          )

        return (
          v?.url &&
          segundos >= 3600
        )
      })

    if (!result) {
      return m.reply(
        `╭━━━〔 ❌ 𝐍𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀 〕━━━⬣
┃
┃ No encontré una película
┃ válida de más de 1 hora.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
      )
    }

    const title =
      limpiarNombre(
        result.title || 'Película'
      )

    const duration =
      result?.duration?.text ||
      result?.duration?.timestamp ||
      'Desconocida'

    // ═══════════════════════════════
    // 📁 TMP
    // ═══════════════════════════════

    const tmpDir =
      path.resolve('./tmp')

    await fs.promises.mkdir(
      tmpDir,
      { recursive: true }
    )

    workDir =
      path.join(
        tmpDir,
        `pelicula_${Date.now()}`
      )

    await fs.promises.mkdir(
      workDir,
      { recursive: true }
    )

    const output =
      path.join(
        workDir,
        'pelicula.%(ext)s'
      )

    // ═══════════════════════════════
    // 📥 PROGRESO
    // ═══════════════════════════════

    progressMsg =
      await conn.sendMessage(
        m.chat,
        {
          text:
            `╭━━━〔 🎬 𝐏𝐄𝐋𝐈́𝐂𝐔𝐋𝐀 〕━━━⬣
┃
┃ ✦ *${title}*
┃
┃ ${progressBar(0)}
┃
┃ 📊 Progreso: *0%*
┃ 📦 Tamaño: *0 B*
┃ 🚀 Velocidad: *Calculando...*
┃ ⏳ ETA: *--:--*
┃
╰━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: m }
      )

    // ═══════════════════════════════
    // ⚙️ YT-DLP
    // ═══════════════════════════════

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
      '10',

      '--fragment-retries',
      '10',

      '--file-access-retries',
      '5',

      '--retry-sleep',
      'exp=1:20',

      '--no-write-info-json',
      '--no-write-thumbnail',
      '--no-write-subs',

      '--no-warnings',

      // ⭐ IMPORTANTE
      '--js-runtimes',
      NODE ? `node:${NODE}` : 'node'
    ]

    // ═══════════════════════════════
    // 🚀 ARIA2C
    // ═══════════════════════════════

    if (ARIA2C) {
      args.push(
        '--downloader',
        'aria2c',

        '--downloader-args',
        'aria2c:-x 8 -s 8 -k 1M --file-allocation=none'
      )
    }

    // ═══════════════════════════════
    // ▶️ INICIAR
    // ═══════════════════════════════

    proceso =
      spawn(
        YTDLP,
        args,
        {
          cwd: workDir,

          stdio: [
            'ignore',
            'pipe',
            'pipe'
          ]
        }
      )

    // ═══════════════════════════════
    // 📊 PROGRESO
    // ═══════════════════════════════

    async function actualizar(line) {

      if (
        !line ||
        !line.includes('%')
      ) return

      const info =
        parseProgress(line)

      const porcentaje =
        Math.round(info.percent)

      if (
        porcentaje === lastPercent
      ) return

      const ahora =
        Date.now()

      if (
        ahora - lastUpdate <
        UPDATE_INTERVAL
      ) return

      if (updating) return

      if (!progressMsg?.key) return

      lastPercent =
        porcentaje

      lastUpdate =
        ahora

      updating = true

      try {

        const size =
          await obtenerTamano(
            workDir
          )

        await conn.sendMessage(
          m.chat,
          {
            text:
              `╭━━━〔 🎬 𝐏𝐄𝐋𝐈́𝐂𝐔𝐋𝐀 〕━━━⬣
┃
┃ ✦ *${title}*
┃
┃ ${progressBar(porcentaje)}
┃
┃ 📊 Progreso: *${porcentaje}%*
┃ 📦 Tamaño: *${formatBytes(size)}*
┃ 🚀 Velocidad: *${info.speed}*
┃ ⏳ ETA: *${info.eta}*
┃
╰━━━━━━━━━━━━━━━━━━⬣`,

            edit:
              progressMsg.key
          }
        )

      } catch {}

      updating = false
    }

    // ═══════════════════════════════
    // 📡 STDOUT
    // ═══════════════════════════════

    proceso.stdout.on(
      'data',
      chunk => {
        for (
          const line of chunk
            .toString()
            .split(/\r?\n/)
        ) {
          actualizar(line.trim())
        }
      }
    )

    // ═══════════════════════════════
    // 📡 STDERR
    // ═══════════════════════════════

    proceso.stderr.on(
      'data',
      chunk => {
        for (
          const line of chunk
            .toString()
            .split(/\r?\n/)
        ) {
          actualizar(line.trim())
        }
      }
    )

    // ═══════════════════════════════
    // ⏳ ESPERAR
    // ═══════════════════════════════

    const exitCode =
      await new Promise(
        (resolve, reject) => {

          proceso.once(
            'error',
            reject
          )

          proceso.once(
            'close',
            resolve
          )
        }
      )

    if (exitCode !== 0) {
      throw new Error(
        `yt-dlp terminó con código ${exitCode}`
      )
    }

    // ═══════════════════════════════
    // 🔎 ARCHIVO
    // ═══════════════════════════════

    const video =
      await buscarVideo(workDir)

    if (!video) {
      throw new Error(
        'No se encontró el video descargado.'
      )
    }

    const extension =
      path.extname(
        video.path
      ).toLowerCase()

    if (extension !== '.mp4') {
      throw new Error(
        `El archivo descargado no es MP4: ${extension}`
      )
    }

    const stat =
      await fs.promises.stat(
        video.path
      )

    const size =
      stat.size

    // ═══════════════════════════════
    // ✅ COMPLETO
    // ═══════════════════════════════

    if (progressMsg?.key) {
      await conn.sendMessage(
        m.chat,
        {
          text:
            `╭━━━〔 ✅ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀 〕━━━⬣
┃
┃ 🎬 *${title}*
┃
┃ ${progressBar(100)}
┃
┃ 📊 Progreso: *100%*
┃ 📦 Tamaño: *${formatBytes(size)}*
┃ 🎞️ Formato: *MP4*
┃
┃ 📤 *Enviando película...*
┃
╰━━━━━━━━━━━━━━━━━━⬣`,

          edit:
            progressMsg.key
        }
      ).catch(() => {})
    }

    // ═══════════════════════════════
    // 📤 ENVIAR
    // ═══════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        video: {
          stream:
            fs.createReadStream(
              video.path
            )
        },

        mimetype:
          'video/mp4',

        fileName:
          `${title}.mp4`,

        caption:
          `╭━━━〔 🎬 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 〕━━━⬣

┃ 🎞️ *${title}*
┃ ⏱️ Duración: *${duration}*
┃ 📦 Tamaño: *${formatBytes(size)}*
┃ 🎥 Formato: *MP4*
┃
╰━━━━━━━━━━━━━━━━━━⬣`
      },
      { quoted: m }
    )

    // ═══════════════════════════════
    // ✅ REACCIÓN
    // ═══════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    )

  } catch (e) {

    // ❌ SIN console.log
    // El error solamente se muestra en WhatsApp

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})

    if (progressMsg?.key) {

      await conn.sendMessage(
        m.chat,
        {
          text:
            `╭━━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑 〕━━━⬣
┃
┃ No se pudo descargar:
┃ *${text.trim()}*
┃
┃ ⚠️ ${e?.message || 'Error desconocido'}
┃
╰━━━━━━━━━━━━━━━━━━⬣`,

          edit:
            progressMsg.key
        }
      ).catch(() => {})

    } else {

      await m.reply(
        `╭━━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑 〕━━━⬣
┃
┃ ⚠️ ${e?.message || 'Error desconocido'}
┃
╰━━━━━━━━━━━━━━━━━━⬣`
      )
    }

  } finally {

    // 🧹 BORRAR TEMPORAL

    if (workDir) {
      await rm(
        workDir,
        {
          recursive: true,
          force: true
        }
      ).catch(() => {})
    }
  }
}

// ═════════════════════════════════════
// 📌 CONFIGURACIÓN
// ═════════════════════════════════════

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