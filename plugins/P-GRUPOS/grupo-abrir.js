const handler = async (m, { conn }) => {
  try {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')

    return m.reply(
`༺ ✰ 𝙶𝚁𝚄𝙿𝙾 𝙰𝙱𝙸𝙴𝚁𝚃𝙾 ✰ ༻

> ✰ Todos los miembros pueden enviar mensajes.
> ✰ El grupo está abierto nuevamente.`
    )
  } catch {
    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ No pude abrir el grupo.
> ✰ Verificá que el bot sea administrador.`
    )
  }
}

handler.help = ['abrir']
handler.tags = ['group']
handler.command = ['abrir', 'open', 'opengroup']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler