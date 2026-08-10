import fetch from 'node-fetch'
import https from 'https'
import dns from 'dns'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { writeAudioTags } from '../../lib/audioTags.js'

const execFileAsync = promisify(execFile)

// =========================================================
// 🌸 SAITAMABOT • YOUTUBE MP3
// =========================================================
// 1️⃣ AZBRY
// 2️⃣ yt-dlp COMO RESPALDO
// =========================================================

const AZBRY_API =
  'https://api.azbry.com/api/download/ytplay'

const YTDLP =
  process.env.YTDLP_PATH ||
  '/usr/local/bin/yt-dlp'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'

const API_TIMEOUT = 60_000
const DOWNLOAD_TIMEOUT = 180_000

dns.setDefaultResultOrder('ipv4first')

const httpsAgent = new https.Agent({
  family: 4,
  keepAlive: true
})

// =========================================================
// 🔎 YOUTUBE URL
// =========================================================

function isYouTubeUrl(text = '') {
  return /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(
    text.trim()
  )
}

// =========================================================
// 📝 NOMBRE SEGURO
// =========================================================

function safeFileName(title = 'audio-youtube') {
  return String(title)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
    || 'audio-youtube'
}

// =========================================================
// ⏱️ DURACIÓN
// =========================================================

function formatDuration(seconds) {
  if (
    seconds === undefined ||
    seconds === null ||
    !Number.isFinite(Number(seconds))
  ) {
    return 'Desconocida'
  }

  seconds = Number(seconds)

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return `${m}:${String(s).padStart(2, '0')}`
}

// =========================================================
// 🌐 PETICIÓN AZBRY
// =========================================================

async function requestAzbry(apiUrl) {
  const response = await fetch(apiUrl, {
    method: 'GET',
    agent: httpsAgent,

    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json'
    },

    timeout: API_TIMEOUT
  })

  const body = await response.text()

  if (!response.ok) {
    throw new Error(`AZBRY HTTP ${response.status}`)
  }

  let json

  try {
    json = JSON.parse(body)
  } catch {
    throw new Error('AZBRY no devolvió JSON válido')
  }

  if (!json?.status) {
    throw new Error('AZBRY no encontró resultados')
  }

  if (!json?.result) {
    throw new Error('AZBRY no devolvió result')
  }

  if (!json.result.download) {
    throw new Error('AZBRY no devolvió URL de descarga')
  }

  return json.result
}

// =========================================================
// 🔎 AZBRY SEARCH
// =========================================================

async function azbrySearch(input) {

  // URL DIRECTA
  if (isYouTubeUrl(input)) {
    const apiUrl =
      `${AZBRY_API}?url=${encodeURIComponent(input)}`

    return await requestAzbry(apiUrl)
  }

  // q
  try {
    const apiUrl =
      `${AZBRY_API}?q=${encodeURIComponent(input)}`

    return await requestAzbry(apiUrl)
  } catch {}

  // query
  try {
    const apiUrl =
      `${AZBRY_API}?query=${encodeURIComponent(input)}`

    return await requestAzbry(apiUrl)
  } catch {}

  throw new Error(
    'AZBRY no pudo encontrar la canción'
  )
}

// =========================================================
// 📥 DESCARGAR DESDE AZBRY
// =========================================================

async function downloadAzbry(url) {

  const response = await fetch(url, {
    method: 'GET',
    agent: httpsAgent,

    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'audio/mpeg,audio/*,*/*'
    },

    redirect: 'follow',
    timeout: DOWNLOAD_TIMEOUT
  })

  if (!response.ok) {
    throw new Error(
      `DESCARGA AZBRY HTTP ${response.status}`
    )
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    )

  if (!buffer.length) {
    throw new Error(
      'AZBRY devolvió un archivo vacío'
    )
  }

  return buffer
}

// =========================================================
// 🎯 OBTENER INFORMACIÓN EXACTA CON YT-DLP
// =========================================================

