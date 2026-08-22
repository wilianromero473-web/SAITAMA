import {
  traducir,
  obtenerCodigoIdioma,
  IDIOMAS
} from '../../lib/traductor.js'


// ═════════════════════════════════════
// ✦ SAITAMABOT • TRADUCTOR
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✦ HANDLER PRINCIPAL
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    text
  }
) => {

  try {

    // ═══════════════════════════════
    // ✦ SIN TEXTO
    // ═══════════════════════════════

    if (!text?.trim()) {

      return m.reply(
`༺ ✦ 𝚃𝚁𝙰𝙳𝚄𝙲𝚃𝙾𝚁 ✦ ༻

> ✦ Traduce cualquier mensaje a otro idioma.

༺ ✦ 𝚄𝚂𝙾 ✦ ༻

> ✦ #traducir en Hola mundo
> ✦ #traductor fr Hola mundo
> ✦ #translate japonés Hola mundo

༺ ✦ 𝚃𝚁𝙰𝙳𝚄𝙲𝙸𝚁 𝚄𝙽 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 ✦ ༻

> ✦ Responde al mensaje que quieras traducir.
> ✦ #traducir en

༺ ✦ 𝙸𝙳𝙸𝙾𝙼𝙰𝚂 ✦ ༻

> ✦ Usa #idiomas para ver todos los idiomas disponibles.`
      )

    }


    // ═══════════════════════════════
    // ✦ SEPARAR IDIOMA Y TEXTO
    // ═══════════════════════════════

    const partes =
      text
        .trim()
        .split(/\s+/)


    const idiomaEntrada =
      partes.shift()


    const idioma =
      obtenerCodigoIdioma(
        idiomaEntrada
      )


    // ═══════════════════════════════
    // ✦ IDIOMA NO VÁLIDO
    // ═══════════════════════════════

    if (!idioma) {

      return m.reply(
`༺ ✦ 𝙸𝙳𝙸𝙾𝙼𝙰 𝙽𝙾 𝚅Á𝙻𝙸𝙳𝙾 ✦ ༻

> ✦ Idioma recibido:
> *${idiomaEntrada}*

> ✦ Usa *#idiomas* para consultar todos los idiomas disponibles.`
      )

    }


    // ═══════════════════════════════
    // ✦ TEXTO ESCRITO
    // ═══════════════════════════════

    let textoTraducir =
      partes
        .join(' ')
        .trim()


    // ═══════════════════════════════
    // ✦ TEXTO DEL MENSAJE RESPONDIDO
    // ═══════════════════════════════

    if (
      !textoTraducir &&
      m.quoted
    ) {

      const q =
        m.quoted

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


    // ═══════════════════════════════
    // ✦ SIN TEXTO
    // ═══════════════════════════════

    if (!textoTraducir) {

      return m.reply(
`༺ ✦ 𝚂𝙸𝙽 𝚃𝙴𝚇𝚃𝙾 ✦ ༻

> ✦ Escribe el texto después del idioma.

༺ ✦ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✦ ༻

> ✦ #traducir en Hola amigo

༺ ✦ 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙸𝙳𝙾 ✦ ༻

> ✦ También puedes responder a un mensaje con:
> ✦ #traducir en`
      )

    }


    // ═══════════════════════════════
    // ✦ TRADUCIENDO
    // ═══════════════════════════════

    await m.reply(
`༺ ✦ 𝚃𝚁𝙰𝙳𝚄𝙲𝙸𝙴𝙽𝙳𝙾 ✦ ༻

> ✦ Idioma:
> *${IDIOMAS[idioma]}*

> ✦ Código:
> *${idioma}*`
    )


    // ═══════════════════════════════
    // ✦ PROCESAR TRADUCCIÓN
    // ═══════════════════════════════

    const resultado =
      await traducir(
        textoTraducir,
        idioma
      )


    // ═══════════════════════════════
    // ✦ RESPUESTA
    // ═══════════════════════════════

    const respuesta =
`༺ ✦ 𝚃𝚁𝙰𝙳𝚄𝙲𝙲𝙸Ó𝙽 ✦ ༻

༺ ✦ 𝙾𝚁𝙸𝙶𝙸𝙽𝙰𝙻 ✦ ༻
> ✦ ${textoTraducir}
༺ ✦ 𝙸𝙳𝙸𝙾𝙼𝙰 ✦ ༻

> ✦ ${resultado.idioma}
> ✦ Código: *${resultado.codigo}*
༺ ✦ 𝚃𝚁𝙰𝙳𝚄𝙲𝙲𝙸Ó𝙽 ✦ ༻
> ✦ ${resultado.texto}

༺ ✦ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✦ ༻`

    return m.reply(
      respuesta
    )


  } catch (e) {

    console.error(
      '[TRADUCTOR]',
      e
    )


    // ═══════════════════════════════
    // ✦ ERROR DE API
    // ═══════════════════════════════

    if (
      e.message ===
      'RESPUESTA_INVALIDA'
    ) {

      return m.reply(
`༺ ✦ 𝙴𝚁𝚁𝙾𝚁 𝙳𝙴 𝙰𝙿𝙸 ✦ ༻

> ✦ La API no devolvió una traducción válida.
> ✦ Intenta nuevamente en unos segundos.`
      )

    }


    // ═══════════════════════════════
    // ✦ ERROR GENERAL
    // ═══════════════════════════════

    return m.reply(
`༺ ✦ 𝙴𝚁𝚁𝙾𝚁 ✦ ༻

> ✦ No se pudo traducir el mensaje.
> ✦ Intenta nuevamente en unos segundos.`
    )

  }

}


// ═════════════════════════════════════
// ✦ CONFIGURACIÓN
// ═════════════════════════════════════

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