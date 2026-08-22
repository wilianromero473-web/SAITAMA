const MAX_CACHE = 2000
const antideleteCache = new Map()

function cacheSet(jid, id, data) {
  const key = `${jid}-${id}`
  antideleteCache.set(key, data)

  if (antideleteCache.size > MAX_CACHE) {
    antideleteCache.delete(
      antideleteCache.keys().next().value
    )
  }
}

function cacheGet(jid, id) {
  return antideleteCache.get(`${jid}-${id}`)
}

function cacheDel(jid, id) {
  antideleteCache.delete(`${jid}-${id}`)
}

const handler = async (m, { args, groupDb, usedPrefix, command }) => {
  const modo = args[0]?.toLowerCase()

  const modos = [
    'on', '1', 'true', 'activar',
    'off', '0', 'false', 'desactivar'
  ]

  if (!modos.includes(modo)) {
    return m.reply(
`𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴

> ✦ 𝚄𝚂𝙾: *${usedPrefix}${command} on*
> ✦ 𝙰𝙿𝙰𝙶𝙰𝚁: *${usedPrefix}${command} off*`
    )
  }

  const activar = [
    'on', '1', 'true', 'activar'
  ].includes(modo)

  groupDb.antidelete = activar
  await groupDb.save()

  return m.reply(
`𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴

> ✦ 𝙴𝚂𝚃𝙰𝙳𝙾: *${activar ? '𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾' : '𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾'}*`
  )
}

handler.before = async (m, { conn, groupDb }) => {
  if (!m.isGroup) return false

  const msg = m.message

  if (
    msg &&
    m.mtype !== 'protocolMessage' &&
    m.mtype !== 'senderKeyDistributionMessage' &&
    !m.fromMe
  ) {
    cacheSet(m.chat, m.key.id, {
      sender: m.sender,
      fromMe: m.fromMe,
      waMsg: {
        key: m.key,
        message: msg
      }
    })
  }

  if (
    m.mtype === 'protocolMessage' &&
    msg?.protocolMessage?.type === 0
  ) {
    const deletedKey = msg.protocolMessage?.key

    if (deletedKey && groupDb?.antidelete) {
      const delJid = deletedKey.remoteJid || m.chat
      const delId = deletedKey.id
      const cached = cacheGet(delJid, delId)

      if (cached && !cached.fromMe) {
        const numero = cached.sender.split('@')[0]

        const aviso =
`𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴

> ✦ @${numero} eliminó un mensaje.`

        try {
          await conn.sendMessage(
            m.chat,
            {
              text: aviso,
              mentions: [cached.sender]
            }
          )

          await conn.sendMessage(
            m.chat,
            {
              forward: cached.waMsg
            }
          )
        } catch {}

        cacheDel(delJid, delId)
      }
    }

    return false
  }

  return false
}

handler.help = ['antidelete <on/off>']
handler.tags = ['group']
handler.command = ['antidel', 'antidelete']
handler.groupOnly = true
handler.adminOnly = true
handler.alwaysBefore = true
handler.noRegister = true

export default handler