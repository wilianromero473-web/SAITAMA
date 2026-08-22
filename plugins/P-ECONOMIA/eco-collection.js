import config from '../../config.js'

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

const getCollectionEntries = (collection) => {
  if (!collection) return []

  if (collection instanceof Map) {
    return Array.from(collection.entries())
  }

  if (typeof collection.toJSON === 'function') {
    return Object.entries(collection.toJSON())
  }

  if (typeof collection === 'object') {
    return Object.entries(collection)
  }

  return []
}

const handler = async (m, { conn, command, userDb }) => {
  if (!userDb) return

  const isBestiary = ['bestiario', 'bestiary', 'cazas'].includes(command)

  const collection = isBestiary
    ? userDb.bestiary
    : userDb.aquarium

  const title = isBestiary
    ? '𝙱𝙴𝚂𝚃𝙸𝙰𝚁𝙸𝙾'
    : '𝙿𝙴𝙲𝙴𝚁𝙰'

  const symbol = isBestiary ? '🐾' : '🐟'

  const action = isBestiary
    ? '𝚌𝚊𝚣𝚊𝚛'
    : '𝚙𝚎𝚜𝚌𝚊𝚛'

  let items = getCollectionEntries(collection)

  items = items.filter(([key, value]) => {
    if (!key) return false
    if (key.startsWith('$')) return false
    if (key.startsWith('_')) return false
    if (key === 'init') return false

    const cantidad = Number(value)

    return Number.isFinite(cantidad) && cantidad > 0
  })

  if (!items.length) {
    return m.reply(
      `༺ ✰ 𝙲𝙾𝙻𝙴𝙲𝙲𝙸𝙾́𝙽 ✰ ༻\n\n` +
      `✰ 𝚃𝚞 ${title.toLowerCase()} está vacío.\n\n` +
      `> ✰ ¡Sal a ${action} algo para comenzar tu colección!`
    )
  }

  items.sort((a, b) => Number(b[1]) - Number(a[1]))

  const numero = String(m.sender).split('@')[0]

  let txt =
    `༺ ✰ ${title} ${symbol} ✰ ༻\n\n` +
    `✰ 𝙳𝚞𝚎𝚗̃𝚘: @${numero}\n` +
    `✰ 𝙳𝚎𝚜𝚌𝚞𝚋𝚛𝚒𝚖𝚒𝚎𝚗𝚝𝚘𝚜: ${items.length}\n\n` +
    `༺ ✰ 𝙻𝙸𝚂𝚃𝙰𝙳𝙾 ✰ ༻\n\n`

  items.forEach(([name, count], index) => {
    const tag = normalizeToTag(name)

    txt +=
      `✰ ${index + 1}. *${name}*\n` +
      `> ✰ 𝙴𝚝𝚒𝚚𝚞𝚎𝚝𝚊: \`${tag || 'sin_tag'}\`\n` +
      `> ✰ 𝙲𝚊𝚗𝚝𝚒𝚍𝚊𝚍: x${count}\n\n`
  })

  txt +=
    `༺ ✰ 𝙸𝙽𝙵𝙾 ✰ ༻\n\n` +
    `> ✰ 𝚅𝚎𝚗𝚍𝚎 𝚝𝚞𝚜 𝚌𝚊𝚙𝚝𝚞𝚛𝚊𝚜 𝚌𝚘𝚗 *${config.CURRENCY_NAME}* ` +
    `𝚢 *${config.PREMIUM_NAME}* usando el sistema de contratos.\n\n` +
    `༺ ✰ ${config.footer} ✰ ༻`

  await conn.sendMessage(
    m.chat,
    {
      text: txt,
      mentions: [m.sender]
    },
    { quoted: m }
  )
}

handler.help = [
  'bestiario',
  'pecera'
]

handler.tags = ['eco']

handler.command = [
  'bestiario',
  'bestiary',
  'cazas',
  'pecera',
  'peces',
  'aquarium'
]

handler.register = true

export default handler