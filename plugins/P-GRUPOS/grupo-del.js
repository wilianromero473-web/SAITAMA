const handler = async (m, { conn }) => {
  if (!m.quoted) {
    return m.reply(
`*✰ 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙾 ༻*

> ✰ Respondé al mensaje que querés eliminar.`
    )
  }

  try {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.quoted.id,
        participant: m.quoted.author
      }
    })

    return m.reply(
`*✰ 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾 ༻*

> ✰ El mensaje fue eliminado correctamente.`
    )

  } catch {
    return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ༻*

> ✰ No se pudo eliminar el mensaje.`
    )
  }
}

handler.help = ['del']
handler.tags = ['group']

handler.command = [
  'del',
  'delete',
  'borrar'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler