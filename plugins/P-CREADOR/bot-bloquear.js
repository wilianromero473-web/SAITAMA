import * as baileysMod from '@whiskeysockets/baileys'

const pkg =
  baileysMod.default &&
  Object.keys(baileysMod).length === 1
    ? baileysMod.default
    : baileysMod

const {
  jidNormalizedUser
} = pkg


// ═════════════════════════════════════
// ✰ SAITAMABOT • BLOQUEAR USUARIO
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    args,
    usedPrefix,
    command
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ OBTENER USUARIO
    // ═══════════════════════════════

    const user =
      m.mentionedJid?.[0] ||
      (
        m.quoted
          ? m.quoted.sender
          : null
      )


    // ═══════════════════════════════
    // ✰ VERIFICAR USUARIO
    // ═══════════════════════════════

    if (!user) {

      return m.reply(
`༺ ✰ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙾 ✰ ༻

> ✰ 𝙼𝚎𝚗𝚌𝚒𝚘𝚗𝚊 𝚊 𝚞𝚗 𝚞𝚜𝚞𝚊𝚛𝚒𝚘 𝚘 𝚛𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚜𝚞 𝚖𝚎𝚗𝚜𝚊𝚓𝚎.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ ${usedPrefix}${command} @usuario`
      )

    }


    // ═══════════════════════════════
    // ✰ NORMALIZAR JID
    // ═══════════════════════════════

    const targetJid =
      jidNormalizedUser(
        user
      )


    const targetNum =
      targetJid
        .split('@')[0]


    // ═══════════════════════════════
    // ✰ DETERMINAR ACCIÓN
    // ═══════════════════════════════

    const accion =
      command === 'bloquear' ||
      command === 'block'
        ? 'block'
        : 'unblock'


    const esBloqueo =
      accion === 'block'


    // ═══════════════════════════════
    // ✰ PROCESANDO
    // ═══════════════════════════════

    await m.reply(
      esBloqueo

        ? `༺ ✰ 𝙱𝙻𝙾𝚀𝚄𝙴𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙿𝚛𝚘𝚌𝚎𝚜𝚊𝚗𝚍𝚘 𝚊𝚌𝚌𝚒ó𝚗...
> ✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${targetNum}`

        : `༺ ✰ 𝙳𝙴𝚂𝙱𝙻𝙾𝚀𝚄𝙴𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙿𝚛𝚘𝚌𝚎𝚜𝚊𝚗𝚍𝚘 𝚊𝚌𝚌𝚒ó𝚗...
> ✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${targetNum}`
    )


    // ═══════════════════════════════
    // ✰ EJECUTAR ACCIÓN
    // ═══════════════════════════════

    await conn.updateBlockStatus(
      targetJid,
      accion
    )


    // ═══════════════════════════════
    // ✰ RESPUESTA
    // ═══════════════════════════════

    return m.reply(

      esBloqueo

        ? `༺ ✰ 𝙱𝙻𝙾𝚀𝚄𝙴𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚞𝚜𝚞𝚊𝚛𝚒𝚘 𝚏𝚞𝚎 𝚋𝚕𝚘𝚚𝚞𝚎𝚊𝚍𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

> ✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${targetNum}`

        : `༺ ✰ 𝙳𝙴𝚂𝙱𝙻𝙾𝚀𝚄𝙴𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚞𝚜𝚞𝚊𝚛𝚒𝚘 𝚏𝚞𝚎 𝚍𝚎𝚜𝚋𝚕𝚘𝚚𝚞𝚎𝚊𝚍𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

> ✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${targetNum}`,

      [targetJid]
    )


  } catch (error) {

    console.error(
      '[BLOCK]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛 𝚕𝚊 𝚊𝚌𝚌𝚒ó𝚗.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'bloquear @user',
  'desbloquear @user'
]

handler.tags = [
  'owner'
]

handler.command = [
  'bloquear',
  'block',
  'desbloquear',
  'unblock'
]

handler.ownerOnly = true


export default handler