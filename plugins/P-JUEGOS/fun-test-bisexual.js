const partidas = new Map()

const RESULTADOS = [
  { max: 20, text: '*Resultado:* Tu afinidad romántica parece bastante tranquila. 💙 Te tomás las cosas con calma y no necesitás etiquetarte.' },
  { max: 40, text: '*Resultado:* Tenés una personalidad romántica curiosa. 💜 Te gusta conocer personas y descubrir qué conexión existe.' },
  { max: 60, text: '*Resultado:* Tu corazón es bastante flexible. 💙💜 Para vos, la conexión y la confianza pueden importar mucho.' },
  { max: 80, text: '*Resultado:* Sos bastante abierto/a a nuevas conexiones. ✨ La personalidad parece pesar mucho para vos.' },
  { max: 100, text: '*Resultado:* Modo corazón abierto activado. 💜💙 Te importa mucho la conexión emocional y conocer a la persona antes de juzgar.' }
]

const preguntas = [
  {
    q: '1. Cuando conocés a alguien nuevo, ¿qué te llama más la atención?',
    opts: [
      { text: 'Su forma de hablar y comportarse.', val: 0 },
      { text: 'Su personalidad y sentido del humor.', val: 5 },
      { text: 'La conexión que siento desde el principio.', val: 10 }
    ]
  },
  {
    q: '2. ¿Qué tan importante es la personalidad para vos?',
    opts: [
      { text: 'Es importante, pero no lo es todo.', val: 0 },
      { text: 'Es bastante importante.', val: 5 },
      { text: 'Es lo más importante.', val: 10 }
    ]
  },
  {
    q: '3. ¿Qué preferís en una relación?',
    opts: [
      { text: 'Tranquilidad y estabilidad.', val: 0 },
      { text: 'Diversión y confianza.', val: 5 },
      { text: 'Una conexión emocional muy fuerte.', val: 10 }
    ]
  },
  {
    q: '4. ¿Qué hacés cuando alguien te demuestra interés?',
    opts: [
      { text: 'Me tomo mi tiempo para conocerlo/a.', val: 0 },
      { text: 'Sigo la conversación y veo qué pasa.', val: 5 },
      { text: 'Si existe conexión, me entusiasmo rápidamente.', val: 10 }
    ]
  },
  {
    q: '5. ¿Qué pesa más al elegir a alguien?',
    opts: [
      { text: 'La confianza.', val: 0 },
      { text: 'La personalidad.', val: 5 },
      { text: 'La conexión completa entre ambos.', val: 10 }
    ]
  },
  {
    q: '6. ¿Cómo reaccionás ante un crush?',
    opts: [
      { text: 'Intento mantener la calma.', val: 0 },
      { text: 'Me pongo algo nervioso/a.', val: 5 },
      { text: 'Mi cerebro deja de funcionar. 😂', val: 10 }
    ]
  },
  {
    q: '7. ¿Qué tipo de persona te atrae más?',
    opts: [
      { text: 'Alguien tranquilo/a.', val: 0 },
      { text: 'Alguien divertido/a.', val: 5 },
      { text: 'Alguien con quien pueda ser yo mismo/a.', val: 10 }
    ]
  },
  {
    q: '8. ¿Qué tan rápido confiás en alguien?',
    opts: [
      { text: 'Muy lentamente.', val: 0 },
      { text: 'Depende de la persona.', val: 5 },
      { text: 'Si conectamos, bastante rápido.', val: 10 }
    ]
  },
  {
    q: '9. ¿Qué preferís para una primera salida?',
    opts: [
      { text: 'Un lugar tranquilo.', val: 0 },
      { text: 'Salir a caminar o conversar.', val: 5 },
      { text: 'Una aventura o algo diferente.', val: 10 }
    ]
  },
  {
    q: '10. ¿Qué significa para vos una buena relación?',
    opts: [
      { text: 'Respeto y confianza.', val: 0 },
      { text: 'Confianza, diversión y comunicación.', val: 5 },
      { text: 'Sentir que somos un equipo.', val: 10 }
    ]
  },
  {
    q: '11. ¿Qué tan importante es poder hablar de todo?',
    opts: [
      { text: 'Importante.', val: 0 },
      { text: 'Muy importante.', val: 5 },
      { text: 'Fundamental.', val: 10 }
    ]
  },
  {
    q: '12. ¿Qué hacés cuando alguien te gusta?',
    opts: [
      { text: 'No digo nada inmediatamente.', val: 0 },
      { text: 'Intento acercarme poco a poco.', val: 5 },
      { text: 'Busco cualquier excusa para hablarle.', val: 10 }
    ]
  },
  {
    q: '13. ¿Qué valorás más?',
    opts: [
      { text: 'Lealtad.', val: 0 },
      { text: 'Humor.', val: 5 },
      { text: 'Comprensión emocional.', val: 10 }
    ]
  },
  {
    q: '14. Si alguien tiene gustos muy diferentes a los tuyos...',
    opts: [
      { text: 'Probablemente no tengamos mucho en común.', val: 0 },
      { text: 'Intentaría conocer sus gustos.', val: 5 },
      { text: 'Las diferencias pueden hacerlo interesante.', val: 10 }
    ]
  },
  {
    q: '15. ¿Qué te hace sentir más conectado/a con alguien?',
    opts: [
      { text: 'Pasar tiempo juntos.', val: 0 },
      { text: 'Tener conversaciones profundas.', val: 5 },
      { text: 'Poder ser completamente yo mismo/a.', val: 10 }
    ]
  },
  {
    q: '16. ¿Cómo reaccionás ante una discusión?',
    opts: [
      { text: 'Prefiero esperar a estar tranquilo/a.', val: 0 },
      { text: 'Intento hablarlo.', val: 5 },
      { text: 'Quiero solucionar el problema cuanto antes.', val: 10 }
    ]
  },
  {
    q: '17. ¿Qué tan importante es el sentido del humor?',
    opts: [
      { text: 'Está bueno, pero no es esencial.', val: 0 },
      { text: 'Me encanta reírme con alguien.', val: 5 },
      { text: 'Si no podemos reírnos juntos, no funciona. 😂', val: 10 }
    ]
  },
  {
    q: '18. ¿Qué tipo de conexión preferís?',
    opts: [
      { text: 'Una relación estable y tranquila.', val: 0 },
      { text: 'Una relación divertida y cercana.', val: 5 },
      { text: 'Una conexión profunda y especial.', val: 10 }
    ]
  },
  {
    q: '19. ¿Qué hacés si alguien no coincide con tus expectativas?',
    opts: [
      { text: 'Me alejo.', val: 0 },
      { text: 'Intento entenderlo/a.', val: 5 },
      { text: 'Acepto que nadie es perfecto.', val: 10 }
    ]
  },
  {
    q: '20. La pregunta final: ¿qué buscás realmente?',
    opts: [
      { text: 'Alguien con quien estar tranquilo/a.', val: 0 },
      { text: 'Alguien con quien compartir buenos momentos.', val: 5 },
      { text: 'Una conexión auténtica y especial.', val: 10 }
    ]
  }
]

function generarBarra(paso, total) {
  const llenos = Math.round((paso / total) * 10)
  return `[${'■'.repeat(llenos)}${'□'.repeat(10 - llenos)}] ${paso}/${total}`
}

function obtenerResultado(porcentaje) {
  return RESULTADOS.find(r => porcentaje <= r.max)?.text || RESULTADOS[RESULTADOS.length - 1].text
}

async function enviarPregunta(sender, chat, conn) {
  const sesion = partidas.get(sender)

  if (!sesion) return

  const pregunta = preguntas[sesion.paso]

  if (!pregunta) return

  let texto =
    `*💜 TEST DE AFINIDAD ROMÁNTICA 💙*\n` +
    `> Progreso: ${generarBarra(sesion.paso, preguntas.length)}\n\n` +
    `*${pregunta.q}*\n\n`

  pregunta.opts.forEach((opcion, i) => {
    texto += `*[ ${i + 1} ]* ➣ ${opcion.text}\n`
  })

  texto +=
    `\n_Respondé con 1, 2 o 3 sin prefijo._\n` +
    `_Escribí "cancelar" para salir._`

  await conn.sendMessage(chat, {
    text: texto
  })
}

const handler = async (m, ctx) => {
  const { conn } = ctx
  const sender = m.sender
  const chatId = m.chat

  if (partidas.has(sender)) {
    return m.reply(
      `*[ ⚠️ ] Ya tenés un test en curso.*\n` +
      `> Respondé la pregunta actual o escribí *cancelar*.`
    )
  }

  const timer = setTimeout(() => {
    if (!partidas.has(sender)) return

    partidas.delete(sender)

    conn.sendMessage(chatId, {
      text:
        `*[ ⏰ ] TEST CANCELADO.*\n` +
        `> El test se canceló por 60 segundos de inactividad.`
    }).catch(() => {})
  }, 60_000)

  partidas.set(sender, {
    paso: 0,
    puntaje: 0,
    calculando: false,
    chatId,
    timer
  })

  await conn.sendMessage(
    chatId,
    {
      text:
        `*💜 TEST DE AFINIDAD ROMÁNTICA 💙*\n\n` +
        `Este test es solo por diversión y no determina tu orientación ` +
        `ni tu identidad.\n\n` +
        `Vas a responder *20 preguntas*.\n\n` +
        `*[ 1 ]* ➣ Empezar\n` +
        `*[ 2 ]* ➣ Cancelar\n\n` +
        `_Respondé con 1 o 2 sin usar prefijo._`
    },
    { quoted: m }
  )

  partidas.get(sender).inicio = true
}