async function ytDlpInfo(input) {

  const target = isYouTubeUrl(input)
    ? input
    : `ytsearch1:${input}`

  const { stdout } = await execFileAsync(
    YTDLP,
    [
      '--dump-single-json',
      '--no-playlist',
      '--skip-download',
      '--no-warnings',
      '--quiet',
      '--user-agent',
      USER_AGENT,
      target
    ],
    {
      timeout: API_TIMEOUT,
      maxBuffer: 10 * 1024 * 1024
    }
  )

  let info

  try {
    info = JSON.parse(stdout)
  } catch {
    throw new Error(
      'yt-dlp no devolvió información válida'
    )
  }

  if (!info?.id) {
    throw new Error(
      'yt-dlp no encontró el vídeo'
    )
  }

  return {
    id: info.id,

    title:
      info.title ||
      'Audio de YouTube',

    channel:
      info.uploader ||
      info.channel ||
      'YouTube',

    duration:
      info.duration,

    thumbnail:
      info.thumbnail ||
      null,

    webpage_url:
      info.webpage_url ||
      `https://www.youtube.com/watch?v=${info.id}`
  }
}

// =========================================================
// 📥 DESCARGAR MP3 EXACTO
// =========================================================

async function downloadWithYtDlp(info, outputBase) {

  const outputTemplate =
    `${outputBase}.%(ext)s`

  await execFileAsync(
    YTDLP,
    [
      '--no-playlist',
      '--no-warnings',

      '--user-agent',
      USER_AGENT,

      '--extract-audio',
      '--audio-format',
      'mp3',
      '--audio-quality',
      '0',

      '-o',
      outputTemplate,

      info.webpage_url
    ],
    {
      timeout: DOWNLOAD_TIMEOUT,
      maxBuffer: 10 * 1024 * 1024
    }
  )

  const directory =
    path.dirname(outputBase)

  const base =
    path.basename(outputBase)

  const files =
    fs.readdirSync(directory)

  const generated =
    files.find(file =>
      file.startsWith(`${base}.`) &&
      file.toLowerCase().endsWith('.mp3')
    )

  if (!generated) {
    throw new Error(
      'yt-dlp no creó el archivo MP3'
    )
  }

  return path.join(
    directory,
    generated
  )
}

// =========================================================
// 🧹 ELIMINAR ARCHIVO
// =========================================================

