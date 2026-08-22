import fetch from 'node-fetch'
import axios from 'axios'
import config from '../../config.js'


// ═════════════════════════════════════
// ✰ SAITAMABOT • DEEZER
// ═════════════════════════════════════

const LUXINFINITY =
  'https://luxinfinity.vercel.app/api'

const DEEZER_API =
  'https://api.deezer.com'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'


// ═════════════════════════════════════
// ✰ DURACIÓN
// ═════════════════════════════════════

function formatDuration(seconds) {

  if (
    typeof seconds === 'string' &&
    seconds.includes(':')
  ) {
    return seconds
  }

  const secs =
    Number(seconds) || 0

  const minutes =
    Math.floor(secs / 60)

  const secondsRest =
    String(secs % 60).padStart(2, '0')

  return `${minutes}:${secondsRest}`
}


// ═════════════════════════════════════
// ✰ API DEEZER
// ═════════════════════════════════════

async function dzApi(endpoint) {

  const response =
    await axios.get(
      `${DEEZER_API}/${endpoint}`,
      {
        timeout: 30000,

        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json'
        }
      }
    )

  return response.data
}


// ═════════════════════════════════════
// ✰ LIMPIAR ARCHIVO
// ═════════════════════════════════════

function cleanFileName(value) {

  return String(
    value || 'audio'
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
    || 'audio'
}


// ═════════════════════════════════════
// ✰ DESCARGAR DEEZER
// ═════════════════════════════════════

async function executeDeezerDownload(
  conn,
  m,
  chatId,
  url
) {

  await conn.sendMessage(
    chatId,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  ).catch(() => {})


  try {

    const response =
      await fetch(
        `${LUXINFINITY}/deezer?url=${encodeURIComponent(url)}`
      )


    if (!response.ok) {
      throw new Error(
        `API HTTP ${response.status}`
      )
    }


    const json =
      await response.json()


    if (
      !json?.status ||
      !json?.data
    ) {
      throw new Error(
        'La API no devolvió información.'
      )
    }


    const data =
      json.data


    if (!data.mp3) {
      throw new Error(
        'La API no devolvió el MP3.'
      )
    }


    const title =
      data.name ||
      data.title ||
      'Canción'

    const artist =
      data.artist ||
      'Desconocido'

    const album =
      data.album ||
      'Desconocido'

    const duration =
      data.duration ||
      'N/A'

    const cover =
      data.cover ||
      data.image ||
      null


    // ═══════════════════════════════
    // ✰ INFORMACIÓN
    // ═══════════════════════════════

    const captionText =
`༺ ✰ 𝙳𝙴𝙴𝚉𝙴𝚁 ✰ ༻

> ✰ 𝙽𝚘𝚖𝚋𝚛𝚎: ${title}
> ✰ 𝙰𝚛𝚝𝚒𝚜𝚝𝚊: ${artist}
> ✰ Á𝚕𝚋𝚞𝚖: ${album}
> ✰ 𝙰ñ𝚘: ${data.year || 'N/A'}
> ✰ 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗: ${duration}

> ✰ 𝙿𝚛𝚎𝚙𝚊𝚛𝚊𝚗𝚍𝚘...`


    if (cover) {

      await conn.sendMessage(
        chatId,
        {
          image: {
            url: cover
          },

          caption: captionText
        },
        {
          quoted: m
        }
      )
    }


    // ═══════════════════════════════
    // ✰ DESCARGAR MP3
    // ═══════════════════════════════

    const audioResponse =
      await fetch(data.mp3)


    if (!audioResponse.ok) {
      throw new Error(
        'No se pudo obtener el MP3.'
      )
    }


    const audioBuffer =
      Buffer.from(
        await audioResponse.arrayBuffer()
      )


    if (
      !audioBuffer.length ||
      audioBuffer.length < 1000
    ) {
      throw new Error(
        'El MP3 está vacío o es inválido.'
      )
    }


    const fileName =
      `${cleanFileName(title)} - ${cleanFileName(artist)}.mp3`


    // ═══════════════════════════════
    // ✰ ENVIAR MP3
    // ═══════════════════════════════

    await conn.sendMessage(
      chatId,
      {
        document: audioBuffer,

        mimetype:
          'audio/mpeg',

        fileName,

        caption:
`༺ ✰ 𝙰𝚄𝙳𝙸𝙾 𝙻𝙸𝚂𝚃𝙾 ✰ ༻

> ✰ ${title}
> ✰ ${artist}
> ✰ 𝙵𝚘𝚛𝚖𝚊𝚝𝚘: MP3

✰ ${config.botName || 'SaitamaBot'}`
      },
      {
        quoted: m
      }
    )


    await conn.sendMessage(
      chatId,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    ).catch(() => {})


  } catch (error) {

    console.error(
      '[DEEZER DOWNLOAD]',
      error?.message || error
    )


    await conn.sendMessage(
      chatId,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛.

> ✰ ${error?.message || 'Error desconocido'}`
    )
  }
}


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    command,
    text,
    usedPrefix
  }
) => {

  let query =
    text
      ? text.trim()
      : ''


  // ═══════════════════════════════
  // ✰ LINK CITADO
  // ═══════════════════════════════

  if (
    !query &&
    m.quoted
  ) {

    const quotedText =
      m.quoted.body ||
      m.quoted.text ||
      ''


    const match =
      quotedText.match(
        /https?:\/\/[^\s]+/i
      )


    if (match) {
      query = match[0]
    } else {
      query =
        quotedText.trim()
    }
  }


  const chatId =
    m.chat


  // ═══════════════════════════════
  // ✰ DESCARGA DIRECTA
  // ═══════════════════════════════

  if (
    command === 'dzdl'
  ) {

    if (!query) {
      return m.reply(
`༺ ✰ 𝚄𝚂𝙾 ✰ ༻

> ✰ ${usedPrefix}dzdl <link>`
      )
    }


    const url =
      query.startsWith('http')
        ? query
        : `https://www.deezer.com/track/${query}`


    await m.reply(
      `༺ ✰ 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝙽𝙳𝙾 ✰ ༻`
    )


    return executeDeezerDownload(
      conn,
      m,
      chatId,
      url
    )
  }


  // ═══════════════════════════════
  // ✰ AYUDA
  // ═══════════════════════════════

  if (!query) {

    return m.reply(
`༺ ✰ 𝙳𝙴𝙴𝚉𝙴𝚁 ✰ ༻

> ✰ ${usedPrefix}deezer <canción/link>
> ✰ ${usedPrefix}dzalbum <álbum>
> ✰ ${usedPrefix}dzartist <artista>
> ✰ ${usedPrefix}dztracks <id>
> ✰ ${usedPrefix}dztop <id>`
    )
  }


  // ═══════════════════════════════
  // ✰ ÁLBUMES
  // ═══════════════════════════════

  if (
    [
      'dzalbum',
      'deezeralbum'
    ].includes(command)
  ) {

    await m.reply(
      `༺ ✰ 𝙱𝚄𝚂𝙲𝙰𝙽𝙳𝙾 Á𝙻𝙱𝚄𝙼𝙴𝚂 ✰ ༻`
    )


    try {

      const result =
        await dzApi(
          `search/album?q=${encodeURIComponent(query)}&limit=6`
        )


      if (
        !result?.data?.length
      ) {
        return m.reply(
          `༺ ✰ 𝚂𝙸𝙽 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 ✰ ༻`
        )
      }


      const lines =
        result.data
          .map(
            (album, index) =>
`*${index + 1}.* ${album.title}
> ✰ 𝙰𝚛𝚝𝚒𝚜𝚝𝚊: ${album.artist?.name || 'N/A'}
> ✰ 𝚃𝚛𝚊𝚌𝚔𝚜: ${album.nb_tracks || 0}
> ✰ 𝙸𝙳: ${album.id}`
          )
          .join('\n\n')


      const cover =
        result.data[0].cover_xl ||
        result.data[0].cover_medium


      await conn.sendMessage(
        chatId,
        {
          ...(cover
            ? {
                image: {
                  url: cover
                }
              }
            : {}),

          caption:
`༺ ✰ Á𝙻𝙱𝚄𝙼𝙴𝚂 ✰ ༻

> ✰ 𝙱ú𝚜𝚚𝚞𝚎𝚍𝚊: ${query}

${lines}

✰ ${config.botName || 'SaitamaBot'}`
        },
        {
          quoted: m
        }
      )


    } catch (error) {

      console.error(
        '[DEEZER ALBUM]',
        error?.message || error
      )

      return m.reply(
        `༺ ✰ 𝙴𝚁𝚁𝙾𝚁 𝙰𝙻 𝙱𝚄𝚂𝙲𝙰𝚁 ✰ ༻`
      )
    }
  }


  // ═══════════════════════════════
  // ✰ ARTISTAS
  // ═══════════════════════════════

  else if (
    [
      'dzartist',
      'deezerartist'
    ].includes(command)
  ) {

    await m.reply(
      `༺ ✰ 𝙱𝚄𝚂𝙲𝙰𝙽𝙳𝙾 𝙰𝚁𝚃𝙸𝚂𝚃𝙰𝚂 ✰ ༻`
    )


    try {

      const result =
        await dzApi(
          `search/artist?q=${encodeURIComponent(query)}&limit=6`
        )


      if (
        !result?.data?.length
      ) {
        return m.reply(
          `༺ ✰ 𝚂𝙸𝙽 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 ✰ ༻`
        )
      }


      const lines =
        result.data
          .map(
            (artist, index) =>
`*${index + 1}.* ${artist.name}
> ✰ 𝙵𝚊𝚗𝚜: ${(artist.nb_fan || 0).toLocaleString()}
> ✰ 𝙸𝙳: ${artist.id}`
          )
          .join('\n\n')


      const picture =
        result.data[0].picture_xl ||
        result.data[0].picture_medium


      await conn.sendMessage(
        chatId,
        {
          ...(picture
            ? {
                image: {
                  url: picture
                }
              }
            : {}),

          caption:
`༺ ✰ 𝙰𝚁𝚃𝙸𝚂𝚃𝙰𝚂 ✰ ༻

> ✰ 𝙱ú𝚜𝚚𝚞𝚎𝚍𝚊: ${query}

${lines}

✰ ${config.botName || 'SaitamaBot'}`
        },
        {
          quoted: m
        }
      )


    } catch (error) {

      console.error(
        '[DEEZER ARTIST]',
        error?.message || error
      )

      return m.reply(
        `༺ ✰ 𝙴𝚁𝚁𝙾𝚁 𝙰𝙻 𝙱𝚄𝚂𝙲𝙰𝚁 ✰ ༻`
      )
    }
  }


  // ═══════════════════════════════
  // ✰ TRACKS
  // ═══════════════════════════════

  else if (
    [
      'dztracks',
      'deezertracks'
    ].includes(command)
  ) {

    if (!/^\d+$/.test(query)) {

      return m.reply(
        `༺ ✰ 𝙵𝙰𝙻𝚃𝙰 𝙴𝙻 𝙸𝙳 ✰ ༻`
      )
    }


    await m.reply(
      `༺ ✰ 𝙾𝙱𝚃𝙴𝙽𝙸𝙴𝙽𝙳𝙾 𝚃𝚁𝙰𝙲𝙺𝚂 ✰ ༻`
    )


    try {

      const album =
        await dzApi(
          `album/${query}`
        )


      if (
        !album?.tracks?.data?.length
      ) {
        return m.reply(
          `༺ ✰ 𝚂𝙸𝙽 𝚃𝚁𝙰𝙲𝙺𝚂 ✰ ༻`
        )
      }


      const lines =
        album.tracks.data
          .map(
            (track, index) =>
`*${index + 1}.* ${track.title} — ${formatDuration(track.duration)}`
          )
          .join('\n')


      const cover =
        album.cover_xl ||
        album.cover_medium


      await conn.sendMessage(
        chatId,
        {
          ...(cover
            ? {
                image: {
                  url: cover
                }
              }
            : {}),

          caption:
`༺ ✰ ${album.title} ✰ ༻

> ✰ ${album.artist?.name || 'Desconocido'}

${lines}

✰ ${config.botName || 'SaitamaBot'}`
        },
        {
          quoted: m
        }
      )


    } catch (error) {

      console.error(
        '[DEEZER TRACKS]',
        error?.message || error
      )

      return m.reply(
        `༺ ✰ 𝙴𝚁𝚁𝙾𝚁 𝙰𝙻 𝙾𝙱𝚃𝙴𝙽𝙴𝚁 ✰ ༻`
      )
    }
  }


  // ═══════════════════════════════
  // ✰ TOP ARTISTA
  // ═══════════════════════════════

  else if (
    [
      'dztop',
      'deezertop'
    ].includes(command)
  ) {

    if (!/^\d+$/.test(query)) {

      return m.reply(
        `༺ ✰ 𝙵𝙰𝙻𝚃𝙰 𝙴𝙻 𝙸𝙳 ✰ ༻`
      )
    }


    await m.reply(
      `༺ ✰ 𝙾𝙱𝚃𝙴𝙽𝙸𝙴𝙽𝙳𝙾 𝚃𝙾𝙿 ✰ ༻`
    )


    try {

      const artist =
        await dzApi(
          `artist/${query}`
        )


      const top =
        await dzApi(
          `artist/${query}/top?limit=10`
        )


      if (!top?.data?.length) {

        return m.reply(
          `༺ ✰ 𝚂𝙸𝙽 𝙲𝙰𝙽𝙲𝙸𝙾𝙽𝙴𝚂 ✰ ༻`
        )
      }


      const lines =
        top.data
          .map(
            (track, index) =>
`*${index + 1}.* ${track.title} — ${formatDuration(track.duration)}`
          )
          .join('\n')


      const picture =
        artist.picture_xl ||
        artist.picture_medium


      await conn.sendMessage(
        chatId,
        {
          ...(picture
            ? {
                image: {
                  url: picture
                }
              }
            : {}),

          caption:
`༺ ✰ 𝚃𝙾𝙿 — ${artist.name} ✰ ༻

${lines}

✰ ${config.botName || 'SaitamaBot'}`
        },
        {
          quoted: m
        }
      )


    } catch (error) {

      console.error(
        '[DEEZER TOP]',
        error?.message || error
      )

      return m.reply(
        `༺ ✰ 𝙴𝚁𝚁𝙾𝚁 𝙰𝙻 𝙾𝙱𝚃𝙴𝙽𝙴𝚁 ✰ ༻`
      )
    }
  }


  // ═══════════════════════════════
  // ✰ SEARCH / DESCARGA
  // ═══════════════════════════════

  else if (
    [
      'deezer',
      'dz',
      'dzsearch',
      'deezersearch',
      'dldeezer',
      'deezerdl'
    ].includes(command)
  ) {

    const isUrl =
      /deezer\.com|deezer\.page\.link/i.test(query)


    // ═══════════════════════════════
    // ✰ LINK DIRECTO
    // ═══════════════════════════════

    if (isUrl) {

      await m.reply(
        `༺ ✰ 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝙽𝙳𝙾 ✰ ༻`
      )


      return executeDeezerDownload(
        conn,
        m,
        chatId,
        query
      )
    }


    // ═══════════════════════════════
    // ✰ BUSCAR CANCIÓN
    // ═══════════════════════════════

    await m.reply(
      `༺ ✰ 𝙱𝚄𝚂𝙲𝙰𝙽𝙳𝙾 𝙲𝙰𝙽𝙲𝙸𝙾𝙽𝙴𝚂 ✰ ༻`
    )


    try {

      const response =
        await fetch(
          `${LUXINFINITY}/search/deezer?query=${encodeURIComponent(query)}&limit=10&type=track`
        )


      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        )
      }


      const json =
        await response.json()


      const results =
        json?.data || []


      if (!results.length) {

        return m.reply(
          `༺ ✰ 𝚂𝙸𝙽 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 ✰ ༻`
        )
      }


      // ═══════════════════════════════
      // ✰ RESULTADOS
      // ═══════════════════════════════

      const rows =
        results.map(
          track => {

            let title =
              track.title ||
              track.name ||
              'Canción'


            if (title.length > 24) {
              title =
                title.substring(0, 24) +
                '...'
            }


            const artist =
              track.artist?.name ||
              track.artist ||
              'Desconocido'


            const album =
              track.album?.title ||
              track.album ||
              'Desconocido'


            let description =
              `${artist} - ${album}`


            if (description.length > 72) {
              description =
                description.substring(0, 72) +
                '...'
            }


            return {
              header: '',

              title,

              description,

              id:
                `${usedPrefix}dzdl ${track.link || track.url}`
            }
          }
        )


      const infoText =
`༺ ✰ 𝙳𝙴𝙴𝚉𝙴𝚁 ✰ ༻

> ✰ 𝙱ú𝚜𝚚𝚞𝚎𝚍𝚊: ${query}
> ✰ 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘𝚜: ${results.length}

> ✰ 𝚂𝚎𝚕𝚎𝚌𝚌𝚒𝚘𝚗𝚊 𝚞𝚗𝚊 𝚌𝚊𝚗𝚌𝚒ó𝚗`


      const buttons = [
        {
          name: 'single_select',

          buttonParamsJson:
            JSON.stringify({
              title:
                '✰ 𝚅𝙴𝚁 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂',

              sections: [
                {
                  title:
                    '✰ 𝚂𝚎𝚕𝚎𝚌𝚌𝚒𝚘𝚗𝚊 𝚞𝚗 𝚃𝚛𝚊𝚌𝚔 ✰',

                  rows
                }
              ]
            })
        }
      ]


      const cover =
        results[0]?.album?.cover_big ||
        results[0]?.album?.cover ||
        results[0]?.image ||
        null


      await conn.sendMessage(
        chatId,
        {
          ...(cover
            ? {
                image: {
                  url: cover
                }
              }
            : {}),

          caption: infoText,

          footer:
            config.botName ||
            'SaitamaBot',

          buttons
        },
        {
          quoted: m
        }
      )


    } catch (error) {

      console.error(
        '[DEEZER SEARCH]',
        error?.message || error
      )


      return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚛𝚎𝚊𝚕𝚒𝚣𝚊𝚛 𝚕𝚊 𝚋ú𝚜𝚚𝚞𝚎𝚍𝚊.

> ✰ ${error?.message || 'Error desconocido'}`
      )
    }
  }
}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'deezer <búsqueda/link>',
  'dz <búsqueda/link>',
  'dzalbum <álbum>',
  'dzartist <artista>',
  'dztracks <id>',
  'dztop <id>',
  'dzdl <link>'
]

handler.command = [
  'deezer',
  'dz',
  'dzsearch',
  'deezersearch',
  'dldeezer',
  'deezerdl',
  'dzalbum',
  'deezeralbum',
  'dzartist',
  'deezerartist',
  'dztracks',
  'deezertracks',
  'dztop',
  'deezertop',
  'dzdl'
]

handler.tags = [
  'descargas'
]

export default handler