const handler = async (m, { args, usedPrefix, command, groupDb }) => {
  const type = args[0]?.toLowerCase()

  if (!['on', 'off'].includes(type)) {
    return m.reply(
`*✰ 𝙽𝚂𝙵𝚆 ༻*

> ✰ Uso: *${usedPrefix}${command} on/off*
> ✰ Estado: *${groupDb.nsfw ? 'ON' : 'OFF'}*`
    )
  }

  const isEnable = type === 'on'

  if (groupDb.nsfw === isEnable) {
    return m.reply(
`*✰ 𝙴𝚂𝚃𝙰𝙳𝙾 𝙰𝙲𝚃𝚄𝙰𝙻 ༻*

> ✰ El contenido NSFW ya está *${isEnable ? 'ACTIVADO' : 'DESACTIVADO'}*.`
    )
  }

  groupDb.nsfw = isEnable
  await groupDb.save()

  return m.reply(
`*✰ 𝙽𝚂𝙵𝚆 ${isEnable ? '𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾' : '𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾'} ༻*

> ✰ Contenido +18 ${isEnable
    ? 'ahora está permitido'
    : 'ha sido bloqueado'
  } en este grupo.`
  )
}

handler.help = ['nsfw <on/off>']
handler.tags = ['group']
handler.command = ['nsfw']
handler.groupOnly = true
handler.adminOnly = true
handler.noRegister = true

export default handler