import User from '../../lib/database/models/zen-users.js'
import { checkCooldown } from '../../utils/cooldown.js'
import { setCooldown } from '../../utils/setCooldown.js'

const COOLDOWN = 7 * 24 * 60 * 60 * 1000

const handler = async (m, { userDb }) => {
  try {
    if (!userDb?.registered) {
      return m.reply(
        `*༺ 𝙴𝙽𝚃𝚁𝙴𝙽𝙰𝙼𝙸𝙴𝙽𝚃𝙾 𝙶𝙴𝙽𝙾𝚂 ༻*\n\n` +
        `> ✰ 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾: *𝚁𝙴𝙶𝙸́𝚂𝚃𝚁𝙰𝚃𝙴 𝙿𝚁𝙸𝙼𝙴𝚁𝙾*`
      )
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧠 SEGURIDAD PARA USUARIOS ANTIGUOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!userDb.cooldowns) {
      userDb.cooldowns = {}
    }

    const cd = checkCooldown(
      userDb,
      'entrenamientoGenos',
      COOLDOWN
    )

    if (!cd.ok) {
      return m.reply(
        `*༺ 𝙴𝙽𝚃𝚁𝙴𝙽𝙰𝙼𝙸𝙴𝙽𝚃𝙾 𝙶𝙴𝙽𝙾𝚂 ༻*\n\n` +
        `✰ 𝙴𝙽 𝙳𝙴𝚂𝙲𝙰𝙽𝚂𝙾\n\n` +
        `> ✰ 𝚅𝚞𝚎𝚕𝚟𝚎 𝚎𝚗: *${cd.data.days}d ${cd.data.hours}h ${cd.data.minutes}m*`
      )
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎁 RECOMPENSA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const recompensa = Math.floor(Math.random() * 16) + 5

    await User.updateOne(
      { jid: m.sender },
      {
        $inc: {
          genos: recompensa
        }
      }
    )

    await setCooldown(
      m.sender,
      'entrenamientoGenos',
      Date.now()
    )

    return m.reply(
      `*༺ 𝙴𝙽𝚃𝚁𝙴𝙽𝙰𝙼𝙸𝙴𝙽𝚃𝙾 𝙶𝙴𝙽𝙾𝚂 ༻*\n\n` +
      `✰ 𝙴𝙽𝚃𝚁𝙴𝙽𝙰𝙼𝙸𝙴𝙽𝚃𝙾 𝙵𝙸𝙽𝙰𝙻𝙸𝚉𝙰𝙳𝙾\n\n` +
      `> ✰ 𝚁𝙴𝙲𝙾𝙼𝙿𝙴𝙽𝚂𝙰: *+${recompensa} 𝙶𝙴𝙽𝙾𝚂*\n` +
      `> ✰ 𝙿𝚁𝙾́𝚇𝙸𝙼𝙾 𝙴𝙽𝚃𝚁𝙴𝙽𝙰𝙼𝙸𝙴𝙽𝚃𝙾: *7 𝙳𝙸́𝙰𝚂*\n\n` +
      `*༺ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ༻*`
    )

  } catch (error) {
    console.error('[ENTRENARGENOS]', error)

    return m.reply(
      `*༺ 𝙴𝚁𝚁𝙾𝚁 ༻*\n\n` +
      `> ✰ 𝙽𝙾 𝚂𝙴 𝙿𝚄𝙳𝙾 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰𝚁 𝙴𝙻 𝙴𝙽𝚃𝚁𝙴𝙽𝙰𝙼𝙸𝙴𝙽𝚃𝙾.\n` +
      `> ✰ 𝙸𝙽𝚃𝙴𝙽𝚃𝙰 𝙳𝙴 𝙽𝚄𝙴𝚅𝙾.`
    )
  }
}

handler.help = ['entrenargenos']
handler.tags = ['eco']
handler.command = ['entrenargenos']
handler.register = true

export default handler