import config from '../../config.js'

const formatTime = (ms) => {
  if (ms <= 0) return '✰ 𝙻𝚒𝚜𝚝𝚘'

  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)

  if (h > 0) return `✰ ${h}h ${m}m`
  if (m > 0) return `✰ ${m}m ${s}s`

  return `✰ ${s}s`
}

const getCooldown = (lastTime, cooldown, now) => {
  return formatTime(
    cooldown - (now - Number(lastTime || 0))
  )
}

const handler = async (m, { conn, userDb }) => {
  if (!userDb) return

  const now = Date.now()

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ TIEMPOS DE ESPERA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const cdDaily = 86400000
  const cdMine = 900000
  const cdHunt = 600000
  const cdFish = 600000
  const cdWork = 600000
  const cdCrime = 1200000
  const cdRob = 1800000
  const cdGenosRob = 3600000
  const cdDuel = 300000
  const cdRoulette = 300000

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ ESTADOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const stMine = getCooldown(
    userDb.lastMine,
    cdMine,
    now
  )

  const stHunt = getCooldown(
    userDb.lastHunt,
    cdHunt,
    now
  )

  const stFish = getCooldown(
    userDb.lastFish,
    cdFish,
    now
  )

  const stWork = getCooldown(
    userDb.lastWork,
    cdWork,
    now
  )

  const stCrime = getCooldown(
    userDb.lastCrime,
    cdCrime,
    now
  )

  const stRob = getCooldown(
    userDb.lastRob,
    cdRob,
    now
  )

  const stGenosRob = getCooldown(
    userDb.lastGenosRob,
    cdGenosRob,
    now
  )

  const stDuel = getCooldown(
    userDb.lastDuel,
    cdDuel,
    now
  )

  const stDaily = getCooldown(
    userDb.lastDaily,
    cdDaily,
    now
  )

  const stRoulette = getCooldown(
    userDb.lastRoulette,
    cdRoulette,
    now
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ RUleta
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const roulettePlays =
    Number(
      userDb.dailyStats?.rouletteCount || 0
    )

  const rouletteStatus =
    roulettePlays >= 15
      ? '✰ 𝙻í𝚖𝚒𝚝𝚎 𝚊𝚕𝚌𝚊𝚗𝚣𝚊𝚍𝚘 [15/15]'
      : `${stRoulette} [${roulettePlays}/15]`

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ NÚMERO DEL USUARIO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const numero =
    String(m.sender || '')
      .split('@')[0]
      .split(':')[0]

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ MENSAJE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  let txt =
`༺ 𝙴𝚂𝚃𝙰𝙳𝙾 𝙴𝙲𝙾𝙽𝙾𝙼Í𝙰 ༻

✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘

> ✰ @${numero}

✰ 𝚃𝚛𝚊𝚋𝚊𝚓𝚘𝚜 𝚢 𝚛𝚎𝚌𝚘𝚕𝚎𝚌𝚌𝚒ó𝚗

> ✰ ⛏️ 𝙼𝚒𝚗𝚊𝚛: ${stMine}
> ✰ 🏹 𝙲𝚊𝚣𝚊𝚛: ${stHunt}
> ✰ 🎣 𝙿𝚎𝚜𝚌𝚊𝚛: ${stFish}
> ✰ 💼 𝚃𝚛𝚊𝚋𝚊𝚓𝚊𝚛: ${stWork}

✰ 𝙸𝚕𝚎𝚐𝚊𝚕𝚎𝚜 𝚢 𝚌𝚘𝚖𝚋𝚊𝚝𝚎

> ✰ 🔫 𝙲𝚛𝚒𝚖𝚎𝚗: ${stCrime}
> ✰ 🥷 𝚁𝚘𝚋𝚊𝚛: ${stRob}
> ✰ 🛰️ 𝙰𝚜𝚊𝚕𝚝𝚘 𝙲𝚞á𝚗𝚝𝚒𝚌𝚘: ${stGenosRob}
> ✰ ⚔️ 𝙳𝚞𝚎𝚕𝚘: ${stDuel}

✰ 𝙴𝚡𝚝𝚛𝚊𝚜

> ✰ 🎁 𝙳𝚒𝚊𝚛𝚒𝚘: ${stDaily}
> ✰ 🎡 𝚁𝚞𝚕𝚎𝚝𝚊: ${rouletteStatus}

༺ ${config.footer} ༻`

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✰ ENVIAR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await conn.sendMessage(
    m.chat,
    {
      text: txt,
      mentions: [m.sender]
    },
    {
      quoted: m
    }
  )
}

handler.help = [
  'einfo',
  'cooldowns',
  'tiempos',
  'cd',
  'miscd'
]

handler.tags = ['eco']

handler.command = [
  'einfo',
  'cooldowns',
  'tiempos',
  'cd',
  'miscd'
]

handler.register = true

export default handler