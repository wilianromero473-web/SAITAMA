import { deleteSubBot } from '../../lib/jadibot.js'

// ═════════════════════════════════════
// ✰ SAITAMABOT • ELIMINAR SUB-BOT
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn: zen,
    args,
    isOwner
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ SI ES UN SUB-BOT
    // ═══════════════════════════════

    if (zen.isSubBot) {

      await m.reply(
`༺ ✰ 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙻𝚊 𝚜𝚎𝚜𝚒ó𝚗 𝚍𝚎𝚕 𝚜𝚞𝚋-𝚋𝚘𝚝 𝚜𝚎𝚛á 𝚎𝚕𝚒𝚖𝚒𝚗𝚊𝚍𝚊.

> ✰ 𝙻𝚘𝚜 𝚍𝚊𝚝𝚘𝚜 𝚍𝚎 𝚕𝚊 𝚜𝚎𝚜𝚒ó𝚗 𝚜𝚎𝚛á𝚗 𝚋𝚘𝚛𝚛𝚊𝚍𝚘𝚜 𝚍𝚎𝚕 𝚜𝚎𝚛𝚟𝚒𝚍𝚘𝚛.

༺ ✰ 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙽𝙳𝙾... ✰ ༻`
      )

      await deleteSubBot(
        zen.ownerNumber
      )

      return
    }


    // ═══════════════════════════════
    // ✰ NÚMERO DEL USUARIO
    // ═══════════════════════════════

    const senderNumber =
      String(
        m.sender || ''
      )
        .split('@')[0]
        .replace(/\D/g, '')


    // ═══════════════════════════════
    // ✰ NÚMERO A ELIMINAR
    // ═══════════════════════════════

    let numero =
      args.length
        ? String(args[0]).replace(/\D/g, '')
        : senderNumber


    if (!numero) {

      return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚍𝚎𝚝𝚎𝚌𝚝𝚊𝚛 𝚎𝚕 𝚗ú𝚖𝚎𝚛𝚘.

> ✰ 𝚄𝚜𝚘: 𝙙𝙚𝙡𝙗𝙤𝙩
> ✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘: 𝙙𝙚𝙡𝙗𝙤𝙩 51999999999`
      )

    }


    // ═══════════════════════════════
    // ✰ VERIFICAR PERMISOS
    // ═══════════════════════════════

    if (
      !isOwner &&
      numero !== senderNumber
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙿𝙴𝚁𝙼𝙸𝚂𝙾𝚂 ✰ ༻

> ✰ 𝚂𝚘𝚡𝚕𝚘 𝚙𝚘𝚍é𝚜 𝚎𝚕𝚒𝚖𝚒𝚗𝚊𝚛 𝚝𝚞 𝚙𝚛𝚘𝚙𝚒𝚊 𝚜𝚎𝚜𝚒ó𝚗.

> ✰ 𝙴𝚕 𝚍𝚞𝚎ñ𝚘 𝚍𝚎𝚕 𝚋𝚘𝚝 𝚜í 𝚙𝚞𝚎𝚍𝚎 𝚎𝚕𝚒𝚖𝚒𝚗𝚊𝚛 𝚘𝚝𝚛𝚊𝚜 𝚜𝚎𝚜𝚒𝚘𝚗𝚎𝚜.`
      )

    }


    // ═══════════════════════════════
    // ✰ ELIMINAR SESIÓN
    // ═══════════════════════════════

    await deleteSubBot(
      numero
    )


    // ═══════════════════════════════
    // ✰ CONFIRMACIÓN
    // ═══════════════════════════════

    return m.reply(
`༺ ✰ 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙻𝚊 𝚜𝚎𝚜𝚒ó𝚗 𝚑𝚊 𝚜𝚒𝚍𝚘 𝚎𝚕𝚒𝚖𝚒𝚗𝚊𝚍𝚊.

> ✰ 𝙽ú𝚖𝚎𝚛𝚘: +${numero}

> ✰ 𝙻𝚘𝚜 𝚍𝚊𝚝𝚘𝚜 𝚍𝚎 𝚕𝚊 𝚜𝚎𝚜𝚒ó𝚗 𝚏𝚞𝚎𝚛𝚘𝚗 𝚋𝚘𝚛𝚛𝚊𝚍𝚘𝚜 𝚙𝚎𝚛𝚖𝚊𝚗𝚎𝚗𝚝𝚎𝚖𝚎𝚗𝚝𝚎.

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`
    )

  } catch (error) {

    // ═══════════════════════════════
    // ✰ ERROR
    // ═══════════════════════════════

    console.error(
      '[DEL BOT]',
      error?.message || error
    )

    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚎𝚕𝚒𝚖𝚒𝚗𝚊𝚛 𝚕𝚊 𝚜𝚎𝚜𝚒ó𝚗.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎 𝚖á𝚜 𝚝𝚊𝚛𝚍𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'delbot',
  'delbot <número>',
  'borrarbot',
  'borrarbot <número>'
]

handler.tags = [
  'jadibot'
]

handler.command = [
  'delbot',
  'borrarbot'
]

handler.noRegister = true

export default handler