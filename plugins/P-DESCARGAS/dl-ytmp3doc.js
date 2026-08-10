import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { writeAudioTags } from '../../lib/audioTags.js'

// ═════════════════════════════════════
// 🌸 SAITAMABOT • YTMP3 DOCUMENT
// ═════════════════════════════════════
// 🥇 SaiAPI1 → StellarWA
// 🥈 SaiAPI2 → LuxInfinity
// 🥉 SaiAPI3 → SylphyAPI
// ═════════════════════════════════════


// ═════════════════════════════════════
// 🥇 STELLARWA
// ═════════════════════════════════════

const STELLAR_API =
  'https://api.stellarwa.xyz'

const STELLAR_KEY =
  'proyectsV2'


// ═════════════════════════════════════
// 🥈 LUXINFINITY
// ═════════════════════════════════════

const LUXINFINITY =
  'https://luxinfinity.vercel.app/api'


// ═════════════════════════════════════
// 🥉 SYLPHY
// ═════════════════════════════════════

const SYLPHY_API =
  'https://www.sylphyy.xyz/download/ytmp3'

const SYLPHY_KEY =
  'sylph-d7ed7664'


// ═════════════════════════════════════
// 🌐 USER AGENT
// ═════════════════════════════════════

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'


// ═════════════════════════════════════
// ⏱️ TIMEOUTS
// ═════════════════════════════════════

const API_TIMEOUT =
  120000

const DOWNLOAD_TIMEOUT =
  600000


// ═════════════════════════════════════
// 🧹 LIMPIAR TÍTULO
// ═════════════════════════════════════

function cleanTitle(value) {

  return String(
    value || 'YouTube Audio'
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
    || 'YouTube Audio'
}


// ═════════════════════════════════════
// 🔎 NORMALIZAR RESPUESTAS
// ═════════════════════════════════════

function parseMediaResponse(data) {

  if (!data) {
    return null
  }


  const info =
    data.data ||
    data.result ||
    data


  const download =
    info?.dl ||
    info?.download ||
    info?.url ||
    info?.downloadUrl ||
    info?.download_url ||
    info?.dl_url ||
    null


  if (!download) {
    return null
  }


  return {

    download,

    title:
      info?.title ||
      info?.name ||
      'YouTube Audio',

    author:
      info?.author ||
      info?.artist ||
      info?.channel ||
      'Desconocido',

    image:
      info?.image ||
      info?.thumbnail ||
      info?.thumb ||
      null
  }
}


// ═════════════════════════════════════
// 🥇 SAIAPI1 • STELLARWA
// ═════════════════════════════════════

async function fetchStellar(url) {

  const { data } =
    await axios.get(
      `${STELLAR_API}/dl/ytmp3`,
      {

        params: {
          url,
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


  const media =
    parseMediaResponse(data)


  if (!media?.download) {

    throw new Error(
      'StellarWA no devolvió descarga.'
    )
  }


  return {
    ...media,
    api: 'SaiAPI1'
  }
}


// ═════════════════════════════════════
// 🥈 SAIAPI2 • LUXINFINITY
// ═════════════════════════════════════

async function fetchLuxInfinity(url) {

  const { data } =
    await axios.get(
      `${LUXINFINITY}/dl/ytmp3`,
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
            'application/json'
        }
      }
    )


  const media =
    parseMediaResponse(data)


  if (!media?.download) {

    throw new Error(
      'LuxInfinity no devolvió descarga.'
    )
  }


  return {
    ...media,
    api: 'SaiAPI2'
  }
}


// ═════════════════════════════════════
// 🥉 SAIAPI3 • SYLPHY
// ═════════════════════════════════════

async function fetchSylphy(url) {

  const { data } =
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


  if (
    !data?.status ||
    !data?.result?.dl_url
  ) {

    throw new Error(
      data?.message ||
      'SylphyAPI no devolvió descarga.'
    )
  }


  return {

    download:
      data.result.dl_url,

    title:
      data.result.title ||
      'YouTube Audio',

    author:
      data.result.author ||
      'YouTube',

    image:
      data.result.thumbnail ||
      data.result.image ||
      null,

    api:
      'SaiAPI3'
  }
}


// ═════════════════════════════════════
// 📥 DESCARGAR AUDIO
// ═════════════════════════════════════

async function downloadAudio(
  url,
  filePath
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
            'audio/mpeg,audio/*,*/*'
        },

        validateStatus:
          status =>
            status >= 200 &&
            status < 400
      }
    )


  await pipeline(
    response.data,
    fs.createWriteStream(
      filePath
    )
  )


  const stat =
    await fs.promises.stat(
      filePath
    )


  if (
    !stat.isFile() ||
    stat.size < 1000
  ) {

    throw new Error(
      'El archivo MP3 descargado es inválido.'
    )
  }


  return stat
}


