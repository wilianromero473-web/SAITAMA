import { upload } from '@axel-dev09/zen-dl'


// ═════════════════════════════════════
// ✰ SAITAMABOT • MEDIA TO URL
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ TIPOS DE MEDIA
// ═════════════════════════════════════

const TIPOS = {

  videoMessage:
    'video',

  imageMessage:
    'image',

  audioMessage:
    'audio',

  stickerMessage:
    'sticker'

}


// ═════════════════════════════════════
// ✰ EXTENSIONES
// ═════════════════════════════════════

const EXTS = {

  videoMessage:
    'mp4',

  imageMessage:
    'jpg',

  audioMessage:
    'mp3',

  stickerMessage:
    'webp'

}


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m
) => {

  try {

    // ═══════════════════════════════
    // ✰ DETECTAR MEDIA
    // ═══════════════════════════════

    const media =
      m.quoted || m


    const mtype =
      media?.mtype ||
      m.mtype


    if (
      !mtype ||
      !TIPOS[mtype]
    ) {

      return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙼𝙴𝙳𝙸𝙰 ✰ ༻

> ✰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗 𝚊𝚛𝚌𝚑𝚒𝚟𝚘 𝚖𝚞𝚕𝚝𝚒𝚖𝚎𝚍𝚒𝚊.

༺ ✰ 𝙵𝙾𝚁𝙼𝙰𝚃𝙾𝚂 𝙰𝙲𝙴𝙿𝚃𝙰𝙳𝙾𝚂 ✰ ༻

> ✰ 🎬 𝚅í𝚍𝚎𝚘
> ✰ 🖼️ 𝙸𝚖𝚊𝚐𝚎𝚗
> ✰ 🎵 𝙰𝚞𝚍𝚒𝚘
> ✰ 🏷️ 𝚂𝚝𝚒𝚌𝚔𝚎𝚛

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗 𝚊𝚛𝚌𝚑𝚒𝚟𝚘 𝚌𝚘𝚗 *#tourl*`
      )

    }


    // ═══════════════════════════════
    // ✰ PROCESANDO
    // ═══════════════════════════════

    await m.reply(
`༺ ✰ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙿𝚛𝚎𝚙𝚊𝚛𝚊𝚗𝚍𝚘 𝚎𝚕 𝚊𝚛𝚌𝚑𝚒𝚟𝚘...
> ✰ 𝚂𝚞𝚋𝚒𝚎𝚗𝚍𝚘 𝚊𝚕 𝚜𝚎𝚛𝚟𝚒𝚍𝚘𝚛.

> ✰ 𝙴𝚜𝚙𝚎𝚛á 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘...`
    )


    // ═══════════════════════════════
    // ✰ DESCARGAR MEDIA
    // ═══════════════════════════════

    const buffer =
      await media.download()


    if (!buffer) {

      throw new Error(
        'Sin buffer'
      )

    }


    // ═══════════════════════════════
    // ✰ SUBIR ARCHIVO
    // ═══════════════════════════════

    const extension =
      EXTS[mtype]


    const filename =
      `saitama_${Date.now()}.${extension}`


    const result =
      await upload(
        buffer,
        filename
      )


    const url =
      result?.url


    if (!url) {

      throw new Error(
        'No se obtuvo URL'
      )

    }


    // ═══════════════════════════════
    // ✰ RESULTADO
    // ═══════════════════════════════

    return m.reply(
`༺ ✰ 𝚄𝚁𝙻 𝙶𝙴𝙽𝙴𝚁𝙰𝙳𝙰 ✰ ༻

> ✰ 𝙼𝚎𝚍𝚒𝚊: *${TIPOS[mtype]}*
> ✰ 𝙴𝚡𝚝𝚎𝚗𝚜𝚒ó𝚗: *.${extension}*

༺ ✰ 𝙴𝙽𝙻𝙰𝙲𝙴 ✰ ༻

> 🔗 ${url}

༺ ✰ 𝙵𝙸𝙽 𝙳𝙴𝙻 𝙿𝚁𝙾𝙲𝙴𝚂𝙾 ✰ ༻`
    )


  } catch (error) {

    console.error(
      '[TOURL]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚜𝚞𝚋𝚒𝚛 𝚎𝚕 𝚊𝚛𝚌𝚑𝚒𝚟𝚘.

> ✰ 𝙲𝚘𝚖𝚙𝚛𝚞𝚎𝚋𝚊 𝚚𝚞𝚎 𝚕𝚊 𝚖𝚎𝚍𝚒𝚊 𝚜𝚎𝚊 𝚟á𝚕𝚒𝚍𝚊 𝚢 𝚟𝚞𝚎𝚕𝚟𝚊 𝚊 𝚒𝚗𝚝𝚎𝚗𝚝𝚊𝚛𝚕𝚘.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'tourl'
]


handler.command = [

  'tovideourl',
  'tourl',
  'upload',
  'togifurl',
  'tomediaurl',
  'tofotourl'

]


handler.tags = [
  'convertidores'
]


export default handler