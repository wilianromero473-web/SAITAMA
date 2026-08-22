import fetch from 'node-fetch'
import * as baileysMod from '@whiskeysockets/baileys'

// APIs
const API_URL = 'https://api.stellarwa.xyz'
const API_KEY = 'proyectsV2'

const LEMPI_URL = 'https://api.lempi.lat/s/tiktok'
const LEMPI_KEY = 'lem_fe9463d34eeb2708aea45ffdefd6f852f5361f01'

const pkg =
  baileysMod.default && Object.keys(baileysMod).length === 1
    ? baileysMod.default
    : baileysMod

const {
  generateWAMessageFromContent,
  generateWAMessage
} = pkg

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
`༺ 𝚃𝙸𝙺𝚃𝙾𝙺 𝚂𝙴𝙰𝚁𝙲𝙷 ༻

✰ 𝚄𝚜𝚊:
${usedPrefix}${command} <texto>

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix}${command} gatos`
    )
  }

  try {

    let results = []

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

    if (!results.length) {
      return m.reply(
`༺ 𝚂𝙸𝙽 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 ༻

✰ 𝙱ú𝚜𝚚𝚞𝚎𝚍𝚊:
${query}

✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚛𝚘𝚗 𝚟í𝚍𝚎𝚘𝚜.`
      )
    }

    const videos = results.slice(0, 7)

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

    for (const v of videos) {

      try {

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

        const caption =
`༺ 𝚃𝙸𝙺𝚃𝙾𝙺 ༻

✰ 𝚃í𝚝𝚞𝚕𝚘:
${titulo}
✰ 𝙰𝚞𝚝𝚘𝚛:
${autor}${usuario ? ` (@${usuario})` : ''}
✰ 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:
${duracion}
✰ 𝚅𝚒𝚜𝚝𝚊𝚜:
${Number(vistas).toLocaleString()}
✰ 𝙻𝚒𝚔𝚎𝚜:
${Number(likes).toLocaleString()}
✰ 𝙲𝚘𝚖𝚎𝚗𝚝𝚊𝚛𝚒𝚘𝚜:
${Number(comentarios).toLocaleString()}
✰ 𝙲𝚘𝚖𝚙𝚊𝚛𝚝𝚒𝚍𝚘𝚜:
${Number(compartidos).toLocaleString()}
✰ 𝙵𝚊𝚟𝚘𝚛𝚒𝚝𝚘𝚜:
${Number(favoritos).toLocaleString()}
✰ 𝙻𝚒𝚗𝚔:
${tiktokUrl}`

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

  } catch {

    return m.reply(
`༺ 𝙴𝚁𝚁𝙾𝚁 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛 𝚕𝚊 𝚋ú𝚜𝚚𝚞𝚎𝚍𝚊.

✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚍𝚎 𝚗𝚞𝚎𝚟𝚘.`
    )
  }
}

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