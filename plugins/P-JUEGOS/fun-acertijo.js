import { acertijos } from '../../lib/games/acertijos.js'
import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const partidas = new Map()
const cooldowns = new Map()

const TIEMPO_MAX = 90_000
const PREMIO_BASE = 200
const COOLDOWN_TIEMPO = 60_000

function nombreCorto(jid) {
  return jid.split('@')[0]
}

function acertijoAleatorio(usados = new Set()) {
  const disponibles = acertijos
    .map((item, i) => ({ item, i }))
    .filter(({ i }) => !usados.has(i))

  const pool = disponibles.length
    ? disponibles
    : acertijos.map((item, i) => ({ item, i }))

  const { item, i } = pool[Math.floor(Math.random() * pool.length)]

  return { idx: i, item }
}

function normalizar(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
}

function calcularPremio(tiempoMs, racha) {
  const segundosRestantes = Math.max(
    0,
    Math.floor((TIEMPO_MAX - tiempoMs) / 1000)
  )

  const bonusTiempo = Math.floor(segundosRestantes / 10) * 20
  const bonusRacha = racha >= 3 ? Math.min(racha * 20, 200) : 0

  return PREMIO_BASE + bonusTiempo + bonusRacha
}

const handler = async (m, ctx) => {
  const {
    conn,
    command,
    text
  } = ctx

  const chatId = m.chat
  const sender = m.sender
  const nombre = m.pushName || nombreCorto(sender)
  const S = config.CURRENCY_SYMBOL

  if (['acertijo', 'ac', 'riddle', 'enigma'].includes(command)) {

    if (cooldowns.has(sender) && cooldowns.get(sender) > Date.now()) {
      const faltan = Math.ceil(
        (cooldowns.get(sender) - Date.now()) / 1000
      )

      return m.reply(
        `*✰ 𝙴𝚂𝙿𝙴𝚁𝙰 ༻*\n\n` +
        `> ✦ Debes esperar *${faltan}s* para volver a jugar.`
      )
    }

    if (partidas.has(chatId)) {
      const p = partidas.get(chatId)

      const restante = Math.max(
        0,
        Math.ceil(
          (TIEMPO_MAX - (Date.now() - p.inicio)) / 1000
        )
      )

      return conn.sendMessage(
        chatId,
        {
          text:
            `*✰ 𝙰𝙲𝙴𝚁𝚃𝙸𝙹𝙾 𝙰𝙲𝚃𝙸𝚅𝙾 ༻*\n\n` +
            `> ✦ _${p.pregunta}_\n\n` +
            `> ⏱️ Quedan *${restante}s*.\n` +
            `> ✦ Respondé directamente en el chat.\n` +
            `> ✦ *!pasaracertijo* para rendirte.`,
          mentions: [p.jugador]
        },
        { quoted: m }
      )
    }

    const { idx, item } = acertijoAleatorio()

    const userActual = await User.findOne({
      jid: sender
    }).lean()

    const racha = userActual?.acRacha || 0

    const p = {
      jugador: sender,
      pregunta: item.pregunta,
      respuesta: item.respuesta,
      idx,
      inicio: Date.now(),
      timer: null
    }

    p.timer = setTimeout(async () => {
      if (!partidas.has(chatId)) return
      if (partidas.get(chatId).idx !== idx) return

      partidas.delete(chatId)

      cooldowns.set(
        sender,
        Date.now() + COOLDOWN_TIEMPO
      )

      await User.updateOne(
        { jid: sender },
        {
          $inc: { acLosses: 1 },
          $set: { acRacha: 0 }
        }
      )

      try {
        await conn.sendMessage(chatId, {
          text:
            `*✰ 𝚃𝙸𝙴𝙼𝙿𝙾 𝙰𝙶𝙾𝚃𝙰𝙳𝙾 ༻*\n\n` +
            `> ✦ La respuesta era: *${item.respuesta.toUpperCase()}*\n` +
            `> ✦ Tu racha fue reiniciada.`,
          mentions: [sender]
        })
      } catch {}
    }, TIEMPO_MAX)

    partidas.set(chatId, p)

    let cap =
      `*✰ 𝙰𝙲𝙴𝚁𝚃𝙸𝙹𝙾 ༻*\n\n`

    cap += `> ✦ _${item.pregunta}_\n\n`
    cap += `> 🏆 Premio base: *${PREMIO_BASE} ${S}*.\n`

    if (racha >= 2) {
      cap += `> 🔥 Racha actual: *${racha}*.\n`
    }

    cap += `> ⏱️ Tenés *90 segundos*.\n`
    cap += `> ✦ Respondé enviando la palabra directamente.\n`
    cap += `> ✦ *!pasaracertijo* para pasar.\n`
    cap += `> ✦ *!acstats* para ver tus estadísticas.`

    return m.reply(cap)
  }

  if (['pasaracertijo', 'pac', 'skipriddle'].includes(command)) {

    if (!partidas.has(chatId)) {
      return m.reply(
        `*✰ 𝚂𝙸𝙽 𝙰𝙲𝙴𝚁𝚃𝙸𝙹𝙾 ༻*\n\n` +
        `> ✦ No hay ningún acertijo activo.`
      )
    }

    const p = partidas.get(chatId)

    if (p.jugador !== sender) return

    clearTimeout(p.timer)
    partidas.delete(chatId)

    cooldowns.set(
      sender,
      Date.now() + COOLDOWN_TIEMPO
    )

    await User.updateOne(
      { jid: sender },
      {
        $inc: { acLosses: 1 },
        $set: { acRacha: 0 }
      }
    )

    return conn.sendMessage(
      chatId,
      {
        text:
          `*✰ 𝙰𝙲𝙴𝚁𝚃𝙸𝙹𝙾 𝙿𝙰𝚂𝙰𝙳𝙾 ༻*\n\n` +
          `> ✦ La respuesta era: *${p.respuesta.toUpperCase()}*\n` +
          `> ✦ Tu racha fue reiniciada.`,
        mentions: [sender]
      },
      { quoted: m }
    )
  }

  if (command === 'acstats') {

    const jid =
      m.mentionedJid?.[0] || sender

    const u = await User.findOne({
      jid
    }).lean()

    const wins = u?.acWins || 0
    const losses = u?.acLosses || 0
    const ganado = u?.acEarned || 0
    const racha = u?.acRacha || 0
    const maxR = u?.acMaxRacha || 0

    const total = wins + losses

    const pct =
      total > 0
        ? ((wins / total) * 100).toFixed(1)
        : '0.0'

    return conn.sendMessage(
      chatId,
      {
        text:
          `*✰ 𝙴𝚂𝚃𝙰𝙳𝙸𝚂𝚃𝙸𝙲𝙰𝚂 𝙰𝙲𝙴𝚁𝚃𝙸𝙹𝙾𝚂 ༻*\n\n` +
          `> ✦ Usuario: @${nombreCorto(jid)}\n` +
          `> ✦ Correctas: *${wins}*\n` +
          `> ✦ Falladas: *${losses}*\n` +
          `> ✦ Acierto: *${pct}%*\n` +
          `> ✦ Racha actual: *${racha}*\n` +
          `> ✦ Mejor racha: *${maxR}*\n` +
          `> ✦ Ganado: *+${ganado} ${S}*`,
        mentions: [jid]
      },
      { quoted: m }
    )
  }

  if (
    command === 'acranking' ||
    command === 'acrank'
  ) {

    const todos = await User.find(
      {
        $or: [
          { acWins: { $gt: 0 } },
          { acLosses: { $gt: 0 } }
        ]
      },
      {
        jid: 1,
        name: 1,
        acWins: 1,
        acLosses: 1,
        acEarned: 1,
        acMaxRacha: 1
      }
    )
      .sort({
        acWins: -1,
        acMaxRacha: -1
      })
      .limit(10)
      .lean()

    if (!todos.length) {
      return m.reply(
        `*✰ 𝚁𝙰𝙽𝙺𝙸𝙽𝙶 𝙰𝙲𝙴𝚁𝚃𝙸𝙹𝙾𝚂 ༻*\n\n` +
        `> ✦ Nadie ha jugado aún.`
      )
    }

    const MEDALS = [
      '🥇',
      '🥈',
      '🥉',
      '4️⃣',
      '5️⃣',
      '6️⃣',
      '7️⃣',
      '8️⃣',
      '9️⃣',
      '🔟'
    ]

    const lineas = todos
      .map((u, i) => {
        const n =
          u.name || nombreCorto(u.jid)

        return (
          `${MEDALS[i]} *${n}*\n` +
          `> ✦ ✅ ${u.acWins || 0} ` +
          `✘ ${u.acLosses || 0} ` +
          `🔥 ${u.acMaxRacha || 0} ` +
          `│ *+${u.acEarned || 0} ${S}*`
        )
      })
      .join('\n')

    return conn.sendMessage(
      chatId,
      {
        text:
          `*✰ 𝚁𝙰𝙽𝙺𝙸𝙽𝙶 𝙶𝙻𝙾𝙱𝙰𝙻 ༻*\n\n` +
          lineas,
        mentions: todos.map(u => u.jid)
      },
      { quoted: m }
    )
  }
}

handler.all = async (m, ctx) => {

  const { conn } = ctx

  const chatId = m.chat
  const sender = m.sender

  if (!partidas.has(chatId)) return

  const p = partidas.get(chatId)

  if (p.jugador !== sender) return

  const body = (m.body || '').trim()

  if (!body || ctx.usedPrefix) return

  const intento = normalizar(body)
  const correcta = normalizar(p.respuesta)

  if (intento !== correcta) return

  clearTimeout(p.timer)
  partidas.delete(chatId)

  cooldowns.set(
    sender,
    Date.now() + COOLDOWN_TIEMPO
  )

  const tiempoUsado =
    Date.now() - p.inicio

  const userActual =
    await User.findOne({
      jid: sender
    }).lean()

  const rachaActual =
    userActual?.acRacha || 0

  const nuevaRacha =
    rachaActual + 1

  const maxRacha =
    Math.max(
      userActual?.acMaxRacha || 0,
      nuevaRacha
    )

  const premio =
    calcularPremio(
      tiempoUsado,
      rachaActual
    )

  const segundosTardados =
    Math.floor(tiempoUsado / 1000)

  await User.updateOne(
    { jid: sender },
    {
      $inc: {
        acWins: 1,
        acEarned: premio,
        genosCoins: premio
      },
      $set: {
        acRacha: nuevaRacha,
        acMaxRacha: maxRacha
      }
    }
  )

  let txt =
    `*✰ 𝙰𝙲𝙴𝚁𝚃𝙰𝚂𝚃𝙴, @${nombreCorto(sender)} ༻*\n\n`

  txt +=
    `> ✦ Respuesta: *${p.respuesta.toUpperCase()}*\n`

  txt +=
    `> ✦ Tiempo: *${segundosTardados}s*\n`

  txt +=
    `> 💰 Premio: *+${premio} ${S}*\n`

  if (nuevaRacha >= 3) {
    txt +=
      `> 🔥 Racha: *${nuevaRacha}* — bono aplicado.\n`
  }

  if (
    nuevaRacha >
    (userActual?.acMaxRacha || 0)
  ) {
    txt +=
      `> 🏅 ¡Nueva mejor racha!`
  }

  return conn.sendMessage(
    chatId,
    {
      text: txt,
      mentions: [sender]
    },
    { quoted: m }
  )
}

handler.help = [
  'acertijo',
  'ac',
  'pasaracertijo',
  'acstats',
  'acranking'
]

handler.tags = ['fun']

handler.command = [
  'acertijo',
  'ac',
  'riddle',
  'enigma',
  'pasaracertijo',
  'pac',
  'skipriddle',
  'acstats',
  'acranking',
  'acrank'
]

export default handler