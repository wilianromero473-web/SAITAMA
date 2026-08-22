const MEDIA_CONFIG = {
  antinotadevoz: {
    emoji: '🎙️',
    name: '𝙰𝙽𝚃𝙸 𝙽𝙾𝚃𝙰',
    dbKey: 'antinotadevoz',
    msg: 'las notas de voz'
  },
  antisticker: {
    emoji: '🎭',
    name: '𝙰𝙽𝚃𝙸 𝚂𝚃𝙸𝙲𝙺𝙴𝚁',
    dbKey: 'antisticker',
    msg: 'los stickers'
  },
  antivideo: {
    emoji: '🎬',
    name: '𝙰𝙽𝚃𝙸 𝚅𝙸𝙳𝙴𝙾',
    dbKey: 'antivideo',
    msg: 'los videos'
  },
  antiimagen: {
    emoji: '🖼️',
    name: '𝙰𝙽𝚃𝙸 𝙸𝙼𝙰𝙶𝙴𝙽',
    dbKey: 'antiimagen',
    msg: 'las imágenes'
  }
}

const MODOS = [
  'on',
  '1',
  'true',
  'activar',
  'off',
  '0',
  'false',
  'desactivar'
]

const ACTIVAR = [
  'on',
  '1',
  'true',
  'activar'
]

const handler = async (m, {
  args,
  groupDb,
  usedPrefix,
  command
}) => {

  const conf = MEDIA_CONFIG[command]
  if (!conf) return

  const modo = args[0]?.toLowerCase()

  if (!MODOS.includes(modo)) {
    return m.reply(
`𝙰𝙽𝚃𝙸 𝙼𝙴𝙳𝙸𝙰 ༻

✰ 𝚄𝚂𝙾
> ${usedPrefix}${command} on
> ${usedPrefix}${command} off

✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾
> ${usedPrefix}${command} on`
    )
  }

  const activar = ACTIVAR.includes(modo)

  groupDb[conf.dbKey] = activar
  await groupDb.save()

  return m.reply(
`𝙰𝙽𝚃𝙸 𝙼𝙴𝙳𝙸𝙰 ༻

✰ ${conf.emoji} ${conf.name}
> ✰ 𝙴𝚂𝚃𝙰𝙳𝙾: *${activar ? '𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾' : '𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾'}*`
  )
}

handler.before = async (
  m,
  { conn, isAdmin, isOwner, groupDb }
) => {

  if (
    !m.isGroup ||
    m.fromMe ||
    isAdmin ||
    isOwner ||
    !groupDb ||
    !m.mtype
  ) return false

  const sender = m.sender
  const numero = sender.split('@')[0]

  const checks = [
    {
      flag: 'antinotadevoz',
      match:
        m.mtype === 'audioMessage' &&
        m.msg?.ptt === true
    },
    {
      flag: 'antisticker',
      match:
        m.mtype === 'stickerMessage'
    },
    {
      flag: 'antivideo',
      match:
        m.mtype === 'videoMessage' &&
        !m.msg?.gifPlayback
    },
    {
      flag: 'antiimagen',
      match:
        m.mtype === 'imageMessage'
    }
  ]

  for (const { flag, match } of checks) {

    if (!match || !groupDb[flag]) continue

    const conf = MEDIA_CONFIG[flag]

    try {
      await conn.sendMessage(
        m.chat,
        { delete: m.key }
      )
    } catch {}

    await conn.sendMessage(
      m.chat,
      {
        text:
`𝙰𝙽𝚃𝙸 𝙼𝙴𝙳𝙸𝙰 ༻

✰ ${conf.emoji} @${numero}
> ✰ ${conf.msg} no están permitidos.`
        ,
        mentions: [sender]
      }
    )

    return true
  }

  return false
}

handler.help = [
  'antinotadevoz',
  'antisticker',
  'antivideo',
  'antiimagen'
]

handler.tags = ['group']

handler.command = [
  'antinotadevoz',
  'antisticker',
  'antivideo',
  'antiimagen'
]

handler.groupOnly = true
handler.adminOnly = true
handler.alwaysBefore = true
handler.noRegister = true

export default handler