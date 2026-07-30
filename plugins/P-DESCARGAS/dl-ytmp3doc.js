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
| NORMALIZAR RESPUESTA DE LAS APIS
|--------------------------------------------------------------------------
*/

function parseMediaResponse(data) {
  if (!data) return null

  const info = data.data || data.result || data

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
| API STELLARWA
|--------------------------------------------------------------------------
*/

async function fetchStellar(url) {
  const endpoint = `${API_URL}/dl/ytmp3`

  console.log('[YTMP3] StellarWA:', endpoint)

  const response = await axios.get(endpoint, {
    params: {
      url,
      key: API_KEY
    },

    timeout: 120000,

    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json'
    }
  })

  console.log(
    '[YTMP3] StellarWA RESPONSE:',
    JSON.stringify(response.data)
  )

  const media = parseMediaResponse(response.data)

  if (!media?.download) {
    throw new Error(
      'StellarWA no devolvió un enlace de descarga.'
    )
  }

  return media
}

/*
|--------------------------------------------------------------------------
| API LUXINFINITY
|--------------------------------------------------------------------------
*/

async function fetchLuxInfinity(url) {
  const endpoint = `${LUXINFINITY}/dl/ytmp3`

  console.log('[YTMP3] LuxInfinity:', endpoint)

  const response = await axios.get(endpoint, {
    params: {
      url
    },

    timeout: 120000,

    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json'
    }
  })

  console.log(
    '[YTMP3] LuxInfinity RESPONSE:',
    JSON.stringify(response.data)
  )

  const media = parseMediaResponse(response.data)

  if (!media?.download) {
    throw new Error(
      'LuxInfinity no devolvió un enlace de descarga.'
    )
  }

  return media
}

/*
|--------------------------------------------------------------------------
| OBTENER MP3
|--------------------------------------------------------------------------
*/

async function fetchMp3(url) {

  let stellarError = null

  /*
  |--------------------------------------------------------------------------
  | PRINCIPAL
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
  | RESPALDO
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
      `No se pudo obtener el audio.\n` +
      `StellarWA: ${
        stellarError?.message || 'Error desconocido'
      }\n` +
      `LuxInfinity: ${
        error?.message || 'Error desconocido'
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
  | COMPROBAR URL
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
  | REACCIÓN
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
  | CARPETA TMP
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

  const filePath = path.join(
    tmpDir,
    `ytmp3doc_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}.mp3`
  )

  try {

    const input = text.trim()

    /*
    |--------------------------------------------------------------------------
    | CONVERTIR ID A URL
    |--------------------------------------------------------------------------
    */

    const ytUrl = input.startsWith('http')
      ? input
      : `https://www.youtube.com/watch?v=${input}`

    /*
    |--------------------------------------------------------------------------
    | OBTENER INFORMACIÓN
    |--------------------------------------------------------------------------
    */

    console.log(
      '[YTMP3DOC] URL:',
      ytUrl
    )

    const media = await fetchMp3(ytUrl)

    if (!media?.download) {
      throw new Error(
        'Las APIs no devolvieron un enlace de descarga.'
      )
    }

    console.log(
      '[YTMP3DOC] DOWNLOAD:',
      media.download
    )

    /*
    |--------------------------------------------------------------------------
    | DESCARGAR MP3
    |--------------------------------------------------------------------------
    */

    const response = await axios.get(
      media.download,
      {
        responseType: 'stream',

        timeout: 600000,

        maxContentLength: Infinity,

        maxBodyLength: Infinity,

        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'audio/mpeg,audio/*,*/*'
        }
      }
    )

    /*
    |--------------------------------------------------------------------------
    | GUARDAR TEMPORALMENTE
    |--------------------------------------------------------------------------
    */

    await pipeline(
      response.data,
      fs.createWriteStream(filePath)
    )

    /*
    |--------------------------------------------------------------------------
    | VALIDAR ARCHIVO
    |--------------------------------------------------------------------------
    */

    const stat = await fs.promises.stat(
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
      `[YTMP3DOC] Archivo: ${(stat.size / 1024 / 1024).toFixed(2)} MB`
    )

    /*
    |--------------------------------------------------------------------------
    | INFORMACIÓN
    |--------------------------------------------------------------------------
    */

    const title = cleanTitle(
      media.title
    )

    const author = cleanTitle(
      media.author || 'Desconocido'
    )

    const image =
      media.image || null

    /*
    |--------------------------------------------------------------------------
    | TAGS MP3
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
        '[YTMP3DOC] Tags agregados correctamente.'
      )

    } catch (tagError) {

      console.log(
        '[YTMP3DOC] Error en tags:',
        tagError?.message || tagError
      )
    }

    /*
    |--------------------------------------------------------------------------
    | NOMBRE DEL DOCUMENTO
    |--------------------------------------------------------------------------
    */

    let fileName =
      media.fileName ||
      `${title}.mp3`

    fileName = cleanTitle(
      fileName
    )

    if (
      !fileName
        .toLowerCase()
        .endsWith('.mp3')
    ) {
      fileName += '.mp3'
    }

    /*
    |--------------------------------------------------------------------------
    | ENVIAR DOCUMENTO
    |--------------------------------------------------------------------------
    */

    await conn.sendMessage(
      m.chat,
      {
        document:
          fs.readFileSync(filePath),

        mimetype:
          'audio/mpeg',

        fileName,

        caption:
`╭━━━〔 ✅ AUDIO DESCARGADO 〕━━━⬣

┃
┃ 🎵 *Título:*
┃ ${title}
┃
┃ 🎤 *Artista:*
┃ ${author}
┃
┃ 🎧 *Formato:* MP3
┃ 📄 *Tipo:* Documento
┃
╰━━━━━━━━━━━━━━━━━━⬣`
      },
      {
        quoted: m
      }
    )

    /*
    |--------------------------------------------------------------------------
    | REACCIÓN FINAL
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
      '[YTMP3DOC ERROR]',
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
    | ELIMINAR ARCHIVO TEMPORAL
    |--------------------------------------------------------------------------
    */

    await rm(
      filePath,
      {
        force: true
      }
    ).catch(() => {})

    console.log(
      '[YTMP3DOC] Archivo temporal eliminado.'
    )
  }
}

/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DEL PLUGIN
|--------------------------------------------------------------------------
*/

handler.help = [
  'ytmp3doc <url>',
  'ytadoc <url>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'ytmp3doc',
  'ytadoc'
]

handler.register = true

export default handler