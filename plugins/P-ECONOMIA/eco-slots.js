import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const SYMBOLS = [
  { s: '7️⃣', w: 2,  m3: 50, m2: 5 },
  { s: '💎', w: 4,  m3: 20, m2: 3 },
  { s: '🔔', w: 7,  m3: 10, m2: 2 },
  { s: '🍉', w: 10, m3: 5,  m2: 1.5 },
  { s: '🍇', w: 12, m3: 3, m2: 1 },
  { s: '🍋', w: 15, m3: 3, m2: 1 },
  { s: '🍒', w: 20, m3: 3, m2: 1 }
]

const getRandomSymbol = () => {
  const totalWeight = SYMBOLS.reduce((total, item) => total + item.w, 0)

  let random = Math.random() * totalWeight

  for (const symbol of SYMBOLS) {
    if (random < symbol.w) return symbol
    random -= symbol.w
  }

  return SYMBOLS[SYMBOLS.length - 1]
}

const getHelp = (usedPrefix, command, config) => {
  return `* 🎰  SAITAMA SLOTS*

✰ 𝚄𝚜𝚘: *${usedPrefix + command} <apuesta>*
✰ 𝙻í𝚖𝚒𝚝𝚎: *100 - 10,000 ${config.CURRENCY_NAME}*

*🏆  𝙿𝚛𝚎𝚖𝚒𝚘𝚜*

✰ 7️⃣7️⃣7️⃣ → *x50*
✰ 💎💎💎 → *x20*
✰ 🔔🔔🔔 → *x10*
✰ 🍉🍉🍉 → *x5*
✰ 🍒🍒🍒 → *x3*
✰ 𝙳𝚘𝚜 𝚒𝚐𝚞𝚊𝚕𝚎𝚜 → *𝚙𝚛𝚎𝚖𝚒𝚘 𝚖𝚎𝚗𝚘𝚛*

✰ 𝙲𝚘𝚘𝚕𝚍𝚘𝚠𝚗: *15 segundos*

*${config.footer}*`
}

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  if (!userDb) return

  const cooldown = 15000
  const now = Date.now()
  const elapsed = now - (userDb.lastSlots || 0)

  if (elapsed < cooldown) {
    const remaining = cooldown - elapsed

    return m.reply(
      `*⏳ 𝙼Á𝚀𝚄𝙸𝙽𝙰 𝙴𝙽 𝚄𝚂𝙾*

✰ 𝙴𝚜𝚙𝚎𝚛á: *${Math.ceil(remaining / 1000)}s*`
    )
  }

  const apuesta = Number.parseInt(String(text || '').trim(), 10)

  const minBet = 100
  const maxBet = 10000

  if (
    Number.isNaN(apuesta) ||
    apuesta < minBet ||
    apuesta > maxBet
  ) {
    return m.reply(getHelp(usedPrefix, command, config))
  }

  const saldo = Number(userDb.genosCoins) || 0

  if (saldo < apuesta) {
    return m.reply(
      `* 𝙵𝙾𝙽𝙳𝙾𝚂 𝙸𝙽𝚂𝚄𝙵𝙸𝙲𝙸𝙴𝙽𝚃𝙴𝚂*

✰ 𝚂𝚊𝚕𝚍𝚘: *${saldo} ${config.CURRENCY_NAME}*
✰ 𝙰𝚙𝚞𝚎𝚜𝚝𝚊: *${apuesta} ${config.CURRENCY_NAME}*`
    )
  }

  // Se descuenta la apuesta inmediatamente
  userDb.genosCoins = saldo - apuesta
  userDb.lastSlots = now

  await User.updateOne(
    { jid: m.sender },
    {
      $inc: {
        genosCoins: -apuesta
      },
      $set: {
        lastSlots: now
      }
    }
  )

  const buildFrame = (r1, r2, r3, status) => {
    return `*🎰 𝚂𝙰𝙸𝚃𝙰𝙼𝙰 𝚂𝙻𝙾𝚃𝚂*

✰ 𝙰𝚙𝚞𝚎𝚜𝚝𝚊: *${apuesta} ${config.CURRENCY_SYMBOL}*

      *[ ${r1} | ${r2} | ${r3} ]*

${status}

*${config.footer}*`
  }

  const sent = await conn.sendMessage(
    m.chat,
    {
      text: buildFrame(
        '🌀',
        '🌀',
        '🌀',
        '✰ 𝙶𝚒𝚛𝚊𝚗𝚍𝚘 𝚕𝚘𝚜 𝚛𝚘𝚍𝚒𝚕𝚕𝚘𝚜...'
      ),
      mentions: [m.sender]
    },
    { quoted: m }
  )

  const msgKey = sent.key

  // Animación
  for (let i = 0; i < 3; i++) {
    await sleep(700)

    const r1 = getRandomSymbol().s
    const r2 = getRandomSymbol().s
    const r3 = getRandomSymbol().s

    await conn.sendMessage(m.chat, {
      edit: msgKey,
      text: buildFrame(
        r1,
        r2,
        r3,
        '✰ 𝙻𝚘𝚜 𝚛𝚘𝚍𝚒𝚕𝚕𝚘𝚜 𝚎𝚜𝚝á𝚗 𝚐𝚒𝚛𝚊𝚗𝚍𝚘...'
      ),
      mentions: [m.sender]
    })
  }

  await sleep(800)

  const res1 = getRandomSymbol()
  const res2 = getRandomSymbol()
  const res3 = getRandomSymbol()

  let multiplicador = 0
  let mensajeFinal = ''
  let suerteAmuleto = false

  // JACKPOT
  if (
    res1.s === res2.s &&
    res2.s === res3.s
  ) {
    multiplicador = res1.m3

    mensajeFinal =
      `*🏆 𝙹𝙰𝙲𝙺𝙿𝙾𝚃*

✰ *3x ${res1.s}*

✰ 𝙿𝚛𝚎𝚖𝚒𝚘: *${Math.floor(apuesta * multiplicador)} ${config.CURRENCY_NAME}*
✰ 𝙼𝚞𝚕𝚝𝚒𝚙𝚕𝚒𝚌𝚊𝚍𝚘𝚛: *x${multiplicador}*`
  }

  // DOS IGUALES
  else if (res1.s === res2.s) {
    multiplicador = res1.m2

    mensajeFinal =
      `*🎁 𝙿𝚁𝙴𝙼𝙸𝙾 𝙼𝙴𝙽𝙾𝚁*

✰ *2x ${res1.s}*

✰ 𝙿𝚛𝚎𝚖𝚒𝚘: *${Math.floor(apuesta * multiplicador)} ${config.CURRENCY_NAME}*
✰ 𝙼𝚞𝚕𝚝𝚒𝚙𝚕𝚒𝚌𝚊𝚍𝚘𝚛: *x${multiplicador}*`
  }

  else if (res2.s === res3.s) {
    multiplicador = res2.m2

    mensajeFinal =
      `*🎁 𝙿𝚁𝙴𝙼𝙸𝙾 𝙼𝙴𝙽𝙾𝚁*

✰ *2x ${res2.s}*

✰ 𝙿𝚛𝚎𝚖𝚒𝚘: *${Math.floor(apuesta * multiplicador)} ${config.CURRENCY_NAME}*
✰ 𝙼𝚞𝚕𝚝𝚒𝚙𝚕𝚒𝚌𝚊𝚍𝚘𝚛: *x${multiplicador}*`
  }

  else if (res1.s === res3.s) {
    multiplicador = res1.m2

    mensajeFinal =
      `*🎁 𝙿𝚁𝙴𝙼𝙸𝙾 𝙼𝙴𝙽𝙾𝚁*

✰ *2x ${res1.s}*

✰ 𝙿𝚛𝚎𝚖𝚒𝚘: *${Math.floor(apuesta * multiplicador)} ${config.CURRENCY_NAME}*
✰ 𝙼𝚞𝚕𝚝𝚒𝚙𝚕𝚒𝚌𝚊𝚍𝚘𝚛: *x${multiplicador}*`
  }

  // AMULETO
  else if (
    userDb.inventory?.amulet === 'gambler' &&
    Math.random() < 0.05
  ) {
    multiplicador = 1.5
    suerteAmuleto = true

    mensajeFinal =
      `*🎲 𝙰𝙼𝚄𝙻𝙴𝚃𝙾 𝙳𝙴𝙻 𝚃𝙰𝙷Ú𝚁*

✰ 𝙴𝚕 𝚊𝚖𝚞𝚕𝚎𝚝𝚘 𝚌𝚊𝚖𝚋𝚒ó 𝚝𝚞 𝚜𝚞𝚎𝚛𝚝𝚎.

✰ 𝙿𝚛𝚎𝚖𝚒𝚘: *${Math.floor(apuesta * multiplicador)} ${config.CURRENCY_NAME}*
✰ 𝙼𝚞𝚕𝚝𝚒𝚙𝚕𝚒𝚌𝚊𝚍𝚘𝚛: *x${multiplicador}*`
  }

  // PERDER
  else {
    mensajeFinal =
      `*💀 𝙿𝙴𝚁𝙳𝙸𝚂𝚃𝙴*

✰ 𝙽𝚘 𝚑𝚞𝚋𝚘 𝚌𝚘𝚖𝚋𝚒𝚗𝚊𝚌𝚒ó𝚗 𝚐𝚊𝚗𝚊𝚍𝚘𝚛𝚊.

✰ 𝙿𝚎𝚛𝚍𝚒𝚜𝚝𝚎: *${apuesta} ${config.CURRENCY_NAME}*`
  }

  // Devuelve el premio completo
  // porque la apuesta ya fue descontada.
  if (multiplicador > 0) {
    const premio = Math.floor(apuesta * multiplicador)

    userDb.genosCoins += premio

    await User.updateOne(
      { jid: m.sender },
      {
        $inc: {
          genosCoins: premio
        }
      }
    )
  }

  const resultadoFrame = suerteAmuleto
    ? buildFrame(
        '🍒',
        '🍒',
        res3.s,
        mensajeFinal
      )
    : buildFrame(
        res1.s,
        res2.s,
        res3.s,
        mensajeFinal
      )

  await conn.sendMessage(m.chat, {
    edit: msgKey,
    text: resultadoFrame,
    mentions: [m.sender]
  })
}

handler.help = ['slots <apuesta>']
handler.tags = ['eco']
handler.command = [
  'slots',
  'tragamonedas',
  'slot',
  'apostar'
]
handler.register = true

export default handler