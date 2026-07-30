import {
  traducir,
  obtenerCodigoIdioma,
  IDIOMAS
} from '../../lib/traductor.js'

const handler = async (m, { conn, text }) => {

  // ─────────────────────────────
  // SIN TEXTO
  // ─────────────────────────────

  if (!text?.trim()) {
    return m.reply(
      `*⌬┤ 🌎 ├⌬ TRADUCTOR.*\n\n` +
      `> Traduce cualquier mensaje a otro idioma.\n\n` +
      `*Uso:*\n` +
      `> #traducir en Hola mundo\n` +
      `> #traductor fr Hola mundo\n` +
      `> #translate japonés Hola mundo\n\n` +
      `*También puedes responder a un mensaje:*\n` +
      `> #traducir en\n\n` +
      `*Idiomas disponibles:*\n` +
      `> #idiomas`
    )
  }

  // ─────────────────────────────
  // SEPARAR IDIOMA Y TEXTO
  // ─────────────────────────────

  const partes = text.trim().split(/\s+/)

  const idiomaEntrada = partes.shift()

  const idioma = obtenerCodigoIdioma(idiomaEntrada)

  if (!idioma) {
    return m.reply(
      `*⌬┤ ❌ ├⌬ IDIOMA NO VÁLIDO.*\n\n` +
      `> Idioma recibido: *${idiomaEntrada}*\n\n` +
      `> Usa *#idiomas* para ver todos los idiomas disponibles.`
    )
  }

  // ─────────────────────────────
  // TEXTO ESCRITO
  // ─────────────────────────────

  let textoTraducir = partes.join(' ').trim()

  // ─────────────────────────────
  // TEXTO DEL MENSAJE RESPONDIDO
  // ─────────────────────────────

  if (!textoTraducir && m.quoted) {
  const q = m.quoted

  textoTraducir =
    q.text ||
    q.caption ||
    q.msg?.text ||
    q.msg?.caption ||
    q.msg?.conversation ||
    q.message?.conversation ||
    q.message?.extendedTextMessage?.text ||
    q.message?.imageMessage?.caption ||
    q.message?.videoMessage?.caption ||
    q.message?.documentMessage?.caption ||
    ''
}

  if (!textoTraducir) {
    return m.reply(
      `*⌬┤ ❌ ├⌬ SIN TEXTO.*\n\n` +
      `> Escribe el texto después del idioma.\n\n` +
      `*Ejemplo:*\n` +
      `> #traducir en Hola amigo\n\n` +
      `O responde a un mensaje con:\n` +
      `> #traducir en`
    )
  }

  // ─────────────────────────────
  // TRADUCIENDO
  // ─────────────────────────────

  await m.reply(
    `*⌬┤ ⏳ ├⌬ TRADUCIENDO...*\n` +
    `> 🌎 Idioma: *${IDIOMAS[idioma]}*`
  )

  try {

    const resultado = await traducir(
      textoTraducir,
      idioma
    )

    // ───────────────────────────
    // RESPUESTA
    // ───────────────────────────

    const respuesta =
      `*⌬┤ 🌎 ├⌬ TRADUCCIÓN.*\n\n` +
      `> 📝 *Original:*\n` +
      `> ${textoTraducir}\n\n` +
      `> 🌐 *Idioma:* ${resultado.idioma}\n` +
      `> 🔤 *Código:* ${resultado.codigo}\n\n` +
      `> 💬 *Traducción:*\n` +
      `> ${resultado.texto}`

    return m.reply(respuesta)

  } catch (e) {

    console.error(
      '[TRADUCTOR]',
      e
    )

    if (e.message === 'RESPUESTA_INVALIDA') {
      return m.reply(
        `*⌬┤ ❌ ├⌬ ERROR DE API.*\n\n` +
        `> La API no devolvió una traducción válida.`
      )
    }

    return m.reply(
      `*⌬┤ ❌ ├⌬ ERROR.*\n\n` +
      `> No se pudo traducir el mensaje.\n` +
      `> Intenta nuevamente en unos segundos.`
    )
  }
}

// ─────────────────────────────
// CONFIGURACIÓN DEL PLUGIN
// ─────────────────────────────

handler.help = [
  'traducir <idioma> <texto>',
  'traductor <idioma> <texto>',
  'translate <idioma> <texto>'
]

handler.command = [
  'traducir',
  'traductor',
  'translate',
  'traduce',
  'trad'
]

handler.tags = [
  'convertidores'
]

export default handler