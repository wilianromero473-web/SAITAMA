import fetch from 'node-fetch'
import path from 'path'
import os from 'os'
import fs from 'fs/promises'
import { spawn } from 'child_process'

async function hdEnhance(inputBuf, inputMime) {

  const API =
    'https://us-central1-vector-ink.cloudfunctions.net/upscaleImage'

  const tmpDir =
    path.join(
      os.tmpdir(),
      'vectorink'
    )

  const ext =
    /png/i.test(inputMime)
      ? 'png'
      : /webp/i.test(inputMime)
        ? 'webp'
        : 'jpg'

  const tmpPath =
    path.join(
      tmpDir,
      `img_${Date.now()}.${ext}`
    )

  const out = {
    ok: false
  }

  try {

    await fs.mkdir(
      tmpDir,
      {
        recursive: true
      }
    )

    await fs.writeFile(
      tmpPath,
      inputBuf
    )

    const response =
      await fetch(
        API,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            origin: 'https://vectorink.io',
            referer: 'https://vectorink.io/',
            'user-agent': 'Mozilla/5.0'
          },
          body: JSON.stringify({
            data: {
              image:
                inputBuf.toString('base64')
            }
          })
        }
      )

    if (!response.ok) {

      out.error =
        `HTTP ${response.status}`

      return out
    }

    const text =
      await response.text()

    const json =
      JSON.parse(text || '{}')

    const inner =
      JSON.parse(
        json?.result || '{}'
      )

    const webpB64 =
      inner?.image?.b64_json

    if (!webpB64) {

      out.error =
        'No se recibió la imagen procesada'

      return out
    }

    const webpBuf =
      Buffer.from(
        webpB64,
        'base64'
      )

    const inPath =
      path.join(
        tmpDir,
        `in_${Date.now()}.webp`
      )

    const outPath =
      path.join(
        tmpDir,
        `out_${Date.now()}.png`
      )

    await fs.writeFile(
      inPath,
      webpBuf
    )

    await new Promise(
      (resolve, reject) => {

        const process =
          spawn(
            'ffmpeg',
            [
              '-y',
              '-i',
              inPath,
              '-frames:v',
              '1',
              outPath
            ],
            {
              stdio: 'pipe'
            }
          )

        process.on(
          'close',
          code => {

            if (code === 0) {
              resolve()
            } else {
              reject(
                new Error(
                  'ffmpeg failed'
                )
              )
            }
          }
        )

        process.on(
          'error',
          reject
        )
      }
    )

    out.ok = true

    out.buffer =
      await fs.readFile(
        outPath
      )

    try {
      await fs.unlink(inPath)
      await fs.unlink(outPath)
    } catch {}

    return out

  } catch (error) {

    out.error =
      error?.message ||
      'Error desconocido'

    return out

  } finally {

    try {
      await fs.unlink(
        tmpPath
      )
    } catch {}
  }
}

const handler = async (
  m,
  {
    conn,
    usedPrefix,
    command
  }
) => {

  const q =
    m.quoted
      ? m.quoted
      : m

  const mime =
    (q.msg || q).mimetype || ''

  if (!mime.startsWith('image/')) {

    return m.reply(
`༺ ✰ SIN IMAGEN ✰ ༻

> ✰ Responde a una imagen.
> ✰ También puedes enviar la imagen junto con:
> ✰ ${usedPrefix + command}`
    )
  }

  await m.react('🔧')

  await m.reply(
`༺ ✰ MEJORANDO IMAGEN ✰ ༻

> ✰ Procesando la imagen...
> ✰ Mejorando la calidad.
> ✰ Esto puede tardar unos segundos.`
  )

  try {

    const buffer =
      await q.download()

    if (!buffer) {

      return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo descargar la imagen.`
      )
    }

    const result =
      await hdEnhance(
        buffer,
        mime
      )

    if (!result.ok) {

      return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo mejorar la imagen.
> ✰ ${result.error || 'Error interno'}`
      )
    }

    await conn.sendMessage(
      m.chat,
      {
        image: result.buffer,
        caption:
`༺ ✰ IMAGEN MEJORADA ✰ ༻

> ✰ La calidad de la imagen fue mejorada correctamente.
> ✰ SaitamaBot`
      },
      {
        quoted: m
      }
    )

    await m.react('✅')

  } catch (error) {

    await m.react('❌')

    return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo completar el proceso.
> ✰ Inténtalo nuevamente.`
    )
  }
}

handler.help = [
  'hd <responder a imagen>',
  'enhance <responder a imagen>',
  'remini <responder a imagen>'
]

handler.tags = [
  'tools'
]

handler.command = [
  'hd',
  'enhance',
  'remini'
]

export default handler