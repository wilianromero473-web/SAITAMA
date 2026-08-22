import { addExif } from '../../lib/sticker.js'
import config from '../../config.js'


// ═════════════════════════════════════
// ✦ SAITAMABOT • WATERMARK STICKER
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✦ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    text
  }
) => {

  try {

    // ═══════════════════════════════
    // ✦ OBTENER STICKER
    // ═══════════════════════════════

    const q =
      m.quoted
        ? m.quoted
        : m

    const mtype =
      q.mtype

    const mime =
      (
        q.msg ||
        q
      ).mimetype || ''


    // ═══════════════════════════════
    // ✦ VERIFICAR STICKER
    // ═══════════════════════════════

    if (
      mtype !== 'stickerMessage' &&
      !/webp/i.test(mime)
    ) {

      return m.reply(
`༺ ✦ 𝚂𝙸𝙽 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 ✦ ༻

> ✦ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚙𝚊𝚛𝚊 𝚎𝚍𝚒𝚝𝚊𝚛 𝚜𝚞 𝚗𝚘𝚖𝚋𝚛𝚎.

༺ ✦ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✦ ༻

> ✦ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊𝚕 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚌𝚘𝚗:
> *wm SaitamaBot | SaiDev145*`
      )

    }


    // ═══════════════════════════════
    // ✦ DATOS PREDETERMINADOS
    // ═══════════════════════════════

    let packname =
      config.packname ||
      'SAI-BOT'

    let author =
      config.author ||
      'AXELDEV09'


    // ═══════════════════════════════
    // ✦ PERSONALIZAR PACK / AUTOR
    // ═══════════════════════════════

    if (
      text?.trim()
    ) {

      const partes =
        text
          .split('|')
          .map(
            s => s.trim()
          )


      if (partes[0]) {

        packname =
          partes[0]

      }


      if (partes[1]) {

        author =
          partes[1]

      }

    }


    // ═══════════════════════════════
    // ✦ INFORMACIÓN
    // ═══════════════════════════════

    await m.reply(
`༺ ✦ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 ✦ ༻

> ✦ 𝙴𝚍𝚒𝚝𝚊𝚗𝚍𝚘 𝚒𝚗𝚏𝚘𝚛𝚖𝚊𝚌𝚒ó𝚗 𝚍𝚎𝚕 𝚜𝚝𝚒𝚌𝚔𝚎𝚛...
> ✦ 𝙰𝚙𝚕𝚒𝚌𝚊𝚗𝚍𝚘 𝚠𝚊𝚝𝚎𝚛𝚖𝚊𝚛𝚔...

༺ ✦ 𝙿𝙰𝙲𝙺 ✦ ༻
> ✦ ${packname}

༺ ✦ 𝙰𝚄𝚃𝙾𝚁 ✦ ༻
> ✦ ${author}`
    )


    // ═══════════════════════════════
    // ✦ DESCARGAR STICKER
    // ═══════════════════════════════

    const buffer =
      await q.download()


    if (
      !buffer ||
      !buffer.length
    ) {

      throw new Error(
        'No se pudo descargar el sticker.'
      )

    }


    // ═══════════════════════════════
    // ✦ APLICAR EXIF
    // ═══════════════════════════════

    const stickerBuf =
      await addExif(
        buffer,
        packname,
        author
      )


    // ═══════════════════════════════
    // ✦ ENVIAR STICKER
    // ═══════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        sticker: stickerBuf
      },
      {
        quoted: m
      }
    )


    // ═══════════════════════════════
    // ✦ ÉXITO
    // ═══════════════════════════════

    return m.reply(
`༺ ✦ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙴𝙳𝙸𝚃𝙰𝙳𝙾 ✦ ༻

> ✦ 𝙴𝚕 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚏𝚞𝚎 𝚎𝚍𝚒𝚝𝚊𝚍𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

༺ ✦ 𝙽𝚄𝙴𝚅𝙰 𝙸𝙽𝙵𝙾 ✦ ༻

> ✦ 📦 𝙿𝚊𝚌𝚔: *${packname}*
> ✦ ✍️ 𝙰𝚞𝚝𝚘𝚛: *${author}*`
    )


  } catch (error) {

    console.error(
      '[WATERMARK]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✦ 𝙴𝚁𝚁𝙾𝚁 ✦ ༻

> ✦ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚎𝚍𝚒𝚝𝚊𝚛 𝚎𝚕 𝚜𝚝𝚒𝚌𝚔𝚎𝚛.

> ✦ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✦ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'wm <pack | author>',
  'take <pack | author>',
  'watermark <pack | author>'
]

handler.command = [
  'wm',
  'take',
  'watermark',
  'stickerinfo',
  'setwm'
]

handler.tags = [
  'convertidores'
]

export default handler