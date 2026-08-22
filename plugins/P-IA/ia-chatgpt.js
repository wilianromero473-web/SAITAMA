import fetch from 'node-fetch'

// ═══════════════════════════════════════
// 🤖 CHATGPT
// ═══════════════════════════════════════

const API_KEY = 'lem_fe9463d34eeb2708aea45ffdefd6f852f5361f01'

const AI_API =
  'https://api.lempi.lat/ai/chatgpt'


// ═══════════════════════════════════════
// ✏️ EDITAR MENSAJE
// ═══════════════════════════════════════

async function editarMensaje(
  conn,
  chat,
  key,
  texto
) {

  try {

    await conn.sendMessage(
      chat,
      {
        text: texto,
        edit: key
      }
    )

    return true

  } catch {

    return false

  }

}


// ═══════════════════════════════════════
// 🧠 CONSULTAR CHATGPT
// ═══════════════════════════════════════

async function preguntarChatGPT(
  pregunta
) {

  const url =
    `${AI_API}?q=${encodeURIComponent(pregunta)}&apikey=${API_KEY}`


  const response =
    await fetch(url)


  if (!response.ok) {

    throw new Error(
      `API HTTP ${response.status}`
    )

  }


  const json =
    await response.json()


  if (
    !json?.status ||
    !json?.resultado?.respuesta
  ) {

    throw new Error(
      'La API no devolvió una respuesta válida.'
    )

  }


  return String(
    json.resultado.respuesta
  ).trim()

}


// ═══════════════════════════════════════
// 🎯 HANDLER PRINCIPAL
// ═══════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command
  }
) => {

  // ═════════════════════════════════════
  // 📝 OBTENER CONSULTA
  // ═════════════════════════════════════

  const consulta =
    String(
      text || ''
    ).trim()


  // ═════════════════════════════════════
  // ❌ SIN TEXTO
  // ═════════════════════════════════════

  if (!consulta) {

    return m.reply(
`༻ 𝘾𝙃𝘼𝙏𝙂𝙋𝙏

𝙷𝚘𝚕𝚊, 𝚜𝚘𝚢 𝙲𝚑𝚊𝚝𝙶𝙿𝚃.

𝙿𝚞𝚎𝚍𝚎𝚜 𝚑𝚊𝚌𝚎𝚛𝚖𝚎 𝚌𝚞𝚊𝚕𝚚𝚞𝚒𝚎𝚛 𝚙𝚛𝚎𝚐𝚞𝚗𝚝𝚊.

𝙴𝚓𝚎𝚖𝚙𝚕𝚘𝚜:

༻ ${usedPrefix}${command} Ayúdame con mi tarea`
    )

  }


  // ═════════════════════════════════════
  // ⏳ MENSAJE DE ESPERA
  // ═════════════════════════════════════

  let mensaje = null


  try {

    mensaje =
      await conn.sendMessage(
        m.chat,
        {
          text:
`༻ 𝘾𝙃𝘼𝙏𝙂𝙋𝙏

𝘾𝚑𝚊𝚝𝙶𝙿𝚃 𝚎𝚜𝚝á 𝚙𝚎𝚗𝚜𝚊𝚗𝚍𝚘...`
        },
        {
          quoted: m
        }
      )

  } catch {

    mensaje = null

  }


  // ═════════════════════════════════════
  // 🧠 PROCESAR CONSULTA
  // ═════════════════════════════════════

  try {

    const respuesta =
      await preguntarChatGPT(
        consulta
      )


    // ═════════════════════════════════
    // ❌ RESPUESTA VACÍA
    // ═════════════════════════════════

    if (!respuesta) {

      throw new Error(
        'La IA no devolvió una respuesta.'
      )

    }


    // ═════════════════════════════════
    // 💬 RESPUESTA FINAL
    // ═════════════════════════════════

    const respuestaFinal =
`༻ 𝘾𝙃𝘼𝙏𝙂𝙋𝙏

${respuesta}`


    // ═════════════════════════════════
    // ✏️ EDITAR "PENSANDO..."
    // ═════════════════════════════════

    if (mensaje) {

      const editado =
        await editarMensaje(
          conn,
          m.chat,
          mensaje.key,
          respuestaFinal
        )


      // ═══════════════════════════════
      // 📩 FALLBACK SI NO PUEDE EDITAR
      // ═══════════════════════════════

      if (!editado) {

        await conn.sendMessage(
          m.chat,
          {
            text: respuestaFinal
          },
          {
            quoted: m
          }
        )

      }

    } else {

      await m.reply(
        respuestaFinal
      )

    }


  } catch (error) {

    // ═════════════════════════════════
    // ❌ ERROR
    // ═════════════════════════════════

    const errorTexto =
`༻ 𝘾𝙃𝘼𝙏𝙂𝙋𝙏

𝙉𝚘 𝚙𝚞𝚍𝚎 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛 𝚕𝚊 𝚜𝚘𝚕𝚒𝚌𝚒𝚝𝚞𝚍.

𝙸𝚗𝚝é𝚗𝚝𝚊𝚕𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`


    // ═════════════════════════════════
    // ✏️ EDITAR MENSAJE DE ESPERA
    // ═════════════════════════════════

    if (mensaje) {

      const editado =
        await editarMensaje(
          conn,
          m.chat,
          mensaje.key,
          errorTexto
        )


      if (!editado) {

        await m.reply(
          errorTexto
        )

      }

    } else {

      await m.reply(
        errorTexto
      )

    }

  }

}


// ═══════════════════════════════════════
// ⚙️ CONFIGURACIÓN DEL PLUGIN
// ═══════════════════════════════════════

handler.help = [
  'chatgpt <pregunta>',
  'gpt <pregunta>',
  'chat <pregunta>',
  'gptia <pregunta>'
]


handler.tags = [
  'ia'
]


handler.command = [
  'chatgpt',
  'gpt',
  'chat',
  'gptia'
]


export default handler