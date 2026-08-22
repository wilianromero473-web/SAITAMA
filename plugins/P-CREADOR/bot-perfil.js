// ═════════════════════════════════════
// ✰ SAITAMABOT • PERFIL DEL BOT
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    args,
    text,
    usedPrefix,
    command
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ OBTENER TIPO Y VALOR
    // ═══════════════════════════════

    const tipo =
      args[0]?.toLowerCase()


    const valor =
      text
        .slice(
          args[0]?.length || 0
        )
        .trim()


    // ═══════════════════════════════
    // ✰ VERIFICAR DATOS
    // ═══════════════════════════════

    if (
      !tipo ||
      !['nombre', 'bio'].includes(tipo) ||
      !valor
    ) {

      return m.reply(
`༺ ✰ 𝙿𝙴𝚁𝙵𝙸𝙻 𝙳𝙴𝙻 𝙱𝙾𝚃 ✰ ༻

> ✰ 𝙰𝚚𝚞í 𝚙𝚞𝚎𝚍𝚎𝚜 𝚌𝚊𝚖𝚋𝚒𝚊𝚛 𝚎𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚘 𝚕𝚊 𝚋𝚒𝚘 𝚍𝚎𝚕 𝚋𝚘𝚝.

༺ ✰ 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂 ✰ ༻

> ✰ *${usedPrefix}${command} nombre <nuevo nombre>*
> ✰ *${usedPrefix}${command} bio <nueva bio>*

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾𝚂 ✰ ༻

> ✰ *${usedPrefix}${command} nombre SaitamaBot*
> ✰ *${usedPrefix}${command} bio Bot oficial de Saitama*`
      )

    }


    // ═══════════════════════════════
    // ✰ CAMBIAR NOMBRE
    // ═══════════════════════════════

    if (
      tipo === 'nombre'
    ) {

      await m.reply(
`༺ ✰ 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙲𝚊𝚖𝚋𝚒𝚊𝚗𝚍𝚘 𝚎𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎𝚕 𝚋𝚘𝚝...
> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
      )


      await conn.updateProfileName(
        valor
      )


      return m.reply(
`༺ ✰ 𝙽𝙾𝙼𝙱𝚁𝙴 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎𝚕 𝚋𝚘𝚝 𝚏𝚞𝚎 𝚌𝚊𝚖𝚋𝚒𝚊𝚍𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

༺ ✰ 𝙽𝚄𝙴𝚅𝙾 𝙽𝙾𝙼𝙱𝚁𝙴 ✰ ༻

> ✰ *${valor}*`
      )

    }


    // ═══════════════════════════════
    // ✰ CAMBIAR BIO
    // ═══════════════════════════════

    if (
      tipo === 'bio'
    ) {

      await m.reply(
`༺ ✰ 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙲𝚊𝚖𝚋𝚒𝚊𝚗𝚍𝚘 𝚕𝚊 𝚋𝚒𝚘 𝚍𝚎𝚕 𝚋𝚘𝚝...
> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
      )


      await conn.updateProfileStatus(
        valor
      )


      return m.reply(
`༺ ✰ 𝙱𝙸𝙾 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙰 ✰ ༻

> ✰ 𝙻𝚊 𝚋𝚒𝚘 𝚍𝚎𝚕 𝚋𝚘𝚝 𝚏𝚞𝚎 𝚌𝚊𝚖𝚋𝚒𝚊𝚍𝚊 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

༺ ✰ 𝙽𝚄𝙴𝚅𝙰 𝙱𝙸𝙾 ✰ ༻

> ✰ ${valor}`
      )

    }

  } catch (error) {

    console.error(
      '[BOTPERFIL]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚛 𝚎𝚕 𝚙𝚎𝚛𝚏𝚒𝚕 𝚍𝚎𝚕 𝚋𝚘𝚝.

> ✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
> ${String(error?.message || 'Error desconocido.').slice(0, 200)}`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'botperfil nombre <texto>',
  'botperfil bio <texto>'
]

handler.tags = [
  'owner'
]

handler.command = [
  'botperfil',
  'setperfil'
]

handler.ownerOnly = true


export default handler