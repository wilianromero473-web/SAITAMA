const handler = async (m, { conn }) => {
  try {
    const code = await conn.groupInviteCode(m.chat)

    return m.reply(
`*✰ LINK DEL GRUPO ༻*

> ✰ Enlace de invitación:
> https://chat.whatsapp.com/${code}`
    )
  } catch {
    return m.reply(
`*✰ ERROR ༻*

> ✰ No pude obtener el enlace del grupo.`
    )
  }
}

handler.help = ['link']
handler.tags = ['group']
handler.command = ['link', 'invitar', 'invite']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler