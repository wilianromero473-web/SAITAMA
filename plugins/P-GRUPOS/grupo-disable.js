import GroupDb from '../../lib/database/models/zen-groups.js'
import { groupDbCache } from '../../lib/caches.js'

const CATEGORIAS = [
  'info', 'owner', 'rpg', 'eco', 'registro', 'juegos',
  'fun', 'group', 'tools', 'descargas', 'busquedas',
  'convertidores', 'anime', 'nsfw', 'jadibot', 'otros'
]

const handler = async (m, { args, usedPrefix, command, groupDb }) => {
  const activar = ['enable', 'activar'].includes(command)
  const target = args[0]?.toLowerCase()

  if (!target) {
    return m.reply(
`*✰ 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ༻*

> ✰ Uso: *${usedPrefix}${command} <comando | categoría>*
> ✰ Ejemplo: *${usedPrefix}${command} nsfw*`
    )
  }

  if (!groupDb) {
    groupDb =
      await GroupDb.findOne({ id: m.chat }) ||
      new GroupDb({ id: m.chat })
  }

  if (!Array.isArray(groupDb.disabledCategories))
    groupDb.disabledCategories = []

  if (!Array.isArray(groupDb.disabledCmds))
    groupDb.disabledCmds = []

  if (CATEGORIAS.includes(target)) {
    if (activar) {
      groupDb.disabledCategories =
        groupDb.disabledCategories.filter(c => c !== target)
    } else if (!groupDb.disabledCategories.includes(target)) {
      groupDb.disabledCategories.push(target)
    }
  } else {
    if (activar) {
      groupDb.disabledCmds =
        groupDb.disabledCmds.filter(c => c !== target)
    } else if (!groupDb.disabledCmds.includes(target)) {
      groupDb.disabledCmds.push(target)
    }
  }

  await GroupDb.updateOne(
    { id: m.chat },
    {
      $set: {
        disabledCategories: groupDb.disabledCategories,
        disabledCmds: groupDb.disabledCmds
      }
    },
    { upsert: true }
  )

  groupDbCache.set(m.chat, groupDb)

  return m.reply(
`*✰ 𝙲𝙾𝙽𝙵𝙸𝙶𝚄𝚁𝙰𝙲𝙸Ó𝙽 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙰 ༻*

> ✰ *${target.toUpperCase()}*
> ✰ Estado: *${activar ? 'HABILITADO' : 'DESHABILITADO'}*`
  )
}

handler.help = [
  'disable <cmd/cat>',
  'enable <cmd/cat>'
]

handler.tags = ['group']

handler.command = [
  'disable',
  'desactivar',
  'enable',
  'activar'
]

handler.adminOnly = true
handler.groupOnly = true
handler.noRegister = true

export default handler