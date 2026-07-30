import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'

// ═════════════════════════════════════
// API YTMP4
// ═════════════════════════════════════

const API_URL = 'https://api.stellarwa.xyz'
const API_KEY = 'proyectsV2'

// ═════════════════════════════════════
// OBTENER VIDEO DESDE LA API
// ═════════════════════════════════════

async function fetchMp4(url) {

  const { data } = await axios.get(
    `${API_URL}/dl/ytmp4`,
    {
      params: {
        url,
        quality: 'auto',
        key: API_KEY
      },

      timeout: 120000,

      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',

        Accept: 'application/json'
      }
    }
  )

  if (
    !data?.status ||
    !data?.data?.dl
  ) {

    throw new Error(
      data?.message ||
      'La API no devolvió el enlace del video.'
    )
  }

  return {
    download: data.data.dl,

    title:
      data.data.title ||
      'YouTube Video',

    quality:
      data.data.quality ||
      'Auto'
  }
}

// ═════════════════════════════════════
// HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command
  }
) => {

  if (!text?.trim()) {

    return m.reply(
      `✧ Ingresa un enlace de YouTube.

Ejemplo:
${usedPrefix}${command} https://youtu.be/xxxxx`
    )
  }

  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  )

  const tmpDir = './tmp'

  await fs.promises.mkdir(
    tmpDir,
    {
      recursive: true
    }
  )

  const filePath = path.join(
    tmpDir,
    `ytmp4doc_${Date.now()}.mp4`
  )

  try {

    // ═══════════════════════════════
    // URL
    // ═══════════════════════════════

    const ytUrl =
      text.trim().startsWith('http')
        ? text.trim()
        : `https://www.youtube.com/watch?v=${text.trim()}`

    // ═══════════════════════════════
    // API
    // ═══════════════════════════════

    const media =
      await fetchMp4(ytUrl)

    // ═══════════════════════════════
    // DESCARGAR MP4
    // ═══════════════════════════════

    const res =
      await axios.get(
        media.download,
        {
          responseType: 'stream',

          timeout: 600000,

          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
          }
        }
      )

    await pipeline(
      res.data,
      fs.createWriteStream(filePath)
    )

    // ═══════════════════════════════
    // VALIDAR ARCHIVO
    // ═══════════════════════════════

    const stat =
      await fs.promises.stat(filePath)

    if (
      !stat.isFile() ||
      stat.size <= 0
    ) {

      throw new Error(
        'El archivo descargado está vacío.'
      )
    }

    // ═══════════════════════════════
    // LIMPIAR NOMBRE
    // ═══════════════════════════════

    const title =
      String(
        media.title ||
        'YouTube Video'
      )
      .replace(
        /[<>:"/\\|?*\x00-\x1F]/g,
        ''
      )
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100) ||
      'YouTube Video'

    // ═══════════════════════════════
    // 📄 ENVIAR COMO DOCUMENTO
    // ═══════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        document:
          fs.readFileSync(filePath),

        mimetype:
          'video/mp4',

        fileName:
          `${title}.mp4`,

        caption:
          `╭━━━〔 ✅ VIDEO DESCARGADO 〕━━━⬣
┃
┃ 🎬 *Título:*
┃ ${title}
┃
┃ 🎞️ *Calidad:* ${media.quality}
┃ 📄 *Formato:* Documento MP4
┃
╰━━━━━━━━━━━━━━━━━━⬣`
      },
      {
        quoted: m
      }
    )

    // ═══════════════════════════════
    // REACCIÓN
    // ═══════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    )

  } catch (e) {

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
      `✧ No se pudo descargar el video.

⚠️ ${
        e?.message ||
        'Error desconocido'
      }`
    )

  } finally {

    await rm(
      filePath,
      {
        force: true
      }
    ).catch(() => {})
  }
}

// ═════════════════════════════════════
// CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'ytmp4doc <url>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'ytmp4doc',
  'ytvdoc'
]

export default handler