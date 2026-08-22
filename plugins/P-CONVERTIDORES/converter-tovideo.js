import { tmpdir } from 'os'
import { join } from 'path'
import { writeFileSync, readFileSync } from 'fs'
import { rm } from 'fs/promises'
import { execSync } from 'child_process'

const tmp = ext =>
  join(tmpdir(), `conv_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`)

const clean = async (...ps) => {
  for (const p of ps) {
    if (p) {
      await rm(p, { force: true }).catch(() => {})
    }
  }
}

const VELOCIDADES = [0.25, 0.5, 1.5, 2, 3]


// ═════════════════════════════════════
// ✦ OBTENER MEDIA
// ═════════════════════════════════════

function obtenerMedia(m) {

  const q = m.quoted || m

  const mtype = q.mtype
  const mime = (q.msg || q).mimetype || ''

  return {
    q,
    mtype,
    mime,

    esAudio:
      mtype === 'audioMessage' ||
      /audio/i.test(mime),

    esVideo:
      mtype === 'videoMessage' ||
      /video/i.test(mime),

    esSticker:
      mtype === 'stickerMessage' ||
      /webp/i.test(mime),

    esGif:
      /gif/i.test(mime)
  }
}


// ═════════════════════════════════════
// ✦ AUDIO → VIDEO
// ═════════════════════════════════════

async function audioToVideo(m, conn, q) {

  await m.reply(
`༺ ✦ 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝙴𝙽𝙳𝙾 ✦ ༻

> ✦ 𝙲𝚘𝚗𝚟𝚒𝚛𝚝𝚒𝚎𝚗𝚍𝚘 𝚊𝚞𝚍𝚒𝚘 𝚊 𝚟𝚒𝚍𝚎𝚘...
> ✦ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
  )

  let input
  let output

  try {

    const buffer = await q.download()

    if (!buffer || !buffer.length) {
      throw new Error('Sin buffer')
    }

    input = tmp('mp3')
    output = tmp('mp4')

    writeFileSync(input, buffer)

    execSync(
      `ffmpeg -y ` +
      `-f lavfi -i color=c=black:s=1280x720:r=30 ` +
      `-i "${input}" ` +
      `-shortest ` +
      `-c:v libx264 ` +
      `-preset veryfast ` +
      `-pix_fmt yuv420p ` +
      `-c:a aac ` +
      `"${output}"`,
      {
        stdio: 'pipe',
        timeout: 120000
      }
    )

    await conn.sendMessage(
      m.chat,
      {
        video: readFileSync(output),
        mimetype: 'video/mp4'
      },
      {
        quoted: m
      }
    )

  } finally {

    await clean(input, output)

  }
}


// ═════════════════════════════════════
// ✦ STICKER/GIF → VIDEO
// ═════════════════════════════════════

async function stickerToVideo(m, conn, q) {

  await m.reply(
`༺ ✦ 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝙴𝙽𝙳𝙾 ✦ ༻

> ✦ 𝙲𝚘𝚗𝚟𝚒𝚛𝚝𝚒𝚎𝚗𝚍𝚘 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚊 𝚟𝚒𝚍𝚎𝚘...
> ✦ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
  )

  let input
  let output

  try {

    const buffer = await q.download()

    if (!buffer || !buffer.length) {
      throw new Error('Sin buffer')
    }

    input = tmp('webp')
    output = tmp('mp4')

    writeFileSync(input, buffer)

    execSync(
      `ffmpeg -y ` +
      `-i "${input}" ` +
      `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p" ` +
      `-c:v libx264 ` +
      `-preset veryfast ` +
      `-pix_fmt yuv420p ` +
      `-movflags +faststart ` +
      `"${output}"`,
      {
        stdio: 'pipe',
        timeout: 120000
      }
    )

    await conn.sendMessage(
      m.chat,
      {
        video: readFileSync(output),
        mimetype: 'video/mp4'
      },
      {
        quoted: m
      }
    )

  } finally {

    await clean(input, output)

  }
}


// ═════════════════════════════════════
// ✦ VIDEO → MP4
// ═════════════════════════════════════

