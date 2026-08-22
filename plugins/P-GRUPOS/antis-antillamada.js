const handler = async (m, { args, groupDb }) => {
  const option = (args[0] || '').toLowerCase()

  if (!option) {
    return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙻𝙰𝙼𝙰𝙳𝙰𝚂 ✰ ༻

> ✰ Estado: ${groupDb.antiCall ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}
> ✰ Uso: .antillamadas on / off`
    )
  }

  if (['on', '1', 'true', 'activar', 'enable'].includes(option)) {
    if (groupDb.antiCall) {
      return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙻𝙰𝙼𝙰𝙳𝙰𝚂 ✰ ༻

> ✰ El sistema ya está activado.
> ✰ Las llamadas serán rechazadas.
> ✰ El usuario podrá ser expulsado si el bot tiene permisos.
> ✰ El Owner estará protegido.`
      )
    }

    groupDb.antiCall = true
    await groupDb.save()

    return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙻𝙰𝙼𝙰𝙳𝙰𝚂 ✰ ༻

> ✰ Estado: 🟢 ACTIVADO
> ✰ Las llamadas serán rechazadas.
> ✰ El infractor será expulsado si el bot es administrador.
> ✰ El Owner no será expulsado.`
    )
  }

  if (['off', '0', 'false', 'desactivar', 'disable'].includes(option)) {
    if (!groupDb.antiCall) {
      return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙻𝙰𝙼𝙰𝙳𝙰𝚂 ✰ ༻

> ✰ El sistema ya está desactivado.`
      )
    }

    groupDb.antiCall = false
    await groupDb.save()

    return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸𝙻𝙻𝙰𝙼𝙰𝙳𝙰𝚂 ✰ ༻

> ✰ Estado: 🔴 DESACTIVADO
> ✰ El bot ya no expulsará usuarios por llamadas.`
    )
  }

  return m.reply(
`༺ ✰ 𝙾𝙿𝙲𝙸Ó𝙽 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ✰ ༻

> ✰ Usá: .antillamadas on
> ✰ Usá: .antillamadas off`
  )
}

handler.help = ['antillamadas <on/off>']
handler.tags = ['group']
handler.command = ['antillamadas', 'antiCall']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true

export default handler