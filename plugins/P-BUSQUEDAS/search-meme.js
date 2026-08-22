import axios from 'axios'
import fetch from 'node-fetch'
import { sendSmart } from '../../lib/serializer.js'

const API_URL =
  'https://meme-api.com/gimme/memesenespanol'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'


// ═══════════════════════════════════
// 🎭 OBTENER MEME
// ═══════════════════════════════════

async function getMeme() {

  const response = await axios.get(
    API_URL,
    {
      timeout: 30000,

      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json'
      }
    }
  )

  const data =
    response?.data

  if (
    !data?.url
  ) {
    throw new Error(
      'La API no devolvió ningún meme.'
    )
  }

  return {
    title:
      data.title ||
      'Meme sin título',

    url:
      data.url,

    postLink:
      data.postLink ||
      null
  }
}


// ═══════════════════════════════════
// 📥 DESCARGAR MEME
// ═══════════════════════════════════

async function downloadMeme(url) {

  const response =
    await fetch(
      url,
      {
        headers: {
          'User-Agent':
            USER_AGENT,

          Accept:
            'image/*,*/*'
        },

        timeout: 30000
      }
    )

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    )
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    )

  if (!buffer.length) {
    throw new Error(
      'El archivo está vacío.'
    )
  }

  return buffer
}


// ═══════════════════════════════════
// 🎯 HANDLER
// ═══════════════════════════════════

const handler = async (
  m,
  {
    conn,
    command,
    usedPrefix,
    userDb
  }
) => {

  // ═════════════════════════════════
  // ⏳ REACCIÓN
  // ═════════════════════════════════

  await m.react('🎭')


  try {

    // ═════════════════════════════════
    // 🔎 BUSCAR MEME
    // ═════════════════════════════════

    const meme =
      await getMeme()


    // ═════════════════════════════════
    // 📥 DESCARGAR IMAGEN
    // ═════════════════════════════════

    const buffer =
      await downloadMeme(
        meme.url
      )


    // ═════════════════════════════════
    // 📝 TEXTO
    // ═════════════════════════════════

    const caption =
`✰ 𝙼𝙴𝙼𝙴 ✰

✦ 𝚃í𝚝𝚞𝚕𝚘:
> ${meme.title}

✦ 𝙵𝚞𝚎𝚗𝚝𝚎:
> Meme API

✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃`


    // ═════════════════════════════════
    // 📤 ENVIAR
    // ═════════════════════════════════

    await sendSmart(
      conn,
      m,
      {
        image: buffer,

        caption,

        footer:
          global.botname ||
          'SAITAMA-BOT',

        buttons: [
          {
            buttonId:
              `${usedPrefix}${command}`,

            buttonText: {
              displayText:
                '✰ 𝙾𝚃𝚁𝙾 𝙼𝙴𝙼𝙴'
            }
          }
        ],

        viewOnce: true,

        headerType: 4

      },
      {},

      userDb
    )


    await m.react('✅')


  } catch (error) {

    await m.react('❌')

    return m.reply(
`✰ 𝙼𝙴𝙼𝙴 ✰

✦ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘
✦ 𝚘𝚋𝚝𝚎𝚗𝚎𝚛 𝚎𝚕 𝚖𝚎𝚖𝚎.

✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
${String(
  error?.message ||
  error ||
  'Error desconocido'
).slice(0, 300)}`
    )

  }

}


// ═══════════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═══════════════════════════════════

handler.help = [
  'meme'
]

handler.command = [
  'meme',
  'memardo',
  'chiste'
]

handler.tags = [
  'busquedas'
]

export default handler