import path from 'path'
import fs from 'fs'
import {
  startSubBot,
  subBots
} from '../../lib/jadibot.js'

// ═════════════════════════════════════
// ✰ SAITAMABOT • SERBOT
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn: zen,
    usedPrefix,
    command
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ SOLO BOT PRINCIPAL
    // ═══════════════════════════════

    if (zen.isSubBot) {

      const mainNum =
        zen.mainBotNumber

      return m.reply(
`༺ ✰ 𝚂𝙴𝚁𝙱𝙾𝚃 ✰ ༻

> ✰ 𝙴𝚜𝚝𝚎 𝚌𝚘𝚖𝚊𝚗𝚍𝚘 𝚜𝚘𝚕𝚘 𝚜𝚎 𝚙𝚞𝚎𝚍𝚎 𝚞𝚜𝚊𝚛 𝚎𝚗 𝚎𝚕 𝚋𝚘𝚝 𝚙𝚛𝚒𝚗𝚌𝚒𝚙𝚊𝚕.

༺ ✰ 𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚊𝚕 𝚋𝚘𝚝 𝚘𝚏𝚒𝚌𝚒𝚊𝚕 ✰ ༻

> ✰ wa.me/${mainNum}?text=${usedPrefix}${command}`
      )

    }


    // ═══════════════════════════════
    // ✰ NÚMERO DEL USUARIO
    // ═══════════════════════════════

    const numero =
      m.sender
        .split('@')[0]


    // ═══════════════════════════════
    // ✰ SESIÓN YA ACTIVA
    // ═══════════════════════════════

    if (
      subBots.has(numero)
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙴𝚂𝙸Ó𝙽 𝙰𝙲𝚃𝙸𝚅𝙰 ✰ ༻

> ✰ 𝚈𝚊 𝚝𝚎𝚗é𝚜 𝚞𝚗 𝚂𝚞𝚋-𝙱𝚘𝚝 𝚏𝚞𝚗𝚌𝚒𝚘𝚗𝚊𝚗𝚍𝚘.

> ✰ 𝚄𝚜á *${usedPrefix}stopbot* 𝚙𝚊𝚛𝚊 𝚍𝚎𝚝𝚎𝚗𝚎𝚛𝚕𝚘.`
      )

    }


    // ═══════════════════════════════
    // ✰ RUTA DE SESIÓN
    // ═══════════════════════════════

    const sessionPath =
      path.join(
        './sessions/subbots',
        numero
      )


    const credsPath =
      path.join(
        sessionPath,
        'creds.json'
      )


    const hasSession =
      fs.existsSync(
        credsPath
      )


    // ═══════════════════════════════
    // ✰ MENSAJE INICIAL
    // ═══════════════════════════════

    if (hasSession) {

      await m.reply(
`༺ ✰ 𝚁𝙴𝙲𝙾𝙽𝙴𝙲𝚃𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙴𝚜𝚝𝚊 𝚜𝚎𝚜𝚒ó𝚗 𝚢𝚊 𝚎𝚡𝚒𝚜𝚝𝚎.
> ✰ 𝙻𝚎𝚟𝚊𝚗𝚝𝚊𝚗𝚍𝚘 𝚝𝚞 𝚂𝚞𝚋-𝙱𝚘𝚝...
> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
      )

    } else {

      await m.reply(
`༺ ✰ 𝙲𝙾𝙽𝙴𝙲𝚃𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙽ú𝚖𝚎𝚛𝚘: +${numero}
> ✰ 𝙶𝚎𝚗𝚎𝚛𝚊𝚗𝚍𝚘 𝚌ó𝚍𝚒𝚐𝚘 𝚍𝚎 𝚟𝚒𝚗𝚌𝚞𝚕𝚊𝚌𝚒ó𝚗...
> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
      )

    }


    // ═══════════════════════════════
    // ✰ INICIAR SUB-BOT
    // ═══════════════════════════════

    const resultado =
      await startSubBot(
        zen,
        numero,
        m
      )


    // ═══════════════════════════════
    // ✰ CÓDIGO DEVUELTO
    // ═══════════════════════════════

    const codigo =
      typeof resultado === 'string'
        ? resultado
        : resultado?.code ||
          resultado?.pairingCode ||
          resultado?.codigo ||
          null


    // ═══════════════════════════════
    // ✰ SI HAY CÓDIGO
    // ═══════════════════════════════

    if (codigo) {

      const codigoLimpio =
        String(codigo)
          .replace(/\s+/g, '')
          .trim()


      // ═══════════════════════════
      // ✰ MENSAJE CON TUTORIAL
      // ═══════════════════════════

      const tutorial =
`༺ ✰ 𝚂𝚄𝙱-𝙱𝙾𝚃 𝙻𝙸𝚂𝚃𝙾 ✰ ༻

> ✰ 𝙲ó𝚍𝚒𝚐𝚘 𝚍𝚎 𝚟𝚒𝚗𝚌𝚞𝚕𝚊𝚌𝚒ó𝚗:

*${codigoLimpio}*

༺ ✰ 𝚃𝚄𝚃𝙾𝚁𝙸𝙰𝙻 ✰ ༻

> 1. 𝙰𝚋𝚛𝚎 *WhatsApp*.
> 2. 𝙴𝚗𝚝𝚛𝚊 𝚊 *𝙰𝚓𝚞𝚜𝚝𝚎𝚜*.
> 3. 𝚅𝚎 𝚊 *𝙳𝚒𝚜𝚙𝚘𝚜𝚒𝚝𝚒𝚟𝚘𝚜 𝚟𝚒𝚗𝚌𝚞𝚕𝚊𝚍𝚘𝚜*.
> 4. 𝙿𝚞𝚕𝚜𝚊 *𝚅𝚒𝚗𝚌𝚞𝚕𝚊𝚛 𝚞𝚗 𝚍𝚒𝚜𝚙𝚘𝚜𝚒𝚝𝚒𝚟𝚘*.
> 5. 𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚎𝚕 𝚌ó𝚍𝚒𝚐𝚘.

༺ ✰ 𝙽𝙾𝚃𝙰 ✰ ༻

> ✰ 𝙽𝚘 𝚌𝚘𝚖𝚙𝚊𝚛𝚝𝚊𝚜 𝚎𝚕 𝚌ó𝚍𝚒𝚐𝚘 𝚌𝚘𝚗 𝚘𝚝𝚛𝚊𝚜 𝚙𝚎𝚛𝚜𝚘𝚗𝚊𝚜.
> ✰ 𝙴𝚕 𝚌ó𝚍𝚒𝚐𝚘 𝚎𝚜 𝚜𝚘𝚕𝚘 𝚙𝚊𝚛𝚊 𝚝𝚞 𝚗ú𝚖𝚎𝚛𝚘.`


      // ═══════════════════════════
      // ✰ BOTÓN COPIAR
      // ═══════════════════════════
      
      try {

        return await conn.sendMessage(
          m.chat,
          {
            text: tutorial,

            buttons: [
              {
                buttonId:
                  codigoLimpio,

                buttonText: {
                  displayText:
                    '✰ 𝙲𝙾𝙿𝙸𝙰𝚁 𝙲Ó𝙳𝙸𝙶𝙾'
                },

                type: 1
              }
            ],

            headerType: 1
          },
          {
            quoted: m
          }
        )

      } catch {

        return m.reply(
          tutorial
        )

      }

    }


    // ═══════════════════════════════
    // ✰ SI NO DEVUELVE CÓDIGO
    // ═══════════════════════════════

    return m.reply(
`༺ ✰ 𝙲𝙾𝙽𝙴𝙲𝚃𝙰𝙳𝙾 ✰ ༻

> ✰ 𝚂𝚎 𝚒𝚗𝚒𝚌𝚒ó 𝚎𝚕 𝚙𝚛𝚘𝚌𝚎𝚜𝚘 𝚍𝚎 𝚟𝚒𝚗𝚌𝚞𝚕𝚊𝚌𝚒ó𝚗.

> ✰ 𝚁𝚎𝚟𝚒𝚜𝚊 𝚎𝚕 𝚌ó𝚍𝚒𝚐𝚘 𝚚𝚞𝚎 𝚎𝚗𝚟í𝚊 𝚎𝚕 𝚜𝚒𝚜𝚝𝚎𝚖𝚊.`
    )

  } catch (error) {

    console.error(
      '[SERBOT]',
      error?.message || error
    )

    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚒𝚗𝚒𝚌𝚒𝚊𝚛 𝚝𝚞 𝚂𝚞𝚋-𝙱𝚘𝚝.

> ✰ 𝙸𝚗𝚝é𝚗𝚝𝚊𝚕𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'serbot',
  'jadibot',
  'subbot',
  'code'
]

handler.tags = [
  'jadibot'
]

handler.command = [
  'serbot',
  'jadibot',
  'subbot',
  'code'
]

handler.noRegister = true

export default handler