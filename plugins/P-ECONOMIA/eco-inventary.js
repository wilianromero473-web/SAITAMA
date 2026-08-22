import config from '../../config.js'

const TIER_LABEL = {
  none: '❌ Ninguno',
  normal: '⚪ Normal',
  rare: '🟣 Raro',
  mythic: '🟠 Mítico',
  legendary: '🌟 Legendario'
}

const AMULET_LABEL = {
  none: '❌ Ninguno',
  fortune: '🍀 Amuleto de Fortuna (+10% trabajo/crimen)',
  thief: '🥷 Amuleto del Ladrón (+10% robo)',
  miner: '⛏️ Amuleto del Minero (+10% objetos raros)',
  gambler: '🎲 Amuleto del Tahúr (+5% apuestas)'
}

const TITLE_LABEL = {
  title_cazador: '🏷️ El Cazador',
  title_magnate: '🏷️ Magnate',
  title_legendario: '🏷️ Leyenda Viva',
  title_sombra: '🏷️ Sombra'
}

const BADGE_LABEL = {
  relic_corona: '👑 Corona del Vacío',
  relic_orbe: '🔮 Orbe de los Ancestros',
  relic_fenix: '🐦‍🔥 Pluma de Fénix'
}

const getTier = (tier) => {
  return TIER_LABEL[tier] || TIER_LABEL.none
}

const getStock = (stock) => {
  if (!stock) return {}

  if (stock instanceof Map) {
    return Object.fromEntries(stock)
  }

  if (typeof stock === 'object') {
    return stock
  }

  return {}
}

const getStockLine = (stock) => {
  const result = ['normal', 'rare', 'mythic']
    .map(tier => {
      const amount = Number(stock[tier] || 0)

      if (amount <= 0) return null

      const symbol = TIER_LABEL[tier].split(' ')[0]

      return `${symbol}${amount}`
    })
    .filter(Boolean)

  return result.length ? result.join(' │ ') : '—'
}

