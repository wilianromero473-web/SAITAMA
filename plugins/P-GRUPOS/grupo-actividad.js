import fs from 'fs'
import path from 'path'
import * as baileysMod from '@whiskeysockets/baileys'
import config from '../../config.js'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1
  ? baileysMod.default
  : baileysMod

const { jidNormalizedUser } = pkg

const DATA_DIR = path.resolve('./lib/database/data/activity')
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const writeQueue = new Map()
const memCache = new Map()

function getFilePath(groupId) {
  return path.join(DATA_DIR, `${groupId.replace('@g.us', '')}.json`)
}

function readActivity(groupId) {
  try {
    const file = getFilePath(groupId)
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'))
    }
  } catch {}
  return {}
}

function scheduleWrite(groupId, data) {
  if (writeQueue.has(groupId)) return

  writeQueue.set(
    groupId,
    setTimeout(() => {
      writeQueue.delete(groupId)

      try {
        fs.writeFileSync(
          getFilePath(groupId),
          JSON.stringify(data, null, 2)
        )
      } catch {}
    }, 3000)
  )
}

function getCache(groupId) {
  if (!memCache.has(groupId)) {
    memCache.set(groupId, readActivity(groupId))
  }

  return memCache.get(groupId)
}

function resolveJid(participant) {
  if (participant.phoneNumber) {
    const num = participant.phoneNumber

    return jidNormalizedUser(
      num.includes('@')
        ? num
        : `${num}@s.whatsapp.net`
    )
  }

  if (!participant.id?.endsWith('@lid')) {
    return jidNormalizedUser(participant.id)
  }

  return null
}

const handler = async (
  m,
  {
    conn,
    participants,
    isAdmin,
    isOwner,
    args,
    command
  }
) => {
  if (!m.isGroup) {
    return m.reply(
`༺ ✰ 𝙎𝙊𝙇𝙊 𝙂𝙍𝙐𝙋𝙊𝙎 ✰ ༻

> ✰ Este comando solo funciona en grupos.`
    )
  }

  const sub = (args[0] || '').toLowerCase()

  // ━━━━━━━ RESET ━━━━━━━

  if (sub === 'reset') {
    if (!isAdmin && !isOwner) {
      return m.reply(
`༺ ✰ 𝙎𝙊𝙇𝙊 𝘼𝘿𝙈𝙄𝙉𝙎 ✰ ༻

> ✰ Necesitás ser administrador para reiniciar la actividad.`
      )
    }

    memCache.set(m.chat, {})

    try {
      fs.writeFileSync(getFilePath(m.chat), '{}')
    } catch {}

    return m.reply(
`༺ ✰ 𝘼𝘾𝙏𝙄𝙑𝙄𝘿𝘼𝘿 𝙍𝙀𝙄𝙉𝙄𝘾𝙄𝘼𝘿𝘼 ✰ ༻

> ✰ El contador del grupo fue reiniciado correctamente.`
    )
  }

  const data = getCache(m.chat)
  const mentions = []

  const esInactivos = [
    'inactivos',
    'inactive',
    'nulos'
  ].includes(command)

  // ━━━━━━━ INACTIVOS ━━━━━━━

  if (esInactivos) {
    const botJid = jidNormalizedUser(conn.user.id)

    const umbral =
      Number.isInteger(parseInt(args[0])) &&
      parseInt(args[0]) >= 0
        ? parseInt(args[0])
        : 0

    const inactivos = participants
      .filter(participant => {
        const jid = resolveJid(participant)

        if (!jid || jid === botJid) return false

        return (data[jid] || 0) <= umbral
      })
      .sort(
        (a, b) =>
          (data[resolveJid(a)] || 0) -
          (data[resolveJid(b)] || 0)
      )
      .slice(0, 20)

    if (!inactivos.length) {
      return m.reply(
`༺ ✰ 𝙎𝙄𝙉 𝙍𝙀𝙎𝙐𝙇𝙏𝘼𝘿𝙊𝙎 ✰ ༻

> ✰ Ningún miembro tiene ${umbral} mensaje${umbral === 1 ? '' : 's'} o menos.`
      )
    }

    const titulo =
      umbral === 0
        ? '𝙎𝙄𝙉 𝙈𝙀𝙉𝙎𝘼𝙅𝙀𝙎'
        : `${umbral} 𝙈𝙎𝙂𝙎 𝙊 𝙈𝙀𝙉𝙊𝙎`

    let txt =
`༺ ✰ 𝙄𝙉𝘼𝘾𝙏𝙄𝙑𝙊𝙎 ✰ ༻

> ✰ ${titulo}

`

    inactivos.forEach((participant, index) => {
      const jid = resolveJid(participant)
      const msgs = data[jid] || 0

      mentions.push(jid)

      txt +=
        `> ✰ *${index + 1}.* @${jid.split('@')[0]} — ${msgs} msgs\n`
    })

    txt +=
`
> ✰ Encontrados: *${inactivos.length}*
> ✰ Total del grupo: *${participants.length}*

༺ ✰ ${config.footer} ✰ ༻`

    return conn.sendMessage(
      m.chat,
      { text: txt, mentions },
      { quoted: m }
    )
  }

  // ━━━━━━━ ACTIVIDAD ━━━━━━━

  const sorted = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)

  if (!sorted.length) {
    return m.reply(
`༺ ✰ 𝙎𝙄𝙉 𝘿𝘼𝙏𝙊𝙎 ✰ ༻

> ✰ Todavía no hay actividad registrada en este grupo.`
    )
  }

  const totalMsgs = Object.values(data)
    .reduce((a, b) => a + b, 0)

  const medals = ['🥇', '🥈', '🥉']

  let txt =
`༺ ✰ 𝘼𝘾𝙏𝙄𝙑𝙄𝘿𝘼𝘿 ✰ ༻

> ✰ 𝙈𝘼́𝙎 𝘼𝘾𝙏𝙄𝙑𝙊𝙎

`

  sorted.forEach(([jid, count], index) => {
    mentions.push(jid)

    txt +=
      `> ${medals[index] || `✰ ${index + 1}.`} @${jid.split('@')[0]} — ${count} msgs\n`
  })

  txt +=
`
> ✰ Total mensajes: *${totalMsgs}*
> ✰ Usuarios activos: *${Object.keys(data).length}*

༺ ✰ ${config.footer} ✰ ༻`

  return conn.sendMessage(
    m.chat,
    { text: txt, mentions },
    { quoted: m }
  )
}

// ━━━━━━━ CONTADOR ━━━━━━━

handler.all = async function (m) {
  if (!m.isGroup || !m.sender || m.isBaileys) return
  if (!m.message) return

  const data = getCache(m.chat)

  data[m.sender] =
    (data[m.sender] || 0) + 1

  scheduleWrite(m.chat, data)
}

handler.help = [
  'actividad',
  'inactivos',
  'actividad reset'
]

handler.tags = ['group']

handler.command = [
  'actividad',
  'activos',
  'activity',
  'rank',
  'inactivos',
  'inactive',
  'nulos'
]

handler.groupOnly = true
handler.noRegister = true

export default handler