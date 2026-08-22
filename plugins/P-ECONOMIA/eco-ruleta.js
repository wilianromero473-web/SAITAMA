import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const handler = async (m, { text, usedPrefix, command, userDb }) => {
  if (!userDb) return

  // ───────────── CONFIGURACIÓN ─────────────
  const MAX_JUGADAS = 15
  const COOLDOWN = 300000
  const MIN_APUESTA = 100
  const MAX_APUESTA = 10000

  // ───────────── ESTADÍSTICAS ─────────────
  userDb.dailyStats = userDb.dailyStats || {}

  userDb.dailyStats.rouletteCount =
    Number(userDb.dailyStats.rouletteCount) || 0

  const jugadas = userDb.dailyStats.rouletteCount

  // ───────────── LÍMITE DIARIO ─────────────
  if (jugadas >= MAX_JUGADAS) {
    return m.reply(
      `✰ 𝙻í𝚖𝚒𝚝𝚎 𝚍𝚒𝚊𝚛𝚒𝚘\n\n` +
      `> Ya alcanzaste tus *${MAX_JUGADAS}* jugadas de ruleta por hoy.\n` +
      `> Volvé mañana para continuar.\n\n` +
      `✰ 𝙹𝚞𝚐𝚊𝚍𝚊𝚜: *${jugadas}/${MAX_JUGADAS}*\n\n` +
      `- ${config.footer}`
    )
  }

  // ───────────── COOLDOWN ─────────────
  const ahora = Date.now()
  const ultimoJuego = Number(userDb.lastRoulette) || 0
  const transcurrido = ahora - ultimoJuego

  if (transcurrido < COOLDOWN) {
    const restante = COOLDOWN - transcurrido
    const minutos = Math.floor(restante / 60000)
    const segundos = Math.floor((restante % 60000) / 1000)

    return m.reply(
      `✰ 𝙼𝚎𝚜𝚊 𝚘𝚌𝚞𝚙𝚊𝚍𝚊\n\n` +
      `> Esperá antes de volver a girar la ruleta.\n\n` +
      `✰ 𝚃𝚒𝚎𝚖𝚙𝚘: *${minutos}m ${segundos}s*\n\n` +
      `- ${config.footer}`
    )
  }

  // ───────────── ARGUMENTOS ─────────────
  const args = (text || '').trim().split(/\s+/)

  const eleccion = args[0]?.toLowerCase()
  const monto = Number.parseInt(args[1], 10)

  // ───────────── AYUDA ─────────────
  const helpTxt =
    `✰ 𝙽𝚘𝚖𝚋𝚛𝚎: *𝚁𝚞𝚕𝚎𝚝𝚊*\n` +
    `✰ 𝚄𝚜𝚘: *${usedPrefix + command} <opción> <monto>*\n\n` +
    `✰ 𝙾𝚙𝚌𝚒𝚘𝚗𝚎𝚜:\n` +
    `> 🔴 *rojo* — x2\n` +
    `> ⚫ *negro* — x2\n` +
    `> 🟢 *verde* — x15\n\n` +
    `✰ 𝙰𝚙𝚞𝚎𝚜𝚝𝚊:\n` +
    `> Mínimo: *${MIN_APUESTA} ${config.CURRENCY_SYMBOL}*\n` +
    `> Máximo: *${MAX_APUESTA} ${config.CURRENCY_SYMBOL}*\n\n` +
    `✰ 𝙹𝚞𝚐𝚊𝚍𝚊𝚜: *${jugadas}/${MAX_JUGADAS}*\n\n` +
    `- ${config.footer}`

  if (!eleccion || Number.isNaN(monto)) {
    return m.reply(helpTxt)
  }

  // ───────────── VALIDAR OPCIÓN ─────────────
  if (!['rojo', 'negro', 'verde'].includes(eleccion)) {
    return m.reply(
      `✰ 𝙾𝚙𝚌𝚒ó𝚗 𝚒𝚗𝚟á𝚕𝚒𝚍𝚊\n\n` +
      `> Elegí una de estas opciones:\n` +
      `> 🔴 *rojo*\n` +
      `> ⚫ *negro*\n` +
      `> 🟢 *verde*\n\n` +
      `- ${config.footer}`
    )
  }

  // ───────────── VALIDAR MONTO ─────────────
  if (monto < MIN_APUESTA || monto > MAX_APUESTA) {
    return m.reply(
      `✰ 𝙼𝚘𝚗𝚝𝚘 𝚒𝚗𝚟á𝚕𝚒𝚍𝚘\n\n` +
      `> La apuesta debe estar entre *${MIN_APUESTA}* y *${MAX_APUESTA} ${config.CURRENCY_NAME}*.\n\n` +
      `- ${config.footer}`
    )
  }

  // ───────────── VALIDAR SALDO ─────────────
  const saldo = Number(userDb.genosCoins) || 0

  if (saldo < monto) {
    return m.reply(
      `✰ 𝚂𝚊𝚕𝚍𝚘 𝚒𝚗𝚜𝚞𝚏𝚒𝚌𝚒𝚎𝚗𝚝𝚎\n\n` +
      `✰ 𝚂𝚊𝚕𝚍𝚘: *${saldo} ${config.CURRENCY_SYMBOL}*\n` +
      `✰ 𝙰𝚙𝚞𝚎𝚜𝚝𝚊: *${monto} ${config.CURRENCY_SYMBOL}*\n\n` +
      `> No tenés suficientes ${config.CURRENCY_NAME} para realizar esta apuesta.\n\n` +
      `- ${config.footer}`
    )
  }

  // ───────────── NÚMEROS DE RULETA ─────────────
  const numerosRojos = [
    1, 3, 5, 7, 9,
    12, 14, 16, 18,
    19, 21, 23, 25, 27,
    30, 32, 34, 36
  ]

  const numero = Math.floor(Math.random() * 37)

  const colorGanador =
    numero === 0
      ? 'verde'
      : numerosRojos.includes(numero)
        ? 'rojo'
        : 'negro'

  // ───────────── RESULTADO ─────────────
  let gano = eleccion === colorGanador
  let suerteAmuleto = false

  // ───────────── AMULETO DEL TAHÚR ─────────────
  if (
    !gano &&
    userDb.inventory?.amulet === 'gambler' &&
    Math.random() < 0.05
  ) {
    gano = true
    suerteAmuleto = true
  }

  // ───────────── MULTIPLICADOR ─────────────
  const multiplicador = eleccion === 'verde' ? 15 : 2

  // Ganancia neta.
  // Si gana, se suma únicamente la ganancia.
  // Si pierde, se descuenta la apuesta.
  const ganancia = gano
    ? monto * (multiplicador - 1)
    : -monto

  // ───────────── ACTUALIZAR DATOS ─────────────
  const nuevaCantidadJugadas = jugadas + 1

  userDb.lastRoulette = ahora
  userDb.dailyStats.rouletteCount = nuevaCantidadJugadas
  userDb.genosCoins = saldo + ganancia

  await User.updateOne(
    { jid: m.sender },
    {
      $inc: {
        genosCoins: ganancia,
        'dailyStats.rouletteCount': 1
      },
      $set: {
        lastRoulette: ahora
      }
    }
  )

  // ───────────── RESPUESTA ─────────────
  let res =
    `✰ 𝙽𝚘𝚖𝚋𝚛𝚎: *𝚁𝚞𝚕𝚎𝚝𝚊*\n` +
    `✰ 𝙽ú𝚖𝚎𝚛𝚘: *${numero}*\n` +
    `✰ 𝙲𝚘𝚕𝚘𝚛: *${colorGanador.toUpperCase()}*\n` +
    `✰ 𝙰𝚙𝚞𝚎𝚜𝚝𝚊: *${monto} ${config.CURRENCY_SYMBOL}*\n` +
    `✰ 𝙴𝚕𝚎𝚌𝚌𝚒ó𝚗: *${eleccion.toUpperCase()}*\n\n`

  if (gano) {
    const premioTotal = monto * multiplicador

    res +=
      `✰ 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘: *𝙶𝙰𝙽𝙰𝚂𝚃𝙴*\n` +
      `> 🎁 Premio: *${premioTotal} ${config.CURRENCY_SYMBOL}*\n` +
      `> ✰ Multiplicador: *x${multiplicador}*\n`

    if (suerteAmuleto) {
      res +=
        `> 🎲 *Amuleto del Tahúr:* tu suerte cambió el resultado.\n`
    }
  } else {
    res +=
      `✰ 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘: *𝙿𝙴𝚁𝙳𝙸𝚂𝚃𝙴*\n` +
      `> 💸 Pérdida: *${monto} ${config.CURRENCY_SYMBOL}*\n`
  }

  res +=
    `\n` +
    `✰ 𝙹𝚞𝚐𝚊𝚍𝚊𝚜: *${nuevaCantidadJugadas}/${MAX_JUGADAS}*\n\n` +
    `- ${config.footer}`

  return m.reply(res)
}

// ───────────── CONFIGURACIÓN DEL COMANDO ─────────────

handler.help = ['ruleta <opción> <monto>']
handler.tags = ['eco']
handler.command = ['ruleta', 'roulette', 'rt']
handler.register = true

export default handler