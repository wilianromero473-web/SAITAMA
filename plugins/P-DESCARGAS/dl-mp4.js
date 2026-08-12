import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { rm } from 'fs/promises'
import config from '../../config.js'

// =========================================================
// 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 • 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐌𝐏𝟒
// =========================================================

const FAA_API =
  'https://api-faa.my.id/faa/ytplayvid'

const TMP_DIR =
  path.join(
    os.tmpdir(),
    'saitamabot-mp4'
  )

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'

const API_TIMEOUT =
  60 * 1000

const DOWNLOAD_TIMEOUT =
  30 * 60 * 1000


// =========================================================
// 𝐕𝐀𝐋𝐎𝐑 → 𝐓𝐄𝐗𝐓𝐎
// =========================================================

function textValue(
  value,
  fallback = 'Desconocido'
) {

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return fallback
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value)
  }

  if (
    typeof value === 'object'
  ) {

    const possible =
      value.name ||
      value.title ||
      value.text ||
      value.label ||
      value.value ||
      value.username ||
      value.channelName ||
      value.formatted ||
      value.display

    if (possible) {

      return textValue(
        possible,
        fallback
      )
    }
  }

  return fallback
}


// =========================================================
// 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐈𝐃
// =========================================================

function getYouTubeId(
  url = ''
) {

  try {

    const u =
      new URL(url)

    if (
      u.hostname.includes(
        'youtube.com'
      )
    ) {

      const id =
        u.searchParams.get('v')

      if (id) {
        return id
      }

      const match =
        u.pathname.match(
          /\/(?:shorts|embed)\/([^/?]+)/
        )

      if (match?.[1]) {
        return match[1]
      }
    }

    if (
      u.hostname ===
      'youtu.be'
    ) {

      return u.pathname
        .replace('/', '')
        .split('/')[0]
    }

  } catch {}

  return null
}


// =========================================================
// 𝐌𝐈𝐍𝐈𝐀𝐓𝐔𝐑𝐀 𝐃𝐄 𝐘𝐎𝐔𝐓𝐔𝐁𝐄
// =========================================================

function getThumbnail(
  youtubeUrl = ''
) {

  const id =
    getYouTubeId(
      youtubeUrl
    )

  if (!id) {
    return null
  }

  return (
    `https://i.ytimg.com/vi/` +
    `${id}/hq720.jpg`
  )
}


// =========================================================
// 𝐎𝐁𝐓𝐄𝐍𝐄𝐑 𝐌𝐈𝐍𝐈𝐀𝐓𝐔𝐑𝐀
// =========================================================

async function getThumbnailBuffer(
  url
) {

  if (!url) {
    return null
  }

  try {

    const controller =
      new AbortController()

    const timer =
      setTimeout(
        () => controller.abort(),
        API_TIMEOUT
      )

    try {

      const response =
        await fetch(
          url,
          {
            method: 'GET',

            headers: {
              'User-Agent':
                USER_AGENT,

              'Accept':
                'image/jpeg,image/*,*/*'
            },

            signal:
              controller.signal
          }
        )

      if (!response.ok) {
        return null
      }

      const arrayBuffer =
        await response.arrayBuffer()

      const buffer =
        Buffer.from(
          arrayBuffer
        )

      if (!buffer.length) {
        return null
      }

      return buffer

    } finally {

      clearTimeout(timer)
    }

  } catch {

    return null
  }
}


// =========================================================
// 𝐍𝐎𝐌𝐁𝐑𝐄 𝐒𝐄𝐆𝐔𝐑𝐎
// =========================================================

function safeName(
  name
) {

  return String(
    name ||
    'youtube-video'
  )
    .replace(
      /[\\/:*?"<>|]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .slice(
      0,
      100
    )
    ||
    'youtube-video'
}


// =========================================================
// 𝐓𝐀𝐌𝐀Ñ𝐎
// =========================================================

function formatSize(
  bytes
) {

  if (
    !Number.isFinite(bytes)
  ) {

    return 'Desconocido'
  }

  const mb =
    bytes /
    1024 /
    1024

  if (
    mb < 1024
  ) {

    return (
      `${mb.toFixed(2)} MB`
    )
  }

  return (
    `${(
      mb / 1024
    ).toFixed(2)} GB`
  )
}


// =========================================================
// 𝐁𝐔𝐒𝐂𝐀𝐑 𝐕𝐈𝐃𝐄𝐎 𝐂𝐎𝐍 𝐅𝐀𝐀
// =========================================================

async function searchVideo(
  query
) {

  const apiUrl =
    `${FAA_API}?q=` +
    encodeURIComponent(
      query
    )

  const controller =
    new AbortController()

  const timer =
    setTimeout(
      () => controller.abort(),
      API_TIMEOUT
    )

  try {

    const response =
      await fetch(
        apiUrl,
        {
          method: 'GET',

          headers: {
            'User-Agent':
              USER_AGENT,

            'Accept':
              'application/json'
          },

          signal:
            controller.signal
        }
      )

    const body =
      await response.text()

    let data

    try {

      data =
        JSON.parse(body)

    } catch {

      throw new Error(
        'La API FAA no devolvió JSON válido'
      )
    }

    if (
      !response.ok
    ) {

      throw new Error(
        data?.message ||
        data?.error ||
        `FAA HTTP ${response.status}`
      )
    }

    if (
      !data?.status
    ) {

      throw new Error(
        data?.message ||
        data?.error ||
        'FAA no encontró el vídeo'
      )
    }

    if (
      !data?.result
    ) {

      throw new Error(
        'FAA no devolvió result'
      )
    }

    if (
      !data.result.download_url
    ) {

      throw new Error(
        'FAA no devolvió download_url'
      )
    }

    return data.result

  } finally {

    clearTimeout(
      timer
    )
  }
}


// =========================================================
// 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐑 𝐕𝐈𝐃𝐄𝐎
// =========================================================

async function downloadVideo(
  url,
  output
) {

  const controller =
    new AbortController()

  const timer =
    setTimeout(
      () => controller.abort(),
      DOWNLOAD_TIMEOUT
    )

  let file = null

  try {

    const response =
      await fetch(
        url,
        {
          method: 'GET',

          headers: {
            'User-Agent':
              USER_AGENT,

            'Accept':
              'video/mp4,video/*,*/*'
          },

          redirect:
            'follow',

          signal:
            controller.signal
        }
      )

    if (
      !response.ok
    ) {

      throw new Error(
        `Descarga HTTP ${response.status}`
      )
    }

    if (
      !response.body
    ) {

      throw new Error(
        'El servidor no devolvió el vídeo'
      )
    }

    await fs.promises.mkdir(
      path.dirname(output),
      {
        recursive: true
      }
    )

    file =
      fs.createWriteStream(
        output
      )

    await new Promise(
      (resolve, reject) => {

        let finished = false

        const finish =
          () => {

            if (finished) {
              return
            }

            finished = true
            resolve()
          }

        const fail =
          error => {

            if (finished) {
              return
            }

            finished = true
            reject(error)
          }

        response.body.on(
          'error',
          fail
        )

        file.on(
          'error',
          fail
        )

        file.on(
          'finish',
          finish
        )

        response.body.pipe(
          file
        )
      }
    )

    const stat =
      await fs.promises.stat(
        output
      )

    if (
      !stat.isFile()
    ) {

      throw new Error(
        'El archivo descargado no es válido'
      )
    }

    if (
      stat.size < 10000
    ) {

      await rm(
        output,
        {
          force: true
        }
      ).catch(() => {})

      throw new Error(
        'El vídeo descargado está vacío o es inválido'
      )
    }

    return stat

  } finally {

    clearTimeout(
      timer
    )

    if (
      file &&
      !file.closed
    ) {

      file.close()
    }
  }
}


// =========================================================
// 𝐇𝐀𝐍𝐃𝐋𝐄𝐑
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

  const query =
    String(
      text || ''
    ).trim()


  // =======================================================
  // 𝐒𝐈𝐍 𝐁Ú𝐒𝐐𝐔𝐄𝐃𝐀
  // =======================================================

  if (!query) {

    return m.reply(

`𝙔𝙤𝙪𝙏𝙪𝙗𝙚 𝙈𝙋𝟰

𝙀𝙨𝙘𝙧𝙞𝙗𝙚 𝙚𝙡 𝙣𝙤𝙢𝙗𝙧𝙚 𝙙𝙚𝙡 𝙫í𝙙𝙚𝙤.

𝙀𝙟𝙚𝙢𝙥𝙡𝙤:

${usedPrefix}${command} Shakira La La La

${config.botName || 'SaitamaBot'}`
    )
  }


  // =======================================================
  // 𝐑𝐄𝐀𝐂𝐂𝐈Ó𝐍
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


  const id =
    Date.now()

  const videoFile =
    path.join(
      TMP_DIR,
      `${id}.mp4`
    )


  try {

    await fs.promises.mkdir(
      TMP_DIR,
      {
        recursive: true
      }
    )


    // =====================================================
    // 𝐁𝐔𝐒𝐂𝐀𝐑 𝐂𝐎𝐍 𝐅𝐀𝐀
    // =====================================================

    const result =
      await searchVideo(
        query
      )


    // =====================================================
    // 𝐃𝐀𝐓𝐎𝐒 𝐐𝐔𝐄 𝐃𝐄𝐕𝐔𝐄𝐋𝐕𝐄 𝐋𝐀 𝐀𝐏𝐈
    // =====================================================

    const title =
      textValue(
        result.searched_title,
        'YouTube Video'
      )

    const youtube =
      textValue(
        result.searched_url,
        'No disponible'
      )

    const format =
      textValue(
        result.format,
        'mp4'
      )


    // =====================================================
    // 𝐌𝐈𝐍𝐈𝐀𝐓𝐔𝐑𝐀
    // =====================================================

    const thumbnail =
      getThumbnail(
        youtube
      )

    const thumbnailBuffer =
      await getThumbnailBuffer(
        thumbnail
      )


    // =====================================================
    // 𝐂𝐀𝐏𝐓𝐈𝐎𝐍 𝐂𝐎𝐑𝐓𝐎
    // =====================================================

    const caption =
`𝙔𝙤𝙪𝙏𝙪𝙗𝙚

𝙏í𝙩𝙪𝙡𝙤: ${title}
𝙀𝙣𝙡𝙖𝙘𝙚: ${youtube}
𝙁𝙤𝙧𝙢𝙖𝙩𝙤: ${format.toUpperCase()}

𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙣𝙙𝙤 𝙫í𝙙𝙚𝙤...

${config.botName || 'SaitamaBot'}`


    // =====================================================
    // 𝐄𝐍𝐕𝐈𝐀𝐑 𝐌𝐈𝐍𝐈𝐀𝐓𝐔𝐑𝐀 + 𝐈𝐍𝐅𝐎
    // =====================================================

    if (
      thumbnailBuffer
    ) {

      await conn.sendMessage(
        m.chat,
        {
          image:
            thumbnailBuffer,

          caption:
            caption
        },
        {
          quoted:
            m
        }
      )

    } else {

      await m.reply(
        caption
      )
    }


    // =====================================================
    // 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐑 𝐌𝐏𝟒
    // =====================================================

    const stat =
      await downloadVideo(
        result.download_url,
        videoFile
      )


    // =====================================================
    // 𝐂𝐀𝐏𝐓𝐈𝐎𝐍 𝐅𝐈𝐍𝐀𝐋
    // =====================================================

    const videoCaption =
`𝙔𝙤𝙪𝙏𝙪𝙗𝙚

𝙏í𝙩𝙪𝙡𝙤: ${title}
𝙀𝙣𝙡𝙖𝙘𝙚: ${youtube}

𝙏𝙖𝙢𝙖ñ𝙤: ${formatSize(stat.size)}
𝙁𝙤𝙧𝙢𝙖𝙩𝙤: MP4

${config.botName || 'SaitamaBot'}`


    // =====================================================
    // 𝐄𝐍𝐕𝐈𝐀𝐑 𝐕𝐈𝐃𝐄𝐎
    // =====================================================

    const videoMessage = {

      video: {
        url:
          videoFile
      },

      mimetype:
        'video/mp4',

      fileName:
        `${safeName(title)}.mp4`,

      caption:
        videoCaption
    }


    // =====================================================
    // 𝐌𝐈𝐍𝐈𝐀𝐓𝐔𝐑𝐀 𝐃𝐄𝐋 𝐕𝐈𝐃𝐄𝐎
    // =====================================================

    if (
      thumbnailBuffer
    ) {

      videoMessage.jpegThumbnail =
        thumbnailBuffer
    }


    await conn.sendMessage(
      m.chat,
      videoMessage,
      {
        quoted:
          m
      }
    )


    // =====================================================
    // 𝐋𝐈𝐌𝐏𝐈𝐀𝐑
    // =====================================================

    await rm(
      videoFile,
      {
        force: true
      }
    ).catch(() => {})


    // =====================================================
    // 𝐑𝐄𝐀𝐂𝐂𝐈Ó𝐍 𝐅𝐈𝐍𝐀𝐋
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
    // 𝐋𝐈𝐌𝐏𝐈𝐀𝐑
    // =====================================================

    await rm(
      videoFile,
      {
        force: true
      }
    ).catch(() => {})


    // =====================================================
    // 𝐑𝐄𝐀𝐂𝐂𝐈Ó𝐍
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
    // 𝐄𝐑𝐑𝐎𝐑
    // =====================================================

    return m.reply(

`𝙀𝙧𝙧𝙤𝙧 𝙈𝙋𝟰

𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙧 𝙚𝙡 𝙫í𝙙𝙚𝙤.

${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 500)}

${config.botName || 'SaitamaBot'}`
    )

  } finally {

    await rm(
      videoFile,
      {
        force: true
      }
    ).catch(() => {})
  }
}


// =========================================================
// 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈Ó𝐍
// =========================================================

handler.help = [
  'mp4 <nombre>',
  'video <nombre>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'mp4',
  'mp4dl',
  'video',
  'videodl'
]

export default handler