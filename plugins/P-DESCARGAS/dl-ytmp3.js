import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { writeAudioTags } from '../../lib/audioTags.js'

const STELLAR_API = 'https://api.stellarwa.xyz'
const STELLAR_KEY = 'proyectsV2'

const LUXINFINITY = 'https://luxinfinity.vercel.app/api'

const SYLPHY_API =
  'https://www.sylphyy.xyz/download/ytmp3'

const SYLPHY_KEY = 'sylph-d7ed7664'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'

const API_TIMEOUT = 120000
const DOWNLOAD_TIMEOUT = 600000

function cleanTitle(value) {
  return String(value || 'YouTube Audio')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
    || 'YouTube Audio'
}

function parseMediaResponse(data) {
  if (!data) return null

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

  if (!download) return null

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

async function fetchStellar(url) {
  const { data } =
    await axios.get(
      `${STELLAR_API}/dl/ytmp3`,
      {
        params: {
          url,
          key: STELLAR_KEY
        },

        timeout: API_TIMEOUT,

        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json'
        }
      }
    )

  const media =
    parseMediaResponse(data)

  if (!media?.download) {
    throw new Error(
      'StellarWA no devolvió una descarga.'
    )
  }

  return {
    ...media,
    api: 'SaiAPI1'
  }
}

async function fetchLuxInfinity(url) {
  const { data } =
    await axios.get(
      `${LUXINFINITY}/dl/ytmp3`,
      {
        params: {
          url
        },

        timeout: API_TIMEOUT,

        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json'
        }
      }
    )

  const media =
    parseMediaResponse(data)

  if (!media?.download) {
    throw new Error(
      'LuxInfinity no devolvió una descarga.'
    )
  }

  return {
    ...media,
    api: 'SaiAPI2'
  }
}

async function fetchSylphy(url) {
  const { data } =
    await axios.get(
      SYLPHY_API,
      {
        params: {
          url
        },

        timeout: API_TIMEOUT,

        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
          'X-API-Key': SYLPHY_KEY
        }
      }
    )

  if (
    !data?.status ||
    !data?.result?.dl_url
  ) {
    throw new Error(
      data?.message ||
      'SylphyAPI no devolvió una descarga.'
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

    api: 'SaiAPI3'
  }
}

async function downloadAudio(
  downloadUrl,
  filePath
) {
  if (!downloadUrl) {
    throw new Error(
      'URL de descarga vacía.'
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
    fs.createWriteStream(filePath)
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

async function getMp3(
  url,
  filePath
) {
  const errors = []

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

  throw new Error(
    errors.join('\n')
  )
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
`༺ 𝚈𝚃𝙼𝙿𝟹 ༻

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

  const tmpDir = './tmp'

  await fs.promises.mkdir(
    tmpDir,
    {
      recursive: true
    }
  )

  const filePath =
    path.join(
      tmpDir,
      `ytmp3_${Date.now()}.mp3`
    )

  try {

    const ytUrl =
      input.startsWith('http')
        ? input
        : `https://www.youtube.com/watch?v=${encodeURIComponent(input)}`

    const media =
      await getMp3(
        ytUrl,
        filePath
      )

    const title =
      cleanTitle(
        media.title
      )

    const author =
      cleanTitle(
        media.author
      )

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
    } catch {}

    const caption =
`༺ 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙼𝙿𝟹 ༻

✰ 𝚃í𝚝𝚞𝚕𝚘:
${title}
✰ 𝙰𝚛𝚝𝚒𝚜𝚝𝚊 / 𝙲𝚊𝚗𝚊𝚕:
${author}
✰ 𝙵𝚘𝚛𝚖𝚊𝚝𝚘:
MP3
✰ 𝙰𝙿𝙸:
${media.api}`

    await conn.sendMessage(
      m.chat,
      {
        audio:
          fs.readFileSync(
            filePath
          ),

        mimetype:
          'audio/mpeg',

        fileName:
          `${title}.mp3`,

        caption,

        ptt:
          false
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
`༺ 𝚈𝚃𝙼𝙿𝟹 𝙴𝚁𝚁𝙾𝚁 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛 𝚎𝚕 𝚊𝚞𝚍𝚒𝚘.

✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎𝚜:
${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 900)}

✰ 𝚂𝚎 𝚒𝚗𝚝𝚎𝚗𝚝𝚊𝚛𝚘𝚗:
• SaiAPI1
• SaiAPI2
• SaiAPI3`
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
  'ytmp3 <url>',
  'yta <url>',
  'mp3yt <url>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'ytmp3',
  'yta',
  'mp3yt'
]

export default handler