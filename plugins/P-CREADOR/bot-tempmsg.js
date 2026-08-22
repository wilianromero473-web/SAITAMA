// ═════════════════════════════════════
// ✰ SAITAMABOT • MENSAJES TEMPORALES
// ═════════════════════════════════════

const DURACIONES = {

  '0': {
    label: 'Desactivado',
    secs: 0
  },

  '1d': {
    label: '24 horas',
    secs: 86400
  },

  '7d': {
    label: '7 días',
    secs: 604800
  },

  '90d': {
    label: '90 días',
    secs: 7776000
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
    // ✰ OBTENER OPCIÓN
    // ═════════════════════════════════

    const opcion =
      args[0]?.toLowerCase()


    // ═════════════════════════════════
    // ✰ MOSTRAR AYUDA
    // ═════════════════════════════════

    if (
      !opcion ||
      !DURACIONES[opcion]
    ) {

      const lista =
        Object.entries(DURACIONES)
          .map(
            ([k, v]) =>
              `> ✰ *${k}* — ${v.label}`
          )
          .join('\n')


      return m.reply(
`༺ ✰ 𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂 𝚃𝙴𝙼𝙿𝙾𝚁𝙰𝙻𝙴𝚂 ✰ ༻

༺ ✰ 𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽𝙴𝚂 ✰ ༻

${lista}

༺ ✰ 𝚄𝚂𝙾 ✰ ༻

> ✰ *${usedPrefix}${command} <opción>*

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾𝚂 ✰ ༻

> ✰ *${usedPrefix}${command} 1d*
> ✰ *${usedPrefix}${command} 7d*
> ✰ *${usedPrefix}${command} 0*`
      )

    }


    // ═════════════════════════════════
    // ✰ DATOS
    // ═════════════════════════════════

    const {
      label,
      secs
    } = DURACIONES[opcion]


    // ═════════════════════════════════
    // ✰ PROCESANDO
    // ═════════════════════════════════

    await m.reply(
`༺ ✰ 𝙰𝙿𝙻𝙸𝙲𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙼𝚘𝚍𝚘: *${label}*
> ✰ 𝙳𝚞𝚛𝚊𝚌𝚒𝚘́𝚗: *${secs === 0 ? 'Desactivado' : `${secs} segundos`}*`
    )


    // ═════════════════════════════════
    // ✰ ACTUALIZAR CONFIGURACIÓN
    // ═════════════════════════════════

    if (
      typeof conn.updateDefaultDisappearingMode !== 'function'
    ) {

      throw new Error(
        'updateDefaultDisappearingMode no está disponible'
      )

    }


    await conn.updateDefaultDisappearingMode(
      secs
    )


    // ═════════════════════════════════
    // ✰ RESPUESTA
    // ═════════════════════════════════

    if (secs === 0) {

      return m.reply(
`༺ ✰ 𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂 𝚃𝙴𝙼𝙿𝙾𝚁𝙰𝙻𝙴𝚂 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾𝚂 ✰ ༻

> ✰ Los nuevos mensajes ya no tendrán duración temporal.

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`
      )

    }


    return m.reply(
`༺ ✰ 𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂 𝚃𝙴𝙼𝙿𝙾𝚁𝙰𝙻𝙴𝚂 𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾𝚂 ✰ ༻

> ✰ 𝙳𝚞𝚛𝚊𝚌𝚒𝚘́𝚗: *${label}*
> ✰ 𝚃𝚒𝚎𝚖𝚙𝚘: *${secs} segundos*

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`
    )


  } catch (error) {

    // ═════════════════════════════════
    // ✰ ERROR
    // ═════════════════════════════════

    console.error(
      '[MENSAJES TEMPORALES]',
      error?.message || error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚊𝚖𝚋𝚒𝚊𝚛 𝚕𝚊 𝚌𝚘𝚗𝚏𝚒𝚐𝚞𝚛𝚊𝚌𝚒𝚘́𝚗.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'tempmsg <duracion>',
  'desaparecer <duracion>',
  'disappear <duracion>'
]

handler.command = [
  'tempmsg',
  'desaparecer',
  'disappear'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler