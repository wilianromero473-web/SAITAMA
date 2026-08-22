const handler = async (m, { args, usedPrefix, command, userDb }) => {

  if (!args[0]) {
    return m.reply(
`✰ 𝚄𝚂𝙾 ✰

> ✰ *${usedPrefix}${command} <nueva_edad>*
> ✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘: *${usedPrefix}${command} 18*`
    )
  }

  const nuevaEdad = parseInt(args[0])

  if (
    isNaN(nuevaEdad) ||
    nuevaEdad < 5 ||
    nuevaEdad > 100
  ) {
    return m.reply(
`✰ 𝙴𝙳𝙰𝙳 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ✰

> ✰ 𝙸𝚗𝚜𝚚𝚛𝚎𝚨𝚜𝚊 𝚞𝚗𝚊 𝚎𝚍𝚊𝚍 𝚎𝚗𝚝𝚛𝚎 *5 𝚢 100 𝚊ñ𝚘𝚜*.`
    )
  }

  if (userDb.age === nuevaEdad) {
    return m.reply(
`✰ 𝙼𝙸𝚂𝙼𝙰 𝙴𝙳𝙰𝙳 ✰

> ✰ 𝚈𝚊 𝚝𝚎𝚗é𝚜 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚊 𝚕𝚊 𝚎𝚍𝚊𝚍 *${nuevaEdad}*.`
    )
  }

  const edadAnterior = userDb.age

  userDb.age = nuevaEdad

  await userDb.save()

  return m.reply(
`✰ 𝙴𝙳𝙰𝙳 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙰 ✰

> ✰ 𝙴𝚍𝚊𝚍 𝚊𝚗𝚝𝚎𝚛𝚒𝚘𝚛: *${edadAnterior} 𝚊ñ𝚘𝚜*
> ✰ 𝙽𝚞𝚎𝚟𝚊 𝚎𝚍𝚊𝚍: *${nuevaEdad} 𝚊ñ𝚘𝚜*`
  )
}

handler.help = ['cambiaredad <edad>']
handler.tags = ['user']
handler.command = ['cambiaredad', 'setage']

export default handler