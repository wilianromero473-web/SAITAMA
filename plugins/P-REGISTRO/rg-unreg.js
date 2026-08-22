import User from '../../lib/database/models/zen-users.js'

const handler = async (m, { text, usedPrefix }) => {

  const userDb = await User.findOne({
    jid: m.sender
  })

  if (!userDb) {
    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ No se encontró tu cuenta.`
    )
  }

  if (userDb.serial && userDb.serial !== '') {

    if (!text) {
      return m.reply(
`༺ ✰ 𝙵𝙰𝙻𝚃𝙰 𝚂𝙴𝚁𝙸𝙰𝙻 ✰ ༻

> ✰ Ingresa tu serial para confirmar.
> ✰ Ejemplo: ${usedPrefix}unreg A1B2C3D4E5
> ✰ Si no lo recuerdas, usa ${usedPrefix}serial`
      )
    }

    const serialIngresado =
      text
        .trim()
        .toUpperCase()

    if (
      userDb.serial !== serialIngresado
    ) {
      return m.reply(
`༺ ✰ 𝚂𝙴𝚁𝙸𝙰𝙻 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻

> ✰ El serial ingresado no coincide.
> ✰ Verifica que esté escrito correctamente.
> ✰ También puedes usar ${usedPrefix}serial`
      )
    }
  }

  userDb.registered = false
  userDb.name = ''
  userDb.age = 0
  userDb.serial = ''

  await userDb.save()

  return m.reply(
`༺ ✰ 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾 ✰ ༻

> ✰ Tus datos de registro han sido eliminados.
> ✰ Tu nombre, edad y serial fueron borrados.
> ✰ Ya no tendrás acceso a la economía ni a los comandos que requieren registro.

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`
  )
}

handler.help = [
  'unreg <sn>'
]

handler.tags = [
  'registro'
]

handler.command = [
  'unreg',
  'borrarregistro'
]

handler.register = true

export default handler