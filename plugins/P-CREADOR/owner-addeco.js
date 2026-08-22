import User from '../../lib/database/models/zen-users.js'
import { userCache } from '../../lib/caches.js'
import config from '../../config.js'

// ═════════════════════════════════════
// ✦ SAITAMABOT • ADD ECO
// ═════════════════════════════════════

const extraerNum = (jid = '') => {
  return typeof jid === 'string'
    ? jid
        .split('@')[0]
        .split(':')[0]
        .replace(/\D/g, '')
    : ''
}

const resolveTargetJid = (m, participants = []) => {

  const raw =
    m.mentionedJid?.[0] ||
    m.quoted?.sender ||
    null

  if (!raw) return null

  // ─────────────────────────────────
  // ✦ USUARIO NORMAL
  // ─────────────────────────────────

  if (!raw.endsWith('@lid')) {
    return raw
  }

  // ─────────────────────────────────
  // ✦ RESOLVER LID
  // ─────────────────────────────────

  const p = participants.find(
    p =>
      p.id === raw ||
      p.lid === raw
  )

  if (p?.phoneNumber) {
    return `${String(p.phoneNumber).replace(/\D/g, '')}@s.whatsapp.net`
  }

  if (p?.id?.includes('@s.whatsapp.net')) {
    return p.id
  }

  return raw
}


// ═════════════════════════════════════
// ✦ HANDLER
// ═════════════════════════════════════

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

    // ═══════════════════════════════
    // ✦ OBTENER USUARIO
    // ═══════════════════════════════

    const targetRaw =
      resolveTargetJid(
        m,
        participants
      )

    if (!targetRaw) {

      return m.reply(
`༺ ✦ 𝙐𝚂𝙾 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✦ ༻

> ✦ Usa el comando indicando una cantidad y un usuario.

༺ ✦ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✦ ༻

> ✦ ${usedPrefix}${command} 500 genosCoins @usuario
> ✦ ${usedPrefix}${command} 500 genosCoins

> ✦ También puedes responder al mensaje del usuario.`
      )

    }


    // ═══════════════════════════════
    // ✦ NORMALIZAR JID
    // ═══════════════════════════════

    const targetJid =
      targetRaw.includes('@s.whatsapp.net')
        ? targetRaw
        : `${extraerNum(targetRaw)}@s.whatsapp.net`

    const targetNum =
      extraerNum(targetJid)


    // ═══════════════════════════════
    // ✦ OBTENER CANTIDAD
    // ═══════════════════════════════

    const amountMatch =
      text.match(/-?\d+/)

    if (!amountMatch) {

      return m.reply(
`༺ ✦ 𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙰 ✦ ༻

> ✦ Debes indicar una cantidad válida.

> ✦ Ejemplo:
> ${usedPrefix}${command} 500 genosCoins @usuario`
      )

    }

    const amount =
      parseInt(
        amountMatch[0]
      )


    // ═══════════════════════════════
    // ✦ DETERMINAR MONEDA
    // ═══════════════════════════════

    const isGenos =
      /genos/i.test(text) ||
      new RegExp(
        config.PREMIUM_NAME,
        'i'
      ).test(text)

    const field =
      isGenos
        ? 'genos'
        : 'genosCoins'

    const currencyName =
      isGenos
        ? config.PREMIUM_NAME
        : config.CURRENCY_NAME

    const currencySymbol =
      isGenos
        ? config.PREMIUM_SYMBOL
        : config.CURRENCY_SYMBOL


    // ═══════════════════════════════
    // ✦ BUSCAR USUARIO
    // ═══════════════════════════════

    const v =
      await User.findOne({
        jid: targetJid
      })

    if (!v) {

      return m.reply(
`༺ ✦ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙽𝙾 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙰𝙳𝙾 ✦ ༻

> ✦ El usuario @${targetNum} no está registrado en la base de datos.`
      )

    }


    // ═══════════════════════════════
    // ✦ MODIFICAR SALDO
    // ═══════════════════════════════

    v[field] += amount

    await User.updateOne(
      {
        jid: targetJid
      },
      {
        $inc: {
          [field]: amount
        }
      }
    )


    // ═══════════════════════════════
    // ✦ ACTUALIZAR CACHE
    // ═══════════════════════════════

    const tCacheJid =
      userCache.get(targetJid)

    const tCacheNum =
      userCache.get(targetNum)

    if (tCacheJid) {
      tCacheJid[field] += amount
    }

    if (
      tCacheNum &&
      tCacheNum !== tCacheJid
    ) {
      tCacheNum[field] += amount
    }


    // ═══════════════════════════════
    // ✦ RESPUESTA
    // ═══════════════════════════════

    return m.reply(
`༺ ✦ 𝙵𝙾𝙽𝙳𝙾𝚂 𝙼𝙾𝙳𝙸𝙵𝙸𝙲𝙰𝙳𝙾𝚂 ✦ ༻

> ✦ 👤 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${targetNum}

> ✦ 💰 𝙼𝚘𝚗𝚎𝚍𝚊: *${currencyName}*
> ✦ 💠 𝙲𝚊𝚗𝚝𝚒𝚍𝚊𝚍: *${amount} ${currencySymbol}*

༺ ✦ 𝙽𝚄𝙴𝚅𝙾 𝚂𝙰𝙻𝙳𝙾 ✦ ༻

> ✦ 💰 *${v[field]} ${currencyName}*`,
      {
        mentions: [
          targetJid
        ]
      }
    )

  } catch (error) {

    console.error(
      '[ADDECO]',
      error?.message ||
      error
    )

    return m.reply(
`༺ ✦ 𝙴𝚁𝚁𝙾𝚁 ✦ ༻

> ✦ No se pudieron modificar los fondos.
> ✦ Intenta nuevamente.`
    )

  }

}


// ═════════════════════════════════════
// ✦ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'addeco <cantidad> <moneda> @user',
  'añadir <cantidad> <moneda> @user',
  'addgenosCoins <cantidad> @user',
  'addgenos <cantidad> @user',
  'darplata <cantidad> @user'
]

handler.command = [
  'addeco',
  'añadir',
  'addgenosCoins',
  'addgenos',
  'darplata'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler