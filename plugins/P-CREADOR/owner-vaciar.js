import User from '../../lib/database/models/zen-users.js'
import { userCache } from '../../lib/caches.js'
import config from '../../config.js'

const extraerNum = (jid = '') =>
  (typeof jid === 'string' ? jid : '')
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '')

const resolveTargetJid = (m, participants = []) => {
  const raw =
    m.mentionedJid?.[0] ||
    m.quoted?.sender ||
    null

  if (!raw) return null

  if (!raw.endsWith('@lid')) {
    return raw
  }

  const p = participants.find(
    p => p.id === raw || p.lid === raw
  )

  if (p?.phoneNumber) {
    return `${String(p.phoneNumber).replace(/\D/g, '')}@s.whatsapp.net`
  }

  if (p?.id?.includes('@s.whatsapp.net')) {
    return p.id
  }

  return raw
}

const limpiarCache = cache => {

  if (!cache) return

  cache.genosCoins = 0
  cache.bankBalance = 0
  cache.bankExpiry = 0
  cache.genos = 0
  cache.level = 0
  cache.xp = 0

  cache.inventory = {
    pickaxe: 'none',
    pickaxeDurability: 0,
    bow: 'none',
    bowDurability: 0,
    bait: 'none',
    baitDurability: 0,
    sword: 0,
    potion: 0,
    shield: 0,
    suit: false,
    mask: false
  }

  cache.bestiary = {}
  cache.aquarium = {}
}

const handler = async (
  m,
  {
    usedPrefix,
    command,
    participants
  }
) => {

  try {

    const targetRaw =
      resolveTargetJid(
        m,
        participants
      )

    if (!targetRaw) {

      return m.reply(
`*✰ 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰*

> ✰ *${usedPrefix + command}* @usuario

> ✰ 𝚃𝚊𝚖𝚋𝚒é𝚗 𝚙𝚞𝚎𝚍𝚎𝚜 𝚛𝚎𝚜𝚙𝚘𝚗𝚍𝚎𝚛 𝚊𝚕 𝚖𝚎𝚗𝚜𝚊𝚓𝚎 𝚍𝚎𝚕 𝚞𝚜𝚞𝚊𝚛𝚒𝚘.`
      )

    }

    const targetJid =
      targetRaw.includes('@s.whatsapp.net')
        ? targetRaw
        : `${extraerNum(targetRaw)}@s.whatsapp.net`

    const targetNum =
      extraerNum(targetJid)

    if (targetJid === m.sender) {

      return m.reply(
`*✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙳𝙴𝙽𝙴𝙶𝙰𝙳𝙰 ✰*

> ✰ 𝙽𝚘 𝚙𝚞𝚎𝚍𝚎𝚜 𝚟𝚊𝚌𝚒𝚊𝚛 𝚝𝚞 𝚙𝚛𝚘𝚙𝚒𝚊 𝚌𝚞𝚎𝚗𝚝𝚊.`
      )

    }

    const usuario =
      await User.findOne({
        jid: targetJid
      })

    if (!usuario) {

      return m.reply(
`*✰ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙽𝙾 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙰𝙳𝙾 ✰*

> ✰ 𝙴𝚕 𝚞𝚜𝚞𝚊𝚛𝚒𝚘 𝚗𝚘 𝚎𝚜𝚝á 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚘 𝚎𝚗 𝚕𝚊 𝚋𝚊𝚜𝚎 𝚍𝚎 𝚍𝚊𝚝𝚘𝚜.`
      )

    }

    const resetData = {

      genosCoins: 0,
      bankBalance: 0,
      bankExpiry: 0,
      genos: 0,

      level: 0,
      xp: 0,

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

      bestiary: {},
      aquarium: {}

    }

    await User.updateOne(
      {
        jid: targetJid
      },
      {
        $set: resetData
      }
    )

    const cacheJid =
      userCache.get(targetJid)

    const cacheNum =
      userCache.get(targetNum)

    limpiarCache(cacheJid)

    if (
      cacheNum &&
      cacheNum !== cacheJid
    ) {
      limpiarCache(cacheNum)
    }

    return m.reply(
`*✰ 𝙱𝙰𝙽𝙲𝙰𝚁𝚁𝙾𝚃𝙰 𝚃𝙾𝚃𝙰𝙻 ✰*

> ✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${targetNum}

> ✰ 𝙻𝚊 𝚌𝚞𝚎𝚗𝚝𝚊 𝚏𝚞𝚎 𝚟𝚊𝚌𝚒𝚊𝚍𝚊 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

> ✰ 𝙱𝚒𝚕𝚕𝚎𝚝𝚎𝚛𝚊: 0
> ✰ 𝙱𝚊𝚗𝚌𝚘: 0
> ✰ ${config.PREMIUM_NAME}: 0
> ✰ 𝙽𝚒𝚟𝚎𝚕: 0
> ✰ 𝚇𝙿: 0
> ✰ 𝙸𝚗𝚟𝚎𝚗𝚝𝚊𝚛𝚒𝚘: 𝚅𝚊𝚌í𝚘
> ✰ 𝙲𝚘𝚕𝚎𝚌𝚌𝚒𝚘𝚗𝚎𝚜: 𝚁𝚎𝚒𝚗𝚒𝚌𝚒𝚊𝚍𝚊𝚜

> ✰ 𝙲𝚛é𝚍𝚒𝚝𝚘: ${config.footer}`,
      {
        mentions: [targetJid]
      }
    )

  } catch (error) {

    console.error(
      '[BANCARROTA]',
      error?.message || error
    )

    return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ✰*

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚟𝚊𝚌𝚒𝚊𝚛 𝚕𝚊 𝚌𝚞𝚎𝚗𝚝𝚊.

> ✰ ${error?.message || 'Error desconocido'}`
    )

  }
}

handler.help = [
  'vaciar @user',
  'cleareco @user',
  'resetuser @user',
  'bancarrota @user'
]

handler.tags = [
  'owner'
]

handler.command = [
  'vaciar',
  'cleareco',
  'resetuser',
  'bancarrota'
]

handler.ownerOnly = true

export default handler