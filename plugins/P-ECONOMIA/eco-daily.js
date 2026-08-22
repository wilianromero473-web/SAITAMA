import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const SEP = '─'.repeat(28)

const handler = async (m, { userDb }) => {
  if (!userDb) return

  const TIEMPO_ESPERA = 24 * 60 * 60 * 1000
  const ahora = Date.now()

  const lastDaily = Number(userDb.lastDaily || 0)
  const falta = TIEMPO_ESPERA - (ahora - lastDaily)

  // ─────────────── COOLDOWN ───────────────
  if (falta > 0) {
    const horas = Math.floor(falta / 3600000)
    const minutos = Math.floor((falta % 3600000) / 60000)

    return m.reply(
`༺ 𝙳𝙸𝙰𝚁𝙸𝙾 ༻

✰ 𝙴𝙽 𝙴𝚂𝙿𝙴𝚁𝙰

> ✰ 𝚈𝚊 𝚛𝚎𝚌𝚕𝚊𝚖𝚊𝚜𝚝𝚎 𝚝𝚞 𝚛𝚎𝚌𝚘𝚖𝚙𝚎𝚗𝚜𝚊 𝚍𝚒𝚊𝚛𝚒𝚊.

> ✰ 𝚅𝚘𝚕𝚟é 𝚎𝚗: *${horas}𝚑 ${minutos}𝚖*

${SEP}

> ✰ ${config.footer}`
    )
  }

  // ─────────────── RECOMPENSA ───────────────
  const nivel = Number(userDb.level || 0)

  const base = 1000
  const bono = nivel * 100
  const total = base + bono

  // ─────────────── ACTUALIZAR DATOS ───────────────
  userDb.genosCoins = Number(userDb.genosCoins || 0) + total
  userDb.lastDaily = ahora

  await User.updateOne(
    { jid: m.sender },
    {
      $inc: {
        genosCoins: total
      },
      $set: {
        lastDaily: ahora
      }
    }
  )

  // ─────────────── MENSAJE ───────────────
  const txt =
`༺ 𝙳𝙸𝙰𝚁𝙸𝙾 ༻

✰ 𝚁𝙴𝙲𝙾𝙼𝙿𝙴𝙽𝚂𝙰 𝙳𝙸𝙰𝚁𝙸𝙰

> ✰ 𝙱𝚊𝚜𝚎: *+${base.toLocaleString('es-AR')} ${config.CURRENCY_SYMBOL}*
> ✰ 𝙱𝚘𝚗𝚘 𝚍𝚎 𝙽𝚒𝚟𝚎𝚕: *+${bono.toLocaleString('es-AR')} ${config.CURRENCY_SYMBOL}*
> ✰ 𝙽𝚒𝚟𝚎𝚕 𝚊𝚌𝚝𝚞𝚊𝚕: *${nivel}*
${SEP}
✰ 𝚃𝙾𝚃𝙰𝙻 𝚁𝙴𝙲𝙸𝙱𝙸𝙳𝙾

> 💰 *+${total.toLocaleString('es-AR')} ${config.CURRENCY_NAME}*

${SEP}

> ✰ ${config.footer}`

  return m.reply(txt)
}

handler.help = ['diario']
handler.tags = ['eco']
handler.command = ['daily', 'diario', 'claim']
handler.register = true

export default handler