// ✰ SAITAMABOT • UNIRSE A GRUPO

const handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command
  }
) => {

  // ✰ VERIFICAR ENLACE

  if (!text?.trim()) {
    return m.reply(
`𝙴𝙽𝙻𝙰𝙲𝙴 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙾

> ✰ 𝚄𝚜𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚘:
> *${usedPrefix + command}* <enlace de WhatsApp>

> ✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
> *${usedPrefix + command} https://chat.whatsapp.com/xxxxxxxxxxxxxxxxxxxx*`
    )
  }

  // ✰ DETECTAR LINK

  const linkRegex =
    /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

  const match =
    text.trim().match(linkRegex)

  if (!match) {
    return m.reply(
`𝙴𝙽𝙻𝙰𝙲𝙴 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾

> ✰ 𝙰𝚜𝚎𝚐ú𝚛𝚊𝚝𝚎 𝚍𝚎 𝚚𝚞𝚎 𝚜𝚎𝚊 𝚞𝚗
> ✰ 𝚎𝚗𝚕𝚊𝚌𝚎 𝚟á𝚕𝚒𝚍𝚘 𝚍𝚎 𝚒𝚗𝚟𝚒𝚝𝚊𝚌𝚒ó𝚗
> ✰ 𝚊 𝚞𝚗 𝚐𝚛𝚞𝚙𝚘 𝚍𝚎 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙.`
    )
  }

  const code =
    match[1]

  // ✰ PROCESANDO

  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  )

  await m.reply(
`𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾

> ✰ 𝚅𝚎𝚛𝚒𝚏𝚒𝚌𝚊𝚗𝚍𝚘 𝚎𝚗𝚕𝚊𝚌𝚎...
> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊𝚗𝚍𝚘 𝚞𝚗𝚒𝚛𝚜𝚎 𝚊𝚕 𝚐𝚛𝚞𝚙𝚘...`
  )

  try {

    // ✰ UNIRSE AL GRUPO

    const res =
      await conn.groupAcceptInvite(
        code
      )

    // ✰ ÉXITO

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    )

    return m.reply(
`𝚄𝙽𝙸Ó𝙽 𝙴𝚇𝙸𝚃𝙾𝚂𝙰

> ✰ 𝙴𝚕 𝚋𝚘𝚝 𝚜𝚎 𝚞𝚗𝚒ó 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

> ✰ 𝙸𝙳 𝚍𝚎𝚕 𝚐𝚛𝚞𝚙𝚘:
> *${res}*`
    )

  } catch (error) {

    console.error(
      '[JOIN]',
      error?.message ||
      error
    )

    // ✰ ERROR

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    )

    return m.reply(
`𝙴𝚁𝚁𝙾𝚁 𝙰𝙻 𝚄𝙽𝙸𝚁𝚂𝙴

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚞𝚗𝚒𝚛 𝚊𝚕 𝚐𝚛𝚞𝚙𝚘.

> ✰ 𝙿𝚘𝚜𝚒𝚋𝚕𝚎𝚜 𝚌𝚊𝚞𝚜𝚊𝚜:
> ✰ 𝙴𝚕 𝚎𝚗𝚕𝚊𝚌𝚎 𝚏𝚞𝚎 𝚛𝚎𝚜𝚝𝚊𝚋𝚕𝚎𝚌𝚒𝚍𝚘.
> ✰ 𝙴𝚕 𝚐𝚛𝚞𝚙𝚘 𝚎𝚜𝚝á 𝚕𝚕𝚎𝚗𝚘.
> ✰ 𝙴𝚕 𝚎𝚗𝚕𝚊𝚌𝚎 𝚢𝚊 𝚗𝚘 𝚎𝚜𝚝á 𝚊𝚌𝚝𝚒𝚟𝚘.
> ✰ 𝙴𝚕 𝚋𝚘𝚝 𝚗𝚘 𝚙𝚞𝚎𝚍𝚎 𝚞𝚗𝚒𝚛𝚜𝚎 𝚊𝚕 𝚐𝚛𝚞𝚙𝚘.`
    )
  }
}


// ✰ CONFIGURACIÓN DEL PLUGIN

handler.help = [
  'join <link>',
  'entrar <link>',
  'unirse <link>'
]

handler.command = [
  'join',
  'entrar',
  'unirse',
  'joingroup'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler