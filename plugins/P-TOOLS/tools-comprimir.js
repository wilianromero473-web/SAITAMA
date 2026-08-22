import fetch from 'node-fetch'
import { upload } from '@axel-dev09/zen-dl'

const handler = async (m, { conn, text }) => {
  let buffer

  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    if (mime.startsWith('image/')) {
      buffer = await q.download()

    } else if (
      text &&
      /^https?:\/\/.*\.(jpe?g|png|gif)(\?.*)?$/i.test(text)
    ) {
      const res = await fetch(text)

      if (!res.ok) {
        throw new Error('No se pudo descargar la imagen')
      }

      buffer = Buffer.from(
        await res.arrayBuffer()
      )

    } else {
      return m.reply(
`༺ ✰ SIN IMAGEN ✰ ༻

> ✰ Responde a una imagen
> ✰ O envía un enlace directo de imagen.`
      )
    }

    await m.react('📤')

    const { url } = await upload(
      buffer,
      `compress_${Date.now()}.jpg`
    )

    const response = await fetch(
      `https://api.siputzx.my.id/api/iloveimg/compress?image=${encodeURIComponent(url)}`
    )

    if (!response.ok) {
      throw new Error('Error al comprimir la imagen')
    }

    const compressed = Buffer.from(
      await response.arrayBuffer()
    )

    await conn.sendMessage(
      m.chat,
      {
        image: compressed,
        caption:
`༺ ✰ IMAGEN COMPRIMIDA ✰ ༻

> ✰ La imagen fue comprimida correctamente.
> ✰ SaitamaBot`
      },
      {
        quoted: m
      }
    )

    await m.react('✅')

  } catch (error) {

    await m.react('❌')

    return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo completar la compresión.
> ✰ Inténtalo nuevamente.`
    )
  }
}

handler.help = [
  'comprimir <imagen/url>',
  'compress <imagen/url>'
]

handler.tags = [
  'tools'
]

handler.command = [
  'comprimir',
  'compress'
]

export default handler