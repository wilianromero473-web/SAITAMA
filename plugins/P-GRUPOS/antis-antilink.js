const GROUP_LINK_REGEX = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const CHANNEL_LINK_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i

const channelWarns = new Map()

const handler = async (m, { args, groupDb }) => {
  const option = args[0]?.toLowerCase()

  if (!option) {
    return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 ✰ ༻

> ✰ Estado: ${groupDb.antilink ? '✅ 𝙰𝙲𝚃𝙸𝚅𝙾' : '❌ 𝙸𝙽𝙰𝙲𝚃𝙸𝚅𝙾'}
> ✰ Uso: .antilink on / off`
    )
  }

  if (['on', '1', 'true', 'activar', 'enable'].includes(option)) {
    if (groupDb.antilink) {
      return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 ✰ ༻

> ✰ Ya está activado.`
      )
    }

    groupDb.antilink = true
    await groupDb.save()

    return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾 ✰ ༻

> ✰ Enlaces de grupos: expulsión.
> ✰ Enlaces de canales: advertencia.`
    )
  }

  if (['off', '0', 'false', 'desactivar', 'disable'].includes(option)) {
    if (!groupDb.antilink) {
      return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 ✰ ༻

> ✰ Ya está desactivado.`
      )
    }

    groupDb.antilink = false
    await groupDb.save()

    return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾 ✰ ༻`
    )
  }

  return m.reply(
`༺ ✰ 𝙾𝙿𝙲𝙸Ó𝙽 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ✰ ༻

> ✰ Usa: .antilink on / off`
  )
}

handler.before = async (
  m,
  { conn, isAdmin, isOwner, isBotAdmin, groupDb }
) => {
  if (!m.isGroup || m.fromMe) return false
  if (!groupDb?.antilink) return false
  if (isAdmin || isOwner || !isBotAdmin) return false

  const text = m.body || m.text || ''
  if (!text) return false

  const isGroupLink = GROUP_LINK_REGEX.test(text)
  const isChannelLink = CHANNEL_LINK_REGEX.test(text)

  if (!isGroupLink && !isChannelLink) return false

  const nombre = m.sender.split('@')[0]

  // ✰ ENLACE DE GRUPO
  if (isGroupLink) {
    const groupMatch = text.match(GROUP_LINK_REGEX)

    if (groupMatch) {
      const linkCode = groupMatch[1]
      const currentCode = await conn
        .groupInviteCode(m.chat)
        .catch(() => null)

      if (currentCode && linkCode === currentCode) return false
    }

    try {
      await conn.sendMessage(m.chat, {
        delete: m.key
      })

      await m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 ✰ ༻

> ✰ @${nombre}, no se permiten enlaces de grupos.
> ✰ Serás expulsado del grupo.`,
        { mentions: [m.sender] }
      )

      await conn.groupParticipantsUpdate(
        m.chat,
        [m.sender],
        'remove'
      )
    } catch {}

    return true
  }

  // ✰ ENLACE DE CANAL
  if (isChannelLink) {
    const key = `${m.chat}:${m.sender}`
    const hasWarning = channelWarns.has(key)

    try {
      await conn.sendMessage(m.chat, {
        delete: m.key
      })

      if (!hasWarning) {
        channelWarns.set(key, true)

        await m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 ✰ ༻

> ✰ @${nombre}, los enlaces de canales no están permitidos.
> ✰ Primera advertencia.
> ✰ Otro enlace = expulsión.`,
          { mentions: [m.sender] }
        )
      } else {
        channelWarns.delete(key)

        await m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 ✰ ༻

> ✰ @${nombre} fue expulsado por reincidir.`,
          { mentions: [m.sender] }
        )

        await conn.groupParticipantsUpdate(
          m.chat,
          [m.sender],
          'remove'
        )
      }
    } catch {}

    return true
  }

  return false
}

handler.help = ['antilink <on/off>']
handler.tags = ['group']

handler.command = [
  'antilink',
  'antienlace'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.alwaysBefore = true
handler.noRegister = true

export default handler