import { palabras } from '../../lib/games/palabras.js'
import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const partidas = new Map()
const VIDAS_MAX = 6
const PREMIO_BASE = 500

const HORCA = [
  `  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========`
]

function nombreCorto(jid) {
  return jid.split('@')[0]
}

function elegirPalabra() {
  const entrada = palabras[Math.floor(Math.random() * palabras.length)]

  if (typeof entrada === 'string') {
    return {
      palabra: entrada.toLowerCase(),
      categoria: null
    }
  }

  return {
    palabra: entrada.palabra.toLowerCase(),
    categoria: entrada.categoria || null
  }
}

function esPalabraCompleta(p) {
  return p.palabra
    .split('')
    .every(letra => letra === ' ' || p.descubiertas.has(letra))
}

function calcularPremio(vidasRestantes, bonus = false) {
  const porVida = 150
  const bonusAdi = 400

  return PREMIO_BASE +
    (vidasRestantes * porVida) +
    (bonus ? bonusAdi : 0)
}

function dibujarEstado(p) {
  const progreso = p.palabra
    .split('')
    .map(letra =>
      letra === ' '
        ? '  '
        : (p.descubiertas.has(letra) ? letra : '_')
    )
    .join(' ')

  const letrasUsadas =
    [...p.usadas].sort().join(' ') || '—'

  const vidasEmoji =
    '❤️'.repeat(p.vidas) +
    '🖤'.repeat(VIDAS_MAX - p.vidas)

  return `\`\`\`
${HORCA[VIDAS_MAX - p.vidas]}
\`\`\`
> ${vidasEmoji}
> \`${progreso}\`
> Letras usadas: \`${letrasUsadas}\``
}

function letrasRestantes(p) {
  return p.palabra
    .split('')
    .filter(letra =>
      letra !== ' ' &&
      !p.descubiertas.has(letra)
    )
}

const handler = async (m, ctx) => {
  const {
    conn,
    command,
    text
  } = ctx

  const chatId = m.chat
  const sender = m.sender
  const S = config.CURRENCY_SYMBOL

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ AHORCADO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (['ahorcado', 'ah', 'hangman', 'forca'].includes(command)) {

    if (partidas.has(chatId)) {
      const p = partidas.get(chatId)

      return conn.sendMessage(
        chatId,
        {
          text:
`*✰ 𝙿𝙰𝚁𝚃𝙸𝙳𝙰 𝙰𝙲𝚃𝙸𝚅𝙰 ༻*

> 👤 Jugador: @${nombreCorto(p.jugador)}

${dibujarEstado(p)}

> Envía una letra sin prefijo.
> Usa *!adivinar <palabra>* para intentar adivinar.
> Usa *!pista* para recibir una pista.
> Usa *!rendirme* para abandonar.`,
          mentions: [p.jugador]
        },
        { quoted: m }
      )
    }

    const { palabra, categoria } = elegirPalabra()

    const p = {
      jugador: sender,
      palabra,
      categoria,
      descubiertas: new Set(),
      usadas: new Set(),
      vidas: VIDAS_MAX,
      pistas: 0,
      inicio: Date.now()
    }

    partidas.set(chatId, p)

    const premioMax = calcularPremio(VIDAS_MAX)

    let texto =
`*✰ 𝙰𝙷𝙾𝚁𝙲𝙰𝙳𝙾 ༻*

`

    if (categoria) {
      texto += `> 📂 Categoría: *${categoria}*\n`
    }

    texto +=
`> 🔤 Palabra de *${palabra.length}* letra${palabra.length !== 1 ? 's' : ''}
> 💰 Premio máximo: *${premioMax} ${S}*
> 💡 Usa *!pista* para revelar una letra.
> 🖤 Cada error te hará perder una vida.

${dibujarEstado(p)}

> Envía una letra directamente al chat.
> *!adivinar <palabra>* │ *!rendirme*`

    return m.reply(texto)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ PISTA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (command === 'pista') {

    if (!partidas.has(chatId)) {
      return m.reply(
`*✰ 𝚂𝙸𝙽 𝙿𝙰𝚁𝚃𝙸𝙳𝙰 ༻*

> Inicia una partida usando *!ahorcado*.`
      )
    }

    const p = partidas.get(chatId)

    if (p.jugador !== sender) {
      return m.reply(
`*✰ 𝙽𝙾 𝙴𝚂 𝚃𝚄 𝙿𝙰𝚁𝚃𝙸𝙳𝙰 ༻*

> Esta partida pertenece a @${nombreCorto(p.jugador)}.`,
        { mentions: [p.jugador] }
      )
    }

    if (p.vidas <= 1) {
      return m.reply(
`*✰ 𝚂𝙸𝙽 𝚅𝙸𝙳𝙰𝚂 ༻*

> Necesitas al menos *2 vidas* para utilizar una pista.`
      )
    }

    const restantes = letrasRestantes(p)

    if (!restantes.length) {
      return m.reply(
`*✰ 𝙲𝙰𝚂𝙸 𝙻𝙸𝚂𝚃𝙾 ༻*

> No quedan letras por revelar.`
      )
    }

    const letraRevelada =
      restantes[Math.floor(Math.random() * restantes.length)]

    p.descubiertas.add(letraRevelada)
    p.usadas.add(letraRevelada)
    p.vidas--
    p.pistas++

    if (esPalabraCompleta(p)) {
      partidas.delete(chatId)

      const premio = calcularPremio(p.vidas)

      await User.updateOne(
        { jid: sender },
        {
          $inc: {
            genosCoins: premio,
            ahWins: 1,
            ahEarned: premio
          }
        }
      )

      return conn.sendMessage(
        chatId,
        {
          text:
`*✰ 𝙿𝙰𝙻𝙰𝙱𝚁𝙰 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰 ༻*

> 🎯 Palabra: *${p.palabra.toUpperCase()}*
> 💰 Premio: *+${premio} ${S}*

${dibujarEstado(p)}`,
          mentions: [sender]
        },
        { quoted: m }
      )
    }

    return conn.sendMessage(
      chatId,
      {
        text:
`*✰ 𝙿𝙸𝚂𝚃𝙰 ༻*

> La letra *${letraRevelada.toUpperCase()}* fue revelada.
> ❤️ Se descontó una vida.

${dibujarEstado(p)}

> Envía una letra │ *!adivinar <palabra>* │ *!rendirme*`,
        mentions: [sender]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ ADIVINAR PALABRA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (['adivinar', 'adi', 'guess'].includes(command)) {

    if (!partidas.has(chatId)) {
      return m.reply(
`*✰ 𝚂𝙸𝙽 𝙿𝙰𝚁𝚃𝙸𝙳𝙰 ༻*

> Inicia una partida usando *!ahorcado*.`
      )
    }

    const p = partidas.get(chatId)

    if (p.jugador !== sender) return

    if (!text?.trim()) {
      return m.reply(
`*✰ 𝚄𝚂𝙾 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ༻*

> *!adivinar <palabra>*`
      )
    }

    const intento = text.toLowerCase().trim()

    if (intento === p.palabra) {

      partidas.delete(chatId)

      const premio =
        calcularPremio(p.vidas, true)

      await User.updateOne(
        { jid: sender },
        {
          $inc: {
            genosCoins: premio,
            ahWins: 1,
            ahEarned: premio
          }
        }
      )

      return conn.sendMessage(
        chatId,
        {
          text:
`*✰ 𝙰𝙳𝙸𝚅𝙸𝙽𝙰𝚂𝚃𝙴 ༻*

> 🎯 Palabra: *${p.palabra.toUpperCase()}*
> 💰 Premio: *+${premio} ${S}*
> ✨ Incluye bono especial.

${dibujarEstado(p)}`,
          mentions: [sender]
        },
        { quoted: m }
      )
    }

    p.vidas -= 2

    if (p.vidas < 0) {
      p.vidas = 0
    }

    if (p.vidas === 0) {

      partidas.delete(chatId)

      await User.updateOne(
        { jid: sender },
        { $inc: { ahLosses: 1 } }
      )

      return conn.sendMessage(
        chatId,
        {
          text:
`*✰ 𝙿𝙴𝚁𝙳𝙸𝚂𝚃𝙴 ༻*

> ❌ El intento fue incorrecto.
> 🎯 La palabra era: *${p.palabra.toUpperCase()}*

${dibujarEstado(p)}`,
          mentions: [sender]
        },
        { quoted: m }
      )
    }

    return conn.sendMessage(
      chatId,
      {
        text:
`*✰ 𝙸𝙽𝚃𝙴𝙽𝚃𝙾 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ༻*

> ❌ Perdiste *2 vidas*.

${dibujarEstado(p)}

> Envía una letra │ *!adivinar <palabra>* │ *!rendirme*`,
        mentions: [sender]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ RENDIRSE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (['rendirme', 'giveup'].includes(command)) {

    if (!partidas.has(chatId)) {
      return m.reply(
`*✰ 𝚂𝙸𝙽 𝙿𝙰𝚁𝚃𝙸𝙳𝙰 ༻*`
      )
    }

    const p = partidas.get(chatId)

    if (p.jugador !== sender) return

    partidas.delete(chatId)

    await User.updateOne(
      { jid: sender },
      { $inc: { ahLosses: 1 } }
    )

    return conn.sendMessage(
      chatId,
      {
        text:
`*✰ 𝚃𝙴 𝚁𝙸𝙽𝙳𝙸𝚂𝚃𝙴 ༻*

> La palabra era:
> *${p.palabra.toUpperCase()}*`,
        mentions: [sender]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ ESTADÍSTICAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (['ahstats', 'hangmanstats'].includes(command)) {

    const jid = m.mentionedJid?.[0] || sender
    const u = await User.findOne({ jid }).lean()

    const wins = u?.ahWins || 0
    const losses = u?.ahLosses || 0
    const ganado = u?.ahEarned || 0

    const total = wins + losses
    const pct =
      total > 0
        ? ((wins / total) * 100).toFixed(1)
        : '0.0'

    return conn.sendMessage(
      chatId,
      {
        text:
`*✰ 𝙴𝚂𝚃𝙰𝙳𝙸𝚂𝚃𝙸𝙲𝙰𝚂 𝙰𝙷𝙾𝚁𝙲𝙰𝙳𝙾 ༻*

> 👤 Jugador: @${nombreCorto(jid)}
> 🏆 Victorias: *${wins}*
> 💀 Derrotas: *${losses}*
> 📈 Win rate: *${pct}%*
> 💰 Ganado: *+${ganado} ${S}*`,
        mentions: [jid]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ RANKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (['ahranking', 'ahrank', 'hangmanrank'].includes(command)) {

    const todos = await User.find(
      {
        $or: [
          { ahWins: { $gt: 0 } },
          { ahLosses: { $gt: 0 } }
        ]
      },
      {
        jid: 1,
        name: 1,
        ahWins: 1,
        ahLosses: 1,
        ahEarned: 1
      }
    )
      .sort({
        ahWins: -1
      })
      .limit(10)
      .lean()

    if (!todos.length) {
      return m.reply(
`*✰ 𝚁𝙰𝙽𝙺𝙸𝙽𝙶 𝙰𝙷𝙾𝚁𝙲𝙰𝙳𝙾 ༻*

> Nadie ha jugado todavía.`
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
          u.name ||
          nombreCorto(u.jid)

        return `${MEDALS[i]} *${n}* — 🏆${u.ahWins || 0} 💀${u.ahLosses || 0} │ *+${u.ahEarned || 0} ${S}*`
      })
      .join('\n')

    return conn.sendMessage(
      chatId,
      {
        text:
`*✰ 𝚁𝙰𝙽𝙺𝙸𝙽𝙶 𝙶𝙻𝙾𝙱𝙰𝙻 𝙰𝙷𝙾𝚁𝙲𝙰𝙳𝙾 ༻*

${lineas}`,
        mentions: todos.map(u => u.jid)
      },
      { quoted: m }
    )
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✰ CAPTURA DE LETRAS SIN PREFIJO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.all = async (m, ctx) => {

  const { conn } = ctx
  const chatId = m.chat
  const sender = m.sender
  const S = config.CURRENCY_SYMBOL

  if (!partidas.has(chatId)) return

  const p = partidas.get(chatId)

  if (p.jugador !== sender) return

  const letra =
    (m.body || '')
      .trim()
      .toLowerCase()

  if (!/^\p{L}$/u.test(letra)) return

  if (p.usadas.has(letra)) {
    return m.reply(
`*✰ 𝙻𝙴𝚃𝚁𝙰 𝚈𝙰 𝚄𝚂𝙰𝙳𝙰 ༻*

> Ya utilizaste la letra *${letra.toUpperCase()}*.`
    )
  }

  p.usadas.add(letra)

  if (p.palabra.includes(letra)) {

    p.descubiertas.add(letra)

    if (esPalabraCompleta(p)) {

      partidas.delete(chatId)

      const premio =
        calcularPremio(p.vidas)

      await User.updateOne(
        { jid: sender },
        {
          $inc: {
            genosCoins: premio,
            ahWins: 1,
            ahEarned: premio
          }
        }
      )

      return conn.sendMessage(
        chatId,
        {
          text:
`*✰ 𝙶𝙰𝙽𝙰𝚂𝚃𝙴 ༻*

> 🎯 Palabra: *${p.palabra.toUpperCase()}*
> 💰 Premio: *+${premio} ${S}*

${dibujarEstado(p)}`,
          mentions: [sender]
        },
        { quoted: m }
      )
    }

    return conn.sendMessage(
      chatId,
      {
        text:
`*✰ 𝙻𝙴𝚃𝚁𝙰 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙰 ༻*

> La letra *${letra.toUpperCase()}* está en la palabra.

${dibujarEstado(p)}

> Envía otra letra │ *!adivinar <palabra>* │ *!rendirme*`,
        mentions: [sender]
      },
      { quoted: m }
    )

  } else {

    p.vidas--

    if (p.vidas === 0) {

      partidas.delete(chatId)

      await User.updateOne(
        { jid: sender },
        { $inc: { ahLosses: 1 } }
      )

      return conn.sendMessage(
        chatId,
        {
          text:
`*✰ 𝙿𝙴𝚁𝙳𝙸𝚂𝚃𝙴 ༻*

> La letra *${letra.toUpperCase()}* no estaba en la palabra.
> 🎯 La palabra era: *${p.palabra.toUpperCase()}*

${dibujarEstado(p)}`,
          mentions: [sender]
        },
        { quoted: m }
      )
    }

    return conn.sendMessage(
      chatId,
      {
        text:
`*✰ 𝙻𝙴𝚃𝚁𝙰 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙰 ༻*

> La letra *${letra.toUpperCase()}* no está en la palabra.
> ❤️ Vidas restantes: *${p.vidas}*

${dibujarEstado(p)}

> Envía otra letra │ *!adivinar <palabra>* │ *!rendirme*`,
        mentions: [sender]
      },
      { quoted: m }
    )
  }
}

handler.help = [
  'ahorcado',
  'adivinar',
  'pista',
  'rendirme',
  'ahstats',
  'ahranking'
]

handler.tags = ['fun']

handler.command = [
  'ahorcado',
  'ah',
  'hangman',
  'forca',
  'adivinar',
  'adi',
  'guess',
  'pista',
  'rendirme',
  'giveup',
  'ahstats',
  'hangmanstats',
  'ahranking',
  'ahrank',
  'hangmanrank'
]

export default handler