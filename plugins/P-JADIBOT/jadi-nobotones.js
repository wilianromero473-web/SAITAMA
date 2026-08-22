import {
  getSubBotMeta,
  saveSubBotMeta,
  subBots
} from '../../lib/jadibot.js'

// ═════════════════════════════════════
// ✰ SAITAMABOT • CONFIGURACIÓN BOTONES
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    args,
    usedPrefix,
    command,
    userDb
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ MODO
    // ═══════════════════════════════

    const modo =
      String(
        args[0] || ''
      ).toLowerCase()


    const activar =
      [
        'on',
        '1',
        'activar'
      ].includes(modo)


    const desactivar =
      [
        'off',
        '0',
        'desactivar'
      ].includes(modo)


    // ═══════════════════════════════
    // ✰ SUB-BOT
    // ═══════════════════════════════

    if (
      conn.isSubBot &&
      conn.ownerNumber ===
        m.sender.split('@')[0]
    ) {

      // ─────────────────────────────
      // ✰ MOSTRAR ESTADO
      // ─────────────────────────────

      if (
        !activar &&
        !desactivar
      ) {

        const estado =
          conn.noButtons
            ? '❌ 𝙳𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘𝚜'
            : '✅ 𝙰𝚌𝚝𝚒𝚟𝚊𝚍𝚘𝚜'


        return m.reply(
`༺ ✰ 𝙱𝙾𝚃𝙾𝙽𝙴𝚂 𝙳𝙴𝙻 𝚂𝚄𝙱-𝙱𝙾𝚃 ✰ ༻

> ✰ 𝙴𝚜𝚝𝚊𝚍𝚘 𝚊𝚌𝚝𝚞𝚊𝚕: ${estado}

> ✰ 𝚂𝚒 𝚝𝚞 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙 𝚎𝚜 𝚒𝙾𝚂 𝚢 𝚕𝚘𝚜 𝚋𝚘𝚝𝚘𝚗𝚎𝚜 𝚗𝚘 𝚏𝚞𝚗𝚌𝚒𝚘𝚗𝚊𝚗, 𝚙𝚞𝚎𝚍𝚎𝚜 𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚛𝚕𝚘𝚜.

> ✰ 𝙴𝚜𝚝𝚘 𝚊𝚏𝚎𝚌𝚝𝚊 𝚊 𝚝𝚘𝚍𝚘𝚜 𝚕𝚘𝚜 𝚞𝚜𝚞𝚊𝚛𝚒𝚘𝚜 𝚍𝚎 𝚝𝚞 𝚂𝚞𝚋-𝙱𝚘𝚝.

༺ ✰ 𝙾𝙿𝙲𝙸𝙾𝙽𝙴𝚂 ✰ ༻

> ✰ ${usedPrefix}${command} off
> 𝙳𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚛 𝚋𝚘𝚝𝚘𝚗𝚎𝚜.

> ✰ ${usedPrefix}${command} on
> 𝙰𝚌𝚝𝚒𝚟𝚊𝚛 𝚋𝚘𝚝𝚘𝚗𝚎𝚜.`
        )

      }


      // ═══════════════════════════════
      // ✰ ACTUALIZAR SUB-BOT
      // ═══════════════════════════════

      conn.noButtons =
        activar
          ? false
          : true


      const bot =
        subBots.get(
          conn.ownerNumber
        )


      if (bot) {

        bot.noButtons =
          conn.noButtons

      }


      // ═══════════════════════════════
      // ✰ GUARDAR CONFIGURACIÓN
      // ═══════════════════════════════

      const meta =
        await getSubBotMeta()


      if (
        !meta[conn.ownerNumber]
      ) {

        meta[conn.ownerNumber] = {}

      }


      meta[
        conn.ownerNumber
      ].noButtons =
        conn.noButtons


      await saveSubBotMeta(
        meta
      )


      return m.reply(
`༺ ✰ 𝙱𝙾𝚃𝙾𝙽𝙴𝚂 𝙳𝙴𝙻 𝚂𝚄𝙱-𝙱𝙾𝚃 ✰ ༻

> ✰ 𝙴𝚜𝚝𝚊𝚍𝚘: ${
  conn.noButtons
    ? '❌ 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾𝚂'
    : '✅ 𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾𝚂'
}

> ✰ ${
  conn.noButtons
    ? '𝙻𝚊𝚜 𝚘𝚙𝚌𝚒𝚘𝚗𝚎𝚜 𝚜𝚎 𝚖𝚘𝚜𝚝𝚛𝚊𝚛á𝚗 𝚌𝚘𝚖𝚘 𝚝𝚎𝚡𝚝𝚘 𝚗𝚞𝚖𝚎𝚛𝚊𝚍𝚘. 𝚃𝚘𝚍𝚘𝚜 𝚕𝚘𝚜 𝚞𝚜𝚞𝚊𝚛𝚒𝚘𝚜 𝚍𝚎 𝚎𝚜𝚝𝚎 𝚋𝚘𝚝 𝚕𝚘 𝚟𝚎𝚛á𝚗 𝚊𝚜í.'
    : '𝙻𝚘𝚜 𝚋𝚘𝚝𝚘𝚗𝚎𝚜 𝚒𝚗𝚝𝚎𝚛𝚊𝚌𝚝𝚒𝚟𝚘𝚜 𝚎𝚜𝚝á𝚗 𝚊𝚌𝚝𝚒𝚟𝚘𝚜 𝚙𝚊𝚛𝚊 𝚝𝚘𝚍𝚘𝚜 𝚕𝚘𝚜 𝚞𝚜𝚞𝚊𝚛𝚒𝚘𝚜 𝚍𝚎 𝚎𝚜𝚝𝚎 𝚋𝚘𝚝.'
}`
      )

    }


    // ═══════════════════════════════
    // ✰ MOSTRAR ESTADO PERSONAL
    // ═══════════════════════════════

    if (
      !activar &&
      !desactivar
    ) {

      const estado =
        userDb?.noButtons
          ? '❌ 𝙳𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘𝚜'
          : '✅ 𝙰𝚌𝚝𝚒𝚟𝚊𝚍𝚘𝚜'


      return m.reply(
`༺ ✰ 𝚃𝚄𝚂 𝙱𝙾𝚃𝙾𝙽𝙴𝚂 ✰ ༻

> ✰ 𝙴𝚜𝚝𝚊𝚍𝚘 𝚊𝚌𝚝𝚞𝚊𝚕: ${estado}

> ✰ 𝙲𝚊𝚖𝚋𝚒á 𝚎𝚜𝚝𝚊 𝚘𝚙𝚌𝚒ó𝚗 𝚜𝚒 𝚝𝚞 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙 𝚗𝚘 𝚖𝚞𝚎𝚜𝚝𝚛𝚊 𝚕𝚘𝚜 𝚋𝚘𝚝𝚘𝚗𝚎𝚜 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

> ✰ 𝙴𝚜𝚝𝚊 𝚌𝚘𝚗𝚏𝚒𝚐𝚞𝚛𝚊𝚌𝚒ó𝚗 𝚜𝚘𝚕𝚘 𝚝𝚎 𝚊𝚏𝚎𝚌𝚝𝚊 𝚊 𝚟𝚘𝚜.

༺ ✰ 𝙾𝙿𝙲𝙸𝙾𝙽𝙴𝚂 ✰ ༻

> ✰ ${usedPrefix}${command} off
> 𝙳𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚛 𝚋𝚘𝚝𝚘𝚗𝚎𝚜.

> ✰ ${usedPrefix}${command} on
> 𝙰𝚌𝚝𝚒𝚟𝚊𝚛 𝚋𝚘𝚝𝚘𝚗𝚎𝚜.`
      )

    }


    // ═══════════════════════════════
    // ✰ VERIFICAR DATABASE
    // ═══════════════════════════════

    if (!userDb) {

      return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚛 𝚝𝚞 𝚙𝚛𝚎𝚏𝚎𝚛𝚎𝚗𝚌𝚒𝚊.`
      )

    }


    // ═══════════════════════════════
    // ✰ GUARDAR PREFERENCIA
    // ═══════════════════════════════

    userDb.noButtons =
      desactivar

    await userDb.save()


    // ═══════════════════════════════
    // ✰ CONFIRMACIÓN
    // ═══════════════════════════════

    return m.reply(
`༺ ✰ 𝙱𝙾𝚃𝙾𝙽𝙴𝚂 ${
  desactivar
    ? '𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾𝚂'
    : '𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾𝚂'
} ✰ ༻

> ✰ ${
  desactivar
    ? '𝙻𝚊𝚜 𝚘𝚙𝚌𝚒𝚘𝚗𝚎𝚜 𝚜𝚎 𝚖𝚘𝚜𝚝𝚛𝚊𝚛á𝚗 𝚌𝚘𝚖𝚘 𝚝𝚎𝚡𝚝𝚘 𝚗𝚞𝚖𝚎𝚛𝚊𝚍𝚘. 𝚂𝚘𝚕𝚘 𝚙𝚊𝚛𝚊 𝚟𝚘𝚜.'
    : '𝙻𝚘𝚜 𝚋𝚘𝚝𝚘𝚗𝚎𝚜 𝚒𝚗𝚝𝚎𝚛𝚊𝚌𝚝𝚒𝚟𝚘𝚜 𝚎𝚜𝚝á𝚗 𝚊𝚌𝚝𝚒𝚟𝚘𝚜 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎. 𝚂𝚘𝚕𝚘 𝚙𝚊𝚛𝚊 𝚟𝚘𝚜.'
}`
    )

  } catch (error) {

    console.error(
      '[BOTONES]',
      error?.message || error
    )

    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚛 𝚕𝚊 𝚌𝚘𝚗𝚏𝚒𝚐𝚞𝚛𝚊𝚌𝚒ó𝚗.

> ✰ 𝙸𝚗𝚝é𝚗𝚝𝚊𝚕𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'botones <on/off>',
  'buttons <on/off>'
]

handler.tags = [
  'config'
]

handler.command = [
  'botones',
  'buttons'
]

export default handler