const handler = async (m, {
  args,
  groupDb,
  usedPrefix,
  command
}) => {

  const modo = args[0]?.toLowerCase()

  const modos = [
    'on',
    '1',
    'true',
    'activar',
    'off',
    '0',
    'false',
    'desactivar'
  ]

  if (!modos.includes(modo)) {
    return m.reply(
`𝙰𝙽𝚃𝙸 𝙼𝙴𝙽𝙲𝙸𝙾𝙽 ༻

✰ 𝚄𝚂𝙾
> ${usedPrefix}${command} on
> ${usedPrefix}${command} off`
    )
  }

  const activar = [
    'on',
    '1',
    'true',
    'activar'
  ].includes(modo)

  groupDb.antimenciongp = activar
  await groupDb.save()

  return m.reply(
`𝙰𝙽𝚃𝙸 𝙼𝙴𝙽𝙲𝙸𝙾𝙽 ༻

✰ 📢 𝙰𝙽𝚃𝙸 𝙴𝚃𝙸𝚀𝚄𝙴𝚃𝙰
> ✰ 𝙴𝚂𝚃𝙰𝙳𝙾: *${activar ? '𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾' : '𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾'}*`
  )
}

handler.before = async (m, { conn }) => {

  if (m.chat !== 'status@broadcast') return false

  const groupMentions = m.msg?.contextInfo?.groupMentions

  if (!groupMentions?.length) return false

  const sender = m.sender
  const numero = sender.split('@')[0]

  for (const grupo of groupMentions) {

    const groupJid =
      typeof grupo === 'string'
        ? grupo
        : (
          grupo?.groupJid ||
          grupo?.jid ||
          ''
        )

    if (
      !groupJid ||
      !groupJid.endsWith('@g.us')
    ) continue

    const targetGroupDb = await import(
      '../../lib/database/models/zen-groups.js'
    ).then(
      M => M.default.findOne({
        id: groupJid
      }).lean()
    )

    if (!targetGroupDb?.antimenciongp) continue

    let meta

    try {
      meta = await conn.groupMetadata(groupJid)
    } catch {}

    const participantes =
      meta?.participants || []

    const senderEnGrupo =
      participantes.find(p => {
        const jid = p.id?.includes(':')
          ? `${p.id.split(':')[0]}@s.whatsapp.net`
          : p.id

        return jid === sender
      })

    // Administradores no son expulsados
    if (senderEnGrupo?.admin) continue

    try {
      await conn.groupParticipantsUpdate(
        groupJid,
        [sender],
        'remove'
      )
    } catch {}

    await conn.sendMessage(
      groupJid,
      {
        text:
`𝙰𝙽𝚃𝙸 𝙼𝙴𝙽𝙲𝙸𝙾𝙽 ༻

✰ 📢 @${numero}
> ✰ 𝙴𝚇𝙿𝚄𝙻𝚂𝙰𝙳𝙾
> ✰ Etiquetaste este grupo en tu estado.`,
        mentions: [sender]
      }
    )
  }

  return false
}

handler.help = [
  'antimenciongp <on/off>'
]

handler.tags = ['group']

handler.command = [
  'antimenciongp'
]

handler.adminOnly = true
handler.alwaysBefore = true
handler.noRegister = true

export default handler