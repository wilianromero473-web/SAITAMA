import axios from 'axios'
import { createWriteStream, statSync, mkdirSync, readFileSync } from 'fs'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'
import { mediafireInfo } from '@axel-dev09/zen-dl'

/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN
|--------------------------------------------------------------------------
*/

const MAX_MB = 1024

const UA =
  'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

const TMP_DIR = join(
  process.cwd(),
  'tmp',
  'mfire'
)

const MF_MIMES = {
  apk: 'application/vnd.android.package-archive',

  pdf: 'application/pdf',

  zip: 'application/zip',

  rar: 'application/vnd.rar',

  '7z': 'application/x-7z-compressed',

  mp4: 'video/mp4',

  mkv: 'video/x-matroska',

  avi: 'video/x-msvideo',

  mov: 'video/quicktime',

  mp3: 'audio/mpeg',

  m4a: 'audio/mp4',

  wav: 'audio/wav',

  jpg: 'image/jpeg',

  jpeg: 'image/jpeg',

  png: 'image/png',

  gif: 'image/gif',

  webp: 'image/webp',

  doc: 'application/msword',

  docx:
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  xls: 'application/vnd.ms-excel',

  xlsx:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  ppt: 'application/vnd.ms-powerpoint',

  pptx:
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  txt: 'text/plain',

  csv: 'text/csv',

  exe: 'application/x-msdownload'
}


/*
|--------------------------------------------------------------------------
| CREAR TMP
|--------------------------------------------------------------------------
*/

mkdirSync(
  TMP_DIR,
  {
    recursive: true
  }
)


/*
|--------------------------------------------------------------------------
| LIMPIAR NOMBRE
|--------------------------------------------------------------------------
*/

function cleanFileName(name) {

  return String(name || 'archivo')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180) || 'archivo'
}


/*
|--------------------------------------------------------------------------
| OBTENER EXTENSIÓN
|--------------------------------------------------------------------------
*/

function getExtension(fileName) {

  const ext =
    extname(fileName || '')
      .replace('.', '')
      .toLowerCase()

  return ext || 'bin'
}


/*
|--------------------------------------------------------------------------
| DESCARGAR ARCHIVO
|--------------------------------------------------------------------------
*/

async function downloadFile(
  url,
  destPath
) {

  const response =
    await axios.get(
      url,
      {
        headers: {
          'User-Agent': UA,
          Referer: 'https://www.mediafire.com/'
        },

        responseType: 'stream',

        timeout: 120000,

        maxRedirects: 10,

        maxContentLength: Infinity,

        maxBodyLength: Infinity
      }
    )


  const contentLength =
    parseInt(
      response.headers['content-length'] || '0',
      10
    )


  if (
    contentLength > 0 &&
    contentLength / (1024 * 1024) > MAX_MB
  ) {

    throw new Error(
      `El archivo supera el límite de ${MAX_MB} MB.`
    )
  }


  await pipeline(
    response.data,
    createWriteStream(destPath)
  )


  const {
    size
  } = statSync(destPath)


  if (size < 100) {

    throw new Error(
      `Archivo inválido (${size} bytes).`
    )
  }


  if (
    size / (1024 * 1024) > MAX_MB
  ) {

    throw new Error(
      `El archivo supera el límite de ${MAX_MB} MB.`
    )
  }


  return size
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
    usedPrefix,
    command
  }
) => {

  let url =
    text
      ? text.trim()
      : ''


  /*
  |--------------------------------------------------------------------------
  | BUSCAR LINK EN MENSAJE CITADO
  |--------------------------------------------------------------------------
  */

  if (
    !url &&
    m.quoted
  ) {

    const quotedText =
      m.quoted.body ||
      m.quoted.text ||
      ''


    const match =
      quotedText.match(
        /https?:\/\/[^\s]+/i
      )


    if (match) {
      url = match[0]
    }
  }


  /*
  |--------------------------------------------------------------------------
  | COMPROBAR URL
  |--------------------------------------------------------------------------
  */

  if (!url) {

    return m.reply(
`╭━━━〔 📥 MEDIAFIRE 〕━━━⬣

✦ Enviá un enlace de MediaFire.

✧ También podés responder a
un mensaje que contenga el enlace.

Ejemplo:
${usedPrefix}${command} https://www.mediafire.com/file/xxxxx

╰━━━━━━━━━━━━━━━━━━⬣`
    )
  }


  if (
    !/^(https?:\/\/)?(www\.)?mediafire\.com\//i.test(
      url
    )
  ) {

    return m.reply(
`╭━━━〔 ❌ ENLACE INVÁLIDO 〕━━━⬣

> El enlace debe pertenecer a MediaFire.

╰━━━━━━━━━━━━━━━━━━⬣`
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
  | TMP
  |--------------------------------------------------------------------------
  */

  const tmpBase =
    join(
      TMP_DIR,
      randomUUID()
    )


  let filePath = null


  try {

    /*
    |--------------------------------------------------------------------------
    | INFORMACIÓN MEDIAFIRE
    |--------------------------------------------------------------------------
    */

    const info =
      await mediafireInfo(url)


    if (!info) {

      throw new Error(
        'No se pudo obtener la información del archivo.'
      )
    }


    const download =
      info.download ||
      info.dl ||
      info.url


    if (!download) {

      throw new Error(
        'MediaFire no devolvió un enlace de descarga.'
      )
    }


    const originalName =
      cleanFileName(
        info.name ||
        info.filename ||
        info.fileName ||
        'archivo'
      )


    /*
    |--------------------------------------------------------------------------
    | EXTENSIÓN
    |--------------------------------------------------------------------------
    */

    const ext =
      getExtension(
        originalName
      )


    /*
    |--------------------------------------------------------------------------
    | NOMBRE FINAL
    |--------------------------------------------------------------------------
    */

    let fileName =
      originalName


    if (
      !fileName
        .toLowerCase()
        .endsWith(`.${ext}`)
    ) {

      fileName =
        `${fileName}.${ext}`
    }


    /*
    |--------------------------------------------------------------------------
    | MIME
    |--------------------------------------------------------------------------
    */

    let mime =
      MF_MIMES[ext] ||
      'application/octet-stream'


    /*
    |--------------------------------------------------------------------------
    | COMPROBAR TAMAÑO
    |--------------------------------------------------------------------------
    */

    try {

      const head =
        await axios.head(
          download,
          {
            headers: {
              'User-Agent': UA,
              Referer:
                'https://www.mediafire.com/'
            },

            timeout: 15000,

            maxRedirects: 10
          }
        )


      const contentType =
        head.headers['content-type']
          ?.split(';')[0]
          ?.trim()


      const contentLength =
        parseInt(
          head.headers['content-length'] || '0',
          10
        )


      if (
        contentType &&
        contentType !== 'application/octet-stream'
      ) {

        if (
          !MF_MIMES[ext]
        ) {
          mime = contentType
        }
      }


      if (
        contentLength > 0 &&
        contentLength / (1024 * 1024) > MAX_MB
      ) {

        throw new Error(
          `El archivo supera el límite de ${MAX_MB} MB.`
        )
      }

    } catch (headError) {

      /*
      |--------------------------------------------------------------------------
      | HEAD NO ES OBLIGATORIO
      |--------------------------------------------------------------------------
      */

      if (
        headError?.message?.includes(
          'supera el límite'
        )
      ) {

        throw headError
      }
    }


    /*
    |--------------------------------------------------------------------------
    | ARCHIVO TEMPORAL
    |--------------------------------------------------------------------------
    */

    filePath =
      `${tmpBase}.${ext}`


    /*
    |--------------------------------------------------------------------------
    | DESCARGAR
    |--------------------------------------------------------------------------
    */

    await m.reply(
`╭━━━〔 ⬇️ DESCARGANDO 〕━━━⬣

📄 *Archivo:*
${fileName}

📦 *Formato:*
${ext.toUpperCase()}

⏳ Esperá un momento...

╰━━━━━━━━━━━━━━━━━━⬣`
    )


    await downloadFile(
      download,
      filePath
    )


    /*
    |--------------------------------------------------------------------------
    | LEER ARCHIVO
    |--------------------------------------------------------------------------
    */

    const buffer =
      readFileSync(
        filePath
      )


    /*
    |--------------------------------------------------------------------------
    | ENVIAR COMO DOCUMENTO
    |--------------------------------------------------------------------------
    */

    await conn.sendMessage(
      m.chat,
      {
        document: buffer,

        mimetype: mime,

        fileName,

        caption:
`╭━━━〔 ✅ MEDIAFIRE 〕━━━⬣

┃ 📄 *Archivo:*
┃ ${fileName}
┃
┃ 📦 *Formato:*
┃ ${ext.toUpperCase()}
┃
┃ 📥 *Estado:*
┃ Descarga completada
┃
╰━━━━━━━━━━━━━━━━━━⬣`
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
      '[MEDIAFIRE ERROR]',
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
`╭━━━〔 ❌ ERROR 〕━━━⬣

No se pudo descargar el archivo.

⚠️ ${
      error?.message ||
      'Error desconocido.'
    }

╰━━━━━━━━━━━━━━━━━━⬣`
    )


  } finally {

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR TEMPORAL
    |--------------------------------------------------------------------------
    */

    if (filePath) {

      await rm(
        filePath,
        {
          force: true
        }
      ).catch(() => {})
    }
  }
}


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DEL PLUGIN
|--------------------------------------------------------------------------
*/

handler.help = [
  'mediafire <link>',
  'mf <link>',
  'mfire <link>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'mediafire',
  'mf',
  'mfire',
  'mediafiredl'
]


export default handler