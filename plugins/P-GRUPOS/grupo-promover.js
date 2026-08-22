import * as baileysMod from '@whiskeysockets/baileys'

const pkg =
  baileysMod.default && Object.keys(baileysMod).length === 1
    ? baileysMod.default
    : baileysMod

const { jidNormalizedUser } = pkg

const handler = async (m, { conn }) => {
  const user =
    m.mentionedJid[0] ||
    (m.quoted ? m.quoted.sender : null)

  if (!user) {
    return m.reply(
`*✰ 𝙐𝚂𝚄𝙰𝚁𝙸𝙾 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙾 ༻*

> ✰ Mencioná o respondé el mensaje del usuario que querés promover.`
    )
  }

  const targetJid = jidNormalizedUser(user)
  const targetNum = targetJid.split('@')[0]

  try {
    await conn.groupParticipantsUpdate(
      m.chat,
      [targetJid],
      'promote'
    )

    return m.reply(
`*✰ 𝙰𝙳𝙼𝙸𝙽 𝙿𝚁𝙾𝙼𝙾𝚅𝙸𝙳𝙾 ༻*

> ✰ Usuario: @${targetNum}
> ✰ Nuevo rango: *𝙰𝙳𝙼𝙸𝙽𝙸𝚂𝚃𝚁𝙰𝙳𝙾𝚁*`,
      { mentions: [targetJid] }
    )
  } catch {
    return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ༻*

> ✰ No se pudo promover al usuario.`
    )
  }
}

handler.help = ['promover @tag']
handler.tags = ['group']
handler.command = [
  'promover',
  'promote',
  'admin'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler