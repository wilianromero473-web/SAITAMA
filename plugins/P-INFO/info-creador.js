import PhoneNumber from 'awesome-phonenumber'
import config from '../../config.js'

const handler = async (
  m,
  {
    conn
  }
) => {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📇 REACCIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await m.react('📇').catch(() => {})


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ CONFIGURACIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const ownerNum =
    String(
      config.ownerNumber?.[0] ||
      '51991579415'
    )
      .replace(/\D/g, '')


  const botNum =
    String(
      conn.user?.id ||
      ''
    )
      .split('@')[0]
      .split(':')[0]
      .replace(/\D/g, '')


  const botName =
    config.botName ||
    'SAITAMA-BOT'


  const ownerName =
    config.ownerName ||
    'Owner'


  const region =
    config.ownerRegion ||
    'Perú¹⁴⁵'


  const email =
    config.ownerEmail ||
    'Saitama145@gmail.com'


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📞 NÚMERO DEL CREADOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  let ownerInternational =
    ownerNum


  try {

    ownerInternational =
      PhoneNumber(
        '+' + ownerNum
      ).getNumber(
        'international'
      )

  } catch {}


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🤖 NÚMERO DEL BOT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  let botInternational =
    botNum


  if (botNum) {

    try {

      botInternational =
        PhoneNumber(
          '+' + botNum
        ).getNumber(
          'international'
        )

    } catch {}
  }


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👤 CONTACTO DEL CREADOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const ownerVcard =
`BEGIN:VCARD
VERSION:3.0
N:;${ownerName};;;
FN:${ownerName}
ORG:Creador de ${botName}
TEL;type=CELL;type=VOICE;waid=${ownerNum}:${ownerInternational}
EMAIL;type=INFORME:${email}
ADR:;;${region};;;;
END:VCARD`


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🤖 CONTACTO DEL BOT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const botVcard =
`BEGIN:VCARD
VERSION:3.0
N:;${botName};;;
FN:${botName}
ORG:Bot Oficial
${
  botNum
    ? `TEL;type=CELL;type=VOICE;waid=${botNum}:${botInternational}`
    : ''
}
END:VCARD`


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📇 CONTACTOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const contacts = [

    {
      vcard:
        ownerVcard,

      displayName:
        ownerName
    },

    {
      vcard:
        botVcard,

      displayName:
        botName
    }

  ]


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📤 ENVIAR CONTACTOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await conn.sendMessage(
    m.chat,
    {

      contacts: {

        displayName:
          `Creadores de ${botName}`,

        contacts

      }

    },
    {
      quoted:
        m
    }
  )

}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'creador'
]

handler.command = [
  'owner',
  'creador',
  'dueño',
  'propietario',
  'dono'
]

handler.tags = [
  'info'
]

export default handler