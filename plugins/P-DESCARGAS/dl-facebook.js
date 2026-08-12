import fetch from 'node-fetch'
import config from '../../config.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌸 SAITAMABOT • FACEBOOK DOWNLOADER
// 🌸 API: LEMPI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LEMPI_API =
  'https://api.lempi.lat/dl/facebook'

const API_KEY =
  'lem992'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'

const API_TIMEOUT =
  60_000

const VIDEO_TIMEOUT =
  180_000


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 OBTENER URL DE FACEBOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getFacebookUrl(m, text = '') {

  let url =
    String(text || '').trim()

  // ─────────────────────────────────────
  // 📌 BUSCAR EN MENSAJE CITADO
  // ─────────────────────────────────────

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

      url =
        match[0]

    }

  }

  // ─────────────────────────────────────
  // 🧹 LIMPIAR URL
  // ─────────────────────────────────────

  url =
    url.replace(
      /[)\]}>,]+$/g,
      ''
    )

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
// 🌐 CONSULTAR LEMPI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function lempiFacebook(url) {

  const apiUrl =
    `${LEMPI_API}?url=${encodeURIComponent(url)}&quality=hd&apikey=${API_KEY}`

  const response =
    await fetch(
      apiUrl,
      {

        method:
          'GET',

        headers: {

          'User-Agent':
            USER_AGENT,

          'Accept':
            'application/json'

        },

        timeout:
          API_TIMEOUT

      }
    )


  const text =
    await response.text()


  if (!response.ok) {

    throw new Error(
      `Lempi HTTP ${response.status}: ${text.slice(0, 300)}`
    )

  }


  let json

  try {

    json =
      JSON.parse(text)

  } catch {

    throw new Error(
      `Lempi respondió algo que no es JSON: ${text.slice(0, 300)}`
    )

  }


  if (!json?.status) {

    throw new Error(
      'Lempi no devolvió resultados.'
    )

  }


  if (!json?.datos?.url) {

    throw new Error(
      'Lempi no devolvió una URL de vídeo.'
    )

  }


  return json

}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📥 DESCARGAR VÍDEO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function downloadVideo(videoUrl) {

  const response =
    await fetch(
      videoUrl,
      {

        method:
          'GET',

        headers: {

          'User-Agent':
            USER_AGENT,

          'Accept':
            'video/mp4,video/*,*/*',

          'Referer':
            'https://www.facebook.com/'

        },

        redirect:
          'follow',

        timeout:
          VIDEO_TIMEOUT

      }
    )


  if (!response.ok) {

    throw new Error(
      `Facebook CDN HTTP ${response.status}`
    )

  }


  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    )


  if (!buffer.length) {

    throw new Error(
      'El vídeo descargado está vacío.'
    )

  }


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
      80
    )

    || 'facebook-video'

}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 CREAR CAPTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createCaption(data) {

  const description =
    data.descripcion ||
    'Sin descripción'

  const duration =
    data.duracion ||
    'Desconocida'

  const quality =
    data.datos?.calidad ||
    'Desconocida'

  const size =
    data.datos?.tamaño ||
    'Desconocido'

  return (
`╭━━━〔 📘 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 〕━━━⬣
┃
┃ 📝 *𝐃𝐄𝐒𝐂𝐑𝐈𝐏𝐂𝐈Ó𝐍*
┃ ${description}
┃
┃ ⏱️ *𝐃𝐔𝐑𝐀𝐂𝐈Ó𝐍:* ${duration}
┃ 🎥 *𝐂𝐀𝐋𝐈𝐃𝐀𝐃:* ${quality}
┃ 📦 *𝐓𝐀𝐌𝐀Ñ𝐎:* ${size}
┃
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`
  )

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
    getFacebookUrl(
      m,
      text
    )


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ❌ SIN URL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!url) {

    return m.reply(

`╭━━━〔 📘 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 〕━━━⬣

❗ *𝐄𝐍𝐋𝐀𝐂𝐄 𝐑𝐄𝐐𝐔𝐄𝐑𝐈𝐃𝐎*

Envía un enlace de Facebook
para descargar el vídeo.

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

        text:
          '⏳',

        key:
          m.key

      }

    }
  ).catch(() => {})


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📥 MENSAJE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await m.reply(

`╭━━━〔 📥 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐍𝐃𝐎 〕━━━⬣

> 🔎 Analizando enlace...
> 📘 Facebook Downloader
> 🌐 Consultando Lempi...
> ⏳ Obteniendo vídeo...

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`

  )


  try {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔵 LEMPI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const data =
      await lempiFacebook(
        url
      )


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📥 URL DIRECTA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const videoUrl =
      data.datos.url


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📥 DESCARGAR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const videoBuffer =
      await downloadVideo(
        videoUrl
      )


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 CAPTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const caption =
      createCaption(
        data
      )


    const title =
      data.titulo ||
      'Facebook Video'


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📤 ENVIAR VÍDEO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await conn.sendMessage(
      m.chat,
      {

        video:
          videoBuffer,

        mimetype:
          'video/mp4',

        fileName:
          `${safeFileName(title)}.mp4`,

        caption

      },
      {

        quoted:
          m

      }
    )


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ REACCIÓN FINAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await conn.sendMessage(
      m.chat,
      {

        react: {

          text:
            '✅',

          key:
            m.key

        }

      }
    ).catch(() => {})


  } catch (error) {

    await conn.sendMessage(
      m.chat,
      {

        react: {

          text:
            '❌',

          key:
            m.key

        }

      }
    ).catch(() => {})


    return m.reply(

`╭━━━〔 ❌ 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 〕━━━⬣

No se pudo descargar el vídeo.

⚠️ *𝐃𝐄𝐓𝐀𝐋𝐋𝐄:*

${String(
  error?.message ||
  error
).slice(0, 500)}

🔄 Intenta nuevamente con
otro enlace de Facebook.

╰━━━━━━━━━━━━━━━━━━━━━━⬣

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