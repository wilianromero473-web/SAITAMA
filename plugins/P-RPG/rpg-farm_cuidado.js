import config from '../../config.js'
import {
  itemsCatalog,
  getFarmData,
  buyFarmItem,
  useFarmItem,
  waterPlot,
  curePlot
} from '../../lib/games/rpg/rpgFarm.js'

const handler = async (m, { command, args, usedPrefix }) => {

  // ═══════════════════════════════════════
  // 💧 REGAR PARCELA
  // ═══════════════════════════════════════
  if (command === 'regar') {
    const index = Number(args[0]) - 1

    if (isNaN(index) || index < 0) {
      return m.reply(
`༺ ✰ REGAR ✰ ༻

> ✰ Indicá la parcela que necesita agua.
> ✰ Ejemplo: ${usedPrefix}regar 1`
      )
    }

    const res = await waterPlot(m.sender, index)

    if (!res.ok) {
      return m.reply(
`༺ ✰ REGAR ✰ ༻

> ✰ Esa parcela no existe o ya está hidratada.`
      )
    }

    return m.reply(
`༺ ✰ PARCELA REGADA ✰ ༻

> ✰ La planta vuelve a crecer con normalidad.`
    )
  }

  // ═══════════════════════════════════════
  // 🧪 CURAR PLAGAS
  // ═══════════════════════════════════════
  if (['curar', 'curarplagas'].includes(command)) {
    const index = Number(args[0]) - 1

    if (isNaN(index) || index < 0) {
      return m.reply(
`༺ ✰ CURAR PLAGAS ✰ ༻

> ✰ Indicá la parcela infectada.
> ✰ Ejemplo: ${usedPrefix}curar 1`
      )
    }

    const res = await curePlot(m.sender, index)

    if (!res.ok) {
      return m.reply(
`༺ ✰ CURAR PLAGAS ✰ ༻

> ✰ Esa parcela no existe o no está infectada.`
      )
    }

    return m.reply(
`༺ ✰ PLAGAS ELIMINADAS ✰ ༻

> ✰ La planta vuelve a crecer con normalidad.`
    )
  }

  // ═══════════════════════════════════════
  // 🏪 TIENDA DE OBJETOS
  // ═══════════════════════════════════════
  if (['tiendaobjetos', 'farmshop'].includes(command)) {

    let txt =
`༺ ✰ TIENDA DE CUIDADOS ✰ ༻

`

    for (const [id, item] of Object.entries(itemsCatalog)) {
      txt +=
`> ✰ ${item.emoji} *${id.toUpperCase()}*
> ✰ Precio: *${item.price} ${config.CURRENCY_SYMBOL}*
> ✰ ${item.desc}

`
    }

    txt +=
`༺ ✰ COMPRAR ✰ ༻

> ✰ ${usedPrefix}comprarobjeto <objeto> <cantidad>`

    return m.reply(txt)
  }

  // ═══════════════════════════════════════
  // 🛒 COMPRAR OBJETO
  // ═══════════════════════════════════════
  if (command === 'comprarobjeto') {

    const itemId = (args[0] || '').toLowerCase()
    const amount = Math.max(1, Number(args[1]) || 1)

    if (!itemId || !itemsCatalog[itemId]) {
      return m.reply(
`༺ ✰ OBJETO INVÁLIDO ✰ ༻

> ✰ No existe ese objeto.
> ✰ Revisá la tienda con:
> ✰ ${usedPrefix}tiendaobjetos`
      )
    }

    const res = await buyFarmItem(
      m.sender,
      itemId,
      amount
    )

    if (!res.ok) {

      if (res.reason === 'dailyLimit') {
        return m.reply(
`༺ ✰ LÍMITE DIARIO ✰ ༻

> ✰ El límite para este objeto es de *${res.limit}* al día.`
        )
      }

      if (res.reason === 'noMoney') {
        return m.reply(
`༺ ✰ SIN FONDOS ✰ ༻

> ✰ No tenés suficiente dinero para realizar la compra.`
        )
      }

      return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo realizar la compra.`
      )
    }

    return m.reply(
`༺ ✰ COMPRA REALIZADA ✰ ༻

> ✰ ${itemsCatalog[itemId].emoji} *${itemId.toUpperCase()}* ×${amount}
> ✰ Costo total: *${res.totalCost} ${config.CURRENCY_SYMBOL}*`
    )
  }

  // ═══════════════════════════════════════
  // 🧰 USAR OBJETO
  // ═══════════════════════════════════════
  if (command === 'usarobjeto') {

    const itemId = (args[0] || '').toLowerCase()
    const index = Number(args[1]) - 1

    if (!itemId) {
      return m.reply(
`༺ ✰ USAR OBJETO ✰ ༻

> ✰ Ejemplo:
> ✰ ${usedPrefix}usarobjeto fertilizante 1`
      )
    }

    const res = await useFarmItem(
      m.sender,
      itemId,
      isNaN(index) ? -1 : index
    )

    if (!res.ok) {

      if (res.reason === 'noStock') {
        return m.reply(
`༺ ✰ SIN STOCK ✰ ༻

> ✰ No tenés este objeto en el inventario.`
        )
      }

      if (res.reason === 'invalidPlot') {
        return m.reply(
`༺ ✰ PARCELA INVÁLIDA ✰ ༻

> ✰ Indicá una parcela que esté creciendo actualmente.`
        )
      }

      return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo utilizar el objeto.`
      )
    }

    if (res.effect === 'reduce_time') {
      return m.reply(
`༺ ✰ FERTILIZANTE APLICADO ✰ ༻

> ✰ El tiempo de crecimiento se redujo un 15%.`
      )
    }

    if (res.effect === 'anti_plaga') {
      return m.reply(
`༺ ✰ PESTICIDA APLICADO ✰ ༻

> ✰ Tu granja está protegida de plagas durante 24 horas.`
      )
    }

    if (res.effect === 'anti_sequia') {
      return m.reply(
`༺ ✰ ASPERSOR ACTIVADO ✰ ༻

> ✰ Tu granja está protegida de sequías durante 24 horas.`
      )
    }

    if (res.effect === 'anti_pudricion') {
      return m.reply(
`༺ ✰ ESPANTAPÁJAROS COLOCADO ✰ ༻

> ✰ Tus plantas durarán 24 horas extra antes de pudrirse.`
      )
    }
  }

  // ═══════════════════════════════════════
  // 🎒 INVENTARIO
  // ═══════════════════════════════════════
  if (command === 'inventariofarm') {

    const farm = await getFarmData(m.sender)

    let txt =
`༺ ✰ INVENTARIO DE CUIDADOS ✰ ༻

`

    let hay = false

    for (const [id, cant] of Object.entries(farm.items)) {

      if (cant > 0 && itemsCatalog[id]) {
        txt +=
`> ✰ ${itemsCatalog[id].emoji} *${id.toUpperCase()}*: ${cant}
`
        hay = true
      }
    }

    if (!hay) {
      txt += `> ✰ No tenés objetos especiales.\n`
    }

    txt +=
`
༺ ✰ PROTECCIONES ACTIVAS ✰ ༻

`

    const now = Date.now()

    const p =
      farm.buffs.anti_plaga > now
        ? 'Activo ✅'
        : 'Inactivo ❌'

    const s =
      farm.buffs.anti_sequia > now
        ? 'Activo ✅'
        : 'Inactivo ❌'

    const pu =
      farm.buffs.anti_pudricion > now
        ? 'Activo ✅'
        : 'Inactivo ❌'

    txt +=
`> ✰ 🧪 Pesticida: ${p}
> ✰ 🚿 Aspersor: ${s}
> ✰ 🎃 Espantapájaros: ${pu}`

    return m.reply(txt)
  }
}

// ═══════════════════════════════════════
// 📚 CONFIGURACIÓN
// ═══════════════════════════════════════

handler.help = [
  'regar <n>',
  'curar <n>',
  'tiendaobjetos',
  'farmshop',
  'comprarobjeto <objeto> <cantidad>',
  'usarobjeto <objeto> <parcela>',
  'inventariofarm'
]

handler.tags = ['rpg']

handler.command = [
  'regar',
  'curar',
  'curarplagas',
  'tiendaobjetos',
  'farmshop',
  'comprarobjeto',
  'usarobjeto',
  'inventariofarm'
]

handler.register = true

export default handler