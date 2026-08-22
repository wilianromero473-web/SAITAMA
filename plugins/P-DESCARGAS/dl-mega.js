import { File } from 'megajs'
import mime from 'mime-types'
import fs from 'fs'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'


// ═══════════════════════════════════════
// ✰ SAITAMABOT • MEGA
// ═══════════════════════════════════════

const MAX_MB = 300

const TMP_DIR =
  join(
    process.cwd(),
    'tmp',
    'mega'
  )


// ═══════════════════════════════════════
// ✰ NOMBRE DEL BOT
// ═══════════════════════════════════════

const BOT_NAME =
  '𝑺𝒂𝒊𝒕𝒂𝒎𝒂𝑩𝒐𝒕'


// ═══════════════════════════════════════
// ✰ CREAR CARPETA
// ═══════════════════════════════════════

await fs.promises.mkdir(
  TMP_DIR,
  {
    recursive: true
  }
)


// ═══════════════════════════════════════
// ✰ FORMATEAR TAMAÑO
// ═══════════════════════════════════════

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


// ═══════════════════════════════════════
// ✰ LIMPIAR NOMBRE
// ═══════════════════════════════════════

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
    .slice(
      0,
      180
    ) ||
    'archivo'
}


// ═══════════════════════════════════════
// ✰ HANDLER
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

  let url =
    text?.trim() || ''


  // ═══════════════════════════════════
  // ✰ ENLACE CITADO
  // ═══════════════════════════════════

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


  // ═══════════════════════════════════
  // ✰ SIN ENLACE
  // ═══════════════════════════════════

  if (!url) {

    return m.reply(

`༺ 𝙼𝙴𝙶𝙰 ༻

✰ 𝚄𝚜𝚊:
${usedPrefix}${command} <enlace>

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix}${command} https://mega.nz/file/...

✰ ${BOT_NAME}`
    )
  }


  // ═══════════════════════════════════
  // ✰ URL INVÁLIDA
  // ═══════════════════════════════════

  if (
    !/^https?:\/\/(www\.)?mega\.nz\//i.test(
      url
    )
  ) {

    return m.reply(

`༺ 𝙴𝙽𝙻𝙰𝙲𝙴 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾 ༻

✰ 𝙳𝚎𝚋𝚎𝚜 𝚞𝚜𝚊𝚛 𝚞𝚗 𝚎𝚗𝚕𝚊𝚌𝚎 𝚍𝚎 𝙼𝙴𝙶𝙰.

✰ ${BOT_NAME}`
    )
  }


  // ═══════════════════════════════════
  // ✰ REACCIÓN
  // ═══════════════════════════════════

  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  ).catch(() => {})


  // ═══════════════════════════════════
  // ✰ MENSAJE INICIAL
  // ═══════════════════════════════════

  const progressMsg =
    await m.reply(

`༺ 𝙼𝙴𝙶𝙰 ༻

✰ 𝙾𝚋𝚝𝚎𝚗𝚒𝚎𝚗𝚍𝚘 𝚊𝚛𝚌𝚑𝚒𝚟𝚘...

✰ ${BOT_NAME}`
    )


  let tmpPath = ''


  try {

    // ═════════════════════════════════
    // ✰ OBTENER ARCHIVO
    // ═════════════════════════════════

    const file =
      File.fromURL(url)


    await file.loadAttributes()


    if (!file.name) {

      throw new Error(
        'Mega no devolvió el nombre del archivo.'
      )
    }


    // ═════════════════════════════════
    // ✰ TAMAÑO
    // ═════════════════════════════════

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
        `El archivo supera ${MAX_MB} MB.`
      )
    }


    // ═════════════════════════════════
    // ✰ NOMBRE
    // ═════════════════════════════════

    const fileName =
      cleanFileName(
        file.name
      )


    // ═════════════════════════════════
    // ✰ MIME
    // ═════════════════════════════════

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


    // ═════════════════════════════════
    // ✰ ARCHIVO TEMPORAL
    // ═════════════════════════════════

    tmpPath =
      join(
        TMP_DIR,
        `${randomUUID()}.tmp`
      )


    // ═════════════════════════════════
    // ✰ DESCARGAR
    // ═════════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '⬇️',
          key: m.key
        }
      }
    ).catch(() => {})


    await conn.sendMessage(
      m.chat,
      {
        edit: progressMsg.key,
        text:

`༺ 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝙽𝙳𝙾 ༻

✰ ${fileName}

✰ ${BOT_NAME}`
      }
    ).catch(() => {})


    await pipeline(
      file.download(),
      fs.createWriteStream(
        tmpPath
      )
    )


    // ═════════════════════════════════
    // ✰ COMPROBAR ARCHIVO
    // ═════════════════════════════════

    const stat =
      await fs.promises.stat(
        tmpPath
      )


    if (
      !stat.isFile() ||
      stat.size < 1
    ) {

      throw new Error(
        'El archivo está vacío.'
      )
    }


    if (
      stat.size /
      (1024 * 1024) >
      MAX_MB
    ) {

      throw new Error(
        `El archivo supera ${MAX_MB} MB.`
      )
    }


    // ═════════════════════════════════
    // ✰ LEER ARCHIVO
    // ═════════════════════════════════

    const buffer =
      await fs.promises.readFile(
        tmpPath
      )


    // ═════════════════════════════════
    // ✰ ENVIAR ARCHIVO
    // ═════════════════════════════════

    await conn.sendMessage(
      m.chat,
      {

        document:
          buffer,

        fileName,

        mimetype:
          mimeType,

        caption:

`༺ 𝙼𝙴𝙶𝙰 ༻

✰ 𝙰𝚛𝚌𝚑𝚒𝚟𝚘 𝚕𝚒𝚜𝚝𝚘.

✰ ${BOT_NAME}`

      },
      {
        quoted: m
      }
    )


    // ═════════════════════════════════
    // ✰ REACCIÓN FINAL
    // ═════════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    ).catch(() => {})


    // ═════════════════════════════════
    // ✰ ACTUALIZAR MENSAJE
    // ═════════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        edit: progressMsg.key,
        text:

`༺ 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰 𝙻𝙸𝚂𝚃𝙰 ༻

✰ ${formatBytes(stat.size)}

✰ ${BOT_NAME}`
      }
    ).catch(() => {})


  } catch (error) {

    // ═════════════════════════════════
    // ✰ REACCIÓN ERROR
    // ═════════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})


    // ═════════════════════════════════
    // ✰ ERROR
    // ═════════════════════════════════

    const errorText =
      String(
        error?.message ||
        'Error desconocido.'
      ).slice(
        0,
        200
      )


    await conn.sendMessage(
      m.chat,
      {
        edit: progressMsg.key,
        text:

`༺ 𝙴𝚁𝚁𝙾𝚁 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛.

✰ ${errorText}

✰ ${BOT_NAME}`
      }
    ).catch(() => {})


  } finally {

    // ═════════════════════════════════
    // ✰ LIMPIAR TEMPORAL
    // ═════════════════════════════════

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


// ═══════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═══════════════════════════════════════

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


handler.register = false


export default handler