import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import config from '../../config.js'

// ✰ SAITAMABOT • ANALIZADOR DE PLUGINS

function getFilesRecursively(dir) {
  let results = []

  if (!fs.existsSync(dir)) {
    return results
  }

  const list = fs.readdirSync(dir, {
    withFileTypes: true
  })

  for (const item of list) {
    const fullPath = path.join(dir, item.name)

    if (item.isDirectory()) {
      results = results.concat(
        getFilesRecursively(fullPath)
      )
    } else if (
      item.isFile() &&
      item.name.endsWith('.js')
    ) {
      results.push(fullPath)
    }
  }

  return results
}

function formatError(file, pluginsDir, error) {
  const relPath = path
    .relative(pluginsDir, file)
    .replace(/\\/g, '/')

  return (
`𝙿𝙻𝚄𝙶𝙸𝙽 𝙲𝙾𝙽 𝙴𝚁𝚁𝙾𝚁

> 𝙰𝚛𝚌𝚑𝚒𝚟𝚘: ${relPath}
> 𝚃𝚒𝚙𝚘: ${error?.name || 'Error'}
> 𝙼𝚎𝚗𝚜𝚊𝚓𝚎: ${error?.message || 'Error desconocido'}`
  )
}

const handler = async (m, { conn }) => {

  try {

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '🔎',
          key: m.key
        }
      }
    )

    await m.reply(
`𝙰𝙽𝙰𝙻𝙸𝚉𝙰𝙽𝙳𝙾 𝙲Ó𝙳𝙸𝙶𝙾

> ✰ 𝙴𝚜𝚌𝚊𝚗𝚎𝚊𝚗𝚍𝚘 𝚝𝚘𝚍𝚘𝚜 𝚕𝚘𝚜 𝚙𝚕𝚞𝚐𝚒𝚗𝚜...
> ✰ 𝙲𝚘𝚖𝚙𝚛𝚘𝚋𝚊𝚗𝚍𝚘 𝚜𝚒𝚗𝚝𝚊𝚡𝚒𝚜...
> ✰ 𝙲𝚘𝚖𝚙𝚛𝚘𝚋𝚊𝚗𝚍𝚘 𝚒𝚖𝚙𝚘𝚛𝚝𝚜 𝚢 𝚍𝚎𝚙𝚎𝚗𝚍𝚎𝚗𝚌𝚒𝚊𝚜...
> ✰ 𝙴𝚜𝚙𝚎𝚛𝚊 𝚞𝚗𝚘𝚜 𝚜𝚎𝚐𝚞𝚗𝚍𝚘𝚜.`
    )

    const pluginsDir = path.resolve(
      process.cwd(),
      'plugins'
    )

    if (!fs.existsSync(pluginsDir)) {

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
`𝙿𝙻𝚄𝙶𝙸𝙽𝚂 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾𝚂

> ✰ 𝙽𝚘 𝚎𝚡𝚒𝚜𝚝𝚎 𝚕𝚊 𝚌𝚊𝚛𝚙𝚎𝚝𝚊:
> *plugins/*`
      )
    }

    const files = getFilesRecursively(
      pluginsDir
    )

    if (!files.length) {

      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '⚠️',
            key: m.key
          }
        }
      )

      return m.reply(
`𝙿𝙻𝚄𝙶𝙸𝙽𝚂 𝚅𝙰𝙲Í𝙾𝚂

> ✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚛𝚘𝚗 𝚊𝚛𝚌𝚑𝚒𝚟𝚘𝚜 *.js*
> ✰ 𝙳𝚎𝚗𝚝𝚛𝚘 𝚍𝚎 *plugins/*.`
      )
    }

    const errores = []
    let revisados = 0

    for (const file of files) {

      revisados++

      try {

        const url =
          pathToFileURL(file).href +
          '?t=' +
          Date.now() +
          '_' +
          revisados

        await import(url)

      } catch (error) {

        errores.push(
          formatError(
            file,
            pluginsDir,
            error
          )
        )
      }
    }

    if (errores.length === 0) {

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
`𝙰𝙽Á𝙻𝙸𝚂𝙸𝚂 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰𝙳𝙾

> ✰ 𝙿𝚕𝚞𝚐𝚒𝚗𝚜 𝚛𝚎𝚟𝚒𝚜𝚊𝚍𝚘𝚜: ${files.length}
> ✰ 𝙴𝚛𝚛𝚘𝚛𝚎𝚜 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚍𝚘𝚜: 0
> ✰ 𝙴𝚜𝚝𝚊𝚍𝚘: 𝚂𝚒𝚜𝚝𝚎𝚖𝚊 𝚕𝚒𝚖𝚙𝚒𝚘

𝙲Ó𝙳𝙸𝙶𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾

> ✰ 𝙽𝚘 𝚜𝚎 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚛𝚘𝚗 𝚎𝚛𝚛𝚘𝚛𝚎𝚜 𝚍𝚎
> ✰ 𝚜𝚒𝚗𝚝𝚊𝚡𝚒𝚜 𝚗𝚒 𝚖Ó𝚍𝚞𝚕𝚘𝚜 𝚏𝚊𝚕𝚝𝚊𝚗𝚝𝚎𝚜.

> ✰ ${config.footer}`
      )
    }

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '⚠️',
          key: m.key
        }
      }
    )

    const txt =
`𝚁𝙴𝙿𝙾𝚁𝚃𝙴 𝙳𝙴 𝙴𝚁𝚁𝙾𝚁𝙴𝚂

> ✰ 𝙿𝚕𝚞𝚐𝚒𝚗𝚜 𝚛𝚎𝚟𝚒𝚜𝚊𝚍𝚘𝚜: ${files.length}
> ✰ 𝙿𝚕𝚞𝚐𝚒𝚗𝚜 𝚌𝚘𝚗 𝚎𝚛𝚛𝚘𝚛𝚎𝚜: ${errores.length}

${errores.join('\n\n')}

> ✰ ${config.footer}`

    return m.reply(txt)

  } catch (error) {

    console.error(
      '[CHECKPLUGINS]',
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
`𝙴𝚁𝚁𝙾𝚁 𝙳𝙴 𝙰𝙽Á𝙻𝙸𝚂𝙸𝚂

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛 𝚎𝚕 𝚎𝚜𝚌𝚊𝚗𝚎𝚘.
> ✰ 𝙴𝚛𝚛𝚘𝚛: ${error?.message || 'Desconocido'}

> ✰ 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )
  }
}

handler.help = [
  'errores',
  'checkplugins',
  'scan',
  'linter'
]

handler.command = [
  'errores',
  'checkplugins',
  'scan',
  'linter'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler