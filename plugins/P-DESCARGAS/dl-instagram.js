import axios from 'axios'
import config from '../../config.js'

// ═══════════════════════════════════════
// ✰ SAITAMABOT • INSTAGRAM DOWNLOADER
// ✰ API: AZBRY
// ═══════════════════════════════════════

const API_URL =
  'https://api.azbry.com/api/download/instagramv2'

const API_TIMEOUT =
  60000


// ═══════════════════════════════════════
// ✰ OBTENER URL
// ═══════════════════════════════════════

function getInstagramUrl(m, text = '') {

  let url =
    String(text || '').trim()

  // Obtener URL desde mensaje citado
  if (!url && m.quoted) {

    const quotedText =
      m.quoted.body ||
      m.quoted.text ||
      ''

    const match =
      quotedText.match(
        /https?:\/\/[^\s]+/i
      )

    if (match) {
      url = match[0]
    }
  }

  // Limpiar caracteres finales
  url =
    url.replace(
      /[)\]}>,]+$/g,
      ''
    )

  return url
}


// ═══════════════════════════════════════
// ✰ VALIDAR INSTAGRAM
// ═══════════════════════════════════════

function isInstagramUrl(url) {

  return /^https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am)\//i
    .test(url)

}


// ═══════════════════════════════════════
// ✰ NOMBRE SEGURO
// ═══════════════════════════════════════

function safeText(value, fallback = '') {

  const text =
    String(value || '')
      .replace(/\s+/g, ' ')
      .trim()

  return text || fallback
}


// ═══════════════════════════════════════
// ✰ CAPTION DE INSTAGRAM
// ═══════════════════════════════════════

function createCaption(
  title,
  type = 'INSTAGRAM'
) {

  return (
`༺ 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼 ༻

✰ 𝚃𝚒𝚙𝚘: ${type}
✰ 𝙸𝚗𝚏𝚘: ${title}

✰ ${config.botName || 'SaitamaBot'}`
  )

}


// ═══════════════════════════════════════
// ✰ ENVIAR VIDEO
// ═══════════════════════════════════════

async function sendVideo(
  conn,
  m,
  media
) {

  const description =
    safeText(
      media.text,
      'Video de Instagram'
    )

  return conn.sendMessage(
    m.chat,
    {

      video: {
        url: media.url
      },

      mimetype:
        'video/mp4',

      caption:
        createCaption(
          description,
          '𝚅𝚒𝚍𝚎𝚘'
        )

    },
    {
      quoted: m
    }
  )
}


// ═══════════════════════════════════════
// ✰ ENVIAR IMAGEN
// ═══════════════════════════════════════

async function sendImage(
  conn,
  m,
  media
) {

  const description =
    safeText(
      media.text,
      'Imagen de Instagram'
    )

  return conn.sendMessage(
    m.chat,
    {

      image: {
        url: media.url
      },

      caption:
        createCaption(
          description,
          '𝙸𝚖𝚊𝚐𝚎𝚗'
        )

    },
    {
      quoted: m
    }
  )
}


