import axios from 'axios'
import fetch from 'node-fetch'

// ═══════════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═══════════════════════════════════

const ITUNES_API =
  'https://itunes.apple.com/search'

const GENIUS_SEARCH_API =
  'https://api.delirius.store/search/genius'

const GENIUS_LYRICS_API =
  'https://api.delirius.store/search/geniuslyrics'

const LYRICS_API =
  'https://luxinfinity.vercel.app/api/tools/lyrics'

const MAX_LETTER_LENGTH = 3000

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'


// ═══════════════════════════════════
// 🎵 BUSCAR INFORMACIÓN DE CANCIÓN
// ═══════════════════════════════════

async function getSongInfo(query) {

  try {

    const response =
      await axios.get(
        ITUNES_API,
        {
          params: {
            term: query,
            media: 'music',
            limit: 1
          },

          timeout: 10000,

          headers: {
            'User-Agent':
              USER_AGENT
          }
        }
      )

    const song =
      response.data?.results?.[0]

    if (!song) {
      return {
        titulo: query,
        artista: '?',
        album: '?',
        imagen: null
      }
    }

    return {

      titulo:
        song.trackName ||
        query,

      artista:
        song.artistName ||
        '?',

      album:
        song.collectionName ||
        '?',

      imagen:
        song.artworkUrl100
          ?.replace(
            '100x100',
            '600x600'
          ) ||
        null
    }

  } catch {

    return {
      titulo: query,
      artista: '?',
      album: '?',
      imagen: null
    }

  }
}


// ═══════════════════════════════════
// 🔎 BUSCAR EN GENIUS
// ═══════════════════════════════════

async function searchGenius(
  titulo,
  artista
) {

  const query =
    encodeURIComponent(
      `${artista !== '?' ? artista + ' ' : ''}${titulo}`
    )

  const response =
    await fetch(
      `${GENIUS_SEARCH_API}?q=${query}`,
      {
        headers: {
          'User-Agent':
            USER_AGENT
        }
      }
    )

  if (!response.ok) {
    throw new Error(
      `Genius HTTP ${response.status}`
    )
  }

  const json =
    await response.json()

  const results =
    json?.data

  if (
    !Array.isArray(results) ||
    !results.length
  ) {
    return null
  }

  const result =
    results.find(
      item =>
        !item?.instrumental
    ) ||
    results[0]

  return {

    url:
      result?.url ||
      null,

    image:
      result?.image ||
      null

  }

}


// ═══════════════════════════════════
// 📖 OBTENER LETRA GENIUS
// ═══════════════════════════════════

async function getGeniusLyrics(
  url
) {

  const response =
    await fetch(
      `${GENIUS_LYRICS_API}?url=${encodeURIComponent(url)}&parse=false`,
      {
        headers: {
          'User-Agent':
            USER_AGENT
        }
      }
    )

  if (!response.ok) {
    throw new Error(
      `Lyrics HTTP ${response.status}`
    )
  }

  const json =
    await response.json()

  return (
    json?.data?.lyrics ||
    null
  )
}


// ═══════════════════════════════════
// 🎼 BUSCAR LETRA DIRECTAMENTE
// ═══════════════════════════════════

async function searchLyrics(
  query
) {

  const response =
    await axios.get(
      LYRICS_API,
      {
        params: {
          query
        },

        timeout: 20000,

        headers: {
          'User-Agent':
            USER_AGENT
        }
      }
    )

  return response.data
}


// ═══════════════════════════════════
// ✂️ LIMITAR TEXTO
// ═══════════════════════════════════

function limitarTexto(
  texto
) {

  if (!texto) {
    return null
  }

  if (
    texto.length <=
    MAX_LETTER_LENGTH
  ) {
    return texto
  }

  return (
    texto.slice(
      0,
      MAX_LETTER_LENGTH
    ) +
    '\n\n✰ *(Texto truncado)*'
  )

}


// ═══════════════════════════════════
// 🎯 HANDLER PRINCIPAL
// ═══════════════════════════════════

const handler = async (
  m,
  {
    conn,
    command,
    text,
    usedPrefix
  }
) => {

  const query =
    String(
      text || ''
    ).trim()


  // ═══════════════════════════════════
  // ❌ SIN BÚSQUEDA
  // ═══════════════════════════════════

  if (!query) {

    return m.reply(
`✰ 𝙻𝙴𝚃𝚁𝙰𝚂 ✰

✦ 𝙵𝚊𝚕𝚝𝚊 𝚕𝚊 𝚋ú𝚜𝚚𝚞𝚎𝚍𝚊.

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix}${command} The Weeknd`
    )

  }


  await m.react('🎵')


  // ═══════════════════════════════════
  // 🎤 GENIUS
  // ═══════════════════════════════════

  if (
    [
      'genius',
      'geniuslyrics',
      'letragenius'
    ].includes(command)
  ) {

    try {

      const song =
        await getSongInfo(
          query
        )


      const genius =
        await searchGenius(
          song.titulo,
          song.artista
        )


      if (!genius?.url) {

        await m.react('❌')

        return m.reply(
`✰ 𝙶𝙴𝙽𝙸𝚄𝚂 ✰

✦ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛ó
✦ 𝚕𝚊 𝚌𝚊𝚗𝚌𝚒ó𝚗.

✰ 𝙱ú𝚜𝚚𝚞𝚎𝚍𝚊:
> ${query}`
        )

      }


      const letra =
        await getGeniusLyrics(
          genius.url
        )


      if (!letra) {

        await m.react('❌')

        return m.reply(
`✰ 𝙶𝙴𝙽𝙸𝚄𝚂 ✰

✦ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛ó 𝚕𝚊
✦ 𝚒𝚗𝚏𝚘𝚛𝚖𝚊𝚌𝚒ó𝚗 𝚜𝚘𝚕𝚒𝚌𝚒𝚝𝚊𝚍𝚊.`
        )

      }


      const texto =
        limitarTexto(
          letra
        )


      const caption =
`✰ 𝙶𝙴𝙽𝙸𝚄𝚂 ✰

✦ 𝚃í𝚝𝚞𝚕𝚘:
> ${song.titulo}
✦ 𝙰𝚛𝚝𝚒𝚜𝚝𝚊:
> ${song.artista}
✦ Á𝚕𝚋𝚞𝚖:
> ${song.album}
✰ 𝙻𝚎𝚝𝚛𝚊:
${texto}

✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃`


      // ═════════════════════════════
      // 🖼️ CON IMAGEN
      // ═════════════════════════════

      if (
        genius.image ||
        song.imagen
      ) {

        try {

          const imageUrl =
            genius.image ||
            song.imagen

          const response =
            await fetch(
              imageUrl
            )

          const buffer =
            Buffer.from(
              await response.arrayBuffer()
            )

          await conn.sendMessage(
            m.chat,
            {
              image: buffer,
              caption
            },
            {
              quoted: m
            }
          )

        } catch {

          await m.reply(
            caption
          )

        }

      } else {

        await m.reply(
          caption
        )

      }


      await m.react('✅')

    } catch (error) {

      await m.react('❌')

      return m.reply(
`✰ 𝙶𝙴𝙽𝙸𝚄𝚂 ✰

✦ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘
✦ 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛 𝚕𝚊 𝚋ú𝚜𝚚𝚞𝚎𝚍𝚊.

✰ 𝙴𝚛𝚛𝚘𝚛:
${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 300)}`
      )

    }

    return
  }


  // ═══════════════════════════════════
  // 🎵 LYRICS
  // ═══════════════════════════════════

  if (
    [
      'lyrics',
      'letracancion',
      'songlyrics'
    ].includes(command)
  ) {

    try {

      const response =
        await searchLyrics(
          query
        )

      const song =
        response?.data?.[0]


      if (
        !song?.lyrics
      ) {

        await m.react('❌')

        return m.reply(
`✰ 𝙻𝚈𝚁𝙸𝙲𝚂 ✰

✦ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛ó
✦ 𝚕𝚊 𝚌𝚊𝚗𝚌𝚒ó𝚗.

✰ 𝙱ú𝚜𝚚𝚞𝚎𝚍𝚊:
> ${query}`
        )

      }


      const letra =
        limitarTexto(
          song.lyrics
        )


      const duration =
        song.duration
          ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}`
          : '?'


      const caption =
`✰ 𝙻𝚈𝚁𝙸𝙲𝚂 ✰

✦ 𝚃í𝚝𝚞𝚕𝚘:
> ${song.title || query}
✦ 𝙰𝚛𝚝𝚒𝚜𝚝𝚊:
> ${song.artist || '?'}
✦ Á𝚕𝚋𝚞𝚖:
> ${song.album || '?'}
✦ 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:
> ${duration}
✰ 𝙻𝚎𝚝𝚛𝚊:
${letra}

✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃`


      await m.reply(
        caption
      )

      await m.react('✅')

    } catch (error) {

      await m.react('❌')

      return m.reply(
`✰ 𝙻𝚈𝚁𝙸𝙲𝚂 ✰

✦ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘
✦ 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛 𝚕𝚊 𝚋ú𝚜𝚚𝚞𝚎𝚍𝚊.

✰ 𝙴𝚛𝚛𝚘𝚛:
${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 300)}`
      )

    }

  }

}


// ═══════════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═══════════════════════════════════

handler.help = [
  'genius <canción>',
  'lyrics <canción>'
]

handler.command = [
  'genius',
  'geniuslyrics',
  'letragenius',
  'lyrics',
  'letracancion',
  'songlyrics'
]

handler.tags = [
  'busquedas'
]

export default handler