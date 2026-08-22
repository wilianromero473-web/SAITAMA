import Group from '../lib/database/models/zen-groups.js'
import { jidNormalizedUser } from '@whiskeysockets/baileys'
import { groupCache, groupDbCache } from '../lib/caches.js'

const DEFAULT_BV = `*✰ 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳𝙾/𝙰 ༻*

> 👤 𝙐𝙨𝙪𝙖𝙧𝙞𝙤: @%user
> 🏮 𝙂𝙧𝙪𝙥𝙤: *%group*
> 👥 𝙈𝙞𝙚𝙢𝙗𝙧𝙤 𝙉°: *%count*

*✰ 𝙰𝙷𝙾𝚁𝙰 𝙵𝙾𝚁𝙼𝙰𝚂 𝙿𝙰𝚁𝚃𝙴 𝙳𝙴 𝙻𝙰 𝙵𝙰𝙼𝙸𝙻𝙸𝙰 ༻*

> ✦ Esperamos que disfrutes tu estadía.
> ✦ Respeta a todos los miembros.
> ✦ Usa los comandos de SaitamaBot con responsabilidad.

*✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ༻*`

const DEFAULT_DP = `*✰ 𝙷𝙰𝚂𝚃𝙰 𝙻𝚄𝙴𝙶𝙾 ༻*

> 👤 𝙐𝙨𝙪𝙖𝙧𝙞𝙤: @%user
> 🏮 𝙂𝙧𝙪𝙥𝙤: *%group*
> 👥 𝙈𝙞𝙚𝙢𝙗𝙧𝙤𝙨: *%count*

*✰ 𝙴𝙻 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙷𝙰 𝙳𝙴𝙹𝙰𝙳𝙾 𝙴𝙻 𝙶𝚁𝚄𝙿𝙾 ༻*

> ✦ Gracias por haber formado parte.
> ✦ Esperamos volver a verte algún día.

*✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ༻*`

const DEFAULT_BV_IMG =
  'https://i.postimg.cc/k5ZSjCdp/file-00000000c024820ea42520b884f17eb1.png'

const DEFAULT_DP_IMG =
  'https://i.postimg.cc/FHHJNzrk/file-000000002324820ea9c05e944ac744df.png'

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

function parsear(texto, user, group, count) {
  const u = (user || '').split('@')[0]

  return String(texto || '')
    .replace(/%user/g, u)
    .replace(/%group/g, String(group || 'el grupo'))
    .replace(/%count/g, String(count || '?'))
}

const handler = async (m, { conn, args, command, groupDb }) => {
  const option = (args[0] || '').toLowerCase()
  const text = args.slice(1).join(' ').trim()

  if (command === 'welcome' || command === 'bienvenida') {
    if (!option) {
      return m.reply(
        `*✰ 𝙲𝙾𝙽𝙵𝙸𝙶𝚄𝚁𝙰𝙲𝙸𝙾́𝙽 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳𝙰 ༻*\n\n` +
        `> Estado: *${groupDb.welcome ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}*\n\n` +
        `> Uso: *${m.prefix || '.'}welcome on/off*`
      )
    }

    if (['on', '1', 'true', 'activar', 'enable'].includes(option)) {
      if (groupDb.welcome) {
        return m.reply(`*✰ 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳𝙰 𝙰𝙲𝚃𝙸𝚅𝙰 ༻*\n\n> 🟢 El sistema ya estaba activado.`)
      }

      groupDb.welcome = true
      await groupDb.save()

      return m.reply(
        `*✰ 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳𝙰 𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙰 ༻*\n\n` +
        `> 🟢 Ahora se enviará un mensaje cuando entre un nuevo miembro.`
      )
    }

    if (['off', '0', 'false', 'desactivar', 'disable'].includes(option)) {
      if (!groupDb.welcome) {
        return m.reply(`*✰ 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳𝙰 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙰 ༻*\n\n> 🔴 El sistema ya estaba desactivado.`)
      }

      groupDb.welcome = false
      await groupDb.save()

      return m.reply(
        `*✰ 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳𝙰 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙰 ༻*\n\n` +
        `> 🔴 Ya no se enviarán mensajes de bienvenida.`
      )
    }

    return m.reply(
      `*✰ 𝙾𝙿𝙲𝙸𝙾́𝙽 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙰 ༻*\n\n` +
      `> Usa: *${m.prefix || '.'}welcome on/off*`
    )
  }

  if (command === 'bye' || command === 'despedida') {
    if (!option) {
      return m.reply(
        `*✰ 𝙲𝙾𝙽𝙵𝙸𝙶𝚄𝚁𝙰𝙲𝙸𝙾́𝙽 𝙳𝙴𝚂𝙿𝙴𝙳𝙸𝙳𝙰 ༻*\n\n` +
        `> Estado: *${groupDb.goodbye ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}*\n\n` +
        `> Uso: *${m.prefix || '.'}bye on/off*`
      )
    }

    if (['on', '1', 'true', 'activar', 'enable'].includes(option)) {
      if (groupDb.goodbye) {
        return m.reply(`*✰ 𝙳𝙴𝚂𝙿𝙴𝙳𝙸𝙳𝙰 𝙰𝙲𝚃𝙸𝚅𝙰 ༻*\n\n> 🟢 El sistema ya estaba activado.`)
      }

      groupDb.goodbye = true
      await groupDb.save()

      return m.reply(
        `*✰ 𝙳𝙴𝚂𝙿𝙴𝙳𝙸𝙳𝙰 𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙰 ༻*\n\n` +
        `> 🟢 Ahora se enviará un mensaje cuando un miembro salga.`
      )
    }

    if (['off', '0', 'false', 'desactivar', 'disable'].includes(option)) {
      if (!groupDb.goodbye) {
        return m.reply(`*✰ 𝙳𝙴𝚂𝙿𝙴𝙳𝙸𝙳𝙰 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙰 ༻*\n\n> 🔴 El sistema ya estaba desactivado.`)
      }

      groupDb.goodbye = false
      await groupDb.save()

      return m.reply(
        `*✰ 𝙳𝙴𝚂𝙿𝙴𝙳𝙸𝙳𝙰 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙰 ༻*\n\n` +
        `> 🔴 Ya no se enviarán mensajes de despedida.`
      )
    }

    return m.reply(
      `*✰ 𝙾𝙿𝙲𝙸𝙾́𝙽 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙰 ༻*\n\n` +
      `> Usa: *${m.prefix || '.'}bye on/off*`
    )
  }

  if (command === 'setwelcome') {
    const mensaje = args.join(' ').trim()

    if (!mensaje) {
      return m.reply(
        `*✰ 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙵𝙰𝙻𝚃𝙰𝙽𝚃𝙴 ༻*\n\n` +
        `> Escribe el nuevo mensaje de bienvenida.\n\n` +
        `> Variables:\n` +
        `> • %user — Usuario\n` +
        `> • %group — Grupo\n` +
        `> • %count — Miembros`
      )
    }

    groupDb.welcomeMsg = mensaje
    await groupDb.save()

    return m.reply(
      `*✰ 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳𝙰 𝙶𝚄𝙰𝚁𝙳𝙰𝙳𝙰 ༻*\n\n` +
      `> ✅ El nuevo mensaje de bienvenida fue guardado.`
    )
  }

  if (command === 'setbye') {
    const mensaje = args.join(' ').trim()

    if (!mensaje) {
      return m.reply(
        `*✰ 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙵𝙰𝙻𝚃𝙰𝙽𝚃𝙴 ༻*\n\n` +
        `> Escribe el nuevo mensaje de despedida.\n\n` +
        `> Variables:\n` +
        `> • %user — Usuario\n` +
        `> • %group — Grupo\n` +
        `> • %count — Miembros`
      )
    }

    groupDb.goodbyeMsg = mensaje
    await groupDb.save()

    return m.reply(
      `*✰ 𝙳𝙴𝚂𝙿𝙴𝙳𝙸𝙳𝙰 𝙶𝚄𝙰𝚁𝙳𝙰𝙳𝙰 ༻*\n\n` +
      `> ✅ El nuevo mensaje de despedida fue guardado.`
    )
  }
}