// ═══════════════════════════════════════
// ✰ HANDLER PRINCIPAL
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

  const url =
    getInstagramUrl(
      m,
      text
    )


  // ═════════════════════════════════════
  // ✰ SIN URL
  // ═════════════════════════════════════

  if (!url) {

    return m.reply(

`༺ 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼 ༻

✰ 𝙴𝚗𝚕𝚊𝚌𝚎 𝚛𝚎𝚚𝚞𝚎𝚛𝚒𝚍𝚘

✰ 𝙴𝚗𝚟í𝚊 𝚞𝚗 𝚎𝚗𝚕𝚊𝚌𝚎 𝚍𝚎 𝙸𝚗𝚜𝚝𝚊𝚐𝚛𝚊𝚖.

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix}${command} https://instagram.com/reel/xxxx

✰ ${config.botName || 'SaitamaBot'}`
    )
  }


  // ═════════════════════════════════════
  // ✰ URL INVÁLIDA
  // ═════════════════════════════════════

  if (!isInstagramUrl(url)) {

    return m.reply(

`༺ 𝙴𝚗𝚕𝚊𝚌𝚎 𝚒𝚗𝚟á𝚕𝚒𝚍𝚘 ༻

✰ 𝙴𝚕 𝚎𝚗𝚕𝚊𝚌𝚎 𝚗𝚘 𝚙𝚎𝚛𝚝𝚎𝚗𝚎𝚌𝚎 𝚊 𝙸𝚗𝚜𝚝𝚊𝚐𝚛𝚊𝚖.

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix}${command} https://instagram.com/reel/xxxx

✰ ${config.botName || 'SaitamaBot'}`
    )
  }


  // ═════════════════════════════════════
  // ✰ REACCIÓN
  // ═════════════════════════════════════

  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  ).catch(() => {})


  // ═════════════════════════════════════
  // ✰ PROCESANDO
  // ═════════════════════════════════════

  await m.reply(

`༺ 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼 ༻

✰ 𝙰𝚗𝚊𝚕𝚒𝚣𝚊𝚗𝚍𝚘 𝚎𝚗𝚕𝚊𝚌𝚎...
✰ 𝙲𝚘𝚗𝚜𝚞𝚕𝚝𝚊𝚗𝚍𝚘 𝙰𝙿𝙸...
✰ 𝙾𝚋𝚝𝚎𝚗𝚒𝚎𝚗𝚍𝚘 𝚌𝚘𝚗𝚝𝚎𝚗𝚒𝚍𝚘...

✰ ${config.botName || 'SaitamaBot'}`
  )


  try {

    // ═══════════════════════════════════
    // ✰ CONSULTAR API
    // ═══════════════════════════════════

    const api =
      `${API_URL}?url=${encodeURIComponent(url)}`


    const response =
      await axios.get(
        api,
        {
          timeout:
            API_TIMEOUT,

          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',

            Accept:
              'application/json'
          }
        }
      )


    const json =
      response.data


    // ═══════════════════════════════════
    // ✰ VALIDAR RESPUESTA
    // ═══════════════════════════════════

    if (
      !json ||
      json.status !== true ||
      !Array.isArray(json.links) ||
      !json.links.length
    ) {

      return m.reply(

`༺ 𝙎𝚒𝚗 𝚌𝚘𝚗𝚝𝚎𝚗𝚒𝚍𝚘 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛ó 𝚌𝚘𝚗𝚝𝚎𝚗𝚒𝚍𝚘.

✰ 𝙿𝚞𝚎𝚍𝚎 𝚜𝚎𝚛 𝚙𝚛𝚒𝚟𝚊𝚍𝚘, 𝚎𝚕𝚒𝚖𝚒𝚗𝚊𝚍𝚘 𝚘 𝚗𝚘 𝚍𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎.

✰ ${config.botName || 'SaitamaBot'}`
      )
    }


    // ═══════════════════════════════════
    // ✰ MÁXIMO 10 ARCHIVOS
    // ═══════════════════════════════════

    const downloads =
      json.links
        .filter(
          item =>
            item?.url
        )
        .slice(0, 10)


    if (!downloads.length) {

      return m.reply(

`༺ 𝙴𝚛𝚛𝚘𝚛 ༻

✰ 𝙻𝚊 𝙰𝙿𝙸 𝚗𝚘 𝚍𝚎𝚟𝚘𝚕𝚟𝚒ó 𝚎𝚗𝚕𝚊𝚌𝚎𝚜 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚋𝚕𝚎𝚜.

✰ ${config.botName || 'SaitamaBot'}`
      )
    }


    // ═══════════════════════════════════
    // ✰ SEPARAR CONTENIDO
    // ═══════════════════════════════════

    const videos =
      downloads.filter(
        item =>
          item.type === 'video'
      )


    const images =
      downloads.filter(
        item =>
          item.type === 'image'
      )


    // ═══════════════════════════════════
    // ✰ VIDEO ÚNICO
    // ═══════════════════════════════════

    if (
      downloads.length === 1 &&
      downloads[0].type === 'video'
    ) {

      await sendVideo(
        conn,
        m,
        downloads[0]
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


    // ═══════════════════════════════════
    // ✰ ÁLBUM DE IMÁGENES
    // ═══════════════════════════════════

    if (
      images.length > 1
    ) {

      const album =
        images.map(
          (image, index) => {

            const description =
              safeText(
                image.text,
                'Contenido de Instagram'
              )


            return {

              image: {
                url:
                  image.url
              },

              caption:
                index === 0
                  ? createCaption(
                      description,
                      '𝙰𝚕𝚋𝚞𝚖'
                    )
                  : ''

            }

          }
        )


      // Intentar álbum
      try {

        await conn.sendMessage(
          m.chat,
          {
            album
          },
          {
            quoted: m
          }
        )

      } catch {

        // ═══════════════════════════════
        // ✰ FALLBACK
        // ═══════════════════════════════

        for (
          const image of images
        ) {

          await sendImage(
            conn,
            m,
            image
          )
        }
      }


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


    // ═══════════════════════════════════
    // ✰ IMAGEN ÚNICA
    // ═══════════════════════════════════

    if (
      images.length === 1 &&
      videos.length === 0
    ) {

      await sendImage(
        conn,
        m,
        images[0]
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


    // ═══════════════════════════════════
    // ✰ CONTENIDO MIXTO
    // ═══════════════════════════════════

    for (
      const media of downloads
    ) {

      if (!media?.url) {
        continue
      }


      if (
        media.type === 'video'
      ) {

        await sendVideo(
          conn,
          m,
          media
        )

      } else {

        await sendImage(
          conn,
          m,
          media
        )
      }
    }


    // ═══════════════════════════════════
    // ✰ REACCIÓN FINAL
    // ═══════════════════════════════════

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

    // ═══════════════════════════════════
    // ✰ ERROR
    // ═══════════════════════════════════

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

`༺ 𝙴𝚛𝚛𝚘𝚛 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛 𝚎𝚕 𝚌𝚘𝚗𝚝𝚎𝚗𝚒𝚍𝚘.

✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎 𝚌𝚘𝚗 𝚘𝚝𝚛𝚘 𝚎𝚗𝚕𝚊𝚌𝚎.

✰ ${String(
  error?.message ||
  'Error desconocido'
).slice(0, 300)}

✰ ${config.botName || 'SaitamaBot'}`
    )
  }
}


// ═══════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═══════════════════════════════════════

handler.help = [

  'instagram <link>',
  'ig <link>',
  'reel <link>',
  'igdl <link>',
  'instagramdl <link>'

]


handler.tags = [
  'descargas'
]


handler.command = [

  'ig',
  'instagram',
  'reel',
  'igdl',
  'instagramdl'

]


handler.register = false


export default handler