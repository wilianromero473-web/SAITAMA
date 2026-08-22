const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
`*✰ 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝙲𝙸Ó𝙽 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙰 ༻*

> ✰ Uso: *${usedPrefix}${command} <descripción>*
> ✰ Ejemplo: *${usedPrefix}${command} Bienvenidos al grupo*`
    )
  }

  try {
    await conn.groupUpdateDescription(m.chat, text)

    return m.reply(
`*✰ 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝙲𝙸Ó𝙽 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙰 ༻*

> ✰ Nueva descripción:
> ${text}`
    )
  } catch {
    return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ༻*

> ✰ No se pudo actualizar la descripción.`
    )
  }
}

handler.help = ['desc <texto>']
handler.tags = ['group']

handler.command = [
  'desc',
  'descripcion',
  'setdesc'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler