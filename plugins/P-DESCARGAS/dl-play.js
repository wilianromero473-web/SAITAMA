import axios from 'axios'
import ytsearch from 'yt-search'
import config from '../../config.js'

// ═════════════════════════════════════
// CACHE DE RESULTADOS
// ═════════════════════════════════════

global.youtubeCache =
  global.youtubeCache || {}

// ═════════════════════════════════════
// API SECUNDARIA
// ═════════════════════════════════════

const LUXINFINITY =
  'https://luxinfinity.vercel.app/api/search/youtube'

// ═════════════════════════════════════
// HANDLER
// ═════════════════════════════════════

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

    // ═══════════════════════════════
    // ➡️ SIGUIENTE RESULTADO
    // ═══════════════════════════════

    if (
      command === 'playnext'
    ) {

      const dataUser =
        global.youtubeCache[m.sender]

      if (
        !dataUser ||
        !dataUser.results?.length
      ) {

        return m.reply(
          `╭━━━〔 ❌ SIN BÚSQUEDA 〕━━━⬣
┃
┃ No hay una búsqueda activa.
┃
┃ Usa:
┃ ${usedPrefix}play nombre
┃
╰━━━━━━━━━━━━━━━━━━⬣`
        )
      }

      dataUser.index++

      if (
        dataUser.index >=
        dataUser.results.length
      ) {

        dataUser.index = 0
      }

      return sendYoutubeCard(
        conn,
        m,
        dataUser.results,
        dataUser.index,
        usedPrefix
      )
    }

    // ═══════════════════════════════
    // 🔎 VALIDAR BÚSQUEDA
    // ═══════════════════════════════

    if (
      !text?.trim()
    ) {

      return m.reply(
        `╭━━━〔 🔎 SAITAMABOT SEARCH 〕━━━⬣
┃
┃ ❌ Escribe el nombre
┃ de una canción o video.
┃
┃ ✧ Ejemplo:
┃ ${usedPrefix}play Twice
┃
╰━━━━━━━━━━━━━━━━━━⬣`
      )
    }

    // ═══════════════════════════════
    // 🔍 MENSAJE DE BÚSQUEDA
    // ═══════════════════════════════

    await m.reply(
      `╭━━━〔 🔎 BUSCANDO 〕━━━⬣
┃
┃ 🔍 Buscando en YouTube...
┃
┃ 🎧 Consulta:
┃ ${text.trim()}
┃
┃ ⏳ Espera un momento...
┃
╰━━━━━━━━━━━━━━━━━━⬣`
    )

    let videos = []

    // ═══════════════════════════════
    // 1️⃣ PRIMERA API — YT-SEARCH
    // ═══════════════════════════════

    try {

      const searchResult =
        await ytsearch(
          text.trim()
        )

      if (
        searchResult?.videos?.length
      ) {

        videos =
          searchResult.videos
            .slice(0, 10)
            .map(v => ({

              title:
                v.title ||
                'Sin título',

              author:
                v.author?.name ||
                'Desconocido',

              duration:
                v.timestamp ||
                'Desconocida',

              views:
                Number(v.views || 0)
                  .toLocaleString(),

              publishedAt:
                v.ago ||
                'Desconocido',

              videoId:
                v.videoId,

              thumbnail:
                v.image,

              url:
                v.url

            }))
            .filter(v =>
              v.videoId &&
              v.url
            )
      }

    } catch {}

    // ═══════════════════════════════
    // 2️⃣ SEGUNDA API — LUXINFINITY
    // ═══════════════════════════════

    if (
      !videos.length
    ) {

      try {

        const { data } =
          await axios.get(
            LUXINFINITY,
            {
              params: {
                query:
                  text.trim(),

                limit: 10
              },

              timeout: 30000
            }
          )

        if (
          data?.status &&
          Array.isArray(data?.data) &&
          data.data.length
        ) {

          videos =
            data.data
              .slice(0, 10)
              .map(v => ({

                title:
                  v.title ||
                  'Sin título',

                author:
                  v.author?.name ||
                  'Desconocido',

                duration:
                  v.duration?.text ||
                  v.duration?.timestamp ||
                  'Desconocida',

                views:
                  Number(v.views || 0)
                    .toLocaleString(),

                publishedAt:
                  v.publishDate ||
                  'Desconocido',

                videoId:
                  v.id ||
                  v.videoId,

                thumbnail:
                  v.thumb ||
                  v.thumbnail ||
                  v.image,

                url:
                  v.url

              }))
              .filter(v =>
                v.videoId &&
                v.url
              )
        }

      } catch {}
    }

    // ═══════════════════════════════
    // ❌ SIN RESULTADOS
    // ═══════════════════════════════

    if (
      !videos.length
    ) {

      return m.reply(
        `╭━━━〔 ❌ SIN RESULTADOS 〕━━━⬣
┃
┃ No encontré resultados para:
┃
┃ 🎧 *${text.trim()}*
┃
┃ Intenta con otro nombre.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
      )
    }

    // ═══════════════════════════════
    // 💾 GUARDAR CACHE
    // ═══════════════════════════════

    global.youtubeCache[m.sender] = {

      query:
        text.trim(),

      index:
        0,

      results:
        videos
    }

    // ═══════════════════════════════
    // 🎬 MOSTRAR PRIMER RESULTADO
    // ═══════════════════════════════

    await sendYoutubeCard(
      conn,
      m,
      videos,
      0,
      usedPrefix
    )

  } catch {

    return m.reply(
      `╭━━━〔 ❌ ERROR 〕━━━⬣
┃
┃ No se pudo realizar
┃ la búsqueda.
┃
┃ Intenta nuevamente.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
    )
  }
}

// ═════════════════════════════════════
// 🎬 TARJETA DE YOUTUBE
// ═════════════════════════════════════

async function sendYoutubeCard(
  conn,
  m,
  results,
  index,
  usedPrefix
) {

  const video =
    results[index]

  if (!video) {

    return m.reply(
      '❌ No existe ese resultado.'
    )
  }

  const infoText =
`╭━━━〔 🎬  𝒀𝑶𝑼𝑻𝑼𝑩𝑬 𝑺𝑬𝑨𝑹𝑪𝑯 〕━━━⬣
┃
┃ ✦ 𝑰𝑵𝑭𝑶𝑹𝑴𝑨𝑪𝑰Ó𝑵
┃
┃ 🎵 𝑻í𝒕𝒖𝒍𝒐 ❯ ${video.title}
┃ 👤 𝑪𝒂𝒏𝒂𝒍 ❯ ${video.author}
┃ ⏱️ 𝑫𝒖𝒓𝒂𝒄𝒊ó𝒏 ❯ ${video.duration}
┃ 👁️ 𝑽𝒊𝒔𝒕𝒂𝒔 ❯ ${video.views}
┃ 📅 𝑷𝒖𝒃𝒍𝒊𝒄𝒂𝒅𝒐 ❯ ${video.publishedAt}
┃
┃ ✧ 𝑹𝒆𝒔𝒖𝒍𝒕𝒂𝒅𝒐 ❯ ${index + 1}/${results.length}
┃
┃ ╰─➤ 𝑬𝒍𝒊𝒈𝒆 𝒖𝒏𝒂 𝒐𝒑𝒄𝒊ó𝒏
┃
╰━━━━━━━━━━━━━━━━━━⬣`
  // ═══════════════════════════════
  // BOTONES
  // ═══════════════════════════════

  const buttons = [

    {
      text:
        '✦ Elegir formato ✦',

      sections: [

        {
          title:
            '╭─〔 🎧 𝑨𝑼𝑫𝑰𝑶 〕─╮',

          rows: [

            {
              title:
                '🎵 ❯ 𝑨𝑼𝑫𝑰𝑶 𝑴𝑷𝟑',

              description:
                '✦ 𝑫𝒆𝒔𝒄𝒂𝒓𝒈𝒂𝒓 𝒂𝒖𝒅𝒊𝒐 𝑴𝑷𝟑',

              id:
                `${usedPrefix}ytmp3 ${video.videoId}`
            },

            {
              title:
                '📄 ❯ 𝑨𝑼𝑫𝑰𝑶 𝑫𝑶𝑪𝑼𝑴𝑬𝑵𝑻𝑶',

              description:
                '✦ 𝑫𝒆𝒔𝒄𝒂𝒓𝒈𝒂𝒓 𝒂𝒖𝒅𝒊𝒐 𝒄𝒐𝒎𝒐 𝒅𝒐𝒄𝒖𝒎𝒆𝒏𝒕𝒐',

              id:
                `${usedPrefix}ytmp3doc ${video.videoId}`
            }

          ]
        },

        {
          title:
            '╭─〔 🎬 𝑽𝑰𝑫𝑬𝑶 〕─╮',

          rows: [

            {
              title:
                '🎬 𝑽𝑰𝑫𝑬𝑶 𝑴𝑷𝟒',

              description:
                '✦ 𝑫𝒆𝒔𝒄𝒂𝒓𝒈𝒂𝒓 𝒗𝒊𝒅𝒆𝒐 𝑴𝑷𝟒',

              id:
                `${usedPrefix}ytmp4 ${video.url}`
            },

            {
              title:
                '📁 ❯ 𝑽𝑰𝑫𝑬𝑶 𝑫𝑶𝑪𝑼𝑴𝑬𝑵𝑻𝑶',

              description:
                '✦ 𝑫𝒆𝒔𝒄𝒂𝒓𝒈𝒂𝒓 𝒗𝒊𝒅𝒆𝒐 𝒄𝒐𝒎𝒐 𝒅𝒐𝒄𝒖𝒎𝒆𝒏𝒕𝒐',

              id:
                `${usedPrefix}ytmp4doc ${video.url}`
            }

          ]
        },

        {
          title:
            '╭─〔 🔎 BÚSQUEDA 〕─╮',

          rows: [

            {
              title:
                '➡️ Siguiente resultado',

              description:
                `Ver resultado ${
                  index + 2 > results.length
                    ? 1
                    : index + 2
                }/${results.length}`,

              id:
                `${usedPrefix}playnext`
            }

          ]
        }

      ]
    }

  ]

  // ═══════════════════════════════
  // ENVIAR TARJETA
  // ═══════════════════════════════

  await conn.sendMessage(
    m.chat,
    {
      image: {
        url:
          video.thumbnail
      },

      caption:
        infoText,

      footer:
        global.botname ||
        config.botName ||
        'SaitamaBot',

      buttons

    },
    {
      quoted: m
    }
  )
}

// ═════════════════════════════════════
// CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'play <nombre>',
  'playnext'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'play',
  'play2',
  'play3',
  'playnext'
]

export default handler