import {
  getSubBotMeta,
  saveSubBotMeta
} from '../../lib/jadibot.js'


// ═════════════════════════════════════
// ✰ SAITAMABOT • NOMBRE DEL SUB-BOT
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ NORMALIZAR NÚMERO
// ═════════════════════════════════════

function normalizarNumero(numero) {

  let n =
    String(numero || '')
      .replace(/\D/g, '')

  if (n.startsWith('549')) {
    n =
      '54' +
      n.slice(3)
  }

  if (n.startsWith('521')) {
    n =
      '52' +
      n.slice(3)
  }

  return n
}


// ═════════════════════════════════════
// ✰ HANDLER PRINCIPAL
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn: zen,
    args,
    usedPrefix,
    command
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ SOLO SUB-BOTS
    // ═══════════════════════════════

    if (!zen.isSubBot) {

      return m.reply(
`༺ ✰ 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴𝙻 𝚂𝚄𝙱-𝙱𝙾𝚃 ✰ ༻

> ✰ 𝙴𝚜𝚝𝚎 𝚌𝚘𝚖𝚊𝚗𝚍𝚘 𝚜𝚘𝚕𝚘 𝚏𝚞𝚗𝚌𝚒𝚘𝚗𝚊 𝚎𝚗 𝚂𝚞𝚋-𝙱𝚘𝚝𝚜.

> ✰ 𝙲𝚘𝚗é𝚌𝚝𝚊𝚝𝚎 𝚌𝚘𝚖𝚘 𝚂𝚞𝚋-𝙱𝚘𝚝 𝚢 𝚟𝚞𝚎𝚕𝚟𝚎 𝚊 𝚒𝚗𝚝𝚎𝚗𝚝𝚊𝚛𝚕𝚘.`
      )

    }


    // ═══════════════════════════════
    // ✰ IDENTIFICAR USUARIO
    // ═══════════════════════════════

    const senderNumber =
      normalizarNumero(
        m.sender
      )


    const ownerNumber =
      normalizarNumero(
        zen.ownerNumber
      )


    // ═══════════════════════════════
    // ✰ VERIFICAR DUEÑO
    // ═══════════════════════════════

    if (
      senderNumber !==
      ownerNumber
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙿𝙴𝚁𝙼𝙸𝚂𝙾𝚂 ✰ ༻

> ✰ 𝚂𝚘𝚕𝚘 𝚎𝚕 𝚍𝚞𝚎ñ𝚘 𝚍𝚎 𝚎𝚜𝚝𝚎 𝚂𝚞𝚋-𝙱𝚘𝚝 𝚙𝚞𝚎𝚍𝚎 𝚌𝚊𝚖𝚋𝚒𝚊𝚛 𝚜𝚞 𝚗𝚘𝚖𝚋𝚛𝚎.

> ✰ 𝙳𝚞𝚎ñ𝚘: +${zen.ownerNumber}`
      )

    }


    // ═══════════════════════════════
    // ✰ OBTENER NOMBRE
    // ═══════════════════════════════

    const nuevoNombre =
      args
        .join(' ')
        .trim()


    // ═══════════════════════════════
    // ✰ SIN NOMBRE
    // ═══════════════════════════════

    if (!nuevoNombre) {

      return m.reply(
`༺ ✰ 𝙲𝙰𝙼𝙱𝙸𝙰𝚁 𝙽𝙾𝙼𝙱𝚁𝙴 ✰ ༻

> ✰ 𝙴𝚜𝚌𝚛𝚒𝚋𝚎 𝚎𝚕 𝚗𝚞𝚎𝚟𝚘 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝚝𝚞 𝚂𝚞𝚋-𝙱𝚘𝚝.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ *${usedPrefix}${command} SaitamaBot*

> ✰ 𝙼á𝚡𝚒𝚖𝚘: *20 𝚌𝚊𝚛𝚊𝚌𝚝𝚎𝚛𝚎𝚜*`
      )

    }


    // ═══════════════════════════════
    // ✰ VALIDAR LONGITUD
    // ═══════════════════════════════

    if (
      nuevoNombre.length > 20
    ) {

      return m.reply(
`༺ ✰ 𝙽𝙾𝙼𝙱𝚁𝙴 𝙼𝚄𝚈 𝙻𝙰𝚁𝙶𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚝𝚒𝚎𝚗𝚎 *${nuevoNombre.length} 𝚌𝚊𝚛𝚊𝚌𝚝𝚎𝚛𝚎𝚜*.

> ✰ 𝙴𝚕 𝚖á𝚡𝚒𝚖𝚘 𝚙𝚎𝚛𝚖𝚒𝚝𝚒𝚍𝚘 𝚎𝚜 *20 𝚌𝚊𝚛𝚊𝚌𝚝𝚎𝚛𝚎𝚜*.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ *${usedPrefix}${command} SaitamaBot*`
      )

    }


    // ═══════════════════════════════
    // ✰ VALIDAR NOMBRE
    // ═══════════════════════════════

    if (
      !nuevoNombre.replace(/\s/g, '')
    ) {

      return m.reply(
`༺ ✰ 𝙽𝙾𝙼𝙱𝚁𝙴 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾 ✰ ༻

> ✰ 𝙳𝚎𝚋𝚎𝚜 𝚎𝚜𝚌𝚛𝚒𝚋𝚒𝚛 𝚞𝚗 𝚗𝚘𝚖𝚋𝚛𝚎 𝚟á𝚕𝚒𝚍𝚘.`
      )

    }


    // ═══════════════════════════════
    // ✰ ACTUALIZAR SESIÓN
    // ═══════════════════════════════

    zen.botname =
      nuevoNombre


    // ═══════════════════════════════
    // ✰ OBTENER METADATOS
    // ═══════════════════════════════

    const meta =
      await getSubBotMeta()


    if (
      !meta[zen.ownerNumber]
    ) {

      meta[zen.ownerNumber] =
        {}

    }


    // ═══════════════════════════════
    // ✰ GUARDAR NOMBRE
    // ═══════════════════════════════

    meta[
      zen.ownerNumber
    ].name =
      nuevoNombre


    await saveSubBotMeta(
      meta
    )


    // ═══════════════════════════════
    // ✰ RESPUESTA EXITOSA
    // ═══════════════════════════════

    return m.reply(
`༺ ✰ 𝙽𝙾𝙼𝙱𝚁𝙴 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝚝𝚞 𝚂𝚞𝚋-𝙱𝚘𝚝 𝚏𝚞𝚎 𝚌𝚊𝚖𝚋𝚒𝚊𝚍𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

༺ ✰ 𝙽𝚄𝙴𝚅𝙾 𝙽𝙾𝙼𝙱𝚁𝙴 ✰ ༻
> ✰ 🤖 *${nuevoNombre}*
> ✰ 𝙴𝚕 𝚗𝚞𝚎𝚟𝚘 𝚗𝚘𝚖𝚋𝚛𝚎 𝚑𝚊 𝚚𝚞𝚎𝚍𝚊𝚍𝚘 𝚐𝚞𝚊𝚛𝚍𝚊𝚍𝚘 𝚎𝚗 𝚕𝚊 𝚌𝚘𝚗𝚏𝚒𝚐𝚞𝚛𝚊𝚌𝚒ó𝚗 𝚍𝚎 𝚝𝚞 𝚂𝚞𝚋-𝙱𝚘𝚝.`
    )

  } catch (error) {

    console.error(
      '[SETBOTNAME]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚛 𝚎𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎𝚕 𝚂𝚞𝚋-𝙱𝚘𝚝.

> ✰ 𝙸𝚗𝚝é𝚗𝚝𝚊𝚕𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'setbotname <nombre>',
  'setnamebot <nombre>',
  'namebot <nombre>'
]

handler.tags = [
  'jadibot'
]

handler.command = [
  'setbotname',
  'setnamebot',
  'namebot'
]

handler.noRegister = true

export default handler