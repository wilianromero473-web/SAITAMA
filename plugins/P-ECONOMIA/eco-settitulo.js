import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const TITLE_LABEL = {
  title_cazador: 'El Cazador',
  title_magnate: 'Magnate',
  title_legendario: 'Leyenda Viva',
  title_sombra: 'Sombra'
}

const handler = async (m, { text, userDb, usedPrefix, command }) => {
  if (!userDb) return

  // ━━━━━━━ INVENTARIO ━━━━━━━
  userDb.inventory = userDb.inventory || {}

  const titles = Array.isArray(userDb.inventory.titles)
    ? userDb.inventory.titles
    : []

  // ━━━━━━━ MOSTRAR TÍTULOS ━━━━━━━
  if (!text?.trim()) {

    if (titles.length === 0) {
      return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝚃𝚒́𝚝𝚞𝚕𝚘𝚜 𝚍𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎𝚜: 𝟶

> 𝙽𝚘 𝚝𝚎𝚗𝚎́𝚜 𝚗𝚒𝚗𝚐𝚞́𝚗 𝚝𝚒́𝚝𝚞𝚕𝚘 𝚌𝚘𝚖𝚙𝚛𝚊𝚍𝚘 𝚙𝚊𝚛𝚊 𝚎𝚚𝚞𝚒𝚙𝚊𝚛.

✰ 𝚄𝚜𝚘: ${usedPrefix}${command} <𝚗𝚞́𝚖𝚎𝚛𝚘>`
      )
    }

    let txt =
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝙴𝚚𝚞𝚒𝚙𝚊𝚛 𝚃𝚒́𝚝𝚞𝚕𝚘
✰ 𝚃𝚘𝚝𝚊𝚕: ${titles.length}

`

    titles.forEach((title, index) => {
      const label = TITLE_LABEL[title] || title
      const active = userDb.inventory.title === title

      txt += `✰ ${index + 1}. ${label} ${active ? '✓' : ''}\n`
    })

    txt +=
`
✰ 𝚄𝚜𝚘: ${usedPrefix}${command} <𝚗𝚞́𝚖𝚎𝚛𝚘>
✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘: ${usedPrefix}${command} 1`

    return m.reply(txt)
  }

  // ━━━━━━━ SELECCIONAR TÍTULO ━━━━━━━
  const idx = parseInt(text.trim(), 10) - 1

  if (!Number.isInteger(idx) || idx < 0 || idx >= titles.length) {
    return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝙽𝚞́𝚖𝚎𝚛𝚘 𝚒𝚗𝚟𝚊́𝚕𝚒𝚍𝚘

> 𝙴𝚕𝚒𝚐𝚎 𝚞𝚗 𝚝𝚒́𝚝𝚞𝚕𝚘 𝚞𝚜𝚊𝚗𝚍𝚘 𝚜𝚞 𝚗𝚞́𝚖𝚎𝚛𝚘.
> 𝚄𝚜𝚘: ${usedPrefix}${command} <𝚗𝚞́𝚖𝚎𝚛𝚘>`
    )
  }

  const chosen = titles[idx]

  if (!chosen) {
    return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚘́ 𝚎𝚕 𝚝𝚒́𝚝𝚞𝚕𝚘.`
    )
  }

  const label = TITLE_LABEL[chosen] || chosen

  // ━━━━━━━ EQUIPAR ━━━━━━━
  await User.updateOne(
    { jid: userDb.jid || m.sender },
    {
      $set: {
        'inventory.title': chosen
      }
    }
  )

  userDb.inventory.title = chosen

  return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝚃𝚒́𝚝𝚞𝚕𝚘 𝚎𝚚𝚞𝚒𝚙𝚊𝚍𝚘

✰ 𝚃𝚒́𝚝𝚞𝚕𝚘: ${label}
✰ 𝙴𝚜𝚝𝚊𝚍𝚘: 𝙰𝚌𝚝𝚒𝚟𝚘

> 𝙴𝚕 𝚝𝚒́𝚝𝚞𝚕𝚘 𝚑𝚊 𝚜𝚒𝚍𝚘 𝚎𝚚𝚞𝚒𝚙𝚊𝚍𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.`
  )
}

// ━━━━━━━ CONFIGURACIÓN ━━━━━━━
handler.help = ['equipartitulo <número>']
handler.tags = ['eco']
handler.command = [
  'equipartitulo',
  'settitulo',
  'equipartitle'
]
handler.register = true

export default handler