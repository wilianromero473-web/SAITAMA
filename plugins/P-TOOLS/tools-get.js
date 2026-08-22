import fetch from 'node-fetch'
import { format } from 'util'

const MAX_GET_SIZE = 100 * 1024 * 1024

const handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(
`༺ ✰ FALTA EL ENLACE ✰ ༻

> ✰ Uso: *${usedPrefix + command} <url>*
> ✰ Ejemplo: *${usedPrefix + command} https://ejemplo.com/archivo.mp4*`
    )
  }

  if (!/^https?:\/\//i.test(text.trim())) {
    return m.reply(
`༺ ✰ ENLACE INVÁLIDO ✰ ༻

> ✰ El enlace debe comenzar con:
> ✰ http://
> ✰ https://`
    )
  }

  const url = text.trim()

  let response

  try {

    response = await fetch(url)

  } catch (error) {

    return m.reply(
`༺ ✰ ERROR DE CONEXIÓN ✰ ༻

> ✰ No se pudo conectar con la URL.
> ✰ ${error?.message || 'Error desconocido'}`
    )
  }

  if (!response.ok) {
    return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ El servidor respondió con:
> ✰ ${response.status} ${response.statusText || ''}`
    )
  }

  const contentType =
    response.headers.get('content-type') || ''

  const contentLength =
    parseInt(
      response.headers.get('content-length') || '0'
    )

  const ext =
    url
      .split('.')
      .pop()
      .split('?')[0]
      .toLowerCase()

  if (contentLength > MAX_GET_SIZE) {

    return m.reply(
`༺ ✰ ARCHIVO MUY GRANDE ✰ ༻

> ✰ El archivo supera el límite permitido.
> ✰ Tamaño máximo: 100 MB.`
    )
  }

  let buffer

  try {

    const arrayBuffer =
      await response.arrayBuffer()

    buffer =
      Buffer.from(arrayBuffer)

  } catch (error) {

    return m.reply(
`༺ ✰ ERROR DE DESCARGA ✰ ༻

> ✰ No se pudo descargar el archivo.
> ✰ ${error?.message || 'Error desconocido'}`
    )
  }

  if (
    /image\/(jpeg|png|gif|webp)/i.test(contentType) ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  ) {

    await m.react('🖼️')

    return conn.sendMessage(
      m.chat,
      {
        image: buffer
      },
      {
        quoted: m
      }
    )
  }

  if (
    /video\/(mp4|webm|ogg)/i.test(contentType) ||
    ['mp4', 'webm', 'ogg'].includes(ext)
  ) {

    await m.react('🎬')

    return conn.sendMessage(
      m.chat,
      {
        video: buffer
      },
      {
        quoted: m
      }
    )
  }

  if (
    /audio\/(mpeg|ogg|mp3|wav)/i.test(contentType) ||
    ['mp3', 'wav'].includes(ext) ||
    contentType === 'application/octet-stream'
  ) {

    await m.react('🎵')

    const mime =
      contentType.startsWith('audio/')
        ? contentType
        : 'audio/mpeg'

    return conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: mime
      },
      {
        quoted: m
      }
    )
  }

  let content =
    buffer.toString()

  try {

    content =
      format(
        JSON.parse(content)
      )

  } catch {}

  await m.react('📄')

  return m.reply(
`༺ ✰ CONTENIDO OBTENIDO ✰ ༻

${content}`
  )
}

handler.help = [
  'get <url>'
]

handler.tags = [
  'tools'
]

handler.command = [
  'get'
]

export default handler