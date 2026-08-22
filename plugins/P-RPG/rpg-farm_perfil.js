import User from '../../lib/database/models/zen-users.js'
import { calcFarmerLevel, getFarmerRank } from '../../lib/games/rpg/rpgFarmerProfile.js'
import config from '../../config.js'

const handler = async (m, { conn, command }) => {
  if (['perfilgranjero', 'farmperfil'].includes(command)) {
    const target = m.mentionedJid?.[0] || m.sender
    const targetNum = target.split('@')[0].split(':')[0]

    const u = await User.findOne({
      jid: { $regex: `^${targetNum}@` }
    }).lean()

    if (!u) {
      return m.reply('*༺ ✰ ERROR ✰ ༻*\n> ✰ Usuario no registrado.')
    }

    const xp = u.farmerXP || 0
    const lvl = calcFarmerLevel(xp)
    const rango = getFarmerRank(lvl)
    const stats = u.farmerStats || {}

    let texto = `*༺ ✰ 👨‍🌾 PERFIL GRANJERO ✰ ༻*\n\n`

    texto += `> ✰ Usuario: @${targetNum}\n`
    texto += `> ✰ Rango: ${rango}\n`
    texto += `> ✰ Nivel: ${lvl}\n`
    texto += `> ✰ FXP: ${xp}\n\n`

    texto += `*༺ ✰ ESTADÍSTICAS ✰ ༻*\n\n`
    texto += `> ✰ Cosechados: ${stats.totalHarvested || 0}\n`
    texto += `> ✰ Vendidos crudos: ${stats.cropsSold || 0}\n`
    texto += `> ✰ Vendidos cocinados: ${stats.foodSold || 0}\n`
    texto += `> ✰ Perdidos: ${stats.cropsLost || 0}\n\n`

    texto += `*༺ ✰ ${config.footer} ✰ ༻*`

    return conn.sendMessage(
      m.chat,
      {
        text: texto,
        mentions: [target]
      },
      { quoted: m }
    )
  }

  if (['topgranjeros', 'topfarm'].includes(command)) {
    const top = await User.find({
      farmerXP: { $gt: 0 }
    })
      .sort({ farmerXP: -1 })
      .limit(10)
      .lean()

    if (!top.length) {
      return m.reply(
        '*༺ ✰ 🌾 SIN GRANJEROS ✰ ༻*\n\n> ✰ Todavía nadie ha comenzado a cultivar.'
      )
    }

    const MEDALS = [
      '🥇',
      '🥈',
      '🥉',
      '4️⃣',
      '5️⃣',
      '6️⃣',
      '7️⃣',
      '8️⃣',
      '9️⃣',
      '🔟'
    ]

    let texto = `*༺ ✰ 🏆 TOP GRANJEROS ✰ ༻*\n\n`

    top.forEach((u, i) => {
      const num = u.jid
        .split('@')[0]
        .split(':')[0]

      const lvl = calcFarmerLevel(u.farmerXP || 0)
      const rank = getFarmerRank(lvl)

      texto += `${MEDALS[i]} @${num}\n`
      texto += `> ✰ Nivel: ${lvl}\n`
      texto += `> ✰ Rango: ${rank}\n`
      texto += `> ✰ FXP: ${u.farmerXP || 0}\n\n`
    })

    texto += `*༺ ✰ ${config.footer} ✰ ༻*`

    return conn.sendMessage(
      m.chat,
      {
        text: texto,
        mentions: top.map(u => u.jid)
      },
      { quoted: m }
    )
  }
}

handler.help = [
  'perfilgranjero',
  'farmperfil',
  'topgranjeros',
  'topfarm'
]

handler.tags = ['rpg']

handler.command = [
  'perfilgranjero',
  'farmperfil',
  'topgranjeros',
  'topfarm'
]

handler.register = true

export default handler