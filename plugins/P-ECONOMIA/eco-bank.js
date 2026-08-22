import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

// ═════════════════════════════════════
// ✦ UTILIDADES
// ═════════════════════════════════════

const esTodo = valor => {
  return ['all', 'todo'].includes(
    String(valor || '').toLowerCase()
  )
}

const numeroValido = valor => {
  const numero = Number(valor)

  return (
    Number.isFinite(numero) &&
    numero > 0
  )
}

const formatoNumero = numero => {
  return Number(numero || 0).toLocaleString('es-PE')
}

// ═════════════════════════════════════
// ✦ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    text = '',
    usedPrefix,
    command,
    userDb
  }
) => {
  if (!userDb) {
    return m.reply(
      `༺ 𝙲𝚄𝙴𝙽𝚃𝙰 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙰 ༻\n\n` +
      `✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚛𝚘𝚗 𝚝𝚞𝚜 𝚍𝚊𝚝𝚘𝚜.`
    )
  }

  const args = String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const now = Date.now()
  const senderJid = userDb.jid || m.sender

  // ═══════════════════════════════════
  // ✦ COMPROBAR BANCO VENCIDO
  // ═══════════════════════════════════

  if (
    Number(userDb.bankBalance) > 0 &&
    Number(userDb.bankExpiry) > 0 &&
    now > Number(userDb.bankExpiry)
  ) {
    const cantidadBanco =
      Number(userDb.bankBalance)

    await User.updateOne(
      { jid: senderJid },
      {
        $inc: {
          genosCoins: cantidadBanco
        },
        $set: {
          bankBalance: 0,
          bankExpiry: 0
        }
      }
    )

    userDb.genosCoins =
      Number(userDb.genosCoins || 0) +
      cantidadBanco

    userDb.bankBalance = 0
    userDb.bankExpiry = 0
  }

  // ═══════════════════════════════════
  // ✦ DEPÓSITO
  // ═══════════════════════════════════

  if (
    ['d', 'dep', 'depositar'].includes(command)
  ) {
    const inputMonto = args[0]
    const horas = Number(args[1])

    if (
      !inputMonto ||
      !Number.isInteger(horas) ||
      horas <= 0
    ) {
      return m.reply(
        `༺ 𝙳𝙴𝙿𝙾́𝚂𝙸𝚃𝙾 ༻\n\n` +
        `✰ 𝚄𝚜𝚘:\n` +
        `> ✰ ${usedPrefix}${command} <monto|all> <horas>\n\n` +
        `✰ 𝙲𝚘𝚜𝚝𝚘:\n` +
        `> ✰ 1 ${config.PREMIUM_SYMBOL} 𝚙𝚘𝚛 𝚑𝚘𝚛𝚊\n\n` +
        `✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:\n` +
        `> ✰ ${usedPrefix}${command} all 24`
      )
    }

    const monto = esTodo(inputMonto)
      ? Number(userDb.genosCoins || 0)
      : Number(inputMonto)

    if (!numeroValido(monto)) {
      return m.reply(
        `༺ 𝙼𝙾𝙽𝚃𝙾 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙾 ༻\n\n` +
        `✰ 𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚞𝚗 𝚖𝚘𝚗𝚝𝚘 𝚖𝚊𝚢𝚘𝚛 𝚚𝚞𝚎 𝟶.`
      )
    }

    const billetera =
      Number(userDb.genosCoins || 0)

    const premium =
      Number(userDb.genos || 0)

    if (billetera < monto) {
      return m.reply(
        `༺ 𝙵𝙾𝙽𝙳𝙾𝚂 𝙸𝙽𝚂𝚄𝙵𝙸𝙲𝙸𝙴𝙽𝚃𝙴𝚂 ༻\n\n` +
        `✰ 𝙽𝚘 𝚝𝚎𝚗𝚎́𝚜 𝚜𝚞𝚏𝚒𝚌𝚒𝚎𝚗𝚝𝚎𝚜 ` +
        `${config.CURRENCY_NAME} 𝚎𝚗 𝚝𝚞 𝚋𝚒𝚕𝚕𝚎𝚝𝚎𝚛𝚊.\n\n` +
        `> ✰ 𝙳𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎: ${formatoNumero(billetera)} ${config.CURRENCY_SYMBOL}\n` +
        `> ✰ 𝚂𝚘𝚕𝚒𝚌𝚒𝚝𝚊𝚍𝚘: ${formatoNumero(monto)} ${config.CURRENCY_SYMBOL}`
      )
    }

    if (premium < horas) {
      return m.reply(
        `༺ 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 𝙸𝙽𝚂𝚄𝙵𝙸𝙲𝙸𝙴𝙽𝚃𝙴 ༻\n\n` +
        `✰ 𝙽𝚎𝚌𝚎𝚜𝚒𝚝𝚊́𝚜 ${horas} ${config.PREMIUM_SYMBOL} ` +
        `𝚙𝚊𝚛𝚊 𝚙𝚛𝚘𝚝𝚎𝚐𝚎𝚛 𝚎𝚕 𝚍𝚎𝚙𝚘́𝚜𝚒𝚝𝚘.\n\n` +
        `> ✰ 𝙳𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎: ${premium} ${config.PREMIUM_SYMBOL}\n` +
        `> ✰ 𝙽𝚎𝚌𝚎𝚜𝚊𝚛𝚒𝚘: ${horas} ${config.PREMIUM_SYMBOL}`
      )
    }

    // Si todavía existe una protección activa,
    // el nuevo tiempo comienza desde su expiración.
    const baseProteccion =
      Number(userDb.bankExpiry) > now
        ? Number(userDb.bankExpiry)
        : now

    const nuevaExpiracion =
      baseProteccion +
      horas * 60 * 60 * 1000

    await User.updateOne(
      { jid: senderJid },
      {
        $inc: {
          genosCoins: -monto,
          genos: -horas,
          bankBalance: monto
        },
        $set: {
          bankExpiry: nuevaExpiracion
        }
      }
    )

    userDb.genosCoins = billetera - monto
    userDb.genos = premium - horas
    userDb.bankBalance =
      Number(userDb.bankBalance || 0) + monto
    userDb.bankExpiry = nuevaExpiracion

    const fecha = new Date(
      nuevaExpiracion
    ).toLocaleString('es-PE')

    return m.reply(
      `༺ ✰ 𝙳𝙴𝙿𝙾́𝚂𝙸𝚃𝙾 ✰ ༻\n\n` +
      `✰ 𝙼𝚘𝚗𝚝𝚘: ${formatoNumero(monto)} ${config.CURRENCY_SYMBOL}\n` +
      `> ✰ 𝙷𝚘𝚛𝚊𝚜: ${horas}\n` +
      `> ✰ 𝙲𝚘𝚜𝚝𝚘: ${horas} ${config.PREMIUM_SYMBOL}\n\n` +
      `✰ 𝙿𝚛𝚘𝚝𝚎𝚐𝚒𝚍𝚘 𝚑𝚊𝚜𝚝𝚊:\n` +
      `> ✰ ${fecha}\n\n` +
      `༺ ${config.footer} ༻`
    )
  }

  // ═══════════════════════════════════
  // ✦ RETIRO
  // ═══════════════════════════════════

  if (
    ['r', 'retirar', 'with'].includes(command)
  ) {
    const inputMonto = args[0]

    if (!inputMonto) {
      return m.reply(
        `༺ 𝚁𝙴𝚃𝙸𝚁𝙾 ༻\n\n` +
        `✰ 𝚄𝚜𝚘:\n` +
        `> ✰ ${usedPrefix}${command} <monto|all>\n\n` +
        `✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:\n` +
        `> ✰ ${usedPrefix}${command} all`
      )
    }

    const saldoBanco =
      Number(userDb.bankBalance || 0)

    const monto = esTodo(inputMonto)
      ? saldoBanco
      : Number(inputMonto)

    if (!numeroValido(monto)) {
      return m.reply(
        `༺ 𝙼𝙾𝙽𝚃𝙾 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙾 ༻\n\n` +
        `✰ 𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚞𝚗 𝚖𝚘𝚗𝚝𝚘 𝚟𝚊́𝚕𝚒𝚍𝚘.`
      )
    }

    if (saldoBanco < monto) {
      return m.reply(
        `༺ 𝚂𝙰𝙻𝙳𝙾 𝙸𝙽𝚂𝚄𝙵𝙸𝙲𝙸𝙴𝙽𝚃𝙴 ༻\n\n` +
        `✰ 𝙽𝚘 𝚝𝚎𝚗𝚎́𝚜 𝚜𝚞𝚏𝚒𝚌𝚒𝚎𝚗𝚝𝚎 𝚍𝚒𝚗𝚎𝚛𝚘 𝚎𝚗 𝚎𝚕 𝚋𝚊𝚗𝚌𝚘.\n\n` +
        `> ✰ 𝙳𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎: ${formatoNumero(saldoBanco)} ${config.CURRENCY_SYMBOL}`
      )
    }

    await User.updateOne(
      { jid: senderJid },
      {
        $inc: {
          bankBalance: -monto,
          genosCoins: monto
        }
      }
    )

    userDb.bankBalance =
      saldoBanco - monto

    userDb.genosCoins =
      Number(userDb.genosCoins || 0) + monto

    return m.reply(
      `༺ ✰ 𝚁𝙴𝚃𝙸𝚁𝙾 𝙴𝚇𝙸𝚃𝙾𝚂𝙾 ✰ ༻\n\n` +
      `✰ 𝙼𝚘𝚗𝚝𝚘 𝚛𝚎𝚝𝚒𝚛𝚊𝚍𝚘: ${formatoNumero(monto)} ${config.CURRENCY_SYMBOL}\n` +
      `> ✰ 𝙳𝚎𝚜𝚝𝚒𝚗𝚘: 𝙱𝚒𝚕𝚕𝚎𝚝𝚎𝚛𝚊\n` +
      `> ✰ 𝚂𝚊𝚕𝚍𝚘 𝚛𝚎𝚜𝚝𝚊𝚗𝚝𝚎: ${formatoNumero(userDb.bankBalance)} ${config.CURRENCY_SYMBOL}\n\n` +
      `༺ ${config.footer} ༻`
    )
  }
}

// ═════════════════════════════════════
// ✦ CONFIGURACIÓN DEL COMANDO
// ═════════════════════════════════════

handler.help = [
  'depositar <monto> <horas>',
  'depositar all <horas>',
  'retirar <monto>',
  'retirar all'
]

handler.tags = ['eco']

handler.command = [
  'd',
  'dep',
  'depositar',
  'r',
  'retirar',
  'with'
]

handler.register = true

export default handler