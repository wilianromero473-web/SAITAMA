const handler = async (m, { conn, args, usedPrefix, command }) => {

  // ═════════════════════════════════════
  // ✰ CONFIGURACIÓN
  // ═════════════════════════════════════

  const tipo = args[0]?.toLowerCase()


  // ═════════════════════════════════════
  // ✰ VALIDAR ESTADO
  // ═════════════════════════════════════

  const estados = [
    'escribiendo',
    'grabando',
    'pausado'
  ]

  if (!tipo || !estados.includes(tipo)) {

    return m.reply(
`༺ ✰ 𝙿𝚁𝙴𝚂𝙴𝙽𝙲𝙸𝙰 ✰ ༻

> ✰ *${usedPrefix}${command} escribiendo*
> ✰ *${usedPrefix}${command} grabando*
> ✰ *${usedPrefix}${command} pausado*

༺ ✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘 ✰ ༻

> ✰ ${usedPrefix}${command} escribiendo`
    )

  }


  // ═════════════════════════════════════
  // ✰ MAPA DE PRESENCIAS
  // ═════════════════════════════════════

  const mapa = {

    escribiendo: 'composing',

    grabando: 'recording',

    pausado: 'paused'

  }


  // ═════════════════════════════════════
  // ✰ ACTIVAR PRESENCIA
  // ═════════════════════════════════════

  try {

    await conn.sendPresenceUpdate(
      mapa[tipo],
      m.chat
    )


    // ═══════════════════════════════════
    // ✰ RESPUESTA
    // ═══════════════════════════════════

    return m.reply(
`༺ ✰ 𝙿𝚁𝙴𝚂𝙴𝙽𝙲𝙸𝙰 𝙰𝙲𝚃𝙸𝚅𝙰 ✰ ༻

> ✰ 𝙴𝚜𝚝𝚊𝚍𝚘: *${tipo}*
> ✰ 𝙲𝚑𝚊𝚝: *${m.chat.split('@')[0]}*

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`
    )

  } catch (error) {

    console.error(
      '[PRESENCIA]',
      error?.message || error
    )

    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚊𝚖𝚋𝚒𝚊𝚛 𝚕𝚊 𝚙𝚛𝚎𝚜𝚎𝚗𝚌𝚒𝚊.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'presencia <estado>'
]

handler.command = [
  'presencia',
  'presence'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler