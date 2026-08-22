import {
  getSubBotMeta,
  saveSubBotMeta
} from '../../lib/jadibot.js'

import {
  uploadImage
} from '../../lib/uploadImage.js'


// ═════════════════════════════════════
// ✰ SAITAMABOT • IMAGEN DEL SUB-BOT
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ NORMALIZAR NÚMERO
// ═════════════════════════════════════

function normalizarNumero(numero) {

  let n =
    String(numero || '')
      .replace(/\D/g, '')

  if (
    n.startsWith('549')
  ) {

    n =
      '54' +
      n.slice(3)

  }

  if (
    n.startsWith('521')
  ) {

    n =
      '52' +
      n.slice(3)

  }

  return n
}


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn: zen,
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
`༺ ✰ 𝙸𝙼𝙰𝙶𝙴𝙽 𝙳𝙴𝙻 𝚂𝚄𝙱-𝙱𝙾𝚃 ✰ ༻

> ✰ 𝙴𝚜𝚝𝚎 𝚌𝚘𝚖𝚊𝚗𝚍𝚘 𝚎𝚜 𝚎𝚡𝚌𝚕𝚞𝚜𝚒𝚟𝚘 𝚙𝚊𝚛𝚊 𝚍𝚞𝚎ñ𝚘𝚜 𝚍𝚎 𝚂𝚞𝚋-𝙱𝚘𝚝𝚜.`
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
      senderNumber !== ownerNumber
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙿𝙴𝚁𝙼𝙸𝚂𝙾𝚂 ✰ ༻

> ✰ 𝚂𝚘𝚕𝚘 𝚎𝚕 𝚍𝚞𝚎ñ𝚘 𝚍𝚎 𝚎𝚜𝚝𝚎 𝚂𝚞𝚋-𝙱𝚘𝚝 𝚙𝚞𝚎𝚍𝚎 𝚌𝚊𝚖𝚋𝚒𝚊𝚛 𝚕𝚊 𝚒𝚖𝚊𝚐𝚎𝚗 𝚍𝚎𝚕 𝚖𝚎𝚗ú.

> ✰ 𝙳𝚞𝚎ñ𝚘: +${zen.ownerNumber}`
      )

    }


    // ═══════════════════════════════
    // ✰ OBTENER IMAGEN
    // ═══════════════════════════════

    const q =
      m.quoted || m


    const mime =
      (
        q.msg ||
        q
      ).mimetype || ''


    if (
      !/image/i.test(mime)
    ) {

      return m.reply(
`༺ ✰ 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻

> ✰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗𝚊 𝚒𝚖𝚊𝚐𝚎 𝚌𝚘𝚗:

*${usedPrefix}${command}*

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ 𝙴𝚗𝚟í𝚊 𝚘 𝚛𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚕𝚊 𝚒𝚖𝚊𝚐𝚎𝚗 𝚚𝚞𝚎 𝚚𝚞𝚒𝚎𝚛𝚊𝚜 𝚞𝚜𝚊𝚛 𝚎𝚗 𝚎𝚕 𝚖𝚎𝚗ú.`
      )

    }


    // ═══════════════════════════════
    // ✰ DESCARGAR IMAGEN
    // ═══════════════════════════════

    await m.reply(
`༺ ✰ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚗𝚍𝚘 𝚕𝚊 𝚒𝚖𝚊𝚐𝚎𝚗...
> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
    )


    const buffer =
      await q.download()


    if (!buffer) {

      return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚙𝚛𝚘𝚌𝚎𝚜𝚊𝚛 𝚕𝚊 𝚒𝚖𝚊𝚐𝚎𝚗.`
      )

    }


    // ═══════════════════════════════
    // ✰ SUBIR IMAGEN
    // ═══════════════════════════════

    await m.reply(
`༺ ✰ 𝚂𝚄𝙱𝙸𝙴𝙽𝙳𝙾 ✰ ༻

> ✰ 𝚂𝚞𝚋𝚒𝚎𝚗𝚍𝚘 𝚕𝚊 𝚒𝚖𝚊𝚐𝚎𝚗 𝚊𝚕 𝚜𝚎𝚛𝚟𝚒𝚍𝚘𝚛...`
    )


    const url =
      await uploadImage(
        buffer
      )


    if (!url) {

      throw new Error(
        'No se obtuvo una URL para la imagen.'
      )

    }


    // ═══════════════════════════════
    // ✰ ACTUALIZAR SUB-BOT
    // ═══════════════════════════════

    zen.menuImage =
      url


    // ═══════════════════════════════
    // ✰ GUARDAR METADATOS
    // ═══════════════════════════════

    const meta =
      await getSubBotMeta()


    if (
      !meta[zen.ownerNumber]
    ) {

      meta[zen.ownerNumber] =
        {}

    }


    meta[
      zen.ownerNumber
    ].menuImage =
      url


    await saveSubBotMeta(
      meta
    )


    // ═══════════════════════════════
    // ✰ ÉXITO
    // ═══════════════════════════════

    return m.reply(
`༺ ✰ 𝙸𝙼𝙰𝙶𝙴𝙽 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙰 ✰ ༻

> ✰ 𝙻𝚊 𝚒𝚖𝚊𝚐𝚎𝚗 𝚍𝚎𝚕 𝚖𝚎𝚗ú 𝚏𝚞𝚎 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚍𝚊 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

> ✰ 𝚄𝚜á *${usedPrefix}menu* 𝚙𝚊𝚛𝚊 𝚟𝚎𝚛 𝚎𝚕 𝚌𝚊𝚖𝚋𝚒𝚘.

༺ ✰ 𝙽𝚄𝙴𝚅𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝙶𝚄𝙰𝚁𝙳𝙰𝙳𝙰 ✰ ༻`
    )

  } catch (error) {

    console.error(
      '[SETBOTIMAGE]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚛 𝚕𝚊 𝚒𝚖𝚊𝚐𝚎𝚗 𝚍𝚎𝚕 𝚖𝚎𝚗ú.

> ✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎: ${
  String(
    error?.message ||
    'Error desconocido.'
  ).slice(0, 250)
}`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'setbotimage',
  'setfotobot',
  'imagebot'
]

handler.tags = [
  'jadibot'
]

handler.command = [
  'setbotimage',
  'setfotobot',
  'imagebot'
]

handler.noRegister = true

export default handler