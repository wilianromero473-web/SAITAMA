import fetch from 'node-fetch'
import config from '../../config.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ༺ 𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺 • 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 ༻
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
// ✰ 𝙾𝙱𝚃𝙴𝙽𝙴𝚁 𝚄𝚁𝙻
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getFacebookUrl(m, text = '') {

  let url =
    String(text || '').trim()

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

  return url.replace(
    /[)\]}>,]+$/g,
    ''
  )
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✰ 𝚅𝙰𝙻𝙸𝙳𝙰𝚁 𝚄𝚁𝙻
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function isFacebookUrl(url) {

  return /^https?:\/\/(?:www\.)?(?:facebook\.com|fb\.watch|fb\.me|video\.fb\.com)\//i
    .test(url)

}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✰ 𝙻𝙴𝙼𝙿𝙸
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function lempiFacebook(url) {

  const apiUrl =
    `${LEMPI_API}?url=${encodeURIComponent(url)}&quality=hd&apikey=${API_KEY}`

  const response =
    await fetch(
      apiUrl,
      {
        method: 'GET',

        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json'
        },

        timeout: API_TIMEOUT
      }
    )

  const text =
    await response.text()

  if (!response.ok) {
    throw new Error(
      `Lempi HTTP ${response.status}`
    )
  }

  let json

  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(
      'Lempi no respondió JSON.'
    )
  }

  if (!json?.status) {
    throw new Error(
      'No se encontraron resultados.'
    )
  }

  if (!json?.datos?.url) {
    throw new Error(
      'No se encontró el vídeo.'
    )
  }

  return json
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✰ 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚁 𝚅𝙸𝙳𝙴𝙾
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function downloadVideo(videoUrl) {

  const response =
    await fetch(
      videoUrl,
      {
        method: 'GET',

        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'video/mp4,video/*,*/*',
          'Referer': 'https://www.facebook.com/'
        },

        redirect: 'follow',
        timeout: VIDEO_TIMEOUT
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
      'El vídeo está vacío.'
    )
  }

  if (buffer.length < 10 * 1024) {
    throw new Error(
      'El archivo recibido no es válido.'
    )
  }

  return buffer
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✰ 𝙽𝙾𝙼𝙱𝚁𝙴 𝚂𝙴𝙶𝚄𝚁𝙾
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function safeFileName(title) {

  return String(
    title || 'facebook-video'
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
    .slice(0, 80)
    || 'facebook-video'

}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✰ 𝙲𝙰𝙿𝚃𝙸𝙾𝙽
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createCaption(data) {

  const description =
    data.descripcion ||
    'Sin descripción'

  const duration =
    data.duracion ||
    '—'

  const quality =
    data.datos?.calidad ||
    '—'

  const size =
    data.datos?.tamaño ||
    '—'

  return `༺ 𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺 ༻

✰ 𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚌𝚒ó𝚗: ${description}
✰ 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗: ${duration}
✰ 𝙲𝚊𝚕𝚒𝚍𝚊𝚍: ${quality}
✰ 𝚃𝚊𝚖𝚊ñ𝚘: ${size}

✰ ${config.botName || 'SaitamaBot'}`
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✰ 𝙷𝙰𝙽𝙳𝙻𝙴𝚁
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
  // ✰ 𝚂𝙸𝙽 𝚄𝚁𝙻
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!url) {

    return m.reply(
`༺ 𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺 ༻

✰ 𝙴𝚗𝚟í𝚊 𝚞𝚗 𝚎𝚗𝚕𝚊𝚌𝚎 𝚍𝚎 𝙵𝚊𝚌𝚎𝚋𝚘𝚘𝚔.

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix + command} https://www.facebook.com/...`
    )

  }


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ 𝚄𝚁𝙻 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!isFacebookUrl(url)) {

    return m.reply(
`༺ 𝙴𝙽𝙻𝙰𝙲𝙴 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾 ༻

✰ El enlace no pertenece a Facebook.

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix + command} https://www.facebook.com/...`
    )

  }


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ 𝚁𝙴𝙰𝙲𝙲𝙸Ó𝙽
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


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await m.reply(
`༺ 𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺 ༻

✰ 𝙰𝚗𝚊𝚕𝚒𝚣𝚊𝚗𝚍𝚘 𝚎𝚗𝚕𝚊𝚌𝚎...
✰ 𝙾𝚋𝚝𝚎𝚗𝚒𝚎𝚗𝚍𝚘 𝚟í𝚍𝚎𝚘...

✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘...`
  )


  try {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✰ 𝙲𝙾𝙽𝚂𝚄𝙻𝚃𝙰𝚁 𝙰𝙿𝙸
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const data =
      await lempiFacebook(
        url
      )


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✰ 𝚅𝙸𝙳𝙴𝙾
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const videoUrl =
      data.datos.url


    const videoBuffer =
      await downloadVideo(
        videoUrl
      )


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✰ 𝙸𝙽𝙵𝙾
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const caption =
      createCaption(
        data
      )


    const title =
      data.titulo ||
      'Facebook Video'


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✰ 𝙴𝙽𝚅𝙸𝙰𝚁
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
    // ✰ 𝚁𝙴𝙰𝙲𝙲𝙸Ó𝙽 𝙵𝙸𝙽𝙰𝙻
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✰',
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
`༺ 𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛 𝚎𝚕 𝚟í𝚍𝚎𝚘.

✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
${String(
  error?.message ||
  error ||
  'Error desconocido.'
).slice(0, 300)}

✰ ${config.botName || 'SaitamaBot'}`
    )

  }

}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✰ 𝙲𝙾𝙽𝙵𝙸𝙶𝚄𝚁𝙰𝙲𝙸Ó𝙽
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