// ✰ SAITAMABOT • SALIR DEL GRUPO

const handler = async (
  m,
  {
    conn
  }
) => {

  // ✰ VERIFICAR GRUPO

  if (!m.isGroup) {

    return m.reply(
`✰ 𝚂𝙾𝙻𝙾 𝙶𝚁𝚄𝙿𝙾𝚂 ✰

> ✰ 𝙴𝚜𝚝𝚎 𝚌𝚘𝚖𝚊𝚗𝚍𝚘 𝚜𝚘𝚕𝚘 𝚜𝚎 𝚙𝚞𝚎𝚍𝚎
> 𝚞𝚜𝚊𝚛 𝚍𝚎𝚗𝚝𝚛𝚘 𝚍𝚎 𝚞𝚗 𝚐𝚛𝚞𝚙𝚘.`
    )

  }


  // ✰ MENSAJE DE DESPEDIDA

  await m.reply(
`✰ 𝙾𝚁𝙳𝙴𝙽𝙴𝚂 𝙳𝙴𝙻 𝙾𝚆𝙽𝙴𝚁 ✰

> ✰ 𝙷𝚊 𝚜𝚒𝚍𝚘 𝚞𝚗 𝚙𝚕𝚊𝚌𝚎𝚛 𝚎𝚜𝚝𝚊𝚛 𝚊𝚚𝚞í.
> ✰ 𝙿𝚎𝚛𝚘 𝚖𝚎 𝚝𝚎𝚗𝚐𝚘 𝚚𝚞𝚎 𝚒𝚛.

✰ 𝙷𝚊𝚜𝚝𝚊 𝚙𝚛𝚘𝚗𝚝𝚘 ✰`
  )


  // ✰ ABANDONAR GRUPO

  try {

    await conn.groupLeave(
      m.chat
    )

  } catch (error) {

    console.error(
      '[SALIR]',
      error?.message || error
    )

    return m.reply(
`✰ 𝙴𝚁𝚁𝙾𝚁 ✰

> ✰ 𝙽𝚘 𝚙𝚞𝚍𝚎 𝚊𝚋𝚊𝚗𝚍𝚘𝚗𝚊𝚛 𝚎𝚕 𝚐𝚛𝚞𝚙𝚘.

> ✰ 𝙳𝚎𝚩𝚊𝚕𝚕𝚎:
> ${error?.message || '𝙴𝚛𝚛𝚘𝚛 𝚍𝚎𝚜𝚌𝚘𝚗𝚘𝚌𝚒𝚍𝚘'}`
    )

  }
}


// ✰ CONFIGURACIÓN DEL PLUGIN

handler.help = [
  'salir',
  'leave',
  'salirdelgrupo',
  'quit'
]

handler.command = [
  'salir',
  'leave',
  'salirdelgrupo',
  'quit'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler