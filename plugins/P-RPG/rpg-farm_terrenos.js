import config from '../../config.js'
import {
  getFarmData,
  TERRAINS,
  buyTerrain,
  buyPlot
} from '../../lib/games/rpg/rpgFarm.js'

const handler = async (
  m,
  {
    command,
    usedPrefix,
    userDb
  }
) => {

  if (!userDb) return

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VER TERRENOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (['terrenos', 'miterreno'].includes(command)) {

    const farm = await getFarmData(m.sender)

    const current =
      TERRAINS.find(
        terrain => terrain.level === farm.terrainLevel
      ) || TERRAINS[0]

    const next =
      TERRAINS.find(
        terrain => terrain.level === farm.terrainLevel + 1
      )

    const plotCost =
      2000 + (farm.maxPlots * 1000)

    let txt =
`*༺ ✰ 🗺️ BIENES RAÍCES RURALES ✰ ༻*

> ✰ Terreno nivel: *${current.level}*
> ✰ Capacidad: *${farm.maxPlots} / ${current.capacity}* parcelas

*༺ ✰ 🌱 AMPLIAR PARCELAS ✰ ༻*

`

    if (farm.maxPlots < current.capacity) {

      txt +=
`> ✰ Podés comprar 1 parcela adicional.
> ✰ Precio: *${plotCost} ${config.CURRENCY_SYMBOL}*
> ✰ Uso: *${usedPrefix}comprarparcela*

`

    } else {

      txt +=
`> ✰ Alcanzaste el límite de este terreno.
> ✰ Comprá el siguiente nivel para continuar.

`
    }

    txt += `*༺ ✰ 🗺️ EXPANDIR TERRENO ✰ ༻*\n\n`

    if (next) {

      txt +=
`> ✰ Próximo terreno: *Nivel ${next.level}*
> ✰ Capacidad: *${next.capacity} parcelas*
> ✰ Costo: *${next.cost} ${config.CURRENCY_SYMBOL}*
> ✰ Uso: *${usedPrefix}comprarterreno*`

    } else {

      txt +=
`> ✰ ¡Ya tenés el terreno más grande disponible!`

    }

    return m.reply(txt)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPRAR TERRENO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (command === 'comprarterreno') {

    const res =
      await buyTerrain(m.sender)

    if (!res.ok) {

      if (res.reason === 'maxLevel') {
        return m.reply(
`*༺ ✰ ❌ NIVEL MÁXIMO ✰ ༻*

> ✰ Ya tenés el terreno más grande disponible.`
        )
      }

      if (res.reason === 'noMoney') {
        return m.reply(
`*༺ ✰ 💸 SIN FONDOS ✰ ༻*

> ✰ Necesitás *${res.cost} ${config.CURRENCY_SYMBOL}* para comprar este terreno.`
        )
      }

      return m.reply(
`*༺ ✰ ❌ ERROR ✰ ༻*

> ✰ No se pudo comprar el terreno.`
      )
    }

    return m.reply(
`*༺ ✰ 🏡 TERRENO EXPANDIDO ✰ ༻*

> ✰ Nuevo nivel: *${res.level}*
> ✰ Capacidad máxima: *${res.capacity} parcelas*
> ✰ La expansión se realizó correctamente.`
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPRAR PARCELA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (command === 'comprarparcela') {

    const res =
      await buyPlot(m.sender)

    if (!res.ok) {

      if (res.reason === 'terrainFull') {
        return m.reply(
`*༺ ✰ 🚫 LÍMITE ALCANZADO ✰ ༻*

> ✰ No caben más parcelas en tu terreno.
> ✰ Usá *${usedPrefix}comprarterreno* para expandirte.`
        )
      }

      if (res.reason === 'noMoney') {
        return m.reply(
`*༺ ✰ 💸 SIN FONDOS ✰ ༻*

> ✰ Necesitás *${res.cost} ${config.CURRENCY_SYMBOL}* para agregar una parcela.`
        )
      }

      return m.reply(
`*༺ ✰ ❌ ERROR ✰ ༻*

> ✰ No se pudo comprar la parcela.`
      )
    }

    return m.reply(
`*༺ ✰ 🌱 PARCELA AÑADIDA ✰ ༻*

> ✰ Costo: *${res.cost} ${config.CURRENCY_SYMBOL}*
> ✰ Total de parcelas: *${res.maxPlots}*
> ✰ Ya podés utilizarla para cultivar.`
    )
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'terrenos',
  'miterreno',
  'comprarterreno',
  'comprarparcela'
]

handler.tags = ['rpg']

handler.command = [
  'terrenos',
  'miterreno',
  'comprarterreno',
  'comprarparcela'
]

handler.register = true

export default handler