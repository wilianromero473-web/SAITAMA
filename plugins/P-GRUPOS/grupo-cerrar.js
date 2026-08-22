const handler = async (m, { conn }) => {
  try {
    await conn.groupSettingUpdate(m.chat, 'announcement')

    return m.reply(
`*✰ 𝙶𝚁𝚄𝙿𝙾 𝙲𝙴𝚁𝚁𝙰𝙳𝙾 ༻*

> ✰ Solo los administradores pueden enviar mensajes.`
    )
  } catch {
    return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ༻*

> ✰ No se pudo cerrar el grupo.`
    )
  }
}

handler.help = ['cerrar']
handler.tags = ['group']

handler.command = [
  'cerrar',
  'closegroup',
  'close'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler