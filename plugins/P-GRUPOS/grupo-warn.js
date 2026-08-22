import User from '../../lib/database/models/zen-users.js'
import GroupDb from '../../lib/database/models/zen-groups.js'
import config from '../../config.js'

const extraerNum = jid =>
  (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '')

const chatKey = jid =>
  (jid || '').replace(/\./g, '_').replace(/@/g, '_at_')

const esOwner = jid => {
  let n = extraerNum(jid)

  if (n.startsWith('549')) n = '54' + n.slice(3)
  if (n.startsWith('521')) n = '52' + n.slice(3)

  const owners = Array.isArray(config.ownerNumber)
    ? config.ownerNumber
    : [config.ownerNumber]

  return owners.some(o => {
    let a = extraerNum(o)

    if (a.startsWith('549')) a = '54' + a.slice(3)
    if (a.startsWith('521')) a = '52' + a.slice(3)

    return a === n
  })
}

const handler = async (
  m,
  {
    conn,
    args,
    command,
    groupDb,
    participants,
    usedPrefix,
    isAdmin,
    isOwner,
    isBotAdmin
  }
) => {

  if (command !== 'warns' && !isAdmin && !isOwner) {
    return m.reply(
`*✰ 𝚂𝙾𝙻𝙾 𝙰𝙳𝙼𝙸𝙽𝚂 ༻*

> ✰ @${m.sender.split('@')[0]}, necesitás ser administrador para usar este comando.`,
      { mentions: [m.sender] }
    )
  }

  if (command === 'setwarnlimit') {
    const num = parseInt(args[0])

    if (isNaN(num) || num < 1 || num > 10) {
      return m.reply(
`*✰ 𝙻Í𝙼𝙸𝚃𝙴 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾 ༻*

> ✰ El límite debe estar entre *1 y 10*.
> ✰ Ejemplo: *${usedPrefix}setwarnlimit 5*`
      )
    }

    await GroupDb.updateOne(
      { id: m.chat },
      { warnLimit: num },
      { upsert: true }
    )

    groupDb.warnLimit = num

    return m.reply(
`*✰ 𝙻Í𝙼𝙸𝚃𝙴 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾 ༻*

> ✰ Nuevo límite: *${num} advertencias*.`
    )
  }

  const target =
    m.mentionedJid?.[0] ||
    (m.quoted ? m.quoted.sender : null)

  if (command === 'warns') {
    const who = target || m.sender

    const targetDb = await User.findOne({
      jid: { $regex: `^${extraerNum(who)}@` }
    })

    const key = chatKey(m.chat)
    const currentWarns =
      targetDb?.warns?.get(key) || 0

    const limit = groupDb?.warnLimit || 3

    return m.reply(
`*✰ 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰𝚂 ༻*

> ✰ Usuario: @${who.split('@')[0]}
> ✰ Advertencias: *${currentWarns}/${limit}*`,
      { mentions: [who] }
    )
  }

  if (!target) {
    return m.reply(
`*✰ 𝙵𝙰𝙻𝚃𝙰 𝙾𝙱𝙹𝙴𝚃𝙸𝚅𝙾 ༻*

> ✰ Mencioná o respondé al mensaje del usuario.`
    )
  }

  if (target === conn.user.id) {
    return m.reply(
`*✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ༻*

> ✰ No puedo advertirme a mí mismo.`
    )
  }

  if (esOwner(target)) {
    return m.reply(
`*✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙱𝙻𝙾𝚀𝚄𝙴𝙰𝙳𝙰 ༻*

> ✰ No podés advertir al creador del bot.`
    )
  }

  const pTarget = participants.find(p => p.id === target)

  if (pTarget?.admin) {
    return m.reply(
`*✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙱𝙻𝙾𝚀𝚄𝙴𝙰𝙳𝙰 ༻*

> ✰ No podés advertir a un administrador.`
    )
  }

  const numTarget = extraerNum(target)

  let targetDb = await User.findOne({
    jid: { $regex: `^${numTarget}@` }
  })

  if (!targetDb) {
    targetDb = new User({ jid: target })
    await targetDb.save()
  }

  const key = chatKey(m.chat)
  const limit = groupDb?.warnLimit || 3

  let currentWarns =
    targetDb.warns?.get(key) || 0

  if (['unwarn', 'delwarn'].includes(command)) {

    if (currentWarns <= 0) {
      return m.reply(
`*✰ 𝚂𝙸𝙽 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰𝚂 ༻*

> ✰ El usuario no tiene advertencias en este grupo.`
      )
    }

    targetDb.warns.set(key, currentWarns - 1)
    targetDb.markModified('warns')
    await targetDb.save()

    return m.reply(
`*✰ 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰 𝚁𝙴𝙼𝙾𝚅𝙸𝙳𝙰 ༻*

> ✰ @${target.split('@')[0]} recibió una advertencia menos.
> ✰ Total: *${currentWarns - 1}/${limit}*`,
      { mentions: [target] }
    )
  }

  if (command === 'warn') {

    if (!isBotAdmin) {
      return m.reply(
`*✰ 𝙱𝙾𝚃 𝚂𝙸𝙽 𝙿𝙴𝚁𝙼𝙸𝚂𝙾𝚂 ༻*

> ✰ Necesito ser administrador para expulsar al usuario al llegar al límite.`
      )
    }

    currentWarns++

    if (currentWarns >= limit) {

      targetDb.warns.delete(key)
      targetDb.markModified('warns')
      await targetDb.save()

      try {
        await conn.groupParticipantsUpdate(
          m.chat,
          [target],
          'remove'
        )
      } catch {}

      return m.reply(
`*✰ 𝙴𝚇𝙿𝚄𝙻𝚂𝙰𝙳𝙾 ༻*

> ✰ @${target.split('@')[0]} alcanzó *${limit} advertencias* y fue expulsado.`,
        { mentions: [target] }
      )
    }

    targetDb.warns.set(key, currentWarns)
    targetDb.markModified('warns')
    await targetDb.save()

    const reason =
      args.join(' ')
        .replace(/@\d+/g, '')
        .trim() || 'Sin motivo'

    return m.reply(
`*✰ 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰 ༻*

> ✰ @${target.split('@')[0]}, recibiste una advertencia.
> ✰ Motivo: *${reason}*
> ✰ Estado: *${currentWarns}/${limit}*`,
      { mentions: [target] }
    )
  }
}

handler.help = [
  'warn @user',
  'unwarn @user',
  'warns',
  'setwarnlimit <1-10>'
]

handler.tags = ['group']

handler.command = [
  'warn',
  'unwarn',
  'delwarn',
  'setwarnlimit',
  'warns'
]

handler.groupOnly = true
handler.noRegister = true

export default handler