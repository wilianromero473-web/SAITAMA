import * as baileysMod from '@whiskeysockets/baileys'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1
  ? baileysMod.default
  : baileysMod

const { jidNormalizedUser } = pkg

const handler = async (m, { conn, participants, config, isOwner }) => {
  const senderJid = jidNormalizedUser(m.sender)

  const isGroupCreator = participants.some(p =>
    p.admin === 'superadmin' &&
    (
      jidNormalizedUser(p.id) === senderJid ||
      (p.lid && jidNormalizedUser(p.lid) === senderJid)
    )
  )

  if (!isOwner && !isGroupCreator) {
    return m.reply(
`༺ ✰ ACCESO DENEGADO ✰ ༻

> ✰ Este comando es exclusivo para el creador del grupo o del bot.`
    )
  }

  const botJid = jidNormalizedUser(conn.user.id)
  const botLid = conn.user.lid
    ? jidNormalizedUser(conn.user.lid)
    : null

  const owners = Array.isArray(config.ownerNumber)
    ? config.ownerNumber
    : [config.ownerNumber]

  const targets = participants
    .map(p => jidNormalizedUser(p.id))
    .filter(id => {
      if (id === botJid || id === botLid || id === senderJid) {
        return false
      }

      const num = id.split('@')[0].replace(/\D/g, '')

      const isOwnerTarget = owners.some(owner => {
        let a = String(owner).replace(/\D/g, '')
        let b = num

        if (a.startsWith('549')) a = '54' + a.slice(3)
        if (a.startsWith('521')) a = '52' + a.slice(3)

        if (b.startsWith('549')) b = '54' + b.slice(3)
        if (b.startsWith('521')) b = '52' + b.slice(3)

        return a === b
      })

      return !isOwnerTarget
    })

  if (!targets.length) {
    return m.reply(
`༺ ✰ GRUPO VACÍO ✰ ༻

> ✰ No hay miembros disponibles para expulsar.`
    )
  }

  await m.reply(
`༺ ✰ LIMPIEZA MASIVA ✰ ༻

> ✰ Miembros a expulsar: *${targets.length}*
> ✰ Iniciando proceso...`
  )

  try {
    const batchSize = 10

    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize)

      await conn.groupParticipantsUpdate(
        m.chat,
        batch,
        'remove'
      )

      await new Promise(resolve =>
        setTimeout(resolve, 1500)
      )
    }

    return m.reply(
`༺ ✰ LIMPIEZA FINALIZADA ✰ ༻

> ✰ Miembros expulsados: *${targets.length}*
> ✰ La limpieza del grupo terminó correctamente.`
    )

  } catch {
    return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo completar la limpieza masiva.`
    )
  }
}

handler.help = ['kickall']
handler.tags = ['group']
handler.command = [
  'kickall',
  'banall',
  'expulsartodos',
  'echaratodos'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler