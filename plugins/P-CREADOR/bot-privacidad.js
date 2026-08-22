// ═════════════════════════════════════
// ✰ SAITAMABOT • PRIVACIDAD
// ═════════════════════════════════════

const OPCIONES = {

  all: 'todos',

  contacts: 'contactos',

  contact_blacklist: 'contactos excepto...',

  none: 'nadie'

}


// ═════════════════════════════════════
// ✰ CONFIGURACIONES
// ═════════════════════════════════════

const CONFIGS = {

  lastseen: {
    fn: 'updateLastSeenPrivacy',
    label: 'Último visto'
  },

  foto: {
    fn: 'updateProfilePicturePrivacy',
    label: 'Foto de perfil'
  },

  bio: {
    fn: 'updateStatusPrivacy',
    label: 'Bio / Estado'
  },

  grupos: {
    fn: 'updateGroupsAddPrivacy',
    label: 'Quién te agrega a grupos'
  },

  llamadas: {
    fn: 'updateCallPrivacy',
    label: 'Llamadas'
  },

  ticks: {
    fn: 'updateReadReceiptsPrivacy',
    label: 'Confirmaciones de lectura'
  }

}


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

    // ═════════════════════════════════
    // ✰ OBTENER DATOS
    // ═════════════════════════════════

    const tipo =
      args[0]?.toLowerCase()

    const valor =
      args[1]?.toLowerCase()


    // ═════════════════════════════════
    // ✰ MOSTRAR AYUDA
    // ═════════════════════════════════

    if (
      !tipo ||
      !CONFIGS[tipo]
    ) {

      const lista =
        Object.entries(CONFIGS)
          .map(
            ([k, v]) =>
              `> ✰ *${k}* — ${v.label}`
          )
          .join('\n')


      const valores =
        Object.entries(OPCIONES)
          .map(
            ([k, v]) =>
              `> ✰ *${k}* → ${v}`
          )
          .join('\n')


      return m.reply(
`༺ ✰ 𝙿𝚁𝙸𝚅𝙰𝙲𝙸𝙳𝙰𝙳 𝙳𝙴𝙻 𝙱𝙾𝚃 ✰ ༻

༺ ✰ 𝙲𝙾𝙽𝙵𝙸𝙶𝚄𝚁𝙰𝙲𝙸𝙾𝙽𝙴𝚂 ✰ ༻

${lista}

༺ ✰ 𝚅𝙰𝙻𝙾𝚁𝙴𝚂 𝙳𝙸𝚂𝙿𝙾𝙽𝙸𝙱𝙻𝙴𝚂 ✰ ༻

${valores}

༺ ✰ 𝚄𝚂𝙾 ✰ ༻

> ✰ *${usedPrefix}${command} <config> <valor>*

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ *${usedPrefix}${command} lastseen none*
> ✰ *${usedPrefix}${command} foto contacts*`
      )

    }


    // ═════════════════════════════════
    // ✰ VALIDAR VALOR
    // ═════════════════════════════════

    if (
      !valor ||
      !OPCIONES[valor]
    ) {

      return m.reply(
`༺ ✰ 𝚅𝙰𝙻𝙾𝚁 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙾 ✰ ༻

> ✰ *all* → todos
> ✰ *contacts* → contactos
> ✰ *contact_blacklist* → contactos excepto...
> ✰ *none* → nadie

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ *${usedPrefix}${command} lastseen none*`
      )

    }


    // ═════════════════════════════════
    // ✰ OBTENER CONFIGURACIÓN
    // ═════════════════════════════════

    const {
      fn,
      label
    } = CONFIGS[tipo]


    // ═════════════════════════════════
    // ✰ PROCESANDO
    // ═════════════════════════════════

    await m.reply(
`༺ ✰ 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙲𝚘𝚗𝚏𝚒𝚐𝚞𝚛𝚊𝚌𝚒𝚘́𝚗: *${label}*
> ✰ 𝚅𝚊𝚕𝚘𝚛: *${OPCIONES[valor]}*`
    )


    // ═════════════════════════════════
    // ✰ ACTUALIZAR PRIVACIDAD
    // ═════════════════════════════════

    if (
      typeof conn[fn] !== 'function'
    ) {

      throw new Error(
        `Método ${fn} no disponible`
      )

    }


    await conn[fn](valor)


    // ═════════════════════════════════
    // ✰ ÉXITO
    // ═════════════════════════════════

    return m.reply(
`༺ ✰ 𝙿𝚁𝙸𝚅𝙰𝙲𝙸𝙳𝙰𝙳 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙰 ✰ ༻

> ✰ 𝙲𝚘𝚗𝚏𝚒𝚐𝚞𝚛𝚊𝚌𝚒𝚘́𝚗: *${label}*
> ✰ 𝙽𝚞𝚎𝚟𝚘 𝚟𝚊𝚕𝚘𝚛: *${OPCIONES[valor]}*

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`
    )

  } catch (error) {

    // ═════════════════════════════════
    // ✰ ERROR
    // ═════════════════════════════════

    console.error(
      '[PRIVACIDAD]',
      error?.message || error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚛 𝚕𝚊 𝚙𝚛𝚒𝚟𝚊𝚌𝚒𝚍𝚊𝚍.

> ✰ 𝚅𝚎𝚛𝚒𝚏𝚒𝚌𝚊́ 𝚚𝚞𝚎 𝚕𝚊 𝚌𝚘𝚗𝚏𝚒𝚐𝚞𝚛𝚊𝚌𝚒𝚘́𝚗 𝚜𝚎𝚊 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'privacidad <config> <valor>',
  'privacy <config> <valor>'
]

handler.command = [
  'privacidad',
  'privacy'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler