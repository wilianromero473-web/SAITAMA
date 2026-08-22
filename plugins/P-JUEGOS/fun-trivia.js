import { CATEGORIAS, getPorCategoria } from '../../lib/games/trivia-preguntas.js'
import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const TRIVIA_IMG = 'https://i.postimg.cc/brY2rw0D/1785102624702-3.jpg'

const partidas = new Map()

const TIEMPO_MAX = 30_000
const PREMIO_POR_ACIERTO = 60

const BONUS_RACHA = [
  0, 0, 0, 30, 70, 120,
  200, 300, 450, 650, 900
]

const CATS_LIST = Object.keys(CATEGORIAS)

const MEDIAS = {
  titulo: '𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻',
  usa: '✰ 𝚄𝚜𝚊'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FUNCIONES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getNombreCat(cat) {
  const info = CATEGORIAS[cat]

  if (!info) return cat

  return `${info.emoji} ${info.nombre.es}`
}

function preguntaAleatoriaCat(cat, usadas = new Set()) {
  const pool = getPorCategoria(cat)

  if (!Array.isArray(pool) || !pool.length) return null

  const disponibles = pool
    .map((_, i) => i)
    .filter(i => !usadas.has(i))

  if (!disponibles.length) return null

  const i = disponibles[
    Math.floor(Math.random() * disponibles.length)
  ]

  usadas.add(i)

  return {
    idx: i,
    item: pool[i]
  }
}

function premioPorRacha(racha) {
  const indice = Math.min(
    Math.max(racha, 0),
    BONUS_RACHA.length - 1
  )

  return PREMIO_POR_ACIERTO + BONUS_RACHA[indice]
}

function generarOpciones(pregunta) {
  if (!pregunta?.opciones) return ''

  return pregunta.opciones
    .map(o => `> ${o}`)
    .join('\n')
}

function getRachaEmoji(racha) {
  if (racha >= 5) return '🔥'
  if (racha >= 3) return '⚡'
  return '✨'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEXTO DE LA PARTIDA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function buildTextoPartida(p, preguntaObj) {
  const S = config.CURRENCY_SYMBOL

  const siguientePremio = premioPorRacha(
    p.racha + 1
  )

  const rachEmoji = getRachaEmoji(p.racha)

  const catNombre = getNombreCat(p.cat)

  return `${MEDIAS.titulo}

✰ 𝚃𝚁𝙸𝚅𝙸𝙰 ${CATEGORIAS[p.cat]?.emoji || '🧠'} ${catNombre}
✰ 𝚁𝚊𝚌𝚑𝚊 ${rachEmoji} ${p.racha}

_${preguntaObj.pregunta}_

${generarOpciones(preguntaObj)}

✰ 𝙰𝚌𝚞𝚖𝚞𝚕𝚊𝚍𝚘: *${p.acumulado} ${S}*
✰ 𝙴𝚜𝚝𝚊 𝚟𝚊𝚕𝚎: *+${siguientePremio} ${S}*
✰ 𝚃𝚒𝚎𝚖𝚙𝚘: *30 segundos*

${MEDIAS.usa}
> 𝚁𝚎𝚜𝚙𝚘𝚗𝚍é *a, b, c* o *d* sin prefijo.
> *!cobrar* para cobrar.
> *!tvstats* para ver tus estadísticas.`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIMER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function iniciarTimer(conn, chatId, idx, item, jugador) {
  return setTimeout(async () => {
    try {
      if (!partidas.has(chatId)) return

      const p = partidas.get(chatId)

      if (!p) return
      if (p.jugador !== jugador) return
      if (p.idxActual !== idx) return

      partidas.delete(chatId)

      await User.updateOne(
        { jid: jugador },
        {
          $inc: {
            tvLosses: 1,
            tvLost: p.acumulado
          }
        }
      )

      const correcta = String(item.respuesta || '')
        .trim()
        .toUpperCase()

      const opCorrecta =
        item.opciones?.find(o =>
          String(o)
            .toUpperCase()
            .startsWith(correcta)
        ) || correcta

      let texto = `${MEDIAS.titulo}

✰ ⏱️ 𝚃𝙸𝙴𝙼𝙿𝙾 𝙰𝙶𝙾𝚃𝙰𝙳𝙾

✰ 𝙻𝚊 𝚛𝚎𝚜𝚙𝚞𝚎𝚜𝚝𝚊 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊 𝚎𝚛𝚊:
> *${opCorrecta}*`

      if (p.acumulado > 0) {
        texto += `

✰ 𝙿𝚎𝚛𝚍𝚒𝚜𝚝𝚎:
> *${p.acumulado} ${config.CURRENCY_SYMBOL}* acumulados`
      }

      await conn.sendMessage(chatId, {
        text: texto,
        mentions: [jugador]
      })
    } catch {}
  }, TIEMPO_MAX)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HANDLER PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const handler = async (m, ctx) => {
  const {
    conn,
    command,
    args,
    userDb
  } = ctx

  const chatId = m.chat
  const sender = m.sender
  const S = config.CURRENCY_SYMBOL

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRIVIA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (command === 'trivia' || command === 'tv') {

    if (partidas.has(chatId)) {
      const p = partidas.get(chatId)

      return conn.sendMessage(
        chatId,
        {
          text: `${MEDIAS.titulo}

✰ ⚠️ 𝚃𝚁𝙸𝚅𝙸𝙰 𝙰𝙲𝚃𝙸𝚅𝙰

> Ya hay una trivia en curso.

${buildTextoPartida(
  p,
  p.preguntaActual
)}`,
          mentions: [p.jugador]
        },
        { quoted: m }
      )
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // REGISTRO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (!userDb?.registered) {
      return m.reply(`${MEDIAS.titulo}

✰ ⚠️ 𝙽𝙾 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙰𝙳𝙾

> Necesitás estar registrado para jugar trivia.`)
    }

    const arg = String(
      args?.[0] || ''
    ).toLowerCase().trim()

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LISTA DE CATEGORÍAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (!arg) {
      const catLines = CATS_LIST
        .map((cat, i) =>
          `> ${CATEGORIAS[cat].emoji} *${i + 1}.* ${CATEGORIAS[cat].nombre.es}`
        )
        .join('\n')

      return conn.sendMessage(
        chatId,
        {
          image: {
            url: TRIVIA_IMG
          },

          caption: `${MEDIAS.titulo}

✰ 🧠 𝚃𝚁𝙸𝚅𝙸𝙰
✰ 𝙴𝙻𝙴𝙶𝙸́ 𝚄𝙽𝙰 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝙸́𝙰

${catLines}

${MEDIAS.usa}
> *!trivia <número>*
> Ejemplo: *!trivia 1*`,

          mentions: [sender]
        },
        { quoted: m }
      )
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BUSCAR CATEGORÍA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    let catKey = null

    const numArg = parseInt(arg)

    if (
      !isNaN(numArg) &&
      numArg >= 1 &&
      numArg <= CATS_LIST.length
    ) {
      catKey = CATS_LIST[numArg - 1]
    } else {
      catKey = CATS_LIST.find(k => {
        const nombre =
          CATEGORIAS[k]?.nombre?.es
            ?.toLowerCase() || ''

        return (
          k.toLowerCase().startsWith(arg) ||
          nombre.startsWith(arg)
        )
      }) || null
    }

    if (!catKey) {
      return m.reply(`${MEDIAS.titulo}

✰ ❌ 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝙸́𝙰 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙰

> Usá *!trivia* para ver las categorías disponibles.`)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CREAR PARTIDA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const p = {
      jugador: sender,
      cat: catKey,

      racha: 0,
      acumulado: 0,

      usadas: new Set(),

      preguntaActual: null,
      idxActual: -1,

      timer: null
    }

    const result = preguntaAleatoriaCat(
      catKey,
      p.usadas
    )

    if (!result) {
      return m.reply(`${MEDIAS.titulo}

✰ ❌ 𝙴𝚁𝚁𝙾𝚁

> No hay preguntas disponibles en esta categoría.`)
    }

    p.preguntaActual = result.item
    p.idxActual = result.idx

    partidas.set(chatId, p)

    p.timer = iniciarTimer(
      conn,
      chatId,
      result.idx,
      result.item,
      sender
    )

    return conn.sendMessage(
      chatId,
      {
        image: {
          url: TRIVIA_IMG
        },

        caption: buildTextoPartida(
          p,
          result.item
        ),

        mentions: [sender]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COBRAR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (
    command === 'cobrar' ||
    command === 'claim'
  ) {

    if (!partidas.has(chatId)) {
      return m.reply(`${MEDIAS.titulo}

✰ ⚠️ 𝚂𝙸𝙽 𝚃𝚁𝙸𝚅𝙸𝙰

> No hay ninguna partida activa.`)
    }

    const p = partidas.get(chatId)

    if (p.jugador !== sender) return

    if (p.acumulado <= 0) {
      return m.reply(`${MEDIAS.titulo}

✰ ⚠️ 𝚂𝙸𝙽 𝙰𝙲𝚄𝙼𝚄𝙻𝙰𝙳𝙾

> Respondé al menos una pregunta correctamente primero.`)
    }

    clearTimeout(p.timer)

    partidas.delete(chatId)

    await User.updateOne(
      { jid: sender },
      {
        $inc: {
          tvWins: 1,
          tvEarned: p.acumulado,
          genosCoins: p.acumulado
        }
      }
    )

    return conn.sendMessage(
      chatId,
      {
        text: `${MEDIAS.titulo}

✰ 💰 𝙲𝙾𝙱𝚁𝙰𝙳𝙾

> @${sender.split('@')[0]} cobró:
> *${p.acumulado} ${S}*

✰ 𝚁𝚊𝚌𝚑𝚊 𝚏𝚒𝚗𝚊𝚕:
> *${p.racha}* preguntas seguidas

${MEDIAS.usa}`,
        mentions: [sender]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ESTADÍSTICAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (command === 'tvstats') {

    const jid =
      m.mentionedJid?.[0] ||
      sender

    const u = await User
      .findOne({ jid })
      .lean()

    const wins = u?.tvWins || 0
    const losses = u?.tvLosses || 0
    const maxRacha = u?.tvMaxRacha || 0

    const ganado = u?.tvEarned || 0
    const perdido = u?.tvLost || 0

    const total = wins + losses

    const pct =
      total > 0
        ? ((wins / total) * 100).toFixed(1)
        : '0.0'

    const cs = u?.tvCatStats || {}

    const favCat = Object
      .entries(cs)
      .sort(
        (a, b) =>
          (b[1]?.wins || 0) -
          (a[1]?.wins || 0)
      )[0]

    const favNombre = favCat
      ? getNombreCat(favCat[0])
      : '—'

    return conn.sendMessage(
      chatId,
      {
        text: `${MEDIAS.titulo}

✰ 📊 𝚂𝚃𝙰𝚃𝚂 𝚃𝚁𝙸𝚅𝙸𝙰

> 👤 Jugador: *@${jid.split('@')[0]}*
> 💰 Cobros: *${wins}*
> 💀 Derrotas: *${losses}*
> 📈 Cobro rate: *${pct}%*
> 🏅 Mejor racha: *${maxRacha}*
> 💰 Ganado: *+${ganado} ${S}*
> 💸 Perdido: *-${perdido} ${S}*
> 🎯 Categoría favorita: *${favNombre}*

${MEDIAS.usa}`,
        mentions: [jid]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RANKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (
    command === 'tvranking' ||
    command === 'tvrank'
  ) {

    const todos = await User.find(
      {
        tvMaxRacha: {
          $gt: 0
        }
      },

      {
        jid: 1,
        name: 1,
        tvMaxRacha: 1,
        tvEarned: 1,
        tvWins: 1
      }
    )
      .sort({
        tvMaxRacha: -1,
        tvEarned: -1
      })
      .limit(10)
      .lean()

    if (!todos.length) {
      return m.reply(`${MEDIAS.titulo}

✰ 📋 𝚁𝙰𝙽𝙺𝙸𝙽𝙶 𝚃𝚁𝙸𝚅𝙸𝙰

> Nadie ha jugado todavía.`)
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
        const nombre =
          u.name ||
          u.jid.split('@')[0]

        return `${MEDALS[i]} *${nombre}* — 🏅${u.tvMaxRacha} preguntas │ *+${u.tvEarned || 0} ${S}*`
      })
      .join('\n')

    return conn.sendMessage(
      chatId,
      {
        text: `${MEDIAS.titulo}

✰ 🏆 𝚁𝙰𝙽𝙺𝙸𝙽𝙶 𝙶𝙻𝙾𝙱𝙰𝙻

> _Ordenado por mejor racha_

${lineas}

${MEDIAS.usa}`,
        mentions: todos.map(u => u.jid)
      },
      { quoted: m }
    )
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESPUESTAS AUTOMÁTICAS DE LA TRIVIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.all = async (m, ctx) => {

  const {
    conn
  } = ctx

  const chatId = m.chat
  const sender = m.sender
  const S = config.CURRENCY_SYMBOL

  if (!partidas.has(chatId)) return

  const p = partidas.get(chatId)

  if (!p) return

  if (p.jugador !== sender) return

  const respuesta = String(
    m.body || ''
  )
    .trim()
    .toUpperCase()

  if (
    !['A', 'B', 'C', 'D'].includes(
      respuesta
    )
  ) return

  const correcta = String(
    p.preguntaActual?.respuesta || ''
  )
    .trim()
    .toUpperCase()

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESPUESTA INCORRECTA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (respuesta !== correcta) {

    clearTimeout(p.timer)

    partidas.delete(chatId)

    const incQuery = {
      tvLosses: 1,
      tvLost: p.acumulado
    }

    incQuery[
      `tvCatStats.${p.cat}.losses`
    ] = 1

    await User.updateOne(
      { jid: sender },
      {
        $inc: incQuery
      }
    )

    const opCorrecta =
      p.preguntaActual.opciones.find(o =>
        String(o)
          .toUpperCase()
          .startsWith(correcta)
      ) || correcta

    return conn.sendMessage(
      chatId,
      {
        text: `${MEDIAS.titulo}

✰ ❌ 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾

> La respuesta correcta era:
> *${opCorrecta}*

✰ 💸 𝙿𝚎𝚛𝚍𝚒𝚜𝚝𝚎:
> *${p.acumulado} ${S}* acumulados

✰ 𝚁𝚊𝚌𝚑𝚊 𝚙𝚎𝚛𝚍𝚒𝚍𝚊:
> *${p.racha}*

${MEDIAS.usa}`,
        mentions: [sender]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESPUESTA CORRECTA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  clearTimeout(p.timer)

  const premio = premioPorRacha(
    p.racha + 1
  )

  p.racha++
  p.acumulado += premio

  const incQuery = {}

  incQuery[
    `tvCatStats.${p.cat}.wins`
  ] = 1

  const u = await User
    .findOne({ jid: sender })
    .lean()

  const currentMax =
    u?.tvMaxRacha || 0

  const updateDoc = {
    $inc: incQuery
  }

  if (p.racha > currentMax) {
    updateDoc.$set = {
      tvMaxRacha: p.racha
    }
  }

  await User.updateOne(
    { jid: sender },
    updateDoc
  )

  const opCorrecta =
    p.preguntaActual.opciones.find(o =>
      String(o)
        .toUpperCase()
        .startsWith(correcta)
    ) || correcta

  const emojiTit =
    p.racha >= 5
      ? '🔥'
      : p.racha >= 3
        ? '⚡'
        : '✰'

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SIGUIENTE PREGUNTA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const siguiente =
    preguntaAleatoriaCat(
      p.cat,
      p.usadas
    )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TERMINÓ LA CATEGORÍA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!siguiente) {

    partidas.delete(chatId)

    await User.updateOne(
      { jid: sender },
      {
        $inc: {
          genosCoins: p.acumulado,
          tvWins: 1,
          tvEarned: p.acumulado
        }
      }
    )

    return conn.sendMessage(
      chatId,
      {
        text: `${MEDIAS.titulo}

✰ ${emojiTit} 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾

> *+${premio} ${S}*
> Acumulado: *${p.acumulado} ${S}*
> Racha: *${p.racha}*

✰ 🎉 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝙸́𝙰 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰

> Respondiste todas las preguntas de:
> *${getNombreCat(p.cat)}*

> Se agregaron *${p.acumulado} ${S}* a tu cuenta.

${MEDIAS.usa}
> Iniciá otra con *!trivia*`,
        mentions: [sender]
      },
      { quoted: m }
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACTUALIZAR PARTIDA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  p.preguntaActual = siguiente.item
  p.idxActual = siguiente.idx

  p.timer = iniciarTimer(
    conn,
    chatId,
    siguiente.idx,
    siguiente.item,
    sender
  )

  partidas.set(chatId, p)

  return conn.sendMessage(
    chatId,
    {
      text: `${MEDIAS.titulo}

✰ ${emojiTit} 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾

> Respuesta: *${opCorrecta}*
> *+${premio} ${S}*
> Acumulado: *${p.acumulado} ${S}*
> Racha: *${p.racha}*

✰ 🧠 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 𝙿𝚁𝙴𝙶𝚄𝙽𝚃𝙰

_${siguiente.item.pregunta}_

${generarOpciones(siguiente.item)}

✰ 𝙰𝚌𝚞𝚖𝚞𝚕𝚊𝚍𝚘:
> *${p.acumulado} ${S}*

✰ 𝙴𝚜𝚝𝚊 𝚟𝚊𝚕𝚎:
> *+${premioPorRacha(p.racha + 1)} ${S}*

✰ ⏱️ *30 segundos*

${MEDIAS.usa}
> Respondé *a, b, c* o *d* sin prefijo.
> *!cobrar* para cobrar.`,
      mentions: [sender]
    },
    { quoted: m }
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'trivia [categoría]',
  'cobrar',
  'tvstats',
  'tvranking'
]

handler.tags = [
  'fun',
  'games'
]

handler.command = [
  'trivia',
  'tv',
  'cobrar',
  'claim',
  'tvstats',
  'tvranking',
  'tvrank'
]

export default handler