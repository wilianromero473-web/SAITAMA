import fetch from 'node-fetch'
import config from '../../config.js'


// ═══════════════════════════════════════
// ✰ SAITAMABOT • TIKTOK DOWNLOADER
// ═══════════════════════════════════════

const API_URL =
  'https://api.stellarwa.xyz'

const API_KEY =
  'proyectsV2'


const BOT_NAME =
  config.botName ||
  '𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃'


// ═══════════════════════════════════════
// ✰ HANDLER
// ═══════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    text
  }
) => {

  let url =
    text?.trim() || ''


  // ═════════════════════════════════
  // ✰ OBTENER URL DEL MENSAJE CITADO
  // ═════════════════════════════════

  if (
    !url &&
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

    if (match)
      url =
        match[0]

  }


  // ═════════════════════════════════
  // ✰ SIN URL
  // ═════════════════════════════════

  if (!url) {

    return m.reply(

`༺ 𝚃𝙸𝙺𝚃𝙾𝙺 ༻

✰ 𝙴𝚗𝚟í𝚊 𝚞𝚗 𝚎𝚗𝚕𝚊𝚌𝚎 𝚟á𝚕𝚒𝚍𝚘 𝚍𝚎 𝚃𝚒𝚔𝚃𝚘𝚔.

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
https://www.tiktok.com/@usuario/video/...

✰ ${BOT_NAME}`

    )

  }


  // ═════════════════════════════════
  // ✰ VALIDAR TIKTOK
  // ═════════════════════════════════

  if (
    !/tiktok\.com|vt\.tiktok\.com/i
      .test(url)
  ) {

    return m.reply(

`༺ 𝙴𝚁𝚁𝙾𝚁 𝚃𝙸𝙺𝚃𝙾𝙺 ༻

✰ 𝙴𝚕 𝚎𝚗𝚕𝚊𝚌𝚎 𝚗𝚘 𝚙𝚎𝚛𝚝𝚎𝚗𝚎𝚌𝚎 𝚊 𝚃𝚒𝚔𝚃𝚘𝚔.

✰ 𝙴𝚗𝚟í𝚊 𝚞𝚗 𝚎𝚗𝚕𝚊𝚌𝚎 𝚟á𝚕𝚒𝚍𝚘.

✰ ${BOT_NAME}`

    )

  }


  // ═════════════════════════════════
  // ✰ REACCIÓN INICIAL
  // ═════════════════════════════════

  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '📥',
        key: m.key
      }
    }
  ).catch(() => {})


  try {

    // ═════════════════════════════════
    // ✰ API TIKTOK
    // ═════════════════════════════════

    const api =
      `${API_URL}/dl/tiktok?url=${encodeURIComponent(url)}&key=${API_KEY}`


    const res =
      await fetch(api)


    const json =
      await res.json()


    const data =
      json?.data


    // ═════════════════════════════════
    // ✰ SIN DATOS
    // ═════════════════════════════════

    if (!data) {

      throw new Error(
        'La API no devolvió datos.'
      )

    }


    // ═════════════════════════════════
    // ✰ TIKTOK IMÁGENES
    // ═════════════════════════════════

    if (
      data.type === 'images' &&
      data.images?.length
    ) {

      const album =
        data.images.map(
          (img, i) => ({

            type:
              'image',

            data: {
              url:
                img
            },

            caption:
              i === 0

                ? `༺ 𝚃𝙸𝙺𝚃𝙾𝙺 𝙸𝙼Á𝙶𝙴𝙽𝙴𝚂 ༻

✰ 𝚃í𝚝𝚞𝚕𝚘:
${data.title || 'Sin título'}
✰ 𝙰𝚞𝚝𝚘𝚛:
${data.author?.nickname || 'Desconocido'}
✰ 𝙸𝚖á𝚐𝚎𝚗𝚎𝚜:
${data.images.length}
✰ ${BOT_NAME}`

                : ''

          })
        )


      await conn.sendAlbumMessage(
        m.chat,
        album,
        {
          quoted:
            m
        }
      )


      // ═══════════════════════════════
      // ✰ REACCIÓN FINAL
      // ═══════════════════════════════

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
    // ✰ TIKTOK VIDEO
    // ═════════════════════════════════

    const videoUrl =
      data.download?.hd ||
      data.download?.sd ||
      data.dl


    if (!videoUrl) {

      throw new Error(
        'No se encontró el vídeo para descargar.'
      )

    }


    // ═════════════════════════════════
    // ✰ INFORMACIÓN
    // ═════════════════════════════════

    const {
      id,
      title =
        'Sin título',
      author = {},
      stats = {},
      music = {}
    } = data


    const link =
      author.unique_id
        ? `https://www.tiktok.com/@${author.unique_id}/video/${id}`
        : url


    const caption =

`༺ 𝚃𝙸𝙺𝚃𝙾𝙺 ༻

✰ 𝚃í𝚝𝚞𝚕𝚘:
${title}
✰ 𝙰𝚞𝚝𝚘𝚛:
${author.nickname ||
  author.unique_id ||
  'Desconocido'}
✰ 𝙻𝚒𝚔𝚎𝚜:
${(
  stats.likes || 0
).toLocaleString()}
✰ 𝚅𝚒𝚜𝚝𝚊𝚜:
${(
  stats.views ||
  stats.plays ||
  0
).toLocaleString()}
✰ 𝙲𝚘𝚖𝚙𝚊𝚛𝚝𝚒𝚍𝚘𝚜:
${(
  stats.shares || 0
).toLocaleString()}
✰ 𝙰𝚞𝚍𝚒𝚘:
${music.title ||
  'Desconocido'}
✰ 𝙻𝚒𝚗𝚔:
${link}

✰ ${BOT_NAME}`


    // ═════════════════════════════════
    // ✰ DESCARGAR VIDEO
    // ═════════════════════════════════

    const videoResponse =
      await fetch(videoUrl)


    if (!videoResponse.ok) {

      throw new Error(
        `No se pudo descargar el vídeo (${videoResponse.status}).`
      )

    }


    const video =
      Buffer.from(
        await videoResponse.arrayBuffer()
      )


    if (!video.length) {

      throw new Error(
        'El vídeo descargado está vacío.'
      )

    }


    // ═════════════════════════════════
    // ✰ ENVIAR VIDEO
    // ═════════════════════════════════

    await conn.sendMessage(

      m.chat,

      {

        video,

        mimetype:
          'video/mp4',

        caption

      },

      {

        quoted:
          m

      }

    )


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

    console.error(
      '[TIKTOK ERROR]',
      error?.message ||
      error
    )


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


    return m.reply(

`༺ 𝙴𝚁𝚁𝙾𝚁 𝚃𝙸𝙺𝚃𝙾𝙺 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛 𝚎𝚕 𝚌𝚘𝚗𝚝𝚎𝚗𝚒𝚍𝚘.

✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
${String(
  error?.message ||
  'Error desconocido.'
).slice(0, 350)}

✰ ${BOT_NAME}`

    )

  }

}


// ═══════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═══════════════════════════════════════

handler.help = [
  'tiktok <link>'
]


handler.tags = [
  'descargas'
]


handler.command = [
  'tiktok',
  'tt',
  'ttk',
  'ttkdl',
  'tiktokdl'
]


handler.register = false


export default handler