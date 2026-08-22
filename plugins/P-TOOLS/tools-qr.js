import { qrGenerate } from '@axel-dev09/zen-dl'

const handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) {
    return m.reply(
`༺ ✰ USO ✰ ༻

> ✰ ${usedPrefix + command} <texto o link>
> ✰ Ejemplo: ${usedPrefix + command} https://google.com`
    )
  }

  await m.react('🔎')

  try {
    const contenido = text.trim()

    const qr = await qrGenerate(contenido, 300)

    if (!qr?.buffer) {
      throw new Error('No se recibió la imagen QR')
    }

    await conn.sendMessage(
      m.chat,
      {
        image: qr.buffer,
        caption:
`༺ ✰ CÓDIGO QR ✰ ༻

> ✰ Estado: Generado correctamente.
> ✰ Contenido: ${contenido}

༺ ✰ SAITAMABOT ✰ ༻

> ✰ Código QR listo para escanear.`
      },
      { quoted: m }
    )

    await m.react('✅')

  } catch (error) {

    await m.react('❌')

    return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo generar el código QR.
> ✰ Intentá nuevamente.

> ✰ Error: ${error?.message || 'Desconocido'}`
    )
  }
}

handler.command = [
  'qrcode',
  'qr'
]

handler.tags = [
  'tools'
]

handler.help = [
  'qr <texto>',
  'qrcode <texto>'
]

export default handler