const handler = async (m, { conn, userDb }) => {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛡️ SEGURIDAD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!userDb) return

  const inv = userDb.inventory || {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🖼️ FOTO DE PERFIL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const pfp = await conn
    .profilePictureUrl(m.sender, 'image')
    .catch(() =>
      'https://i.postimg.cc/sxc76BzY/porque-saitama-es-tan-fuerte.jpg'
    )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧪 INVENTARIO DE POCIONES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const potionStock = getStock(inv.potionStock)

  const potionLine = getStockLine(potionStock)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛡️ INVENTARIO DE ESCUDOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const shieldStock = getStock(inv.shieldStock)

  const shieldLine = getStockLine(shieldStock)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏷️ TÍTULOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const tituloEquipado = inv.title
    ? (TITLE_LABEL[inv.title] || inv.title)
    : '❌ Ninguno'

  const titulosDesbloqueados = Array.isArray(inv.titles)
    ? inv.titles.length
    : 0

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💎 RELIQUIAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const badges = Array.isArray(inv.badges)
    ? inv.badges.map(badge => BADGE_LABEL[badge] || badge)
    : []

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 VALORES SEGUROS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const genos = Number(userDb.genos || 0)

  const bankBalance = Number(userDb.bankBalance || 0)

  const bankProtected =
    Number(userDb.bankExpiry || 0) > Date.now()

  const pickaxeDurability = Number(
    inv.pickaxeDurability || 0
  )

  const bowDurability = Number(
    inv.bowDurability || 0
  )

  const baitDurability = Number(
    inv.baitDurability || 0
  )

  const swordUses = Number(
    inv.swordUses || 0
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎒 MENSAJE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  let txt =
    `༺ 𝙼𝙾𝙲𝙷𝙸𝙻𝙰 ༻\n\n` +

    `✰ 𝙸𝙽𝚅𝙴𝙽𝚃𝙰𝚁𝙸𝙾 𝙳𝙴 𝚂𝙰𝙸𝚃𝙰𝙼𝙰\n\n` +

    `> ✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: *@${m.sender.split('@')[0]}*\n` +

    `> ✰ ${config.PREMIUM_SYMBOL} ` +
    `*${config.PREMIUM_NAME}:* ` +
    `${genos} ${config.PREMIUM_SYMBOL}\n` +

    `> ✰ 🏷️ *𝚃í𝚝𝚞𝚕𝚘:* ${tituloEquipado}`

  if (titulosDesbloqueados > 1) {
    txt += ` _(+${titulosDesbloqueados - 1} más desbloqueados)_`
  }

  txt += `\n\n`

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚒️ HERRAMIENTAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  txt +=
    `༺ 𝙷𝙴𝚁𝚁𝙰𝙼𝙸𝙴𝙽𝚃𝙰𝚂 ༻\n\n` +

    `✰ 𝙷𝙴𝚁𝚁𝙰𝙼𝙸𝙴𝙽𝚃𝙰𝚂 𝙰𝙲𝚃𝙸𝚅𝙰𝚂\n\n` +

    `> ✰ ⛏️ *𝙿𝚒𝚌𝚘:* ` +
    `${getTier(inv.pickaxe)} ` +
    `(${pickaxeDurability} usos)\n` +

    `> ✰ 🏹 *𝙰𝚛𝚌𝚘:* ` +
    `${getTier(inv.bow)} ` +
    `(${bowDurability} usos)\n` +

    `> ✰ 🎣 *𝙲𝚊ñ𝚊:* ` +
    `${getTier(inv.bait)} ` +
    `(${baitDurability} usos)\n\n`

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚔️ ARMERÍA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  txt +=
    `༺ 𝙰𝚁𝙼𝙴𝚁Í𝙰 ༻\n\n` +

    `✰ 𝙴𝚀𝚄𝙸𝙿𝙾 𝙳𝙴 𝙲𝙾𝙼𝙱𝙰𝚃𝙴\n\n` +

    `> ✰ 🗡️ *𝙴𝚜𝚙𝚊𝚍𝚊:* ` +
    `${getTier(inv.swordTier)}`

  if (swordUses > 0) {
    txt += ` (${swordUses} usos)`
  }

  txt +=
    `\n` +

    `> ✰ 🧪 *𝙿𝚘𝚌𝚒𝚘𝚗𝚎𝚜:* ` +
    `${potionLine}\n` +

    `> ✰ 🛡️ *𝙴𝚜𝚌𝚞𝚍𝚘𝚜:* ` +
    `${shieldLine}\n\n`

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔱 AMULETO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  txt +=
    `༺ 𝙰𝙼𝚄𝙻𝙴𝚃𝙾 ༻\n\n` +

    `✰ 𝙰𝙼𝚄𝙻𝙴𝚃𝙾 𝙴𝚀𝚄𝙸𝙿𝙰𝙳𝙾\n\n` +

    `> ✰ ${AMULET_LABEL[inv.amulet] || AMULET_LABEL.none}\n\n`

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✨ BUFFS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  txt +=
    `༺ 𝙱𝚄𝙵𝙵𝚂 𝙿𝙴𝚁𝙼𝙰𝙽𝙴𝙽𝚃𝙴𝚂 ༻\n\n` +

    `> ✰ 👔 *𝙲𝚊𝚙𝚊 𝙼𝚊𝚐𝚗𝚊𝚝𝚎:* ` +
    `${inv.suit ? '✅ Activa' : '❌ No posee'}\n` +

    `> ✰ 👺 *𝙼á𝚜𝚌𝚊𝚛𝚊 𝙷𝚊𝚌𝚔𝚎𝚛:* ` +
    `${inv.mask ? '✅ Activa' : '❌ No posee'}\n\n`

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💎 RELIQUIAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (badges.length) {
    txt +=
      `༺ 𝚁𝙴𝙻𝙸𝚀𝚄𝙸𝙰𝚂 ༻\n\n` +

      badges
        .map(badge => `> ✰ ${badge}`)
        .join('\n') +

      `\n\n`
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏦 BANCO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  txt +=
    `༺ 𝙱𝙰𝙽𝙲𝙾 ༻\n\n` +

    `✰ 𝙴𝚂𝚃𝙰𝙳𝙾 𝙵𝙸𝙽𝙰𝙽𝙲𝙸𝙴𝚁𝙾\n\n` +

    `> ✰ 🛡️ *𝙿𝚛𝚘𝚝𝚎𝚌𝚌𝚒ó𝚗:* ` +
    `${bankProtected ? 'Asegurado ✅' : 'Expuesto ⚠️'}\n` +

    `> ✰ 💳 *𝚂𝚊𝚕𝚍𝚘:* ` +
    `${bankBalance} ${config.CURRENCY_SYMBOL}\n\n` +

    `༺ ${config.footer} ༻`

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📤 ENVIAR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await conn.sendMessage(
    m.chat,
    {
      image: { url: pfp },
      caption: txt,
      mentions: [m.sender]
    },
    {
      quoted: m
    }
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN DEL COMANDO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = ['mochila']
handler.tags = ['eco']
handler.command = [
  'inv',
  'mochila',
  'inventario'
]
handler.register = true

export default handler