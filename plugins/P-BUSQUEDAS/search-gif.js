import fetch from 'node-fetch'
import * as baileysMod from '@whiskeysockets/baileys'

const pkg =
  baileysMod.default &&
  Object.keys(baileysMod).length === 1
    ? baileysMod.default
    : baileysMod

const {
  generateWAMessageFromContent,
  generateWAMessage
} = pkg


// ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 • 𝙶𝙸𝙵 ✰

// ═════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═════════════════════════════

const TENOR_API =
  'https://g.tenor.com/v1/search'

const TENOR_KEY =
  'LIVDSRZULELA'

const MAX_GIFS = 6

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'


// ═════════════════════════════
// 🔎 BUSCAR GIFS
// ═════════════════════════════

async function searchGifs(query) {

  const url =
    `${TENOR_API}?q=${encodeURIComponent(query)}` +
    `&key=${TENOR_KEY}&limit=${MAX_GIFS}`

  const response =
    await fetch(
      url,
      {
        headers: {
          'User-Agent':
            USER_AGENT,

          Accept:
            'application/json'
        }
      }
    )

  if (!response.ok) {
    throw new Error(
      `Tenor respondió ${response.status}`
    )
  }

  const json =
    await response.json()

  if (
    !Array.isArray(
      json?.results
    ) ||
    !json.results.length
  ) {
    return []
  }

  return json.results
    .slice(0, MAX_GIFS)
}


// ═════════════════════════════
// 📥 DESCARGAR GIF
// ═════════════════════════════

async function downloadGif(url) {

  if (!url) {
    throw new Error(
      'URL del GIF inválida.'
    )
  }

  const response =
    await fetch(
      url,
      {
        headers: {
          'User-Agent':
            USER_AGENT,

          Accept:
            'video/mp4,video/*,*/*'
        }
      }
    )

  if (!response.ok) {
    throw new Error(
      `No se pudo descargar el GIF (${response.status}).`
    )
  }

  const arrayBuffer =
    await response.arrayBuffer()

  const buffer =
    Buffer.from(arrayBuffer)

  if (!buffer.length) {
    throw new Error(
      'El GIF está vacío.'
    )
  }

  return buffer
}


// ═════════════════════════════
// 🎯 HANDLER
// ═════════════════════════════

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


  // ═════════════════════════════
  // ❌ SIN BÚSQUEDA
  // ═════════════════════════════

  if (!query) {

    return m.reply(
`༺ 𝙶𝙸𝙵 𝚂𝙴𝙰𝚁𝙲𝙷 ༻

✰ Falta la búsqueda.

✰ Ejemplo:
${usedPrefix + command} Naruto`
    )
  }


  // ═════════════════════════════
  // ⏳ REACCIÓN
  // ═════════════════════════════

  await m.react('⏳')
    .catch(() => {})


  try {

    // ═════════════════════════════
    // 🔎 BUSCAR
    // ═════════════════════════════

    const items =
      await searchGifs(
        query
      )


    if (!items.length) {

      await m.react('❌')
        .catch(() => {})

      return m.reply(
`༺ 𝙶𝙸𝙵 𝚂𝙴𝙰𝚁𝙲𝙷 ༻

✰ No se encontraron GIFs.

✰ Búsqueda:
${query}`
      )
    }


    // ═════════════════════════════
    // 📦 CREAR ÁLBUM
    // ═════════════════════════════

    const album =
      generateWAMessageFromContent(
        m.chat,
        {
          albumMessage: {

            expectedImageCount:
              items.length,

            contextInfo: {

              stanzaId:
                m.key.id,

              participant:
                m.key.participant ||
                m.key.remoteJid,

              quotedMessage:
                m.message
            }
          }
        },
        {}
      )


    await conn.relayMessage(
      m.chat,
      album.message,
      {
        messageId:
          album.key.id
      }
    )


    // ═════════════════════════════
    // 🎬 ENVIAR GIFS
    // ═════════════════════════════

    let enviados = 0


    await Promise.all(
      items.map(
        async (
          item,
          index
        ) => {

          try {

            const mp4 =
              item?.media?.[0]?.mp4?.url


            if (!mp4) {
              return
            }


            // 📥 Descargar

            const buffer =
              await downloadGif(
                mp4
              )


            // 📤 Crear mensaje

            const msg =
              await generateWAMessage(
                m.chat,
                {
                  video:
                    buffer,

                  gifPlayback:
                    true,

                  caption:
                    index === 0
                      ? `༺ 𝙶𝙸𝙵𝚂 ༻\n\n✰ Búsqueda: ${query}\n✰ SaitamaBot`
                      : ''
                },
                {
                  upload:
                    conn.waUploadToServer
                }
              )


            // 🔗 Asociar al álbum

            msg.message
              .messageContextInfo = {

                messageAssociation: {

                  associationType:
                    1,

                  parentMessageKey:
                    album.key
                }
              }


            // 📤 Enviar

            await conn.relayMessage(
              m.chat,
              msg.message,
              {
                messageId:
                  msg.key.id
              }
            )


            enviados++

          } catch {
            // Continúa con el siguiente GIF
          }
        }
      )
    )


    // ═════════════════════════════
    // ❌ NINGUNO
    // ═════════════════════════════

    if (!enviados) {

      await m.react('❌')
        .catch(() => {})

      return m.reply(
`༺ 𝙶𝙸𝙵 𝚂𝙴𝙰𝚁𝙲𝙷 ༻

✰ No se pudo enviar ningún GIF.`
      )
    }


    // ═════════════════════════════
    // ✅ FINALIZADO
    // ═════════════════════════════

    await m.react('✅')
      .catch(() => {})


    return m.reply(
`༺ 𝙶𝙸𝙵 𝚂𝙴𝙰𝚁𝙲𝙷 ༻

✰ Búsqueda:
${query}

✰ GIFs enviados:
${enviados}/${items.length}

✰ 𝚂𝚊𝚒𝚝𝚊𝚖𝚊𝙱𝚘𝚝`
    )


  } catch (error) {

    await m.react('❌')
      .catch(() => {})

    return m.reply(
`༺ 𝙶𝙸𝙵 𝚂𝙴𝙰𝚁𝙲𝙷 ༻

✰ No se pudo completar
la búsqueda.

✰ Error:
${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 400)}`
    )
  }
}


// ═════════════════════════════
// ⚙️ COMANDO
// ═════════════════════════════

handler.help = [
  'gif <búsqueda>',
  'buscargif <búsqueda>',
  'tenorgif <búsqueda>'
]

handler.tags = [
  'busquedas'
]

handler.command = [
  'gif',
  'buscargif',
  'tenorgif'
]


export default handler