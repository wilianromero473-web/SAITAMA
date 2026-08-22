import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const items = {
  trash: [
    { n: '🪨 Piedra sucia', h: 'Picas y picas pero solo sale lodo seco y tierra.' },
    { n: '🪱 Gusano de tierra', h: 'Salió huyendo cuando rompiste su pequeña casa.' },
    { n: '🥫 Lata de refresco', h: 'Alguien la enterró aquí hace décadas, es chatarra.' },
    { n: '🦴 Hueso de pollo', h: 'Tu pico golpeó algo duro, pero era basura vieja.' },
    { n: '🧤 Casco roto', h: 'Perteneció a un minero que no tuvo suerte aquí.' },
    { n: '🩹 Curita usada', h: 'Qué asco, alguien se lastimó y la tiró en la mina.' },
    { n: '🧶 Hilo de pescar', h: 'Enredado en una estalactita. ¿Quién pesca en una mina?' },
    { n: '📦 Caja de cartón', h: 'Estaba húmeda y vacía. Solo ocupa espacio útil.' },
    { n: '👟 Zapato sin suela', h: 'Un solo zapato. El par debe estar en el centro hoy.' },
    { n: '🖇️ Clip oxidado', h: 'Tan pequeño que casi ni lo ves entre la tierra gris.' },
    { n: '🧶 Lana enredada', h: 'Un desastre textil en medio de la excavación hoy.' },
    { n: '🧼 Jabón gastado', h: 'Al menos el pico quedó limpio tras el impacto hoy.' },
    { n: '🍽️ Plato roto', h: 'Restos de un almuerzo minero que terminó mal hoy.' },
    { n: '🔋 Pila sulfatada', h: '¡Cuidado! Esto contamina mucho el suelo de la mina.' },
    { n: '🧸 Peluche sin ojo', h: 'Da un poco de miedo verlo bajo la linterna hoy.' },
    { n: '🩴 Chancla sola', h: 'La eterna compañera de los lugares abandonados hoy.' },
    { n: '🚬 Colilla', h: 'Alguien estuvo fumando donde no debía hace tiempo.' },
    { n: '🥡 Envase comida', h: 'Basura que algún minero flojo dejó tirada aquí.' },
    { n: '🔑 Llave doblada', h: 'Ya no sirve para abrir ninguna puerta de este mundo.' },
    { n: '🔩 Tornillo', h: 'Probablemente de un soporte de madera muy antiguo.' },
    { n: '🎧 Auricular roto', h: 'Ya no suena nada por aquí más que el pico hoy.' },
    { n: '🕯️ Vela derretida', h: 'Daba luz antes de que inventaran las linternas hoy.' },
    { n: '🩹 Curita', h: 'Restos de un accidente menor en la excavación ayer.' },
    { n: '🎾 Pelota tenis', h: 'Cómo llegó esto aquí es el misterio del siglo hoy.' },
    { n: '🥤 Sorbete', h: 'Plástico inútil en medio de la piedra natural hoy.' },
    { n: '🥨 Bolsa snacks', h: 'Solo tiene aire y polvo de piedra dentro ahora.' },
    { n: '🦷 Diente plástico', h: 'De algún juguete antiguo enterrado en el lodo hoy.' },
    { n: '🪒 Maquinita vieja', h: 'Muy oxidada para cualquier uso de aseo personal.' },
    { n: '🧵 Hilo dental', h: 'Higiene bucal en medio de la nada subterránea hoy.' },
    { n: '🎈 Globo desinflado', h: 'Restos de una fiesta minera que salió muy mal hoy.' },
    { n: '🧦 Calcetín solo', h: 'Sigue perdido el otro, probablemente para siempre hoy.' },
    { n: '🍬 Papel caramelo', h: 'Basura brillante que te engañó por un segundo hoy.' },
    { n: '🧱 Ladrillo roto', h: 'De una pared que colapsó hace muchos años atrás.' },
    { n: '🔌 Cable pelado', h: 'Un peligro latente en medio de la humedad minera.' },
    { n: '💡 Foco quemado', h: 'Ya no iluminará más los túneles oscuros del bot.' },
    { n: '🖋️ Lapicera', h: 'Sin tinta y con la punta rota por el peso hoy.' },
    { n: '🧵 Carrete vacío', h: 'Alguien usó todo el hilo y dejó la basura aquí.' },
    { n: '🧩 Pieza puzzle', h: 'Falta una para completar el mapa del tesoro hoy.' },
    { n: '🍄 Hongo extraño', h: 'Creció en la oscuridad total de la cueva profunda.' },
    { n: '🎟️ Ticket usado', h: 'Alguien entró a una atracción que ya no existe hoy.' },
    { n: '💊 Blister vacío', h: 'Medicina para el dolor de espalda tras picar hoy.' },
    { n: '🧵 Hilo cortado', h: 'No sirve para nada más que para estorbar el pico.' },
    { n: '📉 Gráfico impreso', h: 'Parece que la economía de la mina colapsó hoy.' },
    { n: '🏺 Trozo cerámica', h: 'No tiene valor histórico, es solo un desecho hoy.' },
    { n: '🧺 Mimbre viejo', h: 'De una canasta que se pudrió por la humedad hoy.' },
    { n: '👟 Suela gastada', h: 'Pertenece a un minero que caminó kilómetros hoy.' },
    { n: '🔗 Eslabón cadena', h: 'Muy pesado y oxidado para ser de utilidad hoy.' },
    { n: '📦 Cinta embalar', h: 'Se pegó a tu bota y fue difícil de quitar hoy.' },
    { n: '📍 Alfiler oxidado', h: 'Casi te pinchas al remover la tierra suelta hoy.' },
    { n: '🧧 Sobre vacío', h: 'No contenía ninguna carta, solo lodo hoy.' }
  ],

  common: [
    { n: '🪨 Hierro Puro', h: 'Encontraste una veta sólida de metal básico útil.' },
    { n: '🪨 Carbón Mineral', h: 'Ideal para encender la fragua o venderlo.' },
    { n: '🪨 Cobre Brillante', h: 'Sus reflejos naranjas delatan su ubicación.' },
    { n: '🪨 Cuarzo Blanco', h: 'Un cristal básico que decora cualquier estantería.' },
    { n: '🪨 Piedra Caliza', h: 'Útil para la construcción, aunque pesa bastante.' },
    { n: '🪨 Granito Gris', h: 'Duro como tu cabeza. Se vende bien.' },
    { n: '🧪 Azufre Amarillo', h: 'Huele a huevo podrido, pero los alquimistas pagan.' },
    { n: '🪨 Grafito Oscuro', h: 'Perfecto para fabricar lápices o lubricar máquinas.' },
    { n: '🧱 Arcilla Roja', h: 'Blanda y moldeable. Los alfareros te la comprarán.' },
    { n: '🪨 Pizarra Fina', h: 'Se rompe en láminas perfectas.' },
    { n: '🪨 Talco Natural', h: 'Suave al tacto y fácil de desmoronar.' },
    { n: '🪨 Arena Sílice', h: 'Perfecta para fabricar vidrio de calidad.' },
    { n: '🪨 Sal Gema', h: 'Pura y cristalina, sacada de la pared.' },
    { n: '🪨 Feldespato', h: 'Un mineral común con un brillo interesante.' },
    { n: '🪨 Mica Plateada', h: 'Se desprende en capas brillantes.' },
    { n: '🪨 Pirita', h: 'El oro de los tontos. Brilla mucho pero vale poco.' },
    { n: '🪨 Magnetita', h: 'Tu pico se quedó pegado por el magnetismo.' },
    { n: '🪨 Fluorita', h: 'Tiene colores verdes y violetas llamativos.' },
    { n: '🪨 Baritina', h: 'Muy pesada para su tamaño, pero valiosa.' },
    { n: '🪨 Yeso Blanco', h: 'Blando y fácil de extraer.' },
    { n: '🪨 Calcita', h: 'Cristales que brillan con la luz.' },
    { n: '🪨 Dolomita', h: 'Similar a la caliza pero con propiedades diferentes.' },
    { n: '🪨 Siderita', h: 'Un mineral de hierro de color pardo.' },
    { n: '🪨 Malaquita', h: 'Verde intenso y bastante llamativa.' },
    { n: '🪨 Azurita', h: 'Azul profundo, normalmente aparece junto al cobre.' },
    { n: '🪨 Hematita', h: 'Deja un rastro rojizo en tus manos.' },
    { n: '🪨 Goethita', h: 'Un óxido de hierro con formas extrañas.' },
    { n: '🪨 Limonita', h: 'De color amarillento y fácil de reconocer.' },
    { n: '🪨 Bauxita', h: 'Una de las principales fuentes de aluminio.' },
    { n: '🪨 Serpentina', h: 'Parece piel de serpiente por sus manchas verdes.' },
    { n: '🪨 Talco', h: 'Uno de los minerales más blandos.' },
    { n: '🪨 Galena', h: 'Brillo metálico plomizo, muy pesada.' },
    { n: '🪨 Blenda', h: 'Una importante mena de zinc.' },
    { n: '🪨 Casiterita', h: 'De aquí se obtiene estaño.' },
    { n: '🪨 Wolframita', h: 'Muy densa y útil industrialmente.' },
    { n: '🪨 Cromita', h: 'Mineral negro y brillante.' },
    { n: '🪨 Ilmenita', h: 'Una fuente importante de titanio.' },
    { n: '🪨 Rutilo', h: 'Cristales alargados que parecen agujas.' },
    { n: '🪨 Apatita', h: 'De color verde mar y bastante bonita.' },
    { n: '🪨 Turmalina', h: 'Negra y prismática.' },
    { n: '🪨 Granate', h: 'Pequeños cristales rojos en la roca.' },
    { n: '🪨 Olivino', h: 'Verde oliva, típico de rocas volcánicas.' },
    { n: '🪨 Augita', h: 'Mineral oscuro común en la corteza.' },
    { n: '🪨 Hornblenda', h: 'Negra y brillante.' },
    { n: '🪨 Ortosa', h: 'De color rosado y muy común.' },
    { n: '🪨 Albita', h: 'Blanca y bastante abundante.' },
    { n: '🪨 Anortita', h: 'Grisácea y resistente.' },
    { n: '🪨 Moscovita', h: 'Mica blanca que parece vidrio.' },
    { n: '🪨 Biotita', h: 'Mica negra que brilla bajo la luz.' },
    { n: '🪨 Clorita', h: 'Verde y escamosa.' }
  ],

  rare: [
    { n: '🥈 Plata Fina', h: 'Un resplandor blanco iluminó la cueva.' },
    { n: '🥇 Oro de 24k', h: '¡Brilla como el sol! Una gran fortuna.' },
    { n: '💠 Diamante Bruto', h: 'Tuviste que picar mucho para encontrarlo.' },
    { n: '🏮 Rubí Rojo', h: 'Rojo intenso como el fuego de la tierra.' },
    { n: '🔹 Zafiro Azul', h: 'Parece un pedazo de cielo atrapado en la roca.' },
    { n: '💚 Esmeralda', h: 'Verde intenso y muy valiosa.' },
    { n: '🟣 Ametista', h: 'Una hermosa geoda púrpura.' },
    { n: '⬛ Obsidiana', h: 'Vidrio volcánico negro.' },
    { n: '🔩 Titanio', h: 'Ligero y extremadamente resistente.' },
    { n: '⚪ Platino', h: 'Más raro que el oro.' },
    { n: '💎 Ópalo', h: 'Muestra todos los colores del arcoíris.' },
    { n: '💎 Topacio', h: 'Una gema amarilla muy elegante.' },
    { n: '💎 Turquesa', h: 'Azul verdoso y muy apreciada.' },
    { n: '💎 Jade', h: 'Piedra dura y muy valiosa.' },
    { n: '💎 Aguamarina', h: 'Clara como el agua de un manantial.' },
    { n: '💎 Ámbar', h: 'Resina fósil con un insecto atrapado.' },
    { n: '💎 Lapislázuli', h: 'Azul intenso con pequeñas motas doradas.' },
    { n: '💎 Rodocrosita', h: 'La famosa rosa del inca.' },
    { n: '💎 Pirita Cubo', h: 'Cristales perfectamente cúbicos.' },
    { n: '💎 Bismuto', h: 'Cristales con formas geométricas increíbles.' },
    { n: '💎 Labradorita', h: 'Destellos azules y verdes bajo la luz.' },
    { n: '💎 Ojo de Tigre', h: 'Refleja la luz como el ojo de un felino.' },
    { n: '💎 Cornalina', h: 'De color naranja intenso.' },
    { n: '💎 Ágata', h: 'Bandas de colores sorprendentes.' },
    { n: '💎 Citrino', h: 'Cuarzo amarillo muy llamativo.' },
    { n: '💎 Morganita', h: 'Berilo rosa muy poco común.' },
    { n: '💎 Heliodoro', h: 'Berilo amarillo que parece brillar.' },
    { n: '💎 Alejandrita', h: 'Cambia de color dependiendo de la luz.' },
    { n: '💎 Espinela', h: 'Puede confundirse con un rubí.' },
    { n: '💎 Peridoto', h: 'Gema verde de origen volcánico.' },
    { n: '💎 Tanzanita', h: 'Una gema encontrada en muy pocos lugares.' },
    { n: '💎 Turmalina Paraíba', h: 'Azul neón extremadamente llamativo.' },
    { n: '💎 Berilo Rojo', h: 'Una gema extraordinariamente rara.' },
    { n: '💎 Benitoíta', h: 'Gema azul muy escasa.' },
    { n: '💎 Grandidierita', h: 'Verde azulada y muy costosa.' },
    { n: '💎 Taaffeíta', h: 'Una de las gemas más raras.' },
    { n: '💎 Jeremejevita', h: 'Cristales azules muy difíciles de encontrar.' },
    { n: '💎 Musgravita', h: 'Mineral extremadamente raro.' },
    { n: '💎 Painita', h: 'Durante años fue considerada una de las gemas más raras.' },
    { n: '💎 Poudretteita', h: 'De color rosa pálido y muy difícil de hallar.' },
    { n: '💎 Serendibita', h: 'Una gema oscura de composición compleja.' },
    { n: '💎 Hibonita', h: 'También aparece en algunos meteoritos.' },
    { n: '💎 Larimar', h: 'Piedra azul característica del Caribe.' },
    { n: '💎 Sugilita', h: 'De un intenso color violeta.' },
    { n: '💎 Charoita', h: 'Sus patrones parecen remolinos de seda.' },
    { n: '💎 Amonita', h: 'Fósil irisado parecido a una gema.' },
    { n: '💎 Moldavita', h: 'Vidrio verde formado por un impacto meteorítico.' },
    { n: '💎 Tektita', h: 'Roca formada por el calor de un impacto.' },
    { n: '💎 Perla de Cueva', h: 'Formada por agua durante miles de años.' }
  ],

  special: [
    { n: `✨ Cristal de ${config.PREMIUM_NAME}`, h: 'Energía pura cristalizada en tus manos.', k: 3 },
    { n: '🌌 Vibranium', h: 'El metal vibra al ritmo de tu energía.', k: 5 },
    { n: '☄️ Meteorito', h: 'Vino del espacio para ser descubierto por ti.', k: 4 },
    { n: '🛐 Reliquia Divina', h: 'Un objeto sagrado olvidado por el tiempo.', k: 8 },
    { n: '💎 Corazón Montaña', h: 'La gema más grande jamás vista.', k: 10 },
    { n: '🛡️ Beskar', h: 'Metal mandaloriano extremadamente resistente.', k: 6 },
    { n: '⚡ Piedra Trueno', h: 'Suelta pequeñas chispas constantemente.', k: 4 },
    { n: '🔥 Magma Cristal', h: 'Emite un calor extraordinario.', k: 5 },
    { n: '🌀 Fragmento Vacío', h: 'Parece absorber la luz de su alrededor.', k: 7 },
    { n: '🌟 Polvo Estrellas', h: 'Brilla con una intensidad impresionante.', k: 6 },
    { n: '🔱 Lanza Poseidón', h: 'Una reliquia encontrada en las profundidades.', k: 9 },
    { n: '👑 Diadema Antigua', h: 'Hecha de un material desconocido.', k: 8 },
    { n: '🏺 Elixir Eterno', h: 'Un líquido dorado que parece tener energía propia.', k: 7 },
    { n: '📦 Arca Perdida', h: 'Contiene secretos que todavía no puedes revelar.', k: 12 },
    { n: '💎 Diamante Negro', h: 'Una gema oscura de enorme valor.', k: 9 },
    { n: '🗡️ Daga Sagrada', h: 'Su hoja permanece perfectamente afilada.', k: 7 },
    { n: `📜 Pergamino Luz`, h: `Contiene la ubicación de la próxima mina de ${config.PREMIUM_NAME}s.`, k: 5 },
    { n: '🌑 Roca Lunar', h: 'Un fragmento de origen extraterrestre.', k: 6 },
    { n: '🤖 Chip Ancestral', h: 'Tecnología de una civilización perdida.', k: 8 },
    { n: '🧬 ADN Mutante', h: 'Una muestra biológica atrapada en cristal.', k: 10 },
    { n: '⚛️ Núcleo Energía', h: 'Una fuente de energía extraordinaria.', k: 15 },
    { n: '👺 Máscara Oro', h: 'Una reliquia asociada con la riqueza.', k: 7 },
    { n: '📿 Rosario Almas', h: 'Cada cuenta parece ser una gema preciosa.', k: 9 },
    { n: '🗝️ Llave Maestra', h: 'Una llave capaz de abrir cualquier puerta especial.', k: 10 },
    { n: '🕯️ Llama Eterna', h: 'Emite calor y luz de forma constante.', k: 6 },
    { n: '🧿 Ojo del Destino', h: 'Una gema que parece observarte.', k: 8 },
    { n: '🪐 Fragmento Saturno', h: 'Un extraño fragmento procedente del espacio.', k: 11 },
    { n: '🧊 Hielo Infinito', h: 'Nunca parece derretirse.', k: 7 },
    { n: '🍃 Esencia Vida', h: 'Hace brotar energía de la roca.', k: 9 },
    { n: '🔮 Orbe Sabiduría', h: 'Parece contener conocimientos antiguos.', k: 10 },
    { n: '🔱 Tridente Hades', h: 'Una reliquia encontrada en las profundidades.', k: 13 },
    { n: '💎 Gema del Infinito', h: 'Una gema única de poder extraordinario.', k: 20 },
    { n: '🧪 Antimateria', h: 'Una sustancia extremadamente inestable.', k: 14 },
    { n: '🌟 Supernova', h: 'El residuo de una estrella muerta.', k: 12 },
    { n: '🐉 Escama Dragón', h: 'Dura como el diamante y brillante como el fuego.', k: 8 },
    { n: '🦄 Cuerno Alado', h: 'Un fragmento místico de una criatura legendaria.', k: 9 },
    { n: '🔥 Fénix Dorado', h: 'Una estatua con energía de fuego.', k: 11 },
    { n: '🗡️ Excalibur Rota', h: 'La espada legendaria espera ser restaurada.', k: 10 },
    { n: '🕋 Cubo Sagrado', h: 'Una estructura con una geometría perfecta.', k: 13 },
    { n: '💎 Prisma Astral', h: 'Refleja colores que parecen no existir.', k: 10 },
    { n: '🧬 Código Fuente', h: 'Un extraño código convertido en piedra.', k: 25 },
    { n: '👑 Corona Deidad', h: 'Una corona digna de un verdadero campeón.', k: 15 },
    { n: '🛰️ Satélite Caído', h: 'Tecnología espacial enterrada durante años.', k: 9 },
    { n: `🔋 Batería de ${config.PREMIUM_NAME}`, h: 'Carga aparentemente infinita.', k: 12 },
    { n: '🌀 Agujero Gusano', h: 'Un pequeño portal encerrado en cristal.', k: 14 },
    { n: '🌟 Luz del Alba', h: 'Una gema que simboliza el comienzo de una nueva era.', k: 10 },
    { n: '🗡️ Muramasa', h: 'Una espada legendaria de enorme valor.', k: 11 },
    { n: '🛡️ Aegis', h: 'El escudo legendario de los dioses.', k: 13 },
    { n: '🔱 Cetro Real', h: 'Perteneció al primer dueño de estas tierras.', k: 12 },
    { n: '🛐 Altar Oro', h: 'Una estructura completa hecha de oro.', k: 30 }
  ]
}

