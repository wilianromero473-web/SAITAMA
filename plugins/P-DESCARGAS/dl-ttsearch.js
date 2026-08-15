import fetch from 'node-fetch'
import * as baileysMod from '@whiskeysockets/baileys'

// ━━━━━━━ APIs TIKTOK SEARCH ━━━━━━━
const API_URL = 'https://api.stellarwa.xyz'
const API_KEY = 'proyectsV2'

const LEMPI_URL = 'https://api.lempi.lat/s/tiktok'
const LEMPI_KEY = 'lem992'
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const pkg =
  baileysMod.default && Object.keys(baileysMod).length === 1
    ? baileysMod.default
    : baileysMod

const {
  generateWAMessageFromContent,
  generateWAMessage
} = pkg


// ━━━━━━━ FETCH JSON ━━━━━━━
async function getJSON(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  return await res.json()
}


// ━━━━━━━ HANDLER ━━━━━━━
const handler = async (
  m,
  { conn, text, usedPrefix, command }
) => {

  let query = text?.trim() || ''

  if (!query && m.quoted) {
    query = (
      m.quoted.body ||
      m.quoted.text ||
      ''
    ).trim()
  }

  if (!query) {
    return m.reply(
`╭━━〔 🔎 TIKTOK 〕━━⬣

│ ✦ Uso:
│ ${usedPrefix}${command} gatos
│
╰━━━━━━━━━━━━━━━━⬣`
    )
  }


  await m.reply(
`╭━━〔 🔍 BUSCANDO 〕━━⬣

│ 🔎 ${query}
│ 🌸 SaitamaBot
│
╰━━━━━━━━━━━━━━━━⬣`
  )


  try {

    let results = []


    // ═════════════════════════════
    // 1️⃣ LEMPI
    // ═════════════════════════════

    try {

      const url =
        `${LEMPI_URL}?q=${encodeURIComponent(query)}&apikey=${LEMPI_KEY}`

      const json = await getJSON(url)

      if (
        json?.status === true &&
        Array.isArray(json?.resultados)
      ) {
        results = json.resultados
      }

    } catch {}


    // ═════════════════════════════
    // 2️⃣ STELLARWA → RESPALDO
    // ═════════════════════════════

    if (!results.length) {

      try {

        const url =
          `${API_URL}/search/tiktok?query=${encodeURIComponent(query)}&key=${API_KEY}`

        const json = await getJSON(url)

        if (Array.isArray(json?.data)) {
          results = json.data
        }

      } catch {}

    }


    // ═════════════════════════════
    // SIN RESULTADOS
    // ═════════════════════════════

    if (!results.length) {

      return m.reply(
`╭━━〔 ❌ SIN RESULTADOS 〕━━⬣

│ 🔎 ${query}
│
╰━━━━━━━━━━━━━━━━⬣`
      )

    }


    // Máximo 7 videos
    const videos = results.slice(0, 7)


    // ═════════════════════════════
    // ÁLBUM
    // ═════════════════════════════

    const album =
      generateWAMessageFromContent(
        m.chat,
        {
          albumMessage: {
            expectedVideoCount: videos.length,

            contextInfo: {
              stanzaId: m.key.id,
              participant:
                m.key.participant || m.chat,
              quotedMessage: m.message
            }
          }
        },
        {}
      )


    await conn.relayMessage(
      m.chat,
      album.message,
      {
        messageId: album.key.id
      }
    )


    // ═════════════════════════════
    // ENVIAR VIDEOS
    // ═════════════════════════════

    for (const v of videos) {

      try {

        // ━━━━━ LEMPI ━━━━━

        const videoUrl =
          v.video ||
          v.nowatermark ||
          v.dl ||
          v.url


        if (!videoUrl) continue


        const response =
          await fetch(videoUrl)

        if (!response.ok) continue


        const buffer =
          Buffer.from(
            await response.arrayBuffer()
          )


        // ═════════════════════════
        // DATOS NORMALIZADOS
        // ═════════════════════════

        const titulo =
          v.titulo ||
          v.title ||
          'Sin título'

        const autor =
          v.autor?.nombre ||
          v.author?.nickname ||
          v.author?.name ||
          v.autor?.usuario ||
          'Desconocido'

        const usuario =
          v.autor?.usuario ||
          v.author?.unique_id ||
          v.author?.username ||
          ''

        const duracion =
          v.duracion != null
            ? `${v.duracion}s`
            : v.duration || 'N/D'

        const vistas =
          v.estadisticas?.vistas ??
          v.stats?.views ??
          v.views ??
          0

        const likes =
          v.estadisticas?.likes ??
          v.stats?.likes ??
          v.likes ??
          0

        const comentarios =
          v.estadisticas?.comentarios ??
          v.stats?.comments ??
          0

        const compartidos =
          v.estadisticas?.compartidos ??
          v.stats?.shares ??
          0

        const favoritos =
          v.estadisticas?.favoritos ??
          v.stats?.favorites ??
          0

        const tiktokUrl =
          v.url || ''


        // ═════════════════════════
        // CAPTION CORTO Y SEPARADO
        // ═════════════════════════

        const caption =
`╭━━〔 🎵 TIKTOK 〕━━⬣

│ 📝 ${titulo}
│ 👤 ${autor}${usuario ? ` (@${usuario})` : ''}
│ ⏱️ ${duracion}
│ 👁️ ${Number(vistas).toLocaleString()}
│ ❤️ ${Number(likes).toLocaleString()}
│ 💬 ${Number(comentarios).toLocaleString()}
│ 🔄 ${Number(compartidos).toLocaleString()}
│ ⭐ ${Number(favoritos).toLocaleString()}

│ 🔗 ${tiktokUrl}

╰━━━━━━━━━━━━━━━━⬣`


        const videoMsg =
          await generateWAMessage(
            m.chat,
            {
              video: buffer,
              mimetype: 'video/mp4',
              caption
            },
            {
              upload:
                conn.waUploadToServer
            }
          )


        videoMsg.message.messageContextInfo = {
          messageAssociation: {
            associationType: 1,
            parentMessageKey: album.key
          }
        }


        await conn.relayMessage(
          m.chat,
          videoMsg.message,
          {
            messageId: videoMsg.key.id
          }
        )


      } catch {}

    }


  } catch (e) {

    console.error(
      '[TIKTOK SEARCH]',
      e
    )

    await m.reply(
`╭━━〔 ❌ ERROR 〕━━⬣

│ No se pudo completar la búsqueda.
│
╰━━━━━━━━━━━━━━━━⬣`
    )

  }

}


// ━━━━━ CONFIG ━━━━━

handler.help = [
  'ttsearch <texto>'
]

handler.tags = [
  'buscador'
]

handler.command = [
  'ttsearch',
  'tiktoksearch',
  'tts'
]

export default handler
