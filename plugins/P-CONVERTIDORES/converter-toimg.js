import { tmpdir } from 'os'
import { join } from 'path'
import { writeFileSync, readFileSync } from 'fs'
import { rm } from 'fs/promises'
import { execSync } from 'child_process'


// ═════════════════════════════════════
// ✰ SAITAMABOT • CONVERTIDORES
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ ARCHIVOS TEMPORALES
// ═════════════════════════════════════

const tmp = ext =>
  join(
    tmpdir(),
    `conv_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`
  )


const clean = async (...paths) => {

  for (const file of paths) {

    if (!file) continue

    await rm(
      file,
      {
        force: true
      }
    ).catch(() => {})

  }

}


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    command
  }
) => {

  const q =
    m.quoted || m


  const mtype =
    q.mtype


  const mime =
    (
      q.msg ||
      q
    ).mimetype || ''


  // ═════════════════════════════════
  // ✰ DETECTAR MEDIA
  // ═════════════════════════════════

  const esSticker =
    mtype === 'stickerMessage' ||
    /webp/i.test(mime)


  const esVideo =
    mtype === 'videoMessage' ||
    /video/i.test(mime)


  // ═════════════════════════════════
  // ✰ STICKER → IMAGEN
  // ═════════════════════════════════

  if (
    command === 'toimg'
  ) {

    if (!esSticker) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 ✰ ༻

> ✰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚙𝚊𝚛𝚊 𝚌𝚘𝚗𝚟𝚎𝚛𝚝𝚒𝚛𝚕𝚘 𝚊 𝚒𝚖𝚊𝚐𝚎𝚗.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚌𝚘𝚗:
> ✰ 𝚝𝚘𝚒𝚖𝚐`
      )

    }


    await m.react('⏳')


    let inputPath
    let outputPath


    try {

      // ═════════════════════════════
      // ✰ DESCARGAR STICKER
      // ═════════════════════════════

      const buffer =
        await q.download()


      if (
        !buffer ||
        !buffer.length
      ) {

        throw new Error(
          'Sin buffer'
        )

      }


      inputPath =
        tmp('webp')


      outputPath =
        tmp('png')


      writeFileSync(
        inputPath,
        buffer
      )


      // ═════════════════════════════
      // ✰ CONVERTIR A PNG
      // ═════════════════════════════

      execSync(
        `ffmpeg -y -i "${inputPath}" -vframes 1 -c:v png "${outputPath}"`,
        {
          stdio: 'pipe',
          timeout: 30000
        }
      )


      // ═════════════════════════════
      // ✰ ENVIAR IMAGEN
      // ═════════════════════════════

      await conn.sendMessage(
        m.chat,
        {
          image:
            readFileSync(
              outputPath
            )
        },
        {
          quoted: m
        }
      )


      await m.react('✅')


    } catch (error) {

      console.error(
        '[TOIMG]',
        error?.message || error
      )


      await m.react('❌')


      return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚗𝚟𝚎𝚛𝚝𝚒𝚛 𝚎𝚕 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚊 𝚒𝚖𝚊𝚐𝚎𝚗.`
      )

    } finally {

      await clean(
        inputPath,
        outputPath
      )

    }


    return

  }


  // ═════════════════════════════════
  // ✰ VIDEO/STICKER → GIF
  // ═════════════════════════════════

  if (
    command === 'togif'
  ) {

    if (
      !esVideo &&
      !esSticker
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙼𝙴𝙳𝙸𝙰 ✰ ༻

> ✰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗 𝚟𝚒𝚍𝚎𝚘 𝚘 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚊𝚗𝚒𝚖𝚊𝚍𝚘.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗 𝚟𝚒𝚍𝚎𝚘 𝚌𝚘𝚗:
> ✰ 𝚝𝚘𝚐𝚒𝚏`
      )

    }


    // ═════════════════════════════
    // ✰ LÍMITE DE VIDEO
    // ═════════════════════════════

    if (
      esVideo
    ) {

      const segundos =
        Number(
          q.msg?.seconds ||
          0
        )


      if (
        segundos >= 15
      ) {

        return m.reply(
`༺ ✰ 𝙰𝚁𝙲𝙷𝙸𝚅𝙾 𝙼𝚄𝚈 𝙻𝙰𝚁𝙶𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚟𝚒𝚍𝚎𝚘 𝚍𝚎𝚋𝚎 𝚍𝚞𝚛𝚊𝚛 𝚖𝚎𝚗𝚘𝚜 𝚍𝚎 𝟷𝟻 𝚜𝚎𝚐𝚞𝚗𝚍𝚘𝚜.

> ✰ 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗: ${segundos}𝚜`
        )

      }

    }


    await m.react('⏳')


    let inputPath
    let outputPath


    try {

      // ═════════════════════════════
      // ✰ DESCARGAR MEDIA
      // ═════════════════════════════

      const buffer =
        await q.download()


      if (
        !buffer ||
        !buffer.length
      ) {

        throw new Error(
          'Sin buffer'
        )

      }


      const extension =
        esSticker
          ? 'webp'
          : 'mp4'


      inputPath =
        tmp(extension)


      outputPath =
        tmp('gif')


      writeFileSync(
        inputPath,
        buffer
      )


      // ═════════════════════════════
      // ✰ CONVERTIR A GIF
      // ═════════════════════════════

      execSync(
        `ffmpeg -y -i "${inputPath}" -vf "fps=15,scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos" -loop 0 "${outputPath}"`,
        {
          stdio: 'pipe',
          timeout: 60000
        }
      )


      // ═════════════════════════════
      // ✰ ENVIAR GIF
      // ═════════════════════════════

      await conn.sendMessage(
        m.chat,
        {
          document:
            readFileSync(
              outputPath
            ),

          mimetype:
            'image/gif',

          fileName:
            'SaitamaBot.gif'
        },
        {
          quoted: m
        }
      )


      await m.react('✅')


    } catch (error) {

      console.error(
        '[TOGIF]',
        error?.message || error
      )


      await m.react('❌')


      return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚗𝚟𝚎𝚛𝚝𝚒𝚛 𝚕𝚊 𝚖𝚎𝚍𝚒𝚊 𝚊 𝙶𝙸𝙵.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚌𝚘𝚗 𝚘𝚝𝚛𝚘 𝚟𝚒𝚍𝚎𝚘 𝚘 𝚜𝚝𝚒𝚌𝚔𝚎𝚛.`
      )

    } finally {

      await clean(
        inputPath,
        outputPath
      )

    }

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'toimg',
  'togif'
]

handler.tags = [
  'convertidores'
]

handler.command = [
  'toimg',
  'togif'
]

export default handler