const handler = async (m, { userDb }) => {
  if (!userDb?.registered) {
    return m.reply(
      `༺ 𝙼𝙸𝙽𝙴𝚁𝙸𝙰 ༻\n\n` +
      `✰ 𝙰𝙲𝙲𝙴𝚂𝙾 𝙳𝙴𝙽𝙴𝙶𝙰𝙳𝙾\n\n` +
      `> ✰ Debes registrarte primero para poder entrar a la mina.`
    )
  }

  const cooldown = 15 * 60 * 1000
  const now = Date.now()
  const lastMine = userDb.lastMine || 0
  const remaining = cooldown - (now - lastMine)

  if (remaining > 0) {
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)

    return m.reply(
      `༺ 𝙼𝙸𝙽𝙴𝚁𝙸𝙰 ༻\n\n` +
      `✰ 𝙼𝙸𝙽𝙰 𝙰𝙶𝙾𝚃𝙰𝙳𝙰\n\n` +
      `> ✰ Tu pico necesita descansar.\n` +
      `> ✰ Espera: *${minutes}m ${seconds}s*`
    )
  }

  const inventory = userDb.inventory || {}

  const pick = inventory.pickaxe || 'none'
  const dur = Number(inventory.pickaxeDurability || 0)

  let pSpecial = 0.03
  let pRare = 0.12
  let pCommon = 0.60
  let pTrash = 0.25

  if (pick === 'normal' && dur > 0) {
    pTrash = 0.05
    pCommon = 0.80
  } else if (pick === 'rare' && dur > 0) {
    pTrash = 0.15
    pRare = 0.20
  } else if (pick === 'mythic' && dur > 0) {
    pTrash = 0.05
    pRare = 0.25
    pSpecial = 0.10
  }

  if (inventory.amulet === 'miner') {
    const bonus = 0.10

    pTrash = Math.max(0, pTrash - bonus)
    pRare += bonus * 0.7
    pSpecial += bonus * 0.3
  }

  // Normalizamos las probabilidades por seguridad.
  const total = pTrash + pCommon + pRare + pSpecial

  pTrash /= total
  pCommon /= total
  pRare /= total
  pSpecial /= total

  const chance = Math.random()

  let rarity

  if (chance < pSpecial) {
    rarity = 'special'
  } else if (chance < pSpecial + pRare) {
    rarity = 'rare'
  } else if (chance < pSpecial + pRare + pCommon) {
    rarity = 'common'
  } else {
    rarity = 'trash'
  }

  const pool = items[rarity]

  if (!pool?.length) {
    return m.reply(
      `༺ 𝙼𝙸𝙽𝙴𝚁𝙸𝙰 ༻\n\n` +
      `✰ 𝙴𝚁𝚁𝙾𝚁\n\n` +
      `> ✰ No se encontró ningún mineral disponible.`
    )
  }

  const item = pool[Math.floor(Math.random() * pool.length)]

  const level = Number(userDb.level || 0)

  const value =
    (rarity === 'special'
      ? 2500
      : rarity === 'rare'
        ? 800
        : rarity === 'common'
          ? 200
          : 20) +
    level * 30

  const premiumReward = Number(item.k || 0)

  const update = {
    $inc: {
      genosCoins: value
    },
    $set: {
      lastMine: now
    }
  }

  // Desgaste del pico
  let newDurability = dur

  if (pick !== 'none' && dur > 0) {
    newDurability = Math.max(0, dur - 1)

    update.$inc['inventory.pickaxeDurability'] = -1

    if (newDurability <= 0) {
      update.$set['inventory.pickaxe'] = 'none'
    }
  }

  // Recompensa premium
  if (premiumReward > 0) {
    update.$inc.genos = premiumReward
  }

  await User.updateOne(
    { jid: m.sender },
    update
  )

  const labels = {
    trash: '𝙱𝙰𝚂𝚄𝚁𝙰 🪨',
    common: '𝙲𝙾𝙼𝚄𝙽 ⚒️',
    rare: '𝚁𝙰𝚁𝙾 ✨',
    special: '𝙼𝙸𝚃𝙸𝙲𝙾 🌌'
  }

  let txt =
    `༺ 𝙼𝙸𝙽𝙴𝚁𝙸𝙰 ༻\n\n` +
    `✰ 𝙼𝙸𝙽𝙴𝚁𝙸𝙰 𝙵𝙸𝙽𝙰𝙻𝙸𝚉𝙰𝙳𝙰\n\n` +
    `> ✰ 𝚁𝚊𝚛𝚎𝚣𝚊: *${labels[rarity]}*\n` +
    `> ✰ 𝙼𝚒𝚗𝚎𝚛𝚊𝚕: *${item.n}*\n` +
    `> ✰ 𝚅𝚊𝚕𝚘𝚛: *${value} ${config.CURRENCY_NAME}*\n`

  if (premiumReward > 0) {
    txt +=
      `> ✰ 𝙴𝚡𝚝𝚛𝚊: *+${premiumReward} ${config.PREMIUM_NAME}*\n`
  }

  if (inventory.amulet === 'miner') {
    txt +=
      `> ✰ 𝙰𝚖𝚞𝚕𝚎𝚝𝚘: *𝙼𝚒𝚗𝚎𝚛𝚘 +10%*\n`
  }

  txt +=
    `> ✰ 𝙿𝚒𝚌𝚘: *${newDurability} 𝚞𝚜𝚘𝚜*\n\n` +
    `> ✰ 𝙷𝚒𝚜𝚝𝚘𝚛𝚒𝚊: _${item.h}_`

  return m.reply(txt)
}

handler.help = ['minar']
handler.tags = ['eco']
handler.command = ['mine', 'minar']
handler.register = true

export default handler