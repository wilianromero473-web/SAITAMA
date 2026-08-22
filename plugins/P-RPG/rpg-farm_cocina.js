import config from '../../config.js'
import {
  seedsCatalog,
  recipes,
  cookRecipe
} from '../../lib/games/rpg/rpgFarm.js'

const handler = async (m, { command, args, usedPrefix }) => {

  if (['recetas', 'cocinas'].includes(command)) {

    const lista = Object.entries(recipes)
      .sort((a, b) => a[1].gives.value - b[1].gives.value)
      .map(([id, d]) => {

        const reqs = Object.entries(d.requires)
          .map(([item, cant]) =>
            `${seedsCatalog[item]?.emoji || '📦'} ${item}: *${cant}*`
          )
          .join(' · ')

        return (
`༺ ✰ ${d.emoji} ${id.toUpperCase()} ✰ ༻

> ✰ Ingredientes: ${reqs}
> ✰ XP: ${d.gives.xp}
> ✰ Valor: ${d.gives.value} ${config.CURRENCY_SYMBOL}`
        )
      })
      .join('\n\n')

    return m.reply(
`༺ ✰ LIBRO DE RECETAS ✰ ༻

> ✰ Aquí tienes todas las recetas disponibles:

${lista}

༺ ✰ COCINA ✰ ༻

> ✰ Usa: ${usedPrefix}cocinar <receta>
> ✰ Ejemplo: ${usedPrefix}cocinar ensalada_basica`
    )
  }

  if (['cocinar', 'cook'].includes(command)) {

    const recipeName = (args[0] || '').toLowerCase()

    if (!recipeName || !recipes[recipeName]) {
      return m.reply(
`༺ ✰ COCINAR ✰ ༻

> ✰ Receta no encontrada.
> ✰ Usa ${usedPrefix}recetas para ver las disponibles.

> ✰ Ejemplo:
> ✰ ${usedPrefix}cocinar ensalada_basica`
      )
    }

    const result = await cookRecipe(
      m.sender,
      recipeName
    )

    if (!result.ok) {

      if (result.reason === 'noIngredients') {

        const reqs = Object.entries(
          recipes[recipeName].requires
        )
          .map(([item, cant]) =>
            `> ✰ ${seedsCatalog[item]?.emoji || '📦'} ${item}: *${cant}*`
          )
          .join('\n')

        return m.reply(
`༺ ✰ FALTAN INGREDIENTES ✰ ༻

> ✰ Necesitás para:
> ✰ ${recipeName.toUpperCase()}

${reqs}

༺ ✰ GRANERO ✰ ༻

> ✰ Revisá tus ingredientes con:
> ✰ ${usedPrefix}granero`
        )
      }

      return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo preparar la receta.
> ✰ Intentá nuevamente.`
      )
    }

    return m.reply(
`༺ ✰ COCINADO CON ÉXITO ✰ ༻

> ✰ Receta: ${recipes[recipeName].emoji} *${result.food.toUpperCase()}*
> ✰ XP Granjero: *+${result.xp}*
> ✰ Valor de venta: *${recipes[recipeName].gives.value} ${config.CURRENCY_SYMBOL}*

༺ ✰ VENTA ✰ ༻

> ✰ Podés venderlo con:
> ✰ ${usedPrefix}venderfarm ${recipeName}`
    )
  }
}

handler.help = [
  'recetas',
  'cocinar <receta>'
]

handler.tags = [
  'rpg'
]

handler.command = [
  'recetas',
  'cocinas',
  'cocinar',
  'cook'
]

handler.register = true

export default handler