import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 𝙎𝘼𝙄𝙏𝘼𝙈𝘼𝘽𝙊𝙏 · 𝙎𝙄𝙎𝙏𝙀𝙈𝘼 𝘿𝙀 𝙍𝙊𝘽𝙊
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const extraerNum = (jid = '') => {
  if (typeof jid !== 'string') return ''
  return jid
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 𝙍𝙀𝙎𝙊𝙇𝙑𝙀𝙍 𝙊𝘽𝙅𝙀𝙏𝙄𝙑𝙊
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const resolveTargetJid = (m, participants = []) => {
  const raw = m.mentionedJid?.[0] || m.quoted?.sender || null

  if (!raw) return null

  if (!raw.endsWith('@lid')) {
    return raw
  }

  const participant = participants.find(
    p => p.id === raw || p.lid === raw
  )

  if (participant?.phoneNumber) {
    const number = String(participant.phoneNumber).replace(/\D/g, '')
    if (number) return `${number}@s.whatsapp.net`
  }

  if (participant?.id?.includes('@s.whatsapp.net')) {
    return participant.id
  }

  return raw
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 𝘽𝙐𝙎𝘾𝘼𝙍 𝙐𝙎𝙐𝘼𝙍𝙄𝙊
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const findByNum = async jid => {
  const num = extraerNum(jid)

  if (!num) return null

  return User.findOne({
    jid: {
      $regex: `^${num}@`
    }
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 𝙀𝙎𝘾𝙐𝘿𝙊𝙎
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SHIELD_REFUND = {
  normal: 0,
  rare: 0.05,
  mythic: 0.15
}

const SHIELD_ICON = {
  normal: '🛡️',
  rare: '🔰',
  mythic: '✨'
}

const bestShield = inv => {
  const stock =
    inv?.shieldStock instanceof Map
      ? Object.fromEntries(inv.shieldStock)
      : (inv?.shieldStock || {})

  for (const tier of ['mythic', 'rare', 'normal']) {
    if (Number(stock[tier]) > 0) {
      return { tier }
    }
  }

  // Compatibilidad con el sistema antiguo
  if (
    Number(inv?.shield || 0) > 0 &&
    !stock.normal &&
    !stock.rare &&
    !stock.mythic
  ) {
    return {
      tier: 'normal',
      legacy: true
    }
  }

  return null
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 𝙃𝘼𝙉𝘿𝙇𝙀𝙍
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const handler = async (m, { userDb, participants }) => {
  if (!userDb) return

  const senderJid = userDb.jid

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 𝘾𝙊𝙊𝙇𝘿𝙊𝙒𝙉
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const cooldown = 1800000
  const now = Date.now()
  const lastRob = Number(userDb.lastRob || 0)
  const elapsed = now - lastRob

  if (elapsed < cooldown) {
    const remaining = cooldown - elapsed
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)

    return m.reply(
      `-𝙳𝚁𝙾𝙸𝙳 ༻\n\n` +
      `✰ 𝙎𝙞𝙨𝙩𝙚𝙢𝙖: 𝙀𝙣 𝙚𝙣𝙛𝙧𝙞𝙖𝙢𝙞𝙚𝙣𝙩𝙤\n` +
      `✰ 𝙀𝙨𝙥𝙚𝙧𝙖: *${minutes}m ${seconds}s*\n\n` +
      `> ✦ El sistema de robo todavía está en enfriamiento.`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 𝙊𝘽𝙏𝙀𝙉𝙀𝙍 𝙑𝙄𝘾𝙏𝙄𝙈𝘼
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const targetRaw = resolveTargetJid(m, participants)

  if (
    !targetRaw ||
    extraerNum(targetRaw) === extraerNum(m.sender)
  ) {
    return m.reply(
      `-𝙳𝚁𝙾𝙸𝙳 ༻\n\n` +
      `✰ 𝙐𝙨𝙤: 𝙊𝙗𝙟𝙚𝙩𝙞𝙫𝙤\n` +
      `✰ 𝙀𝙩𝙞𝙦𝙪𝙚𝙩𝙖 𝙤 𝙧𝙚𝙨𝙥𝙤𝙣𝙙𝙚 𝙖 𝙪𝙣 𝙪𝙨𝙪𝙖𝙧𝙞𝙤.\n\n` +
      `> ✦ Ejemplo: *${m.prefix || '.'}robar @usuario*`
    )
  }

  const victim = await findByNum(targetRaw)

  if (!victim) {
    return m.reply(
      `-𝙳𝚁𝙾𝙸𝙳 ༻\n\n` +
      `✰ 𝙀𝙨𝙩𝙖𝙙𝙤: 𝙉𝙤 𝙚𝙣𝙘𝙤𝙣𝙩𝙧𝙖𝙙𝙤\n` +
      `✰ 𝙐𝙨𝙪𝙖𝙧𝙞𝙤: 𝙉𝙤 𝙧𝙚𝙜𝙞𝙨𝙩𝙧𝙖𝙙𝙤\n\n` +
      `> ✦ El objetivo todavía no tiene una cuenta registrada.`
    )
  }

  const targetJid = victim.jid

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 𝙀𝙎𝘾𝙐𝘿𝙊
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const shield = bestShield(victim.inventory)

  if (shield) {
    const updateTarget = {
      $inc: {}
    }

    // Escudo antiguo
    if (shield.legacy) {
      updateTarget.$inc['inventory.shield'] = -1
    } else {
      updateTarget.$inc[
        `inventory.shieldStock.${shield.tier}`
      ] = -1

      updateTarget.$inc['inventory.shield'] = -1
    }

    const refundPct = SHIELD_REFUND[shield.tier] || 0

    const attackerCoins = Math.max(
      0,
      Number(userDb.genosCoins || 0)
    )

    let refund = 0

    if (refundPct > 0 && attackerCoins > 0) {
      refund = Math.floor(attackerCoins * refundPct)

      if (refund > 0) {
        updateTarget.$inc.genosCoins = refund
      }
    }

    userDb.lastRob = now

    const updateSender = {
      $set: {
        lastRob: now
      }
    }

    if (refund > 0) {
      updateSender.$inc = {
        genosCoins: -refund
      }
    }

    await Promise.all([
      User.updateOne(
        { jid: targetJid },
        updateTarget
      ),

      User.updateOne(
        { jid: senderJid },
        updateSender
      )
    ])

    let shieldTxt =
      `-𝙳𝚁𝙾𝙸𝙳 ༻\n\n` +

      `✰ 𝙀𝙨𝙘𝙪𝙙𝙤: ${SHIELD_ICON[shield.tier]} *${shield.tier.toUpperCase()}*\n` +
      `✰ 𝙀𝙨𝙩𝙖𝙙𝙤: 𝙄𝙣𝙩𝙧𝙪𝙨𝙞𝙤́𝙣 𝙙𝙚𝙩𝙚𝙣𝙞𝙙𝙖\n\n` +

      `> ✦ Intentaste robar a @${extraerNum(targetJid)}.\n` +
      `> ✦ Su escudo bloqueó completamente el ataque.\n` +
      `> ✦ El escudo fue destruido.`

    if (refund > 0) {
      shieldTxt +=
        `\n\n` +
        `✰ 𝙋𝙚𝙣𝙖𝙡𝙞𝙯𝙖𝙘𝙞𝙤́𝙣: *${refund} ${config.CURRENCY_NAME}*\n` +
        `> ✦ Los fondos fueron transferidos a @${extraerNum(targetJid)}.`
    }

    return m.reply(
      shieldTxt,
      {
        mentions: [targetJid]
      }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 𝘾𝘼𝙋𝙄𝙏𝘼𝙇 𝙀𝙓𝙋𝙐𝙀𝙎𝙏𝙊
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const wallet = Math.max(
    0,
    Number(victim.genosCoins || 0)
  )

  const bank = Math.max(
    0,
    Number(victim.bankBalance || 0)
  )

  const bankExpiry = Number(victim.bankExpiry || 0)
  const bancoProtegido = bankExpiry > now

  let capitalExpuesto = wallet

  if (!bancoProtegido) {
    capitalExpuesto += bank
  }

  if (capitalExpuesto < 500) {
    userDb.lastRob = now

    await User.updateOne(
      { jid: senderJid },
      {
        $set: {
          lastRob: now
        }
      }
    )

    return m.reply(
      `-𝙳𝚁𝙾𝙸𝙳 ༻\n\n` +
      `✰ 𝙀𝙨𝙩𝙖𝙙𝙤: 𝙑𝙞́𝙘𝙩𝙞𝙢𝙖 𝙥𝙤𝙗𝙧𝙚\n` +
      `✰ 𝘾𝙖𝙥𝙞𝙩𝙖𝙡: *${capitalExpuesto} ${config.CURRENCY_NAME}*\n\n` +
      `> ✦ El objetivo no tiene suficiente capital expuesto para realizar el robo.`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 𝙋𝙍𝙊𝘽𝘼𝘽𝙄𝙇𝙄𝘿𝘼𝘿
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  userDb.lastRob = now

  let chanceExito = 0.50
  let bonus = []

  if (userDb.inventory?.amulet === 'thief') {
    chanceExito = 0.60

    bonus.push(
      `✰ 𝘼𝙢𝙪𝙡𝙚𝙩𝙤 𝙙𝙚𝙡 𝙇𝙖𝙙𝙧𝙤́𝙣: +10%`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 𝙍𝙊𝘽𝙊 𝙀𝙓𝙄𝙏𝙊𝙎𝙊
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (Math.random() < chanceExito) {

    // 10% del capital expuesto
    const robado = Math.max(
      1,
      Math.floor(capitalExpuesto * 0.10)
    )

    let lossWallet = Math.min(
      wallet,
      robado
    )

    let lossBank = Math.max(
      0,
      robado - lossWallet
    )

    // Seguridad adicional
    if (lossBank > bank) {
      lossBank = bank
    }

    const totalRobado = lossWallet + lossBank

    if (totalRobado <= 0) {
      return m.reply(
        `-𝙳𝚁𝙾𝙸𝙳 ༻\n\n` +
        `✰ 𝙀𝙧𝙧𝙤𝙧: 𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙧𝙚𝙖𝙡𝙞𝙯𝙖𝙧 𝙚𝙡 𝙧𝙤𝙗𝙤.`
      )
    }

    const updateTarget = {
      $inc: {
        genosCoins: -lossWallet
      }
    }

    if (lossBank > 0) {
      updateTarget.$inc.bankBalance = -lossBank
    }

    await Promise.all([
      User.updateOne(
        { jid: targetJid },
        updateTarget
      ),

      User.updateOne(
        { jid: senderJid },
        {
          $inc: {
            genosCoins: totalRobado
          },
          $set: {
            lastRob: now
          }
        }
      )
    ])

    let msg =
      `-𝙳𝚁𝙾𝙸𝙳 ༻\n\n` +

      `✰ 𝙀𝙨𝙩𝙖𝙙𝙤: 🟢 𝙀𝙭𝙞𝙩𝙤𝙨𝙤\n` +
      `✰ 𝙑𝙞́𝙘𝙩𝙞𝙢𝙖: @${extraerNum(targetJid)}\n` +
      `✰ 𝘽𝙤𝙩𝙞́𝙣: *${totalRobado} ${config.CURRENCY_NAME}*\n`

    if (lossWallet > 0) {
      msg +=
        `✰ 𝘾𝙖𝙧𝙩𝙚𝙧𝙖: *${lossWallet} ${config.CURRENCY_NAME}*\n`
    }

    if (lossBank > 0) {
      msg +=
        `✰ 𝘽𝙖𝙣𝙘𝙤: *${lossBank} ${config.CURRENCY_NAME}*\n`
    }

    if (!bancoProtegido && lossBank > 0) {
      msg +=
        `\n> 🔓 El banco no tenía protección y también fue saqueado.`
    }

    if (bonus.length) {
      msg +=
        `\n\n✰ 𝙋𝙤𝙩𝙚𝙣𝙘𝙞𝙖𝙙𝙤𝙧𝙚𝙨\n` +
        bonus.join('\n')
    }

    msg +=
      `\n\n-𝙎𝙖𝙞𝙩𝙖𝙢𝙖𝘽𝙤𝙩 ༻`

    return m.reply(
      msg,
      {
        mentions: [targetJid]
      }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 𝙍𝙊𝘽𝙊 𝙁𝘼𝙇𝙇𝙄𝘿𝙊
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const multa = 500

  const attackerCoins = Math.max(
    0,
    Number(userDb.genosCoins || 0)
  )

  const loss = Math.min(
    attackerCoins,
    multa
  )

  await User.updateOne(
    { jid: senderJid },
    {
      $inc: {
        genosCoins: -loss
      },
      $set: {
        lastRob: now
      }
    }
  )

  let failMsg =
    `-𝙳𝚁𝙾𝙸𝙳 ༻\n\n` +

    `✰ 𝙀𝙨𝙩𝙖𝙙𝙤: 🔴 𝙁𝙖𝙡𝙡𝙞𝙙𝙤\n` +
    `✰ 𝙊𝙗𝙟𝙚𝙩𝙞𝙫𝙤: @${extraerNum(targetJid)}\n\n` +

    `> 👮 La policía detectó tu intento de robo.\n` +
    `> 💸 𝙈𝙪𝙡𝙩𝙖: *${loss} ${config.CURRENCY_NAME}*`

  if (bonus.length) {
    failMsg +=
      `\n\n✰ 𝙋𝙤𝙩𝙚𝙣𝙘𝙞𝙖𝙙𝙤𝙧𝙚𝙨\n` +
      bonus.join('\n')
  }

  failMsg +=
    `\n\n-𝙎𝙖𝙞𝙩𝙖𝙢𝙖𝘽𝙤𝙩 ༻`

  return m.reply(
    failMsg,
    {
      mentions: [targetJid]
    }
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 𝙈𝙀𝙏𝘼𝘿𝘼𝙏𝘼 𝘿𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'robar @tag'
]

handler.tags = [
  'eco'
]

handler.command = [
  'rob',
  'robar'
]

handler.groupOnly = true
handler.register = true

export default handler