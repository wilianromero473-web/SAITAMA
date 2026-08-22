import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏆 MEDALLAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const getMedal = (i) => {
  if (i === 0) return '🥇'
  if (i === 1) return '🥈'
  if (i === 2) return '🥉'

  return `✰ *${i + 1}.*`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔢 FORMATO DE NÚMEROS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const formatNumber = (value) => {
  const number = Number(value || 0)

  return Number.isFinite(number)
    ? number.toLocaleString('es-PE')
    : '0'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 OBTENER NOMBRE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const getName = (user) => {
  return String(user?.name || 'Invitado').trim() || 'Invitado'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 OBTENER JID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const getJid = (user) => {
  return user?.jid || ''
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏆 HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const handler = async (m, { conn, userDb }) => {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛡️ SEGURIDAD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!userDb) return

  try {

    const userCoins = Number(userDb.genosCoins || 0)
    const userGenos = Number(userDb.genos || 0)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 CONSULTAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const [
      topCoins,
      topGenos,
      posCoins,
      posGenos,
      allReg
    ] = await Promise.all([

      User.find(
        {
          registered: true,
          genosCoins: { $gt: 0 }
        },
        {
          jid: 1,
          genosCoins: 1,
          name: 1
        }
      )
        .sort({ genosCoins: -1 })
        .limit(10)
        .lean(),

      User.find(
        {
          registered: true,
          genos: { $gt: 0 }
        },
        {
          jid: 1,
          genos: 1,
          name: 1
        }
      )
        .sort({ genos: -1 })
        .limit(10)
        .lean(),

      User.countDocuments({
        registered: true,
        genosCoins: { $gt: userCoins }
      }),

      User.countDocuments({
        registered: true,
        genos: { $gt: userGenos }
      }),

      User.find(
        {
          registered: true
        },
        {
          genosCoins: 1,
          genos: 1
        }
      ).lean()

    ])

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 CIRCULANTE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const totalCoins = allReg.reduce(
      (sum, user) =>
        sum + Number(user.genosCoins || 0),
      0
    )

    const totalGenos = allReg.reduce(
      (sum, user) =>
        sum + Number(user.genos || 0),
      0
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏆 ENCABEZADO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    let txt =
      `༺ 𝚁𝙰𝙽𝙺𝙸𝙽𝙶 𝙶𝙻𝙾𝙱𝙰𝙻 ༻\n\n` +

      `✰ 𝙲𝙻𝙰𝚂𝙸𝙵𝙸𝙲𝙰𝙲𝙸Ó𝙽 𝙳𝙴𝙻 𝚂𝙴𝚁𝚅𝙴𝚁\n\n`

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🪙 TOP GENOSCOINS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (topCoins.length > 0) {

      txt +=
        `༺ ${config.CURRENCY_SYMBOL} 𝚁𝙸𝙲𝙾𝚂 𝙴𝙽 ` +
        `${config.CURRENCY_NAME.toUpperCase()} ༻\n\n`

      topCoins.forEach((user, i) => {

        const medal = getMedal(i)
        const name = getName(user)
        const jid = getJid(user)

        const mention = jid
          ? `@${jid.split('@')[0]}`
          : '@usuario'

        txt +=
          `> ✰ ${medal} *${name}*\n` +
          `> ✰ 👤 ${mention}\n` +
          `> ✰ 💰 ${formatNumber(user.genosCoins)} ` +
          `${config.CURRENCY_SYMBOL}\n\n`
      })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💎 TOP GENOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (topGenos.length > 0) {

      txt +=
        `༺ ${config.PREMIUM_SYMBOL} 𝙼𝙰𝙴𝚂𝚃𝚁𝙾𝚂 𝙴𝙽 ` +
        `${config.PREMIUM_NAME.toUpperCase()} ༻\n\n`

      topGenos.forEach((user, i) => {

        const medal = getMedal(i)
        const name = getName(user)
        const jid = getJid(user)

        const mention = jid
          ? `@${jid.split('@')[0]}`
          : '@usuario'

        txt +=
          `> ✰ ${medal} *${name}*\n` +
          `> ✰ 👤 ${mention}\n` +
          `> ✰ ${config.PREMIUM_SYMBOL} ` +
          `${formatNumber(user.genos)} ` +
          `${config.PREMIUM_SYMBOL}\n\n`
      })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📭 RANKING VACÍO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (
      topCoins.length === 0 &&
      topGenos.length === 0
    ) {

      txt +=
        `> ✰ _Aún no hay usuarios registrados ` +
        `en el ranking._\n\n`
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📉 ESTADÍSTICAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    txt +=
      `༺ 𝙴𝚂𝚃𝙰𝙳Í𝚂𝚃𝙸𝙲𝙰𝚂 ༻\n\n` +

      `✰ 𝙲𝙸𝚁𝙲𝚄𝙻𝙰𝙽𝚃𝙴 𝙶𝙻𝙾𝙱𝙰𝙻\n\n` +

      `> ✰ 🪙 *${config.CURRENCY_NAME}:* ` +
      `${formatNumber(totalCoins)} ` +
      `${config.CURRENCY_SYMBOL}\n` +

      `> ✰ ${config.PREMIUM_SYMBOL} *${config.PREMIUM_NAME}:* ` +
      `${formatNumber(totalGenos)} ` +
      `${config.PREMIUM_SYMBOL}\n\n`

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👤 ESTADO DEL USUARIO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    txt +=
      `༺ 𝚃𝚄 𝙿𝙾𝚂𝙸𝙲𝙸Ó𝙽 ༻\n\n` +

      `> ✰ ${config.CURRENCY_SYMBOL} ` +
      `*${config.CURRENCY_NAME}:* ` +
      `Puesto #${posCoins + 1}\n` +

      `> ✰ ${config.PREMIUM_SYMBOL} ` +
      `*${config.PREMIUM_NAME}:* ` +
      `Puesto #${posGenos + 1}\n\n` +

      `༺ ${config.footer} ༻`

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👥 MENCIONES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const allMentions = [
      ...topCoins.map(user => getJid(user)),
      ...topGenos.map(user => getJid(user))
    ].filter(Boolean)

    const mentions = [
      ...new Set(allMentions)
    ]

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📤 ENVIAR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await conn.sendMessage(
      m.chat,
      {
        text: txt,
        mentions
      },
      {
        quoted: m
      }
    )

  } catch (error) {

    console.error('Error en leaderboard:', error)

    return m.reply(
      `༺ 𝙴𝚁𝚁𝙾𝚁 ༻\n\n` +
      `> ✰ No se pudo cargar el ranking.\n` +
      `> ✰ Inténtalo nuevamente en unos segundos.`
    )
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'leaderboard',
  'lb',
  'ricos'
]

handler.tags = [
  'eco'
]

handler.command = [
  'lb',
  'topcoins',
  'topgenos',
  'leaderboard',
  'ricos'
]

handler.register = true

export default handler