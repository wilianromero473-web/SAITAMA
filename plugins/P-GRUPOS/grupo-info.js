import fs from 'fs'
import path from 'path'
import * as baileysMod from '@whiskeysockets/baileys'
import config from '../../config.js'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1
  ? baileysMod.default
  : baileysMod

const { jidNormalizedUser } = pkg

const ACTIVITY_DIR = path.resolve('./lib/database/data/activity')

function readActivity(groupId) {
  const file = path.join(
    ACTIVITY_DIR,
    `${groupId.replace('@g.us', '')}.json`
  )

  try {
    return fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, 'utf8'))
      : {}
  } catch {
    return {}
  }
}

const on = '✰ ON'
const off = '✰ OFF'

const handler = async (
  m,
  {
    conn,
    participants,
    groupMetadata,
    groupDb,
    isBotAdmin
  }
) => {
  if (!m.isGroup) {
    return m.reply(
`*✰ 𝙶𝚁𝚄𝙿𝙾 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙾 ༻*

> ✰ Este comando solo funciona en grupos.`
    )
  }

  const meta =
    groupMetadata ||
    await conn.groupMetadata(m.chat).catch(() => ({}))

  const botJid = jidNormalizedUser(conn.user.id)

  const admins = participants.filter(p =>
    p.admin === 'admin' ||
    p.admin === 'superadmin' ||
    p.isCommunityAdmin
  )

  const bots = participants.filter(
    p => jidNormalizedUser(p.id) === botJid
  )

  const createdAt = meta.creation
    ? new Date(meta.creation * 1000).toLocaleDateString(
        'es-PE',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      )
    : '---'

  const inviteCode = isBotAdmin
    ? await conn.groupInviteCode(m.chat).catch(() => null)
    : null

  const activity = readActivity(m.chat)

  const totalMsgs = Object.values(activity)
    .reduce((a, b) => a + b, 0)

  const activos = Object.keys(activity).length

  const inactivos = participants.filter(p => {
    const jid = jidNormalizedUser(p.id)

    return (
      jid !== botJid &&
      !(activity[jid] > 0)
    )
  }).length

  const restrict = meta.restrict
    ? '🔒 Solo admins'
    : '🌐 Todos'

  const announce = meta.announce
    ? '🔒 Solo admins'
    : '🌐 Todos'

  const ephemeral = meta.ephemeralDuration
    ? `⏳ ${meta.ephemeralDuration / 86400}d`
    : off

  const joinApproval = meta.joinApprovalMode ? on : off
  const memberAdd = meta.memberAddMode ? on : off
  const isCommunity = meta.isCommunity ? on : off
  const isLinked = meta.linkedParent ? on : off

  const desc = meta.desc
    ? meta.desc.length > 100
      ? `${meta.desc.slice(0, 97)}...`
      : meta.desc
    : '---'

  const db = groupDb || {}

  const disabledCmds =
    db.disabledCmds?.length
      ? db.disabledCmds.join(', ')
      : 'ninguno'

  const disabledCats =
    db.disabledCategories?.length
      ? db.disabledCategories.join(', ')
      : 'ninguna'

  let txt =
`*✰ 𝙸𝙽𝙵𝙾 𝙳𝙴𝙻 𝙶𝚁𝚄𝙿𝙾 ༻*

*✰ 𝙶𝙴𝙽𝙴𝚁𝙰𝙻 ༻*
> ✰ 𝙽𝚘𝚖𝚋𝚛𝚎: *${meta.subject || '---'}*
> ✰ 𝙲𝚛𝚎𝚊𝚍𝚘: *${createdAt}*
> ✰ 𝙸𝙳: *${m.chat}*
> ✰ 𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚌𝚒ó𝚗: *${desc}*`

  if (inviteCode) {
    txt += `\n> ✰ 𝙻𝚒𝚗𝚔: https://chat.whatsapp.com/${inviteCode}`
  }

  txt += `

*✰ 𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂 ༻*
> ✰ 𝚃𝚘𝚝𝚊𝚕: *${participants.length}*
> ✰ 𝙰𝚍𝚖𝚒𝚗𝚜: *${admins.length}*
> ✰ 𝙱𝚘𝚝𝚜: *${bots.length}*

*✰ 𝙲𝙾𝙽𝙵𝙸𝙶𝚄𝚁𝙰𝙲𝙸Ó𝙽 ༻*
> ✰ 𝙴𝚍𝚒𝚝𝚊𝚛 𝚒𝚗𝚏𝚘: ${restrict}
> ✰ 𝙴𝚗𝚟𝚒𝚊𝚛 𝚖𝚎𝚗𝚜𝚊𝚓𝚎𝚜: ${announce}
> ✰ 𝙼𝚎𝚗𝚜𝚊𝚓𝚎𝚜 𝚝𝚎𝚖𝚙.: ${ephemeral}
> ✰ 𝙰𝚙𝚛𝚘𝚋𝚊𝚌𝚒ó𝚗: ${joinApproval}
> ✰ 𝙰𝚐𝚛𝚎𝚐𝚊𝚛 𝚖𝚒𝚎𝚖𝚋𝚛𝚘𝚜: ${memberAdd}
> ✰ 𝙲𝚘𝚖𝚞𝚗𝚒𝚍𝚊𝚍: ${isCommunity}
> ✰ 𝚅𝚒𝚗𝚌𝚞𝚕𝚊𝚍𝚘: ${isLinked}

*✰ 𝙱𝙾𝚃 ༻*
> ✰ 𝙱𝚒𝚎𝚗𝚟𝚎𝚗𝚒𝚍𝚊: ${db.welcome ? on : off}
> ✰ 𝙳𝚎𝚜𝚙𝚎𝚍𝚒𝚍𝚊: ${db.goodbye ? on : off}

*✰ 𝙿𝚁𝙾𝚃𝙴𝙲𝙲𝙸𝙾𝙽𝙴𝚂 ༻*
> ✰ 𝙰𝚗𝚝𝚒𝚕𝚒𝚗𝚔: ${db.antilink ? on : off}
> ✰ 𝙰𝚗𝚝𝚒 𝚟𝚘𝚣: ${db.antinotadevoz ? on : off}
> ✰ 𝙰𝚗𝚝𝚒 𝚎𝚝𝚒𝚚𝚞𝚎𝚝𝚊: ${db.antimenciongp ? on : off}
> ✰ 𝙰𝚗𝚝𝚒 𝚜𝚝𝚒𝚌𝚔𝚎𝚛: ${db.antisticker ? on : off}
> ✰ 𝙰𝚗𝚝𝚒 𝚟𝚒𝚍𝚎𝚘: ${db.antivideo ? on : off}
> ✰ 𝙰𝚗𝚝𝚒 𝚒𝚖𝚊𝚐𝚎𝚗: ${db.antiimagen ? on : off}
> ✰ 𝙰𝚗𝚝𝚒 𝚍𝚎𝚕𝚎𝚝𝚎: ${db.antidelete ? on : off}
> ✰ 𝙰𝚗𝚝𝚒 𝚝𝚘𝚡𝚒𝚌: ${db.antitoxic ? on : off}

*✰ 𝙱𝙻𝙾𝚀𝚄𝙴𝙾𝚂 ༻*
> ✰ 𝙲𝚘𝚖𝚊𝚗𝚍𝚘𝚜: *${disabledCmds}*
> ✰ 𝙲𝚊𝚝𝚎𝚐𝚘𝚛í𝚊𝚜: *${disabledCats}*

*✰ 𝙰𝙲𝚃𝙸𝚅𝙸𝙳𝙰𝙳 ༻*
> ✰ 𝙼𝚎𝚗𝚜𝚊𝚓𝚎𝚜: *${totalMsgs}*
> ✰ 𝙰𝚌𝚝𝚒𝚟𝚘𝚜: *${activos}*
> ✰ 𝙸𝚗𝚊𝚌𝚝𝚒𝚟𝚘𝚜: *${inactivos}*

*✰ ${config.footer} ༻*`

  const pfp = await conn
    .profilePictureUrl(m.chat, 'image')
    .catch(() => null)

  if (pfp) {
    await conn.sendMessage(
      m.chat,
      {
        image: { url: pfp },
        caption: txt
      },
      { quoted: m }
    )
  } else {
    await m.reply(txt)
  }
}

handler.help = ['infogrupo']
handler.tags = ['group']

handler.command = [
  'infogrupo',
  'groupinfo',
  'ginfo',
  'grupoinfo'
]

handler.groupOnly = true
handler.noRegister = true

export default handler