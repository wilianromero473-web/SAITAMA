import axios from 'axios'
import {
  createWriteStream,
  statSync,
  mkdirSync,
  readFileSync
} from 'fs'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'
import { mediafireInfo } from '@axel-dev09/zen-dl'
import config from '../../config.js'


// ═══════════════════════════════════════
// ✰ SAITAMABOT • MEDIAFIRE
// ═══════════════════════════════════════

const MAX_MB = 1024

const UA =
  'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

const TMP_DIR = join(
  process.cwd(),
  'tmp',
  'mfire'
)

mkdirSync(TMP_DIR, {
  recursive: true
})


// ═══════════════════════════════════════
// ✰ NOMBRE DEL BOT
// ═══════════════════════════════════════

const BOT_NAME =
  '𝑺𝒂𝒊𝒕𝒂𝒎𝒂𝑩𝒐𝒕'


// ═══════════════════════════════════════
// ✰ MIME
// ═══════════════════════════════════════

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


// ═══════════════════════════════════════
// ✰ LIMPIAR NOMBRE
// ═══════════════════════════════════════

function cleanFileName(name) {

  return String(name || 'archivo')
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180) || 'archivo'
}


// ═══════════════════════════════════════
// ✰ EXTENSIÓN
// ═══════════════════════════════════════

function getExtension(fileName) {

  const ext =
    extname(fileName || '')
      .replace('.', '')
      .toLowerCase()

  return ext || 'bin'
}


// ═══════════════════════════════════════
// ✰ DESCARGAR
// ═══════════════════════════════════════

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
      `El archivo supera ${MAX_MB} MB.`
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
      'Archivo inválido.'
    )
  }


  if (
    size / (1024 * 1024) > MAX_MB
  ) {

    throw new Error(
      `El archivo supera ${MAX_MB} MB.`
    )
  }


  return size
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

`༺ 𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻

✰ 𝚄𝚜𝚊:
${usedPrefix}${command} <enlace>

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix}${command} https://mediafire.com/...

✰ ${BOT_NAME}`
    )
  }


  // ═══════════════════════════════════
  // ✰ URL INVÁLIDA
  // ═══════════════════════════════════

  if (
    !/^https?:\/\/(www\.)?mediafire\.com\//i.test(
      url
    )
  ) {

    return m.reply(

`༺ 𝙴𝙽𝙻𝙰𝙲𝙴 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾 ༻

✰ 𝙳𝚎𝚋𝚎𝚜 𝚞𝚜𝚊𝚛 𝚞𝚗 𝚎𝚗𝚕𝚊𝚌𝚎 𝚍𝚎 𝙼𝚎𝚍𝚒𝚊𝙵𝚒𝚛𝚎.

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


  const tmpBase =
    join(
      TMP_DIR,
      randomUUID()
    )


  let filePath = null


  try {

    // ═════════════════════════════════
    // ✰ INFORMACIÓN
    // ═════════════════════════════════

    const info =
      await mediafireInfo(url)


    if (!info) {
      throw new Error(
        'No se obtuvo información.'
      )
    }


    const download =
      info.download ||
      info.dl ||
      info.url


    if (!download) {
      throw new Error(
        'No existe enlace de descarga.'
      )
    }


    // ═════════════════════════════════
    // ✰ ARCHIVO
    // ═════════════════════════════════

    const originalName =
      cleanFileName(
        info.name ||
        info.filename ||
        info.fileName ||
        'archivo'
      )


    const ext =
      getExtension(
        originalName
      )


    const fileName =
      originalName
        .toLowerCase()
        .endsWith(`.${ext}`)
        ? originalName
        : `${originalName}.${ext}`


    const mime =
      MF_MIMES[ext] ||
      'application/octet-stream'


    filePath =
      `${tmpBase}.${ext}`


    // ═════════════════════════════════
    // ✰ DESCARGANDO
    // ═════════════════════════════════

    await m.reply(

`༺ 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝙽𝙳𝙾 ༻

✰ ${fileName}

✰ ${BOT_NAME}`
    )


    await downloadFile(
      download,
      filePath
    )


    // ═════════════════════════════════
    // ✰ ENVIAR
    // ═════════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        document:
          readFileSync(filePath),

        mimetype: mime,

        fileName,

        caption:
`༺ 𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻

✰ 𝙰𝚛𝚌𝚑𝚒𝚟𝚘 𝚕𝚒𝚜𝚝𝚘.

✰ ${BOT_NAME}`
      },
      {
        quoted: m
      }
    )


    // ═════════════════════════════════
    // ✰ OK
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


  } catch (error) {

    // ═════════════════════════════════
    // ✰ ERROR
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


    return m.reply(

`༺ 𝙴𝚁𝚁𝙾𝚁 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛.

✰ ${String(
  error?.message ||
  'Error desconocido.'
).slice(0, 200)}

✰ ${BOT_NAME}`
    )


  } finally {

    // ═════════════════════════════════
    // ✰ LIMPIAR
    // ═════════════════════════════════

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


// ═══════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═══════════════════════════════════════

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


handler.register = false


export default handler