import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 𝙎𝘼𝙄𝙏𝘼𝙈𝘼𝘽𝙊𝙏 · 𝙎𝙃𝙊𝙋
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const items = [
  // ━━━━━━━ HERRAMIENTAS ━━━━━━━
  {
    id: 'p_normal',
    n: '⚒️ Pico Normal',
    v: 4000,
    cat: 'normal',
    lim: 8,
    dur: 10,
    sec: 'tools',
    desc: 'Mejora tus probabilidades al minar.'
  },
  {
    id: 'p_rare',
    n: '✨ Pico Raro',
    v: 12000,
    cat: 'rare',
    lim: 5,
    dur: 5,
    sec: 'tools',
    desc: 'Más chances de minerales raros.'
  },
  {
    id: 'p_mythic',
    n: '🌌 Pico Mítico',
    v: 35000,
    cat: 'mythic',
    lim: 2,
    dur: 3,
    sec: 'tools',
    desc: 'Desbloquea minerales míticos.'
  },

  {
    id: 'h_normal',
    n: '🏹 Arco Madera',
    v: 3500,
    cat: 'normal',
    lim: 8,
    dur: 8,
    sec: 'tools',
    desc: 'Mejora tus cacerías básicas.'
  },
  {
    id: 'h_rare',
    n: '🏹 Arco Compuesto',
    v: 11000,
    cat: 'rare',
    lim: 5,
    dur: 5,
    sec: 'tools',
    desc: 'Presas más valiosas al cazar.'
  },
  {
    id: 'h_mythic',
    n: '🏹 Arco Artemis',
    v: 30000,
    cat: 'mythic',
    lim: 2,
    dur: 2,
    sec: 'tools',
    desc: 'La élite de la cacería.'
  },

  {
    id: 'f_normal',
    n: '🪱 Carnada Gusano',
    v: 2500,
    cat: 'normal',
    lim: 8,
    dur: 15,
    sec: 'tools',
    desc: 'Pesca básica mejorada.'
  },
  {
    id: 'f_rare',
    n: '✨ Carnada Dorada',
    v: 9000,
    cat: 'rare',
    lim: 5,
    dur: 8,
    sec: 'tools',
    desc: 'Atrae peces raros.'
  },
  {
    id: 'f_mythic',
    n: '🌌 Esencia Kraken',
    v: 22000,
    cat: 'mythic',
    lim: 2,
    dur: 4,
    sec: 'tools',
    desc: 'Pesca criaturas legendarias.'
  },

  // ━━━━━━━ ESPADAS ━━━━━━━
  {
    id: 'sword_normal',
    n: '⚔️ Espada de Honor',
    v: 3000,
    cat: 'sword',
    lim: 5,
    sec: 'swords',
    dur: 1,
    buff: 1.15,
    desc: '+15% daño en duelos · 1 uso'
  },
  {
    id: 'sword_rare',
    n: '🗡️ Espada Encantada',
    v: 9500,
    cat: 'sword',
    lim: 4,
    sec: 'swords',
    dur: 2,
    buff: 1.30,
    desc: '+30% daño en duelos · 2 usos'
  },
  {
    id: 'sword_mythic',
    n: '🌌 Espada del Vacío',
    v: 28000,
    cat: 'sword',
    lim: 2,
    sec: 'swords',
    dur: 3,
    buff: 1.50,
    desc: '+50% daño en duelos · 3 usos'
  },
  {
    id: 'sword_legendary',
    n: '🔥 Excalibur Reforjada',
    v: 120000,
    cat: 'legendary',
    lim: 1,
    sec: 'swords',
    dur: 5,
    buff: 1.80,
    desc: '+80% daño en duelos · 5 usos'
  },

  // ━━━━━━━ POCIONES ━━━━━━━
  {
    id: 'potion_normal',
    n: '🧪 Poción de Vida',
    v: 2500,
    cat: 'potion',
    lim: 5,
    sec: 'potions',
    buff: 200,
    desc: '+200 PV en tu próximo duelo'
  },
  {
    id: 'potion_rare',
    n: '💉 Elixir Mayor',
    v: 7000,
    cat: 'potion',
    lim: 4,
    sec: 'potions',
    buff: 350,
    desc: '+350 PV en tu próximo duelo'
  },
  {
    id: 'potion_mythic',
    n: '🌟 Néctar Divino',
    v: 18000,
    cat: 'potion',
    lim: 2,
    sec: 'potions',
    buff: 600,
    desc: '+600 PV en tu próximo duelo'
  },

  // ━━━━━━━ ESCUDOS ━━━━━━━
  {
    id: 'shield_normal',
    n: '🛡️ Escudo Energía',
    v: 1500,
    cat: 'shield',
    lim: 6,
    sec: 'shields',
    desc: 'Bloquea 1 intento de robo'
  },
  {
    id: 'shield_rare',
    n: '🔰 Escudo Reforzado',
    v: 4500,
    cat: 'shield',
    lim: 4,
    sec: 'shields',
    desc: 'Bloquea 1 robo + devuelve 5% al ladrón'
  },
  {
    id: 'shield_mythic',
    n: '✨ Aegis Arcano',
    v: 13000,
    cat: 'shield',
    lim: 2,
    sec: 'shields',
    desc: 'Bloquea 1 robo + devuelve 15% al ladrón'
  },

  // ━━━━━━━ AMULETOS ━━━━━━━
  {
    id: 'amulet_fortune',
    n: '🍀 Amuleto de Fortuna',
    v: 40000,
    cat: 'amulet',
    lim: 1,
    sec: 'amulets',
    desc: '+10% ganancias en trabajo y crimen'
  },
  {
    id: 'amulet_thief',
    n: '🥷 Amuleto del Ladrón',
    v: 45000,
    cat: 'amulet',
    lim: 1,
    sec: 'amulets',
    desc: '+10% éxito al robar'
  },
  {
    id: 'amulet_miner',
    n: '⛏️ Amuleto del Minero',
    v: 45000,
    cat: 'amulet',
    lim: 1,
    sec: 'amulets',
    desc: '+10% objetos raros al minar'
  },
  {
    id: 'amulet_gambler',
    n: '🎲 Amuleto del Tahúr',
    v: 50000,
    cat: 'amulet',
    lim: 1,
    sec: 'amulets',
    desc: '+5% probabilidad de ganar en ruleta/slots'
  },

  // ━━━━━━━ COSMÉTICOS ━━━━━━━
  {
    id: 'suit',
    n: '👔 Capa de Magnate',
    v: 5000,
    cat: 'suit',
    lim: 5,
    sec: 'cosmetics',
    desc: 'Permite usar !trabajar con bono x2'
  },
  {
    id: 'mask',
    n: '👺 Máscara Hacker',
    v: 7500,
    cat: 'mask',
    lim: 5,
    sec: 'cosmetics',
    desc: 'Garantiza éxito en el próximo crimen'
  },

  // ━━━━━━━ TÍTULOS ━━━━━━━
  {
    id: 'title_cazador',
    n: '🏷️ Título: "El Cazador"',
    v: 6000,
    cat: 'cosmetic',
    lim: 3,
    sec: 'titles',
    desc: 'Título especial para cazadores'
  },
  {
    id: 'title_magnate',
    n: '🏷️ Título: "Magnate"',
    v: 15000,
    cat: 'cosmetic',
    lim: 3,
    sec: 'titles',
    desc: 'Para los más ricos'
  },
  {
    id: 'title_legendario',
    n: '🏷️ Título: "Leyenda Viva"',
    v: 50000,
    cat: 'cosmetic',
    lim: 1,
    sec: 'titles',
    desc: 'Solo para los más dedicados'
  },
  {
    id: 'title_sombra',
    n: '🏷️ Título: "Sombra"',
    v: 20000,
    cat: 'cosmetic',
    lim: 2,
    sec: 'titles',
    desc: 'Para maestros del sigilo'
  },

  // ━━━━━━━ RELIQUIAS ━━━━━━━
  {
    id: 'relic_corona',
    n: '👑 Corona del Vacío',
    v: 150000,
    cat: 'legendary',
    lim: 1,
    sec: 'relics',
    desc: 'Reliquia coleccionable · badge exclusivo'
  },
  {
    id: 'relic_orbe',
    n: '🔮 Orbe de los Ancestros',
    v: 90000,
    cat: 'legendary',
    lim: 1,
    sec: 'relics',
    desc: 'Reliquia coleccionable · badge exclusivo'
  },
  {
    id: 'relic_fenix',
    n: '🐦‍🔥 Pluma de Fénix',
    v: 120000,
    cat: 'legendary',
    lim: 1,
    sec: 'relics',
    desc: 'Reliquia coleccionable · badge exclusivo'
  }
]

const SECCIONES = [
  { key: 'tools', titulo: '⚒️ 𝙷𝙴𝚁𝚁𝙰𝙼𝙸𝙴𝙽𝚃𝙰𝚂' },
  { key: 'swords', titulo: '⚔️ 𝙰𝚁𝙼𝙴𝚁𝙸́𝙰 — 𝙴𝚂𝙿𝙰𝙳𝙰𝚂' },
  { key: 'potions', titulo: '🧪 𝙰𝚁𝙼𝙴𝚁𝙸́𝙰 — 𝙿𝙾𝙲𝙸𝙾𝙽𝙴𝚂' },
  { key: 'shields', titulo: '🛡️ 𝙰𝚁𝙼𝙴𝚁𝙸́𝙰 — 𝙴𝚂𝙲𝚄𝙳𝙾𝚂' },
  { key: 'amulets', titulo: '🔱 𝙰𝙼𝚄𝙻𝙴𝚃𝙾𝚂' },
  { key: 'cosmetics', titulo: '✨ 𝙱𝚄𝙵𝙵𝚂 𝙲𝙾𝚂𝙼𝙴́𝚃𝙸𝙲𝙾𝚂' },
  { key: 'titles', titulo: '🏷️ 𝚃𝙸́𝚃𝚄𝙻𝙾𝚂' },
  { key: 'relics', titulo: '💎 𝚁𝙴𝙻𝙸𝚀𝚄𝙸𝙰𝚂 𝙼𝙸́𝚃𝙸𝙲𝙰𝚂' }
]

const handler = async (m, { text, usedPrefix, command, userDb }) => {
  if (!userDb) return

  // ━━━━━━━ SEGURIDAD DE DATOS ━━━━━━━
  userDb.inventory = userDb.inventory || {}
  userDb.dailyStats = userDb.dailyStats || {}

  // ━━━━━━━ MOSTRAR TIENDA ━━━━━━━
  if (!text?.trim()) {
    let txt =
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝚃𝙸𝙴𝙽𝙳𝙰 𝙳𝙴 𝙸𝚃𝙴𝙼𝚂

`

    let numero = 1

    for (const sec of SECCIONES) {
      const secItems = items.filter(item => item.sec === sec.key)

      if (!secItems.length) continue

      txt += `✰ ${sec.titulo}\n\n`

      for (const item of secItems) {
        const key = `buy_${item.cat}`
        const compras = userDb.dailyStats[key] || 0

        txt += `✰ ${numero}. ${item.n}\n`
        txt += `> 𝙿𝚛𝚎𝚌𝚒𝚘: ${item.v.toLocaleString('es-PE')} ${config.CURRENCY_NAME}\n`
        txt += `> 𝙻𝚒́𝚖𝚒𝚝𝚎: ${compras}/${item.lim}\n`

        if (item.desc) {
          txt += `> 𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚌𝚒𝚘́𝚗: ${item.desc}\n`
        }

        txt += '\n'
        numero++
      }
    }

    txt +=
`✰ 𝚄𝚜𝚘: ${usedPrefix}${command} <𝚗𝚞́𝚖𝚎𝚛𝚘>
✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘: ${usedPrefix}${command} 1`

    return m.reply(txt)
  }

  // ━━━━━━━ SELECCIONAR ITEM ━━━━━━━
  const numero = Number.parseInt(text.trim(), 10)

  if (!Number.isInteger(numero) || numero < 1 || numero > items.length) {
    return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝙸́𝚝𝚎𝚖 𝚒𝚗𝚟𝚊́𝚕𝚒𝚍𝚘

> 𝙴𝚕𝚒𝚐𝚎 𝚞𝚗 𝚒́𝚝𝚎𝚖 𝚞𝚜𝚊𝚗𝚍𝚘 𝚜𝚞 𝚗𝚞́𝚖𝚎𝚛𝚘.
> 𝚄𝚜𝚘: ${usedPrefix}${command} <𝚗𝚞́𝚖𝚎𝚛𝚘>`
    )
  }

  const item = items[numero - 1]

  // ━━━━━━━ LÍMITE DIARIO ━━━━━━━
  const statKey = `buy_${item.cat}`
  const currentCount = userDb.dailyStats[statKey] || 0

  if (currentCount >= item.lim) {
    return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝙻𝚒́𝚖𝚒𝚝𝚎 𝚊𝚕𝚌𝚊𝚗𝚣𝚊𝚍𝚘

> 𝚈𝚊 𝚌𝚘𝚖𝚙𝚛𝚊𝚜𝚝𝚎 ${currentCount}/${item.lim} 𝚍𝚎 𝚎𝚜𝚝𝚊 𝚌𝚊𝚝𝚎𝚐𝚘𝚛𝚒́𝚊 𝚑𝚘𝚢.`
    )
  }

  // ━━━━━━━ SALDO ━━━━━━━
  const saldo = Number(userDb.genosCoins) || 0

  if (saldo < item.v) {
    return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝙵𝚘𝚗𝚍𝚘𝚜 𝚒𝚗𝚜𝚞𝚏𝚒𝚌𝚒𝚎𝚗𝚝𝚎𝚜

> 𝙿𝚛𝚎𝚌𝚒𝚘: ${item.v.toLocaleString('es-PE')} ${config.CURRENCY_NAME}
> 𝚂𝚊𝚕𝚍𝚘: ${saldo.toLocaleString('es-PE')} ${config.CURRENCY_NAME}`
    )
  }

  // ━━━━━━━ COMPROBACIONES ━━━━━━━
  if (['suit', 'mask'].includes(item.id) && userDb.inventory[item.id]) {
    return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝙸𝚝𝚎𝚖 𝚢𝚊 𝚙𝚘𝚜𝚎𝚒́𝚍𝚘

> 𝚈𝚊 𝚝𝚎𝚗𝚎́𝚜 𝚎𝚚𝚞𝚒𝚙𝚊𝚍𝚘: *${item.n}*.
> 𝚄𝚜𝚊𝚕𝚘 𝚊𝚗𝚝𝚎𝚜 𝚍𝚎 𝚌𝚘𝚖𝚙𝚛𝚊𝚛 𝚘𝚝𝚛𝚘.`
    )
  }

  if (
    item.sec === 'amulets' &&
    userDb.inventory.amulet &&
    userDb.inventory.amulet !== 'none'
  ) {
    return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝙰𝚖𝚞𝚕𝚎𝚝𝚘 𝚢𝚊 𝚎𝚚𝚞𝚒𝚙𝚊𝚍𝚘

> 𝚈𝚊 𝚝𝚎𝚗𝚎́𝚜 𝚎𝚚𝚞𝚒𝚙𝚊𝚍𝚘: *${userDb.inventory.amulet}*.
> 𝚁𝚎𝚎𝚖𝚙𝚕𝚊𝚣𝚊𝚕𝚘 𝚌𝚘𝚗 𝚘𝚝𝚛𝚘 𝚊𝚖𝚞𝚕𝚎𝚝𝚘.`
    )
  }

  if (
    item.sec === 'titles' &&
    Array.isArray(userDb.inventory.titles) &&
    userDb.inventory.titles.includes(item.id)
  ) {
    return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝚃𝚒́𝚝𝚞𝚕𝚘 𝚢𝚊 𝚍𝚎𝚜𝚋𝚕𝚘𝚚𝚞𝚎𝚊𝚍𝚘

> 𝚈𝚊 𝚙𝚘𝚜𝚎𝚎𝚜 𝚎𝚕 𝚝𝚒́𝚝𝚞𝚕𝚘: *${item.n}*.`
    )
  }

  if (
    item.sec === 'relics' &&
    Array.isArray(userDb.inventory.badges) &&
    userDb.inventory.badges.includes(item.id)
  ) {
    return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝚁𝚎𝚕𝚒𝚚𝚞𝚒𝚊 𝚢𝚊 𝚙𝚘𝚜𝚎𝚒́𝚍𝚊

> 𝚈𝚊 𝚙𝚘𝚜𝚎𝚎𝚜: *${item.n}*.`
    )
  }

  // ━━━━━━━ PREPARAR ACTUALIZACIÓN ━━━━━━━
  const update = {
    $inc: {
      genosCoins: -item.v,
      [statKey]: 1
    },
    $set: {}
  }

  // ━━━━━━━ ACTUALIZAR MEMORIA LOCAL ━━━━━━━
  userDb.genosCoins = saldo - item.v
  userDb.dailyStats[statKey] = currentCount + 1

  // ━━━━━━━ PICOS ━━━━━━━
  if (item.id.startsWith('p_')) {
    const tipo = item.id.split('_')[1]

    update.$set['inventory.pickaxe'] = tipo
    update.$set['inventory.pickaxeDurability'] = item.dur

    userDb.inventory.pickaxe = tipo
    userDb.inventory.pickaxeDurability = item.dur

  // ━━━━━━━ ARCOS ━━━━━━━
  } else if (item.id.startsWith('h_')) {
    const tipo = item.id.split('_')[1]

    update.$set['inventory.bow'] = tipo
    update.$set['inventory.bowDurability'] = item.dur

    userDb.inventory.bow = tipo
    userDb.inventory.bowDurability = item.dur

  // ━━━━━━━ CARNADAS ━━━━━━━
  } else if (item.id.startsWith('f_')) {
    const tipo = item.id.split('_')[1]

    update.$set['inventory.bait'] = tipo
    update.$set['inventory.baitDurability'] = item.dur

    userDb.inventory.bait = tipo
    userDb.inventory.baitDurability = item.dur

  // ━━━━━━━ ESPADAS ━━━━━━━
  } else if (item.id.startsWith('sword_')) {
    const tier = item.id.split('_')[1]

    update.$set['inventory.swordTier'] = tier
    update.$set['inventory.swordUses'] = item.dur
    update.$set['inventory.sword'] = 1

    userDb.inventory.swordTier = tier
    userDb.inventory.swordUses = item.dur
    userDb.inventory.sword = 1

  // ━━━━━━━ POCIONES ━━━━━━━
  } else if (item.id.startsWith('potion_')) {
    const tier = item.id.split('_')[1]

    update.$inc[`inventory.potionStock.${tier}`] = 1
    update.$inc['inventory.potion'] = 1

    if (!userDb.inventory.potionStock) {
      userDb.inventory.potionStock = {}
    }

    userDb.inventory.potionStock[tier] =
      (userDb.inventory.potionStock[tier] || 0) + 1

    userDb.inventory.potion =
      (userDb.inventory.potion || 0) + 1

  // ━━━━━━━ ESCUDOS ━━━━━━━
  } else if (item.id.startsWith('shield_')) {
    const tier = item.id.split('_')[1]

    update.$inc[`inventory.shieldStock.${tier}`] = 1
    update.$inc['inventory.shield'] = 1

    if (!userDb.inventory.shieldStock) {
      userDb.inventory.shieldStock = {}
    }

    userDb.inventory.shieldStock[tier] =
      (userDb.inventory.shieldStock[tier] || 0) + 1

    userDb.inventory.shield =
      (userDb.inventory.shield || 0) + 1

  // ━━━━━━━ AMULETOS ━━━━━━━
  } else if (item.id.startsWith('amulet_')) {
    const tipo = item.id.split('_')[1]

    update.$set['inventory.amulet'] = tipo
    userDb.inventory.amulet = tipo

  // ━━━━━━━ SUIT / MÁSCARA ━━━━━━━
  } else if (['suit', 'mask'].includes(item.id)) {
    update.$set[`inventory.${item.id}`] = true
    userDb.inventory[item.id] = true

  // ━━━━━━━ TÍTULOS ━━━━━━━
  } else if (item.id.startsWith('title_')) {
    update.$push = {
      'inventory.titles': item.id
    }

    if (!Array.isArray(userDb.inventory.titles)) {
      userDb.inventory.titles = []
    }

    userDb.inventory.titles.push(item.id)

    if (!userDb.inventory.title) {
      update.$set['inventory.title'] = item.id
      userDb.inventory.title = item.id
    }

  // ━━━━━━━ RELIQUIAS ━━━━━━━
  } else if (item.id.startsWith('relic_')) {
    update.$push = {
      'inventory.badges': item.id
    }

    if (!Array.isArray(userDb.inventory.badges)) {
      userDb.inventory.badges = []
    }

    userDb.inventory.badges.push(item.id)

  // ━━━━━━━ ITEM GENÉRICO ━━━━━━━
  } else {
    update.$inc[`inventory.${item.id}`] = 1

    userDb.inventory[item.id] =
      (userDb.inventory[item.id] || 0) + 1
  }

  if (Object.keys(update.$set).length === 0) {
    delete update.$set
  }

  // ━━━━━━━ GUARDAR COMPRA ━━━━━━━
  await User.updateOne(
    { jid: userDb.jid || m.sender },
    update
  )

  // ━━━━━━━ RESPUESTA ━━━━━━━
  return m.reply(
`-𝙎𝘼𝙄𝙏𝘼𝙈𝘼 𝙱𝙾𝚃 ༻

✰ 𝙲𝚘𝚖𝚙𝚛𝚊 𝚎𝚡𝚒𝚝𝚘𝚜𝚊

✰ 𝙸́𝚝𝚎𝚖: ${item.n}
✰ 𝙿𝚛𝚎𝚌𝚒𝚘: ${item.v.toLocaleString('es-PE')} ${config.CURRENCY_NAME}
✰ 𝙱𝚊𝚕𝚊𝚗𝚌𝚎: ${userDb.genosCoins.toLocaleString('es-PE')} ${config.CURRENCY_NAME}
✰ 𝙲𝚘𝚖𝚙𝚛𝚊𝚜: ${userDb.dailyStats[statKey]}/${item.lim}

> 𝙴𝚕 𝚒́𝚝𝚎𝚖 𝚑𝚊 𝚜𝚒𝚍𝚘 𝚊𝚐𝚛𝚎𝚐𝚊𝚍𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.`
  )
}

// ━━━━━━━ CONFIGURACIÓN ━━━━━━━

handler.help = ['shop', 'tienda', 'buy']
handler.tags = ['eco']
handler.command = ['shop', 'tienda', 'buy']
handler.register = true

export default handler