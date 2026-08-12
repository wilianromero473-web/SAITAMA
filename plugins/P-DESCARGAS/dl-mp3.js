import fetch from 'node-fetch'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { rm } from 'fs/promises'
import { writeAudioTags } from '../../lib/audioTags.js'

// =========================================================
// 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 • 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐌𝐏𝟑
// =========================================================

const FAA_API =
  'https://api-faa.my.id/faa/ytplay'

const TMP_DIR =
  path.join(
    os.tmpdir(),
    'saitamabot-mp3'
  )

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'

const API_TIMEOUT =
  60 * 1000

const DOWNLOAD_TIMEOUT =
  10 * 60 * 1000


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
// 𝐍𝐎𝐌𝐁𝐑𝐄 𝐃𝐄 𝐀𝐑𝐂𝐇𝐈𝐕𝐎
// =========================================================

function safeFileName(
  title = 'audio-youtube'
) {

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

    .slice(0, 100)

    ||
    'audio-youtube'
}


// =========================================================
// 𝐕𝐈𝐒𝐓𝐀𝐒
// =========================================================

function formatViews(
  views
) {

  if (
    views === undefined ||
    views === null ||
    views === ''
  ) {

    return 'Desconocidas'
  }

  const number =
    Number(
      String(views)
        .replace(
          /[^\d]/g,
          ''
        )
    )

  if (
    !Number.isFinite(number)
  ) {

    return String(views)
  }

  return number.toLocaleString(
    'es-ES'
  )
}


// =========================================================
// 𝐃𝐔𝐑𝐀𝐂𝐈Ó𝐍
// =========================================================

function formatDuration(
  duration,
  timestamp
) {

  if (
    timestamp
  ) {

    return String(
      timestamp
    )
  }

  if (
    duration === undefined ||
    duration === null
  ) {

    return 'Desconocida'
  }

  const seconds =
    Number(duration)

  if (
    !Number.isFinite(seconds)
  ) {

    return String(duration)
  }

  const hours =
    Math.floor(
      seconds / 3600
    )

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    )

  const secs =
    Math.floor(
      seconds % 60
    )

  if (
    hours > 0
  ) {

    return (
      `${hours}:` +
      `${String(minutes).padStart(2, '0')}:` +
      `${String(secs).padStart(2, '0')}`
    )
  }

  return (
    `${minutes}:` +
    `${String(secs).padStart(2, '0')}`
  )
}


// =========================================================
// 𝐅𝐀𝐀 • 𝐁𝐔𝐒𝐂𝐀𝐑 𝐘𝐎𝐔𝐓𝐔𝐁𝐄
// =========================================================

async function searchYouTube(
  query
) {

  const apiUrl =
    `${FAA_API}?query=` +
    encodeURIComponent(query)

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

        timeout:
          API_TIMEOUT
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
      'No se encontraron resultados'
    )
  }

  if (
    !data?.result
  ) {

    throw new Error(
      'La API no devolvió información'
    )
  }

  if (
    !data.result.mp3
  ) {

    throw new Error(
      'La API no devolvió el MP3'
    )
  }

  return data.result
}


// =========================================================
// 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐑 𝐌𝐏𝟑
// =========================================================

async function downloadMp3(
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
              'audio/mpeg,audio/*,*/*'
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
        `Descarga MP3 HTTP ${response.status}`
      )
    }

    if (
      !response.body
    ) {

      throw new Error(
        'El servidor no devolvió el audio'
      )
    }

    await fs.promises.mkdir(
      path.dirname(output),
      {
        recursive: true
      }
    )

    const file =
      fs.createWriteStream(
        output
      )

    await new Promise(
      (resolve, reject) => {

        response.body.pipe(file)

        response.body.once(
          'error',
          reject
        )

        file.once(
          'error',
          reject
        )

        file.once(
          'finish',
          resolve
        )
      }
    )

    const stat =
      await fs.promises.stat(
        output
      )

    if (
      !stat.isFile() ||
      stat.size < 1000
    ) {

      await rm(
        output,
        {
          force: true
        }
      ).catch(() => {})

      throw new Error(
        'El MP3 descargado no es válido'
      )
    }

    return stat

  } finally {

    clearTimeout(timer)
  }
}


// =========================================================
// 𝐌𝐈𝐍𝐈𝐀𝐓𝐔𝐑𝐀
// =========================================================

async function getThumbnail(
  url
) {

  if (!url) {
    return null
  }

  try {

    const response =
      await fetch(
        url,
        {
          headers: {
            'User-Agent':
              USER_AGENT
          },

          timeout:
            API_TIMEOUT
        }
      )

    if (
      !response.ok
    ) {

      return null
    }

    const buffer =
      Buffer.from(
        await response.arrayBuffer()
      )

    if (
      !buffer.length
    ) {

      return null
    }

    return buffer

  } catch {

    return null
  }
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
    bytes / 1024 / 1024

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

`𝙔𝙤𝙪𝙏𝙪𝙗𝙚 𝙈𝙋𝟯

𝙀𝙨𝙘𝙧𝙞𝙗𝙚 𝙚𝙡 𝙣𝙤𝙢𝙗𝙧𝙚 𝙙𝙚 𝙡𝙖 𝙘𝙖𝙣𝙘𝙞ó𝙣.

𝙀𝙟𝙚𝙢𝙥𝙡𝙤:
${usedPrefix}${command} Ozuna Mi Niña

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

  const audioFile =
    path.join(
      TMP_DIR,
      `${id}.mp3`
    )


  try {

    // =====================================================
    // 𝐁𝐔𝐒𝐂𝐀𝐑
    // =====================================================

    const result =
      await searchYouTube(
        query
      )


    // =====================================================
    // 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍
    // =====================================================

    const title =
      textValue(
        result.title,
        'Audio de YouTube'
      )

    const author =
      textValue(
        result.author,
        'Desconocido'
      )

    const views =
      formatViews(
        result.views
      )

    const duration =
      formatDuration(
        result.duration,
        result.duration_timestamp
      )

    const published =
      textValue(
        result.published,
        'Desconocido'
      )

    const youtube =
      textValue(
        result.url,
        'No disponible'
      )

    const thumbnail =
      textValue(
        result.thumbnail,
        ''
      )


    // =====================================================
    // 𝐌𝐈𝐍𝐈𝐀𝐓𝐔𝐑𝐀
    // =====================================================

    const thumbnailBuffer =
      await getThumbnail(
        thumbnail
      )


    // =====================================================
    // 𝐂𝐀𝐏𝐓𝐈𝐎𝐍
    // =====================================================

    const caption =
`𝙔𝙤𝙪𝙏𝙪𝙗𝙚

𝙏í𝙩𝙪𝙡𝙤: ${title}
𝘼𝙪𝙩𝙤𝙧: ${author}
𝙑𝙞𝙨𝙩𝙖𝙨: ${views}
𝘿𝙪𝙧𝙖𝙘𝙞ó𝙣: ${duration}
𝙋𝙪𝙗𝙡𝙞𝙘𝙖𝙙𝙤: ${published}
𝙀𝙣𝙡𝙖𝙘𝙚: ${youtube}

𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙣𝙙𝙤 𝙖𝙪𝙙𝙞𝙤...

${config.botName || 'SaitamaBot'}`


    // =====================================================
    // 𝐄𝐍𝐕𝐈𝐀𝐑 𝐈𝐌𝐀𝐆𝐄𝐍
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
    // 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐑
    // =====================================================

    const stat =
      await downloadMp3(
        result.mp3,
        audioFile
      )


    // =====================================================
    // 𝐓𝐀𝐆𝐒
    // =====================================================

    try {

      await writeAudioTags(
        audioFile,
        {
          title:
            title,

          author:
            author,

          image:
            thumbnail
        }
      )

    } catch {}


    // =====================================================
    // 𝐋𝐄𝐄𝐑 𝐀𝐔𝐃𝐈𝐎
    // =====================================================

    const audio =
      await fs.promises.readFile(
        audioFile
      )


    if (
      !audio.length
    ) {

      throw new Error(
        'El MP3 está vacío'
      )
    }


    // =====================================================
    // 𝐄𝐍𝐕𝐈𝐀𝐑 𝐌𝐏𝟑
    // =====================================================

    await conn.sendMessage(
      m.chat,
      {
        audio,

        mimetype:
          'audio/mpeg',

        fileName:
          `${safeFileName(title)}.mp3`,

        ptt:
          false
      },
      {
        quoted:
          m
      }
    )


    // =====================================================
    // 𝐋𝐈𝐌𝐏𝐈𝐀𝐑
    // =====================================================

    await rm(
      audioFile,
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
      audioFile,
      {
        force: true
      }
    ).catch(() => {})


    // =====================================================
    // 𝐑𝐄𝐀𝐂𝐂𝐈Ó𝐍 ERROR
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

`𝙀𝙧𝙧𝙤𝙧 𝙈𝙋𝟯

𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙧 𝙚𝙡 𝙖𝙪𝙙𝙞𝙤.

${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 500)}

${config.botName || 'SaitamaBot'}`
    )
  }
}


// =========================================================
// 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈Ó𝐍
// =========================================================

handler.help = [
  'mp3 <canción>',
  'audio <canción>'
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