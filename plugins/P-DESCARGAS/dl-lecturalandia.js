import axios from 'axios'
import {
  createWriteStream,
  statSync,
  mkdirSync,
  readFileSync
} from 'fs'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import {
  bookSearch,
  bookInfo
} from '@axel-dev09/zen-dl'
import config from '../../config.js'


// ═══════════════════════════════════════
// ✰ SAITAMABOT • LIBROS
// ═══════════════════════════════════════

const TMP_DIR =
  join(
    process.cwd(),
    'tmp',
    'books'
  )


mkdirSync(
  TMP_DIR,
  {
    recursive: true
  }
)


const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'


// ═══════════════════════════════════════
// ✰ LIMPIAR NOMBRE
// ═══════════════════════════════════════

function cleanFileName(value) {

  return String(
    value || 'libro'
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
    .slice(
      0,
      150
    )
    || 'libro'
}


// ═══════════════════════════════════════
// ✰ DESCARGAR ARCHIVO
// ═══════════════════════════════════════

async function downloadFile(
  dlData,
  destPath
) {

  if (!dlData?.url) {

    throw new Error(
      'No existe un enlace de descarga.'
    )
  }


  const response =
    await axios.get(
      dlData.url,
      {

        headers: {

          ...(dlData.headers || {}),

          'User-Agent':
            USER_AGENT

        },

        responseType:
          'stream',

        timeout:
          120000,

        maxRedirects:
          10,

        maxContentLength:
          Infinity,

        maxBodyLength:
          Infinity

      }
    )


  const contentType =
    response.headers[
      'content-type'
    ] || ''


  if (
    contentType.includes(
      'text/html'
    )
  ) {

    throw new Error(
      'El servidor devolvió HTML en lugar del archivo.'
    )
  }


  await pipeline(
    response.data,
    createWriteStream(
      destPath
    )
  )


  const {
    size
  } =
    statSync(
      destPath
    )


  if (
    size < 1000
  ) {

    throw new Error(
      `Archivo inválido (${size} bytes).`
    )
  }


  return size
}


// ═══════════════════════════════════════
// ✰ HANDLER PRINCIPAL
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

  let query =
    text
      ? text.trim()
      : ''


  // ═══════════════════════════════════
  // ✰ OBTENER TEXTO CITADO
  // ═══════════════════════════════════

  if (
    !query &&
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


    query =
      match
        ? match[0]
        : quotedText.trim()
  }


  // ═══════════════════════════════════
  // ✰ COMPROBAR CONSULTA
  // ═══════════════════════════════════

  if (!query) {

    return m.reply(

`༺ 𝙻𝙸𝙱𝚁𝙾𝚂 ༻

✰ 𝙲𝚘𝚗𝚜𝚞𝚕𝚝𝚊 𝚛𝚎𝚚𝚞𝚎𝚛𝚒𝚍𝚊

✰ 𝚄𝚜𝚊:
${usedPrefix}${command} <nombre del libro>

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix}${command} Harry Potter

✰ ${config.botName || 'SaitamaBot'}`
    )
  }


  const chatId =
    m.chat


  // ═══════════════════════════════════
  // ✰ REACCIÓN
  // ═══════════════════════════════════

  await conn.sendMessage(
    chatId,
    {
      react: {
        text: '🔎',
        key: m.key
      }
    }
  ).catch(() => {})


  // ═══════════════════════════════════
  // ✰ BUSCANDO
  // ═══════════════════════════════════

  await m.reply(

`༺ 𝙻𝙸𝙱𝚁𝙾𝚂 ༻

✰ 𝙱𝚞𝚜𝚌𝚊𝚗𝚍𝚘 𝚕𝚒𝚋𝚛𝚘...
✰ 𝙾𝚋𝚝𝚎𝚗𝚒𝚎𝚗𝚍𝚘 𝚒𝚗𝚏𝚘𝚛𝚖𝚊𝚌𝚒ó𝚗...

✰ ${config.botName || 'SaitamaBot'}`
  )


  // ═══════════════════════════════════
  // ✰ ARCHIVO TEMPORAL
  // ═══════════════════════════════════

  const tmpPath =
    join(
      TMP_DIR,
      randomUUID()
    )


  try {

    let info


    // ═════════════════════════════════
    // ✰ OBTENER INFORMACIÓN
    // ═════════════════════════════════

    if (
      /lectulandia\.co/i.test(
        query
      )
    ) {

      info =
        await bookInfo(
          query
        )

    } else {

      const search =
        await bookSearch(
          query,
          1
        )


      if (
        !search?.length
      ) {

        return m.reply(

`༺ 𝙽𝚘 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚍𝚘 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛ó 𝚗𝚒𝚗𝚐ú𝚗 𝚕𝚒𝚋𝚛𝚘.

✰ 𝙱ú𝚜𝚚𝚞𝚎𝚍𝚊:
${query}

✰ ${config.botName || 'SaitamaBot'}`
        )
      }


      if (
        !search[0]?.url
      ) {

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


    // ═════════════════════════════════
    // ✰ DATOS
    // ═════════════════════════════════

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


    const genre =
      cleanFileName(
        info.genre ||
        '-'
      )


    const year =
      info.year ||
      '-'


    const description =
      String(
        info.description ||
        'Sin descripción disponible.'
      )


    // ═════════════════════════════════
    // ✰ PORTADA
    // ═════════════════════════════════

    if (
      info.thumb
    ) {

      try {

        await conn.sendMessage(
          chatId,
          {

            image: {
              url:
                info.thumb
            },

            caption:
`༺ 𝙻𝙸𝙱𝚁𝙾 ༻

✰ 𝙽𝚘𝚖𝚋𝚛𝚎: ${title}
✰ 𝙰𝚞𝚝𝚘𝚛: ${author}
✰ 𝙶é𝚗𝚎𝚛𝚘: ${genre}
✰ 𝙿𝚞𝚋𝚕𝚒𝚌𝚊𝚍𝚘: ${year}

✰ 𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚌𝚒ó𝚗:
${description.slice(
  0,
  500
)}${description.length > 500 ? '...' : ''}

✰ ${config.botName || 'SaitamaBot'}`

          },
          {
            quoted:
              m
          }
        )

      } catch {
        // Continúa si falla la portada.
      }
    }


    // ═════════════════════════════════
    // ✰ BUSCAR PDF / EPUB
    // ═════════════════════════════════

    let downloadData =
      null

    let extension =
      'pdf'

    let mimetype =
      'application/pdf'


    if (
      info.download?.pdf?.url
    ) {

      downloadData =
        info.download.pdf

      extension =
        'pdf'

      mimetype =
        'application/pdf'

    } else if (
      info.download?.epub?.url
    ) {

      downloadData =
        info.download.epub

      extension =
        'epub'

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


    // ═════════════════════════════════
    // ✰ NOMBRE DEL ARCHIVO
    // ═════════════════════════════════

    const fileName =
      `${title} - ${author}.${extension}`


    const destPath =
      `${tmpPath}.${extension}`


    // ═════════════════════════════════
    // ✰ DESCARGANDO
    // ═════════════════════════════════

    await conn.sendMessage(
      chatId,
      {
        react: {
          text: '⬇️',
          key: m.key
        }
      }
    ).catch(() => {})


    await m.reply(

`༺ 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰 ༻

✰ 𝙳𝚎𝚨𝚌𝚊𝚛𝚐𝚊𝚗𝚍𝚘...

✰ 𝙻𝚒𝚋𝚛𝚘: ${title}
✰ 𝙵𝚘𝚛𝚖𝚊𝚝𝚘: ${extension.toUpperCase()}

✰ ${config.botName || 'SaitamaBot'}`
    )


    await downloadFile(
      downloadData,
      destPath
    )


    // ═════════════════════════════════
    // ✰ ENVIAR DOCUMENTO
    // ═════════════════════════════════

    await conn.sendMessage(
      chatId,
      {

        document:
          readFileSync(
            destPath
          ),

        mimetype,

        fileName,

        caption:
`༺ 𝙻𝙸𝙱𝚁𝙾 𝙻𝙸𝚂𝚃𝙾 ༻

✰ 𝚃í𝚝𝚞𝚕𝚘: ${title}
✰ 𝙰𝚞𝚝𝚘𝚛: ${author}
✰ 𝙵𝚘𝚛𝚖𝚊𝚝𝚘: ${extension.toUpperCase()}

✰ 𝙰𝚛𝚌𝚑𝚒𝚟𝚘 𝚕𝚒𝚜𝚝𝚘.

✰ ${config.botName || 'SaitamaBot'}`

      },
      {
        quoted:
          m
      }
    )


    // ═════════════════════════════════
    // ✰ REACCIÓN FINAL
    // ═════════════════════════════════

    await conn.sendMessage(
      chatId,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    ).catch(() => {})


  } catch (error) {

    // ═════════════════════════════════
    // ✰ ERROR
    // ═════════════════════════════════

    await conn.sendMessage(
      chatId,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})


    return m.reply(

`༺ 𝙴𝚛𝚛𝚘𝚛 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚙𝚛𝚘𝚌𝚎𝚜𝚊𝚛 𝚎𝚕 𝚕𝚒𝚋𝚛𝚘.

✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
${String(
  error?.message ||
  'Error desconocido'
).slice(0, 500)}

✰ ${config.botName || 'SaitamaBot'}`
    )


  } finally {

    // ═════════════════════════════════
    // ✰ LIMPIAR TEMPORALES
    // ═════════════════════════════════

    await rm(
      `${tmpPath}.pdf`,
      {
        force:
          true
      }
    ).catch(() => {})


    await rm(
      `${tmpPath}.epub`,
      {
        force:
          true
      }
    ).catch(() => {})
  }
}


// ═══════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═══════════════════════════════════════

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


handler.register =
  false


export default handler