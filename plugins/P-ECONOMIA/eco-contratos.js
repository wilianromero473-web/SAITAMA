import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const TARGETS = {
  common: [
    '🐇 Conejo', '🐇 Liebre', '🦆 Pato', '🦃 Pavo salvaje', '🦌 Venado',
    '🐗 Jabalí', '🦊 Zorro', '🦝 Mapache', '🦔 Erizo', '🐿️ Ardilla',
    '🐀 Rata de monte', '🐦 Codorniz', '🐍 Serpiente', '🦨 Zorrillo',
    '🐃 Búfalo joven', '🐗 Puercoespín', '🦡 Tejón', '🦦 Nutria',
    '🐒 Mono pequeño', '🦌 Gacela', '🐐 Cabra montés', '🐏 Carnero',
    '🐎 Caballo salvaje', '🐄 Vaca perdida', '🐕 Perro callejero',
    '🐈 Gato montés', '🦅 Halcón joven', '🦉 Búho nocturno', '🦜 Loro colorido',
    '🦢 Cisne', '🦩 Flamenco', '🐗 Cerdo salvaje', '🐕 Coyote',
    '🐺 Lobo joven', '🐦 Perdiz', '🐦 Paloma', '🐀 Topo', '🦥 Perezoso',
    '🐨 Koala', '🦘 Cangrejo', '🦦 Visón', '🦊 Zorro ártico', '🐦 Faisán',
    '🦆 Ganso', '🦔 Puercoespín real', '🐿️ Marmota', '🦝 Coatí', '🐒 Tití',
    '🦨 Hurón', '🦎 Lagartija',

    '🐟 Sardina', '🐟 Trucha', '🐟 Merluza', '🐟 Carpa', '🐟 Arenque',
    '🐟 Caballa', '🐟 Tilapia', '🐟 Pejerrey', '🐟 Lisa', '🐟 Bagre',
    '🐟 Corvina', '🦀 Cangrejo', '🦐 Camarón', '🦑 Calamar',
    '🐙 Pulpo pequeño', '🐟 Salmón', '🐟 Mojarra', '🐟 Dorado', '🐟 Surubí',
    '🐟 Robalo', '🐟 Lenguado', '🐟 Anchoa', '🐟 Bacalao', '🐟 Atún pequeño',
    '🐟 Besugo', '🐟 Bonito', '🐟 Mero', '🐟 Pargo', '🐟 Congrio',
    '🐟 Raya pequeña', '🐟 Pez Espada', '🐟 Carite', '🐟 Jurel', '🐟 Sierra',
    '🐟 Bagre canal', '🐟 Carpa espejo', '🐟 Trucha arcoíris', '🐟 Perca',
    '🐟 Lucioperca', '🐟 Barbo', '🐟 Brema', '🐟 Tenca', '🐟 Alburno',
    '🐟 Gobio', '🐟 Cacho', '🐟 Madrilla', '🐟 Bermejuela', '🐟 Jarabugo',
    '🐟 Pardilla', '🐟 Calandino'
  ],

  rare: [
    '🐆 Leopardo', '🐅 Tigre', '🐻 Oso Pardo', '🐺 Lobo Alfa', '🐆 Pantera',
    '🐊 Cocodrilo', '🐍 Cobra Real', '🦏 Rinoceronte', '🦅 Águila Real',
    '🦁 León', '🦒 Jirafa', '🐘 Elefante', '🦓 Cebra', '🐆 Guepardo',
    '🐻 Oso Polar', '🐅 Tigre Bengala', '🐆 Leopardo Nieves',
    '🐊 Caimán Negro', '🐍 Pitón', '🦛 Hipopótamo', '🦍 Gorila',
    '🦧 Orangután', '🐃 Búfalo africano', '🦎 Dragón Komodo', '🐆 Jaguar',
    '🐺 Lobo Ártico', '🦅 Cóndor Andes', '🦚 Pavo Real', '🦌 Ciervo Real',
    '🐂 Toro Bravo', '🐗 Gran Jabalí', '🦌 Alce Gigante', '🐅 Tigre Albino',
    '🐘 Mamut Pequeño', '🦏 Rinoceronte Negro', '🦁 León Blanco',
    '🐊 Aligátor', '🦉 Gran Búho Real', '🦅 Águila Imperial',
    '🦎 Iguana Gigante', '🐃 Bisonte', '🐻 Oso Negro', '🐺 Lobo de Crin',
    '🐆 Lince', '🐍 Anaconda', '🦏 Rinoceronte Blanco', '🦍 Espalda Plateada',
    '🐘 Elefante Africano', '🐅 Tigre Siberiano', '🐆 Puma',

    '🐠 Pez Payaso', '🐠 Pez Cirujano', '🐠 Pez Ángel', '🐡 Pez Globo',
    '🦈 Tiburón Bebé', '🦈 Pez Martillo', '🦞 Langosta Real',
    '🐟 Salmón Plata', '🐟 Atún Aleta Azul', '🐍 Anguila',
    '🐠 Pez Mariposa', '🐠 Pez Loro', '🐠 Pez Mandarín',
    '🦀 Cangrejo Gigante', '🦑 Calamar Cristal', '🐙 Pulpo Anillos',
    '🦈 Tiburón Tigre', '🦈 Tiburón Mako', '🐟 Esturión', '🐟 Gran Pez Sol',
    '🐠 Pez Disco', '🐠 Pez León', '🐟 Pez Vela', '🐟 Marlin Negro',
    '🐟 Siluro Gigante', '🐟 Pez Tigre', '🐟 Arapaima', '🐟 Pez Gato',
    '🐟 Salmón Real', '🐟 Trucha de Oro', '🐠 Pez Betta', '🐡 Pez Cofre',
    '🐍 Morena', '🐚 Caracol Fuego', '💎 Perla Blanca', '🔱 Tridente Hierro',
    '🏺 Ánfora Romana', '⚓ Ancla Bronce', '📦 Cofre Pequeño',
    '🗺️ Mapa Mojado', '🐠 Pez Halcón', '🐠 Ballesta', '🐡 Pez Erizo',
    '🦀 Centollo Real', '🦑 Sepia Gigante', '🐙 Pulpo Mimético',
    '🦈 Tiburón Zorro', '🐟 Pez Napoleón', '🐠 Pez Gatillo', '🐚 Ostra Perla'
  ],

  special: [
    '🐲 Dragón', '🦄 Unicornio', '🔥 Fénix', '🦖 T-Rex', '🦁 León de Nemea',
    '🦌 Ciervo Dorado', '🐎 Pegaso', '🔱 Quimera', '🦅 Grifo', '🐺 Fenrir',
    '🐉 Hydra', '🐎 Centauro', '🔥 Cerbero', '🦁 Esfinge', '🐲 Wyvern',
    '🦌 Kirin', '🦁 Mantícora', '🐂 Minotauro', '🐎 Bicornio', '🕊️ Ave Roc',
    '🐍 Basilisco', '🐺 Licántropo', '🦍 Bigfoot', '🦎 Monstruo del Lago',
    '👹 Oni', '🔱 Behemoth', '🐲 Bahamut', '🐲 Shenlong', '🦖 Espinosaurio',
    '🦄 Alicornio', '🦅 Fénix Azul', '🦁 Quimera Real', '🐉 Dragón Negro',
    '🐲 Dragón de Hielo', '🦌 Espíritu Bosque', '🦊 Kitsune',
    '🐅 Tigre Celestial', '🦁 León Alado', '🗡️ Hoja del Destino',
    '👑 Corona del Rey', '🐲 Tiamat', '🐺 Amarok', '🦅 Simurgh',
    '🐉 Jörmungandr', '🔥 Efreet', '🐎 Sleipnir', '👹 Tengu', '🔱 Leviatán',
    '🐲 Dragón Dorado', '🛐 Deidad Bosque',

    '🐳 Ballena Azul', '🦈 Tiburón Blanco', '🦑 Kraken',
    '🔱 Tridente Poseidón', '💎 Perla Negra', '👑 Corona Atlante',
    '🐳 Ballena Jorobada', '🐋 Orca', '🦈 Megalodón', '🦑 Calamar Colosal',
    '🧞 Genio Lámpara', '🚢 Tesoro Español', '💎 Diamante Marino',
    '🐋 Cachalote Blanco', '🐢 Tortuga Ancestral', '🐉 Dragón Marino',
    '🧜‍♀️ Arpa Sirena', '👑 Corona Coral', '🛡️ Escudo Escamas',
    '🗡️ Daga Atlantis', '🌀 Remolino', '💠 Cristal Océano',
    '🌟 Estrella Cósmica', '🦀 Cangrejo Diamante', '🐙 Hydra de Agua',
    '🐋 Leviatán Bebé', '🐟 Pez Oro Macizo', '🐡 Pez Galáctico',
    '🦈 Tiburón Basalto', '🐚 Concha Verdad', '🏺 Vaso de Hermes',
    '📦 Gran Cofre Pirata', '⚜️ Emblema Sagrado', '🔱 Lanza Neptuno',
    '🏮 Linterna Abismo', '🌌 Fragmento Meteorito', '🗿 Ídolo Sumergido',
    '🧬 ADN Prehistórico', '🕋 Cubo Destino', '👑 Corona Perlas',
    '🦈 Guardián Abismo', '🐋 Cetáceo Plateado', '🦈 Tiburón Cristal',
    '🐚 Caracol Infinito', '💠 Corazón Océano', '🔱 Tridente Sagrado',
    '🔱 Cetro Mareas', '🐙 Kraken Rey', '🐳 Ballena Galáctica',
    '🌊 Esencia Poseidón'
  ]
}

