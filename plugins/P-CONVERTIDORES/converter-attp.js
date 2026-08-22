import {
  writeFile,
  readFile,
  rm
} from 'fs/promises'

import path from 'path'
import { tmpdir } from 'os'
import { v4 as uuidv4 } from 'uuid'
import { spawn } from 'child_process'

import { attp } from '@axel-dev09/zen-dl'


// ═════════════════════════════════════
// ✰ SAITAMABOT • ATTP
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ CONVERTIR GIF → WEBP
// ═════════════════════════════════════

async function convertirSticker(gifBuffer) {

  const inputPath =
    path.join(
      tmpdir(),
      `${uuidv4()}.gif`
    )

  const outputPath =
    path.join(
      tmpdir(),
      `${uuidv4()}.webp`
    )


  try {

    // ═══════════════════════════════
    // ✰ GUARDAR GIF
    // ═══════════════════════════════

    await writeFile(
      inputPath,
      gifBuffer
    )


    // ═══════════════════════════════
    // ✰ FFMPEG
    // ═══════════════════════════════

    const stickerBuffer =
      await new Promise(
        (resolve, reject) => {

          const ff =
            spawn(
              'ffmpeg',
              [
                '-i',
                inputPath,

                '-vf',
                'scale=512:512:force_original_aspect_ratio=decrease,fps=15,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',

                '-vcodec',
                'libwebp',

                '-loop',
                '0',

                '-ss',
                '00:00:00.0',

                '-t',
                '00:00:10.0',

                '-preset',
                'default',

                '-an',

                '-vsync',
                '0',

                '-s',
                '512:512',

                outputPath
              ]
            )


          ff.on(
            'error',
            async error => {

              await rm(
                inputPath,
                {
                  force: true
                }
              ).catch(() => {})

              await rm(
                outputPath,
                {
                  force: true
                }
              ).catch(() => {})

              reject(error)
            }
          )


          ff.on(
            'close',
            async code => {

              await rm(
                inputPath,
                {
                  force: true
                }
              ).catch(() => {})


              if (code !== 0) {

                await rm(
                  outputPath,
                  {
                    force: true
                  }
                ).catch(() => {})

                return reject(
                  new Error(
                    'FFmpeg no pudo convertir el GIF.'
                  )
                )

              }


              try {

                const buffer =
                  await readFile(
                    outputPath
                  )


                await rm(
                  outputPath,
                  {
                    force: true
                  }
                ).catch(() => {})


                resolve(buffer)

              } catch (error) {

                await rm(
                  outputPath,
                  {
                    force: true
                  }
                ).catch(() => {})

                reject(error)

              }

            }
          )

        }
      )


    return stickerBuffer

  } catch (error) {

    await rm(
      inputPath,
      {
        force: true
      }
    ).catch(() => {})

    await rm(
      outputPath,
      {
        force: true
      }
    ).catch(() => {})

    throw error
  }
}


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    text,
    command
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ VERIFICAR TEXTO
    // ═══════════════════════════════

    const texto =
      String(
        text || ''
      ).trim()


    if (!texto) {

      return m.reply(
`༺ ✰ 𝙰𝚃𝚃𝙿 ✰ ༻

> ✰ 𝙴𝚜𝚌𝚛𝚒𝚋𝚎 𝚞𝚗 𝚝𝚎𝚡𝚝𝚘 𝚙𝚊𝚛𝚊 𝚌𝚛𝚎𝚊𝚛 𝚞𝚗 𝚜𝚝𝚒𝚌𝚔𝚎𝚛.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ *!${command} Hola*
> ✰ *!${command} SaitamaBot*`
      )

    }


    // ═══════════════════════════════
    // ✰ PROCESANDO
    // ═══════════════════════════════

    await m.reply(
`༺ ✰ 𝙰𝚃𝚃𝙿 ✰ ༻

> ✰ 𝙲𝚛𝚎𝚊𝚗𝚍𝚘 𝚜𝚝𝚒𝚌𝚔𝚎𝚛...
> ✰ 𝚃𝚎𝚡𝚝𝚘: ${texto}

> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘...`
    )


    // ═══════════════════════════════
    // ✰ GENERAR GIF
    // ═══════════════════════════════

    const gifBuffer =
      await attp(
        texto
      )


    if (
      !gifBuffer ||
      !Buffer.isBuffer(gifBuffer) ||
      !gifBuffer.length
    ) {

      throw new Error(
        'No se recibió el GIF generado.'
      )

    }


    // ═══════════════════════════════
    // ✰ CONVERTIR A WEBP
    // ═══════════════════════════════

    const stickerBuffer =
      await convertirSticker(
        gifBuffer
      )


    if (
      !stickerBuffer ||
      !stickerBuffer.length
    ) {

      throw new Error(
        'No se pudo generar el sticker.'
      )

    }


    // ═══════════════════════════════
    // ✰ ENVIAR STICKER
    // ═══════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        sticker:
          stickerBuffer
      },
      {
        quoted: m
      }
    )


  } catch (error) {

    console.error(
      '[ATTP]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙰𝚃𝚃𝙿 • 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚐𝚎𝚗𝚎𝚛𝚊𝚛 𝚎𝚕 𝚜𝚝𝚒𝚌𝚔𝚎𝚛.

> ✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
> ${String(
  error?.message ||
  'Error desconocido.'
).slice(0, 250)}`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'attp <texto>',
  'atextpng <texto>',
  'textgif <texto>'
]

handler.tags = [
  'convertidores'
]

handler.command = [
  'attp',
  'atextpng',
  'textgif'
]

export default handler