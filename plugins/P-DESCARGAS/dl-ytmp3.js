import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { writeAudioTags } from '../../lib/audioTags.js'

const API_URL = 'https://api.stellarwa.xyz'
const API_KEY = 'proyectsV2'

const LUXINFINITY = 'https://luxinfinity.vercel.app/api'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'


/*
|--------------------------------------------------------------------------
| LIMPIAR NOMBRE
|--------------------------------------------------------------------------
*/

function cleanTitle(value) {
  return String(value || 'YouTube Audio')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || 'YouTube Audio'
}


/*
|--------------------------------------------------------------------------
| NORMALIZAR RESPUESTA DE LA API
|--------------------------------------------------------------------------
*/

function parseMediaResponse(data) {
  if (!data) return null

  const info =
    data.data ||
    data.result ||
    data

  const download =
    info?.dl ||
    info?.download ||
    info?.url ||
    info?.downloadUrl ||
    info?.download_url ||
    null

  if (!download) return null

  return {
    download,

    title:
      info?.title ||
      info?.name ||
      'YouTube Audio',

    author:
      info?.author ||
      info?.artist ||
      info?.channel ||
      'Desconocido',

    image:
      info?.image ||
      info?.thumbnail ||
      info?.thumb ||
      null,

    fileName:
      info?.fileName ||
      info?.filename ||
      null
  }
}


/*
|--------------------------------------------------------------------------
| STELLARWA
|--------------------------------------------------------------------------
*/

async function fetchStellar(url) {

  const endpoint =
    `${API_URL}/dl/ytmp3`

  console.log(
    '[YTMP3] StellarWA:',
    endpoint
  )

  const response = await axios.get(
    endpoint,
    {
      params: {
        url,
        key: API_KEY
      },

      timeout: 120000,

      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json'
      }
    }
  )

  console.log(
    '[YTMP3] StellarWA RESPONSE:',
    JSON.stringify(response.data)
  )

  const media =
    parseMediaResponse(response.data)

  if (!media?.download) {
    throw new Error(
      'StellarWA no devolvió un enlace de descarga.'
    )
  }

  return media
}


/*
|--------------------------------------------------------------------------
| LUXINFINITY
|--------------------------------------------------------------------------
*/

async function fetchLuxInfinity(url) {

  const endpoint =
    `${LUXINFINITY}/dl/ytmp3`

  console.log(
    '[YTMP3] LuxInfinity:',
    endpoint
  )

  const response = await axios.get(
    endpoint,
    {
      params: {
        url
      },

      timeout: 120000,

      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json'
      }
    }
  )

  console.log(
    '[YTMP3] LuxInfinity RESPONSE:',
    JSON.stringify(response.data)
  )

  const media =
    parseMediaResponse(response.data)

  if (!media?.download) {
    throw new Error(
      'LuxInfinity no devolvió un enlace de descarga.'
    )
  }

  return media
}


/*
|--------------------------------------------------------------------------
| OBTENER INFORMACIÓN DEL AUDIO
|--------------------------------------------------------------------------
*/

async function fetchMp3(url) {

  let stellarError = null

  /*
  |--------------------------------------------------------------------------
  | API PRINCIPAL
  |--------------------------------------------------------------------------
  */

  try {

    return await fetchStellar(url)

  } catch (error) {

    stellarError = error

    console.error(
      '[YTMP3] StellarWA FALLÓ:',
      error?.response?.data ||
      error?.message ||
      error
    )
  }


  /*
  |--------------------------------------------------------------------------
  | API DE RESPALDO
  |--------------------------------------------------------------------------
  */

  try {

    return await fetchLuxInfinity(url)

  } catch (error) {

    console.error(
      '[YTMP3] LuxInfinity FALLÓ:',
      error?.response?.data ||
      error?.message ||
      error
    )

    throw new Error(
      `No se pudo obtener el audio.\n\n` +
      `StellarWA: ${
        stellarError?.message ||
        'Error desconocido'
      }\n` +
      `LuxInfinity: ${
        error?.message ||
        'Error desconocido'
      }`
    )
  }
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
    text,
    userDb,
    usedPrefix,
    command
  }
) => {

  /*
  |--------------------------------------------------------------------------
  | COMPROBAR TEXTO
  |--------------------------------------------------------------------------
  */

  if (!text?.trim()) {

    return m.reply(
      `⌬┤ ✙ ├⌬ USO\n\n` +
      `> Ejemplo:\n` +
      `> ${usedPrefix}${command} https://youtu.be/xxxxx`
    )
  }


  /*
  |--------------------------------------------------------------------------
  | COMPROBAR USUARIO
  |--------------------------------------------------------------------------
  */

  if (!userDb) {

    return m.reply(
      '❌ No existe tu usuario en la base de datos.'
    )
  }


  /*
  |--------------------------------------------------------------------------
  | REACCIÓN DE CARGANDO
  |--------------------------------------------------------------------------
  */

  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  ).catch(() => {})


  /*
  |--------------------------------------------------------------------------
  | CREAR TMP
  |--------------------------------------------------------------------------
  */

  const tmpDir = './tmp'

  await fs.promises.mkdir(
    tmpDir,
    {
      recursive: true
    }
  )


  /*
  |--------------------------------------------------------------------------
  | ARCHIVO TEMPORAL
  |--------------------------------------------------------------------------
  */

  const filePath =
    path.join(
      tmpDir,
      `ytmp3_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}.mp3`
    )


  try {

    const input =
      text.trim()


    /*
    |--------------------------------------------------------------------------
    | URL DE YOUTUBE
    |--------------------------------------------------------------------------
    */

    const ytUrl =
      input.startsWith('http')
        ? input
        : `https://www.youtube.com/watch?v=${input}`


    console.log(
      '[YTMP3] URL:',
      ytUrl
    )


    /*
    |--------------------------------------------------------------------------
    | OBTENER ENLACE MP3
    |--------------------------------------------------------------------------
    */

    const media =
      await fetchMp3(ytUrl)


    if (!media?.download) {

      throw new Error(
        'La API no devolvió un enlace de descarga.'
      )
    }


    /*
    |--------------------------------------------------------------------------
    | INFORMACIÓN
    |--------------------------------------------------------------------------
    */

    const title =
      cleanTitle(
        media.title
      )

    const author =
      cleanTitle(
        media.author ||
        'Desconocido'
      )

    const image =
      media.image ||
      null


    /*
    |--------------------------------------------------------------------------
    | DESCARGAR MP3
    |--------------------------------------------------------------------------
    */

    console.log(
      '[YTMP3] Descargando audio...'
    )

    const response =
      await axios.get(
        media.download,
        {
          responseType: 'stream',

          timeout: 600000,

          maxContentLength:
            Infinity,

          maxBodyLength:
            Infinity,

          headers: {
            'User-Agent':
              USER_AGENT,

            Accept:
              'audio/mpeg,audio/*,*/*'
          }
        }
      )


    /*
    |--------------------------------------------------------------------------
    | GUARDAR EN TMP
    |--------------------------------------------------------------------------
    */

    await pipeline(
      response.data,
      fs.createWriteStream(
        filePath
      )
    )


    /*
    |--------------------------------------------------------------------------
    | COMPROBAR ARCHIVO
    |--------------------------------------------------------------------------
    */

    const stat =
      await fs.promises.stat(
        filePath
      )


    if (
      !stat.isFile() ||
      stat.size < 1000
    ) {

      throw new Error(
        'El archivo MP3 es inválido o está vacío.'
      )
    }


    console.log(
      `[YTMP3] Tamaño: ${
        (stat.size / 1024 / 1024)
          .toFixed(2)
      } MB`
    )


    /*
    |--------------------------------------------------------------------------
    | TAGS
    |--------------------------------------------------------------------------
    */

    try {

      await writeAudioTags(
        filePath,
        {
          title,
          author,
          artist: author,
          album: title,
          image
        }
      )

      console.log(
        '[YTMP3] Tags agregados.'
      )

    } catch (tagError) {

      console.log(
        '[YTMP3] No se pudieron agregar tags:',
        tagError?.message ||
        tagError
      )
    }


    /*
    |--------------------------------------------------------------------------
    | ENVIAR AUDIO
    |--------------------------------------------------------------------------
    */

    await conn.sendMessage(
      m.chat,
      {
        audio:
          fs.readFileSync(
            filePath
          ),

        mimetype:
          'audio/mpeg',

        fileName:
          `${title}.mp3`,

        ptt:
          false
      },
      {
        quoted: m
      }
    )


    /*
    |--------------------------------------------------------------------------
    | REACCIÓN OK
    |--------------------------------------------------------------------------
    */

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    ).catch(() => {})


  } catch (error) {

    console.error(
      '[YTMP3 ERROR]',
      error?.response?.data ||
      error?.message ||
      error
    )


    /*
    |--------------------------------------------------------------------------
    | REACCIÓN ERROR
    |--------------------------------------------------------------------------
    */

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})


    return m.reply(
      `✧ *NO SE PUDO DESCARGAR EL AUDIO.*\n\n` +
      `⚠️ ${
        error?.message ||
        'Error desconocido'
      }`
    )


  } finally {

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR TMP
    |--------------------------------------------------------------------------
    */

    await rm(
      filePath,
      {
        force: true
      }
    ).catch(() => {})

    console.log(
      '[YTMP3] Archivo temporal eliminado.'
    )
  }
}


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN
|--------------------------------------------------------------------------
*/

handler.help = [
  'ytmp3 <url>',
  'yta <url>',
  'play <url>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'ytmp3',
  'yta',
  'mp3yt'
]

handler.register = true

export default handler