import fetch from 'node-fetch'
import * as baileysMod from '@whiskeysockets/baileys'
import config from '../../config.js'


// ═══════════════════════════════════════
// ✰ SAITAMABOT • PINTEREST
// ═══════════════════════════════════════

const API_URL =
  'https://api.stellarwa.xyz'

const API_KEY =
  'proyectsV2'


// ═══════════════════════════════════════
// ✰ BAILEYS
// ═══════════════════════════════════════

const pkg =
  baileysMod.default &&
  Object.keys(baileysMod).length === 1
    ? baileysMod.default
    : baileysMod


const {
  generateWAMessageFromContent,
  generateWAMessage
} = pkg


// ═══════════════════════════════════════
// ✰ NOMBRE DEL BOT
// ═══════════════════════════════════════

const BOT_NAME =
  config.botName ||
  '𝑺𝒂𝒊𝒕𝒂𝒎𝒂𝑩𝒐𝒕'


// ═══════════════════════════════════════
// ✰ HANDLER
// ═══════════════════════════════════════

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


  // ═══════════════════════════════════
  // ✰ SIN TEXTO
  // ═══════════════════════════════════

  if (!query) {

    return m.reply(

`༺ 𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 ༻

✰ 𝚄𝚜𝚊:
${usedPrefix}${command} <texto>

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix}${command} Sakura

✰ ${BOT_NAME}`
    )
  }


  // ═══════════════════════════════════
  // ✰ REACCIÓN
  // ═══════════════════════════════════

  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  ).catch(() => {})


  try {

    const isUrl =
      /^https?:\/\//i.test(
        query
      )


    // ═════════════════════════════════
    // ✰ DESCARGAR PIN
    // ═════════════════════════════════

    if (isUrl) {

      if (
        !/pinterest\./i.test(
          query
        )
      ) {

        return m.reply(

`༺ 𝙴𝙽𝙻𝙰𝙲𝙴 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾 ༻

✰ 𝙳𝚎𝚋𝚎𝚜 𝚞𝚜𝚊𝚛
𝚞𝚗 𝚎𝚗𝚕𝚊𝚌𝚎 𝚍𝚎 𝙿𝚒𝚗𝚝𝚎𝚛𝚎𝚜𝚝.

✰ ${BOT_NAME}`
        )
      }


      const api =
        `${API_URL}/dl/pinterest` +
        `?url=${encodeURIComponent(query)}` +
        `&key=${API_KEY}`


      const response =
        await fetch(
          api
        )


      if (!response.ok) {

        throw new Error(
          `API HTTP ${response.status}`
        )
      }


      const json =
        await response.json()


      const data =
        json?.data


      if (!data?.dl) {

        return m.reply(

`༺ 𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛ó
𝚌𝚘𝚗𝚝𝚎𝚗𝚒𝚍𝚘.

✰ ${BOT_NAME}`
        )
      }


      const type =
        data.type === 'image'
          ? 'image'
          : data.type === 'video'
            ? 'video'
            : 'document'


      await conn.sendMessage(
        m.chat,
        {
          [type]: {
            url:
              data.dl
          },

          caption:

`༺ 𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 ༻

✰ 𝙰𝚛𝚌𝚑𝚒𝚟𝚘 𝚕𝚒𝚜𝚝𝚘.

✰ ${BOT_NAME}`
        },
        {
          quoted:
            m
        }
      )


      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '✅',
            key: m.key
          }
        }
      ).catch(() => {})


      return
    }


    // ═════════════════════════════════
    // ✰ BUSCAR PINTEREST
    // ═════════════════════════════════

    const api =
      `${API_URL}/search/pinterest` +
      `?query=${encodeURIComponent(query)}` +
      `&key=${API_KEY}`


    const response =
      await fetch(
        api
      )


    if (!response.ok) {

      throw new Error(
        `API HTTP ${response.status}`
      )
    }


    const json =
      await response.json()


    const results =
      Array.isArray(
        json?.data
      )
        ? json.data
        : []


    if (!results.length) {

      return m.reply(

`༺ 𝚂𝙸𝙽 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 ༻

✰ 𝙽𝚘 𝚎𝚗𝚌𝚘𝚗𝚝𝚛é:
${query}

✰ ${BOT_NAME}`
      )
    }


    // ═════════════════════════════════
    // ✰ PREPARAR RESULTADOS
    // ═════════════════════════════════

    const medias =
      results
        .slice(
          0,
          10
        )
        .map(
          img => ({

            url:
              img?.hd ||
              img?.url,

            caption:

`༺ 𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 ༻

✰ ${img?.title || 'Imagen'}

✰ ${BOT_NAME}`
          })
        )
        .filter(
          img =>
            img.url
        )


    if (!medias.length) {

      return m.reply(

`༺ 𝙴𝚁𝚁𝙾𝚁 ༻

✰ 𝙽𝚘 𝚑𝚊𝚢 𝚒𝚖á𝚐𝚎𝚗𝚎𝚜.

✰ ${BOT_NAME}`
      )
    }


    // ═════════════════════════════════
    // ✰ ÁLBUM
    // ═════════════════════════════════

    const album =
      generateWAMessageFromContent(
        m.chat,
        {
          albumMessage: {

            expectedImageCount:
              medias.length,

            contextInfo: {

              stanzaId:
                m.key.id,

              participant:
                m.key.participant ||
                m.chat,

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


    // ═════════════════════════════════
    // ✰ ENVIAR IMÁGENES
    // ═════════════════════════════════

    for (
      const img of medias
    ) {

      try {

        const imageResponse =
          await fetch(
            img.url
          )


        if (
          !imageResponse.ok
        ) {
          continue
        }


        const buffer =
          Buffer.from(
            await imageResponse.arrayBuffer()
          )


        if (!buffer.length) {
          continue
        }


        const imageMsg =
          await generateWAMessage(
            m.chat,
            {
              image:
                buffer,

              caption:
                img.caption
            },
            {
              upload:
                conn.waUploadToServer
            }
          )


        imageMsg.message
          .messageContextInfo = {

          messageAssociation: {

            associationType:
              1,

            parentMessageKey:
              album.key
          }
        }


        await conn.relayMessage(
          m.chat,
          imageMsg.message,
          {
            messageId:
              imageMsg.key.id
          }
        )


      } catch {
        continue
      }
    }


    // ═════════════════════════════════
    // ✰ REACCIÓN FINAL
    // ═════════════════════════════════

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

    // ═════════════════════════════════
    // ✰ REACCIÓN ERROR
    // ═════════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})


    // ═════════════════════════════════
    // ✰ ERROR
    // ═════════════════════════════════

    const errorText =
      String(
        error?.message ||
        'Error desconocido.'
      ).slice(
        0,
        150
      )


    return m.reply(

`༺ 𝙴𝚁𝚁𝙾𝚁 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛.

✰ ${errorText}

✰ ${BOT_NAME}`
    )
  }
}


// ═══════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═══════════════════════════════════════

handler.help = [
  'pin <texto>',
  'pinterest <texto>'
]


handler.tags = [
  'descargas'
]


handler.command = [
  'pin',
  'pinterest'
]


handler.register = false


export default handler