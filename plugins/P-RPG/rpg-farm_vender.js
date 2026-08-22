import config from '../../config.js'
import { seedsCatalog, recipes, getFarmData } from '../../lib/games/rpg/rpgFarm.js'

const TAX_RATE = 0.15

const handler = async (m, { command, args, usedPrefix, userDb }) => {
  if (!userDb) return

  if (['venderfarm', 'sellfarm'].includes(command)) {
    const item = (args[0] || '').toLowerCase()
    const amount = Math.max(1, Number(args[1]) || 1)

    const farm = await getFarmData(m.sender)

    if (!item) {
      return m.reply(
`༺ ✰ MERCADO DEL PUEBLO ✰ ༻

> ✰ Uso: ${usedPrefix}${command} <item> <cantidad>
> ✰ Ejemplo: ${usedPrefix}${command} trigo 5

༺ ✰ INFORMACIÓN ✰ ༻

> ✰ Impuesto del alcalde: 15%
> ✰ Podés vender cosechas o comida preparada.
> ✰ Usá ${usedPrefix}granero para revisar tu inventario.`
      )
    }

    let gananciaBruta = 0
    let emojiItem = ''
    let nombreItem = item

    // ━━━━━━━ VENTA DE COSECHA ━━━━━━━
    if (seedsCatalog[item]) {
      const stock = farm.harvest.find(h => h.item === item)

      if (!stock || stock.amount < amount) {
        return m.reply(
`༺ ✰ SIN STOCK ✰ ༻

> ✰ No tenés suficiente *${item.toUpperCase()}* para vender.
> ✰ Cantidad solicitada: *${amount}*
> ✰ Cantidad disponible: *${stock?.amount || 0}*`
        )
      }

      gananciaBruta = seedsCatalog[item].sellPrice * amount

      stock.amount -= amount

      userDb.farm.harvest = farm.harvest.filter(h => h.amount > 0)

      userDb.farmerStats.cropsSold =
        (userDb.farmerStats.cropsSold || 0) + amount

      emojiItem = seedsCatalog[item].emoji
    }

    // ━━━━━━━ VENTA DE COMIDA ━━━━━━━
    else {
      const recipeKey = Object.keys(recipes).find(
        k => recipes[k].gives.food === item || k === item
      )

      if (!recipeKey) {
        return m.reply(
`༺ ✰ ÍTEM INVÁLIDO ✰ ༻

> ✰ No existe una cosecha o comida llamada *${item}*.
> ✰ Revisá tu inventario con ${usedPrefix}granero`
        )
      }

      const foodName = recipes[recipeKey].gives.food

      const stock = farm.food.find(
        f => f.item === foodName
      )

      if (!stock || stock.amount < amount) {
        return m.reply(
`༺ ✰ SIN STOCK ✰ ༻

> ✰ No tenés suficiente *${foodName.toUpperCase()}* para vender.
> ✰ Cantidad solicitada: *${amount}*
> ✰ Cantidad disponible: *${stock?.amount || 0}*`
        )
      }

      gananciaBruta =
        recipes[recipeKey].gives.value * amount

      stock.amount -= amount

      userDb.farm.food =
        farm.food.filter(f => f.amount > 0)

      userDb.farmerStats.foodSold =
        (userDb.farmerStats.foodSold || 0) + amount

      emojiItem = recipes[recipeKey].emoji
      nombreItem = foodName
    }

    // ━━━━━━━ IMPUESTOS ━━━━━━━
    const impuestos =
      Math.floor(gananciaBruta * TAX_RATE)

    const gananciaNeta =
      gananciaBruta - impuestos

    userDb.genosCoins =
      (userDb.genosCoins || 0) + gananciaNeta

    userDb.markModified('farm')
    userDb.markModified('farmerStats')

    await userDb.save()

    return m.reply(
`༺ ✰ VENTA EXITOSA ✰ ༻

> ✰ Producto: ${emojiItem} *${nombreItem.toUpperCase()}*
> ✰ Cantidad: *${amount}*

༺ ✰ GANANCIAS ✰ ༻

> ✰ Ganancia bruta: *${gananciaBruta} ${config.CURRENCY_SYMBOL}*
> ✰ Impuestos (15%): *-${impuestos} ${config.CURRENCY_SYMBOL}*
> ✰ Ganancia neta: *${gananciaNeta} ${config.CURRENCY_SYMBOL}*

༺ ✰ PAGO RECIBIDO ✰ ༻

> ✰ Se agregaron *${gananciaNeta} ${config.CURRENCY_SYMBOL}* a tu cuenta.
> ✰ Usá ${usedPrefix}granero para revisar tus productos.`
    )
  }
}

handler.help = [
  'venderfarm <item> <cantidad>',
  'sellfarm <item> <cantidad>'
]

handler.tags = ['rpg']

handler.command = [
  'venderfarm',
  'sellfarm'
]

handler.register = true

export default handler