const MOTIVOS_CLAUSURA = [
  '🚨 *MERCADO CLAUSURADO:* La policía del servidor está patrullando los muelles de transacciones. El contrabandista se ha escondido.',
  '😴 *COMERCIANTE DURMIENDO:* El contrabandista consumió demasiado elixir y se durmió. Volverá a abrir en la próxima hora.',
  '📦 *PREPARANDO TRASLADO:* El mercado está cargando el cargamento en el submarino sigiloso. Volvemos la próxima hora.'
]

const normalizeToTag = (name = '') => {
  return String(name)
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

function seededRandom(seed) {
  let hash = 0

  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }

  return () => {
    const x = Math.sin(hash++) * 10000
    return x - Math.floor(x)
  }
}

const getMarketStatus = () => {
  const now = new Date()
  const seed = now.toDateString() + now.getHours()
  const rng = seededRandom(seed)

  const open = rng() > 0.25

  const reason = open
    ? ''
    : MOTIVOS_CLAUSURA[
        Math.floor(rng() * MOTIVOS_CLAUSURA.length)
      ]

  return {
    open,
    reason
  }
}

const getDailyContracts = (jid) => {
  const todayStr = new Date().toDateString()
  const seed = jid + todayStr
  const rng = seededRandom(seed)

  const selectItem = (arr) => {
    return arr[Math.floor(rng() * arr.length)]
  }

  return [
    {
      id: 1,
      type: 'Básico',
      emoji: '🟢',
      item: selectItem(TARGETS.common),
      amount: Math.floor(rng() * 4) + 2,
      rewardZc: Math.floor(rng() * 1500) + 1000,
      rewardKg: 0
    },

    {
      id: 2,
      type: 'Avanzado',
      emoji: '🟣',
      item: selectItem(TARGETS.rare),
      amount: Math.floor(rng() * 2) + 1,
      rewardZc: Math.floor(rng() * 4000) + 3000,
      rewardKg: Math.floor(rng() * 2) + 1
    },

    {
      id: 3,
      type: 'Mítico',
      emoji: '🔥',
      item: selectItem(TARGETS.special),
      amount: 1,
      rewardZc: Math.floor(rng() * 15000) + 15000,
      rewardKg: Math.floor(rng() * 5) + 4
    }
  ]
}

