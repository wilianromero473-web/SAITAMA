import fetch from 'node-fetch'

// ═══════════════════════════════════════
// 🤖 GEMINI IA
// ═══════════════════════════════════════

const API_KEY = 'lem_fe9463d34eeb2708aea45ffdefd6f852f5361f01'

const AI_API =
  'https://api.lempi.lat/ai/gemini'


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
// 🧠 CONSULTAR GEMINI
// ═══════════════════════════════════════

async function preguntarGemini(
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


  // ═════════════════════════════════
  // 🔎 VALIDAR RESPUESTA
  // ═════════════════════════════════

  if (
    !json?.status ||
    !json?.resultado?.respuesta
  ) {

    throw new Error(
      'La API no devolvió una respuesta válida.'
    )

  }


  const respuesta =
    String(
      json.resultado.respuesta
    ).trim()


  if (!respuesta) {

    throw new Error(
      'Gemini no devolvió una respuesta.'
    )

  }


  // ═════════════════════════════════
  // 🧠 MODELO
  // ═════════════════════════════════

  const modelo =
    json.modelo
      ? String(json.modelo).trim()
      : null


  return {
    respuesta,
    modelo
  }

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
  // 📝 CONSULTA
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
`༻ 𝙂𝙀𝙈𝙄𝙉𝙄 𝙄𝘼

𝙷𝚘𝚕𝚊, 𝚜𝚘𝚢 𝙂𝚎𝚖𝚒𝚗𝚒.

𝙿𝚞𝚎𝚍𝚎𝚜 𝚑𝚊𝚌𝚎𝚛𝚖𝚎 𝚌𝚞𝚊𝚕𝚚𝚞𝚒𝚎𝚛 𝚙𝚛𝚎𝚐𝚞𝚗𝚝𝚊.

𝙴𝚓𝚎𝚖𝚙𝚕𝚘𝚜:

༻ ${usedPrefix}${command} ¿Qué es la inteligencia artificial?`
    )

  }


  // ═════════════════════════════════════
  // ⏳ MENSAJE INICIAL
  // ═════════════════════════════════════

  let mensaje = null


  try {

    mensaje =
      await conn.sendMessage(
        m.chat,
        {
          text:
`༻ 𝙂𝙀𝙈𝙄𝙉𝙄 𝙄𝘼

𝙂𝚎𝚖𝚒𝚗𝚒 𝚎𝚜𝚝á 𝚙𝚎𝚗𝚜𝚊𝚗𝚍𝚘...`
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

    const resultado =
      await preguntarGemini(
        consulta
      )


    // ═════════════════════════════════
    // 📋 DATOS
    // ═════════════════════════════════

    const respuesta =
      resultado.respuesta

    const modelo =
      resultado.modelo


    // ═════════════════════════════════
    // 💬 RESPUESTA FINAL
    // ═════════════════════════════════

    let respuestaFinal =
`༻ 𝙂𝙀𝙈𝙄𝙉𝙄 𝙄𝘼

${respuesta}`


    // ═════════════════════════════════
    // 🧠 AGREGAR MODELO SOLO SI EXISTE
    // ═════════════════════════════════

    if (modelo) {

      respuestaFinal +=
`

╭─〔 𝙈𝙊𝘿𝙀𝙇𝙊 〕
╰─ ${modelo}`

    }


    // ═════════════════════════════════
    // ✏️ EDITAR MENSAJE
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
      // 📩 FALLBACK
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
`༻ 𝙂𝙀𝙈𝙄𝙉𝙄 𝙄𝘼

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
  'gemini <pregunta>',
  'geminia <pregunta>',
  'gem <pregunta>'
]


handler.tags = [
  'ia'
]


handler.command = [
  'gemini',
  'geminia',
  'gem'
]


export default handler