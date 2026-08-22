import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'
import { userCache } from '../../lib/caches.js'

const extraerNum = (jid = '') => {
  return typeof jid === 'string'
    ? jid.split('@')[0].split(':')[0].replace(/\D/g, '')
    : ''
}

const resolveTargetJid = (m, participants = []) => {
  const raw = m.mentionedJid?.[0] || m.quoted?.sender || null

  if (!raw) return null
  if (!raw.endsWith('@lid')) return raw

  const p = participants.find(p => p.id === raw || p.lid === raw)

  if (p?.phoneNumber) {
    return `${String(p.phoneNumber).replace(/\D/g, '')}@s.whatsapp.net`
  }

  if (p?.id?.includes('@s.whatsapp.net')) {
    return p.id
  }

  return raw
}

const findByNum = async (jid) => {
  const num = extraerNum(jid)

  if (!num) return null

  return await User.findOne({
    jid: { $regex: `^${num}@` }
  })
}

const SWORD_BUFF = {
  none: 1.00,
  normal: 1.15,
  rare: 1.30,
  mythic: 1.50,
  legendary: 1.80
}

const SWORD_ICON = {
  none: '',
  normal: '⚔️',
  rare: '🗡️',
  mythic: '🌌',
  legendary: '🔥'
}

const POTION_HP = {
  normal: 200,
  rare: 350,
  mythic: 600
}

function getPotionStock(inv = {}) {
  if (inv.potionStock instanceof Map) {
    return Object.fromEntries(inv.potionStock)
  }

  return inv.potionStock || {}
}

function bestPotion(inv = {}) {
  const stock = getPotionStock(inv)

  for (const tier of ['mythic', 'rare', 'normal']) {
    if (Number(stock[tier]) > 0) {
      return {
        tier,
        hpBonus: POTION_HP[tier],
        legacy: false
      }
    }
  }

  if (
    Number(inv.potion || 0) > 0 &&
    !stock.normal &&
    !stock.rare &&
    !stock.mythic
  ) {
    return {
      tier: 'normal',
      hpBonus: POTION_HP.normal,
      legacy: true
    }
  }

  return null
}

const battleStories = [
  '🤠 Se encontraron en el centro del pueblo. {w} fue más rápido y consiguió la victoria.',
  '⚔️ En un duelo de espadas, {w} encontró una oportunidad y superó a {l}.',
  '🥋 {w} utilizó una técnica especial y dejó a {l} sin respuesta.',
  '🪄 {w} lanzó un poderoso hechizo que hizo que {l} abandonara el duelo.',
  '🦾 {w} demostró una fuerza impresionante y consiguió superar a {l}.',
  '🌌 {w} utilizó su sable especial para desarmar a {l}.',
  '🏹 {l} intentó sorprender a {w}, pero este reaccionó a tiempo y ganó.',
  '🥊 {w} dominó el combate y consiguió una victoria contundente.',
  '🐉 {w} invocó el poder del dragón y superó a {l}.',
  '♟️ No fue cuestión de fuerza. {w} utilizó estrategia y consiguió vencer a {l}.',
  '⚡ {w} se movió a gran velocidad y sorprendió completamente a {l}.',
  '🛡️ {l} intentó atacar, pero {w} esperó el momento perfecto para contraatacar.',
  '💻 {w} desactivó las defensas de {l} y consiguió la victoria.',
  '🔱 Ante todos los espectadores, {w} consiguió superar a {l} en el duelo.',
  '🌊 {w} utilizó el poder del océano y consiguió derrotar a {l}.',
  '🎤 {w} ganó la batalla de rap y {l} tuvo que aceptar la derrota.',
  '👨‍🍳 Fue un duelo de cocina. El plato de {w} fue tan bueno que {l} se rindió.',
  '💨 {w} activó el turbo en el último momento y dejó atrás a {l}.',
  '🪵 {w} demostró una fuerza increíble y consiguió superar a {l}.',
  '🌫️ {w} utilizó una técnica de ilusión y confundió completamente a {l}.',
  '🐺 Bajo la luna llena, {w} mostró su poder y consiguió la victoria.',
  '❄️ En una batalla congelada, {w} resistió hasta el final y venció a {l}.',
  '🎾 {w} devolvió el ataque de {l} y consiguió darle la vuelta al duelo.',
  '🤘 {w} realizó una actuación legendaria y consiguió la victoria.',
  '🏗️ {w} levantó una defensa imposible de superar para {l}.',
  '📍 {w} utilizó su ingenio para sorprender a {l}.',
  '🚲 {w} escapó con el botín mientras {l} todavía intentaba entender lo ocurrido.',
  '🐾 {w} demostró unos reflejos increíbles y esquivó todos los ataques de {l}.',
  '✨ {w} utilizó el poder de sus objetos especiales y superó a {l}.',
  '👤 {w} se escondió entre las sombras y sorprendió a {l}.',
  '🍯 Un grupo de abejas entrenadas por {w} distrajo a {l} lo suficiente para ganar.',
  '🛤️ {w} avanzó con tanta fuerza que {l} no pudo seguirle el ritmo.',
  '🃏 {w} tenía un as bajo la manga y sorprendió a {l}.',
  '👹 La máscara de {w} sorprendió a {l} y cambió completamente el duelo.',
  '🛠️ {w} demostró una resistencia increíble y consiguió superar a {l}.',
  '🍜 {w} utilizó una poción especial y consiguió una ventaja decisiva.',
  '👀 En la oscuridad, {w} consiguió localizar a {l} antes que nadie.',
  '🔬 La estrategia de {w} fue mucho mejor y consiguió la victoria.',
  '👑 {w} reclamó el trono después de superar a {l}.',
  '🛐 {w} recibió una bendición especial y consiguió una victoria impresionante.',
  '🌪️ Un tornado invocado por {w} cambió completamente el rumbo del duelo.',
  '💰 {w} consiguió convencer a los jueces y terminó ganando.',
  '🎯 {w} demostró una precisión increíble y consiguió superar a {l}.',
  '🚀 {w} utilizó una técnica especial y consiguió enviar a {l} fuera de la arena.'
]

const handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command,
    userDb,
    participants
  }
) => {
  try {
    if (!userDb) return

    const senderJid = userDb.jid
    const now = Date.now()
    const cooldown = 300000

    const remaining =
      cooldown - (now - Number(userDb.lastDuel || 0))

    if (remaining > 0) {
      return m.reply(
`༺ 𝙰𝚁𝙴𝙽𝙰 ༻

✰ 𝙰𝚛𝚎𝚗𝚊 𝚌𝚎𝚛𝚛𝚊𝚍𝚊

> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊: *${Math.floor(remaining / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s*`
      )
    }

    const targetRaw = resolveTargetJid(m, participants)

    if (
      !targetRaw ||
      extraerNum(targetRaw) === extraerNum(m.sender)
    ) {
      return m.reply(
`༺ 𝙳𝚄𝙴𝙻𝙾 ༻

✰ 𝚄𝚜𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚘

> ✰ ${usedPrefix + command} @usuario [apuesta]

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘

> ✰ ${usedPrefix + command} @usuario 500`
      )
    }

    const txt = String(text || '')

    const montoMatch = txt
      .replace(/@\d+/g, '')
      .match(/\d+/)

    let apuesta
    let fueAleatoria = false

    if (montoMatch) {
      apuesta = parseInt(montoMatch[0])

      if (
        isNaN(apuesta) ||
        apuesta < 2 ||
        apuesta > 10000
      ) {
        return m.reply(
`༺ 𝙰𝙿𝚄𝙴𝚂𝚃𝙰 ༻

✰ 𝙰𝚙𝚞𝚎𝚜𝚝𝚊 𝚒𝚗𝚟𝚊́𝚕𝚒𝚍𝚊

> ✰ Rango permitido: *2 - 10,000*
> ✰ Moneda: ${config.CURRENCY_NAME}`
        )
      }
    } else {
      apuesta = Math.floor(Math.random() * 3499) + 2
      fueAleatoria = true
    }

    if (Number(userDb.genosCoins || 0) < apuesta) {
      return m.reply(
`༺ 𝙵𝙾𝙽𝙳𝙾𝚂 ༻

✰ 𝙵𝚘𝚗𝚍𝚘𝚜 𝚒𝚗𝚜𝚞𝚏𝚒𝚌𝚒𝚎𝚗𝚝𝚎𝚜

> ✰ Necesitás: *${apuesta} ${config.CURRENCY_NAME}*
> ✰ Tenés: *${userDb.genosCoins || 0} ${config.CURRENCY_NAME}*`
      )
    }

    const v = await findByNum(targetRaw)

    if (!v) {
      return m.reply(
`༺ 𝚁𝙸𝚅𝙰𝙻 ༻

✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘 𝚗𝚘 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚘`
      )
    }

    if (Number(v.genosCoins || 0) < apuesta) {
      return m.reply(
`༺ 𝙵𝙾𝙽𝙳𝙾𝚂 ༻

✰ 𝙴𝚕 𝚛𝚒𝚟𝚊𝚕 𝚗𝚘 𝚝𝚒𝚎𝚗𝚎 𝚜𝚞𝚏𝚒𝚌𝚒𝚎𝚗𝚝𝚎

> ✰ Tiene: *${v.genosCoins || 0} ${config.CURRENCY_NAME}*
> ✰ Apuesta: *${apuesta} ${config.CURRENCY_NAME}*`
      )
    }

    const target = v.jid

    const invA = userDb.inventory || {}
    const invB = v.inventory || {}

    const swordTierA =
      invA.swordTier &&
      invA.swordTier !== 'none'
        ? invA.swordTier
        : Number(invA.sword || 0) > 0
          ? 'normal'
          : 'none'

    const swordTierB =
      invB.swordTier &&
      invB.swordTier !== 'none'
        ? invB.swordTier
        : Number(invB.sword || 0) > 0
          ? 'normal'
          : 'none'

    const dmgBuffA = SWORD_BUFF[swordTierA] ?? 1
    const dmgBuffB = SWORD_BUFF[swordTierB] ?? 1

    const usedSwordA = swordTierA !== 'none'
    const usedSwordB = swordTierB !== 'none'

    const potionA = bestPotion(invA)
    const potionB = bestPotion(invB)

    const hpInicialA =
      100 + (potionA ? potionA.hpBonus : 0)

    const hpInicialB =
      100 + (potionB ? potionB.hpBonus : 0)

    let hpA = hpInicialA
    let hpB = hpInicialB

    const updateA = {
      $inc: {},
      $set: {
        lastDuel: now
      }
    }

    const updateB = {
      $inc: {},
      $set: {}
    }

    // ━━━━━━━━ POTIONES ━━━━━━━━

    if (potionA) {
      updateA.$inc['inventory.potion'] = -1

      if (!potionA.legacy) {
        updateA.$inc[
          `inventory.potionStock.${potionA.tier}`
        ] = -1
      }
    }

    if (potionB) {
      updateB.$inc['inventory.potion'] = -1

      if (!potionB.legacy) {
        updateB.$inc[
          `inventory.potionStock.${potionB.tier}`
        ] = -1
      }
    }

    // ━━━━━━━━ ESPADAS ━━━━━━━━

    if (usedSwordA) {
      const usos =
        Number(invA.swordUses || 1)

      updateA.$inc['inventory.swordUses'] = -1

      if (usos <= 1) {
        updateA.$set['inventory.swordUses'] = 0
        updateA.$set['inventory.swordTier'] = 'none'
        updateA.$set['inventory.sword'] = 0
      }
    }

    if (usedSwordB) {
      const usos =
        Number(invB.swordUses || 1)

      updateB.$inc['inventory.swordUses'] = -1

      if (usos <= 1) {
        updateB.$set['inventory.swordUses'] = 0
        updateB.$set['inventory.swordTier'] = 'none'
        updateB.$set['inventory.sword'] = 0
      }
    }

    // ━━━━━━━━ BATALLA ━━━━━━━━

    const logs = []

    let turn = 0

    while (hpA > 0 && hpB > 0 && turn < 50) {
      turn++

      const d1 = Math.floor(
        (Math.random() * 20 + 10) * dmgBuffA
      )

      hpB -= d1

      logs.push(
        `✰ @${extraerNum(senderJid)} obtiene ventaja`
      )

      if (hpB <= 0) break

      const d2 = Math.floor(
        (Math.random() * 20 + 10) * dmgBuffB
      )

      hpA -= d2

      logs.push(
        `✰ @${extraerNum(target)} responde`
      )
    }

    const win = hpA > 0

    const winner = win
      ? senderJid
      : target

    const loser = win
      ? target
      : senderJid

    // ━━━━━━━━ RECOMPENSA ━━━━━━━━

    if (win) {
      updateA.$inc.genosCoins = apuesta
      updateB.$inc.genosCoins = -apuesta

      userDb.genosCoins =
        Number(userDb.genosCoins || 0) + apuesta
    } else {
      updateA.$inc.genosCoins = -apuesta
      updateB.$inc.genosCoins = apuesta

      userDb.genosCoins =
        Number(userDb.genosCoins || 0) - apuesta
    }

    userDb.lastDuel = now

    // ━━━━━━━━ GUARDAR ━━━━━━━━

    await Promise.all([
      User.updateOne(
        { jid: senderJid },
        updateA
      ),

      User.updateOne(
        { jid: target },
        updateB
      )
    ])

    // ━━━━━━━━ CACHE DEL RIVAL ━━━━━━━━

    const targetCache =
      userCache.get(target) ||
      userCache.get(extraerNum(target))

    if (targetCache) {
      targetCache.genosCoins =
        Number(targetCache.genosCoins || 0) +
        (win ? -apuesta : apuesta)

      if (!targetCache.inventory) {
        targetCache.inventory = {}
      }

      if (potionB) {
        targetCache.inventory.potion =
          Math.max(
            0,
            Number(targetCache.inventory.potion || 0) - 1
          )

        if (
          !potionB.legacy &&
          targetCache.inventory.potionStock
        ) {
          targetCache.inventory.potionStock[potionB.tier] =
            Math.max(
              0,
              Number(
                targetCache.inventory.potionStock[potionB.tier] || 0
              ) - 1
            )
        }
      }

      if (usedSwordB) {
        const usos =
          Number(
            targetCache.inventory.swordUses || 1
          ) - 1

        targetCache.inventory.swordUses =
          Math.max(0, usos)

        if (usos <= 0) {
          targetCache.inventory.swordTier = 'none'
          targetCache.inventory.sword = 0
        }
      }
    }

    // ━━━━━━━━ HISTORIA ━━━━━━━━

    const story =
      battleStories[
        Math.floor(
          Math.random() * battleStories.length
        )
      ]
        .replace(
          /{w}/g,
          `@${extraerNum(winner)}`
        )
        .replace(
          /{l}/g,
          `@${extraerNum(loser)}`
        )

    const pfp = await conn
      .profilePictureUrl(winner, 'image')
      .catch(
        () =>
          'https://i.postimg.cc/wvW9wHP1/file-000000006db0820e9b4a94f49b7a7f39.png'
      )

    // ━━━━━━━━ RESPUESTA ━━━━━━━━

    let resText =
`༺ 𝙳𝚄𝙴𝙻𝙾 ༻

✰ 𝙰𝚛𝚎𝚗𝚊 𝚍𝚎 𝚂𝚊𝚒𝚝𝚊𝚖𝚊

> ✰ @${extraerNum(senderJid)}
> ✰ @${extraerNum(target)}

`

    if (fueAleatoria) {
      resText +=
`✰ 𝙰𝚙𝚞𝚎𝚜𝚝𝚊 𝚊𝚕𝚎𝚊𝚝𝚘𝚛𝚒𝚊
> ✰ ${apuesta.toLocaleString('es-AR')} ${config.CURRENCY_NAME}

`
    } else {
      resText +=
`✰ 𝙰𝚙𝚞𝚎𝚜𝚝𝚊
> ✰ ${apuesta.toLocaleString('es-AR')} ${config.CURRENCY_NAME}

`
    }

    resText +=
`✰ 𝙿𝚞𝚗𝚝𝚘𝚜 𝚍𝚎 𝚟𝚒𝚍𝚊

> ✰ @${extraerNum(senderJid)}: ${hpInicialA} PV ${usedSwordA ? SWORD_ICON[swordTierA] : ''}${potionA ? ' 🧪' : ''}
> ✰ @${extraerNum(target)}: ${hpInicialB} PV ${usedSwordB ? SWORD_ICON[swordTierB] : ''}${potionB ? ' 🧪' : ''}

✰ 𝙱𝚊𝚝𝚊𝚕𝚕𝚊

${logs.slice(-5).join('\n')}

> ✰ ${story}

✰ 𝙶𝚊𝚗𝚊𝚍𝚘𝚛
> ✰ @${extraerNum(winner)}

✰ 𝙱𝚘𝚝í𝚗
> ✰ ${(apuesta * 2).toLocaleString('es-AR')} ${config.CURRENCY_NAME}

༺ ${config.footer} ༻`

    await conn.sendMessage(
      m.chat,
      {
        image: { url: pfp },
        caption: resText,
        mentions: [
          senderJid,
          target,
          winner,
          loser
        ]
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('[ERROR DUELO]', e)

    return m.reply(
`༺ 𝙴𝚁𝚁𝙾𝚁 ༻

✰ 𝙾𝚌𝚞𝚛𝚛𝚒ó 𝚞𝚗 𝚎𝚛𝚛𝚘𝚛 𝚒𝚗𝚝𝚎𝚛𝚗𝚘

> ✰ Intentá nuevamente más tarde.`
    )
  }
}

handler.help = [
  'duelo @tag',
  'duelo @tag <apuesta>'
]

handler.tags = ['eco']

handler.command = [
  'duel',
  'duelo'
]

handler.groupOnly = true
handler.register = true

export default handler