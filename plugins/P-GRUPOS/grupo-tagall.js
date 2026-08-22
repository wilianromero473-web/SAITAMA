const handler = async (m, { conn, text, participants }) => {
  const mentions = participants.map(p => p.id)
  const mensaje = text || '📢 Atención a todos.'

  const lista = participants
    .map(p => `> ✰ @${p.id.split('@')[0]}`)
    .join('\n')

  const txt = `*✰ 𝚃𝙰𝙶 𝙰𝙻𝙻 ༻*

> ✰ 𝙼𝙴𝙽𝚂𝙰𝙹𝙴: ${mensaje}

${lista}

*✰ 𝙵𝙸𝙽 𝙳𝙴 𝙻𝙰 𝙼𝙴𝙽𝙲𝙸𝙾𝙽 ༻*`

  await conn.sendMessage(
    m.chat,
    { text: txt, mentions },
    { quoted: m }
  )
}

handler.help = ['tagall']
handler.tags = ['group']
handler.command = [
  'tagall',
  'mencionartodos',
  'invocar',
  'todos'
]

handler.groupOnly = true
handler.adminOnly = true
handler.noRegister = true

export default handler