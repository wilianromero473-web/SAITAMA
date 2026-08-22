import PDFDocument from 'pdfkit'
import { createWriteStream, readFileSync } from 'fs'
import { rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'


// ═════════════════════════════════════
// ✰ SAITAMABOT • CONVERSOR PDF
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ ARCHIVO TEMPORAL
// ═════════════════════════════════════

function archivoTemporal() {

  return join(
    tmpdir(),
    `saitama_pdf_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.pdf`
  )

}


// ═════════════════════════════════════
// ✰ LIMPIAR ARCHIVO
// ═════════════════════════════════════

async function limpiarArchivo(archivo) {

  if (!archivo) return

  await rm(
    archivo,
    {
      force: true
    }
  ).catch(() => {})

}


// ═════════════════════════════════════
// ✰ CREAR PDF DESDE TEXTO
// ═════════════════════════════════════

async function crearPDFTexto(texto, archivo) {

  return new Promise(
    (resolve, reject) => {

      const doc =
        new PDFDocument({
          margin: 50
        })

      const stream =
        createWriteStream(
          archivo
        )


      doc.pipe(stream)


      doc
        .fontSize(14)
        .text(
          texto,
          {
            lineGap: 5,
            align: 'left'
          }
        )


      doc.end()


      stream.on(
        'finish',
        resolve
      )

      stream.on(
        'error',
        reject
      )

    }
  )

}


// ═════════════════════════════════════
// ✰ CREAR PDF DESDE IMAGEN
// ═════════════════════════════════════

async function crearPDFImagen(
  buffer,
  archivo
) {

  return new Promise(
    (resolve, reject) => {

      const doc =
        new PDFDocument({
          size: 'A4',
          margin: 0
        })


      const stream =
        createWriteStream(
          archivo
        )


      doc.pipe(stream)


      doc.image(
        buffer,
        0,
        0,
        {
          fit: [
            595,
            842
          ],
          align: 'center',
          valign: 'center'
        }
      )


      doc.end()


      stream.on(
        'finish',
        resolve
      )

      stream.on(
        'error',
        reject
      )

    }
  )

}


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    command,
    text
  }
) => {

  let archivo

  try {

    // ═══════════════════════════════
    // ✰ PDF DESDE TEXTO
    // ═══════════════════════════════

    if (
      command === 'crearpdf' ||
      command === 'createpdf' ||
      command === 'criarpdf'
    ) {

      if (!text?.trim()) {

        return m.reply(
`༺ ✰ 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻

> ✰ 𝙴𝚜𝚌𝚛𝚒𝚋𝚎 𝚎𝚕 𝚝𝚎𝚡𝚝𝚘 𝚚𝚞𝚎 𝚚𝚞𝚒𝚎𝚛𝚊𝚜 𝚌𝚘𝚗𝚟𝚎𝚛𝚝𝚒𝚛 𝚊 𝙿𝙳𝙵.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> *!crearpdf Hola mundo*

> *!crearpdf Este es mi documento.*`
        )

      }


      await m.reply(
`༺ ✰ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙶𝚎𝚗𝚎𝚛𝚊𝚗𝚍𝚘 𝚎𝚕 𝙿𝙳𝙵...
> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘.`
      )


      archivo =
        archivoTemporal()


      await crearPDFTexto(
        text,
        archivo
      )


      await conn.sendMessage(
        m.chat,
        {
          document:
            readFileSync(
              archivo
            ),

          mimetype:
            'application/pdf',

          fileName:
            'documento.pdf',

          caption:
`༺ ✰ 𝙿𝙳𝙵 𝙲𝚁𝙴𝙰𝙳𝙾 ✰ ༻

> ✰ 𝚃𝚞 𝚍𝚘𝚌𝚞𝚖𝚎𝚗𝚝𝚘 𝚏𝚞𝚎 𝚌𝚛𝚎𝚊𝚍𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

> ✰ 𝙰𝚛𝚌𝚑𝚒𝚟𝚘: *documento.pdf*`
        },
        {
          quoted: m
        }
      )

      return

    }


    // ═══════════════════════════════
    // ✰ PDF DESDE IMAGEN
    // ═══════════════════════════════

    const q =
      m.quoted || m


    const mtype =
      q.mtype


    if (
      mtype !== 'imageMessage'
    ) {

      return m.reply(
`༺ ✰ 𝙵𝙰𝙻𝚃𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 ✰ ༻

> ✰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗𝚊 𝚒𝚖𝚊𝚐𝚎𝚗 𝚌𝚘𝚗:

*${command === 'topdf' ? '!topdf' : '!topdf'}*

> ✰ 𝙻𝚊 𝚒𝚖𝚊𝚐𝚎𝚗 𝚜𝚎 𝚌𝚘𝚗𝚟𝚎𝚛𝚝𝚒𝚛á 𝚊 𝚞𝚗 𝚍𝚘𝚌𝚞𝚖𝚎𝚗𝚝𝚘 𝙿𝙳𝙵.`
      )

    }


    await m.reply(
`༺ ✰ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 ✰ ༻

> ✰ 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚗𝚍𝚘 𝚕𝚊 𝚒𝚖𝚊𝚐𝚎𝚗...
> ✰ 𝙲𝚛𝚎𝚊𝚗𝚍𝚘 𝚎𝚕 𝙿𝙳𝙵...`
    )


    const buffer =
      await q.download()


    if (
      !buffer ||
      !buffer.length
    ) {

      throw new Error(
        'No se pudo descargar la imagen.'
      )

    }


    archivo =
      archivoTemporal()


    await crearPDFImagen(
      buffer,
      archivo
    )


    await conn.sendMessage(
      m.chat,
      {
        document:
          readFileSync(
            archivo
          ),

        mimetype:
          'application/pdf',

        fileName:
          'imagen.pdf',

        caption:
`༺ ✰ 𝙿𝙳𝙵 𝙲𝚁𝙴𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙻𝚊 𝚒𝚖𝚊𝚐𝚎𝚗 𝚏𝚞𝚎 𝚌𝚘𝚗𝚟𝚎𝚛𝚝𝚒𝚍𝚊 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

> ✰ 𝙰𝚛𝚌𝚑𝚒𝚟𝚘: *imagen.pdf*`
      },
      {
        quoted: m
      }
    )


  } catch (error) {

    console.error(
      '[PDF]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚛𝚎𝚊𝚛 𝚎𝚕 𝙿𝙳𝙵.

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊𝚕𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  } finally {

    await limpiarArchivo(
      archivo
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'topdf',
  'crearpdf <texto>'
]

handler.command = [
  'topdf',
  'crearpdf',
  'createpdf',
  'criarpdf'
]

handler.tags = [
  'convertidores'
]

export default handler