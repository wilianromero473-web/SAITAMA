import fs from 'fs'
import { rm } from 'fs/promises'
import path from 'path'
import { tmpdir } from 'os'
import { execSync } from 'child_process'
import fetch from 'node-fetch'
import axios from 'axios'

import { addExif } from '../../lib/sticker.js'
import config from '../../config.js'


// ═════════════════════════════════════
// ✰ SAITAMABOT • EMOJIS & BRAT
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN TEMPORAL
// ═════════════════════════════════════

const TMP = tmpdir()


function tmpFile(ext) {

  return path.join(
    TMP,
    `saitama_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`
  )

}


async function clean(...paths) {

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
// ✰ EMOJI → UNICODE
// ═════════════════════════════════════

const toUni = emoji => {

  return [...emoji]
    .map(char =>
      char.codePointAt(0)
        .toString(16)
    )
    .join('-')

}


// ═════════════════════════════════════
// ✰ EMOJI MIX
// ═════════════════════════════════════

async function runEmojimix(
  m,
  conn,
  text
) {

  if (!text?.includes('+')) {

    return m.reply(
`༺ ✰ 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻

> ✰ 𝚄𝚜𝚊 𝚍𝚘𝚜 𝚎𝚖𝚘𝚓𝚒𝚜 𝚜𝚎𝚙𝚊𝚛𝚊𝚍𝚘𝚜 𝚌𝚘𝚗 *+*.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ *!emojimix 😎+😅*`
    )

  }


  const [e1, e2] =
    text
      .split('+')
      .map(s => s.trim())


  if (!e1 || !e2) {

    return m.reply(
`༺ ✰ 𝙳𝙾𝚂 𝙴𝙼𝙾𝙹𝙸𝚂 ✰ ༻

> ✰ 𝚂𝚎 𝚗𝚎𝚌𝚎𝚜𝚒𝚝𝚊𝚗 𝚍𝚘𝚜 𝚎𝚖𝚘𝚓𝚒𝚜.
> ✰ 𝚂𝚎𝚙á𝚛𝚊𝚕𝚘𝚜 𝚌𝚘𝚗 *+*.`
    )

  }


  await m.reply(
`༺ ✰ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙶𝚎𝚗𝚎𝚛𝚊𝚗𝚍𝚘 𝚕𝚊 𝚌𝚘𝚖𝚋𝚒𝚗𝚊𝚌𝚒ó𝚗...
> ✰ 𝙴𝚜𝚙𝚎𝚛á 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
  )


  const url =
    `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/` +
    `u${toUni(e1)}/` +
    `u${toUni(e1)}_u${toUni(e2)}.png`


  const res =
    await fetch(url)


  if (!res.ok) {

    return m.reply(
`༺ ✰ 𝙽𝙾 𝙴𝚇𝙸𝚂𝚃𝙴 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛ó 𝚎𝚜𝚊 𝚌𝚘𝚖𝚋𝚒𝚗𝚊𝚌𝚒ó𝚗 𝚍𝚎 𝚎𝚖𝚘𝚓𝚒𝚜.`
    )

  }


  const buffer =
    await res.buffer()


  const png =
    tmpFile('png')


  const webpOut =
    tmpFile('webp')


  fs.writeFileSync(
    png,
    buffer
  )


  try {

    execSync(
      `ffmpeg -y -i "${png}" ` +
      `-vf "scale=512:512" ` +
      `-vcodec libwebp ` +
      `-lossless 1 ` +
      `"${webpOut}"`,
      {
        stdio: 'pipe',
        timeout: 30000
      }
    )


    const stickerBuf =
      await addExif(
        fs.readFileSync(webpOut),
        config.packname,
        config.author
      )


    await conn.sendMessage(
      m.chat,
      {
        sticker: stickerBuf
      },
      {
        quoted: m
      }
    )

  } finally {

    await clean(
      png,
      webpOut
    )

  }

}


// ═════════════════════════════════════
// ✰ EMOJI MIX 2
// ═════════════════════════════════════

async function runEmojimix2(
  m,
  conn,
  text
) {

  if (!text?.includes('+')) {

    return m.reply(
`༺ ✰ 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻

> ✰ *!emojimix2 😎+😅*`
    )

  }


  const [e1, e2] =
    text
      .split('+')
      .map(s => s.trim())


  if (!e1 || !e2) {

    return m.reply(
`༺ ✰ 𝙳𝙾𝚂 𝙴𝙼𝙾𝙹𝙸𝚂 ✰ ༻

> ✰ 𝚂𝚎𝚙á𝚛𝚊𝚕𝚘𝚜 𝚌𝚘𝚗 *+*.`
    )

  }


  await m.reply(
`༺ ✰ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙱𝚞𝚜𝚌𝚊𝚗𝚍𝚘 𝚕𝚊 𝚌𝚘𝚖𝚋𝚒𝚗𝚊𝚌𝚒ó𝚗...`
  )


  const url =
    `https://tenor.googleapis.com/v2/featured?` +
    `key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ` +
    `&contentfilter=high` +
    `&media_filter=png_transparent` +
    `&component=proactive` +
    `&collection=emoji_kitchen_v5` +
    `&q=${encodeURIComponent(e1)}_${encodeURIComponent(e2)}`


  const res =
    await fetch(url)


  const json =
    await res.json()


  if (!json.results?.length) {

    return m.reply(
`༺ ✰ 𝙽𝙾 𝙴𝚇𝙸𝚂𝚃𝙴 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛ó 𝚎𝚜𝚊 𝚌𝚘𝚖𝚋𝚒𝚗𝚊𝚌𝚒ó𝚗.`
    )

  }


  for (
    const result of json.results
  ) {

    await conn.sendMessage(
      m.chat,
      {
        image: {
          url: result.url
        }
      },
      {
        quoted: m
      }
    )

  }

}


// ═════════════════════════════════════
// ✰ BRAT
// ═════════════════════════════════════

async function runBrat(
  m,
  conn,
  text
) {

  if (!text) {

    return m.reply(
`༺ ✰ 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻

> ✰ *!brat <texto>*

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ *!brat SaitamaBot*`
    )

  }


  await m.reply(
`༺ ✰ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙶𝚎𝚗𝚎𝚛𝚊𝚗𝚍𝚘 𝚜𝚝𝚒𝚌𝚔𝚎𝚛...`
  )


  const png =
    tmpFile('png')


  const webpOut =
    tmpFile('webp')


  try {

    const res =
      await axios.get(
        `https://api.yupra.my.id/api/image/brat?text=${encodeURIComponent(text)}`,
        {
          responseType: 'arraybuffer'
        }
      )


    fs.writeFileSync(
      png,
      res.data
    )


    execSync(
      `ffmpeg -y -i "${png}" ` +
      `-vcodec libwebp ` +
      `-lossless 1 ` +
      `-qscale 100 ` +
      `-preset default ` +
      `-loop 0 ` +
      `-an ` +
      `-vsync 0 ` +
      `-s 512x512 ` +
      `"${webpOut}"`,
      {
        stdio: 'pipe',
        timeout: 30000
      }
    )


    const stickerBuf =
      await addExif(
        fs.readFileSync(webpOut),
        config.packname,
        config.author
      )


    await conn.sendMessage(
      m.chat,
      {
        sticker: stickerBuf
      },
      {
        quoted: m
      }
    )

  } finally {

    await clean(
      png,
      webpOut
    )

  }

}


// ═════════════════════════════════════
// ✰ NOTO EMOJI
// ═════════════════════════════════════

const NOTO_BASE =
  'https://fonts.gstatic.com/s/e/notoemoji/latest'


function emojiToCode(
  input
) {

  input =
    input.trim()


  if (
    /^[0-9a-f]{4,}(-[0-9a-f]{4,})*$/i
      .test(input)
  ) {

    return input.toLowerCase()

  }


  const points = []


  for (
    const char of input
  ) {

    const cp =
      char.codePointAt(0)


    if (
      cp > 0xFFFF ||
      cp >= 0x200D ||
      cp === 0xFE0F ||
      cp > 0x20
    ) {

      if (
        cp !== 0xFE0F
      ) {

        points.push(
          cp.toString(16)
        )

      }

    }

  }


  return points.join('-')

}


// ═════════════════════════════════════
// ✰ DESCARGAR GIF DEL EMOJI
// ═════════════════════════════════════

async function fetchEmojiGif(
  code
) {

  const tryFetch =
    async url => {

      const res =
        await fetch(
          url,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0'
            },
            signal:
              AbortSignal.timeout(15000)
          }
        )


      if (res.ok) {

        return res.buffer()

      }


      return null

    }


  const buf =
    await tryFetch(
      `${NOTO_BASE}/${code}/512.gif`
    )


  if (buf) {

    return buf

  }


  const baseCode =
    code.split('-')[0]


  if (
    baseCode !== code
  ) {

    const buf2 =
      await tryFetch(
        `${NOTO_BASE}/${baseCode}/512.gif`
      )


    if (buf2) {

      return buf2

    }

  }


  throw new Error(
    'noAnimado'
  )

}


// ═════════════════════════════════════
// ✰ GIF → WEBP
// ═════════════════════════════════════

async function gifToWebp(
  gifBuffer
) {

  const gifPath =
    tmpFile('gif')


  const webpPath =
    tmpFile('webp')


  try {

    fs.writeFileSync(
      gifPath,
      gifBuffer
    )


    execSync(
      `ffmpeg -y -i "${gifPath}" ` +
      `-vf "scale=512:512:flags=lanczos,` +
      `split[s0][s1];` +
      `[s0]palettegen=reserve_transparent=on:` +
      `transparency_color=ffffff[p];` +
      `[s1][p]paletteuse" ` +
      `-loop 0 "${webpPath}"`,
      {
        stdio: 'pipe',
        timeout: 30000
      }
    )


    if (
      !fs.existsSync(webpPath) ||
      fs.statSync(webpPath).size < 100
    ) {

      execSync(
        `ffmpeg -y -i "${gifPath}" ` +
        `-vcodec libwebp ` +
        `-vf "scale=512:512:flags=lanczos" ` +
        `-loop 0 ` +
        `-preset default ` +
        `-an ` +
        `-vsync 0 ` +
        `"${webpPath}"`,
        {
          stdio: 'pipe',
          timeout: 30000
        }
      )

    }


    return fs.readFileSync(
      webpPath
    )

  } finally {

    await clean(
      gifPath,
      webpPath
    )

  }

}


// ═════════════════════════════════════
// ✰ EMOJI STICKER
// ═════════════════════════════════════

async function runEmojiSticker(
  m,
  conn,
  text
) {

  if (!text?.trim()) {

    return m.reply(
`༺ ✰ 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻

> ✰ *!emojisticker 😎*`
    )

  }


  await m.reply(
`༺ ✰ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙶𝚎𝚗𝚎𝚛𝚊𝚗𝚍𝚘 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚊𝚗𝚒𝚖𝚊𝚍𝚘...`
  )


  const code =
    emojiToCode(
      text.trim()
    )


  if (!code) {

    return m.reply(
`༺ ✰ 𝙴𝙼𝙾𝙹𝙸 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾 ✰ ༻

> ✰ 𝙴𝚗𝚟í𝚊 𝚞𝚗 𝚎𝚖𝚘𝚓𝚒 𝚟á𝚕𝚒𝚍𝚘.`
    )

  }


  const gifBuf =
    await fetchEmojiGif(
      code
    )


  const webpBuf =
    await gifToWebp(
      gifBuf
    )


  const stickerBuf =
    await addExif(
      webpBuf,
      config.packname,
      config.author
    )


  await conn.sendMessage(
    m.chat,
    {
      sticker: stickerBuf
    },
    {
      quoted: m
    }
  )

}


// ═════════════════════════════════════
// ✰ RUNNERS
// ═════════════════════════════════════

const RUNNERS = {

  emojimix:
    runEmojimix,

  emojicombine:
    runEmojimix,

  emojimixar:
    runEmojimix,


  emojimix2:
    runEmojimix2,

  emojicombine2:
    runEmojimix2,

  emojimixar2:
    runEmojimix2,


  brat:
    runBrat,

  bratsticker:
    runBrat,

  bratfigurinha:
    runBrat,


  emojisticker:
    runEmojiSticker,

  emojianim:
    runEmojiSticker,

  stickeremoji:
    runEmojiSticker

}


// ═════════════════════════════════════
// ✰ HANDLER PRINCIPAL
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    command,
    text
  }
) => {

  const run =
    RUNNERS[command]


  if (!run) return


  try {

    await run(
      m,
      conn,
      text
    )

  } catch (error) {

    console.error(
      `[EMOJIS:${command}]`,
      error?.message ||
      error
    )


    if (
      error?.message ===
      'noAnimado'
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙰𝙽𝙸𝙼𝙰𝙲𝙸Ó𝙽 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛ó 𝚞𝚗𝚊 𝚊𝚗𝚒𝚖𝚊𝚌𝚒ó𝚗 𝚙𝚊𝚛𝚊 𝚎𝚜𝚎 𝚎𝚖𝚘𝚓𝚒.`
      )

    }


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛 𝚕𝚊 𝚘𝚙𝚎𝚛𝚊𝚌𝚒ó𝚗.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝á 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎 𝚖á𝚜 𝚝𝚊𝚛𝚍𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [

  'emojimix <emoji+emoji>',

  'emojimix2 <emoji+emoji>',

  'brat <texto>',

  'emojisticker <emoji>'

]


handler.command = [

  'emojimix',
  'emojicombine',
  'emojimixar',

  'emojimix2',
  'emojicombine2',
  'emojimixar2',

  'brat',
  'bratsticker',
  'bratfigurinha',

  'emojisticker',
  'emojianim',
  'stickeremoji'

]


handler.tags = [
  'convertidores'
]


export default handler