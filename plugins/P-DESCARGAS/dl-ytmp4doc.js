import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'

// ═════════════════════════════════════
// 🌸 SAITAMABOT • YTMP4 DOCUMENT
// ═════════════════════════════════════
// API 1 → StellarWA
// API 2 → SylphyAPI
// ═════════════════════════════════════


// ═════════════════════════════════════
// ⚙️ STELLARWA
// ═════════════════════════════════════

const STELLAR_API =
  'https://api.stellarwa.xyz'

const STELLAR_KEY =
  'proyectsV2'


// ═════════════════════════════════════
// ⚙️ SYLPHY API
// ═════════════════════════════════════

const SYLPHY_API =
  'https://www.sylphyy.xyz/download/v2/ytmp4'

const SYLPHY_KEY =
  'sylph-d7ed7664'


// ═════════════════════════════════════
// 🌐 USER AGENT
// ═════════════════════════════════════

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'


// ═════════════════════════════════════
// ⏱️ TIEMPOS
// ═════════════════════════════════════

const API_TIMEOUT =
  120000

const DOWNLOAD_TIMEOUT =
  600000


// ═════════════════════════════════════
// 🧹 NOMBRE SEGURO
// ═════════════════════════════════════

function safeFileName(title) {

  return String(
    title || 'YouTube Video'
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
    || 'YouTube Video'
}


// ═════════════════════════════════════
// 🔗 NORMALIZAR URL
// ═════════════════════════════════════

function normalizeYouTubeUrl(input) {

  const value =
    String(input || '').trim()

  if (!value) {
    throw new Error(
      'Debes ingresar un enlace de YouTube.'
    )
  }

  if (
    /^https?:\/\//i.test(value)
  ) {
    return value
  }

  return `https://www.youtube.com/watch?v=${encodeURIComponent(value)}`
}


// ═════════════════════════════════════
// 🌐 DESCARGAR STREAM
// ═════════════════════════════════════

async function downloadToFile(
  downloadUrl,
  filePath
) {

  if (!downloadUrl) {
    throw new Error(
      'La API no devolvió una URL de descarga.'
    )
  }

  const response =
    await axios.get(
      downloadUrl,
      {
        responseType: 'stream',

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
        },

        validateStatus:
          status =>
            status >= 200 &&
            status < 400
      }
    )

  await pipeline(
    response.data,
    fs.createWriteStream(filePath)
  )

  const stat =
    await fs.promises.stat(
      filePath
    )

  if (
    !stat.isFile() ||
    stat.size <= 0
  ) {

    throw new Error(
      'El archivo descargado está vacío.'
    )
  }

  return stat
}


