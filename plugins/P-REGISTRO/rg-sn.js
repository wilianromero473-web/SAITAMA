import User from '../../lib/database/models/zen-users.js'

const handler = async (m) => {

  const userDb = await User.findOne({
    jid: m.sender
  })

  if (!userDb) {
    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ No se encontró tu registro.
> ✰ Primero debes registrarte.`
    )
  }

  if (!userDb.serial) {
    return m.reply(
`༺ ✰ 𝚂𝙴𝚁𝙸𝙴 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙰 ✰ ༻

> ✰ Tu cuenta no tiene un código de serie asignado.`
    )
  }

  const txt =
`༺ ✰ 𝚃𝚄 𝙲Ó𝙳𝙸𝙶𝙾 𝙳𝙴 𝚂𝙴𝚁𝙸𝙴 ✰ ༻

> ✰ 𝙲ó𝚍𝚒𝚐𝚘: \`${userDb.serial}\`

> ✰ 𝙽𝚘 𝚌𝚘𝚖𝚙𝚊𝚛𝚝𝚊𝚜 𝚎𝚜𝚝𝚎 𝚌ó𝚍𝚒𝚐𝚘 𝚌𝚘𝚗 𝚘𝚝𝚛𝚊𝚜 𝚙𝚎𝚛𝚜𝚘𝚗𝚊𝚜.

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`

  await m.reply(txt)
}

handler.help = [
  'serial'
]

handler.tags = [
  'registro'
]

handler.command = [
  'miserial',
  'sn',
  'serial'
]

handler.register = true

export default handler