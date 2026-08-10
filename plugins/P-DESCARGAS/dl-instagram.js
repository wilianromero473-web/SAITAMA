import axios from 'axios'
import config from '../../config.js'

// ━━━━━━━ API INSTAGRAM ━━━━━━━
const API_URL = 'https://api.azbry.com/api/download/instagramv2'
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━


const handler = async (m, { conn, text, usedPrefix, command }) => {

  let url = text?.trim() || ''

  // Si respondió a un mensaje que contiene un enlace
  if (!url && m.quoted) {
    const quotedText = m.quoted.body || m.quoted.text || ''
    const match = quotedText.match(/https?:\/\/[^\s]+/i)

    if (match) {
      url = match[0]
    }
  }


  // ━━━━━━━ SIN URL ━━━━━━━
  if (!url) {
    return m.reply(
`╭━━━〔 ⚠️ ENLACE REQUERIDO 〕━━━╮
> Envía un enlace de Instagram.
Ejemplo:
${usedPrefix + command} https://instagram.com/reel/xxxx
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    )
  }


  // ━━━━━━━ VALIDAR URL ━━━━━━━
  if (!/instagram\.com|instagr\.am/i.test(url)) {
    return m.reply(
`╭━━━〔 ❌ ENLACE INVÁLIDO 〕━━━╮
> El enlace no pertenece a Instagram.
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    )
  }


  await m.reply(
`╭━━━〔 📥 INSTAGRAM 〕━━━╮
> Descargando contenido...
> SaitamaBot procesando 🌸
╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
  )


  try {

    // ━━━━━━━ PETICIÓN A AZBRY ━━━━━━━
    const api =
      `${API_URL}?url=${encodeURIComponent(url)}`

    const { data: json } = await axios.get(api, {
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })


    // ━━━━━━━ VALIDAR RESPUESTA ━━━━━━━
    if (
      !json ||
      json.status !== true ||
      !Array.isArray(json.links) ||
      !json.links.length
    ) {
      return m.reply(
`╭━━━〔 ❌ SIN CONTENIDO 〕━━━╮

> No se encontró contenido.
> Puede ser privado, eliminado o la API no respondió correctamente.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      )
    }


    // Máximo 10 archivos
    const downloads = json.links
      .filter(item => item?.url)
      .slice(0, 10)


    if (!downloads.length) {
      return m.reply(
`╭━━━〔 ❌ ERROR 〕━━━╮

> La API no devolvió enlaces descargables.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      )
    }


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 VIDEO ÚNICO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (
      downloads.length === 1 &&
      downloads[0].type === 'video'
    ) {

      const video = downloads[0]

      const descripcion =
        video.text?.trim() ||
        json.author ||
        'Video de Instagram'


      await conn.sendMessage(
        m.chat,
        {
          video: {
            url: video.url
          },
          mimetype: 'video/mp4',
          caption:
`╭━━━〔 🎬 INSTAGRAM 〕━━━╮

*${descripcion}*

╰━━━━━━━━━━━━━━━━━━━━━━━━╯
🌸 ${config.botName || 'SaitamaBot'}`
        },
        {
          quoted: m
        }
      )

      return
    }


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📸 IMÁGENES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const images = downloads.filter(
      item => item.type === 'image'
    )


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📸 ÁLBUM DE IMÁGENES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (images.length > 1) {

      const album = images.map((image, index) => {

        const caption =
          index === 0
            ? `*${image.text?.trim() || 'Contenido de Instagram'}*

🌸 ${config.botName || 'SaitamaBot'}`
            : ''

        return {
          image: {
            url: image.url
          },
          caption
        }

      })


      // Intentar enviar como álbum
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

        return

      } catch {

        // Si la versión de Baileys no admite album,
        // enviamos las imágenes individualmente.
      }
    }


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📸 IMAGEN ÚNICA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (images.length === 1) {

      const image = images[0]

      const descripcion =
        image.text?.trim() ||
        'Imagen de Instagram'


      await conn.sendMessage(
        m.chat,
        {
          image: {
            url: image.url
          },
          caption:
`╭━━━〔 📸 INSTAGRAM 〕━━━╮
*${descripcion}*
╰━━━━━━━━━━━━━━━━━━━━━━━━╯
🌸 ${config.botName || 'SaitamaBot'}`
        },
        {
          quoted: m
        }
      )

      return
    }


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📦 CONTENIDO MIXTO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    for (const media of downloads) {

      if (!media.url) continue

      const descripcion =
        media.text?.trim() ||
        'Contenido de Instagram'


      if (media.type === 'video') {

        await conn.sendMessage(
          m.chat,
          {
            video: {
              url: media.url
            },
            mimetype: 'video/mp4',
            caption:
`╭━━━〔 🎬 INSTAGRAM 〕━━━╮
*${descripcion}*
╰━━━━━━━━━━━━━━━━━━━━━━━━╯
🌸 ${config.botName || 'SaitamaBot'}`
          },
          {
            quoted: m
          }
        )

      } else {

        await conn.sendMessage(
          m.chat,
          {
            image: {
              url: media.url
            },
            caption:
`╭━━━〔 📸 INSTAGRAM 〕━━━╮
*${descripcion}*
╰━━━━━━━━━━━━━━━━━━━━━━━━╯
🌸 ${config.botName || 'SaitamaBot'}`
          },
          {
            quoted: m
          }
        )
      }
    }


  } catch {

    // Sin console.error / sin logs
    return m.reply(
`╭━━━〔 ❌ ERROR 〕━━━╮

> No se pudo descargar el contenido de Instagram.
> Inténtalo nuevamente en unos segundos.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    )
  }

}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AYUDA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'instagram <link>',
  'ig <link>',
  'reel <link>'
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


export default handler