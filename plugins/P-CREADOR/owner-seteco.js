import User from '../../lib/database/models/zen-users.js'
import { userCache } from '../../lib/caches.js'
import config from '../../config.js'

const extraerNum = (jid = '') => (typeof jid === 'string' ? jid : '').split('@')[0].split(':')[0].replace(/\D/g, '')

const resolveTargetJid = (m, participants = []) => {
  const raw = m.mentionedJid?.[0] || m.quoted?.sender || null
  if (!raw) return null
  if (!raw.endsWith('@lid')) return raw
  const p = participants.find(p => p.id === raw || p.lid === raw)
  if (p?.phoneNumber) return `${String(p.phoneNumber).replace(/\D/g, '')}@s.whatsapp.net`
  if (p?.id?.includes('@s.whatsapp.net')) return p.id
  return raw
}

const handler = async (m, { text, usedPrefix, command, participants }) => {
  const targetRaw = resolveTargetJid(m, participants)
  if (!targetRaw) return m.reply(`*⌬┤ ⚠️ ├⌬ USO CORRECTO*\n> *${usedPrefix + command}* <cantidad> <moneda> [bank] @usuario\n> Ejemplo: *${usedPrefix + command} 500 genosCoins bank*`)

  const targetJid = targetRaw.includes('@s.whatsapp.net') ? targetRaw : `${extraerNum(targetRaw)}@s.whatsapp.net`
  const targetNum = extraerNum(targetJid)

  const amountMatch = text.match(/\d+/)
  if (!amountMatch) return m.reply('*⌬┤ ⚠️ · CANTIDAD INVÁLIDA.*')
  const amount = parseInt(amountMatch[0])

  const isGenos = /genos/i.test(text) || new RegExp(config.PREMIUM_NAME, 'i').test(text)
  const isBank = /bank|banco/i.test(text)

  let field = 'genosCoins'
  let locationName = 'Billetera'
  
  if (isGenos) {
    field = 'genos'
    locationName = 'Premium'
  } else if (isBank) {
    field = 'bankBalance'
    locationName = 'Banco'
  }

  const currencySymbol = isGenos ? config.PREMIUM_SYMBOL : config.CURRENCY_SYMBOL

  const v = await User.findOne({ jid: targetJid })
  if (!v) return m.reply('*⌬┤ ❌ · USUARIO NO REGISTRADO.*')

  const prevAmount = v[field]
  v[field] = amount

  await User.updateOne({ jid: targetJid }, { $set: { [field]: amount } })

  const tCacheJid = userCache.get(targetJid)
  const tCacheNum = userCache.get(targetNum)
  if (tCacheJid) tCacheJid[field] = amount
  if (tCacheNum && tCacheNum !== tCacheJid) tCacheNum[field] = amount

  let txt = `*╔═══⌦ ✦ ⚙️ BALANCE SETEADO ✦ ⌫═══╗*\n\n`
          + `> 👤 *Usuario:* @${targetNum}\n`
          + `> 🏦 *Ubicación:* ${locationName}\n`
          + `> 📉 *Anterior:* ${prevAmount} ${currencySymbol}\n`
          + `> 📈 *Actual:* ${amount} ${currencySymbol}\n\n`
          + `*╚══⌦ ${config.footer} ⌫══╝*`

  m.reply(txt, { mentions: [targetJid] })
}

handler.help = ['dejar <cantidad> <moneda> [bank] @user']
handler.tags = ['owner']
handler.command = ['dejar', 'seteco', 'setbalance']
handler.ownerOnly = true

export default handler