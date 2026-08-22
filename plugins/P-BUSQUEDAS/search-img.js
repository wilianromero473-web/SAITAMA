import axios from 'axios'
import * as cheerio from 'cheerio'
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

const MAX_IMAGES = 6

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'


// ═══════════════════════════════
// 🔎 BUSCAR IMÁGENES EN BING
// ═══════════════════════════════

async function searchImages(query) {

  const response = await axios.get(
    `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2`,
    {
      timeout: 30000,

      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml'
      }
    }
  )

  const $ = cheerio.load(response.data)

  const images = []

  $('a.iusc').each((_, element) => {

    try {

      const data = $(element).attr('m')

      if (!data) return

      const json = JSON.parse(data)

      if (json?.murl) {
        images.push(json.murl)
      }

    } catch {}

  })

  return [
    ...new Set(images)
  ]
}


// ═══════════════════════════════
// 📥 DESCARGAR IMAGEN
// ═══════════════════════════════

async function downloadImage(url) {

  const response = await fetch(
    url,
    {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*'
      },

      timeout: 30000
    }
  )

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    )
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    )

  if (!buffer.length) {
    throw new Error(
      'Imagen vacía'
    )
  }

  return buffer
}


// ═══════════════════════════════
// 🖼️ CREAR ÁLBUM
// ═══════════════════════════════

async function createAlbum(
  conn,
  m,
  total
) {

  const album =
    generateWAMessageFromContent(
      m.chat,
      {
        albumMessage: {
          expectedImageCount: total,

          contextInfo: {
            stanzaId: m.key.id,

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

  return album
}


// ═══════════════════════════════
// 📤 ENVIAR IMAGEN AL ÁLBUM
// ═══════════════════════════════

async function sendAlbumImage(
  conn,
  m,
  album,
  buffer,
  caption
) {

  const msg =
    await generateWAMessage(
      m.chat,
      {
        image: buffer,
        caption
      },
      {
        upload:
          conn.waUploadToServer
      }
    )

  msg.message.messageContextInfo = {

    messageAssociation: {

      associationType: 1,

      parentMessageKey:
        album.key

    }

  }

  await conn.relayMessage(
    m.chat,
    msg.message,
    {
      messageId:
        msg.key.id
    }
  )
}


// ═══════════════════════════════
// 🎯 HANDLER
// ═══════════════════════════════

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


  // ═══════════════════════════════
  // ❌ SIN BÚSQUEDA
  // ═══════════════════════════════

  if (!query) {

    return m.reply(
`✰ 𝙸𝙼𝙰𝙶𝙴𝙽 ✰

✦ 𝙵𝚊𝚕𝚝𝚊 𝚕𝚊 𝚋ú𝚜𝚚𝚞𝚎𝚍𝚊.

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix}${command} Naruto`
    )

  }


  await m.react('🔎')


  try {

    // ═════════════════════════════
    // 🔎 BUSCAR
    // ═════════════════════════════

    const results =
      await searchImages(
        query
      )


    if (!results.length) {

      await m.react('❌')

      return m.reply(
`✰ 𝙸𝙼𝙰𝙶𝙴𝙽 ✰

✦ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚛𝚘𝚗 𝚒𝚖á𝚐𝚎𝚗𝚎𝚜
✦ 𝚙𝚊𝚛𝚊: *${query}*`
      )

    }


    // ═════════════════════════════
    // 🎲 MEZCLAR RESULTADOS
    // ═════════════════════════════

    const shuffled =
      [...results]
        .sort(
          () => Math.random() - 0.5
        )
        .slice(
          0,
          MAX_IMAGES
        )


    // ═════════════════════════════
    // 📦 DESCARGAR IMÁGENES
    // ═════════════════════════════

    const downloaded = []

    for (
      const url of shuffled
    ) {

      try {

        const buffer =
          await downloadImage(
            url
          )

        downloaded.push({
          buffer,
          url
        })

      } catch {}

      if (
        downloaded.length >=
        MAX_IMAGES
      ) break

    }


    if (!downloaded.length) {

      await m.react('❌')

      return m.reply(
`✰ 𝙸𝙼𝙰𝙶𝙴𝙽 ✰

✦ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚒𝚎𝚛𝚘𝚗
✦ 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛 𝚕𝚊𝚜 𝚒𝚖á𝚐𝚎𝚗𝚎𝚜.`
      )

    }


    // ═════════════════════════════
    // 📦 CREAR ÁLBUM
    // ═════════════════════════════

    const album =
      await createAlbum(
        conn,
        m,
        downloaded.length
      )


    // ═════════════════════════════
    // 📤 ENVIAR ÁLBUM
    // ═════════════════════════════

    for (
      let i = 0;
      i < downloaded.length;
      i++
    ) {

      const item =
        downloaded[i]

      await sendAlbumImage(
        conn,
        m,
        album,
        item.buffer,

        i === 0
          ? `✰ 𝙸𝙼Á𝙶𝙴𝙽𝙴𝚂 ✰

✦ 𝙱ú𝚜𝚚𝚞𝚎𝚍𝚊: *${query}*
✦ 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘𝚜: ${downloaded.length}

✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃`
          : ''
      )

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            250
          )
      )

    }


    await m.react('✅')


  } catch (error) {

    await m.react('❌')

    return m.reply(
`✰ 𝙸𝙼𝙰𝙶𝙴𝙽 ✰

✦ 𝙾𝚌𝚞𝚛𝚛𝚒ó 𝚞𝚗 𝚎𝚛𝚛𝚘𝚛.
✦ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛 𝚕𝚊 𝚋ú𝚜𝚚𝚞𝚎𝚍𝚊.

✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 300)}`
    )

  }

}


// ═══════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═══════════════════════════════

handler.help = [
  'imagen <término>',
  'img <término>'
]

handler.tags = [
  'busquedas'
]

handler.command = [
  'img',
  'imagen'
]

export default handler