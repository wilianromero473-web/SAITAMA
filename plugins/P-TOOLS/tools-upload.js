import { upload } from '@axel-dev09/zen-dl'

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!mime.startsWith('image/')) {
    return m.reply(
`༺ ✰ SIN IMAGEN ✰ ༻

> ✰ Respondé a una imagen
> ✰ O enviá una imagen junto con:
> ✰ ${usedPrefix}${command}`
    )
  }

  await m.react('📤')

  await m.reply(
`༺ ✰ SUBIENDO IMAGEN ✰ ༻

> ✰ Preparando imagen...
> ✰ Subiendo al servidor...
> ✰ Espera un momento.`
  )

  try {
    const buffer = await q.download()

    if (!buffer) {
      throw new Error('No se pudo descargar la imagen')
    }

    const result = await upload(
      buffer,
      `image_${Date.now()}.jpg`
    )

    const url = result?.url

    if (!url) {
      throw new Error('No se recibió una URL')
    }

    await m.react('✅')

    return m.reply(
`༺ ✰ IMAGEN SUBIDA ✰ ༻

> ✰ Estado: Correcto
> ✰ Enlace:
> ✰ ${url}

༺ ✰ INFORMACIÓN ✰ ༻

> ✰ Tu imagen ya está disponible mediante el enlace.`
    )

  } catch (error) {

    await m.react('❌')

    return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo completar la carga.
> ✰ Intentá nuevamente.

> ✰ Error: ${error?.message || 'Desconocido'}`
    )
  }
}

handler.command = [
  'imgbb',
  'upload'
]

handler.tags = [
  'tools'
]

handler.help = [
  'upload <responder a imagen>',
  'imgbb <responder a imagen>'
]

export default handler