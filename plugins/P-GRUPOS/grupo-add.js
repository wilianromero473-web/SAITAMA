import * as baileysMod from '@whiskeysockets/baileys'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1
  ? baileysMod.default
  : baileysMod

const { jidNormalizedUser } = pkg

const handler = async (m, { conn, text, usedPrefix, participants }) => {
  const num = text ? text.replace(/\D/g, '') : ''

  if (!num) {
    return m.reply(
`༺ ✰ NÚMERO REQUERIDO ✰ ༻

> ✰ Uso: ${usedPrefix}agregar <número>
> ✰ Ejemplo: ${usedPrefix}agregar 519xxxxxxxx`
    )
  }

  const targetJid = jidNormalizedUser(`${num}@s.whatsapp.net`)

  const existe = participants.some(
    p => jidNormalizedUser(p.id) === targetJid
  )

  if (existe) {
    return m.reply(
`༺ ✰ USUARIO YA ESTÁ EN EL GRUPO ✰ ༻

> ✰ @${num} ya pertenece a este grupo.`
    )
  }

  try {
    const res = await conn.groupParticipantsUpdate(
      m.chat,
      [targetJid],
      'add'
    )

    const status =
      res?.[targetJid] ||
      res?.[0]?.[targetJid] ||
      res?.[0] ||
      null

    if (
      status === '403' ||
      status === '401' ||
      status?.status === '403' ||
      status?.status === '401'
    ) {
      const code = await conn.groupInviteCode(m.chat)

      return m.reply(
`༺ ✰ PRIVACIDAD ACTIVADA ✰ ༻

> ✰ @${num} no puede ser añadido directamente.
> ✰ Compartile este enlace:

https://chat.whatsapp.com/${code}`,
        { mentions: [targetJid] }
      )
    }

    return m.reply(
`༺ ✰ USUARIO AGREGADO ✰ ༻

> ✰ @${num} fue añadido correctamente al grupo.`,
      { mentions: [targetJid] }
    )

  } catch (e) {
    const error = String(e?.stack || e?.message || e)
      .toLowerCase()

    const restringido =
      error.includes('reachout') ||
      error.includes('restricted') ||
      e?.data === 463 ||
      e?.statusCode === 463

    if (restringido) {
      try {
        const code = await conn.groupInviteCode(m.chat)

        return m.reply(
`༺ ✰ RESTRICCIÓN DE CONTACTO ✰ ༻

> ✰ WhatsApp impide añadir directamente a este contacto.
> ✰ Compartile el enlace para que pueda unirse:

https://chat.whatsapp.com/${code}`
        )
      } catch {
        return m.reply(
`༺ ✰ RESTRICCIÓN DE CONTACTO ✰ ༻

> ✰ No se pudo añadir directamente.
> ✰ Comparte manualmente el enlace de invitación del grupo.`
        )
      }
    }

    return m.reply(
`༺ ✰ ERROR AL AGREGAR ✰ ༻

> ✰ No se pudo agregar al usuario.
> ✰ Verificá que el número tenga una cuenta activa de WhatsApp.`
    )
  }
}

handler.help = ['agregar <número>']
handler.tags = ['group']

handler.command = [
  'add',
  'agregar',
  'añadir',
  'invitar'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler