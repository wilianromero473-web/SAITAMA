const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
`*✰ NOMBRE REQUERIDO ༻*

> ✰ Uso: ${usedPrefix}${command} <nuevo nombre>
> ✰ Ejemplo: ${usedPrefix}${command} Saitama Fans`
    )
  }

  try {
    await conn.groupUpdateSubject(m.chat, text)

    return m.reply(
`*✰ NOMBRE ACTUALIZADO ༻*

> ✰ Nuevo nombre: *${text}*`
    )
  } catch {
    return m.reply(
`*✰ ERROR ༻*

> ✰ No se pudo cambiar el nombre del grupo.`
    )
  }
}

handler.help = ['nombre <texto>']
handler.tags = ['group']
handler.command = ['nombre', 'groupname', 'setnombre']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler