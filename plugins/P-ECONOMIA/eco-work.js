import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const COOLDOWN = 10 * 60 * 1000
const SUIT_BONUS = 1.00

const jobs = [
  { n: '🧹 Limpiador de la NASA', h: 'Limpiaste los cristales del telescopio y encontraste una moneda pegada.' },
  { n: '🎭 Doble de riesgo', h: 'Hiciste una escena de película con seguridad y el presupuesto alcanzó para pagarte.' },
  { n: '👴 Instructor de abuelos', h: 'Le explicaste a 10 abuelos que el Wi-Fi no es magia negra. Te dieron propina.' },
  { n: '🌵 Vendedor de arena', h: 'Lograste vender arena en un lugar donde nadie la necesitaba. Eres un genio del marketing.' },
  { n: '☣️ Moderador de grupos', h: 'Sobreviviste 10 minutos moderando un grupo caótico. Te mereces un aumento.' },
  { n: '🇷🇺 Traductor de hackers', h: 'Ayudaste a descifrar un mensaje que decía "Admin123". Fue un trabajo duro.' },
  { n: '🐕 Paseador de perros', h: 'Los perros tenían más energía que vos, pero completaste el trabajo.' },
  { n: '🗿 Estatua viviente', h: 'No te moviste durante horas y todos quedaron impresionados con tu actuación.' },
  { n: '💌 Escritor de perfiles', h: 'Escribiste una descripción increíble y tu cliente quedó feliz con el resultado.' },
  { n: '💻 Guardián del Servidor', h: 'Evitaste que el servidor colapsara cuando alguien intentó instalar algo extraño.' },
  { n: '🎬 Extra de película', h: 'Apareciste durante dos segundos en una película y tu actuación fue épica.' },
  { n: '📱 Reparador de celulares', h: 'Arreglaste un teléfono antiguo que nadie quería tocar.' },
  { n: '🦄 Jinete de Unicornios', h: 'Era una criatura bastante extraña, pero el trabajo salió perfecto.' },
  { n: '🎮 Streamer de Buscaminas', h: 'Tuviste pocos espectadores, pero uno decidió apoyarte con una donación.' },
  { n: '🌬️ Embotellador de aire', h: 'Vendiste "Esencia de la Montaña". Era aire normal, pero el marketing funcionó.' },
  { n: '🧸 Cuidador de peluches', h: 'Cuidaste una enorme colección y ninguno desapareció.' },
  { n: '🤡 Payaso gótico', h: 'Preparaste una fiesta con una temática bastante peculiar.' },
  { n: '🧪 Probador de bebidas', h: 'Probaste una nueva bebida y diste tu opinión profesional.' },
  { n: '🍕 Crítico de pizza', h: 'Te pagaron para decidir cuál era la mejor combinación de ingredientes.' },
  { n: '🐜 Entrenador de hormigas', h: 'Conseguiste que un pequeño grupo de hormigas siguiera tu entrenamiento.' },
  { n: '🗳️ Contador de votos', h: 'Contaste todos los votos y entregaste los resultados correctamente.' },
  { n: '🦷 Hada de los dientes', h: 'Ayudaste a organizar las recompensas y no te sobró ni una moneda.' },
  { n: '🥑 Especialista en paltas', h: 'Elegiste las mejores paltas del mercado. Todo un profesional.' },
  { n: '🧙‍♂️ Aprendiz de mago', h: 'Aprendiste un truco nuevo y casi haces desaparecer tu sueldo.' },
  { n: '🛸 Avistador de OVNIS', h: 'Viste una luz extraña y descubriste que solo era una linterna.' },
  { n: '🧦 Buscador de medias', h: 'Encontraste una media perdida hace años. Un verdadero milagro.' },
  { n: '🧗 Limpiador de montañas', h: 'Ayudaste a retirar basura de una zona montañosa.' },
  { n: '🦓 Estilista de cebras', h: 'Ayudaste a preparar a una cebra para una sesión de fotos.' },
  { n: '🐄 Masajista de vacas', h: 'Ayudaste a cuidar a las vacas y recibiste una buena paga.' },
  { n: '📦 Probador de cajas', h: 'Probaste decenas de cajas para comprobar su resistencia.' },
  { n: '🧘 Gurú de piedras', h: 'Organizaste una sesión de meditación completamente silenciosa.' },
  { n: '🌑 Minero lunar', h: 'Encontraste un pequeño fragmento de roca que parecía venir del espacio.' },
  { n: '🕯️ Fabricante de velas', h: 'Creaste una fragancia tan extraña que terminó siendo un éxito.' },
  { n: '🧴 Catador de perfumes', h: 'Probaste tantas fragancias que ahora puedes reconocerlas a kilómetros.' },
  { n: '📦 Delivery de pizza', h: 'Llegaste justo a tiempo y recibiste una buena propina.' },
  { n: '🛶 Gondolero de alcantarilla', h: 'Hiciste un recorrido turístico bastante extraño y cobraste por el servicio.' },
  { n: '🎻 Músico de semáforo', h: 'Tocaste una canción y varios conductores decidieron recompensarte.' },
  { n: '🕵️ Detective de vecinos', h: 'Resolviste un pequeño misterio del vecindario.' },
  { n: '🧯 Ayudante de asados', h: 'Salvaste la comida y terminaste cubierto de chimichurri.' },
  { n: '🪁 Piloto de barriletes', h: 'Conseguiste llevar un mensaje a través del cielo.' },
  { n: '🧵 Tejedor de nubes', h: 'Creaste una decoración tan curiosa que todos quisieron comprarla.' },
  { n: '👞 Lustrabotas de estatuas', h: 'Dejaste varias estatuas completamente relucientes.' },
  { n: '🍦 Probador de helados', h: 'Probaste varios sabores y entregaste un informe profesional.' },
  { n: '🎈 Inflador de globos', h: 'Preparaste una fiesta completa llena de globos.' },
  { n: '🧺 Cosechador de memes', h: 'Encontraste un meme antiguo que volvió a ser tendencia.' },
  { n: '🧤 Taxista de caracoles', h: 'Transportaste a tu pequeño pasajero hasta su destino.' },
  { n: '🧳 Maletero de hormigas', h: 'Ayudaste a transportar una carga diminuta pero importante.' },
  { n: '🛁 Bañador de gatos', h: 'Conseguiste que varios gatos quedaran limpios y tranquilos.' },
  { n: '🛐 Becario del Bot', h: 'Ayudaste a organizar los plugins y recibiste tu merecida paga.' }
]

const formatCoins = (amount) => {
  return Number(amount || 0).toLocaleString('es-AR')
}

const getRandomJob = () => {
  return jobs[Math.floor(Math.random() * jobs.length)]
}

const handler = async (m, { userDb }) => {
  if (!userDb) return

  const now = Date.now()
  const lastWork = Number(userDb.lastWork || 0)
  const remaining = COOLDOWN - (now - lastWork)

  if (remaining > 0) {
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)

    return m.reply(
      `*✦ ESPERA.*\n\n` +
      `> Estás cansado para volver a trabajar.\n` +
      `> Tiempo restante: *${minutes}m ${seconds}s*`
    )
  }

  const job = getRandomJob()

  const level = Math.max(0, Number(userDb.level || 0))
  const base = Math.floor(Math.random() * 300) + 300
  const bonusLevel = level * 25

  const subtotal = base + bonusLevel

  let bonusSuit = 0
  let bonusAmulet = 0
  let usedSuitBuff = false

  const update = {
    $inc: {
      genosCoins: 0
    },
    $set: {
      lastWork: now
    }
  }

  /*
   * 👔 TRAJE DE MAGNATE
   * x2 una vez al día
   */
  if (
    userDb.inventory?.suit === true &&
    !userDb.dailyStats?.suitUsed
  ) {
    bonusSuit = subtotal * SUIT_BONUS
    usedSuitBuff = true

    update.$set['dailyStats.suitUsed'] = true

    if (!userDb.dailyStats) {
      userDb.dailyStats = {}
    }

    userDb.dailyStats.suitUsed = true
  }

  /*
   * 🍀 AMULETO DE FORTUNA
   * +10%
   */
  if (userDb.inventory?.amulet === 'fortune') {
    bonusAmulet = Math.floor(subtotal * 0.10)
  }

  const total = Math.floor(
    subtotal +
    bonusSuit +
    bonusAmulet
  )

  userDb.genosCoins = Number(userDb.genosCoins || 0) + total
  userDb.lastWork = now

  update.$inc.genosCoins = total

  await User.updateOne(
    { jid: m.sender },
    update
  )

  let txt =
    `*✦ 💼 TRABAJO ✦*\n\n` +
    `> 👷 *Empleo:* ${job.n}\n` +
    `> 💰 *Ganancia:* ${formatCoins(total)} ${config.CURRENCY_NAME}\n` +
    `> ✨ *Bono de Nivel:* +${formatCoins(bonusLevel)}\n`

  if (usedSuitBuff) {
    txt +=
      `> 👔 *Capa de Magnate:* +${formatCoins(bonusSuit)} ` +
      `(x2 diario) ✅\n`
  }

  if (bonusAmulet > 0) {
    txt +=
      `> 🍀 *Amuleto de Fortuna:* +${formatCoins(bonusAmulet)} ` +
      `(+10%)\n`
  }

  txt +=
    `\n*𝙸𝙽𝙵𝙾 ༻*\n` +
    `✰ 𝚃𝚛𝚊𝚋𝚊𝚓𝚘: ${job.n}\n` +
    `✰ 𝙶𝚊𝚗𝚊𝚗𝚌𝚒𝚊: ${formatCoins(total)} ${config.CURRENCY_NAME}\n` +
    `✰ 𝙽𝚒𝚟𝚎𝚕: ${level}\n\n` +
    `> 📖 *Historia:* ${job.h}\n\n` +
    `*${config.footer}*`

  return m.reply(txt)
}

handler.help = ['trabajar']
handler.tags = ['eco']
handler.command = [
  'work',
  'w',
  'laburar',
  'trabajar',
  'chamba'
]
handler.register = true
handler.groupOnly = true

export default handler