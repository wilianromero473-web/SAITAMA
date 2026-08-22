const partidas = new Map()

// ═══════════════════════════════════════════════════════════════
// 𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻
// ✰ 𝚄𝚜𝚊
// ═══════════════════════════════════════════════════════════════

const diagnosticos = [
  {
    max: 0,
    text: '*Diagnóstico:* Sos una persona extremadamente tranquila. Nada parece sacarte de tu zona de paz. 🧘'
  },
  {
    max: 15,
    text: '*Diagnóstico:* Nivel tranquilo. Pensás antes de actuar y normalmente evitás meterte en problemas. 😌'
  },
  {
    max: 35,
    text: '*Diagnóstico:* Personalidad equilibrada. Sabés cuándo relajarte y cuándo ponerte serio. ⚖️'
  },
  {
    max: 55,
    text: '*Diagnóstico:* Personalidad aventurera. Te gusta probar cosas nuevas y rara vez rechazás una buena oportunidad. 🔥'
  },
  {
    max: 75,
    text: '*Diagnóstico:* Caos controlado. Tenés bastante energía y probablemente sos quien empieza la mayoría de las locuras del grupo. 👀'
  },
  {
    max: 90,
    text: '*Diagnóstico:* Modo protagonista activado. Tu personalidad destaca y difícilmente pasás desapercibido. ⭐'
  },
  {
    max: 99,
    text: '*Diagnóstico:* Nivel leyenda. Sos una combinación peligrosa de confianza, energía y creatividad. 👑'
  },
  {
    max: 100,
    text: '*Diagnóstico:* CAOS ABSOLUTO. No existe manual capaz de explicar tu personalidad. Sos oficialmente una leyenda. 💀🔥'
  }
]

// ═══════════════════════════════════════════════════════════════
// 𝙿𝚁𝙴𝙶𝚄𝙽𝚃𝙰𝚂
// ═══════════════════════════════════════════════════════════════

const preguntas = [

  {
    q: '1. Te invitan a una fiesta donde no conocés a nadie:',
    opts: [
      { text: 'Me quedo tranquilo y observo.', val: 0 },
      { text: 'Hablo con algunas personas.', val: 5 },
      { text: 'En 10 minutos ya conozco a todos.', val: 10 }
    ]
  },

  {
    q: '2. ¿Qué hacés cuando tenés un día libre?',
    opts: [
      { text: 'Me quedo descansando.', val: 0 },
      { text: 'Juego, veo series o salgo un rato.', val: 5 },
      { text: 'Busco algo nuevo para hacer.', val: 10 }
    ]
  },

  {
    q: '3. Un amigo te propone una aventura inesperada:',
    opts: [
      { text: 'Paso, prefiero estar tranquilo.', val: 0 },
      { text: 'Depende de qué sea.', val: 5 },
      { text: '¡Vamos! ¿A qué esperamos?', val: 10 }
    ]
  },

  {
    q: '4. ¿Cómo reaccionás ante un problema?',
    opts: [
      { text: 'Me tomo mi tiempo para pensar.', val: 0 },
      { text: 'Busco una solución rápidamente.', val: 5 },
      { text: 'Improviso y veo qué pasa.', val: 10 }
    ]
  },

  {
    q: '5. ¿Qué tipo de música escuchás más?',
    opts: [
      { text: 'Música tranquila.', val: 0 },
      { text: 'De todo un poco.', val: 5 },
      { text: 'Lo que esté de moda o tenga energía.', val: 10 }
    ]
  },

  {
    q: '6. Si ganás un premio inesperado:',
    opts: [
      { text: 'Lo guardo.', val: 0 },
      { text: 'Compro algo que necesitaba.', val: 5 },
      { text: 'Lo gasto en algo completamente inesperado.', val: 10 }
    ]
  },

  {
    q: '7. ¿Cómo sos trabajando en equipo?',
    opts: [
      { text: 'Prefiero seguir instrucciones.', val: 0 },
      { text: 'Ayudo cuando hace falta.', val: 5 },
      { text: 'Termino organizando al grupo.', val: 10 }
    ]
  },

  {
    q: '8. Tus amigos te describirían como:',
    opts: [
      { text: 'Tranquilo.', val: 0 },
      { text: 'Divertido.', val: 5 },
      { text: 'El que siempre arma algo.', val: 10 }
    ]
  },

  {
    q: '9. Cuando aparece un videojuego nuevo:',
    opts: [
      { text: 'Espero a ver si vale la pena.', val: 0 },
      { text: 'Lo pruebo cuando pueda.', val: 5 },
      { text: 'Lo instalo inmediatamente.', val: 10 }
    ]
  },

  {
    q: '10. ¿Qué hacés cuando te aburrís?',
    opts: [
      { text: 'Me quedo descansando.', val: 0 },
      { text: 'Busco algo para entretenerme.', val: 5 },
      { text: 'Invento cualquier cosa para pasarla bien.', val: 10 }
    ]
  },

  {
    q: '11. Te llega un mensaje inesperado:',
    opts: [
      { text: 'Lo respondo después.', val: 0 },
      { text: 'Lo leo y respondo normalmente.', val: 5 },
      { text: 'Respondo inmediatamente.', val: 10 }
    ]
  },

  {
    q: '12. ¿Qué emoji usás más?',
    opts: [
      { text: '👍', val: 0 },
      { text: '😂', val: 5 },
      { text: '🔥💀😭', val: 10 }
    ]
  },

  {
    q: '13. Si alguien te reta a una competencia:',
    opts: [
      { text: 'Prefiero no competir.', val: 0 },
      { text: 'Acepto si parece divertida.', val: 5 },
      { text: 'Acepto y voy a ganar.', val: 10 }
    ]
  },

  {
    q: '14. ¿Cómo tomás una decisión importante?',
    opts: [
      { text: 'La pienso bastante.', val: 0 },
      { text: 'Comparo las opciones.', val: 5 },
      { text: 'Confío en mi intuición.', val: 10 }
    ]
  },

  {
    q: '15. Si tus amigos organizan algo sorpresa:',
    opts: [
      { text: 'Me pongo nervioso.', val: 0 },
      { text: 'Me da curiosidad.', val: 5 },
      { text: 'Estoy listo para cualquier cosa.', val: 10 }
    ]
  },

  {
    q: '16. ¿Qué tan competitivo sos?',
    opts: [
      { text: 'Casi nada.', val: 0 },
      { text: 'Un poco.', val: 5 },
      { text: 'Odio perder.', val: 10 }
    ]
  },

  {
    q: '17. ¿Qué preferís?',
    opts: [
      { text: 'Una tarde tranquila.', val: 0 },
      { text: 'Salir con amigos.', val: 5 },
      { text: 'Una aventura inolvidable.', val: 10 }
    ]
  },

  {
    q: '18. Si algo sale mal:',
    opts: [
      { text: 'Me detengo y analizo.', val: 0 },
      { text: 'Intento solucionarlo.', val: 5 },
      { text: 'Improviso hasta conseguirlo.', val: 10 }
    ]
  },

  {
    q: '19. ¿Qué tan impulsivo sos?',
    opts: [
      { text: 'Casi nunca hago cosas impulsivas.', val: 0 },
      { text: 'A veces.', val: 5 },
      { text: 'Muchas veces digo "después veo".', val: 10 }
    ]
  },

  {
    q: '20. La última: ¿Qué tan loco considerás que sos?',
    opts: [
      { text: 'Bastante normal.', val: 0 },
      { text: 'Tengo mis momentos.', val: 5 },
      { text: 'No hay explicación posible.', val: 10 }
    ]
  }

]

// ═══════════════════════════════════════════════════════════════
// 𝙱𝙰𝚁𝚁𝙰 𝙳𝙴 𝙿𝚁𝙾𝙶𝚁𝙴𝚂𝙾
// ═══════════════════════════════════════════════════════════════

function generarBarra(paso, total) {
  const llenos = Math.round((paso / total) * 10)

  return `[${'■'.repeat(llenos)}${'□'.repeat(10 - llenos)}] ${paso}/${total}`
}

