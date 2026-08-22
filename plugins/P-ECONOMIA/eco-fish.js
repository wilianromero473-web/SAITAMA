import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const items = {
  trash: [
    { n: '👞 Bota vieja', h: 'Estaba llena de lodo y pequeños cangrejos ermitaños.' },
    { n: '🥫 Lata oxidada', h: 'Un desecho contaminante de un viejo barco carguero.' },
    { n: '🧴 Botella vacía', h: 'Esperabas un mensaje, pero solo había agua salada.' },
    { n: '📦 Cartón mojado', h: 'Se deshizo apenas intentaste subirlo a tu bote.' },
    { n: '🧤 Guante de goma', h: 'Parece que a un pescador se le resbaló hace meses aquí.' },
    { n: '🗞️ Diario de 1990', h: 'Las noticias ya no se entienden por el efecto del agua.' },
    { n: '🚲 Rueda pinchada', h: 'Alguien decidió que el río era un taller mecánico sucio.' },
    { n: '🐚 Concha vacía', h: 'Es bonita, pero no tiene nada de valor real dentro.' },
    { n: '🌿 Alga pegajosa', h: 'Se enredó en tu línea y casi rompe tu caña de pescar.' },
    { n: '🪵 Rama podrida', h: 'La corriente del río la trajo desde muy lejos.' },
    { n: '🧢 Gorra sucia', h: 'Tiene el logo de un equipo que ya no existe hoy.' },
    { n: '🧼 Jabón gastado', h: 'Al menos el anzuelo quedó un poco limpio tras sacarlo.' },
    { n: '🍽️ Plato roto', h: 'Restos de una cena romántica que terminó muy mal.' },
    { n: '🔋 Pila sulfatada', h: '¡Cuidado! Esto contamina mucho el ecosistema del agua.' },
    { n: '🧸 Peluche sin ojo', h: 'Da un poco de miedo verlo bajo la luz de la luna.' },
    { n: '🩴 Chancla sola', h: 'La eterna compañera de los ríos más sucios.' },
    { n: '🚬 Paquete de cigarrillos', h: 'Totalmente empapado e inservible.' },
    { n: '🥡 Envase plástico', h: 'Basura moderna que contamina el agua.' },
    { n: '📎 Clip gigante', h: 'Quién sabe cómo terminó este objeto en el fondo.' },
    { n: '🔑 Llave doblada', h: 'La puerta que abría probablemente ya desapareció.' },
    { n: '🔩 Tornillo enorme', h: 'Probablemente pertenecía a un muelle antiguo.' },
    { n: '🎧 Auricular roto', h: 'Solo se puede escuchar el silencio del océano.' },
    { n: '🕯️ Vela derretida', h: 'Daba luz durante las noches de tormenta.' },
    { n: '🩹 Curita usada', h: 'Alguien se lastimó y la tiró al agua.' },
    { n: '🎾 Pelota de tenis', h: 'Un perro debió perderla jugando en la orilla.' },
    { n: '🦴 Hueso de pollo', h: 'Alguien almorzó en un bote y tiró las sobras.' },
    { n: '🥤 Sorbete', h: 'Uno de los residuos más comunes encontrados en el agua.' },
    { n: '🥨 Bolsa de snacks', h: 'Solo contiene aire y un poco de agua salada.' },
    { n: '🦷 Diente plástico', h: 'Pertenecía a algún juguete perdido.' },
    { n: '🪒 Maquinita vieja', h: 'Está demasiado oxidada para servir.' },
    { n: '🎈 Globo desinflado', h: 'Restos de una fiesta que terminó en el agua.' },
    { n: '🧦 Calcetín solo', h: 'Nunca encontrarás el par en el fondo oscuro.' },
    { n: '🍬 Papel de caramelo', h: 'Brilla con el sol, pero es basura inútil.' },
    { n: '🧱 Ladrillo roto', h: 'De alguna construcción cercana a la costa.' },
    { n: '🔌 Cable pelado', h: 'Un residuo peligroso encontrado bajo el agua.' },
    { n: '💡 Foco quemado', h: 'Ya no iluminará más el fondo del océano.' },
    { n: '🖊️ Lapicera', h: 'No sirve para escribir tu bitácora de pesca.' },
    { n: '🧩 Pieza de puzzle', h: 'Falta justamente esta para completar el paisaje.' },
    { n: '🍄 Hongo extraño', h: 'Creció sobre un tronco sumergido durante años.' },
    { n: '🎟️ Ticket de cine', h: 'La película debió ser muy aburrida para tirarlo.' },
    { n: '💊 Blíster vacío', h: 'Alguien necesitaba medicina con urgencia.' },
    { n: '🧵 Carrete de hilo', h: 'Terminó completamente enredado con tu línea.' },
    { n: '📉 Gráfico impreso', h: 'Parece que a un economista le fue muy mal.' },
    { n: '🏺 Trozo de cerámica', h: 'Parece parte de un jarrón barato.' },
    { n: '🧺 Mimbre viejo', h: 'Parte de una canasta abandonada.' },
    { n: '👟 Suela de zapato', h: 'Caminó mucho antes de terminar aquí.' },
    { n: '🔗 Eslabón de cadena', h: 'Muy pesado para lo poco que vale.' },
    { n: '📦 Cinta de embalar', h: 'Pegajosa y muy molesta de quitar.' },
    { n: '📍 Alfiler oxidado', h: 'Casi te pinchas al sacarlo de la red.' },
    { n: '🧧 Sobre vacío', h: 'No contenía dinero, solo agua sucia.' }
  ],

  common: [
    { n: '🐟 Sardina', h: 'Un pez pequeño pero muy nutritivo.' },
    { n: '🐟 Trucha', h: 'Peleó bastante antes de salir a la superficie.' },
    { n: '🐟 Merluza', h: 'Ideal para un buen filete.' },
    { n: '🐟 Carpa', h: 'Un pez robusto de aguas tranquilas.' },
    { n: '🐟 Arenque', h: 'Se mueve en grandes cardúmenes.' },
    { n: '🐟 Caballa', h: 'Sus escamas brillan con un tono azulado.' },
    { n: '🐟 Tilapia', h: 'Muy común en las granjas acuícolas.' },
    { n: '🐟 Pejerrey', h: 'Un clásico de la pesca deportiva.' },
    { n: '🐟 Lisa', h: 'Saltó varias veces antes de ser capturada.' },
    { n: '🐟 Bagre', h: 'Cuidado con sus bigotes y espinas.' },
    { n: '🐟 Corvina', h: 'Un pez muy valorado en la cocina.' },
    { n: '🦀 Cangrejo', h: 'Intentó pellizcarte al salir del agua.' },
    { n: '🦐 Camarón', h: 'Pequeño pero delicioso.' },
    { n: '🦑 Calamar', h: 'Lanzó tinta antes de rendirse.' },
    { n: '🐙 Pulpo pequeño', h: 'Se aferró al anzuelo con sus ventosas.' },
    { n: '🐟 Salmón', h: 'Nadaba contracorriente hasta que lo atrapaste.' },
    { n: '🐟 Mojarra', h: 'Un pez común de las lagunas.' },
    { n: '🐟 Dorado', h: 'El tigre de los ríos.' },
    { n: '🐟 Surubí', h: 'Un gigante de agua dulce.' },
    { n: '🐟 Robalo', h: 'Le gusta esconderse entre las rocas.' },
    { n: '🐟 Lenguado', h: 'Se camufla perfectamente con la arena.' },
    { n: '🐟 Anchoa', h: 'Pequeña y salada.' },
    { n: '🐟 Bacalao', h: 'Un pez de aguas frías.' },
    { n: '🐟 Atún pequeño', h: 'Muy veloz y difícil de atrapar.' },
    { n: '🐟 Besugo', h: 'Sus ojos grandes te miran con sorpresa.' },
    { n: '🐟 Bonito', h: 'Pariente del atún de carne sabrosa.' },
    { n: '🐟 Mero', h: 'Vive en cuevas profundas.' },
    { n: '🐟 Pargo', h: 'Un pez rojo muy conocido.' },
    { n: '🐟 Congrio', h: 'Parece una serpiente, pero es un pez.' },
    { n: '🐟 Raya pequeña', h: 'Se desliza por el fondo como un fantasma.' },
    { n: '🐟 Pez Espada', h: 'Su pico todavía es pequeño.' },
    { n: '🐟 Carite', h: 'Muy buscado por su velocidad.' },
    { n: '🐟 Jurel', h: 'Un luchador incansable.' },
    { n: '🐟 Sierra', h: 'Sus dientes son pequeños pero afilados.' },
    { n: '🐟 Bagre canal', h: 'Habita en las zonas profundas.' },
    { n: '🐟 Carpa espejo', h: 'Sus escamas parecen monedas.' },
    { n: '🐟 Trucha arcoíris', h: 'Luce muchos colores.' },
    { n: '🐟 Perca', h: 'Un pez bastante voraz.' },
    { n: '🐟 Lucioperca', h: 'Un reto interesante para cualquier pescador.' },
    { n: '🐟 Barbo', h: 'Busca alimento en el fondo.' },
    { n: '🐟 Brema', h: 'Tiene el cuerpo alto y comprimido.' },
    { n: '🐟 Tenca', h: 'Muy resistente a aguas pobres en oxígeno.' },
    { n: '🐟 Alburno', h: 'Pequeño y plateado.' },
    { n: '🐟 Gobio', h: 'Vive entre pequeños guijarros.' },
    { n: '🐟 Cacho', h: 'Común en ríos de agua fría.' },
    { n: '🐟 Madrilla', h: 'Se mueve rápidamente en las corrientes.' },
    { n: '🐟 Bermejuela', h: 'Sus aletas tienen tonos rojizos.' },
    { n: '🐟 Jarabugo', h: 'Un pequeño pez difícil de encontrar.' },
    { n: '🐟 Pardilla', h: 'Se esconde muy bien.' },
    { n: '🐟 Calandino', h: 'Pequeño habitante de arroyos.' }
  ],

  rare: [
    { n: '🐠 Pez Payaso', h: 'Una captura bastante colorida.' },
    { n: '🐠 Pez Cirujano', h: 'Un pez pequeño de colores increíbles.' },
    { n: '🐠 Pez Ángel', h: 'Su elegancia destaca entre los demás.' },
    { n: '🐡 Pez Globo', h: 'Se infló al sentirse amenazado.' },
    { n: '🦈 Tiburón Bebé', h: 'Una captura bastante peligrosa.' },
    { n: '🦈 Pez Martillo', h: 'Su cabeza tiene una forma extraña.' },
    { n: '🦞 Langosta Real', h: 'Un manjar bastante valioso.' },
    { n: '🐟 Salmón Plata', h: 'Brilla como un espejo bajo el sol.' },
    { n: '🐟 Atún Aleta Azul', h: 'Un enorme pez muy difícil de capturar.' },
    { n: '🐍 Anguila', h: 'Se movió rápidamente al salir del agua.' },
    { n: '🐠 Pez Mariposa', h: 'Sus colores parecen pintados a mano.' },
    { n: '🐠 Pez Loro', h: 'Sus colores son muy vibrantes.' },
    { n: '🐠 Pez Mandarín', h: 'Uno de los peces más llamativos.' },
    { n: '🦀 Cangrejo Gigante', h: 'Sus pinzas son enormes.' },
    { n: '🦑 Calamar Cristal', h: 'Es casi completamente transparente.' },
    { n: '🐙 Pulpo Anillos', h: 'Una criatura hermosa pero peligrosa.' },
    { n: '🦈 Tiburón Tigre', h: 'Un depredador con un apetito enorme.' },
    { n: '🦈 Tiburón Mako', h: 'Uno de los nadadores más rápidos del océano.' },
    { n: '🐟 Esturión', h: 'Un pez de aspecto prehistórico.' },
    { n: '🐟 Gran Pez Sol', h: 'Enorme y bastante pesado.' },
    { n: '🐠 Pez Disco', h: 'Una pieza digna de un acuario legendario.' },
    { n: '🐠 Pez León', h: 'Sus espinas requieren mucho cuidado.' },
    { n: '🐟 Pez Vela', h: 'Su aleta parece una vela.' },
    { n: '🐟 Marlin Negro', h: 'Saltó como un misil fuera del agua.' },
    { n: '🐟 Siluro Gigante', h: 'Un auténtico monstruo de río.' },
    { n: '🐟 Pez Tigre', h: 'Sus dientes parecen pequeños cuchillos.' },
    { n: '🐟 Arapaima', h: 'Un enorme pez de agua dulce.' },
    { n: '🐟 Pez Gato', h: 'Una captura bastante pesada.' },
    { n: '🐟 Salmón Real', h: 'Una joya de los ríos.' },
    { n: '🐟 Trucha de Oro', h: 'Su brillo parece metal precioso.' },
    { n: '🐠 Pez Betta', h: 'Pequeño pero bastante agresivo.' },
    { n: '🐡 Pez Cofre', h: 'Su cuerpo tiene una forma muy extraña.' },
    { n: '🐍 Morena', h: 'Salió de una grieta inesperadamente.' },
    { n: '🐚 Caracol Fuego', h: 'Su concha parece lava submarina.' },
    { n: '💎 Perla Blanca', h: 'Una joya encontrada dentro de una ostra.' },
    { n: '🔱 Tridente Hierro', h: 'Un objeto antiguo de un naufragio.' },
    { n: '🏺 Ánfora Romana', h: 'Una pieza antigua recuperada del fondo.' },
    { n: '⚓ Ancla Bronce', h: 'Perteneció a un barco perdido.' },
    { n: '📦 Cofre Pequeño', h: 'Tiene algunas monedas antiguas.' },
    { n: '🗺️ Mapa Mojado', h: 'Una parte del mapa todavía puede leerse.' },
    { n: '🐠 Pez Halcón', h: 'Acecha desde los corales.' },
    { n: '🐠 Ballesta', h: 'Sus patrones parecen una obra de arte.' },
    { n: '🐡 Pez Erizo', h: 'Está cubierto de púas.' },
    { n: '🦀 Centollo Real', h: 'Vive en aguas profundas y frías.' },
    { n: '🦑 Sepia Gigante', h: 'Puede cambiar de color rápidamente.' },
    { n: '🐙 Pulpo Mimético', h: 'Puede camuflarse como una piedra.' },
    { n: '🦈 Tiburón Zorro', h: 'Su cola es increíblemente larga.' },
    { n: '🐟 Pez Napoleón', h: 'Tiene una protuberancia característica.' },
    { n: '🐠 Pez Gatillo', h: 'Puede bloquear sus aletas.' },
    { n: '🐚 Ostra Perla', h: 'Dentro podría esconderse una joya.' }
  ],

  special: [
    { n: '🐳 Ballena Azul', h: 'Una criatura gigantesca del océano.' },
    { n: '🦈 Tiburón Blanco', h: 'Una de las capturas más impresionantes.' },
    { n: '🦑 Kraken', h: 'Una criatura salida de las leyendas.' },
    { n: '🔱 Tridente Poseidón', h: 'Un objeto legendario de los mares.' },
    { n: '💎 Perla Negra', h: 'Una joya extremadamente rara.' },
    { n: '👑 Corona Atlante', h: 'Una reliquia de una civilización perdida.' },
    { n: '🐳 Ballena Jorobada', h: 'Su canto puede escucharse a grandes distancias.' },
    { n: '🐋 Orca asesina', h: 'Una criatura marina increíblemente inteligente.' },
    { n: '🦈 Megalodón', h: 'Una criatura legendaria del océano.' },
    { n: '🦑 Calamar Colosal', h: 'Una criatura enorme de las profundidades.' },
    { n: '🧞 Genio Lámpara', h: 'Una misteriosa lámpara encontrada bajo el agua.' },
    { n: '🚢 Tesoro Español', h: 'Doblones de oro de un antiguo galeón.' },
    { n: '💎 Diamante Marino', h: 'Brilla con una luz azul sobrenatural.' },
    { n: '🐋 Cachalote Blanco', h: 'Una criatura marina extremadamente rara.' },
    { n: '🐢 Tortuga Ancestral', h: 'Una criatura que parece tener siglos de edad.' },
    { n: '🐉 Dragón Marino', h: 'Una criatura mítica de las profundidades.' },
    { n: '🧜‍♀️ Arpa Sirena', h: 'Un instrumento de origen misterioso.' },
    { n: '👑 Corona Coral', h: 'Una antigua corona de la nobleza marina.' },
    { n: '🛡️ Escudo Escamas', h: 'Un escudo con una apariencia extraordinaria.' },
    { n: '🗡️ Daga Atlantis', h: 'Una daga de origen desconocido.' },
    { n: '🌀 Remolino', h: 'Un extraño fenómeno atrapado en un recipiente.' },
    { n: '💠 Cristal Océano', h: 'Parece contener energía del mar.' },
    { n: '🌟 Estrella Cósmica', h: 'Un fragmento misterioso encontrado en el agua.' },
    { n: '🦀 Cangrejo Diamante', h: `Su caparazón vale una fortuna en ${config.CURRENCY_NAME}.` },
    { n: '🐙 Hydra de Agua', h: 'Una criatura legendaria de múltiples cabezas.' },
    { n: '🐋 Leviatán Bebé', h: 'Una criatura misteriosa de las profundidades.' },
    { n: '🐟 Pez Oro Macizo', h: 'Parece estar hecho completamente de oro.' },
    { n: '🐡 Pez Galáctico', h: 'Su cuerpo parece contener pequeñas estrellas.' },
    { n: '🦈 Tiburón Basalto', h: 'Su cuerpo parece formado de roca volcánica.' },
    { n: '🐚 Concha Verdad', h: 'Una concha con propiedades misteriosas.' },
    { n: '🏺 Vaso de Hermes', h: 'Una antigua reliquia encontrada en el fondo.' },
    { n: '📦 Gran Cofre Pirata', h: 'Está lleno de tesoros y joyas.' },
    { n: '⚜️ Emblema Sagrado', h: 'Una reliquia de una civilización perdida.' },
    { n: '🔱 Lanza Neptuno', h: 'Una lanza digna de una leyenda marina.' },
    { n: '🏮 Linterna Abismo', h: 'Su luz parece atravesar la oscuridad.' },
    { n: '🌌 Fragmento Meteorito', h: 'Un fragmento procedente del espacio.' },
    { n: '🗿 Ídolo Sumergido', h: 'Una estatua de una antigua civilización.' },
    { n: '🧬 ADN Prehistórico', h: 'Una muestra de una criatura desaparecida.' },
    { n: '🕋 Cubo Destino', h: 'Un objeto que parece desafiar la física.' },
    { n: '👑 Corona Perlas', h: 'Una antigua corona cubierta de perlas.' },
    { n: '🦈 Guardián Abismo', h: 'Una criatura de las fosas más profundas.' },
    { n: '🐋 Cetáceo Plateado', h: 'Su cuerpo refleja la luz como un espejo.' },
    { n: '🦈 Tiburón Cristal', h: 'Una criatura extremadamente rara.' },
    { n: '🐚 Caracol Infinito', h: 'Su espiral parece no tener final.' },
    { n: '💠 Corazón Océano', h: 'Una joya legendaria de los mares.' },
    { n: '🔱 Tridente Sagrado', h: 'Una reliquia digna de los antiguos dioses.' },
    { n: '🔱 Cetro Mareas', h: 'Un extraño objeto relacionado con las mareas.' },
    { n: '🐙 Kraken Rey', h: 'Una criatura legendaria de las profundidades.' },
    { n: '🐳 Ballena Galáctica', h: 'Sus manchas parecen pequeñas constelaciones.' },
    { n: '🌊 Esencia Poseidón', h: 'Un misterioso objeto relacionado con el dios del mar.' }
  ]
}

