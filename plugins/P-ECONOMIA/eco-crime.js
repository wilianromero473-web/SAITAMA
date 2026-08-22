import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const crimes = [
  { t: "🏦 Robo al Banco Central", g: 4000, p: 0.15, h: "Entraste con un equipo de hackers y saliste por la puerta grande." },
  { t: "🏧 Hackeo de Cajero", g: 1800, p: 0.35, h: "Instalaste un malware y el cajero empezó a escupir billetes." },
  { t: "🍭 Robo al Dulce", g: 120, p: 0.95, h: "Fue fácil, pero el dulce estaba rico." },
  { t: "🎭 Estafa Piramidal", g: 5000, p: 0.10, h: "Les vendiste criptomonedas inexistentes. Eres un genio del mal." },
  { t: "🧥 Hurto en Shopping", g: 700, p: 0.65, h: "Le quitaste el sensor a una campera cara y saliste silbando." },
  { t: "🚗 Robo de Tesla", g: 2500, p: 0.25, h: "Hackeaste el modo autónomo y el auto vino solo a tu casa." },
  { t: "💎 Joyería de Lujo", g: 3500, p: 0.20, h: "Rompiste el cristal, agarraste los diamantes y escapaste en moto." },
  { t: "📱 iPhone de Exhibición", g: 900, p: 0.55, h: "Cortaste el cable de seguridad con una pinza y desapareciste." },
  { t: "⛽ Nafta sin pagar", g: 400, p: 0.80, h: "Llenaste el tanque y aceleraste antes de que el playero reaccionara." },
  { t: "🚲 Bici de Repartidor", g: 300, p: 0.85, h: "El pobre repartidor subió al 5to piso y se quedó a pie." },
  { t: "🚢 Yate abandonado", g: 3200, p: 0.20, h: "Lo remolcaste hasta un puerto clandestino." },
  { t: "🛰️ Datos Militares", g: 4500, p: 0.12, h: "Interceptaste una señal de satélite y vendiste los secretos." },
  { t: "🖼️ Museo de Arte", g: 3800, p: 0.18, h: "Cambiaste una obra original por un dibujo de tu primo." },
  { t: "👜 Cartera de marca", g: 600, p: 0.70, h: "Un tirón rápido y conseguiste una cartera de lujo." },
  { t: "⌚ Reloj de Turista", g: 1100, p: 0.45, h: "Le preguntaste la hora y conseguiste el reloj." },
  { t: "🧪 Fórmula Secreta", g: 2200, p: 0.30, h: "Robaste una fórmula secreta, pero resultó ser agua con azúcar." },
  { t: "🗳️ Votos Falsos", g: 1400, p: 0.40, h: "Alteraste los resultados de un concurso ficticio." },
  { t: "🍿 Colada en el Cine", g: 150, p: 0.90, h: "Pasaste por la puerta de salida y viste la película gratis." },
  { t: "🐕 Perro con Pedigree", g: 2000, p: 0.30, h: "Lo devolviste a cambio de la recompensa. Negocio redondo." },
  { t: "🎸 Guitarra de Rock", g: 2600, p: 0.25, h: "Era la guitarra de una leyenda, o eso decía el anuncio." },
  { t: "🍇 Uvas en el Super", g: 50, p: 0.98, h: "Te comiste medio kilo antes de llegar a la caja." },
  { t: "📬 Correo del Vecino", g: 200, p: 0.80, h: "Encontraste un premio dentro. ¡Qué suerte!" },
  { t: "🚓 Ruedas de Patrullero", g: 500, p: 0.60, h: "La patrulla quedó temporalmente fuera de servicio." },
  { t: "📉 Fraude Fiscal", g: 3100, p: 0.22, h: "Intentaste declarar al bot como una organización ficticia." },
  { t: "🧀 Queso en Fiambrería", g: 250, p: 0.85, h: "Un enorme trozo de parmesano terminó en tu mochila." },
  { t: "🍗 Pollo Asado", g: 180, p: 0.88, h: "Terminaste con el almuerzo en la mano." },
  { t: "🕶️ Lentes de Lujo", g: 550, p: 0.75, h: "Te los probaste, te miraste al espejo y saliste caminando." },
  { t: "🎮 PlayStation 5", g: 1300, p: 0.40, h: "Una consola terminó misteriosamente en tu inventario." },
  { t: "📦 Paquete", g: 450, p: 0.78, h: "Encontraste un paquete abandonado con algo valioso." },
  { t: "🎅 Regalos de Navidad", g: 800, p: 0.65, h: "Te llevaste unas cajas y te creíste el Grinch." },
  { t: "🥂 Cena de Gala", g: 1200, p: 0.40, h: "Comiste de todo y desapareciste antes de pagar." },
  { t: "🧹 Escoba", g: 80, p: 0.92, h: "No vale mucho, pero conseguiste venderla." },
  { t: "🧸 Oso Gigante", g: 350, p: 0.80, h: "Ganaste un enorme premio de feria." },
  { t: "💊 Farmacia", g: 1600, p: 0.35, h: "Conseguiste suministros y los intercambiaste." },
  { t: "🎫 Reventa de Entradas", g: 2100, p: 0.28, h: "Conseguiste entradas que tenían bastante demanda." },
  { t: "🧺 Ropa del Tendedero", g: 150, p: 0.90, h: "Terminaste con varias prendas en tu inventario." },
  { t: "🛶 Canoa del Lago", g: 750, p: 0.60, h: "Una canoa terminó misteriosamente en otro pueblo." },
  { t: "📻 Radio de Auto", g: 300, p: 0.82, h: "Encontraste una radio antigua bastante valiosa." },
  { t: "🧴 Perfumes", g: 1400, p: 0.38, h: "Terminaste con varios perfumes de diseñador." },
  { t: "🍕 Pizza ajena", g: 120, p: 0.95, h: "El delivery se confundió de casa y tuviste suerte." },
  { t: "🛹 Skate", g: 400, p: 0.75, h: "Encontraste una tabla bastante buena." },
  { t: "🔧 Caja de Herramientas", g: 650, p: 0.68, h: "Una caja de herramientas terminó en tus manos." },
  { t: "🔦 Linterna", g: 200, p: 0.85, h: "Conseguiste una linterna bastante potente." },
  { t: "🪁 Cometa", g: 50, p: 0.98, h: "Una cometa cayó justo cerca de ti." },
  { t: "🧥 Abrigo de Lujo", g: 2800, p: 0.20, h: "Conseguiste un abrigo muy costoso." },
  { t: "📚 Libros de Texto", g: 950, p: 0.50, h: "Encontraste varios libros con buen valor de reventa." },
  { t: "🎤 Micrófono de Karaoke", g: 450, p: 0.72, h: "Terminaste la noche con un micrófono en tu poder." },
  { t: "🥃 Botella de Whisky", g: 1100, p: 0.42, h: "Encontraste una botella de colección." },
  { t: "🛴 Monopatín Eléctrico", g: 850, p: 0.58, h: "Conseguiste un nuevo medio de transporte." },
  { t: "🛐 Reliquia del Templo", g: 5000, p: 0.08, h: "Encontraste una antigua estatuilla de gran valor." }
]

const SEP = '─'.repeat(28)

const tiempoRestante = ms => {
  const minutos = Math.floor(ms / 60000)
  const segundos = Math.floor((ms % 60000) / 1000)

  return `${minutos}m ${segundos}s`
}

const handler = async (m, { userDb }) => {
  if (!userDb) return

  const COOLDOWN = 20 * 60 * 1000
  const now = Date.now()
  const lastCrime = Number(userDb.lastCrime || 0)
  const remaining = COOLDOWN - (now - lastCrime)

  if (remaining > 0) {
    return m.reply(
`༺ 𝙲𝚁𝙸𝙼𝙴𝙽 ༻

✰ 𝙱𝚊𝚓𝚘 𝚟𝚒𝚐𝚒𝚕𝚊𝚗𝚌𝚒𝚊

> ✰ 𝙻𝚘𝚜 𝚝𝚎𝚜𝚝𝚒𝚐𝚘𝚜 𝚎𝚜𝚝á𝚗 𝚍𝚎𝚌𝚕𝚊𝚛𝚊𝚗𝚍𝚘 𝚊𝚗𝚝𝚎 𝚕𝚊 𝚙𝚘𝚕𝚒𝚌í𝚊.

> ✰ 𝙴𝚜𝚌ó𝚗𝚍𝚎𝚝𝚎 𝚙𝚘𝚛: *${tiempoRestante(remaining)}*

${SEP}

> ✰ ${config.footer}`
    )
  }

  userDb.dailyStats = userDb.dailyStats || {}
  userDb.inventory = userDb.inventory || {}

  let successChance = 0.45
  let usedBuff = false

  const update = {
    $inc: {},
    $set: {
      lastCrime: now
    }
  }

  /*
   * MÁSCARA:
   * Si existe y todavía no fue utilizada hoy,
   * garantiza el éxito del crimen.
   */
  if (userDb.inventory.mask && !userDb.dailyStats.maskUsed) {
    successChance = 1
    usedBuff = true

    userDb.dailyStats.maskUsed = true
    update.$set['dailyStats.maskUsed'] = true
  }

  const plan = crimes[Math.floor(Math.random() * crimes.length)]

  userDb.lastCrime = now

  if (Math.random() < successChance) {

    const botin = plan.g + ((userDb.level || 0) * 40)

    userDb.genosCoins = (userDb.genosCoins || 0) + botin

    update.$inc.genosCoins = botin

    let txt =
`༺ 𝙲𝚁𝙸𝙼𝙴𝙽 ༻

✰ 𝙶𝙾𝙻𝙿𝙴 𝙴𝚇𝙸𝚃𝙾𝚂𝙾

> ✰ 𝙳𝚎𝚕𝚒𝚝𝚘: *${plan.t}*

> ✰ 𝙱𝚘𝚝í𝚗: *+${botin.toLocaleString('es-AR')} ${config.CURRENCY_NAME}*

`

    if (usedBuff) {
      txt +=
`> ✰ 𝙱𝚞𝚏𝚏 𝙼á𝚜𝚌𝚊𝚛𝚊: *𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾* ✅

`
    }

    txt +=
`✰ 𝙷𝚒𝚜𝚝𝚘𝚛𝚒𝚊

> ${plan.h}

${SEP}

> ✰ ${config.footer}`

    await m.reply(txt)

  } else {

    const multa = Math.floor(plan.g / 2)
    const loss = Math.min(userDb.genosCoins || 0, multa)

    userDb.genosCoins = Math.max(
      0,
      (userDb.genosCoins || 0) - loss
    )

    update.$inc.genosCoins = -loss

    const txt =
`༺ 𝙲𝚁𝙸𝙼𝙴𝙽 ༻

✰ 𝙶𝙾𝙻𝙿𝙴 𝙵𝙰𝙻𝙻𝙸𝙳𝙾

> ✰ 𝙻𝚊 𝚙𝚘𝚕𝚒𝚌í𝚊 𝚝𝚎 𝚍𝚎𝚝𝚞𝚟𝚘.

> ✰ 𝙳𝚎𝚕𝚒𝚝𝚘: *${plan.t}*

> ✰ 𝙼𝚞𝚕𝚝𝚊: *-${loss.toLocaleString('es-AR')} ${config.CURRENCY_NAME}*

${SEP}

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎 𝚖á𝚜 𝚝𝚊𝚛𝚍𝚎.

> ✰ ${config.footer}`

    await m.reply(txt)
  }

  await User.updateOne(
    { jid: m.sender },
    update
  )
}

handler.help = ['crimen']
handler.tags = ['eco']
handler.command = ['crime', 'crimen']
handler.register = true

export default handler