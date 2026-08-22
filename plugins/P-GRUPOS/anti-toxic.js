const DEFAULT_PALABRAS = [
  "puta","mierda","cabrón","idiota","pendejo","imbécil","estúpido","tarado",
  "gilipollas","pelotudo","forro","boludo","culiao","hdp","hijo de puta",
  "concha","pija","verga","choto","maricón","puto","zorra","perra","cagón",
  "cagon","sorete","inutil","baboso","patán","payaso","ridículo","tonto",
  "bobo","menso","weon","huevon","cp","pendeja","cabrona","mierdoso",
  "asqueroso","malparido","coño","carajo","chingada","chingado","chingar",
  "culero","culera","maldito","maldita","malnacido","malnacida","estupida",
  "idiotas","idiot","estupidos","imbeciles","estúpidos","estúpidas",
  "tarados","pelotudos","forros","boludos","culiaos","maricas","maricones",
  "putas","putos","zorras","perras","cagones","soretes","babosos","patanes",
  "payasos","ridículos","bobos","mensos","pene","nepe","gore","mierdosos",
  "asquerosos","malparidos","culeros","culeras","malditos","malditas",
  "malnacidos","malnacidas","pajero","pajeros","pajera","cállate","cornudo",
  "cornuda","cornudos","cornudas","chupapija","chupapijas","chupaverga",
  "chupaculo","chupaculos","chupapollas","chupapolla","chupapollos",
  "cojudo","cojuda","cojudos","cojudas","imbecil","mrd","imbeciles",
  "imbecilidades","estupidez","estupideces","idiotez","idioteces","taradez",
  "taradeces","gil","giles","gilazo","gilazos","ano","anal","mongólico",
  "mongólica","mongólicos","mongólicas","mongolo","mongola","mongolos",
  "mongolas","animal","animales","basura","basurita","burro","burros",
  "burra","burras","feo","matate","putita","putito","cerdo","cerdos","cerda",
  "cerdas","chancho","chanchos","chancha","chanchas","perro","perros","rata",
  "ratas","ratón","ratones","ratona","ratonas","hdpt","suicídate","estorbo",
  "salame","bitch","víbora","víboras","gay","lesbiana"
]

const MAX_WARNS_TOX = 5

function esToxic(texto) {
  if (!texto) return false

  const t = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return DEFAULT_PALABRAS.some(p => {
    const pn = p
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    return new RegExp(`\\b${pn}\\b`, 'i').test(t)
  })
}

const handler = async (m, { args, groupDb, usedPrefix, command }) => {

  const modo = args[0]?.toLowerCase()

  const modosValidos = [
    'on', '1', 'true', 'activar',
    'off', '0', 'false', 'desactivar'
  ]

  if (!modosValidos.includes(modo)) {
    return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸 𝚃𝙾𝚇𝙸𝙲 ✰ ༻

> ✰ Usá: *${usedPrefix}${command} on | off*
> ✰ Ejemplo: *${usedPrefix}${command} on*`
    )
  }

  const activar = [
    'on',
    '1',
    'true',
    'activar'
  ].includes(modo)

  groupDb.antitoxic = activar
  await groupDb.save()

  return m.reply(
`༺ ✰ 𝙰𝙽𝚃𝙸 𝚃𝙾𝚇𝙸𝙲 ✰ ༻

> ✰ Estado: *${activar ? 'ACTIVADO' : 'DESACTIVADO'}*
> ✰ Protección contra lenguaje tóxico ${activar ? 'activada' : 'desactivada'}.`
  )
}

handler.before = async (
  m,
  { conn, isAdmin, isOwner, groupDb, userDb }
) => {

  if (
    !m.isGroup ||
    m.fromMe ||
    isAdmin ||
    isOwner ||
    !groupDb?.antitoxic
  ) return false

  if (!m.text || !esToxic(m.text)) return false

  const sender = m.sender
  const nombre = sender.split('@')[0]

  try {
    await conn.sendMessage(m.chat, {
      delete: m.key
    })
  } catch {}

  if (!userDb) return true

  userDb.warnTox = (userDb.warnTox || 0) + 1

  if (userDb.warnTox >= MAX_WARNS_TOX) {

    userDb.warnTox = 0
    await userDb.save()

    try {
      await conn.groupParticipantsUpdate(
        m.chat,
        [sender],
        'remove'
      )
    } catch {}

    await conn.sendMessage(m.chat, {
      text:
`༺ ✰ 𝙱𝙰𝙽 ✰ ༻

> ✰ @${nombre} fue expulsado.
> ✰ Motivo: lenguaje tóxico.
> ✰ Advertencias acumuladas: *${MAX_WARNS_TOX}/${MAX_WARNS_TOX}*`,
      mentions: [sender]
    })

  } else {

    await userDb.save()

    await conn.sendMessage(m.chat, {
      text:
`༺ ✰ 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰 ✰ ༻

> ✰ @${nombre}, tu mensaje fue eliminado.
> ✰ Motivo: lenguaje inapropiado.
> ✰ Advertencia: *${userDb.warnTox}/${MAX_WARNS_TOX}*
> ✰ Al llegar a *${MAX_WARNS_TOX}* serás expulsado.`,
      mentions: [sender]
    })
  }

  return true
}

handler.help = [
  'antitoxic <on/off>'
]

handler.tags = [
  'group'
]

handler.command = [
  'antitoxic'
]

handler.groupOnly = true
handler.adminOnly = true
handler.alwaysBefore = true
handler.noRegister = true

export default handler