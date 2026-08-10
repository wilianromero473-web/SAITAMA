import fetch from 'node-fetch'
import axios from 'axios'
import config from '../../config.js'


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN
|--------------------------------------------------------------------------
*/

const LUXINFINITY =
  'https://luxinfinity.vercel.app/api'

const DEEZER_API =
  'https://api.deezer.com'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'


/*
|--------------------------------------------------------------------------
| FORMATEAR DURACIÓN
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| API DEEZER
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| DESCARGAR DEEZER
|--------------------------------------------------------------------------
*/

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

    /*
    |--------------------------------------------------------------------------
    | OBTENER INFORMACIÓN Y MP3
    |--------------------------------------------------------------------------
    */

    const response =
      await fetch(
        `${LUXINFINITY}/deezer?url=${encodeURIComponent(url)}`
      )


    if (!response.ok) {
      throw new Error(
        `API respondió HTTP ${response.status}`
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
      'Desconocida'


    const cover =
      data.cover ||
      data.image ||
      null


    /*
    |--------------------------------------------------------------------------
    | INFORMACIÓN DE LA CANCIÓN
    |--------------------------------------------------------------------------
    */

    const captionText =
`*⌬┤ 🎵 ├⌬ ${title}*

> 👤 *Artista:* ${artist}
> 💿 *Álbum:* ${album}
> 📅 *Año:* ${data.year || '—'}
> ⏱️ *Duración:* ${duration}
> 🔗 ${url}

> ⏳ Preparando archivo...`


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


    /*
    |--------------------------------------------------------------------------
    | DESCARGAR MP3
    |--------------------------------------------------------------------------
    */

    const audioResponse =
      await fetch(data.mp3)


    if (!audioResponse.ok) {
      throw new Error(
        'No se pudo obtener el archivo MP3.'
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
        'El archivo MP3 está vacío o es inválido.'
      )
    }


    /*
    |--------------------------------------------------------------------------
    | NOMBRE DEL ARCHIVO
    |--------------------------------------------------------------------------
    */

    const fileName =
      `${cleanFileName(title)} - ${cleanFileName(artist)}.mp3`


    /*
    |--------------------------------------------------------------------------
    | ENVIAR COMO DOCUMENTO
    |--------------------------------------------------------------------------
    */

    await conn.sendMessage(
      chatId,
      {
        document: audioBuffer,

        mimetype:
          'audio/mpeg',

        fileName,

        caption:
`*⌬┤ ✅ ├⌬ AUDIO LISTO.*

> 🎵 *${title}*
> 👤 *${artist}*
> 💿 *${album}*

> 📁 Formato: MP3
> 📄 Tipo: Documento

> 🌸 ${config.botName || 'SaitamaBot'}`
      },
      {
        quoted: m
      }
    )


    /*
    |--------------------------------------------------------------------------
    | REACCIÓN FINAL
    |--------------------------------------------------------------------------
    */

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
`*⌬┤ ❌ ├⌬ ERROR.*

> No se pudo completar la descarga.

⚠️ ${error?.message || 'Error desconocido'}`
    )
  }
}


/*
|--------------------------------------------------------------------------
| LIMPIAR NOMBRE
|--------------------------------------------------------------------------
*/

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
    .slice(0, 100) || 'audio'
}


/*
|--------------------------------------------------------------------------
| HANDLER PRINCIPAL
|--------------------------------------------------------------------------
*/

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


  /*
  |--------------------------------------------------------------------------
  | OBTENER LINK DEL MENSAJE CITADO
  |--------------------------------------------------------------------------
  */

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


  /*
  |--------------------------------------------------------------------------
  | DESCARGA DIRECTA
  |--------------------------------------------------------------------------
  */

  if (
    command === 'dzdl'
  ) {

    if (!query) {
      return m.reply(
`*⌬┤ ✙ ├⌬ USO.*

> ${usedPrefix}dzdl <link de Deezer>`
      )
    }


    const url =
      query.startsWith('http')
        ? query
        : `https://www.deezer.com/track/${query}`


    await m.reply(
      '*⌬┤ ⏳ ├⌬ DESCARGANDO...*'
    )


    return executeDeezerDownload(
      conn,
      m,
      chatId,
      url
    )
  }


  /*
  |--------------------------------------------------------------------------
  | AYUDA
  |--------------------------------------------------------------------------
  */

  if (!query) {

    return m.reply(
`*⌬┤ ✙ ├⌬ USO.*

> *${usedPrefix}deezer <canción o link>*

> *${usedPrefix}dzalbum <álbum>*

> *${usedPrefix}dzartist <artista>*

> *${usedPrefix}dztracks <id>*

> *${usedPrefix}dztop <id>*`
    )
  }


  /*
  |--------------------------------------------------------------------------
  | BUSCAR ÁLBUM
  |--------------------------------------------------------------------------
  */

  if (
    [
      'dzalbum',
      'deezeralbum'
    ].includes(command)
  ) {

    await m.reply(
      '*⌬┤ 🔎 ├⌬ Buscando álbumes...*'
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
          '*⌬┤ ❌ ├⌬ SIN RESULTADOS.*'
        )
      }


      const lines =
        result.data
          .map(
            (album, index) =>
`*${index + 1}.* ${album.title} — _${album.artist?.name || 'Desconocido'}_
> 🎵 ${album.nb_tracks || 0} tracks
> 🆔 \`${album.id}\`
> 🔗 ${album.link || ''}`
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
`*⌬┤ 💿 ├⌬ ÁLBUMES*

> 🔎 Búsqueda: *${query}*

${lines}

> 🌸 ${config.botName || 'SaitamaBot'}`
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
        '*⌬┤ ❌ ├⌬ ERROR AL BUSCAR ÁLBUMES.*'
      )
    }
  }


  /*
  |--------------------------------------------------------------------------
  | BUSCAR ARTISTA
  |--------------------------------------------------------------------------
  */

  else if (
    [
      'dzartist',
      'deezerartist'
    ].includes(command)
  ) {

    await m.reply(
      '*⌬┤ 🔎 ├⌬ Buscando artistas...*'
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
          '*⌬┤ ❌ ├⌬ SIN RESULTADOS.*'
        )
      }


      const lines =
        result.data
          .map(
            (artist, index) =>
`*${index + 1}.* ${artist.name}
> 👥 ${(artist.nb_fan || 0).toLocaleString()} fans
> 🆔 \`${artist.id}\`
> 🔗 ${artist.link || ''}`
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
`*⌬┤ 👤 ├⌬ ARTISTAS*

> 🔎 Búsqueda: *${query}*

${lines}

> 🌸 ${config.botName || 'SaitamaBot'}`
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
        '*⌬┤ ❌ ├⌬ ERROR AL BUSCAR ARTISTAS.*'
      )
    }
  }


  /*
  |--------------------------------------------------------------------------
  | TRACKS DE ÁLBUM
  |--------------------------------------------------------------------------
  */

  else if (
    [
      'dztracks',
      'deezertracks'
    ].includes(command)
  ) {

    if (
      !/^\d+$/.test(query)
    ) {

      return m.reply(
        '*⌬┤ ✙ ├⌬ FALTA EL ID DEL ÁLBUM.*'
      )
    }


    await m.reply(
      '*⌬┤ 🔎 ├⌬ Obteniendo tracks...*'
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
          '*⌬┤ ❌ ├⌬ NO SE ENCONTRARON TRACKS.*'
        )
      }


      const lines =
        album.tracks.data
          .map(
            (track, index) =>
`*${index + 1}.* ${track.title} — _${formatDuration(track.duration)}_`
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
`*⌬┤ 💿 ├⌬ ${album.title}*

> 👤 _${album.artist?.name || 'Desconocido'}_

${lines}

> 🌸 ${config.botName || 'SaitamaBot'}`
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
        '*⌬┤ ❌ ├⌬ ERROR AL OBTENER LOS TRACKS.*'
      )
    }
  }


  /*
  |--------------------------------------------------------------------------
  | TOP DEL ARTISTA
  |--------------------------------------------------------------------------
  */

  else if (
    [
      'dztop',
      'deezertop'
    ].includes(command)
  ) {

    if (
      !/^\d+$/.test(query)
    ) {

      return m.reply(
        '*⌬┤ ✙ ├⌬ FALTA EL ID DEL ARTISTA.*'
      )
    }


    await m.reply(
      '*⌬┤ 🔎 ├⌬ Obteniendo top...*'
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


      if (
        !top?.data?.length
      ) {

        return m.reply(
          '*⌬┤ ❌ ├⌬ NO SE ENCONTRARON CANCIONES.*'
        )
      }


      const lines =
        top.data
          .map(
            (track, index) =>
`*${index + 1}.* ${track.title} — _${formatDuration(track.duration)}_`
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
`*⌬┤ 🎤 ├⌬ TOP — ${artist.name}*

${lines}

> 🌸 ${config.botName || 'SaitamaBot'}`
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
        '*⌬┤ ❌ ├⌬ ERROR AL OBTENER EL TOP.*'
      )
    }
  }


  /*
  |--------------------------------------------------------------------------
  | DEEZER SEARCH / DESCARGA
  |--------------------------------------------------------------------------
  */

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
      /deezer\.com|deezer\.page\.link/i.test(
        query
      )


    /*
    |--------------------------------------------------------------------------
    | LINK DIRECTO
    |--------------------------------------------------------------------------
    */

    if (isUrl) {

      await m.reply(
        '*⌬┤ ⏳ ├⌬ DESCARGANDO...*'
      )


      return executeDeezerDownload(
        conn,
        m,
        chatId,
        query
      )
    }


    /*
    |--------------------------------------------------------------------------
    | BUSCAR CANCIÓN
    |--------------------------------------------------------------------------
    */

    await m.reply(
      '*⌬┤ 🔎 ├⌬ Buscando canciones...*'
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
          '*⌬┤ ❌ ├⌬ SIN RESULTADOS.*'
        )
      }


      /*
      |--------------------------------------------------------------------------
      | LISTA DE RESULTADOS
      |--------------------------------------------------------------------------
      */

      const rows =
        results.map(
          track => {

            let title =
              track.title ||
              track.name ||
              'Canción'


            if (
              title.length > 24
            ) {
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


            if (
              description.length > 72
            ) {
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


      /*
      |--------------------------------------------------------------------------
      | MENÚ
      |--------------------------------------------------------------------------
      */

      const infoText =
`*⌬┤ 🎵 ├⌬ DEEZER SEARCH*

> 🔎 *Búsqueda:* ${query}
> 🎵 *Resultados:* ${results.length}

> Selecciona una canción para descargarla.`


      const buttons = [
        {
          name: 'single_select',

          buttonParamsJson:
            JSON.stringify({
              title: '🎶 VER RESULTADOS',

              sections: [
                {
                  title:
                    '✧ Selecciona un Track ✧',

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
`*⌬┤ ❌ ├⌬ ERROR.*

> No se pudo realizar la búsqueda.

⚠️ ${error?.message || 'Error desconocido'}`
      )
    }
  }
}


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DEL PLUGIN
|--------------------------------------------------------------------------
*/

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