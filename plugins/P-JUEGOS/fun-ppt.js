import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const TIEMPO_RETO = 30_000
const timersReto = new Map()
const partidas = new Map()

const MOVES = {
  piedra: 'piedra',
  papel: 'papel',
  tijera: 'tijera',
  rock: 'piedra',
  paper: 'papel',
  scissors: 'tijera'
}

const EMOJIS = {
  piedra: '✊ Piedra',
  papel: '✋ Papel',
  tijera: '✌️ Tijera'
}

const IA_MOVES = ['piedra', 'papel', 'tijera']

function ganador(a, b) {
  if (a === b) return 'empate'

  if (
    (a === 'piedra' && b === 'tijera') ||
    (a === 'papel' && b === 'piedra') ||
    (a === 'tijera' && b === 'papel')
  ) return 'a'

  return 'b'
}

function nombreCorto(jid) {
  return jid.split('@')[0]
}

async function procesarAceptacionPPT(chatId, sender, m, conn, accion) {
  if (!partidas.has(chatId)) return

  const p = partidas.get(chatId)

  if (!p || !p.esperando || p.jugador2 !== sender) return

  const nombre = m.pushName || nombreCorto(sender)
  const S = config.CURRENCY_SYMBOL

  if (accion === 'rechazar') {
    clearTimeout(timersReto.get(chatId))
    timersReto.delete(chatId)

    if (p.apuesta > 0) {
      await User.updateOne(
        { jid: p.jugador1 },
        { $inc: { genosCoins: p.apuesta } }
      )
    }

    partidas.delete(chatId)

    let texto = `✰ 𝚁𝚎𝚝𝚘 𝚁𝚎𝚌𝚑𝚊𝚣𝚊𝚍𝚘 ✰\n\n`
    texto += `༻ @${nombre} rechazó la partida.\n`

    if (p.apuesta > 0) {
      texto += `༻ Se devolvieron *${p.apuesta} ${S}* a @${nombreCorto(p.jugador1)}.`
    }

    return conn.sendMessage(
      chatId,
      {
        text: texto,
        mentions: [p.jugador1, sender]
      },
      { quoted: m }
    )
  }

  if (accion === 'aceptar') {
    clearTimeout(timersReto.get(chatId))
    timersReto.delete(chatId)

    if (p.apuesta > 0) {
      const u2 = await User.findOne({ jid: sender }).lean()

      if (!u2 || (u2.genosCoins || 0) < p.apuesta) {
        await User.updateOne(
          { jid: p.jugador1 },
          { $inc: { genosCoins: p.apuesta } }
        )

        partidas.delete(chatId)

        return conn.sendMessage(
          chatId,
          {
            text:
              `✰ 𝚂𝚒𝚗 𝙵𝚘𝚗𝚍𝚘𝚜 ✰\n\n` +
              `༻ @${nombre} no tiene *${p.apuesta} ${S}* para aceptar.\n` +
              `༻ La partida fue cancelada y la apuesta devuelta.`,
            mentions: [sender]
          },
          { quoted: m }
        )
      }

      await User.updateOne(
        { jid: sender },
        { $inc: { genosCoins: -p.apuesta } }
      )
    }

    p.esperando = false
    p.eleccion1 = null
    p.eleccion2 = null

    partidas.set(chatId, p)

    let texto =
      `✰ 𝙿𝚊𝚛𝚝𝚒𝚍𝚊 𝙸𝚗𝚒𝚌𝚒𝚊𝚍𝚊 ✰\n\n` +
      `༻ @${nombreCorto(p.jugador1)} vs @${nombreCorto(sender)}\n` +
      `༻ Envíen su elección sin prefijo:\n` +
      `༻ *piedra* │ *papel* │ *tijera*`

    if (p.apuesta > 0) {
      texto +=
        `\n\n✰ 𝙰𝚙𝚞𝚎𝚜𝚝𝚊 ✰\n` +
        `༻ *${p.apuesta} ${S}* c/u\n` +
        `༻ El ganador recibe *${p.apuesta * 2} ${S}*.`
    }

    return conn.sendMessage(
      chatId,
      {
        text: texto,
        mentions: [p.jugador1, sender]
      },
      { quoted: m }
    )
  }
}

async function resolverPvP(groupChat, p, partidaChatId, conn) {
  partidas.delete(partidaChatId || groupChat)

  const res = ganador(p.eleccion1, p.eleccion2)
  const j1n = nombreCorto(p.jugador1)
  const j2n = nombreCorto(p.jugador2)
  const S = config.CURRENCY_SYMBOL

  let textoResultado
  let extra = ''

  if (res === 'empate') {
    textoResultado = '༻ ¡Empate! Las apuestas serán devueltas.'

    await User.updateOne(
      { jid: p.jugador1 },
      { $inc: { pptDraws: 1 } }
    )

    await User.updateOne(
      { jid: p.jugador2 },
      { $inc: { pptDraws: 1 } }
    )

    if (p.apuesta > 0) {
      await User.updateOne(
        { jid: p.jugador1 },
        { $inc: { genosCoins: p.apuesta } }
      )

      await User.updateOne(
        { jid: p.jugador2 },
        { $inc: { genosCoins: p.apuesta } }
      )

      extra =
        `\n༻ Se devuelven *${p.apuesta} ${S}* a cada jugador.`
    }
  } else {
    const ganadorJid = res === 'a'
      ? p.jugador1
      : p.jugador2

    const perdedorJid = res === 'a'
      ? p.jugador2
      : p.jugador1

    textoResultado =
      `༻ ¡@${nombreCorto(ganadorJid)} ganó la partida!`

    await User.updateOne(
      { jid: ganadorJid },
      {
        $inc: {
          pptWins: 1,
          pptEarned: p.apuesta > 0 ? p.apuesta * 2 : 0,
          genosCoins: p.apuesta > 0 ? p.apuesta * 2 : 0
        }
      }
    )

    await User.updateOne(
      { jid: perdedorJid },
      { $inc: { pptLosses: 1 } }
    )

    if (p.apuesta > 0) {
      extra =
        `\n༻ 💰 Premio: *+${p.apuesta * 2} ${S}* para @${nombreCorto(ganadorJid)}.`
    }
  }

  const texto =
    `✰ 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘 𝙿𝙿𝚃 ✰\n\n` +
    `༻ @${j1n}: *${EMOJIS[p.eleccion1]}*\n` +
    `༻ @${j2n}: *${EMOJIS[p.eleccion2]}*\n\n` +
    `${textoResultado}${extra}`

  return conn.sendMessage(groupChat, {
    text: texto,
    mentions: [p.jugador1, p.jugador2]
  })
}

const handler = async (m, ctx) => {
  const {
    conn,
    command,
    args,
    userDb
  } = ctx

  const sender = m.sender
  const chatId = m.chat
  const nombre = m.pushName || nombreCorto(sender)
  const S = config.CURRENCY_SYMBOL

  if ([
    'ppt',
    'rps',
    'jkp',
    'piedrapapeltijera'
  ].includes(command)) {

    const arg0 = (args[0] || '').toLowerCase()

    if (!arg0) {
      return m.reply(
        `✰ 𝚄𝚜𝚘 ✰\n\n` +
        `༻ *!ppt ia* — jugar contra la IA\n` +
        `༻ *!ppt @usuario [apuesta]* — retar a un jugador`
      )
    }

    const isIA = [
      'ia',
      'ai',
      'bot'
    ].includes(arg0)

    if (isIA) {
      if (partidas.has(chatId)) {
        return m.reply(
          `✰ 𝙿𝚊𝚛𝚝𝚒𝚍𝚊 𝙰𝚌𝚝𝚒𝚟𝚊 ✰\n\n` +
          `༻ Ya existe una partida activa.\n` +
          `༻ Terminá la partida actual primero.`
        )
      }

      partidas.set(chatId, {
        vsIA: true,
        jugador1: sender,
        apuesta: 0,
        esperando: false
      })

      return conn.sendMessage(
        chatId,
        {
          text:
            `✰ 𝙿𝚎𝚍𝚛𝚊 • 𝙿𝚊𝚙𝚎𝚕 • 𝚃𝚒𝚓𝚎𝚛𝚊 ✰\n\n` +
            `༻ 𝚅𝚂 𝙸𝙰\n\n` +
            `༻ Elegí tu jugada sin prefijo:\n` +
            `༻ *piedra*\n` +
            `༻ *papel*\n` +
            `༻ *tijera*`,
          mentions: [sender]
        },
        { quoted: m }
      )
    }

    const rival =
      m.mentionedJid?.[0] ||
      (m.quoted && m.quoted.sender !== sender
        ? m.quoted.sender
        : null)

    if (!rival) {
      return m.reply(
        `✰ 𝚄𝚜𝚘 ✰\n\n` +
        `༻ *!ppt ia* — jugar contra la IA\n` +
        `༻ *!ppt @usuario [apuesta]* — retar a un jugador`
      )
    }

    const apuesta = parseInt(
      args.find(a => /^\d+$/.test(a)) || '0'
    )

    if (apuesta > 0) {
      if (!userDb?.registered) {
        return m.reply(
          `✰ 𝙽𝚘 𝚁𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚘 ✰\n\n` +
          `༻ Necesitás estar registrado para apostar.`
        )
      }

      if ((userDb.genosCoins || 0) < apuesta) {
        return m.reply(
          `✰ 𝚂𝚒𝚗 𝙵𝚘𝚗𝚍𝚘𝚜 ✰\n\n` +
          `༻ Tenés *${userDb.genosCoins || 0} ${S}*.\n` +
          `༻ Apostás *${apuesta} ${S}*.`
        )
      }
    }

    if (partidas.has(chatId)) {
      return m.reply(
        `✰ 𝙿𝚊𝚛𝚝𝚒𝚍𝚊 𝙰𝚌𝚝𝚒𝚟𝚊 ✰\n\n` +
        `༻ Terminá la partida actual primero.`
      )
    }

    if (apuesta > 0) {
      await User.updateOne(
        { jid: sender },
        { $inc: { genosCoins: -apuesta } }
      )
    }

    partidas.set(chatId, {
      vsIA: false,
      jugador1: sender,
      jugador2: rival,
      apuesta,
      esperando: true,
      eleccion1: null,
      eleccion2: null,
      groupChat: chatId
    })

    const timerHandle = setTimeout(async () => {
      const p = partidas.get(chatId)

      if (!p || !p.esperando) return

      partidas.delete(chatId)
      timersReto.delete(chatId)

      if (p.apuesta > 0) {
        await User.updateOne(
          { jid: p.jugador1 },
          { $inc: { genosCoins: p.apuesta } }
        )
      }

      const devolucion = p.apuesta > 0
        ? `\n༻ 💰 Se devolvieron *${p.apuesta} ${S}* a @${nombreCorto(p.jugador1)}.`
        : ''

      try {
        await conn.sendMessage(chatId, {
          text:
            `✰ 𝚃𝚒𝚎𝚖𝚙𝚘 𝙰𝚐𝚘𝚝𝚊𝚍𝚘 ✰\n\n` +
            `༻ @${nombreCorto(rival)} no respondió el reto.\n` +
            `༻ La partida fue cancelada.${devolucion}`,
          mentions: [p.jugador1, rival]
        })
      } catch {}
    }, TIEMPO_RETO)

    timersReto.set(chatId, timerHandle)

    let texto =
      `✰ 𝚁𝚎𝚝𝚘 𝙿𝙿𝚃 ✰\n\n` +
      `༻ @${nombre} retó a @${nombreCorto(rival)}.`

    if (apuesta > 0) {
      texto +=
        `\n༻ Apuesta: *${apuesta} ${S}* c/u.` +
        `\n༻ Premio: *${apuesta * 2} ${S}*.`
    }

    texto +=
      `\n\n༻ @${nombreCorto(rival)}, escribí *!aceptar* o *!rechazar*.` +
      `\n༻ ⏱️ Tenés *30s* para responder.`

    return conn.sendMessage(
      chatId,
      {
        text: texto,
        mentions: [sender, rival]
      },
      { quoted: m }
    )
  }

  if ([
    'aceptar',
    'accept',
    'aceitar'
  ].includes(command)) {
    return procesarAceptacionPPT(
      chatId,
      sender,
      m,
      conn,
      'aceptar'
    )
  }

  if ([
    'rechazar',
    'decline',
    'recusar'
  ].includes(command)) {
    return procesarAceptacionPPT(
      chatId,
      sender,
      m,
      conn,
      'rechazar'
    )
  }

  if ([
    'pptstats',
    'rpsstats',
    'jkpstats'
  ].includes(command)) {

    const jid = m.mentionedJid?.[0] || sender
    const u = await User.findOne({ jid }).lean()

    const wins = u?.pptWins || 0
    const losses = u?.pptLosses || 0
    const draws = u?.pptDraws || 0
    const ganadas = u?.pptEarned || 0

    const total = wins + losses + draws
    const pct = total > 0
      ? ((wins / total) * 100).toFixed(1)
      : '0.0'

    return conn.sendMessage(
      chatId,
      {
        text:
          `✰ 𝚂𝚝𝚊𝚝𝚜 𝙿𝙿𝚃 ✰\n\n` +
          `༻ @${nombreCorto(jid)}\n\n` +
          `༻ 🏆 Victorias: *${wins}*\n` +
          `༻ ❌ Derrotas: *${losses}*\n` +
          `༻ 🤝 Empates: *${draws}*\n` +
          `༻ 📈 Win rate: *${pct}%*\n` +
          `༻ 💰 Ganado: *+${ganadas} ${S}*`,
        mentions: [jid]
      },
      { quoted: m }
    )
  }

  if ([
    'pptranking',
    'pptrank',
    'rpsranking',
    'rpsrank',
    'jkpranking',
    'jkprank'
  ].includes(command)) {

    const todos = await User.find(
      {
        $or: [
          { pptWins: { $gt: 0 } },
          { pptLosses: { $gt: 0 } },
          { pptDraws: { $gt: 0 } }
        ]
      },
      {
        jid: 1,
        name: 1,
        pptWins: 1,
        pptLosses: 1,
        pptDraws: 1,
        pptEarned: 1
      }
    )
      .sort({
        pptWins: -1,
        pptLosses: 1
      })
      .limit(10)
      .lean()

    if (!todos.length) {
      return m.reply(
        `✰ 𝚁𝚊𝚗𝚔𝚒𝚗𝚐 𝙿𝙿𝚃 ✰\n\n` +
        `༻ Nadie ha jugado aún.`
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

    const texto = todos
      .map((u, i) =>
        `${MEDALS[i]} *${u.name || nombreCorto(u.jid)}* — ` +
        `🏆${u.pptWins || 0} ` +
        `❌${u.pptLosses || 0} ` +
        `🤝${u.pptDraws || 0} │ ` +
        `*+${u.pptEarned || 0} ${S}*`
      )
      .join('\n')

    return conn.sendMessage(
      chatId,
      {
        text:
          `✰ 𝚁𝚊𝚗𝚔𝚒𝚗𝚐 𝙶𝚕𝚘𝚋𝚊𝚕 𝙿𝙿𝚃 ✰\n\n` +
          `${texto}`,
        mentions: todos.map(u => u.jid)
      },
      { quoted: m }
    )
  }
}

handler.all = async (m, ctx) => {
  const { conn } = ctx

  const sender = m.sender
  const chatId = m.chat
  const texto = (m.body || '').trim().toLowerCase()

  let partidaChatId = chatId
  let p = partidas.get(chatId)

  if (!p) {
    for (const [cid, partida] of partidas.entries()) {
      if (
        !partida.vsIA &&
        !partida.esperando &&
        (
          partida.jugador1 === sender ||
          partida.jugador2 === sender
        )
      ) {
        partidaChatId = cid
        p = partida
        break
      }
    }
  }

  if (!p) return

  if (p.vsIA) {
    if (sender !== p.jugador1) return

    const mov = MOVES[texto]
    if (!mov) return

    const iaMove =
      IA_MOVES[Math.floor(Math.random() * IA_MOVES.length)]

    const res = ganador(mov, iaMove)

    partidas.delete(partidaChatId)

    let resultado

    if (res === 'empate') {
      resultado = '✰ 𝙴𝚖𝚙𝚊𝚝𝚎 ✰\n༻ ¡Nadie ganó esta ronda!'

      await User.updateOne(
        { jid: sender },
        { $inc: { pptDraws: 1 } }
      )
    } else if (res === 'a') {
      resultado = '✰ 𝙑𝚒𝚌𝚝𝚘𝚛𝚒𝚊 ✰\n༻ ¡Ganaste contra la IA!'

      await User.updateOne(
        { jid: sender },
        { $inc: { pptWins: 1 } }
      )
    } else {
      resultado = '✰ 𝙳𝚎𝚛𝚛𝚘𝚝𝚊 ✰\n༻ La IA ganó esta vez.'

      await User.updateOne(
        { jid: sender },
        { $inc: { pptLosses: 1 } }
      )
    }

    const out =
      `✰ 𝙿𝙿𝚃 𝚅𝚂 𝙸𝙰 ✰\n\n` +
      `༻ Vos: *${EMOJIS[mov]}*\n` +
      `༻ IA: *${EMOJIS[iaMove]}*\n\n` +
      `${resultado}`

    return conn.sendMessage(
      partidaChatId,
      {
        text: out,
        mentions: [sender]
      },
      { quoted: m }
    )
  }

  if (!p.vsIA && !p.esperando) {
    if (
      sender !== p.jugador1 &&
      sender !== p.jugador2
    ) return

    const mov = MOVES[texto]
    if (!mov) return

    if (sender === p.jugador1 && !p.eleccion1) {
      p.eleccion1 = mov
      partidas.set(partidaChatId, p)

      await conn.sendMessage(sender, {
        text:
          `✰ 𝙴𝚕𝚎𝚌𝚌𝚒ó𝚗 𝚁𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚊 ✰\n` +
          `༻ Tu jugada fue guardada.\n` +
          `༻ Esperando al rival...`
      })

      if (p.eleccion2) {
        await resolverPvP(
          p.groupChat,
          p,
          partidaChatId,
          conn
        )
      }

      return
    }

    if (sender === p.jugador2 && !p.eleccion2) {
      p.eleccion2 = mov
      partidas.set(partidaChatId, p)

      await conn.sendMessage(sender, {
        text:
          `✰ 𝙴𝚕𝚎𝚌𝚌𝚒ó𝚗 𝚁𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚊 ✰\n` +
          `༻ Tu jugada fue guardada.\n` +
          `༻ Esperando al rival...`
      })

      if (p.eleccion1) {
        await resolverPvP(
          p.groupChat,
          p,
          partidaChatId,
          conn
        )
      }

      return
    }
  }
}

handler.help = [
  'ppt ia',
  'ppt @usuario [apuesta]'
]

handler.tags = ['fun']

handler.command = [
  'ppt',
  'rps',
  'jkp',
  'piedrapapeltijera',
  'pptstats',
  'pptranking',
  'pptrank',
  'rpsranking',
  'rpsrank',
  'jkpranking',
  'jkprank',
  'aceptar',
  'accept',
  'aceitar',
  'rechazar',
  'decline',
  'recusar'
]

export default handler