const handler = async (m, { text, userDb }) => {
  if (!userDb) return

  const market = getMarketStatus()

  if (!market.open) {
    const closedTxt =
      `༺ ✰ 𝙼𝙴𝚁𝙲𝙰𝙳𝙾 𝙽𝙴𝙶𝚁𝙾 𝙲𝙴𝚁𝚁𝙰𝙳𝙾 🚨 ✰ ༻\n\n` +
      `✰ ${market.reason}\n\n` +
      `> ✰ 𝙴𝚕 𝚖𝚎𝚛𝚌𝚊𝚍𝚘 𝚌𝚊𝚖𝚋𝚒𝚊 𝚜𝚞 𝚎𝚜𝚝𝚊𝚍𝚘 𝚌𝚊𝚍𝚊 𝚑𝚘𝚛𝚊.\n` +
      `> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚍𝚎 𝚗𝚞𝚎𝚟𝚘 𝚖𝚊́𝚜 𝚝𝚊𝚛𝚍𝚎.\n\n` +
      `༺ ✰ ${config.footer} ✰ ༻`

    return m.reply(closedTxt)
  }

  const todayStr = new Date().toDateString()
  const contracts = getDailyContracts(m.sender)

  userDb.farmMisiones = userDb.farmMisiones || {}

  userDb.farmMisiones.completedGenosContracts =
    userDb.farmMisiones.completedGenosContracts || {}

  const completedToday =
    userDb.farmMisiones.completedGenosContracts[todayStr] || []

  if (!text) {
    let txt =
      `༺ ✰ 📜 𝙲𝙾𝙽𝚃𝚁𝙰𝚃𝙾𝚂 𝙳𝙸𝙰𝚁𝙸𝙾𝚂 ✰ ༻\n\n` +
      `✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${m.sender.split('@')[0]}\n` +
      `✰ 𝙵𝚎𝚌𝚑𝚊: ${todayStr}\n\n` +
      `> ✰ 𝙴𝚗𝚝𝚛𝚎𝚐𝚊 𝚕𝚘𝚜 𝚎𝚜𝚙𝚎𝚌𝚒́𝚖𝚎𝚗𝚎𝚜 𝚜𝚘𝚕𝚒𝚌𝚒𝚝𝚊𝚍𝚘𝚜 𝚢 𝚌𝚘𝚋𝚛𝚊 𝚝𝚞𝚜 𝚛𝚎𝚌𝚘𝚖𝚙𝚎𝚗𝚜𝚊𝚜.\n\n`

    contracts.forEach(c => {
      const isCompleted = completedToday.includes(c.id)
      const tag = normalizeToTag(c.item)

      txt +=
        `༺ ✰ ${c.id}. ${c.emoji} 𝙲𝚘𝚗𝚝𝚛𝚊𝚝𝚘 ${c.type} ✰ ༻\n`

      txt +=
        `✰ 𝚂𝚝𝚊𝚝𝚞𝚜: ${isCompleted ? '𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰𝙳𝙾 ✅' : '𝙳𝙸𝚂𝙿𝙾𝙽𝙸𝙱𝙻𝙴'}\n`

      txt +=
        `> ✰ 𝚁𝚎𝚚𝚞𝚒𝚜𝚒𝚝𝚘: x${c.amount} ${c.item}\n`

      txt +=
        `> ✰ 𝙴𝚝𝚒𝚚𝚞𝚎𝚝𝚊: \`${tag}\`\n`

      txt +=
        `> ✰ 𝙿𝚊𝚐𝚊: ${c.rewardZc.toLocaleString('es-AR')} ${config.CURRENCY_SYMBOL}`

      if (c.rewardKg > 0) {
        txt += ` + ${c.rewardKg} ${config.PREMIUM_SYMBOL}`
      }

      txt += '\n\n'
    })

    txt +=
      `༺ ✰ 𝙴𝙽𝚃𝚁𝙴𝙶𝙰 ✰ ༻\n\n` +
      `> ✰ 𝚄𝚜𝚊: *!contrato entregar <número>*\n\n` +
      `༺ ✰ ${config.footer} ✰ ༻`

    return m.reply(txt, {
      mentions: [m.sender]
    })
  }

  const parts = text.trim().split(/\s+/)
  const action = parts[0]?.toLowerCase()
  const num = parseInt(parts[1])

  if (
    action !== 'entregar' ||
    isNaN(num) ||
    num < 1 ||
    num > 3
  ) {
    return m.reply(
      `༺ ✰ ⚠️ 𝚄𝚂𝙾 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻\n\n` +
      `✰ 𝙵𝚘𝚛𝚖𝚊 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊:\n` +
      `> ✰ *!contrato entregar <1, 2 o 3>*`
    )
  }

  if (completedToday.includes(num)) {
    return m.reply(
      `༺ ✰ 🚫 𝙲𝙾𝙽𝚃𝚁𝙰𝚃𝙾 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰𝙳𝙾 ✰ ༻\n\n` +
      `> ✰ 𝚈𝚊 𝚌𝚘𝚋𝚛𝚊𝚜𝚝𝚎 𝚎𝚜𝚝𝚎 𝚌𝚘𝚗𝚝𝚛𝚊𝚝𝚘 𝚎𝚕 𝚍𝚒́𝚊 𝚍𝚎 𝚑𝚘𝚢.`
    )
  }

  const contract = contracts[num - 1]

  userDb.bestiary = userDb.bestiary || {}
  userDb.aquarium = userDb.aquarium || {}

  const hasInBestiary =
    (userDb.bestiary[contract.item] || 0) >= contract.amount

  const hasInAquarium =
    (userDb.aquarium[contract.item] || 0) >= contract.amount

  if (!hasInBestiary && !hasInAquarium) {
    return m.reply(
      `༺ ✰ ❌ 𝙴𝚂𝙿𝙴𝙲𝙸́𝙼𝙴𝙽𝙴𝚂 𝙸𝙽𝚂𝚄𝙵𝙸𝙲𝙸𝙴𝙽𝚃𝙴𝚂 ✰ ༻\n\n` +
      `> ✰ 𝙽𝚘 𝚙𝚘𝚜𝚎𝚎́𝚜 x${contract.amount} de *${contract.item}*.\n` +
      `> ✰ 𝙴𝚝𝚒𝚚𝚞𝚎𝚝𝚊: \`${normalizeToTag(contract.item)}\`\n` +
      `> ✰ 𝙱𝚞𝚜𝚌𝚊𝚍𝚘 𝚎𝚗: 𝙱𝚎𝚜𝚝𝚒𝚊𝚛𝚒𝚘 𝚘 𝙿𝚎𝚌𝚎𝚛𝚊.`
    )
  }

  const update = {
    $inc: {},
    $set: {},
    $unset: {}
  }

  if (hasInBestiary) {
    const current =
      Number(userDb.bestiary[contract.item]) || 0

    const newCount = current - contract.amount

    if (newCount <= 0) {
      delete userDb.bestiary[contract.item]
      update.$unset[`bestiary.${contract.item}`] = 1
    } else {
      userDb.bestiary[contract.item] = newCount
      update.$inc[`bestiary.${contract.item}`] = -contract.amount
    }
  } else {
    const current =
      Number(userDb.aquarium[contract.item]) || 0

    const newCount = current - contract.amount

    if (newCount <= 0) {
      delete userDb.aquarium[contract.item]
      update.$unset[`aquarium.${contract.item}`] = 1
    } else {
      userDb.aquarium[contract.item] = newCount
      update.$inc[`aquarium.${contract.item}`] = -contract.amount
    }
  }

  completedToday.push(num)

  userDb.farmMisiones.completedGenosContracts[todayStr] =
    completedToday

  update.$set[
    `farmMisiones.completedGenosContracts.${todayStr}`
  ] = completedToday

  userDb.genosCoins =
    (userDb.genosCoins || 0) + contract.rewardZc

  userDb.genos =
    (userDb.genos || 0) + contract.rewardKg

  update.$inc.genosCoins = contract.rewardZc

  if (contract.rewardKg > 0) {
    update.$inc.genos = contract.rewardKg
  }

  if (!Object.keys(update.$unset).length) {
    delete update.$unset
  }

  if (!Object.keys(update.$inc).length) {
    delete update.$inc
  }

  if (!Object.keys(update.$set).length) {
    delete update.$set
  }

  await User.updateOne(
    { jid: m.sender },
    update
  )

  let successTxt =
    `༺ ✰ ✅ 𝙲𝙾𝙽𝚃𝚁𝙰𝚃𝙾 𝙲𝙾𝙱𝚁𝙰𝙳𝙾 ✰ ༻\n\n` +
    `✰ 𝙴𝚗𝚝𝚛𝚎𝚐𝚊 𝚛𝚎𝚊𝚕𝚒𝚣𝚊𝚍𝚊 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.\n\n` +
    `༺ ✰ 𝙴𝙽𝚃𝚁𝙴𝙶𝙰 ✰ ༻\n\n` +
    `> ✰ 𝙲𝚊𝚗𝚝𝚒𝚍𝚊𝚍: x${contract.amount}\n` +
    `> ✰ 𝙴𝚜𝚙𝚎𝚌𝚒𝚖𝚎𝚗: ${contract.item}\n` +
    `> ✰ 𝙴𝚝𝚒𝚚𝚞𝚎𝚝𝚊: \`${normalizeToTag(contract.item)}\`\n\n` +
    `༺ ✰ 𝚁𝙴𝙲𝙾𝙼𝙿𝙴𝙽𝚂𝙰𝚂 ✰ ༻\n\n` +
    `> ✰ ${config.CURRENCY_NAME}: +${contract.rewardZc.toLocaleString('es-AR')} ${config.CURRENCY_SYMBOL}\n`

  if (contract.rewardKg > 0) {
    successTxt +=
      `> ✰ ${config.PREMIUM_NAME}: +${contract.rewardKg} ${config.PREMIUM_SYMBOL}\n`
  }

  successTxt +=
    `\n༺ ✰ ${config.footer} ✰ ༻`

  return m.reply(successTxt)
}

handler.help = [
  'contrato',
  'contrato entregar <número>'
]

handler.tags = ['eco']

handler.command = [
  'contrato',
  'contratos',
  'deliver',
  'entrega'
]

handler.register = true

export default handler