// ═════════════════════════════════════
// 🌐 API 1 • STELLARWA
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

        timeout:
          API_TIMEOUT,

        headers: {
          'User-Agent':
            USER_AGENT,

          Accept:
            'application/json'
        }
      }
    )

  const data =
    response.data

  if (
    !data?.status ||
    !data?.data?.dl
  ) {

    throw new Error(
      data?.message ||
      'StellarWA no devolvió el vídeo.'
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
// 🌐 API 2 • SYLPHY
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
    response.data

  if (
    !data?.status ||
    !data?.result?.dl_url
  ) {

    throw new Error(
      data?.message ||
      'SylphyAPI no devolvió el vídeo.'
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
// 🔄 SISTEMA DE FALLBACK
// ═════════════════════════════════════

async function getVideo(url) {

  let stellarError = null

  // ═════════════════════════════════
  // 🥇 INTENTO API 1
  // ═════════════════════════════════

  try {

    return await fetchStellar(url)

  } catch (error) {

    stellarError =
      error?.message ||
      'Error desconocido'

  }


  // ═════════════════════════════════
  // 🥈 INTENTO API 2
  // ═════════════════════════════════

  try {

    return await fetchSylphy(url)

  } catch (sylphyError) {

    throw new Error(
      `SaiAPI1: ${stellarError}\n` +
      `SaiAPI2: ${
        sylphyError?.message ||
        'Error desconocido'
      }`
    )
  }
}


// ═════════════════════════════════════
// 🎯 HANDLER
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
    String(text || '').trim()


  // ═════════════════════════════════
  // ❌ SIN URL
  // ═════════════════════════════════

  if (!input) {

    return m.reply(
`╭━━━〔 📄 𝐘𝐓𝐌𝐏𝟒 𝐃𝐎𝐂𝐔𝐌𝐄𝐍𝐓 〕━━━⬣

❗ *Falta el enlace de YouTube.*

📌 Ejemplo:

${usedPrefix + command} https://youtu.be/xxxxx

╰━━━━━━━━━━━━━━━━━━━━━━⬣`
    )
  }


  // ═════════════════════════════════
  // ⏳ REACCIÓN
  // ═════════════════════════════════

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
      `ytmp4doc_${Date.now()}.mp4`
    )


  try {

    // ═══════════════════════════════
    // 🔗 URL
    // ═══════════════════════════════

    const ytUrl =
      normalizeYouTubeUrl(
        input
      )


    // ═══════════════════════════════
    // 🔄 OBTENER VIDEO
    // ═══════════════════════════════

    const media =
      await getVideo(
        ytUrl
      )


    // ═══════════════════════════════
    // 📥 DESCARGAR ARCHIVO
    // ═══════════════════════════════

    try {

      await downloadToFile(
        media.download,
        filePath
      )

    } catch (downloadError) {

      // Si el enlace de SaiAPI1 falla,
      // probar directamente SaiAPI2.

      if (
        media.api === 'SaiAPI1'
      ) {

        await rm(
          filePath,
          {
            force: true
          }
        ).catch(() => {})


        const backup =
          await fetchSylphy(
            ytUrl
          )


        await downloadToFile(
          backup.download,
          filePath
        )


        media.download =
          backup.download

        media.title =
          backup.title

        media.quality =
          backup.quality

        media.api =
          backup.api

      } else {

        throw downloadError
      }
    }


    // ═══════════════════════════════
    // 📝 TÍTULO
    // ═══════════════════════════════

    const title =
      safeFileName(
        media.title
      )


    // ═══════════════════════════════
    // 📄 CAPTION
    // ═══════════════════════════════

    const caption =
`╭━━━〔 ✅ 𝐕𝐈𝐃𝐄𝐎 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐃𝐎 〕━━━⬣

🎬 *${title}*

🎞️ *Calidad:* ${media.quality}
🌐 *API:* ${media.api}
📄 *Formato:* MP4

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 𝙎𝙖𝙞𝙩𝙖𝙢𝙖𝘽𝙤𝙩-𝙎𝙏`


    // ═══════════════════════════════
    // 📄 ENVIAR COMO DOCUMENTO
    // ═══════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        document:
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
    ).catch(() => {})


  } catch (error) {

    // ═══════════════════════════════
    // ❌ REACCIÓN
    // ═══════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})


    // ═══════════════════════════════
    // ❌ ERROR
    // ═══════════════════════════════

    return m.reply(
`╭━━━〔 ❌ 𝐘𝐓𝐌𝐏𝟒 𝐄𝐑𝐑𝐎𝐑 〕━━━╮

No se pudo descargar el vídeo.

⚠️ *Detalles:*
${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 600)}

🔄 Se intentaron:
• SaiAPI1
• SaiAPI2

╰━━━━━━━━━━━━━━━━━━━━━━╯

🌸 𝙎𝙖𝙞𝙩𝙖𝙢𝙖𝘽𝙤𝙩-𝙎𝙏`
    )

  } finally {

    // ═══════════════════════════════
    // 🧹 LIMPIAR TEMPORAL
    // ═══════════════════════════════

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
  'ytmp4doc <url>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'ytmp4doc',
  'ytvdoc'
]


export default handler