const handler = async (m, { userDb }) => {
  if (!userDb) return

  const cooldown = 600000
  const now = Date.now()
  const remaining = cooldown - (now - (userDb.lastFish || 0))

  if (remaining > 0) {
    return m.reply(
      `༺ 𝙿𝙴𝚂𝙲𝙰 ༻\n\n` +
      `✰ 𝚁𝙴𝙳𝙴𝚂 𝙼𝙾𝙹𝙰𝙳𝙰𝚂\n\n` +
      `> ✰ 𝚃𝚞𝚜 𝚛𝚎𝚍𝚎𝚜 𝚎𝚜𝚝𝚊́𝚗 𝚜𝚎𝚌𝚊́𝚗𝚍𝚘𝚜𝚎.\n` +
      `> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊́: *${Math.floor(remaining / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s*\n\n` +
      `༺ ${config.footer} ༻`
    )
  }

  userDb.inventory = userDb.inventory || {}

  const bait = userDb.inventory.bait || 'none'
  const durability = Number(userDb.inventory.baitDurability || 0)

  let pSpecial = 0.03
  let pRare = 0.15
  let pCommon = 0.57
  let pTrash = 0.25

  if (bait === 'normal' && durability > 0) {
    pTrash = 0.02
    pCommon = 0.83
  } else if (bait === 'rare' && durability > 0) {
    pRare = 0.33
    pTrash = 0.15
  } else if (bait === 'mythic' && durability > 0) {
    pSpecial = 0.10
    pRare = 0.35
    pTrash = 0.02
  }

  const roll = Math.random()

  const rarity =
    roll < pSpecial
      ? 'special'
      : roll < pSpecial + pRare
        ? 'rare'
        : roll < pSpecial + pRare + pCommon
          ? 'common'
          : 'trash'

  const update = {
    $inc: {},
    $set: {
      lastFish: now
    }
  }

  if (bait !== 'none' && durability > 0) {
    const newDurability = durability - 1

    userDb.inventory.baitDurability = newDurability

    update.$inc['inventory.baitDurability'] = -1

    if (newDurability <= 0) {
      userDb.inventory.bait = 'none'
      update.$set['inventory.bait'] = 'none'
    }
  }

  const pool = items[rarity]
  const item = pool[Math.floor(Math.random() * pool.length)]

  const baseValue =
    rarity === 'special'
      ? 2800
      : rarity === 'rare'
        ? 750
        : rarity === 'common'
          ? 220
          : 15

  const value = baseValue + ((userDb.level || 0) * 20)

  const premiumReward =
    rarity === 'special'
      ? Math.floor(Math.random() * 3) + 2
      : 0

  userDb.lastFish = now
  userDb.genosCoins = (userDb.genosCoins || 0) + value
  userDb.genos = (userDb.genos || 0) + premiumReward

  userDb.aquarium = userDb.aquarium || {}
  userDb.aquarium[item.n] = (userDb.aquarium[item.n] || 0) + 1

  update.$inc.genosCoins = value

  if (premiumReward > 0) {
    update.$inc.genos = premiumReward
  }

  update.$inc[`aquarium.${item.n}`] = 1

  await User.updateOne(
    { jid: m.sender },
    update
  )

  const labels = {
    trash: '𝙱𝙰𝚂𝚄𝚁𝙰 🗑️',
    common: '𝙲𝙾𝙼𝚄́𝙽 🐟',
    rare: '𝚁𝙰𝚁𝙾 ✨',
    special: '𝙴́𝙿𝙸𝙲𝙾 🌌'
  }

  const remainingBait = Math.max(
    0,
    Number(userDb.inventory.baitDurability || 0)
  )

  let txt =
    `༺ 𝙿𝙴𝚂𝙲𝙰 ༻\n\n` +
    `✰ 𝙿𝙴𝚂𝙲𝙲𝙰 𝙵𝙸𝙽𝙰𝙻𝙸𝚉𝙰𝙳𝙰\n\n` +
    `> ✰ 𝚁𝚊𝚛𝚎𝚣𝚊: *${labels[rarity]}*\n` +
    `> ✰ 𝙾𝚋𝚓𝚎𝚝𝚘: *${item.n}*\n` +
    `> ✰ 𝚅𝚊𝚕𝚘𝚛: *${value} ${config.CURRENCY_SYMBOL}*\n`

  if (premiumReward > 0) {
    txt += `> ✰ ${config.PREMIUM_NAME}: *+${premiumReward} ${config.PREMIUM_SYMBOL}*\n`
  }

  txt +=
    `> ✰ 𝙲𝚊𝚛𝚗𝚊𝚍𝚊: *${remainingBait} 𝚞𝚜𝚘𝚜*\n\n` +
    `✰ 𝙳𝙰𝚃𝙾\n` +
    `> ✰ ${item.h}\n`

  if (rarity === 'rare' || rarity === 'special') {
    txt +=
      `\n> ✰ _𝙶𝚞𝚊𝚛𝚍𝚊 𝚎𝚜𝚝𝚎 𝚎𝚓𝚎𝚖𝚙𝚕𝚊𝚛._\n` +
      `> ✰ _𝙿𝚘𝚍𝚛𝚊́𝚜 𝚞𝚜𝚊𝚛𝚕𝚘 𝚎𝚗 *!𝚌𝚘𝚗𝚝𝚛𝚊𝚝𝚘𝚜* 𝚜𝚒 𝚎𝚕 𝚖𝚎𝚛𝚌𝚊𝚍𝚘 𝚎𝚜𝚝𝚊́ 𝚊𝚋𝚒𝚎𝚛𝚝𝚘._\n`
  }

  txt += `\n༺ ${config.footer} ༻`

  return m.reply(txt)
}

handler.help = ['pescar']
handler.tags = ['eco']
handler.command = ['fish', 'pescar']
handler.register = true

export default handler