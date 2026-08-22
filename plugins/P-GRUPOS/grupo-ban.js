import * as baileysMod from '@whiskeysockets/baileys'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1
  ? baileysMod.default
  : baileysMod

const { jidNormalizedUser } = pkg

const handler = async (m, { conn, participants, config }) => {
  const user = m.mentionedJid?.[0] || m.quoted?.sender

  if (!user) {
    return m.reply(
`*✰ 𝙴𝚇𝙿𝚄𝙻𝚂𝙰𝚁 ༻*

> ✰ Mencioná o respondé al usuario que querés expulsar.`
    )
  }

  const botJid = jidNormalizedUser(conn.user.id)
  const targetJid = jidNormalizedUser(user)
  const targetNum = targetJid.split('@')[0].replace(/\D/g, '')

  if (targetJid === botJid) {
    return m.reply(
`*✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ༻*

> ✰ No puedo expulsarme a mí mismo.`
    )
  }

  const owners = Array.isArray(config.ownerNumber)
    ? config.ownerNumber
    : [config.ownerNumber]

  const normalizar = num => {
    let n = String(num || '').replace(/\D/g, '')
    if (n.startsWith('549')) n = '54' + n.slice(3)
    if (n.startsWith('521')) n = '52' + n.slice(3)
    return n
  }

  const esOwner = owners.some(
    owner => normalizar(owner) === normalizar(targetNum)
  )

  if (esOwner) {
    return m.reply(
`*✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙱𝙻𝙾𝚀𝚄𝙴𝙰𝙳𝙰 ༻*

> ✰ No puedo expulsar al dueño del bot.`
    )
  }

  const targetIsAdmin = participants.some(p =>
    (p.admin === 'admin' ||
      p.admin === 'superadmin' ||
      p.isCommunityAdmin) &&
    (
      jidNormalizedUser(p.id) === targetJid ||
      (p.lid && jidNormalizedUser(p.lid) === targetJid)
    )
  )

  if (targetIsAdmin) {
    return m.reply(
`*✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙱𝙻𝙾𝚀𝚄𝙴𝙰𝙳𝙰 ༻*

> ✰ No puedo expulsar a un administrador.`
    )
  }

  try {
    await conn.groupParticipantsUpdate(
      m.chat,
      [targetJid],
      'remove'
    )

    const senderNum = m.sender
      .split('@')[0]
      .replace(/\D/g, '')

    return conn.sendMessage(
      m.chat,
      {
        text:
`*✰ 𝙴𝚇𝙿𝚄𝙻𝚂𝙸Ó𝙽 ༻*

> ✰ Usuario: @${targetNum}
> ✰ Por: @${senderNum}`,
        mentions: [targetJid, m.sender]
      },
      { quoted: m }
    )

  } catch {
    return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ༻*

> ✰ No se pudo expulsar al usuario.`
    )
  }
}

handler.help = ['ban @tag']
handler.tags = ['group']

handler.command = [
  'ban',
  'kick',
  'echar',
  'expulsar'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler