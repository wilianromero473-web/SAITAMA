const partidas = new Map()

// ═══════════════════════════════════════════════════════════════
// 𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻
// ✰ 𝚄𝚜𝚊
// ═══════════════════════════════════════════════════════════════

const diagnosticos = [
  {
    max: 0,
    text: '*Diagnóstico:* Nivel Zen. Sos tranquila, observadora y preferís evitar el caos. 🧘✨'
  },
  {
    max: 15,
    text: '*Diagnóstico:* Personalidad tranquila. Te gusta disfrutar las cosas a tu ritmo y sin demasiado drama. 🌿'
  },
  {
    max: 35,
    text: '*Diagnóstico:* Personalidad equilibrada. Podés ser tranquila, pero también sabés cuándo divertirte. ⚖️✨'
  },
  {
    max: 55,
    text: '*Diagnóstico:* Aventurera moderada. Te gustan las experiencias nuevas, aunque primero necesitás pensarlo un poco. 🔥'
  },
  {
    max: 75,
    text: '*Diagnóstico:* Caos controlado. Tus amigos probablemente ya saben que con vos cualquier cosa puede pasar. 👀🔥'
  },
  {
    max: 90,
    text: '*Diagnóstico:* Protagonista oficial. Tenés mucha energía, confianza y una personalidad difícil de ignorar. ⭐'
  },
  {
    max: 99,
    text: '*Diagnóstico:* Leyenda absoluta. Sos una mezcla de creatividad, confianza y caos. 👑🔥'
  },
  {
    max: 100,
    text: '*Diagnóstico:* CAOS SUPREMO. Nadie sabe exactamente qué pasa por tu cabeza, pero definitivamente nunca sos aburrida. 💀👑✨'
  }
]

// ═══════════════════════════════════════════════════════════════
// 𝙿𝚁𝙴𝙶𝚄𝙽𝚃𝙰𝚂
// ═══════════════════════════════════════════════════════════════

