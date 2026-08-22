import GroupDb from '../../lib/database/models/zen-groups.js'
import { groupDbCache } from '../../lib/caches.js'

async function actualizarGroupDb(groupDb, updates) {
  Object.assign(groupDb, updates)

  await GroupDb.findOneAndUpdate(
    { id: groupDb.id },
    { $set: updates },
    { upsert: true }
  )

  groupDbCache.set(groupDb.id, groupDb)
}

const handler = async (
  m,
  { conn, groupDb, isAdmin, isOwner }
) => {
  const senderNum = m.sender.split('@')[0]

  const esSubBotDueno =
    conn.isSubBot &&
    senderNum === conn.ownerNumber

  if (!isAdmin && !isOwner && !esSubBotDueno) {
    return m.reply(
`*✰ 𝙰𝙲𝙲𝙴𝚂𝙾 𝙳𝙴𝙽𝙴𝙶𝙰𝙳𝙾 ༻*

> ✰ Solo los administradores o el dueño del bot pueden usar este comando.`
    )
  }

  const newState = !groupDb.onlyadmin

  await actualizarGroupDb(
    groupDb,
    { onlyadmin: newState }
  )

  return m.reply(
`*✰ 𝙼𝙾𝙳𝙾 𝚂𝙾𝙻𝙾 𝙰𝙳𝙼𝙸𝙽𝚂 ༻*

> ✰ Estado: *${newState ? '𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾' : '𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾'}*

> ✰ ${newState
    ? 'Solo admins y owners pueden usar comandos.'
    : 'Todos los integrantes pueden usar comandos.'
  }`
  )
}

handler.help = ['onlyadmin']
handler.tags = ['jadibot']
handler.command = [
  'onlyadmin',
  'soloadmin',
  'adminonly'
]

handler.groupOnly = true
handler.noRegister = true

export default handler