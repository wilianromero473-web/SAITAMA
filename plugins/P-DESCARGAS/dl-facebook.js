import fetch from 'node-fetch'
import https from 'https'
import dns from 'dns'
import config from '../../config.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌸 SAITAMABOT • FACEBOOK DOWNLOADER
// 🌸 API: AZBRY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const AZBRY_API =
  'https://api.azbry.com/api/download/facebook'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'

const API_TIMEOUT = 60_000
const VIDEO_TIMEOUT = 120_000

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌐 FORZAR IPv4
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

dns.setDefaultResultOrder('ipv4first')

const httpsAgent = new https.Agent({
  family: 4,
  keepAlive: true
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 OBTENER URL DE FACEBOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getFacebookUrl(m, text = '') {

  let url = text.trim()

  if (!url && m.quoted) {

    const quotedText =
      m.quoted.body ||
      m.quoted.text ||
      ''

    const match =
      quotedText.match(
        /https?:\/\/(?:www\.)?(?:facebook\.com|fb\.watch|fb\.me|video\.fb\.com)\/[^\s]+/i
      )

    if (match) {
      url = match[0]
    }
  }

  // Eliminar puntuación pegada al final
  url = url.replace(/[)\]}>,]+$/g, '')

  return url
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ VALIDAR URL DE FACEBOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function isFacebookUrl(url) {

  return /^https?:\/\/(?:www\.)?(?:facebook\.com|fb\.watch|fb\.me|video\.fb\.com)\//i
    .test(url)

}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌐 CONSULTAR AZBRY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function azbry(url) {

  const apiUrl =
    `${AZBRY_API}?url=${encodeURIComponent(url)}`

  const response =
    await fetch(apiUrl, {

      method: 'GET',

      agent: httpsAgent,

      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      },

      timeout: API_TIMEOUT
    })

  const text =
    await response.text()

  if (!response.ok) {

    throw new Error(
      `AZBRY HTTP ${response.status}: ${text.slice(0, 300)}`
    )

  }

  let json

  try {

    json = JSON.parse(text)

  } catch {

    throw new Error(
      `AZBRY respondió algo que no es JSON: ${text.slice(0, 300)}`
    )

  }

  if (!json?.status) {

    throw new Error(
      'AZBRY no devolvió resultados'
    )

  }

  const result =
    json.result

  if (!result) {

    throw new Error(
      'AZBRY: falta result'
    )

  }

  if (
    !Array.isArray(result.medias) ||
    !result.medias.length
  ) {

    throw new Error(
      'AZBRY: no se encontraron vídeos'
    )

  }

  // Buscar HD
  const hd =
    result.medias.find(
      media =>
        media?.videoAvailable &&
        media?.quality?.toLowerCase() === 'hd' &&
        media?.url
    )

  // Buscar SD
  const sd =
    result.medias.find(
      media =>
        media?.videoAvailable &&
        media?.quality?.toLowerCase() === 'sd' &&
        media?.url
    )

  if (!hd && !sd) {

    throw new Error(
      'AZBRY: no existe una URL de vídeo válida'
    )

  }

  return {

    title:
      result.title ||
      'Facebook Video',

    thumbnail:
      result.thumbnail ||
      null,

    duration:
      result.duration ||
      null,

    hd:
      hd?.url ||
      null,

    sd:
      sd?.url ||
      null

  }

}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📥 DESCARGAR VÍDEO DESDE CDN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function downloadVideo(videoUrl) {

  const response =
    await fetch(videoUrl, {

      method: 'GET',

      agent: httpsAgent,

      headers: {

        'User-Agent':
          USER_AGENT,

        'Accept':
          'video/mp4,video/*,*/*',

        'Referer':
          'https://www.facebook.com/',

        'Origin':
          'https://www.facebook.com',

        'Connection':
          'keep-alive'

      },

      redirect: 'follow',

      timeout: VIDEO_TIMEOUT

    })

  if (!response.ok) {

    throw new Error(
      `FACEBOOK CDN HTTP ${response.status}`
    )

  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    )

  if (!buffer.length) {

    throw new Error(
      'Facebook CDN devolvió un archivo vacío'
    )

  }

  // Evitar archivos que no sean vídeos válidos
  if (buffer.length < 10 * 1024) {

    throw new Error(
      `Archivo inválido (${buffer.length} bytes)`
    )

  }

  return buffer
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 NOMBRE SEGURO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function safeFileName(title) {

  return String(title)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
    || 'facebook-video'

}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command
  }
) => {

  const url =
    getFacebookUrl(m, text)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ❌ SIN URL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!url) {

    return m.reply(
`╭━━━〔 📘 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 〕━━━⬣

❗ *ENLACE REQUERIDO*

Envía un enlace de Facebook para
descargar el vídeo.

✧ Ejemplo:

${usedPrefix + command} https://www.facebook.com/share/r/...

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`
    )

  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ❌ URL INVÁLIDA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!isFacebookUrl(url)) {

    return m.reply(
`╭━━━〔 ❌ 𝐄𝐍𝐋𝐀𝐂𝐄 𝐈𝐍𝐕Á𝐋𝐈𝐃𝐎 〕━━━⬣

El enlace no parece pertenecer
a Facebook.

✧ Ejemplo:

${usedPrefix + command} https://www.facebook.com/share/r/...

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`
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

  await m.reply(
`╭━━━〔 📥 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐍𝐃𝐎 〕━━━⬣

> 🔎 Analizando enlace...
> 📘 Facebook Downloader
> ⏳ Obteniendo vídeo...

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`
  )

  try {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔵 AZBRY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const data =
      await azbry(url)

    let videoBuffer = null
    let quality = null

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🟢 INTENTAR HD
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (data.hd) {

      try {

        videoBuffer =
          await downloadVideo(
            data.hd
          )

        quality = 'HD'

      } catch {

        videoBuffer = null
      }

    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🟡 FALLBACK SD
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (!videoBuffer && data.sd) {

      try {

        videoBuffer =
          await downloadVideo(
            data.sd
          )

        quality = 'SD'

      } catch {

        videoBuffer = null
      }

    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ NINGÚN VÍDEO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (!videoBuffer) {

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
`╭━━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑 〕━━━╮

No se pudo descargar el vídeo.

⚠️ Azbry encontró el vídeo,
pero Facebook no permitió descargar
el archivo desde su CDN.

✧ Intenta con otro enlace.

╰━━━━━━━━━━━━━━━━━━━━━━╯

🌸 ${config.botName || 'SaitamaBot'}`
      )

    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 CAPTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const title =
      data.title ||
      'Facebook Video'

    const caption =
`╭━━━〔 📘 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 〕━━━⬣
🎬 *${title}*

📺 *Calidad:* ${quality}
🌐 *Fuente:* SaiApi

${data.duration
  ? `⏱️ *Duración:* ${data.duration}`
  : ''}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📤 ENVIAR VÍDEO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await conn.sendMessage(
      m.chat,
      {
        video: videoBuffer,

        mimetype:
          'video/mp4',

        fileName:
          `${safeFileName(title)}.mp4`,

        caption
      },
      {
        quoted: m
      }
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ REACCIÓN FINAL
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
`╭━━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑 〕━━━╮

No se pudo descargar el vídeo.

⚠️ *Detalles:*
${String(error.message || error).slice(0, 500)}

🔄 Intenta nuevamente con otro
enlace de Facebook.

╰━━━━━━━━━━━━━━━━━━━━━━╯

🌸 ${config.botName || 'SaitamaBot'}`
    )

  }

}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'fb <link>',
  'facebook <link>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'fb',
  'fbdl',
  'facebook',
  'facebookdl'
]

export default handler