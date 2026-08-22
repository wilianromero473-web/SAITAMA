import {
  seedsCatalog,
  recipes,
  getFarmData
} from '../../lib/games/rpg/rpgFarm.js'

const handler = async (m, { usedPrefix }) => {

  // ═══════════════════════════════════════
  // 🌾 OBTENER DATOS DE LA GRANJA
  // ═══════════════════════════════════════

  const farm = await getFarmData(m.sender)

  const hasHarvest =
    Array.isArray(farm.harvest) &&
    farm.harvest.length > 0

  const hasFood =
    Array.isArray(farm.food) &&
    farm.food.length > 0

  const hasSeeds =
    farm.seeds &&
    Object.values(farm.seeds).some(amount => amount > 0)

  // ═══════════════════════════════════════
  // 📦 GRANERO VACÍO
  // ═══════════════════════════════════════

  if (!hasHarvest && !hasFood && !hasSeeds) {
    return m.reply(
`༺ ✰ GRANERO VACÍO ✰ ༻

> ✰ No tenés nada guardado.
> ✰ Comprá semillas y empezá a plantar.`
    )
  }

  let texto =
`༺ ✰ TU GRANERO ✰ ༻

`

  // ═══════════════════════════════════════
  // 🌱 SEMILLAS
  // ═══════════════════════════════════════

  if (hasSeeds) {

    texto +=
`༺ ✰ SEMILLAS ✰ ༻

`

    for (const [item, amount] of Object.entries(farm.seeds)) {

      if (amount > 0) {
        texto +=
`> ✰ ${seedsCatalog[item]?.emoji || '🌱'} ${item.toUpperCase()}: *${amount}*
`
      }
    }

    texto += '\n'
  }

  // ═══════════════════════════════════════
  // 📦 COSECHAS
  // ═══════════════════════════════════════

  if (hasHarvest) {

    texto +=
`༺ ✰ COSECHAS ✰ ༻

`

    farm.harvest.forEach(harvest => {

      texto +=
`> ✰ ${seedsCatalog[harvest.item]?.emoji || '📦'} ${harvest.item.toUpperCase()}: *${harvest.amount}*
`
    })

    texto += '\n'
  }

  // ═══════════════════════════════════════
  // 🍲 COMIDA PREPARADA
  // ═══════════════════════════════════════

  if (hasFood) {

    texto +=
`༺ ✰ COMIDA PREPARADA ✰ ༻

`

    farm.food.forEach(food => {

      const recipeKey = Object.keys(recipes).find(
        key => recipes[key].gives.food === food.item
      )

      const emoji = recipeKey
        ? recipes[recipeKey].emoji
        : '🍽️'

      texto +=
`> ✰ ${emoji} ${food.item.toUpperCase()}: *${food.amount}*
`
    })

    texto += '\n'
  }

  // ═══════════════════════════════════════
  // 🔗 ACCIONES
  // ═══════════════════════════════════════

  texto +=
`༺ ✰ ACCIONES ✰ ༻

> ✰ 🍳 Recetas: *${usedPrefix}recetas*
> ✰ 💰 Vender: *${usedPrefix}venderfarm*`

  return m.reply(texto)
}

// ═══════════════════════════════════════
// 📚 CONFIGURACIÓN
// ═══════════════════════════════════════

handler.help = [
  'granero'
]

handler.tags = [
  'rpg'
]

handler.command = [
  'granero',
  'almacen'
]

handler.register = true

export default handler