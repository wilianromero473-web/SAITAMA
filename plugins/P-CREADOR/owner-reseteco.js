import User from '../../lib/database/models/zen-users.js'

// ✰ SAITAMABOT • RESET ECONOMÍA

const handler = async (
  m,
  {
    conn,
    isOwner
  }
) => {

  // ✰ VERIFICAR OWNER

  if (!isOwner) {
    return
  }


  try {

    // ✰ MENSAJE DE PROCESO

    await m.reply(
`✰ 𝚁𝙴𝚂𝙴𝚃 𝙳𝙴 𝙴𝙲𝙾𝙽𝙾𝙼Í𝙰 ✰

> ✰ 𝚁𝚎𝚜𝚎𝚝𝚎𝚊𝚗𝚍𝚘 𝚋𝚊𝚕𝚊𝚗𝚌𝚎𝚜...
> ✰ 𝚁𝚎𝚜𝚎𝚝𝚎𝚊𝚗𝚍𝚘 𝚒𝚗𝚟𝚎𝚗𝚝𝚊𝚛𝚒𝚘𝚜...
> ✰ 𝚁𝚎𝚜𝚎𝚝𝚎𝚊𝚗𝚍𝚘 𝚗𝚒𝚟𝚎𝚕𝚎𝚜...
> ✰ 𝙳𝚎𝚜𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚗𝚍𝚘 𝚞𝚜𝚞𝚊𝚛𝚒𝚘𝚜...`
    )


    // ✰ RESETEAR USUARIOS

    await User.updateMany(
      {},
      {
        $set: {

          // ✰ REGISTRO

          registered: false,
          everRegistered: false,
          name: '',
          age: 0,
          serial: '',


          // ✰ ECONOMÍA

          genosCoins: 0,
          bankBalance: 0,
          bankExpiry: 0,
          genos: 0,


          // ✰ NIVEL Y EXPERIENCIA

          level: 0,
          xp: 0,


          // ✰ INVENTARIO

          'inventory.pickaxe': 'none',
          'inventory.pickaxeDurability': 0,

          'inventory.bow': 'none',
          'inventory.bowDurability': 0,

          'inventory.bait': 'none',
          'inventory.baitDurability': 0,

          'inventory.sword': 0,
          'inventory.potion': 0,
          'inventory.shield': 0,

          'inventory.suit': false,
          'inventory.mask': false,


          // ✰ ESTADÍSTICAS DIARIAS

          'dailyStats.workCount': 0,
          'dailyStats.mineCount': 0,
          'dailyStats.crimeCount': 0,

          'dailyStats.suitUsed': false,
          'dailyStats.maskUsed': false,

          'dailyStats.buy_mythic': 0,
          'dailyStats.buy_rare': 0,
          'dailyStats.buy_normal': 0,

          'dailyStats.buy_sword': 0,
          'dailyStats.buy_potion': 0,
          'dailyStats.buy_shield': 0,

          'dailyStats.buy_suit': 0,
          'dailyStats.buy_mask': 0,


          // ✰ COOLDOWNS

          lastDaily: 0,
          lastWork: 0,
          lastMine: 0,
          lastRob: 0,
          lastHunt: 0,
          lastFish: 0
        }
      }
    )


    // ✰ ÉXITO

    return m.reply(
`✰ 𝙴𝙲𝙾𝙽𝙾𝙼Í𝙰 𝚁𝙴𝚂𝙴𝚃𝙴𝙰𝙳𝙰 ✰

> ✰ 𝚃𝚘𝚍𝚘𝚜 𝚕𝚘𝚜 𝚋𝚊𝚕𝚊𝚗𝚌𝚎𝚜 𝚟𝚘𝚕𝚟𝚒𝚎𝚛𝚘𝚗 𝚊 𝚌𝚎𝚛𝚘.
> ✰ 𝙻𝚘𝚜 𝚒𝚗𝚟𝚎𝚗𝚝𝚊𝚛𝚒𝚘𝚜 𝚏𝚞𝚎𝚛𝚘𝚗 𝚛𝚎𝚜𝚎𝚝𝚎𝚊𝚍𝚘𝚜.
> ✰ 𝙻𝚘𝚜 𝚗𝚒𝚟𝚎𝚕𝚎𝚜 𝚢 𝚎𝚡𝚙𝚎𝚛𝚒𝚎𝚗𝚌𝚒𝚊 𝚟𝚘𝚕𝚟𝚒𝚎𝚛𝚘𝚗 𝚊 𝚌𝚎𝚛𝚘.
> ✰ 𝚃𝚘𝚍𝚘𝚜 𝚕𝚘𝚜 𝚞𝚜𝚞𝚊𝚛𝚒𝚘𝚜 𝚏𝚞𝚎𝚛𝚘𝚗 𝚍𝚎𝚜𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚘𝚜.

✰ 𝙳𝚎𝚋𝚎𝚛á𝚗 𝚞𝚜𝚊𝚛 *𝚛𝚎𝚐* 𝚙𝚊𝚛𝚊 𝚟𝚘𝚕𝚟𝚎𝚛 𝚊 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚛𝚜𝚎.`
    )

  } catch (error) {

    // ✰ ERROR

    console.error(
      '[RESETECO]',
      error?.message || error
    )


    return m.reply(
`✰ 𝙴𝚁𝚁𝙾𝚁 ✰

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚛𝚎𝚜𝚎𝚝𝚎𝚊𝚛 𝚕𝚊 𝚎𝚌𝚘𝚗𝚘𝚖í𝚊.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )
  }
}


// ✰ CONFIGURACIÓN DEL PLUGIN

handler.help = [
  'reseteco',
  'resetareconomia',
  'hardreset'
]

handler.command = [
  'reseteco',
  'resetareconomia',
  'hardreset'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler