import {
  sendImageAsSticker,
  sendVideoAsSticker
} from '../../lib/sticker.js'

import config from '../../config.js'


// ═════════════════════════════════════
// ✰ SAITAMABOT • STICKER
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    usedPrefix,
    command
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ OBTENER MEDIA
    // ═══════════════════════════════

    const q =
      m.quoted || m


    const mime =
      (
        q.msg ||
        q
      ).mimetype || ''


    // ═══════════════════════════════
    // ✰ DETECTAR TIPO
    // ═══════════════════════════════

    const esImagen =
      q.mtype === 'imageMessage' ||
      /image/i.test(mime)


    const esVideo =
      q.mtype === 'videoMessage' ||
      /video/i.test(mime)


    // ═══════════════════════════════
    // ✰ VERIFICAR MEDIA
    // ═══════════════════════════════

    if (
      !esImagen &&
      !esVideo
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙼𝙴𝙳𝙸𝙰 ✰ ༻

> ✰ 𝙴𝚗𝚟í𝚊 𝚘 𝚛𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗𝚊 𝚒𝚖𝚊𝚐𝚎𝚗 𝚘 𝚟𝚒𝚍𝚎𝚘.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ ${usedPrefix}${command}

> ✰ 𝙿𝚊𝚛𝚊 𝚞𝚗 𝚟𝚒𝚍𝚎𝚘, 𝚍𝚎𝚋𝚎 𝚍𝚞𝚛𝚊𝚛 𝚖𝚎𝚗𝚘𝚜 𝚍𝚎 𝟷𝟷 𝚜𝚎𝚐𝚞𝚗𝚍𝚘𝚜.`
      )

    }


    // ═══════════════════════════════
    // ✰ VERIFICAR DURACIÓN
    // ═══════════════════════════════

    if (esVideo) {

      const segundos =
        Number(
          q.msg?.seconds ||
          0
        )


      if (
        segundos > 11
      ) {

        return m.reply(
`༺ ✰ 𝚅𝙸𝙳𝙴𝙾 𝙼𝚄𝚈 𝙻𝙰𝚁𝙶𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚟𝚒𝚍𝚎𝚘 𝚍𝚎𝚋𝚎 𝚍𝚞𝚛𝚊𝚛 𝚖𝚎𝚗𝚘𝚜 𝚍𝚎 𝟷𝟷 𝚜𝚎𝚐𝚞𝚗𝚍𝚘𝚜.

> ✰ 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗 𝚊𝚌𝚝𝚞𝚊𝚕: ${segundos}𝚜`
        )

      }

    }


    // ═══════════════════════════════
    // ✰ INFORMACIÓN DEL STICKER
    // ═══════════════════════════════

    const packname =
      config.packname ||
      '*SAITAMA-BOT*'


    const author =
      config.author ||
      '*SaiDev145*'


    // ═══════════════════════════════
    // ✰ PROCESANDO
    // ═══════════════════════════════

    await m.reply(
`༺ ✰ 𝙲𝚁𝙴𝙰𝙽𝙳𝙾 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 ✰ ༻

> ✰ 𝙼𝚎𝚍𝚒𝚊: ${esImagen ? '𝙸𝚖𝚊𝚐𝚎𝚗' : '𝚅í𝚍𝚎𝚘'}
> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘...`
    )


    // ═══════════════════════════════
    // ✰ DESCARGAR MEDIA
    // ═══════════════════════════════

    const buffer =
      await q.download()


    if (!buffer) {

      return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛 𝚕𝚊 𝚖𝚎𝚍𝚒𝚊.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
      )

    }


    // ═══════════════════════════════
    // ✰ CREAR STICKER
    // ═══════════════════════════════

    if (esImagen) {

      await sendImageAsSticker(
        conn,
        m.chat,
        buffer,
        m,
        {
          packname,
          author
        }
      )

    } else {

      await sendVideoAsSticker(
        conn,
        m.chat,
        buffer,
        m,
        {
          packname,
          author
        }
      )

    }


  } catch (error) {

    console.error(
      '[STICKER ERROR]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚛𝚎𝚊𝚛 𝚎𝚕 𝚜𝚝𝚒𝚌𝚔𝚎𝚛.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚎𝚗𝚟𝚒𝚊𝚗𝚍𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎 𝚕𝚊 𝚒𝚖𝚊𝚐𝚎𝚗 𝚘 𝚟𝚒𝚍𝚎𝚘.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'sticker <img/vid>'
]

handler.tags = [
  'convertidores'
]

handler.command = [
  'sticker',
  's',
  'stiker',
  'stic',
  'figurinha'
]


export default handler