handler.all = async (m, ctx) => {
  const { conn } = ctx
  const sender = m.sender

  if (!partidas.has(sender)) return

  const sesion = partidas.get(sender)

  if (!sesion) return

  if (sesion.chatId !== m.chat) return

  if (sesion.calculando) return

  const txt = (m.body || '').trim().toLowerCase()

  if (!txt) return

  if (['cancelar', 'salir', 'cancel'].includes(txt)) {
    clearTimeout(sesion.timer)
    partidas.delete(sender)

    return conn.sendMessage(
      m.chat,
      {
        text: `*[ 🛑 ] TEST CANCELADO.*\n> Saliste del test.`
      },
      { quoted: m }
    )
  }

  const num = Number(txt)

  if (!Number.isInteger(num)) return

  if (sesion.inicio) {
    if (num === 2) {
      clearTimeout(sesion.timer)
      partidas.delete(sender)

      return conn.sendMessage(
        m.chat,
        {
          text: `*[ 🛑 ] TEST CANCELADO.*\n> No se inició el test.`
        },
        { quoted: m }
      )
    }

    if (num !== 1) return

    sesion.inicio = false
    clearTimeout(sesion.timer)

    sesion.timer = setTimeout(() => {
      partidas.delete(sender)

      conn.sendMessage(m.chat, {
        text: `*[ ⏰ ] TEST CANCELADO.*\n> El test terminó por inactividad.`
      }).catch(() => {})
    }, 60_000)

    return enviarPregunta(sender, m.chat, conn)
  }

  const pregunta = preguntas[sesion.paso]

  if (!pregunta) return

  if (num < 1 || num > pregunta.opts.length) {
    return m.reply(
      `*[ ⚠️ ] OPCIÓN INVÁLIDA.*\n` +
      `> Elegí *1, 2 o 3*.`
    )
  }

  clearTimeout(sesion.timer)

  sesion.puntaje += pregunta.opts[num - 1].val
  sesion.paso++

  if (sesion.paso >= preguntas.length) {
    sesion.calculando = true

    const porcentaje = Math.round(
      (sesion.puntaje / (preguntas.length * 10)) * 100
    )

    await conn.sendMessage(
      m.chat,
      {
        text:
          `*[ ⏳ ] ANALIZANDO RESULTADOS...*\n\n` +
          `> Calculando tu afinidad romántica...\n` +
          `> Preparando el veredicto...`
      },
      { quoted: m }
    )

    setTimeout(async () => {
      try {
        const resultado = obtenerResultado(porcentaje)

        const msg =
          `*💜 RESULTADO DEL TEST 💙*\n\n` +
          `> 📊 *AFINIDAD: ${porcentaje}%*\n\n` +
          `${resultado}\n\n` +
          `_Este resultado es solo recreativo y no define quién sos._`

        await conn.sendMessage(m.chat, {
          text: msg,
          mentions: [sender]
        })

      } catch {}

      partidas.delete(sender)
    }, 3000)

    return
  }

  sesion.timer = setTimeout(() => {
    partidas.delete(sender)

    conn.sendMessage(m.chat, {
      text: `*[ ⏰ ] TEST CANCELADO.*\n> Demoraste demasiado en responder.`
    }).catch(() => {})
  }, 60_000)

  await enviarPregunta(sender, m.chat, conn)
}

handler.help = ['testafinidad']
handler.tags = ['fun']

handler.command = [
  'testafinidad',
  'afinidad',
  'testamor',
  'testromantico'
]

export default handler