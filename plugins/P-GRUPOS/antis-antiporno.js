const handler = async (m, { args, groupDb, usedPrefix, command }) => {
  const option = (args[0] || '').toLowerCase()

  if (!option) {
    return m.reply(
`*✰ 𝙰𝙽𝚃𝙸-𝙽𝚂𝙵𝚆 ༻*

> ✰ Estado: ${groupDb.antiPorno ? '🟢 𝙾𝙽' : '🔴 𝙾𝙵𝙵'}
> ✰ Uso: ${usedPrefix}${command} on / off`
    )
  }

  if (['on', '1', 'true', 'activar', 'enable'].includes(option)) {
    if (groupDb.antiPorno) {
      return m.reply(
`*✰ 𝙰𝙽𝚃𝙸-𝙽𝚂𝙵𝚆 ༻*

> ✰ Ya está *🟢 𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾*.`
      )
    }

    groupDb.antiPorno = true
    await groupDb.save()

    return m.reply(
`*✰ 𝙰𝙽𝚃𝙸-𝙽𝚂𝙵𝚆 ༻*

> ✰ Estado: *🟢 𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾*
> ✰ Se moderará contenido inapropiado.
> ✰ Imágenes, vídeos y stickers serán revisados.`
    )
  }

  if (['off', '0', 'false', 'desactivar', 'disable'].includes(option)) {
    if (!groupDb.antiPorno) {
      return m.reply(
`*✰ 𝙰𝙽𝚃𝙸-𝙽𝚂𝙵𝚆 ༻*

> ✰ Ya está *🔴 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾*.`
      )
    }

    groupDb.antiPorno = false
    await groupDb.save()

    return m.reply(
`*✰ 𝙰𝙽𝚃𝙸-𝙽𝚂𝙵𝚆 ༻*

> ✰ Estado: *🔴 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾*
> ✰ La moderación multimedia fue desactivada.`
    )
  }

  return m.reply(
`*✰ 𝙰𝙽𝚃𝙸-𝙽𝚂𝙵𝚆 ༻*

> ✰ Opción inválida.
> ✰ Usa: ${usedPrefix}${command} on / off`
  )
}

handler.help = ['antiporno <on/off>']
handler.tags = ['group']

handler.command = [
  'antiporno',
  'antinsfw'
]

handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler