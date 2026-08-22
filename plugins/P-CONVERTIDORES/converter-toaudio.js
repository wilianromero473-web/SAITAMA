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

  try {

    // ═══════════════════════════════
    // ✰ DETECTAR MEDIA
    // ═══════════════════════════════

    const q =
      m.quoted || m


    const mtype =
      m.quoted?.mtype ||
      m.mtype


    // ═══════════════════════════════
    // ✰ VIDEO/AUDIO → DOCUMENTO
    // ═══════════════════════════════

    if (
      command === 'todoc' ||
      command === 'todocumento'
    ) {

      if (
        mtype !== 'videoMessage' &&
        mtype !== 'audioMessage'
      ) {

        return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙰𝚁𝙲𝙷𝙸𝚅𝙾 ✰ ༻

> ✰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗 𝚟𝚒𝚍𝚎𝚘 𝚘 𝚊𝚞𝚍𝚒𝚘.

> ✰ 𝙴𝚕 𝚊𝚛𝚌𝚑𝚒𝚟𝚘 𝚜𝚎𝚛á 𝚎𝚗𝚟𝚒𝚊𝚍𝚘 𝚌𝚘𝚖𝚘 𝚍𝚘𝚌𝚞𝚖𝚎𝚗𝚝𝚘.`
        )

      }


      // ═════════════════════════════
      // ✰ PROCESANDO
      // ═════════════════════════════

      await m.reply(
`༺ ✰ 𝙲𝙾𝙽𝚅𝙸𝚁𝚃𝙸𝙴𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙿𝚛𝚎𝚙𝚊𝚛𝚊𝚗𝚍𝚘 𝚎𝚕 𝚊𝚛𝚌𝚑𝚒𝚟𝚘 𝚌𝚘𝚖𝚘 𝚍𝚘𝚌𝚞𝚖𝚎𝚗𝚝𝚘...
> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
      )


      try {

        const buffer =
          await q.download()


        if (!buffer) {
          throw new Error(
            'No se pudo descargar el archivo.'
          )
        }


        const esVideo =
          mtype === 'videoMessage'


        await conn.sendMessage(
          m.chat,
          {

            document: buffer,

            mimetype:
              esVideo
                ? 'video/mp4'
                : 'audio/mpeg',

            fileName:
              esVideo
                ? 'SAITAMA_VIDEO.mp4'
                : 'SAITAMA_AUDIO.mp3'

          },
          {
            quoted: m
          }
        )


      } catch (error) {

        console.error(
          '[TODoc]',
          error?.message || error
        )


        return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚗𝚟𝚎𝚛𝚝𝚒𝚛 𝚎𝚕 𝚊𝚛𝚌𝚑𝚒𝚟𝚘.`
        )

      }


      return

    }


    // ═══════════════════════════════
    // ✰ VIDEO → AUDIO
    // ═══════════════════════════════

    if (
      mtype !== 'videoMessage'
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝚅𝙸𝙳𝙴𝙾 ✰ ༻

> ✰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗 𝚟𝚒𝚍𝚎𝚘 𝚙𝚊𝚛𝚊 𝚎𝚡𝚝𝚛𝚊𝚎𝚛 𝚜𝚞 𝚊𝚞𝚍𝚒𝚘.`
      )

    }


    // ═══════════════════════════════
    // ✰ PROCESANDO AUDIO
    // ═══════════════════════════════

    await m.reply(
`༺ ✰ 𝙴𝚇𝚃𝚁𝙰𝚈𝙴𝙽𝙳𝙾 𝙰𝚄𝙳𝙸𝙾 ✰ ༻

> ✰ 𝙲𝚘𝚗𝚟𝚒𝚛𝚝𝚒𝚎𝚗𝚍𝚘 𝚎𝚕 𝚟𝚒𝚍𝚎𝚘 𝚊 𝙼𝙿𝟹...
> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
    )


    let inputPath
    let outputPath


    try {

      // ═════════════════════════════
      // ✰ DESCARGAR VIDEO
      // ═════════════════════════════

      const buffer =
        await q.download()


      if (!buffer) {
        throw new Error(
          'No se pudo descargar el video.'
        )
      }


      // ═════════════════════════════
      // ✰ CREAR ARCHIVOS TEMPORALES
      // ═════════════════════════════

      inputPath =
        tmp('mp4')


      outputPath =
        tmp('mp3')


      writeFileSync(
        inputPath,
        buffer
      )


      // ═════════════════════════════
      // ✰ FFMPEG
      // ═════════════════════════════

      execSync(
        `ffmpeg -y -i "${inputPath}" -vn -acodec libmp3lame -q:a 2 "${outputPath}"`,
        {
          stdio: 'pipe',
          timeout: 60000
        }
      )


      // ═════════════════════════════
      // ✰ ENVIAR AUDIO
      // ═════════════════════════════

      const audio =
        readFileSync(
          outputPath
        )


      await conn.sendMessage(
        m.chat,
        {

          audio,

          mimetype:
            'audio/mpeg',

          ptt:
            false

        },
        {
          quoted: m
        }
      )


    } catch (error) {

      console.error(
        '[TOAUDIO]',
        error?.message || error
      )


      return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚎𝚡𝚝𝚛𝚊𝚎𝚛 𝚎𝚕 𝚊𝚞𝚍𝚒𝚘.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚎𝚗𝚟𝚒𝚊𝚗𝚍𝚘 𝚎𝚕 𝚟𝚒𝚍𝚎𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
      )

    } finally {

      // ═══════════════════════════
      // ✰ LIMPIAR TEMPORALES
      // ═══════════════════════════

      await clean(
        inputPath,
        outputPath
      )

    }

  } catch (error) {

    console.error(
      '[CONVERTIDOR]',
      error?.message || error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙾𝚌𝚞𝚛𝚛𝚒ó 𝚞𝚗 𝚎𝚛𝚛𝚘𝚛 𝚒𝚗𝚎𝚜𝚙𝚎𝚛𝚊𝚍𝚘.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎 𝚖á𝚜 𝚝𝚊𝚛𝚍𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'toaudio',
  'todoc'
]

handler.tags = [
  'convertidores'
]

handler.command = [
  'toaudio',
  'tomp3',
  'todoc',
  'todocumento'
]


export default handler