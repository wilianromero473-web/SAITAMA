import fs from 'fs'
import path from 'path'
import config from '../../config.js'

// ═══════════════════════════════════════
// ✰ SAITAMABOT • ELIMINAR SUB-OWNER
// ═══════════════════════════════════════

const OWNERS_FILE = path.resolve(
  process.cwd(),
  'owners.json'
)

// ═══════════════════════════════════════
// ✰ CREADORES PRINCIPALES
// ═══════════════════════════════════════

const principalOwners =
  global.principalOwnersSaved ||
  [...config.ownerNumber]

// ═══════════════════════════════════════
// ✰ EXTRAER NÚMERO DEL JID
// ═══════════════════════════════════════

const extraerNum = (jid = '') => {

  return (
    typeof jid === 'string'
      ? jid
      : ''
  )
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '')
}

// ═══════════════════════════════════════
// ✰ RESOLVER USUARIO OBJETIVO
// ═══════════════════════════════════════

const resolveTargetJid = (
  m,
  participants = [],
  text = ''
) => {

  // ✰ Mención
  if (m.mentionedJid?.[0]) {
    return m.mentionedJid[0]
  }

  // ✰ Mensaje respondido
  if (m.quoted?.sender) {
    return m.quoted.sender
  }

  // ✰ Número escrito
  const textNum =
    text.replace(/\D/g, '')

  if (textNum) {
    return `${textNum}@s.whatsapp.net`
  }

  return null
}

// ═══════════════════════════════════════
// ✰ HANDLER
// ═══════════════════════════════════════

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
    // ✰ VERIFICAR CREADOR PRINCIPAL
    // ═══════════════════════════════

    const senderNum =
      extraerNum(m.sender)

    if (
      !principalOwners.includes(senderNum) &&
      senderNum !== '5493772455367'
    ) {

      return m.reply(
`༺ ✰ 𝙰𝙲𝙲𝙴𝚂𝙾 𝙳𝙴𝙽𝙴𝙶𝙰𝙳𝙾 ✰ ༻

> ✰ Solo los *Creadores Principales* pueden eliminar a otros Owners.

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`
      )
    }

    // ═══════════════════════════════
    // ✰ OBTENER USUARIO
    // ═══════════════════════════════

    const targetJid =
      resolveTargetJid(
        m,
        participants,
        text
      )

    if (!targetJid) {

      return m.reply(
`༺ ✰ 𝚄𝚂𝙾 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻

> ✰ Menciona a un usuario.
> ✰ O responde a su mensaje.
> ✰ También puedes escribir su número.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> *${usedPrefix + command} @usuario*
> *${usedPrefix + command} 51999999999*`
      )
    }

    // ═══════════════════════════════
    // ✰ OBTENER NÚMERO
    // ═══════════════════════════════

    const targetNum =
      extraerNum(targetJid)

    if (!targetNum) {

      return m.reply(
`༺ ✰ 𝙽Ú𝙼𝙴𝚁𝙾 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾 ✰ ༻

> ✰ No se pudo identificar al usuario.`
      )
    }

    // ═══════════════════════════════
    // ✰ VERIFICAR SI ES OWNER
    // ═══════════════════════════════

    if (
      !config.ownerNumber.includes(
        targetNum
      )
    ) {

      return m.reply(
`༺ ✰ 𝙽𝙾 𝙴𝚂 𝙾𝚆𝙽𝙴𝚁 ✰ ༻

> ✰ El usuario *@${targetNum}* no se encuentra registrado como Owner.`
      )
    }

    // ═══════════════════════════════
    // ✰ PROTEGER CREADORES PRINCIPALES
    // ═══════════════════════════════

    if (
      principalOwners.includes(
        targetNum
      ) ||
      targetNum === '5493772455367'
    ) {

      return m.reply(
`༺ ✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙳𝙴𝙽𝙴𝙶𝙰𝙳𝙰 ✰ ༻

> ✰ No puedes eliminar a un *Creador Principal*.
> ✰ Este usuario está protegido por el código base.

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`
      )
    }

    // ═══════════════════════════════
    // ✰ ELIMINAR DE CONFIG
    // ═══════════════════════════════

    const index =
      config.ownerNumber.indexOf(
        targetNum
      )

    if (index !== -1) {

      config.ownerNumber.splice(
        index,
        1
      )

    }

    // ═══════════════════════════════
    // ✰ ELIMINAR DE OWNERS.JSON
    // ═══════════════════════════════

    if (
      fs.existsSync(OWNERS_FILE)
    ) {

      try {

        let extraOwners =
          JSON.parse(
            fs.readFileSync(
              OWNERS_FILE,
              'utf8'
            )
          )

        if (!Array.isArray(extraOwners)) {
          extraOwners = []
        }

        extraOwners =
          extraOwners.filter(
            n => n !== targetNum
          )

        fs.writeFileSync(
          OWNERS_FILE,
          JSON.stringify(
            extraOwners,
            null,
            2
          )
        )

      } catch (error) {

        console.error(
          '[DELOWNER JSON]',
          error?.message || error
        )

      }
    }

    // ═══════════════════════════════
    // ✰ CONFIRMACIÓN
    // ═══════════════════════════════

    return m.reply(
`༺ ✰ 𝚂𝚄𝙱-𝙾𝚆𝙽𝙴𝚁 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾 ✰ ༻

> ✰ El usuario *@${targetNum}* fue eliminado correctamente.

༺ ✰ 𝙽𝚄𝙴𝚅𝙾 𝙴𝚂𝚃𝙰𝙳𝙾 ✰ ༻

> ✰ Ya no posee privilegios de Owner.
> ✰ También fue eliminado de *owners.json*.

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`,
      {
        mentions: [
          targetJid
        ]
      }
    )

  } catch (error) {

    console.error(
      '[DELOWNER]',
      error?.message || error
    )

    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ No se pudo eliminar al Sub-Owner.
> ✰ Intenta nuevamente.`
    )
  }
}

// ═══════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═══════════════════════════════════════

handler.help = [
  'delowner @usuario',
  'quitarowner @usuario',
  'removeowner @usuario'
]

handler.command = [
  'delowner',
  'quitarowner',
  'removeowner'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler