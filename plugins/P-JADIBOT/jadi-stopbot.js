import { pauseSubBot, subBots } from '../../lib/jadibot.js'


// ═════════════════════════════════════
// ✰ SAITAMABOT • PAUSAR SUB-BOT
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ NORMALIZAR NÚMERO
// ═════════════════════════════════════

function normalizarNumero(numero) {

  let n =
    String(numero || '')
      .replace(/\D/g, '')

  if (n.startsWith('549')) {
    n = '54' + n.slice(3)
  }

  if (n.startsWith('521')) {
    n = '52' + n.slice(3)
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
    args,
    isOwner,
    usedPrefix
  }
) => {

  try {

    const senderNumber =
      normalizarNumero(m.sender)

    const ownerNumber =
      normalizarNumero(zen.ownerNumber)


    // ═══════════════════════════════
    // ✰ PAUSAR DESDE SUB-BOT
    // ═══════════════════════════════

    if (zen.isSubBot) {

      if (
        senderNumber !== ownerNumber &&
        !isOwner
      ) {

        return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙿𝙴𝚁𝙼𝙸𝚂𝙾𝚂 ✰ ༻

> ✰ 𝚂𝚘𝚕𝚘 𝚎𝚕 𝚍𝚞𝚎ñ𝚘 𝚍𝚎𝚕 𝚂𝚞𝚋-𝙱𝚘𝚝 𝚙𝚞𝚎𝚍𝚎 𝚙𝚊𝚞𝚜𝚊𝚛 𝚎𝚜𝚝𝚊 𝚜𝚎𝚜𝚒ó𝚗.

> ✰ 𝙳𝚞𝚎ñ𝚘: +${zen.ownerNumber}`
        )

      }


      await m.reply(
`༺ ✰ 𝙿𝙰𝚄𝚂𝙰𝙽𝙳𝙾 𝚂𝚄𝙱-𝙱𝙾𝚃 ✰ ༻

> ✰ 𝙲𝚎𝚛𝚛𝚊𝚗𝚍𝚘 𝚕𝚊 𝚜𝚎𝚜𝚒ó𝚗...
> ✰ 𝙻𝚘𝚜 𝚍𝚊𝚝𝚘𝚜 𝚜𝚎𝚛á𝚗 𝚌𝚘𝚗𝚜𝚎𝚛𝚟𝚊𝚍𝚘𝚜.`
      )


      await pauseSubBot(
        zen.ownerNumber
      )


      return

    }


    // ═══════════════════════════════
    // ✰ BOT PRINCIPAL
    // ═══════════════════════════════

    let numero =
      args.length
        ? normalizarNumero(args[0])
        : senderNumber


    // ═══════════════════════════════
    // ✰ VERIFICAR PERMISOS
    // ═══════════════════════════════

    if (
      !isOwner &&
      numero !== senderNumber
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙿𝙴𝚁𝙼𝙸𝚂𝙾𝚂 ✰ ༻

> ✰ 𝚂𝚘𝚕𝚘 𝚙𝚘𝚍é𝚜 𝚙𝚊𝚞𝚜𝚊𝚛 𝚝𝚞 𝚙𝚛𝚘𝚙𝚒𝚊 𝚜𝚎𝚜𝚒ó𝚗.`
      )

    }


    // ═══════════════════════════════
    // ✰ VERIFICAR SESIÓN
    // ═══════════════════════════════

    if (!subBots.has(numero)) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝚂𝙴𝚂𝙸Ó𝙽 𝙰𝙲𝚃𝙸𝚅𝙰 ✰ ༻

> ✰ 𝙽𝚘 𝚑𝚊𝚢 𝚞𝚗 𝚂𝚞𝚋-𝙱𝚘𝚝 𝚊𝚌𝚝𝚒𝚟𝚘 𝚌𝚘𝚗 𝚎𝚕 𝚗ú𝚖𝚎𝚛𝚘:

> ✰ +${numero}

> ✰ 𝚄𝚜á *${usedPrefix}serbot* 𝚙𝚊𝚛𝚊 𝚌𝚘𝚗𝚎𝚌𝚝𝚊𝚛𝚕𝚘.`
      )

    }


    // ═══════════════════════════════
    // ✰ PAUSAR
    // ═══════════════════════════════

    await m.reply(
`༺ ✰ 𝙿𝙰𝚄𝚂𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝚂𝚞𝚋-𝙱𝚘𝚝: +${numero}

> ✰ 𝙳𝚎𝚜𝚌𝚘𝚗𝚎𝚌𝚝𝚊𝚗𝚍𝚘 𝚕𝚊 𝚜𝚎𝚜𝚒ó𝚗...
> ✰ 𝙻𝚘𝚜 𝚍𝚊𝚝𝚘𝚜 𝚙𝚎𝚛𝚖𝚊𝚗𝚎𝚌𝚎𝚛á𝚗 𝚐𝚞𝚊𝚛𝚍𝚊𝚍𝚘𝚜.`
    )


    await pauseSubBot(
      numero
    )


    // ═══════════════════════════════
    // ✰ ÉXITO
    // ═══════════════════════════════

    return m.reply(
`༺ ✰ 𝚂𝚄𝙱-𝙱𝙾𝚃 𝙿𝙰𝚄𝚂𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙽ú𝚖𝚎𝚛𝚘: +${numero}

> ✰ 𝙻𝚊 𝚜𝚎𝚜𝚒ó𝚗 𝚏𝚞𝚎 𝚍𝚎𝚜𝚌𝚘𝚗𝚎𝚌𝚝𝚊𝚍𝚊 𝚝𝚎𝚖𝚙𝚘𝚛𝚊𝚕𝚖𝚎𝚗𝚝𝚎.

> ✰ 𝚃𝚞𝚜 𝚍𝚊𝚝𝚘𝚜 𝚜𝚒𝚐𝚞𝚎𝚗 𝚐𝚞𝚊𝚛𝚍𝚊𝚍𝚘𝚜.

༺ ✰ 𝙿𝙰𝚁𝙰 𝚁𝙴𝙰𝙲𝚃𝙸𝚅𝙰𝚁 ✰ ༻

> ✰ 𝚄𝚜á *${usedPrefix}serbot*`
    )

  } catch (error) {

    console.error(
      '[STOPBOT]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚙𝚊𝚞𝚜𝚊𝚛 𝚕𝚊 𝚜𝚎𝚜𝚒ó𝚗.

> ✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
> ${String(
  error?.message ||
  'Error desconocido.'
).slice(0, 250)}`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'stopbot',
  'pausarbot'
]

handler.tags = [
  'jadibot'
]

handler.command = [
  'stopbot',
  'pausarbot'
]

handler.noRegister = true

export default handler