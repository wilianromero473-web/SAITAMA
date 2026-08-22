import { seedsCatalog, plantSeed, getFarmData } from '../../lib/games/rpg/rpgFarm.js'

const handler = async (m, { command, args, usedPrefix }) => {
  const seed = (args[0] || '').toLowerCase()
  const esTodo = seed === 'todo' || seed === 'all'

  const farm = await getFarmData(m.sender)

  const hasSeeds =
    farm.seeds &&
    Object.values(farm.seeds).some(amount => amount > 0)

  if (!hasSeeds) {
    return m.reply(
`*༺ ✰ 🌱 SIN SEMILLAS ✰ ༻*

> ✰ No tenés semillas disponibles.
> ✰ Comprá con:
> ${usedPrefix}comprarsemilla <semilla> <cantidad>`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PLANTAR TODO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (esTodo) {
    let totalPlantadas = 0
    const plantadasDesc = {}

    for (const [s, cantidad] of Object.entries(farm.seeds)) {
      if (cantidad <= 0) continue

      while (true) {
        const actual = await getFarmData(m.sender)

        if (
          actual.plots.length >= actual.maxPlots ||
          !actual.seeds[s] ||
          actual.seeds[s] <= 0
        ) {
          break
        }

        const result = await plantSeed(m.sender, s)

        if (!result.ok) break

        plantadasDesc[s] =
          (plantadasDesc[s] || 0) + 1

        totalPlantadas++
      }
    }

    if (totalPlantadas === 0) {
      return m.reply(
`*༺ ✰ ❌ PARCELAS LLENAS ✰ ༻*

> ✰ No tenés espacio disponible para plantar.`
      )
    }

    const lista = Object.entries(plantadasDesc)
      .map(([s, cantidad]) =>
        `> ${seedsCatalog[s]?.emoji || '🌱'} ${s.toUpperCase()} ×${cantidad}`
      )
      .join('\n')

    const farmFinal = await getFarmData(m.sender)
    const libres =
      farmFinal.maxPlots -
      farmFinal.plots.length

    return m.reply(
`*༺ ✰ 🌾 PLANTADO TODO ✰ ༻*

${lista}

> ✰ Parcelas plantadas: *${totalPlantadas}*
> ✰ Espacio restante: *${libres}*`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MOSTRAR SEMILLAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!seed) {
    const lista = Object.entries(farm.seeds)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([item, cantidad]) =>
        `> ${seedsCatalog[item]?.emoji || '🌱'} ${item.toUpperCase()} — 📦 ${cantidad}`
      )
      .join('\n')

    return m.reply(
`*༺ ✰ 🌾 TUS SEMILLAS ✰ ༻*

${lista}

> ✰ Usá:
> ${usedPrefix}plantar <semilla>
> ${usedPrefix}plantar todo`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDAR SEMILLA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!seedsCatalog[seed]) {
    return m.reply(
`*༺ ✰ ❌ SEMILLA INVÁLIDA ✰ ༻*

> ✰ La semilla *${seed}* no existe.
> ✰ Usá ${usedPrefix}plantar para ver tus semillas.`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PLANTAR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const result = await plantSeed(
    m.sender,
    seed
  )

  if (!result.ok) {
    if (result.reason === 'noSeeds') {
      return m.reply(
`*༺ ✰ ❌ SIN STOCK ✰ ༻*

> ✰ No tenés semillas de *${seed}*.`
      )
    }

    if (result.reason === 'noSpace') {
      return m.reply(
`*༺ ✰ ❌ SIN ESPACIO ✰ ༻*

> ✰ No tenés parcelas disponibles.
> ✰ Usadas: *${farm.plots.length}/${farm.maxPlots}*`
      )
    }

    return m.reply(
`*༺ ✰ ❌ ERROR ✰ ༻*

> ✰ No se pudo plantar la semilla.`
    )
  }

  const tiempoMin =
    Math.floor(
      seedsCatalog[seed].growTime / 60000
    )

  return m.reply(
`*༺ ✰ ${seedsCatalog[seed].emoji} PLANTADO ✰ ༻*

> ✰ Semilla: *${seed.toUpperCase()}*
> ✰ Crecimiento: *${tiempoMin} min*

> ✰ Usá *${usedPrefix}parcelas* para ver el progreso.`
  )
}

handler.help = [
  'plantar <semilla>',
  'plantar todo'
]

handler.tags = ['rpg']

handler.command = [
  'plantar',
  'sembrar'
]

handler.register = true

export default handler