import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m

  const isViewOnce =
    q.mtype === 'viewOnceMessageV2' ||
    q.mtype === 'viewOnceMessage' ||
    q.msg?.viewOnce

  if (!m.quoted || !isViewOnce) {
    return m.reply(
`༺ ✰ SIN MENSAJE ✰ ༻

> ✰ Respondé a una imagen, video o audio.
> ✰ El mensaje debe ser de ver una sola vez.`
    )
  }

  await m.react('🔓')

  try {
    const buffer = await q.download()
    const mime = q.msg?.mimetype || ''

    if (!buffer) {
      throw new Error('No se pudo descargar el contenido')
    }

    if (mime.startsWith('audio/')) {
      const tmpDir = './tmp'

      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true })
      }

      const tmpFile = path.join(
        tmpDir,
        `vo_${Date.now()}.mp3`
      )

      try {
        fs.writeFileSync(tmpFile, buffer)

        await conn.sendMessage(
          m.chat,
          {
            audio: { url: tmpFile },
            mimetype: 'audio/mpeg',
            ptt: true
          },
          { quoted: m }
        )
      } finally {
        if (fs.existsSync(tmpFile)) {
          fs.unlinkSync(tmpFile)
        }
      }

      await m.react('✅')

      return
    }

    if (mime.startsWith('video/')) {
      await conn.sendMessage(
        m.chat,
        {
          video: buffer,
          caption:
`༺ ✰ VIDEO RECUPERADO ✰ ༻

> ✰ Tipo: Video
> ✰ Estado: Ver una sola vez
> ✰ Recuperación: Correcta.`
        },
        { quoted: m }
      )

      await m.react('✅')

      return
    }

    if (mime.startsWith('image/')) {
      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          caption:
`༺ ✰ IMAGEN RECUPERADA ✰ ༻

> ✰ Tipo: Imagen
> ✰ Estado: Ver una sola vez
> ✰ Recuperación: Correcta.`
        },
        { quoted: m }
      )

      await m.react('✅')

      return
    }

    throw new Error('Tipo de contenido no compatible')

  } catch (error) {

    await m.react('❌')

    return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo recuperar el contenido.
> ✰ Intentá nuevamente.

> ✰ Error: ${error?.message || 'Desconocido'}`
    )
  }
}

handler.command = [
  'verfoto',
  'verview',
  'verft',
  'vervideo',
  'ver',
  'vervid',
  'veraudio',
  'voaudio'
]

handler.tags = [
  'tools'
]

handler.help = [
  'ver <responder a un mensaje de una sola vez>'
]

export default handler