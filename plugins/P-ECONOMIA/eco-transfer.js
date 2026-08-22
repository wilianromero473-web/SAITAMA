import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'
import { userCache } from '../../lib/caches.js'

const DAILY_LIMIT_ZEN = 5_000_000
const PREMIUM_LIMIT = 100

const extraerNum = (jid = '') => {
  if (typeof jid !== 'string') return ''
  return jid
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '')
}

const resolveTargetJid = (m, participants = []) => {
  const raw = m.mentionedJid?.[0] || m.quoted?.sender || null

  if (!raw) return null

  if (!raw.endsWith('@lid')) {
    return raw
  }

  const participante = participants.find(
    p => p.id === raw || p.lid === raw
  )

  if (participante?.phoneNumber) {
    return `${String(participante.phoneNumber).replace(/\D/g, '')}@s.whatsapp.net`
  }

  if (participante?.id?.includes('@s.whatsapp.net')) {
    return participante.id
  }

  return raw
}

const handler = async (
  m,
  {
    text,
    usedPrefix,
    command,
    userDb,
    participants
  }
) => {
  if (!userDb) return

  if (!userDb.dailyStats) {
    userDb.dailyStats = {}
  }

  const target = resolveTargetJid(m, participants)

  if (!target || !text?.trim()) {
    return m.reply(
      `𝚃𝚁𝙰𝙽𝚂𝙵𝙴𝚁𝙸𝚁 ༻\n\n` +
      `✰ 𝚄𝚜𝚘: ${usedPrefix + command} <moneda> @usuario <monto>\n` +
      `✰ 𝙼𝚘𝚗𝚎𝚍𝚊𝚜: ${config.CURRENCY_NAME} / ${config.PREMIUM_NAME}\n` +
      `✰ 𝙻𝚒́𝚖𝚒𝚝𝚎: ${DAILY_LIMIT_ZEN.toLocaleString('es-AR')} ${config.CURRENCY_NAME} 𝚍𝚒𝚊𝚛𝚒𝚘𝚜\n` +
      `✰ 𝙻𝚒́𝚖𝚒𝚝𝚎 𝙿𝚛𝚎𝚖𝚒𝚞𝚖: ${PREMIUM_LIMIT} ${config.PREMIUM_NAME}\n\n` +
      `✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘𝚜:\n` +
      `> ${usedPrefix + command} ${config.CURRENCY_NAME} @usuario 5000\n` +
      `> ${usedPrefix + command} ${config.PREMIUM_NAME} @usuario 50`
    )
  }

  const texto = text.trim()
  const textoLower = texto.toLowerCase()

  const currencyName = String(
    config.CURRENCY_NAME || ''
  ).toLowerCase()

  const premiumName = String(
    config.PREMIUM_NAME || ''
  ).toLowerCase()

  const type =
    textoLower.includes(premiumName) ||
    textoLower.includes('genos')
      ? 'genos'
      : 'genosCoins'

  /*
   * Extraer solamente los números del monto.
   * Se toma el último número encontrado para evitar
   * problemas con números presentes en otros argumentos.
   */
  const numeros = texto.match(/\d[\d.,]*/g) || []

  if (!numeros.length) {
    return m.reply(
      `𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙰 ༻\n\n` +
      `✰ 𝙸𝚗𝚐𝚛𝚎𝚜𝚊́ 𝚞𝚗 𝚖𝚘𝚗𝚝𝚘 𝚟𝚊́𝚕𝚒𝚍𝚘.`
    )
  }

  const montoTexto = numeros[numeros.length - 1]
    .replace(/[.,]/g, '')

  const monto = Number.parseInt(montoTexto, 10)

  if (!Number.isFinite(monto) || monto <= 0) {
    return m.reply(
      `𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙰 ༻\n\n` +
      `✰ 𝙴𝚕 𝚖𝚘𝚗𝚝𝚘 𝚍𝚎𝚋𝚎 𝚜𝚎𝚛 𝚖𝚊𝚢𝚘𝚛 𝚊 𝟶.`
    )
  }

  if (extraerNum(target) === extraerNum(m.sender)) {
    return m.reply(
      `𝚃𝚁𝙰𝙽𝚂𝙵𝙴𝚁𝙴𝙽𝙲𝙸𝙰 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙰 ༻\n\n` +
      `✰ 𝙽𝚘 𝚙𝚘𝚍𝚎́𝚜 𝚎𝚗𝚟𝚒𝚊𝚛𝚝𝚎 𝚍𝚒𝚗𝚎𝚛𝚘 𝚊 𝚟𝚘𝚜 𝚖𝚒𝚜𝚖𝚘.`
    )
  }

  /*
   * Límite Premium
   */
  if (type === 'genos') {
    if (monto > PREMIUM_LIMIT) {
      return m.reply(
        `𝙻𝙸́𝙼𝙸𝚃𝙴 𝚂𝚄𝙿𝙴𝚁𝙰𝙳𝙾 ༻\n\n` +
        `✰ 𝙼𝚊́𝚡𝚒𝚖𝚘: ${PREMIUM_LIMIT} ${config.PREMIUM_NAME}\n` +
        `✰ 𝚂𝚘𝚕𝚒𝚌𝚒𝚝𝚊𝚍𝚘: ${monto} ${config.PREMIUM_NAME}`
      )
    }
  }

  /*
   * Límite diario de GenosCoins
   */
  if (type === 'genosCoins') {
    const transferidoHoy =
      Number(userDb.dailyStats.transferToday) || 0

    const restante =
      DAILY_LIMIT_ZEN - transferidoHoy

    if (restante <= 0) {
      return m.reply(
        `𝙻𝙸́𝙼𝙸𝚃𝙴 𝙳𝙸𝙰𝚁𝙸𝙾 ༻\n\n` +
        `✰ 𝚈𝚊 𝚊𝚕𝚌𝚊𝚗𝚣𝚊𝚜𝚝𝚎 𝚎𝚕 𝚕𝚒́𝚖𝚒𝚝𝚎 𝚍𝚎 𝚑𝚘𝚢.\n` +
        `✰ 𝙼𝚊́𝚡𝚒𝚖𝚘: ${DAILY_LIMIT_ZEN.toLocaleString('es-AR')} ${config.CURRENCY_NAME}\n` +
        `✰ 𝚅𝚘𝚕𝚟𝚎́ 𝚊 𝚒𝚗𝚝𝚎𝚗𝚝𝚊𝚛 𝚖𝚊𝚗̃𝚊𝚗𝚊.`
      )
    }

    if (monto > restante) {
      return m.reply(
        `𝙻𝙸́𝙼𝙸𝚃𝙴 𝙳𝙸𝙰𝚁𝙸𝙾 ༻\n\n` +
        `✰ 𝙳𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎: ${restante.toLocaleString('es-AR')} ${config.CURRENCY_NAME}\n` +
        `✰ 𝚂𝚘𝚕𝚒𝚌𝚒𝚝𝚊𝚍𝚘: ${monto.toLocaleString('es-AR')} ${config.CURRENCY_NAME}`
      )
    }
  }

  /*
   * Verificar saldo
   */
  const saldo = Number(userDb[type]) || 0

  if (saldo < monto) {
    const simbolo =
      type === 'genos'
        ? config.PREMIUM_SYMBOL
        : config.CURRENCY_SYMBOL

    const nombre =
      type === 'genos'
        ? config.PREMIUM_NAME
        : config.CURRENCY_NAME

    return m.reply(
      `𝚂𝙰𝙻𝙳𝙾 𝙸𝙽𝚂𝚄𝙵𝙸𝙲𝙸𝙴𝙽𝚃𝙴 ༻\n\n` +
      `✰ 𝙽𝚎𝚌𝚎𝚜𝚒𝚝𝚊́𝚜: ${monto.toLocaleString('es-AR')} ${simbolo}\n` +
      `✰ 𝚃𝚎𝚗𝚎́𝚜: ${saldo.toLocaleString('es-AR')} ${simbolo}\n` +
      `✰ 𝙼𝚘𝚗𝚎𝚍𝚊: ${nombre}`
    )
  }

  /*
   * Verificar destinatario
   */
  const targetDb = await User.findOne(
    { jid: target },
    { _id: 1, jid: 1 }
  )

  if (!targetDb) {
    return m.reply(
      `𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾 ༻\n\n` +
      `✰ 𝙴𝚕 𝚞𝚜𝚞𝚊𝚛𝚒𝚘 𝚍𝚎𝚜𝚝𝚒𝚗𝚊𝚝𝚊𝚛𝚒𝚘 𝚗𝚘 𝚎𝚜𝚝𝚊́ 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚘.`
    )
  }

  /*
   * Comisión
   */
  let comision = 0

  if (
    type === 'genosCoins' &&
    monto >= 5000
  ) {
    comision = Math.floor(monto * 0.05)
  }

  const neto = monto - comision

  /*
   * Actualizar datos locales
   */
  userDb[type] = saldo - monto

  if (type === 'genosCoins') {
    userDb.dailyStats.transferToday =
      (Number(userDb.dailyStats.transferToday) || 0) + monto
  }

  /*
   * Actualizar base de datos
   */
  const updateSender = {
    $inc: {
      [type]: -monto
    }
  }

  if (type === 'genosCoins') {
    updateSender.$inc['dailyStats.transferToday'] = monto
  }

  await Promise.all([
    User.updateOne(
      { jid: m.sender },
      updateSender
    ),

    User.updateOne(
      { jid: targetDb.jid },
      {
        $inc: {
          [type]: neto
        }
      }
    )
  ])

  /*
   * Actualizar caché
   */
  const targetNum = extraerNum(targetDb.jid)

  const tCacheJid = userCache.get(targetDb.jid)
  const tCacheNum = userCache.get(targetNum)

  if (tCacheJid) {
    tCacheJid[type] =
      (Number(tCacheJid[type]) || 0) + neto
  }

  if (
    tCacheNum &&
    tCacheNum !== tCacheJid
  ) {
    tCacheNum[type] =
      (Number(tCacheNum[type]) || 0) + neto
  }

  /*
   * Mensaje final
   */
  const simbolo =
    type === 'genos'
      ? config.PREMIUM_SYMBOL
      : config.CURRENCY_SYMBOL

  const nombreMoneda =
    type === 'genos'
      ? config.PREMIUM_NAME
      : config.CURRENCY_NAME

  let res =
    `𝚃𝚁𝙰𝙽𝚂𝙵𝙴𝚁𝙴𝙽𝙲𝙸𝙰 ༻\n\n` +
    `✰ 𝙳𝚎: @${extraerNum(m.sender)}\n` +
    `✰ 𝙿𝚊𝚛𝚊: @${targetNum}\n` +
    `✰ 𝙼𝚘𝚗𝚎𝚍𝚊: ${nombreMoneda}\n` +
    `✰ 𝙴𝚗𝚟𝚒𝚊𝚍𝚘: ${monto.toLocaleString('es-AR')} ${simbolo}\n`

  if (comision > 0) {
    res +=
      `✰ 𝙲𝚘𝚖𝚒𝚜𝚒𝚘́𝚗: ${comision.toLocaleString('es-AR')} ${config.CURRENCY_SYMBOL}\n`
  }

  res +=
    `✰ 𝚁𝚎𝚌𝚒𝚋𝚒𝚍𝚘: ${neto.toLocaleString('es-AR')} ${simbolo}\n`

  if (type === 'genosCoins') {
    const restanteHoy =
      DAILY_LIMIT_ZEN -
      userDb.dailyStats.transferToday

    res +=
      `✰ 𝚁𝚎𝚜𝚝𝚊𝚗𝚝𝚎 𝚑𝚘𝚢: ${restanteHoy.toLocaleString('es-AR')} ${config.CURRENCY_NAME}\n`
  }

  res +=
    `\n𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ༻`

  return m.reply(res, {
    mentions: [m.sender, targetDb.jid]
  })
}

handler.help = [
  'transferir <moneda @tag cantidad>',
  'enviar <moneda @tag cantidad>',
  'pay <moneda @tag cantidad>',
  'give <moneda @tag cantidad>'
]

handler.tags = ['eco']

handler.command = [
  'transferir',
  'enviar',
  'pay',
  'give'
]

handler.register = true
handler.groupOnly = true

export default handler