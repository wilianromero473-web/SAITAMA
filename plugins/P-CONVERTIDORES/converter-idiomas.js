import { IDIOMAS } from '../../lib/traductor.js'


// ═════════════════════════════════════
// ✰ SAITAMABOT • IDIOMAS
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ OBTENER IDIOMAS
    // ═══════════════════════════════

    const lista =
      Object.entries(
        IDIOMAS
      )


    // ═══════════════════════════════
    // ✰ ENCABEZADO
    // ═══════════════════════════════

    let texto =
`༺ ✰ 𝙸𝙳𝙸𝙾𝙼𝙰𝚂 𝙳𝙸𝚂𝙿𝙾𝙽𝙸𝙱𝙻𝙴𝚂 ✰ ༻

> ✰ 𝙴𝚗𝚌𝚘𝚗𝚝𝚛á 𝚊𝚚𝚞í 𝚕𝚘𝚜 𝚌ó𝚍𝚒𝚐𝚘𝚜 𝚍𝚎 𝚒𝚍𝚒𝚘𝚖𝚊 𝚍𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎𝚜.

༺ ✰ 𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝙸𝙳𝙸𝙾𝙼𝙰𝚂 ✰ ༻

`


    // ═══════════════════════════════
    // ✰ LISTA
    // ═══════════════════════════════

    let numero = 1


    for (
      const [
        codigo,
        nombre
      ] of lista
    ) {

      texto +=
        `> ✰ *${numero}.* ` +
        `*${codigo}* — ${nombre}\n`

      numero++

    }


    // ═══════════════════════════════
    // ✰ EJEMPLOS
    // ═══════════════════════════════

    texto +=
`
༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾𝚂 𝙳𝙴 𝚄𝚂𝙾 ✰ ༻

> ✰ *#traducir en Hola mundo*
> ✰ *#traducir ja Hola mundo*
> ✰ *#traducir fr Hola mundo*

༺ ✰ 𝙵𝙸𝙽 𝙳𝙴 𝙻𝙰 𝙻𝙸𝚂𝚃𝙰 ✰ ༻`


    // ═══════════════════════════════
    // ✰ ENVIAR
    // ═══════════════════════════════

    return m.reply(
      texto
    )


  } catch (error) {

    console.error(
      '[IDIOMAS]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚒𝚎𝚛𝚘𝚗 𝚌𝚊𝚛𝚐𝚊𝚛 𝚕𝚘𝚜 𝚒𝚍𝚒𝚘𝚖𝚊𝚜.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝á 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎 𝚖á𝚜 𝚝𝚊𝚛𝚍𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'idiomas'
]


handler.command = [
  'idiomas',
  'lenguajes',
  'languages'
]


handler.tags = [
  'convertidores'
]


export default handler