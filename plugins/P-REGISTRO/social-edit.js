import User from '../../lib/database/models/zen-users.js'

const handler = async (
  m,
  {
    text,
    usedPrefix,
    command
  }
) => {

  const u = await User.findOne({
    jid: m.sender
  }).lean()

  if (!u) {
    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ No se encontró tu registro.`
    )
  }

  const validKeys = {
    bio: 'bio',
    apodo: 'nickname',
    pais: 'country',
    cancion: 'song',
    color: 'color',
    comida: 'food',
    signo: 'zodiac',
    cumple: 'birthday'
  }

  const input =
    text?.trim() || ''

  const args =
    input.split(/\s+/)

  const keyInput =
    args[0]?.toLowerCase()

  const val =
    args.slice(1).join(' ').trim()

  if (
    !keyInput ||
    !validKeys[keyInput]
  ) {

    let help =
`༺ ✰ 𝙴𝙳𝙸𝚃𝙾𝚁 𝙳𝙴 𝙿𝙴𝚁𝙵𝙸𝙻 ✰ ༻

> ✰ 𝚄𝚜𝚘:
> ${usedPrefix + command} <categoría> <texto>

༺ ✰ 𝙲𝙰𝚃𝙴𝙶𝙾𝚁Í𝙰𝚂 ✰ ༻
`

    Object.keys(validKeys).forEach(
      key => {
        help +=
`> ✰ ${key}
`
      }
    )

    help +=
`
༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ ${usedPrefix + command} bio Amante de los bots
> ✰ ${usedPrefix + command} apodo Saitama

༺ ✰ 𝙿𝙰𝚁𝙰 𝙱𝙾𝚁𝚁𝙰𝚁 ✰ ༻

> ✰ ${usedPrefix + command} bio none
> ✰ También puedes usar: quitar, borrar o delete`

    return m.reply(help)
  }

  if (!val) {
    return m.reply(
`༺ ✰ 𝙵𝙰𝙻𝚃𝙰 𝙴𝙻 𝚅𝙰𝙻𝙾𝚁 ✰ ༻

> ✰ Uso:
> ${usedPrefix + command} ${keyInput} <texto>`
    )
  }

  const dbKey =
    validKeys[keyInput]

  const isDelete =
    [
      'none',
      'quitar',
      'borrar',
      'delete'
    ].includes(
      val.toLowerCase()
    )

  await User.updateOne(
    {
      jid: m.sender
    },
    {
      $set: {
        [`social.${dbKey}`]:
          isDelete
            ? ''
            : val
      }
    }
  )

  return m.reply(
`༺ ✰ 𝙿𝙴𝚁𝙵𝙸𝙻 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙲𝚊𝚝𝚎𝚐𝚘𝚛í𝚊: ${keyInput}
> ✰ 𝙴𝚜𝚝𝚊𝚍𝚘: ${isDelete ? 'Eliminado' : 'Actualizado'}

> ✰ Tu información fue ${isDelete ? 'eliminada' : 'actualizada'} correctamente.

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`
  )
}

handler.help = [
  'editperfil'
]

handler.tags = [
  'registro'
]

handler.command = [
  'set',
  'editperfil',
  'setperfil'
]

handler.register = true

export default handler