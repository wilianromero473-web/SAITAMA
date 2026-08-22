import fetch from 'node-fetch'
import User, { RANGOS } from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const TITLE_LABEL = {
  title_cazador: 'El Cazador',
  title_magnate: 'Magnate',
  title_legendario: 'Leyenda Viva',
  title_sombra: 'Sombra'
}

const BADGE_EMOJI = {
  relic_corona: '👑',
  relic_orbe: '🔮',
  relic_fenix: '🐦‍🔥'
}

const extraerNum = (jid = '') =>
  (typeof jid === 'string' ? jid : '')
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '')

const resolveTargetJid = (m, participants = []) => {
  const raw = m.mentionedJid?.[0] || m.quoted?.sender || null

  if (!raw) return null

  if (!raw.endsWith('@lid')) return raw

  const p = participants.find(
    p => p.id === raw || p.lid === raw
  )

  if (p?.phoneNumber) {
    return `${String(p.phoneNumber).replace(/\D/g, '')}@s.whatsapp.net`
  }

  if (p?.id?.includes('@s.whatsapp.net')) {
    return p.id
  }

  return raw
}

const findByNum = (jid) => {
  const num = extraerNum(jid)

  if (!num) return null

  return User.findOne({
    jid: { $regex: `^${num}@` }
  }).lean()
}

const handler = async (m, { conn, participants }) => {

  const targetRaw = resolveTargetJid(
    m,
    participants
  )

  const isSelf =
    !targetRaw ||
    extraerNum(targetRaw) === extraerNum(m.sender)

  const u = isSelf
    ? await User.findOne({
        jid: {
          $regex: `^${extraerNum(m.sender)}@`
        }
      }).lean()
    : await findByNum(targetRaw)

  if (!u) {
    return isSelf
      ? undefined
      : m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁*

> ✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘 𝚗𝚘 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚍𝚘.`
      )
  }

  const displayJid = u.jid

  const rango =
    RANGOS[
      Math.min(
        u.level,
        RANGOS.length - 1
      )
    ]

  const xpNec =
    Math.floor(
      Math.pow(u.level, 1.5) * 100
    ) + 200

  const social = u.social || {}
  const inv = u.inventory || {}

  let pfp = await conn
    .profilePictureUrl(
      displayJid,
      'image'
    )
    .catch(() => null)

  if (!pfp) {
    pfp = 'https://files.catbox.moe/uvp7v4.jpg'
  }

  const insignias =
    (inv.badges || [])
      .map(
        b => BADGE_EMOJI[b] || ''
      )
      .filter(Boolean)
      .join(' ')

  const badgeSuffix =
    insignias
      ? ` [ ${insignias} ]`
      : ''

  let txt =
`*✰ 𝙿𝙴𝚁𝙵𝙸𝙻 ✰*

> ✰ 𝙽𝚘𝚖𝚋𝚛𝚎: ${u.name || 'Invitado'}${badgeSuffix}
`

  if (!isSelf) {
    txt +=
`> ✰ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: @${extraerNum(displayJid)}
`
  }

  if (inv.title) {
    txt +=
`> ✰ 𝚃í𝚝𝚞𝚕𝚘: ${TITLE_LABEL[inv.title] || inv.title}
`
  }

  if (social.nickname) {
    txt +=
`> ✰ 𝙰𝚙𝚘𝚍𝚘: ${social.nickname}
`
  }

  if (social.bio) {
    txt +=
`> ✰ 𝙱𝚒𝚘: ${social.bio}
`
  }

  txt +=
`> ✰ 𝚂𝚎𝚛𝚒𝚎: ${u.serial || '---'}

*✰ 𝚁𝙰𝙽𝙶𝙾 𝚈 𝙽𝙸𝚅𝙴𝙻 ✰*

> ✰ 𝙽𝚒𝚟𝚎𝚕: ${u.level}
> ✰ 𝚁𝚊𝚗𝚐𝚘: ${rango}
> ✰ 𝚇𝙿: [ ${u.xp} / ${xpNec} ]

`

  let socialInfo = ''

  if (social.country) {
    socialInfo +=
`> ✰ 𝙿𝚊í𝚜: ${social.country}
`
  }

  if (social.birthday) {
    socialInfo +=
`> ✰ 𝙲𝚞𝚖𝚙𝚕𝚎𝚊ñ𝚘𝚜: ${social.birthday}
`
  }

  if (social.zodiac) {
    socialInfo +=
`> ✰ 𝚂𝚒𝚐𝚗𝚘: ${social.zodiac}
`
  }

  if (social.song) {
    socialInfo +=
`> ✰ 𝙲𝚊𝚗𝚌𝚒ó𝚗: ${social.song}
`
  }

  if (social.color) {
    socialInfo +=
`> ✰ 𝙲𝚘𝚕𝚘𝚛: ${social.color}
`
  }

  if (social.food) {
    socialInfo +=
`> ✰ 𝙲𝚘𝚖𝚒𝚍𝚊: ${social.food}
`
  }

  if (socialInfo) {
    txt +=
`*✰ 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸Ó𝙽 ✰*

${socialInfo}
`
  }

  txt +=
`*✰ 𝙴𝙲𝙾𝙽𝙾𝙼Í𝙰 ✰*

> ✰ 𝙱𝚒𝚕𝚕𝚎𝚝𝚎𝚛𝚊: ${u.genosCoins || 0} ${config.CURRENCY_SYMBOL}
> ✰ 𝙱𝚊𝚗𝚌𝚘: ${u.bankBalance || 0} ${config.CURRENCY_SYMBOL}
> ✰ ${config.PREMIUM_NAME}: ${u.genos || 0} ${config.PREMIUM_SYMBOL}

*✰ 𝙼𝙾𝙲𝙷𝙸𝙻𝙰 ✰*

> ✰ 𝙿𝚒𝚌𝚔𝚊𝚡𝚎: ${inv.pickaxeDurability || 0}
> ✰ 𝙰𝚛𝚌𝚘: ${inv.bowDurability || 0}
> ✰ 𝙲𝚊ñ𝚊: ${inv.baitDurability || 0}

*✰ ${config.footer} ✰*`

  let imgBuffer

  try {
    const res = await fetch(pfp)

    if (res.ok) {
      imgBuffer = Buffer.from(
        await res.arrayBuffer()
      )
    }
  } catch {
    imgBuffer = null
  }

  try {

    const payload = imgBuffer
      ? {
          image: imgBuffer,
          caption: txt,
          mentions: [displayJid]
        }
      : {
          text: txt,
          mentions: [displayJid]
        }

    await conn.sendMessage(
      m.chat,
      payload,
      { quoted: m }
    )

  } catch (err) {
    console.error(
      '[PERFIL ERROR]',
      err.message
    )
  }
}

handler.help = [
  'perfil [@usuario]'
]

handler.tags = [
  'registro'
]

handler.command = [
  'perfil',
  'profile',
  'me'
]

handler.register = true

export default handler