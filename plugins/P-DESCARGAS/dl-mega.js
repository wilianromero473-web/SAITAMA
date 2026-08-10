import { File } from 'megajs'
import mime from 'mime-types'
import fs from 'fs'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN
|--------------------------------------------------------------------------
*/

const MAX_MB = 300

const TMP_DIR = join(
  process.cwd(),
  'tmp',
  'mega'
)


/*
|--------------------------------------------------------------------------
| CREAR CARPETA TEMPORAL
|--------------------------------------------------------------------------
*/

await fs.promises.mkdir(
  TMP_DIR,
  {
    recursive: true
  }
)


/*
|--------------------------------------------------------------------------
| FORMATEAR TAMAÑO
|--------------------------------------------------------------------------
*/

function formatBytes(bytes = 0) {

  if (!bytes) {
    return '0 Bytes'
  }

  const sizes = [
    'Bytes',
    'KB',
    'MB',
    'GB',
    'TB'
  ]

  const i =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    )

  return (
    parseFloat(
      (
        bytes /
        Math.pow(1024, i)
      ).toFixed(2)
    ) +
    ' ' +
    sizes[i]
  )
}


/*
|--------------------------------------------------------------------------
| LIMPIAR NOMBRE
|--------------------------------------------------------------------------
*/

function cleanFileName(name) {

  return String(
    name || 'archivo'
  )
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .slice(0, 180) ||
    'archivo'
}


/*
|--------------------------------------------------------------------------
| PROGRESO
|--------------------------------------------------------------------------
*/

async function animarProgreso(
  conn,
  chatId,
  key
) {

  for (
    let i = 1;
    i <= 10;
    i++
  ) {

    const porcentaje =
      i * 10

    const barra =
      '█'.repeat(i) +
      '░'.repeat(10 - i)


    await conn.sendMessage(
      chatId,
      {
        edit: key,
        text:
`*⌬┤ ⏳ ├⌬ DESCARGANDO DESDE MEGA*

> Progreso: *${porcentaje}%*
> ${barra}`
      }
    ).catch(() => {})


    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          300
        )
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
    usedPrefix,
    command
  }
) => {

  /*
  |--------------------------------------------------------------------------
  | OBTENER URL
  |--------------------------------------------------------------------------
  */

  let url =
    text
      ? text.trim()
      : ''


  /*
  |--------------------------------------------------------------------------
  | BUSCAR URL EN MENSAJE CITADO
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
`╭━━━〔 📦 MEGA DOWNLOADER 〕━━━⬣

✦ Enviá un enlace de Mega.

✧ También podés responder
a un mensaje que tenga el enlace.

Ejemplo:
${usedPrefix}${command} https://mega.nz/file/xxxxx

╰━━━━━━━━━━━━━━━━━━⬣`
    )
  }


  /*
  |--------------------------------------------------------------------------
  | VALIDAR MEGA
  |--------------------------------------------------------------------------
  */

  if (
    !/^(https?:\/\/)?(www\.)?mega\.nz\//i.test(
      url
    )
  ) {

    return m.reply(
`╭━━━〔 ❌ LINK INVÁLIDO 〕━━━⬣

> El enlace debe pertenecer a Mega.

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
  | MENSAJE DE PROGRESO
  |--------------------------------------------------------------------------
  */

  const progresoMsg =
    await m.reply(
`*⌬┤ ⏳ ├⌬ OBTENIENDO ARCHIVO DE MEGA*

> Progreso: *0%*
> ░░░░░░░░░░

📌 Límite máximo: *${MAX_MB} MB*`
    )


  let tmpPath = ''


  try {

    /*
    |--------------------------------------------------------------------------
    | OBTENER ARCHIVO
    |--------------------------------------------------------------------------
    */

    const file =
      File.fromURL(url)


    await file.loadAttributes()


    if (!file.name) {

      throw new Error(
        'Mega no devolvió el nombre del archivo.'
      )
    }


    /*
    |--------------------------------------------------------------------------
    | TAMAÑO
    |--------------------------------------------------------------------------
    */

    const size =
      Number(
        file.size || 0
      )


    const sizeMB =
      size /
      (1024 * 1024)


    if (
      sizeMB > MAX_MB
    ) {

      throw new Error(
        `El archivo supera el límite de ${MAX_MB} MB. Tamaño: ${sizeMB.toFixed(2)} MB.`
      )
    }


    /*
    |--------------------------------------------------------------------------
    | NOMBRE
    |--------------------------------------------------------------------------
    */

    const fileName =
      cleanFileName(
        file.name
      )


    /*
    |--------------------------------------------------------------------------
    | MIME
    |--------------------------------------------------------------------------
    */

    const extension =
      fileName
        .split('.')
        .pop()
        ?.toLowerCase()


    const mimeType =
      mime.lookup(
        extension || ''
      ) ||
      'application/octet-stream'


    /*
    |--------------------------------------------------------------------------
    | PROGRESO VISUAL
    |--------------------------------------------------------------------------
    */

    await animarProgreso(
      conn,
      m.chat,
      progresoMsg.key
    )


    /*
    |--------------------------------------------------------------------------
    | ARCHIVO TEMPORAL
    |--------------------------------------------------------------------------
    */

    tmpPath =
      join(
        TMP_DIR,
        `${randomUUID()}.tmp`
      )


    /*
    |--------------------------------------------------------------------------
    | DESCARGAR
    |--------------------------------------------------------------------------
    */

    await pipeline(
      file.download(),
      fs.createWriteStream(
        tmpPath
      )
    )


    /*
    |--------------------------------------------------------------------------
    | COMPROBAR ARCHIVO
    |--------------------------------------------------------------------------
    */

    const stat =
      await fs.promises.stat(
        tmpPath
      )


    if (
      !stat.isFile() ||
      stat.size < 1
    ) {

      throw new Error(
        'El archivo descargado está vacío o es inválido.'
      )
    }


    /*
    |--------------------------------------------------------------------------
    | LEER ARCHIVO
    |--------------------------------------------------------------------------
    */

    const buffer =
      await fs.promises.readFile(
        tmpPath
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

        fileName,

        mimetype: mimeType,

        caption:
`╭━━━〔 ✅ MEGA 〕━━━⬣

┃ 📂 *Archivo:*
┃ ${fileName}
┃
┃ 📦 *Tamaño:*
┃ ${formatBytes(stat.size)}
┃
┃ 🚀 *Tipo:*
┃ ${mimeType}
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


    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR PROGRESO
    |--------------------------------------------------------------------------
    */

    await conn.sendMessage(
      m.chat,
      {
        edit: progresoMsg.key,
        text:
`*⌬┤ ✅ ├⌬ DESCARGA COMPLETADA*

> 📂 ${fileName}
> 📦 ${formatBytes(stat.size)}`
      }
    ).catch(() => {})


  } catch (error) {

    console.error(
      '[MEGA ERROR]',
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


    return conn.sendMessage(
      m.chat,
      {
        edit: progresoMsg.key,
        text:
`*⌬┤ ❌ ├⌬ ERROR*

> No se pudo descargar el archivo desde Mega.

⚠️ ${
          error?.message ||
          'Error desconocido.'
        }`
      }
    ).catch(() =>
      m.reply(
`*⌬┤ ❌ ├⌬ ERROR.*

> No se pudo descargar el archivo desde Mega.

⚠️ ${
          error?.message ||
          'Error desconocido.'
        }`
      )
    )


  } finally {

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR TEMPORAL
    |--------------------------------------------------------------------------
    */

    if (tmpPath) {

      await rm(
        tmpPath,
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
  'mega <link>',
  'mg <link>'
]

handler.command = [
  'mega',
  'mg'
]

handler.tags = [
  'descargas'
]


export default handler