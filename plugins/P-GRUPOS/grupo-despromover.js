import * as baileysMod from '@whiskeysockets/baileys'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1
  ? baileysMod.default
  : baileysMod

const { jidNormalizedUser } = pkg

const handler = async (m, { conn }) => {
  const user = m.mentionedJid?.[0] || m.quoted?.sender

  if (!user) {
    return m.reply(
`*✰ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙾 ༻*

> ✰ Mencioná o respondé al usuario que querés despromover.`
    )
  }

  const targetJid = jidNormalizedUser(user)
  const targetNum = targetJid.split('@')[0]

  try {
    const { participants } = await conn.groupMetadata(m.chat)

    const target = participants.find(p =>
      jidNormalizedUser(p.id) === targetJid ||
      (p.lid && jidNormalizedUser(p.lid) === targetJid)
    )

    if (!target) {
      return m.reply(
`*✰ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾 ༻*

> ✰ El usuario no pertenece al grupo.`
      )
    }

    if (target.admin !== 'admin' &&
        target.admin !== 'superadmin' &&
        !target.isCommunityAdmin) {
      return m.reply(
`*✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ༻*

> ✰ @${targetNum} no es administrador.`
      )
    }

    if (target.admin === 'superadmin' || target.isCommunityAdmin) {
      return m.reply(
`*✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙱𝙻𝙾𝚀𝚄𝙴𝙰𝙳𝙰 ༻*

> ✰ No puedo despromover al administrador principal.`
      )
    }

    await conn.groupParticipantsUpdate(
      m.chat,
      [targetJid],
      'demote'
    )

    return m.reply(
`*✰ 𝙳𝙴𝚂𝙿𝚁𝙾𝙼𝙾𝚅𝙸𝙳𝙾 ༻*

> ✰ @${targetNum} ya no es administrador.`,
      { mentions: [targetJid] }
    )

  } catch {
    return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ༻*

> ✰ No se pudo quitar el administrador.`
    )
  }
}

handler.help = ['despromover @tag']
handler.tags = ['group']

handler.command = [
  'despromover',
  'demote',
  'deadmin'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler