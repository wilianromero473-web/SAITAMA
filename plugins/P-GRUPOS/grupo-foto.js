import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Jimp } from 'jimp'

const handler = async (m, { conn }) => {
  const msg = m.quoted || m

  if (msg.mtype !== 'imageMessage') {
    return m.reply(
`*✰ 𝙸𝙼𝙰𝙶𝙴𝙽 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙰 ༻*

> ✰ Respondé a una imagen para cambiar la foto del grupo.`
    )
  }

  try {
    const imageMsg = msg.message?.imageMessage || msg.msg
    const stream = await downloadContentFromMessage(imageMsg, 'image')

    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)

    const buffer = Buffer.concat(chunks)
    const img = await Jimp.read(buffer)

    const { width, height } = img.bitmap
    const size = Math.min(width, height)

    img.crop({
      x: (width - size) / 2,
      y: (height - size) / 2,
      w: size,
      h: size
    })

    img.resize({ w: 640, h: 640 })

    const finalBuffer = await img.getBuffer('image/jpeg')

    await conn.updateProfilePicture(m.chat, finalBuffer)

    return m.reply(
`*✰ 𝙵𝙾𝚃𝙾 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙰 ༻*

> ✰ La foto del grupo fue cambiada correctamente.`
    )

  } catch (e) {
    return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ༻*

> ✰ No se pudo cambiar la foto del grupo.
> ✰ ${e.message}`
    )
  }
}

handler.help = ['fotog']
handler.tags = ['group']

handler.command = [
  'fotog',
  'setfoto',
  'groupfoto'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler