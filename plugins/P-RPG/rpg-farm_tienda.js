import config from '../../config.js'
import {
  getSortedSeeds,
  buySeed
} from '../../lib/games/rpg/rpgFarm.js'
import {
  calcFarmerLevel
} from '../../lib/games/rpg/rpgFarmerProfile.js'

const handler = async (
  m,
  {
    command,
    args,
    usedPrefix,
    userDb
  }
) => {

  if (!userDb) return

  const userLevel =
    calcFarmerLevel(
      userDb.farmerXP || 0
    )

  const totalLimit =
    15 + (userLevel * 2)

  const hoy =
    new Date().toDateString()

  const compradas =
    userDb.farm?.lastSeedPurchaseDate === hoy
      ? (userDb.farm?.dailySeedsBought || 0)
      : 0

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIENDA DE SEMILLAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (
    ['tiendacultivo', 'semillas']
      .includes(command)
  ) {

    const allSeeds =
      getSortedSeeds()

    const disponibles =
      allSeeds.filter(
        seed =>
          seed.reqLevel <=
          userLevel + 3
      )

    let lista = disponibles
      .map(seed => {

        const tiempoMin =
          Math.floor(
            seed.growTime / 60000
          )

        if (
          seed.reqLevel >
          userLevel
        ) {
          return `> ✰ 🔒 ${seed.id.toUpperCase()} — Se desbloquea al Nivel *${seed.reqLevel}*`
        }

        return `> ${seed.emoji} *${seed.id.toUpperCase()}* — ${seed.price} ${config.CURRENCY_SYMBOL} | ⏱️ ${tiempoMin}m | Nivel ${seed.reqLevel}`
      })
      .join('\n')

    const texto =
`*༺ ✰ 🌾 TIENDA DE SEMILLAS ✰ ༻*

> ✰ Nivel de granjero: *${userLevel}*
> ✰ Compras de hoy: *${compradas}/${totalLimit}*

${lista}

*༺ ✰ INFORMACIÓN ✰ ༻*

> ✰ Comprar:
> ${usedPrefix}comprarsemilla <semilla> <cantidad>

> ✰ Consejo: subí de nivel cocinando para desbloquear nuevas semillas y aumentar tu límite.`

    return m.reply(texto)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPRAR SEMILLA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (
    ['comprarsemilla', 'buyseed']
      .includes(command)
  ) {

    const seed =
      (args[0] || '').toLowerCase()

    const amount =
      Math.max(
        1,
        Number(args[1]) || 1
      )

    if (!seed) {
      return m.reply(
`*༺ ✰ ❌ SEMILLA INVÁLIDA ✰ ༻*

> ✰ Revisá la tienda con:
> ${usedPrefix}semillas`
      )
    }

    const result =
      await buySeed(
        m.sender,
        seed,
        amount
      )

    if (!result.ok) {

      if (
        result.reason ===
        'invalidSeed'
      ) {
        return m.reply(
`*༺ ✰ ❌ SEMILLA INVÁLIDA ✰ ༻*

> ✰ Revisá la tienda con:
> ${usedPrefix}semillas`
        )
      }

      if (
        result.reason ===
        'levelTooLow'
      ) {
        return m.reply(
`*༺ ✰ 🚫 NIVEL INSUFICIENTE ✰ ༻*

> ✰ Nivel requerido: *${result.req}*
> ✰ Tu nivel actual: *${result.current}*`
        )
      }

      if (
        result.reason ===
        'dailyLimit'
      ) {
        return m.reply(
`*༺ ✰ 🛑 LÍMITE DIARIO ✰ ༻*

> ✰ Límite diario: *${result.limit}*
> ✰ Compradas hoy: *${result.current}*`
        )
      }

      if (
        result.reason ===
        'noMoney'
      ) {
        return m.reply(
`*༺ ✰ 💸 SIN FONDOS ✰ ༻*

> ✰ No tenés suficiente dinero para comprar esta semilla.`
        )
      }

      return m.reply(
`*༺ ✰ ❌ ERROR ✰ ༻*

> ✰ No se pudo completar la compra.`
      )
    }

    return m.reply(
`*༺ ✰ 🌱 COMPRA REALIZADA ✰ ༻*

> ✰ Semilla: *${seed.toUpperCase()}*
> ✰ Cantidad: *×${amount}*
> ✰ Costo total: *${result.totalCost} ${config.CURRENCY_SYMBOL}*
> ✰ Límite restante: *${result.limit}*

> ✰ Plantar:
> ${usedPrefix}plantar ${seed}`
    )
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'tiendacultivo',
  'semillas',
  'comprarsemilla <semilla> <cantidad>',
  'buyseed <semilla> <cantidad>'
]

handler.tags = ['rpg']

handler.command = [
  'tiendacultivo',
  'semillas',
  'comprarsemilla',
  'buyseed'
]

handler.register = true

export default handler