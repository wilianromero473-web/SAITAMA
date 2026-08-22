import User from '../../lib/database/models/zen-users.js'
import { userCache } from '../../lib/caches.js'
import config from '../../config.js'

const extraerNum = (jid = '') => {
  return typeof jid === 'string'
    ? jid.split('@')[0].split(':')[0].replace(/\D/g, '')
    : ''
}

const resolveTargetJid = (m, participants = []) => {
  const raw = m.mentionedJid?.[0] || m.quoted?.sender || null

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

const handler = async (
  m,
  {
    text,
    usedPrefix,
    command,
    participants
  }
) => {

  try {

    const targetRaw = resolveTargetJid(
      m,
      participants
    )

    if (!targetRaw) {
      return m.reply(
`*✰ 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰*

> ✰ *${usedPrefix + command}* <cantidad> <moneda> [bank] @usuario

*✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰*

> ✰ *${usedPrefix + command} 500 genosCoins bank*
> ✰ 𝙾 𝚛𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊𝚕 𝚖𝚎𝚗𝚜𝚊𝚓𝚎 𝚍𝚎𝚕 𝚞𝚜𝚞𝚊𝚛𝚒𝚘.`
      )
    }

    const targetJid =
      targetRaw.includes('@s.whatsapp.net')
        ? targetRaw
        : `${extraerNum(targetRaw)}@s.whatsapp.net`

    const targetNum = extraerNum(targetJid)

    const amountMatch = text.match(/\d+/)

    if (!amountMatch) {
      return m.reply(
`*✰ 𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ✰*

> ✰ 𝙳𝚎𝚋𝚎𝚜 𝚒𝚗𝚍𝚒𝚌𝚊𝚛 𝚞𝚗𝚊 𝚌𝚊𝚗𝚝𝚒𝚍𝚊𝚍 𝚟á𝚕𝚒𝚍𝚊.`
      )
    }

    const amount = parseInt(
      amountMatch[0]
    )

    const isGenos =
      /genos/i.test(text) ||
      new RegExp(
        config.PREMIUM_NAME,
        'i'
      ).test(text)

    const isBank =
      /bank|banco/i.test(text)

    let field = 'genosCoins'
    let locationName = '𝙱𝚒𝚕𝚕𝚎𝚝𝚎𝚛𝚊'

    if (isGenos) {
      field = 'genos'
      locationName = '𝙿𝚛𝚎𝚖𝚒𝚞𝚖'
    } else if (isBank) {
      field = 'bankBalance'
      locationName = '𝙱𝚊𝚗𝚌𝚘'
    }

    const currencySymbol =
      isGenos
        ? config.PREMIUM_SYMBOL
        : config.CURRENCY_SYMBOL

    const v = await User.findOne({
      jid: targetJid
    })

    if (!v) {
      return m.reply(
`*✰ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙽𝙾 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙰𝙳𝙾 ✰*

> ✰ 𝙴𝚕 𝚞𝚜𝚞𝚊𝚛𝚒𝚘 𝚗𝚘 𝚎𝚜𝚝á 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚘 𝚎𝚗 𝚕𝚊 𝚋𝚊𝚜𝚎 𝚍𝚎 𝚍𝚊𝚝𝚘𝚜.`
      )
    }

    const prevAmount = v[field]

    v[field] = amount

    await User.updateOne(
      {
        jid: targetJid
      },
      {
        $set: {
          [field]: amount
        }
      }
    )

    const tCacheJid = userCache.get(
      targetJid
    )

    const tCacheNum = userCache.get(
      targetNum
    )

    if (tCacheJid) {
      tCacheJid[field] = amount
    }

    if (
      tCacheNum &&
      tCacheNum !== tCacheJid
    ) {
      tCacheNum[field] = amount
    }

    const txt =
`*✰ 𝙱𝙰𝙻𝙰𝙽𝙲𝙴 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾 ✰*

> ✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${targetNum}
> ✰ 𝚄𝚋𝚒𝚌𝚊𝚌𝚒ó𝚗: ${locationName}
> ✰ 𝙰𝚗𝚝𝚎𝚛𝚒𝚘𝚛: ${prevAmount} ${currencySymbol}
> ✰ 𝙰𝚌𝚝𝚞𝚊𝚕: ${amount} ${currencySymbol}

*✰ 𝙱𝙰𝙻𝙰𝙽𝙲𝙴 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾 ✰*

> ✰ 𝙴𝚕 𝚋𝚊𝚕𝚊𝚗𝚌𝚎 𝚏𝚞𝚎 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚍𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.`

    return m.reply(
      txt,
      {
        mentions: [
          targetJid
        ]
      }
    )

  } catch (error) {

    console.error(
      '[SETBALANCE]',
      error?.message || error
    )

    return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ✰*

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚛 𝚎𝚕 𝚋𝚊𝚕𝚊𝚗𝚌𝚎.
> ✰ ${error?.message || '𝙴𝚛𝚛𝚘𝚛 𝚍𝚎𝚜𝚌𝚘𝚗𝚘𝚌𝚒𝚍𝚘'}`
    )
  }
}

handler.help = [
  'dejar <cantidad> <moneda> [bank] @user',
  'seteco <cantidad> <moneda> @user',
  'setbalance <cantidad> <moneda> @user'
]

handler.tags = [
  'owner'
]

handler.command = [
  'dejar',
  'seteco',
  'setbalance'
]

handler.ownerOnly = true

export default handler