function removeFile(file) {
  try {
    if (file && fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  } catch {}
}

// =========================================================
// 🎵 HANDLER
// =========================================================

const handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command
  }
) => {

  const input =
    String(text || '').trim()

  // =======================================================
  // ❌ SIN TEXTO
  // =======================================================

  if (!input) {
    return m.reply(
`╭━━━〔 🎵 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐌𝐏𝟑 〕━━━⬣

❗ *Falta la canción o enlace.*

🎧 *Ejemplo:*
${usedPrefix + command} Ozuna Si No Te Quiere

🔗 *También puedes usar URL:*
${usedPrefix + command} https://youtu.be/xxxxx

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`
    )
  }

  // =======================================================
  // ⏳ REACCIÓN
  // =======================================================

  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  ).catch(() => {})

  let tempFile = null
  let azbryData = null
  let info = null
  let thumbnail = null

  try {

    // =====================================================
    // 1️⃣ INTENTAR AZBRY
    // =====================================================

    try {

      azbryData =
        await azbrySearch(input)

      // Información de Azbry
      info = {
        title:
          azbryData.title ||
          'Audio de YouTube',

        channel:
          azbryData.channel ||
          azbryData.uploader ||
          'YouTube',

        duration:
          azbryData.duration ||
          null,

        thumbnail:
          azbryData.thumbnail ||
          azbryData.image ||
          null,

        webpage_url:
          azbryData.url ||
          azbryData.webpage_url ||
          input
      }

      thumbnail = info.thumbnail

    } catch {

      // ===================================================
      // 2️⃣ RESPALDO YT-DLP
      // ===================================================

      info =
        await ytDlpInfo(input)

      thumbnail =
        info.thumbnail
    }

    // =====================================================
    // VALIDAR INFORMACIÓN
    // =====================================================

    if (!info?.title) {
      throw new Error(
        'No se pudo obtener el título del vídeo'
      )
    }

    const title =
      info.title

    const channel =
      info.channel ||
      'YouTube'

    const duration =
      typeof info.duration === 'number'
        ? formatDuration(info.duration)
        : info.duration ||
          'Desconocida'

    // =====================================================
    // 📋 INFORMACIÓN
    // =====================================================

    const caption =
`╭━━━〔 🎵 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐌𝐏𝟑 〕━━━⬣

🎶 *${title}*

👤 *Canal:* ${channel}
⏱️ *Duración:* ${duration}
🎧 *Formato:* MP3
💿 *Álbum:* ѕαιтαмαвσт

╰━━━━━━━━━━━━━━━━━━━━━━⬣

⏳ *Preparando audio...*

🌸 ${config.botName || 'SaitamaBot'}`

    // =====================================================
    // 🖼️ ENVIAR MINIATURA PRIMERO
    // =====================================================

    if (thumbnail) {

      await conn.sendMessage(
        m.chat,
        {
          image: {
            url: thumbnail
          },
          caption
        },
        {
          quoted: m
        }
      ).catch(async () => {
        await m.reply(caption)
      })

    } else {

      await m.reply(caption)
    }

    // =====================================================
    // 📥 DESCARGA
    // =====================================================

    if (azbryData?.download) {

      // ===================================================
      // AZBRY
      // ===================================================

      const audioBuffer =
        await downloadAzbry(
          azbryData.download
        )

      tempFile =
        path.join(
          os.tmpdir(),
          `saitama-${Date.now()}.mp3`
        )

      fs.writeFileSync(
        tempFile,
        audioBuffer
      )

    } else {

      // ===================================================
      // YT-DLP
      // ===================================================

      const base =
        path.join(
          os.tmpdir(),
          `saitama-${Date.now()}`
        )

      tempFile =
        await downloadWithYtDlp(
          info,
          base
        )
    }

    // =====================================================
    // 🏷️ TAGS
    // =====================================================

    try {

      await writeAudioTags(
        tempFile,
        {
          title,
          author: channel,
          image: thumbnail
        }
      )

    } catch {}

    // =====================================================
    // 📖 LEER AUDIO
    // =====================================================

    const audio =
      fs.readFileSync(
        tempFile
      )

    if (!audio.length) {
      throw new Error(
        'El archivo MP3 está vacío'
      )
    }

    // =====================================================
    // 🎧 ENVIAR AUDIO
    // =====================================================

    await conn.sendMessage(
      m.chat,
      {
        audio,

        mimetype:
          'audio/mpeg',

        fileName:
          `${safeFileName(title)}.mp3`,

        ptt: false
      },
      {
        quoted: m
      }
    )

    // =====================================================
    // 🗑️ LIMPIAR
    // =====================================================

    removeFile(tempFile)
    tempFile = null

    // =====================================================
    // ✅ FINAL
    // =====================================================

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    ).catch(() => {})

  } catch (error) {

    // =====================================================
    // 🧹 LIMPIAR
    // =====================================================

    removeFile(tempFile)

    // =====================================================
    // ❌ REACCIÓN
    // =====================================================

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})

    // =====================================================
    // ❌ ERROR
    // =====================================================

    return m.reply(
`╭━━━〔 ❌ 𝐌𝐏𝟑 𝐄𝐑𝐑𝐎𝐑 〕━━━╮

No se pudo descargar el audio.

⚠️ *Detalles:*
${String(
  error?.message || error
).slice(0, 300)}

🔄 Intenta nuevamente con otra
canción o enlace.

╰━━━━━━━━━━━━━━━━━━━━━━╯

🌸 ${config.botName || 'SaitamaBot'}`
    )
  }
}

// =========================================================
// ⚙️ CONFIGURACIÓN
// =========================================================

handler.help = [
  'mp3 <canción>',
  'mp3 <url>',
  'audio <canción>',
  'audio <url>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'mp3',
  'mp3dl',
  'audio',
  'music'
]

export default handler