export async function manejarParticipantes(conn, update) {
  const { id, participants, action } = update

  if (!id || !Array.isArray(participants)) return

  const chatJid = jidNormalizedUser(id)

  try {
    let group = groupDbCache.get(chatJid)

    if (!group) {
      group = await Group.findOne({ id: chatJid }).lean()

      if (group) {
        groupDbCache.set(chatJid, group)
      }
    }

    if (!group || (!group.welcome && !group.goodbye)) return

    const botJid = jidNormalizedUser(conn.user.id)
    const myNumber = conn.user.id.split(':')[0]
    const isMainBot = !conn.isSubBot

    if (group.primaryBot && group.primaryBot !== myNumber) return
    if (isMainBot && group.mainBotSleeping) return
    if (!isMainBot && group.disabledBots?.includes(myNumber)) return

    const meta =
      groupCache.get(chatJid) ||
      await conn.groupMetadata(chatJid).catch(() => null)

    if (!meta) return

    const groupName = meta.subject || 'el grupo'
    const count = meta.participants?.length || '?'

    for (const item of participants) {
      const rawJid =
        typeof item === 'string'
          ? item
          : item?.id || item?.jid

      if (!rawJid) continue

      const jid = jidNormalizedUser(rawJid)

      if (!jid || jid === botJid) continue

      const isAdd =
        action === 'add' &&
        group.welcome

      const isRem =
        (action === 'remove' || action === 'leave') &&
        group.goodbye

      if (!isAdd && !isRem) continue

      let pfpUrl =
        await conn.profilePictureUrl(jid, 'image').catch(() => null)

      if (!pfpUrl) {
        pfpUrl = isAdd
          ? DEFAULT_BV_IMG
          : DEFAULT_DP_IMG
      }

      const pfpBuffer = await getBuffer(pfpUrl)

      const texto = parsear(
        isAdd
          ? (group.welcomeMsg || DEFAULT_BV)
          : (group.goodbyeMsg || DEFAULT_DP),
        jid,
        groupName,
        count
      )

      await conn.sendMessage(
        chatJid,
        {
          image: pfpBuffer || { url: pfpUrl },
          caption: texto,
          mentions: [jid]
        }
      )
    }
  } catch (e) {
    console.error('[WELCOME ERROR]', e?.message || e)
  }
}

handler.help = [
  'welcome <on/off>',
  'bye <on/off>',
  'setwelcome <texto>',
  'setbye <texto>'
]

handler.tags = ['group']

handler.command = [
  'welcome',
  'bienvenida',
  'bye',
  'despedida',
  'setwelcome',
  'setbye'
]

handler.groupOnly = true
handler.adminOnly = true
handler.manejarParticipantes = manejarParticipantes

export default handler