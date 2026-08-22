import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

import {
  loadCharacters,
  saveCharacters,
  getCharById,
  getCharsByOwner,
  getRarityData,
  gachaSessions,
  auctionSessions,
  rollGacha,
  gachaSessionKey,
  getNetSell,
  syncUserDb
} from '../../lib/games/rpg/rpgGacha.js'

const GACHA_TTL = 60 * 1000
const AUCTION_TTL = 5 * 60 * 1000

const extraerNum = (jid = '') =>
  typeof jid === 'string'
    ? jid.split('@')[0].split(':')[0].replace(/\D/g, '')
    : ''

const fmtTime = ms => {
  if (ms <= 0) return '𝙻𝚒𝚜𝚝𝚘'
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m}m ${r}s` : `${r}s`
}

const title = text => `*༺ ✰ ${text} ✰ ༻*`

function buildCharCard(char, ownerName = null) {
  const r = getRarityData(char.value)

  const owner = char.user
    ? ownerName || `+${extraerNum(char.user)}`
    : null

  const status = char.user
    ? `❌ ${owner}`
    : '✅ Libre'

  return [
    `> ✰ ${char.name}`,
    `> ✰ ${r.emoji} ${r.label}`,
    `> ✰ 💰 ${parseInt(char.value).toLocaleString()} ${config.CURRENCY_NAME}`,
    `> ✰ 🎌 ${char.source}`,
    `> ✰ 🆔 #${char.id}`,
    `> ✰ 📌 ${status}`
  ].join('\n')
}

const handler = async (
  m,
  { conn, command, args, text, usedPrefix, userDb }
) => {

  if (!userDb?.registered) {
    return m.reply(
`${title('NO REGISTRADO')}

> ✰ Primero registrate.
> ✰ ${usedPrefix}reg nombre.edad`
    )
  }

  const sender = m.sender
  const senderNum = extraerNum(sender)
  const now = Date.now()

  // ━━━━━━━━━━━━━━━ GACHA ━━━━━━━━━━━━━━━

  if ([
    'gacha',
    'invocar',
    'pull',
    'rw',
    'rollwaifu'
  ].includes(command)) {

    const key = gachaSessionKey(m.chat, sender)
    const old = gachaSessions.get(key)

    if (old) {
      return m.reply(
`${title('INVOCACIÓN ACTIVA')}

> ✰ Ya tenés una invocación.
> ✰ Personaje: *#${old.charId}*
> ✰ Tiempo: *${fmtTime(GACHA_TTL - (now - old.ts))}*
> ✰ ${usedPrefix}canjear ${old.charId}`
      )
    }

    const char = rollGacha()

    if (!char) {
      return m.reply(
`${title('SIN PERSONAJES')}

> ✰ No quedan personajes libres.
> ✰ Intentá nuevamente más tarde.`
      )
    }

    gachaSessions.set(key, {
      charId: char.id,
      ts: now
    })

    const img = char.img?.[0]

    const caption =
`${title('INVOCACIÓN')}

${buildCharCard(char)}

> ✰ ⏳ Tiempo: *60s*
> ✰ Usá *${usedPrefix}canjear ${char.id}*

> ✰ Si no lo reclamás, será liberado.`

    if (img) {
      try {
        await conn.sendMessage(
          m.chat,
          {
            image: { url: img },
            caption
          },
          { quoted: m }
        )
      } catch {
        await m.reply(caption)
      }
    } else {
      await m.reply(caption)
    }

    setTimeout(() => {
      if (!gachaSessions.has(key)) return

      gachaSessions.delete(key)

      conn.sendMessage(
        m.chat,
        {
          text:
`${title('INVOCACIÓN EXPIRADA')}

> ✰ @${senderNum}
> ✰ *${char.name}* fue liberado.`,
          mentions: [sender]
        }
      ).catch(() => {})
    }, GACHA_TTL)

    return
  }

  // ━━━━━━━━━━━━━━━ CANJEAR ━━━━━━━━━━━━━━━

  if ([
    'canjear',
    'claim',
    'reclamar'
  ].includes(command)) {

    const id = args[0]

    if (!id) {
      return m.reply(
`${title('USO')}

> ✰ ${usedPrefix}canjear <id>`
      )
    }

    const key = gachaSessionKey(m.chat, sender)
    const sess = gachaSessions.get(key)

    if (!sess) {
      return m.reply(
`${title('SIN INVOCACIÓN')}

> ✰ Primero usá *${usedPrefix}gacha*.`
      )
    }

    if (String(sess.charId) !== String(id)) {
      return m.reply(
`${title('ID INCORRECTO')}

> ✰ Tu personaje es: *#${sess.charId}*`
      )
    }

    if (now - sess.ts > GACHA_TTL) {
      gachaSessions.delete(key)

      return m.reply(
`${title('TIEMPO VENCIDO')}

> ✰ La invocación expiró.
> ✰ Usá *${usedPrefix}gacha* nuevamente.`
      )
    }

    const chars = loadCharacters()
    const char = chars.find(c => String(c.id) === String(id))

    if (!char) {
      return m.reply(
`${title('NO ENCONTRADO')}

> ✰ El personaje no existe.`
      )
    }

    if (char.user && extraerNum(char.user) !== senderNum) {
      gachaSessions.delete(key)

      return m.reply(
`${title('YA CANJEADO')}

> ✰ Este personaje pertenece a otro usuario.`
      )
    }

    char.user = sender
    char.status = 'Canjeado'

    saveCharacters(chars)
    gachaSessions.delete(key)

    const r = getRarityData(char.value)

    return m.reply(
`${title('PERSONAJE CANJEADO')}

> ✰ ${r.emoji} *${char.name}*
> ✰ Rareza: *${r.label}*
> ✰ Valor: *${parseInt(char.value).toLocaleString()} ${config.CURRENCY_NAME}*
> ✰ ID: *#${char.id}*

> ✰ Ahora forma parte de tu colección.`
    )
  }

  // ━━━━━━━━━━━━━━━ VENDER ━━━━━━━━━━━━━━━

  if ([
    'vender',
    'sell'
  ].includes(command)) {

    const id = args[0]

    if (!id) {
      return m.reply(
`${title('USO')}

> ✰ ${usedPrefix}vender <id>
> ✰ Impuesto: *30%*`
      )
    }

    const chars = loadCharacters()
    const char = chars.find(c => String(c.id) === String(id))

    if (!char) {
      return m.reply(
`${title('NO ENCONTRADO')}

> ✰ ID *#${id}* no existe.`
      )
    }

    if (
      !char.user ||
      extraerNum(char.user) !== senderNum
    ) {
      return m.reply(
`${title('NO ES TUYO')}

> ✰ Solo podés vender tus personajes.`
      )
    }

    const { net, tax } = getNetSell(char.value)

    char.user = null
    char.status = 'Libre'

    saveCharacters(chars)

    await User.updateOne(
      { jid: userDb.jid },
      { $inc: { genosCoins: net } }
    )

    userDb.genosCoins += net
    await syncUserDb(userDb)

    const r = getRarityData(char.value)

    return m.reply(
`${title('PERSONAJE VENDIDO')}

> ✰ ${r.emoji} *${char.name}*
> ✰ Valor: *${parseInt(char.value).toLocaleString()}*
> ✰ Impuesto: *-${tax.toLocaleString()}*
> ✰ Recibiste: *${net.toLocaleString()} ${config.CURRENCY_NAME}*`
    )
  }

  // ━━━━━━━━━━━━━━━ COLECCIÓN ━━━━━━━━━━━━━━━

  if ([
    'collection',
    'miscartas',
    'cartas',
    'mispersonajes'
  ].includes(command)) {

    const target = m.quoted?.sender || sender
    const targetNum = extraerNum(target)

    const owned = getCharsByOwner(target)

    if (!owned.length) {
      return m.reply(
`${title('COLECCIÓN VACÍA')}

> ✰ @${targetNum} no tiene personajes.
> ✰ Usá *${usedPrefix}gacha* para invocar.`
      )
    }

    owned.sort(
      (a, b) => parseInt(b.value) - parseInt(a.value)
    )

    const total = owned.reduce(
      (sum, c) => sum + parseInt(c.value),
      0
    )

    let txt =
`${title('COLECCIÓN')}

> ✰ 👤 @${targetNum}
> ✰ 📦 Cartas: *${owned.length}*
> ✰ 💰 Valor: *${total.toLocaleString()} ${config.CURRENCY_NAME}*

`

    for (const c of owned) {
      const r = getRarityData(c.value)

      txt +=
`> ${r.emoji} *#${c.id}* ${c.name}\n`
    }

    txt +=
`\n> ✰ ${usedPrefix}ver <id>`

    return conn.sendMessage(
      m.chat,
      {
        text: txt,
        mentions: [target]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━ VER ━━━━━━━━━━━━━━━

  if ([
    'ver',
    'info',
    'carta'
  ].includes(command)) {

    const id = args[0]

    if (!id) {
      return m.reply(
`${title('USO')}

> ✰ ${usedPrefix}ver <id>`
      )
    }

    const char = getCharById(id)

    if (!char) {
      return m.reply(
`${title('NO ENCONTRADO')}

> ✰ El personaje *#${id}* no existe.`
      )
    }

    let ownerName = null

    if (char.user) {
      const ownerDb = await User.findOne({
        jid: {
          $regex: `^${extraerNum(char.user)}@`
        }
      }).lean()

      ownerName =
        ownerDb?.name ||
        `+${extraerNum(char.user)}`
    }

    const img =
      char.img?.[
        Math.floor(Math.random() * char.img.length)
      ]

    const caption =
`${title('FICHA')}

${buildCharCard(char, ownerName)}`

    if (img) {
      try {
        return await conn.sendMessage(
          m.chat,
          {
            image: { url: img },
            caption
          },
          { quoted: m }
        )
      } catch {}
    }

    return m.reply(caption)
  }

  // ━━━━━━━━━━━━━━━ BUSCAR ━━━━━━━━━━━━━━━

  if ([
    'buscar',
    'search',
    'findchar'
  ].includes(command)) {

    if (!text) {
      return m.reply(
`${title('USO')}

> ✰ ${usedPrefix}buscar <nombre>`
      )
    }

    const q = text.toLowerCase()

    const results = loadCharacters()
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.source.toLowerCase().includes(q)
      )
      .slice(0, 10)

    if (!results.length) {
      return m.reply(
`${title('SIN RESULTADOS')}

> ✰ No encontré *${text}*.`
      )
    }

    let txt =
`${title('BÚSQUEDA')}

> ✰ 🔎 ${text}
> ✰ 📦 Resultados: *${results.length}*

`

    for (const c of results) {
      const r = getRarityData(c.value)
      const status = c.user
        ? `❌ @${extraerNum(c.user)}`
        : '✅ Libre'

      txt +=
`> ${r.emoji} *#${c.id}* ${c.name} — ${status}\n`
    }

    txt += `\n> ✰ ${usedPrefix}ver <id>`

    return m.reply(txt)
  }

  // ━━━━━━━━━━━━━━━ DONAR ━━━━━━━━━━━━━━━

  if ([
    'donar',
    'regalar',
    'gift'
  ].includes(command)) {

    const id = args[0]
    const target =
      m.quoted?.sender ||
      m.mentionedJid?.[0]

    if (!id || !target) {
      return m.reply(
`${title('USO')}

> ✰ Citá o mencioná al usuario.
> ✰ ${usedPrefix}donar <id>`
      )
    }

    if (extraerNum(target) === senderNum) {
      return m.reply(
`${title('ERROR')}

> ✰ No podés donarte a vos mismo.`
      )
    }

    const chars = loadCharacters()
    const char = chars.find(
      c => String(c.id) === String(id)
    )

    if (!char) {
      return m.reply(
`${title('NO ENCONTRADO')}

> ✰ Personaje inexistente.`
      )
    }

    if (
      !char.user ||
      extraerNum(char.user) !== senderNum
    ) {
      return m.reply(
`${title('NO ES TUYO')}

> ✰ Ese personaje no pertenece a tu colección.`
      )
    }

    const recipientDb = await User.findOne({
      jid: {
        $regex: `^${extraerNum(target)}@`
      }
    })

    if (!recipientDb?.registered) {
      return m.reply(
`${title('USUARIO NO REGISTRADO')}

> ✰ El usuario debe estar registrado.`
      )
    }

    char.user = recipientDb.jid
    char.status = 'Canjeado'

    saveCharacters(chars)

    const r = getRarityData(char.value)

    return conn.sendMessage(
      m.chat,
      {
        text:
`${title('DONACIÓN')}

> ✰ ${r.emoji} *${char.name}*
> ✰ Donado a @${extraerNum(target)}
> ✰ Rareza: *${r.label}*
> ✰ Valor: *${parseInt(char.value).toLocaleString()}*`,
        mentions: [target, sender]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━ SUBASTAR ━━━━━━━━━━━━━━━

  if ([
    'subastar',
    'auction',
    'subasta'
  ].includes(command)) {

    const id = args[0]
    const precio = parseInt(args[1])

    if (
      !id ||
      isNaN(precio) ||
      precio <= 0
    ) {
      return m.reply(
`${title('USO')}

> ✰ ${usedPrefix}subastar <id> <precio>`
      )
    }

    const chars = loadCharacters()

    const char = chars.find(
      c => String(c.id) === String(id)
    )

    if (!char) {
      return m.reply(
`${title('NO ENCONTRADO')}

> ✰ Personaje inexistente.`
      )
    }

    if (
      !char.user ||
      extraerNum(char.user) !== senderNum
    ) {
      return m.reply(
`${title('NO ES TUYO')}

> ✰ Ese personaje no es tuyo.`
      )
    }

    const existing =
      [...auctionSessions.values()]
        .find(a => String(a.charId) === String(id))

    if (existing) {
      return m.reply(
`${title('YA EN SUBASTA')}

> ✰ Ese personaje ya está siendo subastado.`
      )
    }

    const endTs = now + AUCTION_TTL

    auctionSessions.set(id, {
      charId: id,
      seller: sender,
      chat: m.chat,
      basePrice: precio,
      currentBid: precio,
      topBidder: null,
      endTs,
      ts: now
    })

    const img = char.img?.[0]

    const caption =
`${title('SUBASTA')}

${buildCharCard(char)}

> ✰ 💰 Base: *${precio.toLocaleString()} ${config.CURRENCY_NAME}*
> ✰ ⏳ Duración: *5m*
> ✰ 📢 ${usedPrefix}pujar ${id} <monto>`

    if (img) {
      try {
        await conn.sendMessage(
          m.chat,
          {
            image: { url: img },
            caption
          },
          { quoted: m }
        )
      } catch {
        await m.reply(caption)
      }
    } else {
      await m.reply(caption)
    }

    setTimeout(async () => {

      const sess = auctionSessions.get(id)

      if (!sess) return

      auctionSessions.delete(id)

      if (!sess.topBidder) {
        return conn.sendMessage(
          sess.chat,
          {
            text:
`${title('SUBASTA FINALIZADA')}

> ✰ *${char.name}* no recibió ofertas.
> ✰ El personaje sigue con su dueño.`
          }
        ).catch(() => {})
      }

      char.user = sess.topBidder
      char.status = 'Canjeado'

      const updated = loadCharacters()
        .map(c =>
          String(c.id) === String(id)
            ? char
            : c
        )

      saveCharacters(updated)

      const sellerDb = await User.findOne({
        jid: {
          $regex: `^${extraerNum(sess.seller)}@`
        }
      })

      if (sellerDb) {
        const { net } =
          getNetSell(sess.currentBid)

        await User.updateOne(
          { jid: sellerDb.jid },
          { $inc: { genosCoins: net } }
        )
      }

      const { net } =
        getNetSell(sess.currentBid)

      conn.sendMessage(
        sess.chat,
        {
          text:
`${title('SUBASTA TERMINADA')}

> ✰ 🃏 ${char.name}
> ✰ 🥇 Ganador: @${extraerNum(sess.topBidder)}
> ✰ 💰 Oferta: *${sess.currentBid.toLocaleString()}*
> ✰ 💵 Vendedor: *${net.toLocaleString()} ${config.CURRENCY_NAME}*`,
          mentions: [
            sess.topBidder,
            sess.seller
          ]
        }
      ).catch(() => {})

    }, AUCTION_TTL)

    return
  }

  // ━━━━━━━━━━━━━━━ PUJAR ━━━━━━━━━━━━━━━

  if ([
    'pujar',
    'bid',
    'ofertar'
  ].includes(command)) {

    const id = args[0]
    const monto = parseInt(args[1])

    if (
      !id ||
      isNaN(monto) ||
      monto <= 0
    ) {
      return m.reply(
`${title('USO')}

> ✰ ${usedPrefix}pujar <id> <monto>`
      )
    }

    const sess = auctionSessions.get(id)

    if (!sess) {
      return m.reply(
`${title('SIN SUBASTA')}

> ✰ No hay una subasta activa para *#${id}*.`
      )
    }

    if (
      extraerNum(sess.seller) === senderNum
    ) {
      return m.reply(
`${title('ERROR')}

> ✰ No podés pujar en tu propia subasta.`
      )
    }

    if (monto <= sess.currentBid) {
      return m.reply(
`${title('OFERTA BAJA')}

> ✰ Actual: *${sess.currentBid.toLocaleString()}*
> ✰ Tu oferta debe ser mayor.`
      )
    }

    if (
      (userDb.genosCoins || 0) < monto
    ) {
      return m.reply(
`${title('SIN FONDOS')}

> ✰ Tenés: *${(userDb.genosCoins || 0).toLocaleString()}*
> ✰ Necesitás: *${monto.toLocaleString()}*`
      )
    }

    const left = sess.endTs - now

    if (left <= 0) {
      return m.reply(
`${title('FINALIZADA')}

> ✰ La subasta ya terminó.`
      )
    }

    // Devuelve la oferta anterior
    if (
      sess.topBidder &&
      extraerNum(sess.topBidder) !== senderNum
    ) {

      const prevDb = await User.findOne({
        jid: {
          $regex:
            `^${extraerNum(sess.topBidder)}@`
        }
      })

      if (prevDb) {
        await User.updateOne(
          { jid: prevDb.jid },
          {
            $inc: {
              genosCoins: sess.currentBid
            }
          }
        )
      }
    }

    await User.updateOne(
      { jid: userDb.jid },
      {
        $inc: {
          genosCoins: -monto
        }
      }
    )

    userDb.genosCoins -= monto

    await syncUserDb(userDb)

    sess.currentBid = monto
    sess.topBidder = sender

    const char = getCharById(id)

    return conn.sendMessage(
      m.chat,
      {
        text:
`${title('NUEVA OFERTA')}

> ✰ 🃏 ${char?.name || `#${id}`}
> ✰ 💰 Oferta: *${monto.toLocaleString()} ${config.CURRENCY_NAME}*
> ✰ 👤 @${senderNum}
> ✰ ⏳ ${fmtTime(left)}`,
        mentions: [sender]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━ SUBASTAS ━━━━━━━━━━━━━━━

  if ([
    'subastas',
    'auctions',
    'versubastas'
  ].includes(command)) {

    if (!auctionSessions.size) {
      return m.reply(
`${title('SIN SUBASTAS')}

> ✰ No hay subastas activas.
> ✰ Usá *${usedPrefix}subastar <id> <precio>*.`
      )
    }

    let txt = `${title('SUBASTAS')}\n\n`

    for (const [id, sess] of auctionSessions) {

      const char = getCharById(id)

      const r = char
        ? getRarityData(char.value)
        : { emoji: '❓' }

      txt +=
`> ${r.emoji} *#${id}* ${char?.name || '???'}
> ✰ 💰 ${sess.currentBid.toLocaleString()}
> ✰ ⏳ ${fmtTime(sess.endTs - now)}
> ✰ ${usedPrefix}pujar ${id} <monto>

`
    }

    return m.reply(txt.trim())
  }

  // ━━━━━━━━━━━━━━━ TOP CARTAS ━━━━━━━━━━━━━━━

  if ([
    'topcartas',
    'rankcartas',
    'rankgacha'
  ].includes(command)) {

    const chars = loadCharacters()
    const counts = {}

    for (const c of chars) {

      if (!c.user) continue

      const num = extraerNum(c.user)

      if (!counts[num]) {
        counts[num] = {
          count: 0,
          value: 0
        }
      }

      counts[num].count++
      counts[num].value += parseInt(c.value)
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 10)

    if (!sorted.length) {
      return m.reply(
`${title('TOP CARTAS')}

> ✰ Nadie tiene personajes todavía.`
      )
    }

    const medals = ['🥇', '🥈', '🥉']

    let txt = `${title('TOP COLECCIONISTAS')}\n\n`

    sorted.forEach(([num, data], i) => {

      const medal =
        medals[i] || `${i + 1}.`

      txt +=
`> ${medal} +${num}
> ✰ ${data.count} cartas · ${data.value.toLocaleString()} ${config.CURRENCY_NAME}

`
    })

    return m.reply(txt.trim())
  }

  // ━━━━━━━━━━━━━━━ STATS ━━━━━━━━━━━━━━━

  if ([
    'gachastats',
    'misestadisticas'
  ].includes(command)) {

    const owned = getCharsByOwner(sender)

    const totalVal = owned.reduce(
      (s, c) => s + parseInt(c.value),
      0
    )

    const byRarity = {
      'LEGENDARIO': 0,
      'ÉPICO': 0,
      'RARO': 0,
      'POCO COMÚN': 0,
      'COMÚN': 0
    }

    for (const c of owned) {

      const r = getRarityData(c.value)

      byRarity[r.label] =
        (byRarity[r.label] || 0) + 1
    }

    const sess = gachaSessions.get(
      gachaSessionKey(m.chat, sender)
    )

    const active = sess
      ? `⚡ #${sess.charId} · ${fmtTime(
          GACHA_TTL - (now - sess.ts)
        )}`
      : '— Ninguna'

    return m.reply(
`${title('MIS STATS')}

> ✰ 👤 @${senderNum}
> ✰ 🃏 Cartas: *${owned.length}*
> ✰ 💰 Valor: *${totalVal.toLocaleString()} ${config.CURRENCY_NAME}*

༺ ✰ RAREZA ✰ ༻

> ✰ 🌌 Legendario: ${byRarity['LEGENDARIO']}
> ✰ 💜 Épico: ${byRarity['ÉPICO']}
> ✰ 💙 Raro: ${byRarity['RARO']}
> ✰ 💚 Poco común: ${byRarity['POCO COMÚN']}
> ✰ ⬜ Común: ${byRarity['COMÚN']}

༺ ✰ INVOCACIÓN ✰ ༻

> ✰ ${active}`
    )
  }
}

handler.help = [
  'gacha',
  'canjear <id>',
  'vender <id>',
  'collection',
  'ver <id>',
  'buscar <nombre>',
  'donar <id>',
  'subastar <id> <precio>',
  'pujar <id> <monto>',
  'subastas',
  'topcartas',
  'gachastats'
]

handler.tags = ['rpg']

handler.command = [
  'gacha',
  'invocar',
  'pull',
  'rw',
  'rollwaifu',

  'canjear',
  'claim',
  'reclamar',

  'vender',
  'sell',

  'collection',
  'miscartas',
  'cartas',
  'mispersonajes',

  'ver',
  'info',
  'carta',

  'buscar',
  'search',
  'findchar',

  'donar',
  'regalar',
  'gift',

  'subastar',
  'auction',
  'subasta',

  'pujar',
  'bid',
  'ofertar',

  'subastas',
  'auctions',
  'versubastas',

  'topcartas',
  'rankcartas',
  'rankgacha',

  'gachastats',
  'misestadisticas'
]

handler.register = true

export default handler