async function convertVideo(m, conn, q) {

  await m.reply(
`༺ ✦ 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝙴𝙽𝙳𝙾 ✦ ༻

> ✦ 𝙲𝚘𝚗𝚟𝚒𝚛𝚝𝚒𝚎𝚗𝚍𝚘 𝚊 𝙼𝙿4...
> ✦ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
  )

  let input
  let output

  try {

    const buffer = await q.download()

    if (!buffer || !buffer.length) {
      throw new Error('Sin buffer')
    }

    input = tmp('input')
    output = tmp('mp4')

    writeFileSync(input, buffer)

    execSync(
      `ffmpeg -y -i "${input}" ` +
      `-c:v libx264 ` +
      `-pix_fmt yuv420p ` +
      `-movflags +faststart ` +
      `"${output}"`,
      {
        stdio: 'pipe',
        timeout: 120000
      }
    )

    await conn.sendMessage(
      m.chat,
      {
        video: readFileSync(output),
        mimetype: 'video/mp4'
      },
      {
        quoted: m
      }
    )

  } finally {

    await clean(input, output)

  }
}


// ═════════════════════════════════════
// ✦ VIDEO → REVERSE
// ═════════════════════════════════════

async function reverseVideo(m, conn, q) {

  await m.reply(
`༺ ✦ 𝚁𝙴𝚅𝙴𝚁𝚂𝙴 ✦ ༻

> ✦ 𝚁𝚎𝚟𝚒𝚛𝚝𝚒𝚎𝚗𝚍𝚘 𝚎𝚕 𝚟𝚒𝚍𝚎𝚘...`
  )

  let input
  let output

  try {

    const buffer = await q.download()

    if (!buffer || !buffer.length) {
      throw new Error('Sin buffer')
    }

    input = tmp('mp4')
    output = tmp('mp4')

    writeFileSync(input, buffer)

    execSync(
      `ffmpeg -y -i "${input}" ` +
      `-vf reverse ` +
      `-af areverse ` +
      `-c:v libx264 ` +
      `-pix_fmt yuv420p ` +
      `"${output}"`,
      {
        stdio: 'pipe',
        timeout: 120000
      }
    )

    await conn.sendMessage(
      m.chat,
      {
        video: readFileSync(output),
        mimetype: 'video/mp4'
      },
      {
        quoted: m
      }
    )

  } finally {

    await clean(input, output)

  }
}


// ═════════════════════════════════════
// ✦ CAMBIAR VELOCIDAD
// ═════════════════════════════════════

async function speedVideo(m, conn, q, text) {

  const speed = parseFloat(text)

  if (!VELOCIDADES.includes(speed)) {

    return m.reply(
`༺ ✦ 𝚅𝙴𝙻𝙾𝙲𝙸𝙳𝙰𝙳 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙰 ✦ ༻

> ✦ Opciones disponibles:

> 0.25
> 0.5
> 1.5
> 2
> 3

> Ejemplo:
> *!speedvid 2*`
    )

  }

  await m.reply(
`༺ ✦ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 ✦ ༻

> ✦ 𝙲𝚊𝚖𝚋𝚒𝚊𝚗𝚍𝚘 𝚟𝚎𝚕𝚘𝚌𝚒𝚍𝚊𝚍...
> ✦ 𝚅𝚎𝚕𝚘𝚌𝚒𝚍𝚊𝚍: *${speed}x*`
  )

  let input
  let output

  try {

    const buffer = await q.download()

    if (!buffer || !buffer.length) {
      throw new Error('Sin buffer')
    }

    input = tmp('mp4')
    output = tmp('mp4')

    writeFileSync(input, buffer)

    const pts = (1 / speed).toFixed(4)

    let atempo

    if (speed === 0.25) {
      atempo = '0.5,atempo=0.5'
    } else if (speed === 0.5) {
      atempo = 'atempo=0.5'
    } else if (speed === 1.5) {
      atempo = 'atempo=1.5'
    } else if (speed === 2) {
      atempo = 'atempo=2'
    } else if (speed === 3) {
      atempo = 'atempo=2,atempo=1.5'
    }

    execSync(
      `ffmpeg -y -i "${input}" ` +
      `-filter:v "setpts=${pts}*PTS" ` +
      `-filter:a "${atempo}" ` +
      `-c:v libx264 ` +
      `-pix_fmt yuv420p ` +
      `"${output}"`,
      {
        stdio: 'pipe',
        timeout: 120000
      }
    )

    await conn.sendMessage(
      m.chat,
      {
        video: readFileSync(output),
        mimetype: 'video/mp4'
      },
      {
        quoted: m
      }
    )

  } finally {

    await clean(input, output)

  }
}


// ═════════════════════════════════════
// ✦ HANDLER PRINCIPAL
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    command,
    text
  }
) => {

  try {

    const {
      q,
      esAudio,
      esVideo,
      esSticker,
      esGif
    } = obtenerMedia(m)


    // ═══════════════════════════════
    // ✦ TOVIDEO / TOMP4
    // ═══════════════════════════════

    if (
      command === 'tovideo' ||
      command === 'tomp4'
    ) {

      if (esAudio) {
        return await audioToVideo(
          m,
          conn,
          q
        )
      }

      if (esSticker || esGif) {
        return await stickerToVideo(
          m,
          conn,
          q
        )
      }

      if (esVideo) {
        return await convertVideo(
          m,
          conn,
          q
        )
      }

      return m.reply(
`༺ ✦ 𝚂𝙸𝙽 𝙼𝙴𝙳𝙸𝙰 ✦ ༻

> ✦ Respondé a:
> • Un audio
> • Un sticker animado
> • Un GIF
> • Un video`
      )

    }


    // ═══════════════════════════════
    // ✦ REVERSEVID
    // ═══════════════════════════════

    if (command === 'reversevid') {

      if (!esVideo) {

        return m.reply(
`༺ ✦ 𝚂𝙸𝙽 𝚅𝙸𝙳𝙴𝙾 ✦ ༻

> ✦ Respondé a un video para utilizar *reversevid*.`
        )

      }

      return await reverseVideo(
        m,
        conn,
        q
      )

    }


    // ═══════════════════════════════
    // ✦ SPEEDVID
    // ═══════════════════════════════

    if (command === 'speedvid') {

      if (!esVideo) {

        return m.reply(
`༺ ✦ 𝚂𝙸𝙽 𝚅𝙸𝙳𝙴𝙾 ✦ ༻

> ✦ Respondé a un video para cambiar su velocidad.`
        )

      }

      return await speedVideo(
        m,
        conn,
        q,
        text
      )

    }

  } catch (error) {

    console.error(
      '[CONVERTIDOR VIDEO]',
      error?.message || error
    )

    return m.reply(
`༺ ✦ 𝙴𝚁𝚁𝙾𝚁 ✦ ༻

> ✦ No se pudo completar la conversión.
> ✦ Intentá nuevamente con otro archivo.`
    )

  }

}


// ═════════════════════════════════════
// ✦ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'tovideo',
  'tomp4',
  'reversevid',
  'speedvid <velocidad>'
]

handler.command = [
  'tovideo',
  'tomp4',
  'reversevid',
  'speedvid'
]

handler.tags = [
  'convertidores'
]

export default handler