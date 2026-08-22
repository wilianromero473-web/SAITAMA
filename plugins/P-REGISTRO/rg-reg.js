import crypto from 'crypto'
import User from '../../lib/database/models/zen-users.js'
import { userCache } from '../../lib/caches.js'

const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

async function getBuffer(url) {
  try {
    const response = await fetch(url)

    if (!response.ok) return null

    const arrayBuffer = await response.arrayBuffer()

    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}

const handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command,
    userDb
  }
) => {

  if (userDb?.registered) {
    return m.reply(
`༺ ✰ 𝚈𝙰 𝙴𝚂𝚃Á𝚂 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙰𝙳𝙾 ✰ ༻

> ✰ Ya tienes un registro activo.
> ✰ No necesitas registrarte nuevamente.`
    )
  }

  if (!text || !Reg.test(text)) {
    return m.reply(
`༺ ✰ 𝙵𝙾𝚁𝙼𝙰𝚃𝙾 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻

> ✰ 𝚄𝚜𝚘: ${usedPrefix + command} nombre.edad
> ✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘: ${usedPrefix + command} Wilian.15`
    )
  }

  let [, name, , age] = text.match(Reg)

  name = name.trim()
  age = parseInt(age)

  if (
    !name ||
    name.length >= 30 ||
    isNaN(age) ||
    age > 100 ||
    age < 5
  ) {
    return m.reply(
`༺ ✰ 𝙳𝙰𝚃𝙾𝚂 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾𝚂 ✰ ༻

> ✰ El nombre debe ser válido.
> ✰ La edad debe estar entre 5 y 100 años.`
    )
  }

  const sn = crypto
    .createHash('md5')
    .update(
      m.sender +
      Date.now() +
      Math.random()
    )
    .digest('hex')
    .slice(0, 10)
    .toUpperCase()

  const isFirstTime =
    !userDb ||
    !userDb.everRegistered

  const num =
    m.sender
      .split('@')[0]
      .split(':')[0]
      .replace(/\D/g, '')

  const jidCanon =
    `${num}@s.whatsapp.net`

  const updateData = {
    name,
    age,
    registered: true,
    everRegistered: true,
    serial: sn
  }

  if (isFirstTime) {
    updateData.genosCoins = 1500
    updateData.genos = 5
    updateData['dailyStats.lastReset'] =
      Date.now()
  }

  const updatedUser =
    await User.findOneAndUpdate(
      {
        jid: {
          $regex: `^${num}@`
        }
      },
      {
        $set: {
          ...updateData,
          jid: jidCanon
        }
      },
      {
        upsert: true,
        new: true
      }
    )

  if (updatedUser) {
    userCache.set(
      jidCanon,
      updatedUser
    )

    userCache.set(
      num,
      updatedUser
    )
  }

  let rewardText

  if (isFirstTime) {

    rewardText =
`*༺ ✰ 𝚁𝙴𝙲𝙾𝙼𝙿𝙴𝙽𝚂𝙰 𝙸𝙽𝙸𝙲𝙸𝙰𝙻 ✰ ༻*

> ✰ 1500 GenosCoins
> ✰ 5 Genos`

  } else {

    rewardText =
`*༺ ✰ 𝚁𝙴𝙶𝚁𝙴𝚂𝙾 ✰ ༻*

> ✰ Bienvenido nuevamente.
> ✰ La recompensa inicial solo se entrega una vez.`

  }

  let pfpUrl =
    await conn
      .profilePictureUrl(
        m.sender,
        'image'
      )
      .catch(() => null)

  if (!pfpUrl) {
    pfpUrl =
      'https://files.catbox.moe/uvp7v4.jpg'
  }

  const pfpBuffer =
    await getBuffer(pfpUrl)

  const caption =
`༺ ✰ 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾 𝙴𝚇𝙸𝚃𝙾𝚂𝙾 ✰ ༻

> ✰ 𝙽𝚘𝚖𝚋𝚛𝚎: ${name}
> ✰ 𝙴𝚍𝚊𝚍: ${age} años
> ✰ 𝚂𝚎𝚛𝚒𝚎: ${sn}

${rewardText}

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`

  await conn.sendMessage(
    m.chat,
    {
      image:
        pfpBuffer ||
        { url: pfpUrl },

      caption,

      mentions: [
        m.sender
      ]
    },
    {
      quoted: m
    }
  )
}

handler.help = [
  'reg <nombre.edad>'
]

handler.tags = [
  'registro'
]

handler.command = [
  'reg',
  'verificar',
  'verify',
  'registrar'
]

export default handler