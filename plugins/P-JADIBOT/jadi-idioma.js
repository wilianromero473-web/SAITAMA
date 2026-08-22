import {
  getSubBotMeta,
  saveSubBotMeta
} from '../../lib/jadibot.js'

// ═════════════════════════════════════
// ✰ SAITAMABOT • IDIOMA SUB-BOT
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn: zen,
    args,
    usedPrefix,
    command
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ VERIFICAR SUB-BOT
    // ═══════════════════════════════

    if (!zen.isSubBot) {

      return m.reply(
`༺ ✰ 𝙸𝙳𝙸𝙾𝙼𝙰 ✰ ༻

> ✰ 𝙴𝚜𝚝𝚎 𝚌𝚘𝚖𝚊𝚗𝚍𝚘 𝚜𝚘𝚕𝚘 𝚏𝚞𝚗𝚌𝚒𝚘𝚗𝚊 𝚎𝚗 𝚂𝚞𝚋-𝙱𝚘𝚝𝚜.`
      )

    }


    // ═══════════════════════════════
    // ✰ VERIFICAR DUEÑO
    // ═══════════════════════════════

    const sender =
      String(m.sender || '')
        .replace(/\D/g, '')

    const owner =
      String(zen.ownerNumber || '')
        .replace(/\D/g, '')


    if (
      !sender ||
      !owner ||
      sender !== owner
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙿𝙴𝚁𝙼𝙸𝚂𝙾𝚂 ✰ ༻

> ✰ 𝚂𝚘𝚕𝚘 𝚎𝚕 𝚍𝚞𝚎ñ𝚘 𝚍𝚎𝚕 𝚂𝚞𝚋-𝙱𝚘𝚝 𝚙𝚞𝚎𝚍𝚎 𝚌𝚊𝚖𝚋𝚒𝚊𝚛 𝚎𝚕 𝚒𝚍𝚒𝚘𝚖𝚊.`
      )

    }


    // ═══════════════════════════════
    // ✰ IDIOMAS DISPONIBLES
    // ═══════════════════════════════

    const idiomas = {

      es: '🇪🇸 Español',

      en: '🇺🇸 Inglés',

      fr: '🇫🇷 Francés',

      no: '🇳🇴 Noruego',

      de: '🇩🇪 Alemán',

      it: '🇮🇹 Italiano',

      pt: '🇧🇷 Portugués',

      ru: '🇷🇺 Ruso',

      ja: '🇯🇵 Japonés',

      ko: '🇰🇷 Coreano',

      zh: '🇨🇳 Chino',

      ar: '🇸🇦 Árabe',

      nl: '🇳🇱 Holandés',

      tr: '🇹🇷 Turco',

      id: '🇮🇩 Indonesio'

    }


    // ═══════════════════════════════
    // ✰ OBTENER IDIOMA
    // ═══════════════════════════════

    const idioma =
      String(
        args[0] || ''
      )
        .toLowerCase()
        .trim()


    // ═══════════════════════════════
    // ✰ MOSTRAR IDIOMAS
    // ═══════════════════════════════

    if (
      !idioma ||
      !idiomas[idioma]
    ) {

      const listaIdiomas =
        Object.entries(idiomas)
          .map(
            ([codigo, nombre]) =>
              `> ✰ ${nombre} (${codigo})`
          )
          .join('\n')


      return m.reply(
`༺ ✰ 𝙸𝙳𝙸𝙾𝙼𝙰𝚂 ✰ ༻

${listaIdiomas}

༺ ✰ 𝚄𝚂𝙾 ✰ ༻

> ✰ ${usedPrefix}${command} en

> ✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
> ✰ ${usedPrefix}${command} es`
      )

    }


    // ═══════════════════════════════
    // ✰ OBTENER METADATOS
    // ═══════════════════════════════

    const meta =
      await getSubBotMeta()


    if (
      !meta[zen.ownerNumber]
    ) {

      meta[zen.ownerNumber] = {}

    }


    // ═══════════════════════════════
    // ✰ GUARDAR IDIOMA
    // ═══════════════════════════════

    meta[
      zen.ownerNumber
    ].language = idioma


    await saveSubBotMeta(
      meta
    )


    // ═══════════════════════════════
    // ✰ CONFIRMACIÓN
    // ═══════════════════════════════

    return m.reply(
`༺ ✰ 𝙸𝙳𝙸𝙾𝙼𝙰 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙽𝚞𝚎𝚟𝚘 𝚒𝚍𝚒𝚘𝚖𝚊:
> ✰ ${idiomas[idioma]}

> ✰ 𝙲ó𝚍𝚒𝚐𝚘: ${idioma}

༺ ✰ 𝚂𝚞𝚋-𝙱𝚘𝚝 ✰ ༻`
    )

  } catch (error) {

    // ═══════════════════════════════
    // ✰ ERROR
    // ═══════════════════════════════

    console.error(
      '[IDIOMA]',
      error?.message || error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚛 𝚎𝚕 𝚒𝚍𝚒𝚘𝚖𝚊.

> ✰ 𝙸𝚗𝚝é𝚗𝚝𝚊𝚕𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'idioma <código>',
  'language <código>',
  'setlang <código>'
]

handler.tags = [
  'jadibot'
]

handler.command = [
  'idioma',
  'language',
  'setlang'
]

handler.noRegister = true

export default handler