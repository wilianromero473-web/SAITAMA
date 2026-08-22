// ═════════════════════════════════════
// ✰ SAITAMABOT • INFORMACIÓN DE CANAL
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command
  }
) => {

  try {

    // ═════════════════════════════════
    // ✰ VALIDAR LINK
    // ═════════════════════════════════

    const input =
      text?.trim()


    if (!input) {

      return m.reply(
`༺ ✰ 𝙻𝙸𝙽𝙺 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙾 ✰ ༻

> ✰ Enviá el link de un canal de WhatsApp.

༺ ✰ 𝚄𝚂𝙾 ✰ ༻

> ✰ *${usedPrefix}${command} https://whatsapp.com/channel/xxxx*`
      )

    }


    // ═════════════════════════════════
    // ✰ EXTRAER CÓDIGO
    // ═════════════════════════════════

    const match =
      input.match(
        /whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/
      )


    if (!match) {

      return m.reply(
`༺ ✰ 𝙻𝙸𝙽𝙺 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙾 ✰ ༻

> ✰ El enlace no corresponde a un canal de WhatsApp.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> ✰ *${usedPrefix}${command} https://whatsapp.com/channel/xxxx*`
      )

    }


    const code =
      match[1]


    // ═════════════════════════════════
    // ✰ PROCESANDO
    // ═════════════════════════════════

    await m.reply(
`༺ ✰ 𝙾𝙱𝚃𝙴𝙽𝙸𝙴𝙽𝙳𝙾 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸𝙾́𝙽 ✰ ༻

> ✰ Consultando el canal...
> ✰ Esperá un momento.`
    )


    // ═════════════════════════════════
    // ✰ OBTENER METADATA
    // ═════════════════════════════════

    const info =
      await conn.newsletterMetadata(
        'invite',
        code
      )


    if (!info) {

      return m.reply(
`༺ ✰ 𝙲𝙰𝙽𝙰𝙻 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾 ✰ ༻

> ✰ No se pudo obtener información del canal.`
      )

    }


    // ═════════════════════════════════
    // ✰ DATOS DEL CANAL
    // ═════════════════════════════════

    const meta =
      info.thread_metadata || {}


    const nombre =
      meta?.name?.text ||
      'N/A'


    const desc =
      meta?.description?.text ||
      'Sin descripción'


    const subs =
      meta?.subscribers_count ??
      'N/A'


    const link =
      `https://whatsapp.com/channel/${meta?.invite || code}`


    const verificado =
      meta?.verification === 'VERIFIED'
        ? '✰ Verificado'
        : '✰ No verificado'


    const estado =
      info.state?.type ||
      'N/A'


    const creacion =
      meta?.creation_time
        ? new Date(
            parseInt(meta.creation_time) * 1000
          ).toLocaleDateString('es-PE')
        : 'N/A'


    const reacciones =
      meta?.settings?.reaction_codes?.value ||
      'N/A'


    const handle =
      meta?.handle
        ? `@${meta.handle}`
        : 'Sin handle'


    // ═════════════════════════════════
    // ✰ CONSTRUIR INFORMACIÓN
    // ═════════════════════════════════

    const caption =
`༺ ✰ 𝙸𝙽𝙵𝙾 𝙳𝙴𝙻 𝙲𝙰𝙽𝙰𝙻 ✰ ༻

> ✰ *𝙽𝚘𝚖𝚋𝚛𝚎:* ${nombre}
> ✰ *𝙷𝚊𝚗𝚍𝚕𝚎:* ${handle}
> ✰ *𝙸𝙳:* ${info.id || 'N/A'}
> ✰ *𝙴𝚜𝚝𝚊𝚍𝚘:* ${estado}
> ✰ *𝚅𝚎𝚛𝚒𝚏𝚒𝚌𝚊𝚍𝚘:* ${verificado}
> ✰ *𝚂𝚞𝚜𝚌𝚛𝚒𝚙𝚝𝚘𝚛𝚎𝚜:* ${subs}
> ✰ *𝙲𝚛𝚎𝚊𝚍𝚘:* ${creacion}
> ✰ *𝚁𝚎𝚊𝚌𝚌𝚒𝚘𝚗𝚎𝚜:* ${reacciones}

༺ ✰ 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝙲𝙸𝙾́𝙽 ✰ ༻

> ✰ ${desc}

༺ ✰ 𝙴𝙽𝙻𝙰𝙲𝙴 ✰ ༻

> ✰ ${link}

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`


    // ═════════════════════════════════
    // ✰ FOTO DEL CANAL
    // ═════════════════════════════════

    const preview =
      meta?.preview


    if (
      preview?.direct_path
    ) {

      const fotoUrl =
        `https://mmg.whatsapp.net${preview.direct_path}`


      try {

        await conn.sendMessage(
          m.chat,
          {
            image: {
              url: fotoUrl
            },
            caption
          },
          {
            quoted: m
          }
        )

        return

      } catch {
        // Si falla la imagen, se envía solamente la información.
      }

    }


    // ═════════════════════════════════
    // ✰ RESPUESTA SIN FOTO
    // ═════════════════════════════════

    return m.reply(caption)


  } catch (error) {

    console.error(
      '[INFOCANAL]',
      error?.message || error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ No se pudo obtener la información del canal.

> ✰ Verificá que el enlace sea válido e intentá nuevamente.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'infocanal <link>',
  'canal <link>'
]

handler.command = [
  'infocanal',
  'canal'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler