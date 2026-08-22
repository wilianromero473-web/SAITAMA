import { subBots } from '../../lib/jadibot.js'
import config from '../../config.js'

// ═════════════════════════════════════
// ✰ SAITAMABOT • LISTA DE SUB-BOTS
// ═════════════════════════════════════

const handler = async (
  m,
  {
    usedPrefix
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ VERIFICAR SUB-BOTS
    // ═══════════════════════════════

    if (
      !subBots ||
      subBots.size === 0
    ) {

      return m.reply(
`༺ ✰ 𝚂𝚄𝙱-𝙱𝙾𝚃𝚂 ✰ ༻

> ✰ 𝙽𝚘 𝚑𝚊𝚢 𝚗𝚒𝚗𝚐ú𝚗 𝚂𝚞𝚋-𝙱𝚘𝚝 𝚊𝚌𝚝𝚒𝚟𝚘 𝚎𝚗 𝚎𝚜𝚝𝚎 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.

༺ ✰ 𝙻𝙸𝚂𝚃𝙰 𝚅𝙰𝙲Í𝙰 ✰ ༻`
      )

    }


    // ═══════════════════════════════
    // ✰ INFORMACIÓN
    // ═══════════════════════════════

    const limite =
      config.limiteSubbots || 30

    let text =
`༺ ✰ 𝚂𝚄𝙱-𝙱𝙾𝚃𝚂 ✰ ༻

> ✰ 𝙲𝚘𝚗𝚎𝚌𝚝𝚊𝚍𝚘𝚜: ${subBots.size}/${limite}

`


    // ═══════════════════════════════
    // ✰ LISTA DE SUB-BOTS
    // ═══════════════════════════════

    let count = 1

    for (
      const [numero] of subBots.entries()
    ) {

      text +=
        `> ✰ ${count}. wa.me/${numero}\n`

      count++

    }


    // ═══════════════════════════════
    // ✰ PIE DEL MENSAJE
    // ═══════════════════════════════

    text +=
`
༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻

> ✰ 𝚄𝚜𝚊 *${usedPrefix}serbot* 𝚙𝚊𝚛𝚊 𝚊𝚕𝚘𝚓𝚊𝚛 𝚎𝚕 𝚝𝚞𝚢𝚘.`


    // ═══════════════════════════════
    // ✰ ENVIAR
    // ═══════════════════════════════

    return m.reply(text)

  } catch (error) {

    console.error(
      '[SUB-BOTS]',
      error?.message || error
    )

    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚘𝚋𝚝𝚎𝚗𝚎𝚛 𝚕𝚊 𝚕𝚒𝚜𝚝𝚊 𝚍𝚎 𝚂𝚞𝚋-𝙱𝚘𝚝𝚜.

> ✰ 𝙸𝚗𝚝é𝚗𝚝𝚊𝚕𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'bots',
  'listabots',
  'subbots'
]

handler.tags = [
  'jadibot'
]

handler.command = [
  'bots',
  'listabots',
  'subbots'
]

handler.noRegister = true

export default handler