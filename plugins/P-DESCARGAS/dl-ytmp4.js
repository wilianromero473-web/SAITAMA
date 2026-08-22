import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'

const STELLAR_API = 'https://api.stellarwa.xyz'
const STELLAR_KEY = 'proyectsV2'

const SYLPHY_API =
  'https://www.sylphyy.xyz/download/v2/ytmp4'

const SYLPHY_KEY = 'sylph-d7ed7664'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'

const API_TIMEOUT = 120000
const DOWNLOAD_TIMEOUT = 600000


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


async function fetchSylphy(url) {

  const response =
    await axios.get(
      SYLPHY_API,
      {
        params: {
          url
        },

        timeout: API_TIMEOUT,

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


async function getVideo(url) {

  try {

    return await fetchStellar(url)

  } catch (error1) {

    try {

      return await fetchSylphy(url)

    } catch (error2) {

      throw new Error(
`SaiAPI1: ${
  error1?.message ||
  'Error desconocido'
}

SaiAPI2: ${
  error2?.message ||
  'Error desconocido'
}`
      )
    }
  }
}


async function downloadVideo(url) {

  if (!url) {
    throw new Error(
      'URL de descarga vacía.'
    )
  }

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
        },

        validateStatus:
          status =>
            status >= 200 &&
            status < 400
      }
    )

  return response.data
}


function safeFileName(title) {

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


  if (!input) {

    return m.reply(
`༺ 𝚈𝚃𝙼𝙿𝟺 ༻

✰ 𝙵𝚊𝚕𝚝𝚊 𝚎𝚕 𝚎𝚗𝚕𝚊𝚌𝚎 𝚍𝚎 𝚈𝚘𝚞𝚃𝚞𝚋𝚎.

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix + command} https://youtu.be/xxxxx`
    )
  }


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

    const ytUrl =
      input.startsWith('http')
        ? input
        : `https://www.youtube.com/watch?v=${encodeURIComponent(input)}`


    const media =
      await getVideo(
        ytUrl
      )


    const title =
      safeFileName(
        media.title
      )


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


    const caption =
`༺ 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙼𝙿𝟺 ༻

✰ 𝚃í𝚝𝚞𝚕𝚘:
${media.title || title}

✰ 𝙲𝚊𝚕𝚒𝚍𝚊𝚍:
${media.quality || 'Desconocida'}

✰ 𝙵𝚘𝚛𝚖𝚊𝚝𝚘:
MP4

✰ 𝙰𝙿𝙸:
${media.api}`


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
        quoted:
          m
      }
    )


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
`༺ 𝚈𝚃𝙼𝙿𝟺 𝙴𝚁𝚁𝙾𝚁 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛 𝚎𝚕 𝚟í𝚍𝚎𝚘.

✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎𝚜:
${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 900)}

✰ 𝚂𝚎 𝚒𝚗𝚝𝚎𝚗𝚝𝚊𝚛𝚘𝚗:
• SaiAPI1
• SaiAPI2`
    )

  } finally {

    await rm(
      filePath,
      {
        force: true
      }
    ).catch(() => {})
  }
}


handler.help = [
  'ytmp4 <url>',
  'ytv <url>'
]


handler.tags = [
  'descargas'
]


handler.command = [
  'ytmp4',
  'ytv',
  'mp4yt'
]


export default handler