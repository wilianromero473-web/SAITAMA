import axios from 'axios'
import config from '../../config.js'

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
|
| IMPORTANTE:
| Esta variable debe ser una URL REAL.
| No pongas "TU-API-SFW.com".
|
*/

const API_URL = 'https://luxinfinity.vercel.app/api/nsfw/boobs'

/*
|--------------------------------------------------------------------------
| OBTENER URL DE IMAGEN
|--------------------------------------------------------------------------
*/

async function obtenerImagen() {
  const response = await axios.get(API_URL, {
    timeout: 30000,
    maxRedirects: 10,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  })

  const data = response.data

  console.log('[PACK API]', data)

  /*
  | La función soporta varios formatos comunes:
  |
  | { url: "https://..." }
  | { image: "https://..." }
  | { data: { url: "https://..." } }
  | { data: { image: "https://..." } }
  | { result: { url: "https://..." } }
  */

  const imageUrl =
    data?.url ||
    data?.image ||
    data?.data?.url ||
    data?.data?.image ||
    data?.result?.url ||
    data?.result?.image ||
    null

  if (!imageUrl) {
    throw new Error(
      'La API respondió correctamente, pero no devolvió una URL de imagen.'
    )
  }

  return imageUrl
}

/*
|--------------------------------------------------------------------------
| HANDLER
|--------------------------------------------------------------------------
*/

const handler = async (
  m,
  {
    conn,
    command,
    usedPrefix
  }
) => {

  /*
  |--------------------------------------------------------------------------
  | SOLO GRUPOS
  |--------------------------------------------------------------------------
  */

  if (!m.isGroup) {
    return m.reply(
      '*『 ❌ 』ESTE COMANDO SOLO FUNCIONA EN GRUPOS.*'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | OBTENER IMAGEN
  |--------------------------------------------------------------------------
  */

  try {

    const imageUrl = await obtenerImagen()

    /*
    |--------------------------------------------------------------------------
    | COMPROBAR URL
    |--------------------------------------------------------------------------
    */

    if (
      typeof imageUrl !== 'string' ||
      !/^https?:\/\//i.test(imageUrl)
    ) {
      throw new Error(
        'La API devolvió una URL inválida.'
      )
    }

    /*
    |--------------------------------------------------------------------------
    | ENVIAR IMAGEN
    |--------------------------------------------------------------------------
    */

    await conn.sendMessage(
      m.chat,
      {
        image: {
          url: imageUrl
        },

        caption:
`『 🎴 』TETAS

│ ✨ Imagen aleatoria
│
│ 🔄 Pulsa el botón
│ para obtener otra.`,

        footer: config.botname,

        buttons: [
          {
            buttonId: `${usedPrefix}${command}`,
            buttonText: {
              displayText: '🔄 SIGUIENTE PACK'
            },
            type: 1
          }
        ],

        headerType: 4
      },
      {
        quoted: m
      }
    )

  } catch (error) {

    console.error(
      '[PACK ERROR]',
      error?.response?.status || '',
      error?.message || error
    )

    return m.reply(
      '*『 ❌ 』ERROR.*\n\n' +
      '> La API respondió, pero no entregó una imagen utilizable.'
    )
  }
}

/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN
|--------------------------------------------------------------------------
*/

handler.help = [
  'pack'
]

handler.tags = [
  'utils'
]

handler.command = [
  'ph',
  'tetas'
]

handler.groupOnly = true
handler.register = true

export default handler