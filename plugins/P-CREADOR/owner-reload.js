import {
  loadPlugins,
  loadPlugin,
  plugins
} from '../../handler.js'

// ✰ SAITAMABOT • RECARGAR PLUGINS

const handler = async (
  m,
  {
    conn,
    text,
    command
  }
) => {

  try {

    // ✰ ARGUMENTO

    const arg =
      text?.trim().toLowerCase() || ''


    // ✰ REACCIÓN INICIAL

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '⏳',
          key: m.key
        }
      }
    )


    // ✰ RECARGAR UN SOLO PLUGIN

    if (
      command === 'up' &&
      arg &&
      arg !== 'all' &&
      arg !== 'todo'
    ) {

      const nombre =
        arg.endsWith('.js')
          ? arg
          : `${arg}.js`


      // ✰ BUSCAR PLUGIN

      const existeExacto =
        Object.keys(plugins).find(
          k =>
            k === nombre ||
            k.endsWith(`/${nombre}`)
        )


      // ✰ PLUGIN NO ENCONTRADO

      if (!existeExacto) {

        await conn.sendMessage(
          m.chat,
          {
            react: {
              text: '❌',
              key: m.key
            }
          }
        )

        return m.reply(
`✰ 𝙿𝙻𝚄𝙶𝙸𝙽 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾 ✰

> ✰ 𝙽𝚘 𝚎𝚡𝚒𝚜𝚝𝚎 𝚗𝚒𝚗𝚐ú𝚗 𝚙𝚕𝚞𝚐𝚒𝚗 𝚌𝚊𝚛𝚐𝚊𝚍𝚘 𝚕𝚕𝚊𝚖𝚊𝚍𝚘:
> *${nombre}*

> ✰ 𝚄𝚜𝚊 *${command}* 𝚜𝚒𝚗 𝚊𝚛𝚐𝚞𝚖𝚎𝚗𝚝𝚘𝚜 𝚙𝚊𝚛𝚊 𝚛𝚎𝚌𝚊𝚛𝚐𝚊𝚛 𝚝𝚘𝚍𝚘𝚜.`
        )
      }


      // ✰ RECARGAR PLUGIN

      try {

        await loadPlugin(
          existeExacto
        )


        await conn.sendMessage(
          m.chat,
          {
            react: {
              text: '✅',
              key: m.key
            }
          }
        )


        return m.reply(
`✰ 𝙿𝙻𝚄𝙶𝙸𝙽 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾 ✰

> ✰ 𝙿𝚕𝚞𝚐𝚒𝚗:
> *${existeExacto}*

> ✰ 𝙴𝚕 𝚙𝚕𝚞𝚐𝚒𝚗 𝚏𝚞𝚎 𝚛𝚎𝚌𝚊𝚛𝚐𝚊𝚍𝚘 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.`
        )

      } catch (error) {

        await conn.sendMessage(
          m.chat,
          {
            react: {
              text: '❌',
              key: m.key
            }
          }
        )

        return m.reply(
`✰ 𝙴𝚁𝚁𝙾𝚁 𝙰𝙻 𝚁𝙴𝙲𝙰𝚁𝙶𝙰𝚁 ✰

> ✰ 𝙿𝚕𝚞𝚐𝚒𝚗:
> *${existeExacto}*

> ✰ 𝙴𝚛𝚛𝚘𝚛:
> ${error?.message || '𝙴𝚛𝚛𝚘𝚛 𝚍𝚎𝚜𝚌𝚘𝚗𝚘𝚌𝚒𝚍𝚘'}`
        )
      }

    }


    // ✰ RECARGAR TODOS LOS PLUGINS

    await loadPlugins()


    // ✰ REACCIÓN FINAL

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    )


    return m.reply(
`✰ 𝙿𝙻𝚄𝙶𝙸𝙽𝚂 𝚁𝙴𝙲𝙰𝚁𝙶𝙰𝙳𝙾𝚂 ✰

> ✰ 𝚃𝚘𝚍𝚘𝚜 𝚕𝚘𝚜 𝚙𝚕𝚞𝚐𝚒𝚗𝚜 𝚏𝚞𝚎𝚛𝚘𝚗 𝚊𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚍𝚘𝚜 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚊𝚖𝚎𝚗𝚝𝚎.

> ✰ 𝙻𝚘𝚜 𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜 𝚢𝚊 𝚎𝚜𝚝á𝚗 𝚍𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎𝚜 𝚎𝚗 𝚖𝚎𝚖𝚘𝚛𝚒𝚊.`
    )

  } catch (error) {

    console.error(
      '[RELOAD]',
      error?.message || error
    )


    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    )


    return m.reply(
`✰ 𝙴𝚁𝚁𝙾𝚁 ✰

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚛𝚎𝚌𝚊𝚛𝚐𝚊𝚛 𝚕𝚘𝚜 𝚙𝚕𝚞𝚐𝚒𝚗𝚜.

> ✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
> ${error?.message || '𝙴𝚛𝚛𝚘𝚛 𝚍𝚎𝚜𝚌𝚘𝚗𝚘𝚌𝚒𝚍𝚘'}`
    )
  }
}


// ✰ CONFIGURACIÓN

handler.help = [
  'reload [plugin|all]',
  'recargar [plugin|all]',
  'updateplugins [plugin|all]',
  'recargarplugins [plugin|all]',
  'up [plugin|all]',
  'yo [plugin|all]'
]

handler.command = [
  'reload',
  'recargar',
  'updateplugins',
  'recargarplugins',
  'up',
  'yo'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler