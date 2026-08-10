import config from '../../config.js'
import { searchSpotify } from '../../lib/spotify.js'

global.spotifyCache =
  global.spotifyCache || {}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🎵 SPOTIFY SEARCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

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

    const query =
      String(text || '').trim()


    /* ━━━━━━━━━━━━━━━━━━━━━━━━━
       ❌ SIN TEXTO
    ━━━━━━━━━━━━━━━━━━━━━━━━━ */

    if (!query) {

      return m.reply(
`╭━━━〔 🎧 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕━━━⬣

✦ Ingresa el nombre de una canción.

✧ Ejemplo:

${usedPrefix + command} Sia Chandelier

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`
      )
    }


    /* ━━━━━━━━━━━━━━━━━━━━━━━━━
       🔎 REACCIÓN
    ━━━━━━━━━━━━━━━━━━━━━━━━━ */

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '🔎',
          key: m.key
        }
      }
    ).catch(() => {})


    /* ━━━━━━━━━━━━━━━━━━━━━━━━━
       🔎 BUSCAR
    ━━━━━━━━━━━━━━━━━━━━━━━━━ */

    const results =
      await searchSpotify(
        query,
        10
      )


    /* ━━━━━━━━━━━━━━━━━━━━━━━━━
       💾 CACHE
    ━━━━━━━━━━━━━━━━━━━━━━━━━ */

    const sender =
      m.sender ||
      m.key?.participant ||
      m.chat

    global.spotifyCache[sender] = {
      results,
      index: 0,
      time: Date.now()
    }


    /* ━━━━━━━━━━━━━━━━━━━━━━━━━
       🎵 MOSTRAR RESULTADO
    ━━━━━━━━━━━━━━━━━━━━━━━━━ */

    await sendSpotifyCard(
      conn,
      m,
      results,
      0,
      usedPrefix
    )


    /* ━━━━━━━━━━━━━━━━━━━━━━━━━
       ✅ REACCIÓN
    ━━━━━━━━━━━━━━━━━━━━━━━━━ */

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

    console.error(
      '[SPOTIFY SEARCH]',
      error
    )


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
`╭━━━〔 ❌ 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕━━━⬣

No se pudo realizar la búsqueda.

⚠️ *Detalles:*
${String(
  error?.message || error
).slice(0, 300)}

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`
    )
  }
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🎧 TARJETA SPOTIFY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

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


  const image =
    song.image ||
    song.cover ||
    null


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


  const publish =
    song.publish ||
    song.year ||
    'Desconocido'


  const caption =
`╭━━━〔 🎧 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕━━━⬣
✿ 𝐓𝐢́𝐭𝐮𝐥𝐨:
${title}
✦ 𝐀𝐫𝐭𝐢𝐬𝐭𝐚:
${artist}
❖ 𝐀́𝐥𝐛𝐮𝐦:
${album}
⏱️ 𝐃𝐮𝐫𝐚𝐜𝐢𝐨́𝐧:
${duration}
📅 𝐏𝐮𝐛𝐥𝐢𝐜𝐚𝐝𝐨:
${publish}
🎵 𝐑𝐞𝐬𝐮𝐥𝐭𝐚𝐝𝐨:
${index + 1}/${results.length}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━
     🎧 BOTONES
  ━━━━━━━━━━━━━━━━━━━━━━━━━ */

  const buttons = [

    {
      name: 'single_select',

      buttonParamsJson:
        JSON.stringify({

          title:
            '🎶 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐑',

          sections: [

            {
              title:
                '✧ Spotify Downloader ✧',

              rows: [

                {
                  title:
                    '🎧 𝐀𝐮𝐝𝐢𝐨 𝐌𝐏𝟑',

                  description:
                    'Descargar canción en audio',

                  id:
                    `${usedPrefix}spotifymp3 ${song.url}`
                },

                {
                  title:
                    '📁 𝐌𝐏𝟑 𝐃𝐎𝐂𝐔𝐌𝐄𝐍𝐓𝐎',

                  description:
                    'Enviar como archivo MP3',

                  id:
                    `${usedPrefix}spotifymp3doc ${song.url}`
                }

              ]
            }

          ]

        })
    }

  ]


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━
     🖼️ ENVIAR TARJETA
  ━━━━━━━━━━━━━━━━━━━━━━━━━ */

  const content = {

    caption,

    footer:
      `✦ ${config.botName || 'SaitamaBot'} ✦`,

    buttons
  }


  if (image) {

    content.image = {
      url: image
    }

  }


  await conn.sendMessage(
    m.chat,
    content,
    {
      quoted: m
    }
  )
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ⚙️ CONFIGURACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

handler.help = [
  'spotify <canción>'
]

handler.tags = [
  'buscador'
]

handler.command = [
  'spotify',
  'sp',
  'spotifysearch',
  'spsearch'
]

export default handler