import { RANGOS } from '../../lib/database/models/zen-users.js'
import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

// ═════════════════════════════════════
// ✦ UTILIDADES
// ═════════════════════════════════════

const extraerNum = (jid = '') => {
  if (typeof jid !== 'string') return ''

  return jid
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '')
}

const resolveTargetJid = (m, participants = []) => {
  const raw =
    m.mentionedJid?.[0] ||
    m.quoted?.sender ||
    null

  if (!raw) return null

  if (!raw.endsWith('@lid')) {
    return raw
  }

  const participante = participants.find(
    p => p.id === raw || p.lid === raw
  )

  if (participante?.phoneNumber) {
    const numero = String(participante.phoneNumber)
      .replace(/\D/g, '')

    if (numero) {
      return `${numero}@s.whatsapp.net`
    }
  }

  if (participante?.id?.includes('@s.whatsapp.net')) {
    return participante.id
  }

  return raw
}

const findByNum = async jid => {
  const num = extraerNum(jid)

  if (!num) return null

  return await User.findOne({
    jid: {
      $regex: `^${num}@`
    }
  }).lean()
}

// ═════════════════════════════════════
// ✦ FORMATO DE BALANCE
// ═════════════════════════════════════

const formatBalance = (u, jid, now) => {
  const nivel = Number(u.level) || 0

  const rango =
    RANGOS?.[
      Math.min(
        nivel,
        Math.max(0, RANGOS.length - 1)
      )
    ] || 'Sin rango'

  const genosCoins = Number(u.genosCoins) || 0
  const bankBalance = Number(u.bankBalance) || 0
  const genos = Number(u.genos) || 0
  const bankExpiry = Number(u.bankExpiry) || 0

  const protegido = bankExpiry > now

  let expira = '𝙸𝙽𝙰𝙲𝚃𝙸𝚅𝙾 ⚠️'

  if (protegido) {
    const restante = bankExpiry - now

    const horas = Math.floor(
      restante / 3600000
    )

    const minutos = Math.floor(
      (restante % 3600000) / 60000
    )

    expira = `${horas}𝚑 ${minutos}𝚖`
  }

  return [
    `༺ 𝙲𝚄𝙴𝙽𝚃𝙰 𝙳𝙴 𝙹𝚄𝙴𝙶𝙾 ༻`,
    ``,
    `✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${extraerNum(jid)}`,
    `> ✰ 𝙽𝚒𝚟𝚎𝚕: ${nivel}`,
    `> ✰ 𝚁𝚊𝚗𝚐𝚘: ${rango}`,
    ``,
    `༺ 𝙱𝙸𝙻𝙻𝙴𝚃𝙴𝚁𝙰 ༻`,
    ``,
    `✰ ${config.CURRENCY_NAME}: ${genosCoins} ${config.CURRENCY_SYMBOL}`,
    `> ✰ 𝙴𝚜𝚝𝚊𝚍𝚘: 𝙴𝚇𝙿𝚄𝙴𝚂𝚃𝙾 𝙰 𝚁𝙾𝙱𝙾𝚂`,
    ``,
    `༺ 𝙱𝙰𝙽𝙲𝙾 ༻`,
    ``,
    `✰ 𝚂𝚊𝚕𝚍𝚘: ${bankBalance} ${config.CURRENCY_SYMBOL}`,
    `> ✰ 𝙿𝚛𝚘𝚝𝚎𝚌𝚌𝚒𝚘́𝚗: ${protegido ? '𝙰𝙲𝚃𝙸𝚅𝙰 ✅' : '𝙸𝙽𝙰𝙲𝚃𝙸𝚅𝙰 ❌'}`,
    `> ✰ 𝙴𝚡𝚙𝚒𝚛𝚊: ${expira}`,
    ``,
    `༺ 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 ༻`,
    ``,
    `✰ ${config.PREMIUM_NAME}: ${genos} ${config.PREMIUM_SYMBOL}`,
    ``,
    `༺ ${config.footer} ༻`
  ].join('\n')
}

// ═════════════════════════════════════
// ✦ HANDLER PRINCIPAL
// ═════════════════════════════════════

const handler = async (
  m,
  {
    userDb,
    participants = []
  }
) => {
  if (!userDb) {
    return m.reply(
      `༺ 𝙴𝚁𝚁𝙾𝚁 ༻\n\n` +
      `✰ 𝙲𝚞𝚎𝚗𝚝𝚊 𝚗𝚘 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚍𝚊\n` +
      `> ✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚛𝚘𝚗 𝚝𝚞𝚜 𝚍𝚊𝚝𝚘𝚜.`
    )
  }

  const senderJid =
    userDb.jid || m.sender

  const now = Date.now()

  // ═══════════════════════════════════
  // ✦ USUARIO CONSULTADO
  // ═══════════════════════════════════

  const targetRaw = resolveTargetJid(
    m,
    participants
  )

  const isSelf =
    !targetRaw ||
    extraerNum(targetRaw) ===
      extraerNum(senderJid)

  if (!isSelf) {
    const usuario =
      await findByNum(targetRaw)

    if (!usuario) {
      return m.reply(
        `༺ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙽𝙾 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙰𝙳𝙾 ༻\n\n` +
        `✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚘́ 𝚕𝚊 𝚌𝚞𝚎𝚗𝚝𝚊 𝚍𝚎 𝚎𝚜𝚎 𝚞𝚜𝚞𝚊𝚛𝚒𝚘.`
      )
    }

    return m.reply(
      formatBalance(
        usuario,
        usuario.jid,
        now
      ),
      {
        mentions: [usuario.jid]
      }
    )
  }

  // ═══════════════════════════════════
  // ✦ PROTECCIÓN DEL BANCO
  // ═══════════════════════════════════

  if (
    Number(userDb.bankBalance) > 0 &&
    Number(userDb.bankExpiry) > 0 &&
    now > Number(userDb.bankExpiry)
  ) {
    const amount =
      Number(userDb.bankBalance)

    await User.updateOne(
      { jid: senderJid },
      {
        $inc: {
          genosCoins: amount
        },
        $set: {
          bankBalance: 0,
          bankExpiry: 0
        }
      }
    )
  }

  // ═══════════════════════════════════
  // ✦ DATOS ACTUALIZADOS
  // ═══════════════════════════════════

  const freshUser =
    await User.findOne({
      jid: senderJid
    }).lean()

  const cuenta =
    freshUser || userDb

  // ═══════════════════════════════════
  // ✦ MOSTRAR BALANCE
  // ═══════════════════════════════════

  return m.reply(
    formatBalance(
      cuenta,
      senderJid,
      now
    ),
    {
      mentions: [senderJid]
    }
  )
}

// ═════════════════════════════════════
// ✦ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'balance',
  'balance @usuario'
]

handler.tags = ['eco']

handler.command = [
  'bal',
  'balance',
  'wallet',
  'cartera',
  'puntos'
]

handler.register = true

export default handler