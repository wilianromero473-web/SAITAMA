import axios from 'axios'
import { createWriteStream, statSync, mkdirSync, readFileSync } from 'fs'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { bookSearch, bookInfo } from '@axel-dev09/zen-dl'
import config from '../../config.js'

const TMP_DIR = join(process.cwd(), 'tmp', 'books')

mkdirSync(TMP_DIR, {
  recursive: true
})

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'


/*
|--------------------------------------------------------------------------
| LIMPIAR NOMBRE
|--------------------------------------------------------------------------
*/

function cleanFileName(value) {
  return String(value || 'libro')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150) || 'libro'
}


/*
|--------------------------------------------------------------------------
| DESCARGAR ARCHIVO
|--------------------------------------------------------------------------
*/

async function downloadFile(dlData, destPath) {
  if (!dlData?.url) {
    throw new Error('No existe un enlace de descarga.')
  }

  const response = await axios.get(
    dlData.url,
    {
      headers: {
        ...(dlData.headers || {}),
        'User-Agent': USER_AGENT
      },

      responseType: 'stream',

      timeout: 120000,

      maxRedirects: 10,

      maxContentLength: Infinity,

      maxBodyLength: Infinity
    }
  )

  const contentType =
    response.headers['content-type'] || ''

  if (contentType.includes('text/html')) {
    throw new Error(
      'El servidor devolvió HTML en lugar del archivo.'
    )
  }

  await pipeline(
    response.data,
    createWriteStream(destPath)
  )

  const { size } = statSync(destPath)

  if (size < 1000) {
    throw new Error(
      `Archivo inválido (${size} bytes).`
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

  let query = text
    ? text.trim()
    : ''


  /*
  |--------------------------------------------------------------------------
  | OBTENER TEXTO DEL MENSAJE CITADO
  |--------------------------------------------------------------------------
  */

  if (!query && m.quoted) {

    const quotedText =
      m.quoted.body ||
      m.quoted.text ||
      ''

    const match =
      quotedText.match(
        /https?:\/\/[^\s]+/i
      )

    query =
      match
        ? match[0]
        : quotedText.trim()
  }


  /*
  |--------------------------------------------------------------------------
  | COMPROBAR CONSULTA
  |--------------------------------------------------------------------------
  */

  if (!query) {

    return m.reply(
`*⌬┤ ✙ ├⌬ USO.*

> *${usedPrefix}${command} <nombre del libro o link>*

Ejemplo:

> ${usedPrefix}${command} Harry Potter`
    )
  }


  const chatId = m.chat


  /*
  |--------------------------------------------------------------------------
  | MENSAJE DE ESPERA
  |--------------------------------------------------------------------------
  */

  await m.reply(
    '*⌬┤ 🔎 ├⌬ Buscando libro...*'
  )


  /*
  |--------------------------------------------------------------------------
  | ARCHIVO TEMPORAL
  |--------------------------------------------------------------------------
  */

  const tmpPath =
    join(
      TMP_DIR,
      randomUUID()
    )


  try {

    let info


    /*
    |--------------------------------------------------------------------------
    | BUSCAR / OBTENER LIBRO
    |--------------------------------------------------------------------------
    */

    if (
      /lectulandia\.co/i.test(query)
    ) {

      info =
        await bookInfo(query)

    } else {

      const search =
        await bookSearch(
          query,
          1
        )


      if (!search?.length) {

        return m.reply(
`*⌬┤ ❌ ├⌬ NO ENCONTRADO.*

> No se encontró ningún libro para:

*${query}*`
        )
      }


      if (!search[0]?.url) {
        throw new Error(
          'El resultado no contiene URL.'
        )
      }


      info =
        await bookInfo(
          search[0].url
        )
    }


    if (!info) {
      throw new Error(
        'No se pudo obtener la información del libro.'
      )
    }


    /*
    |--------------------------------------------------------------------------
    | INFORMACIÓN DEL LIBRO
    |--------------------------------------------------------------------------
    */

    const title =
      cleanFileName(
        info.title ||
        'Libro'
      )

    const author =
      cleanFileName(
        info.author ||
        'Autor desconocido'
      )


    /*
    |--------------------------------------------------------------------------
    | PORTADA
    |--------------------------------------------------------------------------
    */

    if (info.thumb) {

      try {

        const description =
          String(
            info.description || ''
          )

        await conn.sendMessage(
          chatId,
          {
            image: {
              url: info.thumb
            },

            caption:
`*⌬┤ 📚 ├⌬ ${title}*

> 👤 *Autor:* ${author}
> 📑 *Género:* ${info.genre || '-'}
> 📅 *Publicado:* ${info.year || '-'}

> 📖 ${description.slice(0, 500)}${description.length > 500 ? '...' : ''}`
          },
          {
            quoted: m
          }
        )

      } catch {
        // Si falla la portada, continúa con la descarga.
      }
    }


    /*
    |--------------------------------------------------------------------------
    | BUSCAR PDF / EPUB
    |--------------------------------------------------------------------------
    */

    let downloadData = null
    let extension = 'pdf'
    let mimetype = 'application/pdf'


    if (info.download?.pdf) {

      downloadData =
        info.download.pdf

      extension = 'pdf'

      mimetype =
        'application/pdf'

    } else if (
      info.download?.epub
    ) {

      downloadData =
        info.download.epub

      extension = 'epub'

      mimetype =
        'application/epub+zip'
    }


    if (
      !downloadData?.url
    ) {

      throw new Error(
        'No hay enlaces PDF o EPUB disponibles.'
      )
    }


    /*
    |--------------------------------------------------------------------------
    | NOMBRE DEL ARCHIVO
    |--------------------------------------------------------------------------
    */

    const fileName =
      `${title} - ${author}.${extension}`


    const destPath =
      `${tmpPath}.${extension}`


    /*
    |--------------------------------------------------------------------------
    | DESCARGAR
    |--------------------------------------------------------------------------
    */

    await m.reply(
      `*⌬┤ ⬇️ ├⌬ Descargando...*\n> 📚 ${title}`
    )


    await downloadFile(
      downloadData,
      destPath
    )


    /*
    |--------------------------------------------------------------------------
    | ENVIAR COMO DOCUMENTO
    |--------------------------------------------------------------------------
    */

    await conn.sendMessage(
      chatId,
      {
        document:
          readFileSync(destPath),

        mimetype,

        fileName,

        caption:
`*⌬┤ ✅ ├⌬ LIBRO LISTO.*

> 📚 *Título:* ${title}
> 👤 *Autor:* ${author}
> 📁 *Formato:* ${extension.toUpperCase()}

> 🌸 ${config.botName || 'SaitamaBot'}`
      },
      {
        quoted: m
      }
    )


  } catch (error) {

    console.error(
      '[LIBRO ERROR]',
      error?.message || error
    )


    return m.reply(
`*⌬┤ ❌ ├⌬ ERROR.*

> No se pudo procesar el libro.

⚠️ ${error?.message || 'Error desconocido'}`
    )


  } finally {

    /*
    |--------------------------------------------------------------------------
    | LIMPIAR TEMPORALES
    |--------------------------------------------------------------------------
    */

    await rm(
      `${tmpPath}.pdf`,
      {
        force: true
      }
    ).catch(() => {})


    await rm(
      `${tmpPath}.epub`,
      {
        force: true
      }
    ).catch(() => {})
  }
}


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DEL PLUGIN
|--------------------------------------------------------------------------
*/

handler.help = [
  'libro <nombre>',
  'lectulandia <nombre>'
]

handler.command = [
  'libro',
  'lectulandia'
]

handler.tags = [
  'descargas'
]

export default handler