const preguntas = [
  {
    q: '1. Te invitan a una fiesta donde no conocés a nadie:',
    opts: [
      { text: 'Me quedo tranquila observando.', val: 0 },
      { text: 'Hablo con algunas personas.', val: 5 },
      { text: 'En poco tiempo ya conozco a todo el mundo.', val: 10 }
    ]
  },

  {
    q: '2. ¿Qué hacés cuando tenés un día libre?',
    opts: [
      { text: 'Me quedo descansando.', val: 0 },
      { text: 'Juego, veo series o salgo.', val: 5 },
      { text: 'Busco algo nuevo para hacer.', val: 10 }
    ]
  },

  {
    q: '3. Un amigo te propone una aventura inesperada:',
    opts: [
      { text: 'Paso, prefiero algo tranquilo.', val: 0 },
      { text: 'Depende de qué sea.', val: 5 },
      { text: '¡Vamos! ¿A qué esperamos?', val: 10 }
    ]
  },

  {
    q: '4. ¿Cómo reaccionás ante un problema?',
    opts: [
      { text: 'Me tomo mi tiempo para pensar.', val: 0 },
      { text: 'Busco una solución.', val: 5 },
      { text: 'Improviso y veo qué sucede.', val: 10 }
    ]
  },

  {
    q: '5. ¿Qué tipo de música escuchás?',
    opts: [
      { text: 'Música tranquila.', val: 0 },
      { text: 'De todo un poco.', val: 5 },
      { text: 'Música con mucha energía.', val: 10 }
    ]
  },

  {
    q: '6. Si ganás un premio inesperado:',
    opts: [
      { text: 'Lo guardo.', val: 0 },
      { text: 'Compro algo que necesito.', val: 5 },
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
      { text: 'Tranquila.', val: 0 },
      { text: 'Divertida.', val: 5 },
      { text: 'La que siempre arma algo.', val: 10 }
    ]
  },

  {
    q: '9. Aparece un juego nuevo que parece divertido:',
    opts: [
      { text: 'Espero a ver si realmente vale la pena.', val: 0 },
      { text: 'Lo pruebo cuando pueda.', val: 5 },
      { text: 'Lo pruebo inmediatamente.', val: 10 }
    ]
  },

  {
    q: '10. ¿Qué hacés cuando te aburrís?',
    opts: [
      { text: 'Me quedo descansando.', val: 0 },
      { text: 'Busco algo para entretenerme.', val: 5 },
      { text: 'Invento cualquier cosa para divertirme.', val: 10 }
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
    q: '12. ¿Qué emojis usás más?',
    opts: [
      { text: '👍 😂', val: 0 },
      { text: '😊 ✨', val: 5 },
      { text: '🔥 💀 😭 ✨', val: 10 }
    ]
  },

  {
    q: '13. Si alguien te reta a una competencia:',
    opts: [
      { text: 'Prefiero no competir.', val: 0 },
      { text: 'Acepto si parece divertida.', val: 5 },
      { text: 'Acepto. Voy a ganar.', val: 10 }
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
      { text: 'Me pongo nerviosa.', val: 0 },
      { text: 'Me da curiosidad.', val: 5 },
      { text: 'Estoy lista para cualquier cosa.', val: 10 }
    ]
  },

  {
    q: '16. ¿Qué tan competitiva sos?',
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
    q: '19. ¿Qué tan impulsiva sos?',
    opts: [
      { text: 'Casi nunca.', val: 0 },
      { text: 'A veces.', val: 5 },
      { text: 'Muchas veces digo "después veo".', val: 10 }
    ]
  },

  {
    q: '20. La última: ¿Qué tan caótica considerás que sos?',
    opts: [
      { text: 'Bastante normal.', val: 0 },
      { text: 'Tengo mis momentos.', val: 5 },
      { text: 'No existe explicación posible.', val: 10 }
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
// 𝚃𝙸𝙼𝙴𝚁
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
// 𝙷𝙰𝙽𝙳𝙻𝙴𝚁
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

> Terminá el test actual antes de iniciar otro.`
    )
  }

  partidas.set(sender, {
    estado: 'lobby',
    paso: 0,
    puntaje: 0,
    chatId,
    calculando: false,
    timer: null
  })

  iniciarTimer(sender, chatId, conn)

  await conn.sendMessage(
    chatId,
    {
      text:
`*𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻*

✰ 𝚄𝚜𝚊

*⌬┤ ✦ ├⌬ TEST DE PERSONALIDAD*

> Estás a punto de comenzar un test de *20 preguntas*.

> Cada respuesta suma puntos y al final recibirás un resultado divertido basado en tus respuestas.

*¿Estás lista?*

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
  // 𝙲𝙰𝙽𝙲𝙴𝙻𝙰𝚁
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
  // 𝙹𝚄𝙶𝙰𝙽𝙳𝙾
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
  // 𝙵𝙸𝙽
  // ═══════════════════════════════════════════════════════════

  if (sesion.paso >= preguntas.length) {
    sesion.calculando = true

    const porcentaje = Math.round(
      (sesion.puntaje / 200) * 100
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

    sesion.resultadoTimer = setTimeout(async () => {
      if (!partidas.has(sender)) return

      const diagnostico =
        diagnosticos.find(d => porcentaje <= d.max)

      const diagTexto =
        diagnostico?.text ||
        '*Diagnóstico:* Personalidad misteriosa. El sistema no pudo determinar tu nivel. 👀'

      await conn.sendMessage(m.chat, {
        text:
`*𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻*

✰ 𝚄𝚜𝚊

*⌬┤ ✦ ├⌬ RESULTADO FINAL*

> 📊 *PUNTAJE:* ${sesion.puntaje}/200
> 📈 *PORCENTAJE:* ${porcentaje}%

${diagTexto}

> _Gracias por completar el test._`
      })

      clearTimeout(sesion.timer)
      partidas.delete(sender)

    }, 5000)

    return
  }

  // ═══════════════════════════════════════════════════════════
  // 𝙿𝚁𝙾𝚇𝙸𝙼𝙰 𝙿𝚁𝙴𝙶𝚄𝙽𝚃𝙰
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