// ═══════════════════════════════════════════════════════════════
// 𝙴𝙽𝚅𝙸𝙰𝚁 𝙿𝚁𝙴𝙶𝚄𝙽𝚃𝙰
// ═══════════════════════════════════════════════════════════════

async function enviarPregunta(sender, chatId, conn) {

  const sesion = partidas.get(sender)

  if (!sesion) return

  const preg = preguntas[sesion.paso]

  if (!preg) return

  let texto =
`*𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻*

✰ 𝚄𝚜𝚊

> Progreso: ${generarBarra(sesion.paso + 1, preguntas.length)}

*${preg.q}*

`

  preg.opts.forEach((o, i) => {
    texto += `*[ ${i + 1} ]* ➣ ${o.text}\n`
  })

  texto +=
`
> _Respondé con 1, 2 o 3 sin prefijo._
> _Para salir escribí "cancelar"._`

  await conn.sendMessage(chatId, {
    text: texto
  })
}

// ═══════════════════════════════════════════════════════════════
// 𝚃𝙸𝙼𝙴𝙾𝚄𝚃
// ═══════════════════════════════════════════════════════════════

function iniciarTimer(sender, chatId, conn) {

  const sesion = partidas.get(sender)

  if (!sesion) return

  clearTimeout(sesion.timer)

  sesion.timer = setTimeout(async () => {

    if (!partidas.has(sender)) return

    partidas.delete(sender)

    await conn.sendMessage(chatId, {
      text:
`*𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻*

✰ 𝚄𝚜𝚊

*⌬┤ ⏰ ├⌬ TIEMPO AGOTADO.*

> El test fue cancelado automáticamente.`
    })

  }, 60000)
}

// ═══════════════════════════════════════════════════════════════
// 𝙷𝙰𝙽𝙳𝙻𝙴𝚁 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻
// ═══════════════════════════════════════════════════════════════

const handler = async (m, ctx) => {

  const { conn } = ctx

  const sender = m.sender
  const chatId = m.chat

  if (partidas.has(sender)) {

    return m.reply(
`*𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻*

✰ 𝚄𝚜𝚊

*⌬┤ ⚠️ ├⌬ YA TENÉS UN TEST ACTIVO.*

> Terminá el actual antes de iniciar otro.`
    )
  }

  const sesion = {
    estado: 'lobby',
    paso: 0,
    puntaje: 0,
    chatId,
    calculando: false,
    timer: null
  }

  partidas.set(sender, sesion)

  iniciarTimer(sender, chatId, conn)

  await conn.sendMessage(
    chatId,
    {
      text:
`*𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻*

✰ 𝚄𝚜𝚊

*⌬┤ ✦ ├⌬ TEST DE PERSONALIDAD*

> Vas a responder *20 preguntas*.
> Cada respuesta suma puntos.
> Al final recibirás un resultado basado en tus respuestas.

*¿Estás listo?*

*[ 1 ]* ➣ Sí, iniciar el test
*[ 2 ]* ➣ No, cancelar

> _Respondé con 1 o 2 sin prefijo._`
    },
    { quoted: m }
  )
}

// ═══════════════════════════════════════════════════════════════
// 𝙼𝙰𝙽𝙴𝙹𝙾 𝙳𝙴 𝚁𝙴𝚂𝙿𝚄𝙴𝚂𝚃𝙰𝚂
// ═══════════════════════════════════════════════════════════════

