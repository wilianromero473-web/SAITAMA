import axios from 'axios'

const DEFAULT_PIC_1 = 'https://cdn.popcat.xyz/avatar.png'
const DEFAULT_PIC_2 = 'https://cdn.popcat.xyz/popcat.png'

const rnd = arr => arr[Math.floor(Math.random() * arr.length)]

const COMPAT = [
  { min: 90, texto: '¡Alma gemela confirmada! 💍' },
  { min: 75, texto: 'Alta química... ¡casi explosiva! 🔥' },
  { min: 60, texto: 'Hay potencial, falta la última chispa 😏' },
  { min: 45, texto: 'Algo hay ahí... pero muy escondido 🤔' },
  { min: 30, texto: 'Amigos con derechos... o solo amigos 😅' },
  { min: 10, texto: 'Muy poco amor por acá 💨' },
  { min: 0, texto: 'Mejor como amigos... o ni eso 😂' }
]

const LOADING = [
  '💭 Buscando almas gemelas en el grupo...',
  '🔮 Consultando al universo...',
  '❤️ Cupido está trabajando...',
  '⏳ Analizando compatibilidades...',
  '✨ Activando modo shippeo...',
  '😏 Buscando la pareja perfecta...',
  '💔 Preparando corazones rotos por si sale 0%...',
  '🌹 Calculando vibraciones del grupo...',
  '🎯 El algoritmo del amor está trabajando...',
  '🪄 Agitando la varita del shippeo...'
]

const FRASES = [
  `💞 *¡PAREJA DEL DÍA DETECTADA!* 💞
༻ @\u007buser1\u007d ❤️ @\u007buser2\u007d
༻ Compatibilidad: *\u007bp\u007d%*
༻ \u007bcompat\u007d

> Se aman en secreto... o no tanto 🤫`,

  `❤️ *EL ALGORITMO DEL AMOR HABLÓ* ❤️
༻ @\u007buser1\u007d + @\u007buser2\u007d
༻ Amor: *\u007bp\u007d%*
༻ \u007bcompat\u007d

> El grupo espera el chisme 👀`,

  `✨ *SHIPPEO OFICIAL DEL GRUPO* ✨
༻ @\u007buser1\u007d ❤️ @\u007buser2\u007d
༻ Compatibilidad: *\u007bp\u007d%*
༻ \u007bcompat\u007d

> Cupido ya está celebrando 🎉`,

  `😍 *¡MATCH DEL DÍA!* 😍
༻ @\u007buser1\u007d + @\u007buser2\u007d
༻ Química: *\u007bp\u007d%*
༻ \u007bcompat\u007d

> ¿Quién confiesa primero? 👀`,

  `💞 *RESULTADO DEL SHIPPEO* 💞
༻ @\u007buser1\u007d ❤️ @\u007buser2\u007d
༻ Nivel: *\u007bp\u007d%*
༻ \u007bcompat\u007d

> El grupo ya está shippeando 😏`,

  `🌹 *EL UNIVERSO LOS JUNTÓ* 🌹
༻ @\u007buser1\u007d 💕 @\u007buser2\u007d
༻ Compatibilidad cósmica: *\u007bp\u007d%*
༻ \u007bcompat\u007d

> Nadie puede luchar contra el destino ✨`,

  `🎯 *MATCH DEL DÍA* 🎯
༻ @\u007buser1\u007d 🤝 @\u007buser2\u007d
༻ Posibilidad de match: *\u007bp\u007d%*
༻ \u007bcompat\u007d

> El grupo ya lo sabe 👀`
]

const SHIP_TEXT = [
  'En el amor',
  'Almas gemelas',
  'Para siempre',
  'Inevitable',
  'Shippeo oficial',
  'Destino',
  'Cupido dijo sí',
  'No hay escape',
  'El grupo sabe'
]

function getCompat(porcentaje) {
  return (
    COMPAT.find(c => porcentaje >= c.min) ||
    COMPAT[COMPAT.length - 1]
  ).texto
}

async function obtenerFoto(conn, jid, fallback) {
  try {
    const url = await conn.profilePictureUrl(jid, 'image')
    return url || fallback
  } catch {
    return fallback
  }
}

async function obtenerShipPopcat(pic1, pic2) {
  try {
    const url =
      `https://api.popcat.xyz/v2/ship` +
      `?user1=${encodeURIComponent(pic1)}` +
      `&user2=${encodeURIComponent(pic2)}`

    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000
    })

    if (res.status !== 200) return null

    const imageBuffer = Buffer.from(res.data)

    let porcentaje = parseInt(
      res.headers['ship-percentage'] ||
      res.headers['shippercentage'] ||
      ''
    )

    if (isNaN(porcentaje)) {
      porcentaje = Math.floor(Math.random() * 101)
    }

    return {
      imageBuffer,
      porcentaje
    }
  } catch {
    return null
  }
}

async function obtenerShipDelirius(
  pic1,
  name1,
  pic2,
  name2
) {
  const porcentaje = Math.floor(Math.random() * 101)

  const url =
    `https://api.delirius.store/canvas/ship` +
    `?image1=${encodeURIComponent(pic1)}` +
    `&name1=${encodeURIComponent(name1)}` +
    `&image2=${encodeURIComponent(pic2)}` +
    `&name2=${encodeURIComponent(name2)}` +
    `&percentage=${porcentaje}` +
    `&text=${encodeURIComponent(rnd(SHIP_TEXT))}`

  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 10000
  })

  if (res.status !== 200) {
    throw new Error('No se pudo generar la imagen')
  }

  return {
    imageBuffer: Buffer.from(res.data),
    porcentaje
  }
}

const handler = async (m, ctx) => {
  const { conn, groupMetadata } = ctx

  if (!groupMetadata?.participants?.length) {
    return m.reply(
      `✰ 𝙴𝚛𝚛𝚘𝚛\n` +
      `༻ No pude obtener los miembros del grupo.`
    )
  }

  const botJid = conn.user?.jid

  const participantes = groupMetadata.participants
    .filter(p => {
      if (!p?.id) return false
      if (p.id.includes('broadcast')) return false
      if (p.id === botJid) return false
      return true
    })
    .map(p => p.id)

  if (participantes.length < 2) {
    return m.reply(
      `✰ 𝙿𝚊𝚛𝚎𝚓𝚊𝚜\n` +
      `༻ No hay suficientes miembros para formar una pareja.`
    )
  }

  let loadingMsg

  try {
    loadingMsg = await conn.sendMessage(
      m.chat,
      {
        text:
          `✰ 𝙿𝚊𝚛𝚎𝚓𝚊𝚜\n` +
          `༻ ${rnd(LOADING)}`
      },
      { quoted: m }
    )

    const shuffled = [...participantes].sort(
      () => Math.random() - 0.5
    )

    const jid1 = shuffled[0]
    const jid2 = shuffled[1]

    const name1 = jid1.split('@')[0]
    const name2 = jid2.split('@')[0]

    const pic1 = await obtenerFoto(
      conn,
      jid1,
      DEFAULT_PIC_1
    )

    const pic2 = await obtenerFoto(
      conn,
      jid2,
      DEFAULT_PIC_2
    )

    let resultado = await obtenerShipPopcat(
      pic1,
      pic2
    )

    if (!resultado) {
      resultado = await obtenerShipDelirius(
        pic1,
        name1,
        pic2,
        name2
      )
    }

    const porcentaje = Math.max(
      0,
      Math.min(100, Number(resultado.porcentaje) || 0)
    )

    const compat = getCompat(porcentaje)

    const caption = rnd(FRASES)
      .replace(/\{user1\}/g, name1)
      .replace(/\{user2\}/g, name2)
      .replace(/\{p\}/g, String(porcentaje))
      .replace(/\{compat\}/g, compat)

    await conn.sendMessage(
      m.chat,
      {
        image: resultado.imageBuffer,
        caption,
        mentions: [jid1, jid2]
      },
      { quoted: m }
    )

    if (loadingMsg?.key) {
      await conn.sendMessage(m.chat, {
        delete: loadingMsg.key
      }).catch(() => {})
    }

  } catch (error) {

    if (loadingMsg?.key) {
      await conn.sendMessage(m.chat, {
        delete: loadingMsg.key
      }).catch(() => {})
    }

    return m.reply(
      `✰ 𝙴𝚛𝚛𝚘𝚛\n` +
      `༻ Ocurrió un error al generar la pareja.\n` +
      `༻ Intentá nuevamente en unos segundos.`
    )
  }
}

handler.help = [
  'parejas',
  'formarparejas',
  'ship'
]

handler.tags = ['fun']

handler.command = [
  'parejas',
  'formarparejas',
  'ship'
]

handler.group = true

export default handler