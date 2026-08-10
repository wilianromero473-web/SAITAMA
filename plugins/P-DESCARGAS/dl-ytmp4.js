import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'

// ═════════════════════════════════════
// 🌸 SAITAMABOT • YTMP4
// ═════════════════════════════════════

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🥇 SAIAPI1 • STELLAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STELLAR_API =
  'https://api.stellarwa.xyz'

const STELLAR_KEY =
  'proyectsV2'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🥈 SAIAPI2 • SYLPHY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SYLPHY_API =
  'https://www.sylphyy.xyz/download/v2/ytmp4'

const SYLPHY_KEY =
  'sylph-d7ed7664'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'

const API_TIMEOUT = 120000
const DOWNLOAD_TIMEOUT = 600000

// ═════════════════════════════════════
// 🥇 SAIAPI1 • STELLAR
// ═════════════════════════════════════

async function fetchStellar(url) {

  const response =
    await axios.get(
      `${STELLAR_API}/dl/ytmp4`,
      {
        params: {
          url,
          quality: 'auto',
          key: STELLAR_KEY
        },

        timeout: API_TIMEOUT,

        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json'
        }
      }
    )

  const data =
    response?.data

  if (
    !data?.status ||
    !data?.data?.dl
  ) {
    throw new Error(
      data?.message ||
      'Stellar no devolvió el enlace del vídeo.'
    )
  }

  return {
    download:
      data.data.dl,

    title:
      data.data.title ||
      'YouTube Video',

    quality:
      data.data.quality ||
      'Auto',

    api:
      'SaiAPI1'
  }
}

// ═════════════════════════════════════
// 🥈 SAIAPI2 • SYLPHY
// ═════════════════════════════════════

async function fetchSylphy(url) {

  const response =
    await axios.get(
      SYLPHY_API,
      {
        params: {
          url
        },

        timeout:
          API_TIMEOUT,

        headers: {
          'User-Agent':
            USER_AGENT,

          Accept:
            'application/json',

          'X-API-Key':
            SYLPHY_KEY
        }
      }
    )

  const data =
    response?.data

  if (
    !data?.status ||
    !data?.result?.dl_url
  ) {
    throw new Error(
      data?.message ||
      'Sylphy no devolvió el enlace del vídeo.'
    )
  }

  return {
    download:
      data.result.dl_url,

    title:
      data.result.title ||
      'YouTube Video',

    quality:
      data.result.quality ||
      'Desconocida',

    api:
      'SaiAPI2'
  }
}

// ═════════════════════════════════════
// 🔄 OBTENER VIDEO CON FALLBACK
// ═════════════════════════════════════

async function getVideo(url) {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🥇 PRIMERO: STELLAR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  try {

    return await fetchStellar(url)

  } catch (error) {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🥈 RESPALDO: SYLPHY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    try {

      return await fetchSylphy(url)

    } catch (sylphyError) {

      throw new Error(
        `SaiAPI1: ${
          error?.message ||
          'Error desconocido'
        }\nSaiAPI2: ${
          sylphyError?.message ||
          'Error desconocido'
        }`
      )
    }
  }
}

// ═════════════════════════════════════
// 📥 DESCARGAR ARCHIVO
// ═════════════════════════════════════

async function downloadVideo(
  url
) {

  const response =
    await axios.get(
      url,
      {
        responseType:
          'stream',

        timeout:
          DOWNLOAD_TIMEOUT,

        maxContentLength:
          Infinity,

        maxBodyLength:
          Infinity,

        headers: {
          'User-Agent':
            USER_AGENT,

          Accept:
            'video/mp4,video/*,*/*'
        }
      }
    )

  return response.data
}

// ═════════════════════════════════════
// 🧹 NOMBRE SEGURO
// ═════════════════════════════════════

function safeFileName(
  title
) {

  return String(
    title ||
    'YouTube Video'
  )
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .slice(0, 100)
    ||
    'YouTube Video'
}

// ═════════════════════════════════════
// 🎬 HANDLER
// ═════════════════════════════════════

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
    String(
      text || ''
    ).trim()

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ❌ SIN TEXTO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!input) {

    return m.reply(
`╭━━━〔 🎬 𝐘𝐓𝐌𝐏𝟒 〕━━━⬣

❗ Ingresa un enlace de YouTube.

📌 Ejemplo:

${usedPrefix + command} https://youtu.be/xxxxx

╰━━━━━━━━━━━━━━━━━━━━━━⬣`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏳ REACCIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  ).catch(() => {})

  const tmpDir =
    './tmp'

  await fs.promises.mkdir(
    tmpDir,
    {
      recursive: true
    }
  )

  const filePath =
    path.join(
      tmpDir,
      `ytmp4_${Date.now()}.mp4`
    )

  try {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔗 OBTENER URL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const ytUrl =
      input.startsWith('http')
        ? input
        : `https://www.youtube.com/watch?v=${input}`

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔎 API 1 → API 2
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const media =
      await getVideo(ytUrl)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 NOMBRE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const title =
      safeFileName(
        media.title
      )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📥 DESCARGAR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const videoStream =
      await downloadVideo(
        media.download
      )

    await pipeline(
      videoStream,
      fs.createWriteStream(
        filePath
      )
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔎 VALIDAR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const stat =
      await fs.promises.stat(
        filePath
      )

    if (
      !stat.isFile() ||
      stat.size <= 0
    ) {
      throw new Error(
        'El vídeo descargado está vacío.'
      )
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 CAPTION
    // Solo el título va en negrita
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const caption =
`🎬 *${media.title || title}*

🌐 API: ${media.api}
🎞️ Calidad: ${media.quality || 'Desconocida'}
📄 Formato: MP4

🌸 SaitamaBot`

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📤 ENVIAR VIDEO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await conn.sendMessage(
      m.chat,
      {
        video:
          fs.readFileSync(
            filePath
          ),

        mimetype:
          'video/mp4',

        fileName:
          `${title}.mp4`,

        caption
      },
      {
        quoted: m
      }
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ REACCIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ REACCIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ ERROR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    return m.reply(
`╭━━━〔 ❌ 𝐘𝐓𝐌𝐏𝟒 𝐄𝐑𝐑𝐎𝐑 〕━━━╮

No se pudo descargar el vídeo.

⚠️ *Detalles:*
${String(
  error?.message ||
  error
).slice(0, 500)}

🔄 Se intentaron:
🥇 SaiAPI1
🥈 SaiAPI2

╰━━━━━━━━━━━━━━━━━━━━━━╯

🌸 SaitamaBot`
    )

  } finally {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🗑️ ELIMINAR TEMPORAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await rm(
      filePath,
      {
        force: true
      }
    ).catch(() => {})
  }
}

// ═════════════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'ytmp4 <url>',
  'ytv <url>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'ytmp4',
  'ytv'
]

export default handler