// ═════════════════════════════════════
// 🔄 SISTEMA DE 3 RESPALDOS
// ═════════════════════════════════════

async function getMp3(
  url,
  filePath
) {

  const errors = []


  // ═════════════════════════════════
  // 🥇 SAIAPI1
  // ═════════════════════════════════

  try {

    const media =
      await fetchStellar(url)


    try {

      await downloadAudio(
        media.download,
        filePath
      )


      return media

    } catch (error) {

      errors.push(
        `SaiAPI1 descarga: ${error.message}`
      )
    }

  } catch (error) {

    errors.push(
      `SaiAPI1: ${error.message}`
    )
  }


  await rm(
    filePath,
    {
      force: true
    }
  ).catch(() => {})


  // ═════════════════════════════════
  // 🥈 SAIAPI2
  // ═════════════════════════════════

  try {

    const media =
      await fetchLuxInfinity(url)


    try {

      await downloadAudio(
        media.download,
        filePath
      )


      return media

    } catch (error) {

      errors.push(
        `SaiAPI2 descarga: ${error.message}`
      )
    }

  } catch (error) {

    errors.push(
      `SaiAPI2: ${error.message}`
    )
  }


  await rm(
    filePath,
    {
      force: true
    }
  ).catch(() => {})


  // ═════════════════════════════════
  // 🥉 SAIAPI3
  // ═════════════════════════════════

  try {

    const media =
      await fetchSylphy(url)


    await downloadAudio(
      media.download,
      filePath
    )


    return media

  } catch (error) {

    errors.push(
      `SaiAPI3: ${error.message}`
    )
  }


  // ═════════════════════════════════
  // ❌ TODAS FALLARON
  // ═════════════════════════════════

  throw new Error(
    errors.join('\n')
  )
}


// ═════════════════════════════════════
// 🎵 HANDLER
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


  // ═════════════════════════════════
  // ❌ SIN TEXTO
  // ═════════════════════════════════

  if (!input) {

    return m.reply(
`╭━━━〔 🎵 𝐘𝐓𝐌𝐏𝟑 𝐃𝐎𝐂𝐔𝐌𝐄𝐍𝐓 〕━━━⬣

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
      `ytmp3doc_${Date.now()}.mp3`
    )


  try {

    // ═══════════════════════════════
    // 🔗 URL
    // ═══════════════════════════════

    const ytUrl =
      input.startsWith('http')
        ? input
        : `https://www.youtube.com/watch?v=${encodeURIComponent(input)}`


    // ═══════════════════════════════
    // 📥 DESCARGAR
    // ═══════════════════════════════

    const media =
      await getMp3(
        ytUrl,
        filePath
      )


    // ═══════════════════════════════
    // 📝 INFORMACIÓN
    // ═══════════════════════════════

    const title =
      cleanTitle(
        media.title
      )


    const author =
      cleanTitle(
        media.author
      )


    // ═══════════════════════════════
    // 🏷️ ID3
    // ═══════════════════════════════

    try {

      await writeAudioTags(
        filePath,
        {

          title,

          author,

          artist:
            author,

          album:
            title,

          image:
            media.image
        }
      )

    } catch {
      // No detener la descarga
      // si las etiquetas fallan.
    }


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
          'audio/mpeg',

        fileName:
          `${title}.mp3`,

        caption:
`╭━━━〔 🎧 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 𝐌𝐏𝟑 〕━━━⬣

🎵 *Título:*
${title}

🎤 *Artista/Canal:*
${author}

🌐 *API:*
${media.api}

🎶 *Formato:* MP3

📄 *Tipo:* Documento

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 𝙎𝙖𝙞𝙩𝙖𝙢𝙖𝘽𝙤𝙩-𝙎𝙏`
      },
      {
        quoted:
          m
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


    return m.reply(
`╭━━━〔 ❌ 𝐘𝐓𝐌𝐏𝟑 𝐃𝐎𝐂 𝐄𝐑𝐑𝐎𝐑 〕━━━╮

No se pudo descargar el audio.

⚠️ *Detalles:*
${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 900)}

🔄 Se intentaron:
• SaiAPI1
• SaiAPI2
• SaiAPI3

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
  'ytmp3doc <url>',
  'ytadoc <url>',
  'mp3ytdoc <url>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'ytmp3doc',
  'ytadoc',
  'mp3ytdoc'
]

handler.register = true

export default handler