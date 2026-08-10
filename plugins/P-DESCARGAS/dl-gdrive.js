import fetch from 'node-fetch'

const MAX_MB = 500

const GDRIVE_MIMES = {
  'audio/mpeg': {
    ext: 'mp3',
    tipo: 'audio'
  },

  'audio/mp4': {
    ext: 'm4a',
    tipo: 'audio'
  },

  'audio/ogg': {
    ext: 'ogg',
    tipo: 'audio'
  },

  'video/mp4': {
    ext: 'mp4',
    tipo: 'video'
  },

  'video/x-matroska': {
    ext: 'mkv',
    tipo: 'document'
  },

  'image/jpeg': {
    ext: 'jpg',
    tipo: 'image'
  },

  'image/png': {
    ext: 'png',
    tipo: 'image'
  },

  'image/gif': {
    ext: 'gif',
    tipo: 'image'
  },

  'application/pdf': {
    ext: 'pdf',
    tipo: 'document'
  },

  'application/zip': {
    ext: 'zip',
    tipo: 'document'
  },

  'application/vnd.android.package-archive': {
    ext: 'apk',
    tipo: 'document'
  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORMATEAR TAMAÑO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function formatSize(bytes) {

  if (!bytes) {
    return '?'
  }

  const mb =
    bytes / (1024 * 1024)

  return mb >= 1
    ? `${mb.toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER LINK DE MENSAJE CITADO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!url && m.quoted) {

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


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDAR LINK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!url) {

    return m.reply(
`*⌬┤ ✙ ├⌬ ENLACE REQUERIDO.*

> Enviá o respondé a un mensaje con un enlace válido de Google Drive.

> Ejemplo:
> *${usedPrefix}${command} https://drive.google.com/...*`
    )
  }


  if (!/drive\.google\.com/i.test(url)) {

    return m.reply(
`*⌬┤ ❌ ├⌬ ENLACE INVÁLIDO.*

> Asegurate de que sea un enlace de Google Drive.`
    )
  }


  const chatId = m.chat


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REACCIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await conn.sendMessage(
    chatId,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  ).catch(() => {})


  await m.reply(
`*⌬┤ ⏳ ├⌬ OBTENIENDO ARCHIVO.*

> Conectando con Google Drive...`
  )


  try {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // API GOOGLE DRIVE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const apiUrl =
      `https://luxinfinity.vercel.app/api/gdrive?url=${encodeURIComponent(url)}`

    const apiRes =
      await fetch(apiUrl)

    if (!apiRes.ok) {

      throw new Error(
        `API respondió HTTP ${apiRes.status}`
      )
    }


    const apiJson =
      await apiRes.json()


    if (
      !apiJson?.status ||
      !apiJson?.data?.download
    ) {

      return m.reply(
`*⌬┤ ❌ ├⌬ ERROR.*

> No se pudo obtener el archivo.

> Comprueba que el enlace de Google Drive sea público.`
      )
    }


    const {
      name,
      download
    } = apiJson.data


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // HEAD DEL ARCHIVO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const headRes =
      await fetch(
        download,
        {
          method: 'HEAD',
          redirect: 'follow'
        }
      )


    const contentType =
      headRes.headers
        .get('content-type')
        ?.split(';')[0]
        .trim() ||
      'application/octet-stream'


    const contentLength =
      parseInt(
        headRes.headers.get(
          'content-length'
        ) || '0'
      )


    const sizeMB =
      contentLength /
      (1024 * 1024)


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LÍMITE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (
      contentLength &&
      sizeMB > MAX_MB
    ) {

      return m.reply(
`*⌬┤ ⚠️ ├⌬ ARCHIVO MUY GRANDE.*

> Tamaño: *${sizeMB.toFixed(1)} MB*
> Límite: *${MAX_MB} MB*`
      )
    }


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TIPO DE ARCHIVO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const fileInfo =
      GDRIVE_MIMES[contentType] || {
        ext: 'bin',
        tipo: 'document'
      }


    const fileName =
      name ||
      `archivo.${fileInfo.ext}`


    await m.reply(
`*⌬┤ ⬇️ ├⌬ DESCARGANDO.*

> 📄 *${fileName}*
> 📁 ${formatSize(contentLength)}`
    )


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DESCARGAR ARCHIVO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const fileRes =
      await fetch(
        download,
        {
          redirect: 'follow'
        }
      )


    if (!fileRes.ok) {

      throw new Error(
        `No se pudo descargar el archivo. HTTP ${fileRes.status}`
      )
    }


    const buffer =
      Buffer.from(
        await fileRes.arrayBuffer()
      )


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // VALIDAR TAMAÑO REAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const realSizeMB =
      buffer.length /
      (1024 * 1024)


    if (
      realSizeMB > MAX_MB
    ) {

      return m.reply(
`*⌬┤ ⚠️ ├⌬ ARCHIVO MUY GRANDE.*

> Tamaño real: *${realSizeMB.toFixed(1)} MB*
> Límite: *${MAX_MB} MB*`
      )
    }


    const caption =
`*⌬┤ ✅ ├⌬ ARCHIVO DESCARGADO.*

> 📄 *${fileName}*
> 📁 ${formatSize(buffer.length)}
> 📦 *${contentType}*`


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ENVIAR ARCHIVO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (
      fileInfo.tipo === 'audio'
    ) {

      await conn.sendMessage(
        chatId,
        {
          audio: buffer,
          mimetype: contentType,
          fileName,
          ptt: false
        },
        {
          quoted: m
        }
      )

    } else if (
      fileInfo.tipo === 'video'
    ) {

      await conn.sendMessage(
        chatId,
        {
          video: buffer,
          mimetype: contentType,
          fileName,
          caption
        },
        {
          quoted: m
        }
      )

    } else if (
      fileInfo.tipo === 'image'
    ) {

      await conn.sendMessage(
        chatId,
        {
          image: buffer,
          caption
        },
        {
          quoted: m
        }
      )

    } else {

      await conn.sendMessage(
        chatId,
        {
          document: buffer,
          mimetype: contentType,
          fileName,
          caption
        },
        {
          quoted: m
        }
      )
    }


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // REACCIÓN FINAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

    console.error(
      '[GDRIVE ERROR]',
      error?.message ||
      error
    )


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
`*⌬┤ ❌ ├⌬ ERROR.*

> No se pudo completar la descarga.

⚠️ ${error?.message || 'Error desconocido'}`
    )
  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'gdrive <link>',
  'googledrive <link>',
  'gdl <link>'
]

handler.command = [
  'gdrive',
  'googledrive',
  'gdl'
]

handler.tags = [
  'descargas'
]

handler.register = true

export default handler