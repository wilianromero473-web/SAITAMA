import {
  seedsCatalog,
  checkPlots,
  harvestPlot,
  getFarmData
} from '../../lib/games/rpg/rpgFarm.js'

const remainingTime = (plot) => {
  const remaining = plot.growTime - plot.progress

  return {
    min: Math.max(0, Math.floor(remaining / 60000)),
    seg: Math.max(
      0,
      Math.floor((remaining % 60000) / 1000)
    )
  }
}

const handler = async (
  m,
  {
    command,
    args,
    usedPrefix
  }
) => {

  // ═══════════════════════════════════════
  // 🌾 PARCELAS / CULTIVO
  // ═══════════════════════════════════════

  if (['parcelas', 'cultivo'].includes(command)) {

    const plots = await checkPlots(m.sender)
    const farm = await getFarmData(m.sender)

    const max = farm.maxPlots
    const usadas = plots.length
    const libres = max - usadas

    if (!usadas) {
      return m.reply(
`༺ ✰ SIN CULTIVOS ✰ ༻

> ✰ 📊 Usadas: *0/${max}*
> ✰ 📂 Libres: *${libres}*

༺ ✰ ACCIONES ✰ ༻

> ✰ 🌱 Empezá con:
> ✰ ${usedPrefix}plantar <semilla>

> ✰ 🏪 Tienda:
> ✰ ${usedPrefix}tiendacultivo`
      )
    }

    let listas = 0
    let plotsTexto = ''

    plots.forEach((plot, i) => {

      const { seed } = plot
      const emoji =
        seedsCatalog[seed]?.emoji || '🌱'

      // ───────────────────────────────
      // 💀 PLANTA MUERTA
      // ───────────────────────────────

      if (plot.state === 'dead') {

        const causa =
          plot.deadReason === 'sequía'
            ? 'Seca 💧'
            : 'Comida por plagas 🐛'

        plotsTexto +=
`> ✰ 💀 *${i + 1}. ${seed.toUpperCase()}* — MUERTA
> ✰ Causa: ${causa}
> ✰ Cosechá para limpiar la parcela.

`

      // ───────────────────────────────
      // 🪰 PLANTA PODRIDA
      // ───────────────────────────────

      } else if (plot.state === 'rotten') {

        plotsTexto +=
`> ✰ 🪰 💀 *${i + 1}. ${seed.toUpperCase()}* — PODRIDA
> ✰ Causa: Abandono
> ✰ Cosechá para limpiar la parcela.

`

      // ───────────────────────────────
      // 🟢 LISTA
      // ───────────────────────────────

      } else if (plot.state === 'ready') {

        listas++

        plotsTexto +=
`> ✰ ${emoji} 🟢 *${i + 1}. ${seed.toUpperCase()}* — LISTA

`

      // ───────────────────────────────
      // 💧 NECESITA AGUA
      // ───────────────────────────────

      } else if (plot.needsWater) {

        plotsTexto +=
`> ✰ 💧 ⚠️ *${i + 1}. ${seed.toUpperCase()}* — NECESITA AGUA
> ✰ Usá: ${usedPrefix}regar ${i + 1}

`

      // ───────────────────────────────
      // 🐛 PLAGA
      // ───────────────────────────────

      } else if (plot.infected) {

        plotsTexto +=
`> ✰ 🐛 ⚠️ *${i + 1}. ${seed.toUpperCase()}* — PLAGA DETECTADA
> ✰ Usá: ${usedPrefix}curar ${i + 1}

`

      // ───────────────────────────────
      // 🌱 CRECIENDO
      // ───────────────────────────────

      } else {

        const t = remainingTime(plot)
        const grow = plot.growTime

        const progress =
          Math.min(
            1,
            plot.progress / grow
          )

        const filled =
          Math.round(progress * 10)

        const barra =
          '█'.repeat(filled) +
          '░'.repeat(10 - filled)

        const porcentaje =
          Math.floor(progress * 100)

        plotsTexto +=
`> ✰ ${emoji} 🟡 *${i + 1}. ${seed.toUpperCase()}*
> ✰ Tiempo: *${t.min}m ${t.seg}s*
> ✰ Progreso: [${barra}] ${porcentaje}%

`
      }
    })

    const footer =
      listas > 0
        ? `༺ ✰ COSECHA DISPONIBLE ✰ ༻\n\n> ✰ ✅ *${listas}* parcelas listas.\n> ✰ Usá: *${usedPrefix}cosechar todo*`
        : `༺ ✰ ESTADO ✰ ༻\n\n> ✰ 🌱 Tus cultivos todavía están creciendo.`

    return m.reply(
`༺ ✰ TUS PARCELAS ✰ ༻

> ✰ 📊 Usadas: *${usadas}/${max}*
> ✰ 📂 Libres: *${libres}*

${plotsTexto}${footer}`
    )
  }

  // ═══════════════════════════════════════
  // 🌾 COSECHAR
  // ═══════════════════════════════════════

  if (['cosechar', 'recolectar'].includes(command)) {

    const plots = await checkPlots(m.sender)

    if (!plots || !plots.length) {
      return m.reply(
`༺ ✰ SIN PARCELAS ✰ ༻

> ✰ No tenés parcelas plantadas.
> ✰ Usá ${usedPrefix}plantar <semilla> para comenzar.`
      )
    }

    const opcion =
      (args[0] || '').toLowerCase()

    // ═══════════════════════════════════
    // 🌾 COSECHAR TODO
    // ═══════════════════════════════════

    if (
      opcion === 'todo' ||
      opcion === 'all'
    ) {

      const listas = plots
        .map((plot, i) => ({
          ...plot,
          index: i
        }))
        .filter(
          plot =>
            plot.state === 'ready' ||
            plot.state === 'dead' ||
            plot.state === 'rotten'
        )
        .sort(
          (a, b) =>
            b.index - a.index
        )

      if (!listas.length) {
        return m.reply(
`༺ ✰ NADA PARA RECOGER ✰ ༻

> ✰ Ninguna parcela está lista para cosechar.
> ✰ Revisá tus cultivos con:
> ✰ ${usedPrefix}parcelas`
        )
      }

      let totalFXP = 0
      const acumulado = {}
      let perdidas = 0

      for (const plot of listas) {

        const result =
          await harvestPlot(
            m.sender,
            plot.index
          )

        if (!result.ok) continue

        if (
          result.lost ||
          result.rotten
        ) {

          perdidas++

        } else {

          totalFXP +=
            result.farmerXp

          acumulado[result.item] =
            (acumulado[result.item] || 0) +
            result.amount
        }
      }

      let listaItems =
        Object.entries(acumulado)
          .map(
            ([item, amount]) =>
`> ✰ ${seedsCatalog[item]?.emoji || '🌱'} *${item.toUpperCase()}* ×${amount}`
          )
          .join('\n')

      if (perdidas > 0) {

        listaItems +=
`\n> ✰ 💀 Plantas perdidas limpiadas: *${perdidas}*`
      }

      // ═════════════════════════════════
      // 🧹 SOLO LIMPIEZA
      // ═════════════════════════════════

      if (
        Object.keys(acumulado).length === 0 &&
        perdidas > 0
      ) {

        return m.reply(
`༺ ✰ LIMPIEZA COMPLETA ✰ ༻

> ✰ 🧹 Limpiaste *${perdidas}* plantas muertas de tu terreno.
> ✰ No obtuviste cosechas.`
        )
      }

      return m.reply(
`༺ ✰ COSECHA COMPLETA ✰ ༻

${listaItems}

༺ ✰ RECOMPENSAS ✰ ༻

> ✰ 🌟 XP Granjero: *+${totalFXP}*

༺ ✰ CONSEJO ✰ ༻

> ✰ 💡 ¡No vendas los productos crudos!
> ✰ Cocinarlos puede darte más dinero.`
      )
    }

    // ═══════════════════════════════════
    // 🌱 COSECHAR PARCELA INDIVIDUAL
    // ═══════════════════════════════════

    const index =
      Number(opcion) - 1

    if (
      isNaN(index) ||
      index < 0
    ) {

      return m.reply(
`༺ ✰ COSECHAR ✰ ༻

> ✰ Indicá un número de parcela válido.

> ✰ Ejemplo:
> ✰ ${usedPrefix}cosechar 1

> ✰ También podés usar:
> ✰ ${usedPrefix}cosechar todo`
      )
    }

    if (!plots[index]) {
      return m.reply(
`༺ ✰ PARCELA INEXISTENTE ✰ ༻

> ✰ Esa parcela no existe.
> ✰ Revisá tus parcelas con:
> ✰ ${usedPrefix}parcelas`
      )
    }

    if (
      plots[index].state === 'growing'
    ) {

      return m.reply(
`༺ ✰ AÚN NO ✰ ༻

> ✰ 🌱 La planta todavía está creciendo.
> ✰ Esperá a que esté lista para cosechar.`
      )
    }

    const result =
      await harvestPlot(
        m.sender,
        index
      )

    if (!result.ok) {
      return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo cosechar la parcela.`
      )
    }

    // ═════════════════════════════════
    // 💀 PLANTA PERDIDA
    // ═════════════════════════════════

    if (
      result.lost ||
      result.rotten
    ) {

      return m.reply(
`༺ ✰ PLANTA PERDIDA ✰ ༻

> ✰ 💀 Limpiaste los restos de:
> ✰ *${result.item.toUpperCase()}*

> ✰ La parcela quedó disponible nuevamente.`
      )
    }

    // ═════════════════════════════════
    // 🌾 COSECHA EXITOSA
    // ═════════════════════════════════

    return m.reply(
`༺ ✰ COSECHADO ✰ ༻

> ✰ ${seedsCatalog[result.item]?.emoji || '🌱'} *${result.item.toUpperCase()}* ×${result.amount}

༺ ✰ RECOMPENSA ✰ ༻

> ✰ 🌟 XP Granjero: *+${result.farmerXp}*`
    )
  }
}

// ═══════════════════════════════════════
// 📚 CONFIGURACIÓN
// ═══════════════════════════════════════

handler.help = [
  'parcelas',
  'cultivo',
  'cosechar [n|todo]',
  'recolectar [n|todo]'
]

handler.tags = [
  'rpg'
]

handler.command = [
  'parcelas',
  'cultivo',
  'cosechar',
  'recolectar'
]

handler.register = true

export default handler