import fs from 'fs'
import path from 'path'
import config from '../../config.js'


// ═════════════════════════════════════
// ✦ SAITAMABOT • ADD OWNER
// ═════════════════════════════════════

const OWNERS_FILE =
  path.resolve(
    process.cwd(),
    'owners.json'
  )


// ═════════════════════════════════════
// ✦ PROPIETARIOS PRINCIPALES
// ═════════════════════════════════════

if (!global.principalOwnersSaved) {

  global.principalOwnersSaved = [
    ...config.ownerNumber
  ]

}

const principalOwners =
  global.principalOwnersSaved


// ═════════════════════════════════════
// ✦ CARGAR SUB-OWNERS
// ═════════════════════════════════════

if (fs.existsSync(OWNERS_FILE)) {

  try {

    const extraOwners =
      JSON.parse(
        fs.readFileSync(
          OWNERS_FILE,
          'utf8'
        )
      )

    if (Array.isArray(extraOwners)) {

      for (const num of extraOwners) {

        if (
          !config.ownerNumber.includes(num)
        ) {

          config.ownerNumber.push(num)

        }

      }

    }

  } catch (error) {

    console.error(
      '[ADDOWNER LOAD]',
      error?.message ||
      error
    )

  }

}


// ═════════════════════════════════════
// ✦ EXTRAER NÚMERO
// ═════════════════════════════════════

const extraerNum = (jid = '') => {

  return typeof jid === 'string'
    ? jid
        .split('@')[0]
        .split(':')[0]
        .replace(/\D/g, '')
    : ''

}


// ═════════════════════════════════════
// ✦ RESOLVER USUARIO
// ═════════════════════════════════════

const resolveTargetJid = (
  m,
  participants = [],
  text = ''
) => {

  // ✦ Mención

  if (m.mentionedJid?.[0]) {
    return m.mentionedJid[0]
  }


  // ✦ Mensaje respondido

  if (m.quoted?.sender) {
    return m.quoted.sender
  }


  // ✦ Número escrito

  const textNum =
    text.replace(/\D/g, '')

  if (textNum) {
    return `${textNum}@s.whatsapp.net`
  }


  return null

}


// ═════════════════════════════════════
// ✦ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    text,
    usedPrefix,
    command,
    participants
  }
) => {

  try {

    // ═══════════════════════════════
    // ✦ VERIFICAR CREADOR PRINCIPAL
    // ═══════════════════════════════

    const senderNum =
      extraerNum(m.sender)


    if (
      !principalOwners.includes(senderNum) &&
      senderNum !== '5493772455367'
    ) {

      return m.reply(
`༺ ✦ 𝙰𝙲𝙲𝙴𝚂𝙾 𝙳𝙴𝙽𝙴𝙶𝙰𝙳𝙾 ✦ ༻

> ✦ Solo los *Creadores Principales* del bot pueden otorgar privilegios de Owner.

> ✦ No tienes permisos para utilizar este comando.`
      )

    }


    // ═══════════════════════════════
    // ✦ BUSCAR USUARIO
    // ═══════════════════════════════

    const targetJid =
      resolveTargetJid(
        m,
        participants,
        text
      )


    if (!targetJid) {

      return m.reply(
`༺ ✦ 𝚄𝚂𝙾 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✦ ༻

> ✦ Menciona a un usuario.
> ✦ O responde a su mensaje.
> ✦ También puedes escribir su número.

༺ ✦ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✦ ༻

> ✦ ${usedPrefix}${command} @usuario
> ✦ ${usedPrefix}${command} 519XXXXXXXX`
      )

    }


    // ═══════════════════════════════
    // ✦ OBTENER NÚMERO
    // ═══════════════════════════════

    const newOwner =
      extraerNum(targetJid)


    if (!newOwner) {

      return m.reply(
`༺ ✦ 𝙽𝚄́𝙼𝙴𝚁𝙾 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙾 ✦ ༻

> ✦ No se pudo identificar el número del usuario.`
      )

    }


    // ═══════════════════════════════
    // ✦ COMPROBAR OWNER EXISTENTE
    // ═══════════════════════════════

    if (
      config.ownerNumber.includes(newOwner)
    ) {

      return m.reply(
`༺ ✦ 𝚈𝙰 𝙴𝚂 𝙾𝚆𝙽𝙴𝚁 ✦ ༻

> ✦ El número *+${newOwner}* ya tiene privilegios de Owner.`
      )

    }


    // ═══════════════════════════════
    // ✦ AGREGAR OWNER EN MEMORIA
    // ═══════════════════════════════

    config.ownerNumber.push(
      newOwner
    )


    // ═══════════════════════════════
    // ✦ CARGAR OWNERS.JSON
    // ═══════════════════════════════

    let extraOwners = []

    if (
      fs.existsSync(OWNERS_FILE)
    ) {

      try {

        const data =
          JSON.parse(
            fs.readFileSync(
              OWNERS_FILE,
              'utf8'
            )
          )

        if (Array.isArray(data)) {
          extraOwners = data
        }

      } catch {

        extraOwners = []

      }

    }


    // ═══════════════════════════════
    // ✦ EVITAR DUPLICADOS
    // ═══════════════════════════════

    if (
      !extraOwners.includes(newOwner)
    ) {

      extraOwners.push(
        newOwner
      )

    }


    // ═══════════════════════════════
    // ✦ GUARDAR OWNER
    // ═══════════════════════════════

    fs.writeFileSync(
      OWNERS_FILE,
      JSON.stringify(
        extraOwners,
        null,
        2
      )
    )


    // ═══════════════════════════════
    // ✦ RESPUESTA
    // ═══════════════════════════════

    return m.reply(
`༺ ✦ 𝙽𝚄𝙴𝚅𝙾 𝙾𝚆𝙽𝙴𝚁 ✦ ༻
> ✦ 👤 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${newOwner}
> ✦ 👑 𝙿𝚛𝚒𝚟𝚒𝚕𝚎𝚐𝚒𝚘𝚜: *Owner*
> ✦ 📁 𝚁𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚘 𝚎𝚗:
> *owners.json*

༺ ✦ 𝙰𝙳𝙼𝙸𝙽𝙸𝚂𝚃𝚁𝙰𝙲𝙸𝙾́𝙽 ✦ ༻

> ✦ El usuario ahora tiene privilegios administrativos del bot.`,
      {
        mentions: [
          targetJid
        ]
      }
    )

  } catch (error) {

    console.error(
      '[ADDOWNER]',
      error?.message ||
      error
    )

    return m.reply(
`༺ ✦ 𝙴𝚁𝚁𝙾𝚁 ✦ ༻

> ✦ No se pudo agregar al nuevo Owner.
> ✦ Intenta nuevamente.`
    )

  }

}


// ═════════════════════════════════════
// ✦ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'addowner @user',
  'agregarowner @user',
  'darowner @user'
]

handler.command = [
  'addowner',
  'agregarowner',
  'darowner'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler