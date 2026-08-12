import axios from 'axios'
import config from '../../config.js'


/* ═════════════════════════════════════
   🎵 CACHE SPOTIFY
═════════════════════════════════════ */

global.spotifyCache =
  global.spotifyCache || {}


/* ═════════════════════════════════════
   ⚙️ CONFIGURACIÓN
═════════════════════════════════════ */

const CACHE_TIME = 10 * 60 * 1000

const API_URL =
  'https://api.lempi.lat/s/sp'

const API_KEY =
  'lem992'


/* ═════════════════════════════════════
   🔎 SPOTIFY SEARCH - LEMPI
═════════════════════════════════════ */

async function searchSpotify(
  query,
  limit = 10
) {

  if (!query?.trim()) {

    throw new Error(
      'La búsqueda está vacía.'
    )

  }


  limit =
    Math.min(
      Math.max(
        Number(limit) || 10,
        1
      ),
      10
    )


  /* ═══════════════════════════════
     🔎 PETICIÓN
  ═══════════════════════════════ */

  const response =
    await axios.get(

      API_URL,

      {

        params: {

          q:
            query.trim(),

          limit,

          apikey:
            API_KEY

        },

        timeout:
          20000

      }

    )


  const data =
    response?.data


  if (!data) {

    throw new Error(
      'La API no devolvió ninguna respuesta.'
    )

  }


  if (data.status === false) {

    throw new Error(
      data.message ||
      'La API rechazó la búsqueda.'
    )

  }


  /* ═══════════════════════════════
     🎵 CANCIONES
  ═══════════════════════════════ */

  const tracks =
    data
      ?.resultados
      ?.canciones || []


  if (!Array.isArray(tracks)) {

    return []

  }


  /* ═══════════════════════════════
     🔄 NORMALIZAR
  ═══════════════════════════════ */

  return tracks.map(
    track => {

      const id =
        String(
          track?.id || ''
        )


      const title =
        track?.titulo ||
        'Desconocido'


      /* ═════════════════════════
         👤 ARTISTAS
      ═════════════════════════ */

      const artists =
        Array.isArray(
          track?.artistas
        )
          ? track.artistas
              .map(
                artist =>
                  artist?.nombre
              )
              .filter(Boolean)
          : []


      const artist =
        artists.length
          ? artists.join(', ')
          : 'Desconocido'


      /* ═════════════════════════
         💿 ÁLBUM
      ═════════════════════════ */

      const album =
        track?.album?.nombre ||
        'Desconocido'


      /* ═════════════════════════
         🖼️ PORTADA
      ═════════════════════════ */

      const image =
        track?.album?.imagen ||
        null


      /* ═════════════════════════
         ⏱️ DURACIÓN
      ═════════════════════════ */

      const durationMs =
        Number(
          track?.duracion_ms || 0
        )


      /* ═════════════════════════
         🔗 URL SPOTIFY REAL
      ═════════════════════════ */

      const spotifyUrl =
        track?.url ||
        (
          id
            ? `https://open.spotify.com/track/${id}`
            : `https://open.spotify.com/search/${encodeURIComponent(
                `${title} ${artist}`
              )}`
        )


      /* ═════════════════════════
         📦 RESULTADO
      ═════════════════════════ */

      return {

        id,

        title,

        name:
          title,

        artist,

        artists:
          track?.artistas || [],

        album,

        albumData:
          track?.album || null,

        image,

        cover:
          image,

        duration:
          formatDuration(
            durationMs
          ),

        durationMs,

        url:
          spotifyUrl,

        spotifyUrl,

        explicit:
          Boolean(
            track?.explicito
          ),

        publish:
          'Desconocido',

        year:
          track?.album?.año ||
          'Desconocido'

      }

    }
  )

}


/* ═════════════════════════════════════
   ⏱️ FORMATO DURACIÓN
═════════════════════════════════════ */

function formatDuration(ms) {

  if (
    !ms ||
    ms <= 0
  ) {

    return 'Desconocida'

  }


  const minutes =
    Math.floor(
      ms / 60000
    )


  const seconds =
    Math.floor(
      (ms % 60000) / 1000
    )


  return `${minutes}:${String(
    seconds
  ).padStart(2, '0')}`

}


/* ═════════════════════════════════════
   👤 OBTENER IDENTIFICADOR
═════════════════════════════════════ */

function getSender(m) {

  return (
    m.sender ||
    m.key?.participant ||
    m.participant ||
    m.chat
  )

}


/* ═════════════════════════════════════
   🧹 LIMPIAR CACHE
═════════════════════════════════════ */

function cleanSpotifyCache(sender) {

  const cache =
    global.spotifyCache?.[sender]


  if (!cache) {

    return null

  }


  if (
    Date.now() -
    cache.time >
    CACHE_TIME
  ) {

    delete global.spotifyCache[sender]

    return null

  }


  return cache

}


/* ═════════════════════════════════════
   🎵 HANDLER
═════════════════════════════════════ */

const handler = async (

  m,

  {
    conn,
    text,
    usedPrefix,
    command
  }

) => {

  try {

    const sender =
      getSender(m)


    /* ═══════════════════════════════
       ➡️ SIGUIENTE RESULTADO
    ═══════════════════════════════ */

    if (
      command === 'spnext' ||
      command === 'spotify-next' ||
      command === 'spotify_next'
    ) {

      const cache =
        cleanSpotifyCache(
          sender
        )


      if (
        !cache ||
        !Array.isArray(
          cache.results
        ) ||
        !cache.results.length
      ) {

        return m.reply(

`╭━━━〔 ❌ 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕━━━⬣

La búsqueda anterior
ya no está disponible.

🔎 Realiza una nueva búsqueda.

✧ Ejemplo:

${usedPrefix}spotify The Weeknd

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${
  config.botName ||
  'SaitamaBot'
}`

        )

      }


      /* ═════════════════════════════
         🔢 SIGUIENTE ÍNDICE
      ═════════════════════════════ */

      cache.index =
        Number(
          cache.index || 0
        ) + 1


      /* ═════════════════════════════
         🔄 VOLVER AL PRIMERO
      ═════════════════════════════ */

      if (
        cache.index >=
        cache.results.length
      ) {

        cache.index = 0

      }


      cache.time =
        Date.now()


      /* ═════════════════════════════
         🔎 REACCIÓN
      ═════════════════════════════ */

      await conn.sendMessage(

        m.chat,

        {

          react: {

            text:
              '🔎',

            key:
              m.key

          }

        }

      ).catch(() => {})


      /* ═════════════════════════════
         🎧 MOSTRAR SIGUIENTE
      ═════════════════════════════ */

      await sendSpotifyCard(

        conn,

        m,

        cache.results,

        cache.index,

        usedPrefix

      )


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


      return

    }


    /* ═══════════════════════════════
       🔎 TEXTO DE BÚSQUEDA
    ═══════════════════════════════ */

    const query =
      String(
        text || ''
      ).trim()


    /* ═══════════════════════════════
       ❌ SIN TEXTO
    ═══════════════════════════════ */

    if (!query) {

      return m.reply(

`╭━━━〔 🎧 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕━━━⬣

✦ Ingresa el nombre de una canción.

✧ Ejemplo:

${usedPrefix + command} The Weeknd

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${
  config.botName ||
  'SaitamaBot'
}`

      )

    }


    /* ═══════════════════════════════
       🔎 REACCIÓN
    ═══════════════════════════════ */

    await conn.sendMessage(

      m.chat,

      {

        react: {

          text:
            '🔎',

          key:
            m.key

        }

      }

    ).catch(() => {})


    /* ═══════════════════════════════
       🔎 BUSCAR
    ═══════════════════════════════ */

    const results =
      await searchSpotify(

        query,

        10

      )


    /* ═══════════════════════════════
       ❌ SIN RESULTADOS
    ═══════════════════════════════ */

    if (
      !results ||
      !results.length
    ) {

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

`╭━━━〔 ❌ 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕━━━⬣

No encontré resultados para:

🔎 ${query}

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${
  config.botName ||
  'SaitamaBot'
}`

      )

    }


    /* ═══════════════════════════════
       💾 GUARDAR CACHE
    ═══════════════════════════════ */

    global.spotifyCache[sender] = {

      query,

      index:
        0,

      results,

      time:
        Date.now()

    }


    /* ═══════════════════════════════
       🎧 MOSTRAR RESULTADO
    ═══════════════════════════════ */

    await sendSpotifyCard(

      conn,

      m,

      results,

      0,

      usedPrefix

    )


    /* ═══════════════════════════════
       ✅ REACCIÓN
    ═══════════════════════════════ */

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

    console.error(

      '[SPOTIFY SEARCH]',

      error?.response?.data ||
      error?.message ||
      error

    )


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

`╭━━━〔 ❌ 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕━━━⬣

No se pudo realizar la búsqueda.

⚠️ Detalles:

${String(
  error?.response?.data?.message ||
  error?.message ||
  error
).slice(0, 300)}

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${
  config.botName ||
  'SaitamaBot'
}`

    )

  }

}


/* ═════════════════════════════════════
   🎧 TARJETA SPOTIFY
═════════════════════════════════════ */

async function sendSpotifyCard(

  conn,

  m,

  results,

  index,

  usedPrefix

) {

  const song =
    results[index]


  if (!song) {

    return m.reply(
      '❌ No existe ese resultado.'
    )

  }


  /* ═══════════════════════════════
     🎵 DATOS
  ═══════════════════════════════ */

  const title =
    song.title ||
    song.name ||
    'Desconocido'


  const artist =
    song.artist ||
    'Desconocido'


  const album =
    song.album ||
    'Desconocido'


  const duration =
    song.duration ||
    'Desconocida'


  const image =
    song.image ||
    song.cover ||
    null


  const spotifyUrl =
    song.spotifyUrl ||
    song.url ||
    ''


  /* ═══════════════════════════════
     📝 CAPTION
  ═══════════════════════════════ */

  const caption =

`╭━━━〔 🎧 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕━━━⬣
┃
┃ ✦ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍
┃
┃ 🎵 𝐓í𝐭𝐮𝐥𝐨 ❯ ${title}
┃ 👤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚 ❯ ${artist}
┃ 💿 𝐀́𝐥𝐛𝐮𝐦 ❯ ${album}
┃ ⏱️ 𝐃𝐮𝐫𝐚𝐜𝐢𝐨́𝐧 ❯ ${duration}
┃
┃ 🔢 𝐑𝐞𝐬𝐮𝐥𝐭𝐚𝐝𝐨 ❯ ${index + 1}/${results.length}
┃
┃ ╰─➤ 𝐄𝐥𝐢𝐠𝐞 𝐮𝐧𝐚 𝐨𝐩𝐜𝐢𝐨́𝐧
┃
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${
  config.botName ||
  'SaitamaBot'
}`


  /* ═══════════════════════════════
     🎧 BOTONES
  ═══════════════════════════════ */

  const buttons = [

    {

      text:
        '✦ Elegir formato ✦',

      sections: [

        /* ═══════════════════════
           🎧 AUDIO
        ═══════════════════════ */

        {

          title:
            '╭─〔 🎧 𝐀𝐔𝐃𝐈𝐎 〕─╮',

          rows: [

            {

              title:
                '🎵 ❯ 𝐀𝐔𝐃𝐈𝐎 𝐌𝐏𝟑',

              description:
                '✦ Descargar esta canción en MP3',

              /*
               * IMPORTANTE:
               * Ahora enviamos la URL REAL
               * de Spotify al comando.
               */

              id:
                `${usedPrefix}spotifymp3 ${spotifyUrl}`

            },

            {

              title:
                '📄 ❯ 𝐀𝐔𝐃𝐈𝐎 𝐃𝐎𝐂𝐔𝐌𝐄𝐍𝐓𝐎',

              description:
                '✦ Descargar como documento',

              id:
                `${usedPrefix}spotifymp3doc ${spotifyUrl}`

            }

          ]

        },


        /* ═══════════════════════════════
           🎵 SPOTIFY
        ═══════════════════════════════ */

        {

          title:
            '╭─〔 🎵 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕─╮',

          rows: [

            {

              title:
                '🎵 ❯ 𝐀𝐁𝐑𝐈𝐑 𝐒𝐏𝐎𝐓𝐈𝐅𝐘',

              description:
                '✦ Abrir la canción en Spotify',

              id:
                spotifyUrl

            }

          ]

        },


        /* ═══════════════════════════════
           🔎 SIGUIENTE
        ═══════════════════════════════ */

        {

          title:
            '╭─〔 🔎 𝐁𝐔́𝐒𝐐𝐔𝐄𝐃𝐀 〕─╮',

          rows: [

            {

              title:
                '➡️ ❯ 𝐒𝐈𝐆𝐔𝐈𝐄𝐍𝐓𝐄',

              description:
                `Ver resultado ${
                  index + 2 >
                  results.length
                    ? 1
                    : index + 2
                }/${results.length}`,

              /*
               * IMPORTANTE:
               * Ya NO hacemos:
               *
               * spotify ${song.title}
               *
               * Ahora usamos el CACHE.
               */

              id:
                `${usedPrefix}spnext`

            }

          ]

        }

      ]

    }

  ]


  /* ═══════════════════════════════
     📦 CONTENIDO
  ═══════════════════════════════ */

  const content = {

    caption,

    footer:
      global.botname ||
      config.botName ||
      'SaitamaBot',

    buttons

  }


  /* ═══════════════════════════════
     🖼️ PORTADA
  ═══════════════════════════════ */

  if (image) {

    content.image = {

      url:
        image

    }

  }


  /* ═══════════════════════════════
     📤 ENVIAR
  ═══════════════════════════════ */

  await conn.sendMessage(

    m.chat,

    content,

    {

      quoted:
        m

    }

  )

}


/* ═════════════════════════════════════
   ⚙️ CONFIGURACIÓN
═════════════════════════════════════ */

handler.help = [

  'spotify <canción>',

  'sp <canción>',

  'spsearch <canción>',

  'spnext'

]


handler.tags = [

  'buscador'

]


handler.command = [

  'spotify',

  'sp',

  'spotifysearch',

  'spsearch',

  'spnext',

  'spotify-next',

  'spotify_next'

]


export default handler