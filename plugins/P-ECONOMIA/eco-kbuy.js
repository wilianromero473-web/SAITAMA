import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛒 TIENDA DE GENOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const handler = async (m, {
  args,
  usedPrefix,
  command,
  userDb
}) => {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛡️ SEGURIDAD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!userDb) return

  // Precio de 1 Genos
  const price = Number(config.genosPrice || 1000)

  if (!Number.isFinite(price) || price <= 0) {
    return m.reply(
      `༺ 𝙴𝚁𝚁𝙾𝚁 ༻\n\n` +
      `> ✰ El precio de ${config.PREMIUM_NAME} no está configurado correctamente.`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏪 MOSTRAR TIENDA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!args[0]) {

    return m.reply(
      `༺ ${config.PREMIUM_NAME.toUpperCase()} 𝚂𝙷𝙾𝙿 ༻\n\n` +

      `✰ 𝚃𝙸𝙴𝙽𝙳𝙰 𝙳𝙴 ${config.PREMIUM_NAME.toUpperCase()}\n\n` +

      `> ✰ 💵 *𝙿𝚛𝚎𝚌𝚒𝚘:* ` +
      `${price} ${config.CURRENCY_SYMBOL} = ` +
      `1 ${config.PREMIUM_SYMBOL}\n` +

      `> ✰ 💰 *𝚂𝚊𝚕𝚍𝚘:* ` +
      `${Number(userDb.genosCoins || 0)} ` +
      `${config.CURRENCY_SYMBOL}\n\n` +

      `✰ 𝙲𝙾𝙼𝙿𝚁𝙰𝚁\n\n` +

      `> ✰ ✍️ *𝚄𝚜𝚘:* ` +
      `${usedPrefix + command} <cantidad>\n` +

      `> ✰ 💡 *𝙲𝚘𝚖𝚙𝚛𝚊𝚛 𝚝𝚘𝚍𝚘:* ` +
      `${usedPrefix + command} all\n\n` +

      `༺ ${config.footer} ༻`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔢 CANTIDAD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const input = String(args[0]).toLowerCase().trim()

  let amount

  if (input === 'all') {

    const balance = Number(userDb.genosCoins || 0)

    amount = Math.floor(balance / price)

  } else {

    // Solo números enteros positivos
    if (!/^\d+$/.test(input)) {
      return m.reply(
        `༺ 𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ༻\n\n` +
        `> ✰ Debes indicar una cantidad válida.\n` +
        `> ✰ Ejemplo: *${usedPrefix + command} 10*`
      )
    }

    amount = Number(input)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚠️ VALIDAR CANTIDAD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {

    return m.reply(
      `༺ 𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ༻\n\n` +
      `> ✰ La cantidad debe ser mayor a 0.`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💰 CALCULAR COSTO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const totalCost = amount * price

  if (
    !Number.isSafeInteger(totalCost) ||
    totalCost <= 0
  ) {

    return m.reply(
      `༺ 𝙴𝚁𝚁𝙾𝚁 𝙳𝙴 𝙲Á𝙻𝙲𝚄𝙻𝙾 ༻\n\n` +
      `> ✰ La cantidad solicitada es demasiado grande.`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💳 VERIFICAR SALDO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const balance = Number(userDb.genosCoins || 0)

  if (balance < totalCost) {

    return m.reply(
      `༺ 𝙵𝙾𝙽𝙳𝙾𝚂 𝙸𝙽𝚂𝚄𝙵𝙸𝙲𝙸𝙴𝙽𝚃𝙴𝚂 ༻\n\n` +

      `> ✰ 💰 *𝚃𝚞 𝚜𝚊𝚕𝚍𝚘:* ` +
      `${balance} ${config.CURRENCY_SYMBOL}\n` +

      `> ✰ 💵 *𝙽𝚎𝚌𝚎𝚜𝚒𝚝á𝚜:* ` +
      `${totalCost} ${config.CURRENCY_SYMBOL}\n\n` +

      `> ✰ Te faltan *${totalCost - balance} ` +
      `${config.CURRENCY_SYMBOL}*.`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧮 ACTUALIZAR BASE DE DATOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await User.updateOne(
    { jid: m.sender },
    {
      $inc: {
        genosCoins: -totalCost,
        genos: amount
      }
    }
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💳 ACTUALIZAR DATOS LOCALES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  userDb.genosCoins = balance - totalCost
  userDb.genos = Number(userDb.genos || 0) + amount

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ COMPRA EXITOSA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return m.reply(
    `༺ 𝙲𝙾𝙼𝙿𝚁𝙰 𝙴𝚇𝙸𝚃𝙾𝚂𝙰 ༻\n\n` +

    `✰ 𝚃𝚁𝙰𝙽𝚂𝙰𝙲𝙲𝙸Ó𝙽 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰\n\n` +

    `> ✰ 📥 *𝙾𝚋𝚝𝚎𝚗𝚒𝚍𝚘:* ` +
    `+${amount} ${config.PREMIUM_SYMBOL}\n` +

    `> ✰ 📤 *𝙲𝚘𝚜𝚝𝚘:* ` +
    `${totalCost} ${config.CURRENCY_SYMBOL}\n` +

    `> ✰ 💰 *𝚂𝚊𝚕𝚍𝚘:* ` +
    `${userDb.genosCoins} ${config.CURRENCY_SYMBOL}\n` +

    `> ✰ ${config.PREMIUM_SYMBOL} *𝙶𝚎𝚗𝚘𝚜:* ` +
    `${userDb.genos}\n\n` +

    `༺ ${config.footer} ༻`
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'kbuy <cantidad>',
  'kbuy all'
]

handler.tags = ['eco']

handler.command = [
  'kbuy',
  'buygenos'
]

handler.register = true

export default handler