handler.all = async (m, ctx) => {

  const { conn } = ctx

  const sender = m.sender

  if (!partidas.has(sender)) return

  const sesion = partidas.get(sender)

  if (!sesion) return

  if (sesion.chatId !== m.chat) return

  if (sesion.calculando) return

  const txt = String(m.body || '').trim().toLowerCase()

  if (!txt) return

  // ═══════════════════════════════════════════════════════════
  // CANCELAR
  // ═══════════════════════════════════════════════════════════

  if (['cancelar', 'salir', 'cancel'].includes(txt)) {

    clearTimeout(sesion.timer)

    partidas.delete(sender)

    return conn.sendMessage(
      m.chat,
      {
        text:
`*𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻*

✰ 𝚄𝚜𝚊

*⌬┤ 🛑 ├⌬ TEST CANCELADO.*

> El test fue cancelado correctamente.`
      },
      { quoted: m }
    )
  }

  const num = Number(txt)

  if (!Number.isInteger(num)) return

  // ═══════════════════════════════════════════════════════════
  // 𝙻𝙾𝙱𝙱𝚈
  // ═══════════════════════════════════════════════════════════

  if (sesion.estado === 'lobby') {

    if (num === 2) {

      clearTimeout(sesion.timer)

      partidas.delete(sender)

      return conn.sendMessage(
        m.chat,
        {
          text:
`*𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻*

✰ 𝚄𝚜𝚊

*⌬┤ 🛑 ├⌬ TEST CANCELADO.*`
        },
        { quoted: m }
      )
    }

    if (num === 1) {

      sesion.estado = 'jugando'
      sesion.paso = 0
      sesion.puntaje = 0

      iniciarTimer(sender, m.chat, conn)

      return enviarPregunta(
        sender,
        m.chat,
        conn
      )
    }

    return
  }

  // ═══════════════════════════════════════════════════════════
  // 𝙼𝙾𝙳𝙾 𝙹𝚄𝙶𝙰𝙽𝙳𝙾
  // ═══════════════════════════════════════════════════════════

  if (sesion.estado !== 'jugando') return

  if (num < 1 || num > 3) return

  const preguntaActual = preguntas[sesion.paso]

  if (!preguntaActual) return

  const opcion = preguntaActual.opts[num - 1]

  if (!opcion) return

  clearTimeout(sesion.timer)

  sesion.puntaje += opcion.val

  sesion.paso++

  // ═══════════════════════════════════════════════════════════
  // 𝙵𝙸𝙽 𝙳𝙴𝙻 𝚃𝙴𝚂𝚃
  // ═══════════════════════════════════════════════════════════

  if (sesion.paso >= preguntas.length) {

    sesion.calculando = true

    const porcentaje = Math.round(
      (sesion.puntaje / (preguntas.length * 10)) * 100
    )

    await conn.sendMessage(
      m.chat,
      {
        text:
`*𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻*

✰ 𝚄𝚜𝚊

*⌬┤ ⏳ ├⌬ PROCESANDO RESULTADO...*

> Analizando tus respuestas...
> Calculando tu nivel de personalidad...`
      },
      { quoted: m }
    )

    setTimeout(async () => {

      if (!partidas.has(sender)) return

      const diagnostico =
        diagnosticos.find(d => porcentaje <= d.max)

      const resultado =
        diagnostico?.text ||
        '*Diagnóstico:* Personalidad misteriosa. Ni siquiera el sistema pudo determinar tu nivel. 👀'

      await conn.sendMessage(
        m.chat,
        {
          text:
`*𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻*

✰ 𝚄𝚜𝚊

*⌬┤ ✦ ├⌬ RESULTADO FINAL*

> 📊 *PUNTAJE:* ${sesion.puntaje}/200
> 📈 *PORCENTAJE:* ${porcentaje}%

${resultado}

> _Gracias por completar el test._`
        }
      )

      clearTimeout(sesion.timer)

      partidas.delete(sender)

    }, 5000)

    return
  }

  // ═══════════════════════════════════════════════════════════
  // 𝙿𝚁𝙾𝙼𝙸𝚇𝙰 𝙿𝚁𝙴𝙶𝚄𝙽𝚃𝙰
  // ═══════════════════════════════════════════════════════════

  iniciarTimer(sender, m.chat, conn)

  return enviarPregunta(
    sender,
    m.chat,
    conn
  )
}

// ═══════════════════════════════════════════════════════════════
// 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂
// ═══════════════════════════════════════════════════════════════

handler.help = [
  'testpersonalidad',
  'testpersonal'
]

handler.tags = [
  'fun'
]

handler.command = [
  'testpersonalidad',
  'testpersonal'
]

export default handler