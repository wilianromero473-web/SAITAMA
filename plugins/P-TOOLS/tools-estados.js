import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Buffer } from 'buffer'

const handler = async (m, { conn }) => {
  try {

    if (!m.quoted) {
      return m.reply(
`༺ ✰ SIN ESTADO ✰ ༻

> ✰ Responde al estado que quieres descargar.
> ✰ Compatible con fotos y videos.`
      )
    }

    const q = m.quoted

    const media =
      q.msg?.message?.videoMessage ||
      q.msg?.message?.imageMessage ||
      q.message?.groupStatusMessageV2?.message?.videoMessage ||
      q.message?.groupStatusMessageV2?.message?.imageMessage

    if (!media) {
      return m.reply(
`༺ ✰ ESTADO NO ENCONTRADO ✰ ༻

> ✰ No encontré una imagen o video en el estado.`
      )
    }

    const mime = media.mimetype || ''

    await m.reply(
`༺ ✰ DESCARGANDO ESTADO ✰ ༻

> ✰ Procesando multimedia...
> ✰ Espera un momento.`
    )

    let buffer

    if (mime.includes('video')) {

      const stream = await downloadContentFromMessage(
        media,
        'video'
      )

      const chunks = []

      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      buffer = Buffer.concat(chunks)
    }

    if (mime.includes('image')) {

      const stream = await downloadContentFromMessage(
        media,
        'image'
      )

      const chunks = []

      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      buffer = Buffer.concat(chunks)
    }

    if (!buffer) {
      return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No pude obtener el archivo del estado.`
      )
    }

    if (mime.includes('video')) {

      await conn.sendMessage(
        m.chat,
        {
          video: buffer,
          caption:
`༺ ✰ ESTADO OBTENIDO ✰ ༻

> ✰ Tipo: Video
> ✰ Descarga completada correctamente.

༺ ✰ SAITAMABOT ✰ ༻`
        },
        {
          quoted: m
        }
      )
    }

    if (mime.includes('image')) {

      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          caption:
`༺ ✰ ESTADO OBTENIDO ✰ ༻

> ✰ Tipo: Imagen
> ✰ Descarga completada correctamente.

༺ ✰ SAITAMABOT ✰ ༻`
        },
        {
          quoted: m
        }
      )
    }

  } catch (e) {

    console.error(
      'ERROR ESTADO:',
      e
    )

    return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo descargar el estado.
> ✰ ${e.message || 'Error desconocido'}`
    )
  }
}

handler.command = [
  'estado',
  'pasa'
]

handler.help = [
  'estado'
]

handler.tags = [
  'tools'
]

export default handler