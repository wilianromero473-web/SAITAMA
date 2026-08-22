import { plugins } from '../../handler.js'
import config from '../../config.js'

// ✰ SAITAMABOT • LISTA DE PLUGINS

const handler = async (m) => {

  try {

    // ✰ OBTENER PLUGINS

    const list =
      Object.keys(plugins)
        .sort()

    if (list.length === 0) {

      return m.reply(
`𝙿𝙻𝚄𝙶𝙸𝙽𝚂 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾𝚂

> ✰ 𝙽𝚘 𝚑𝚊𝚢 𝚙𝚕𝚞𝚐𝚒𝚗𝚜 𝚌𝚊𝚛𝚐𝚊𝚍𝚘𝚜 𝚎𝚗 𝚖𝚎𝚖𝚘𝚛𝚒𝚊.`
      )
    }

    // ✰ AGRUPAR POR CARPETAS

    const groups = {}
    let total = 0

    list.forEach(relPath => {

      const parts =
        relPath
          .replace(/\\/g, '/')
          .split('/')

      const folder =
        parts.length > 1
          ? parts.slice(0, -1).join('/')
          : 'Raíz'

      const file =
        parts[parts.length - 1]

      if (!groups[folder]) {
        groups[folder] = []
      }

      groups[folder].push(file)

      total++
    })

    // ✰ CONSTRUIR MENSAJE

    let txt =
`𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝙿𝙻𝚄𝙶𝙸𝙽𝚂

> ✰ 𝚃𝚘𝚝𝚊𝚕 𝚌𝚊𝚛𝚐𝚊𝚍𝚘𝚜: *${total}*

`

    // ✰ MOSTRAR CARPETAS

    for (
      const [folder, files]
      of Object.entries(groups)
    ) {

      txt +=
`✰ ${folder.toUpperCase()}

`

      files.forEach(file => {

        txt +=
`> ✰ ${file}
`

      })

      txt += '\n'
    }

    // ✰ FOOTER

    txt +=
`> ✰ ${config.footer}`

    return m.reply(txt)

  } catch (error) {

    console.error(
      '[LISTPLUGINS]',
      error?.message ||
      error
    )

    return m.reply(
`𝙴𝚁𝚁𝙾𝚁

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚜𝚤𝚣𝚝𝚎𝚖𝚊𝚛 𝚕𝚊 𝚕𝚒𝚜𝚝𝚊 𝚍𝚎 𝚙𝚕𝚞𝚐𝚒𝚗𝚜.
> ✰ 𝙼𝚎𝚗𝚜𝚊𝚓𝚎: ${error?.message || 'Error desconocido'}`
    )
  }
}


// ✰ CONFIGURACIÓN DEL PLUGIN

handler.help = [
  'listplugins',
  'plugins',
  'lp'
]

handler.command = [
  'listplugins',
  'plugins',
  'lp'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler