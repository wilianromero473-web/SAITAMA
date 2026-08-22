import fs from 'fs'
import path from 'path'
import config from '../../config.js'

function findFileRecursively(dir, fileName) {

  if (!fs.existsSync(dir)) {
    return null
  }

  const list =
    fs.readdirSync(
      dir,
      {
        withFileTypes: true
      }
    )

  for (const item of list) {

    const fullPath =
      path.join(
        dir,
        item.name
      )

    if (item.isDirectory()) {

      const found =
        findFileRecursively(
          fullPath,
          fileName
        )

      if (found) {
        return found
      }

    } else if (
      item.isFile() &&
      item.name === fileName
    ) {

      return fullPath

    }
  }

  return null
}

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

    if (!text?.trim()) {

      return m.reply(
`*✰ 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰*

> ✰ 𝚄𝚜𝚊: *${usedPrefix + command}* <nombre>

> ✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
> *${usedPrefix + command} eco-bal*`
      )

    }

    let fileName =
      text.trim()

    if (
      !fileName.endsWith('.js')
    ) {
      fileName += '.js'
    }

    const pluginsDir =
      path.resolve(
        process.cwd(),
        'plugins'
      )

    if (
      !fs.existsSync(
        pluginsDir
      )
    ) {

      return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ✰*

> ✰ 𝙽𝚘 𝚎𝚡𝚒𝚜𝚝𝚎 𝚕𝚊 𝚌𝚊𝚛𝚙𝚎𝚝𝚊 *plugins/*.`
      )

    }

    const filePath =
      findFileRecursively(
        pluginsDir,
        fileName
      )

    if (!filePath) {

      return m.reply(
`*✰ 𝙿𝙻𝚄𝙶𝙸𝙽 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾 ✰*

> ✰ 𝙽𝚘 𝚎𝚡𝚒𝚜𝚝𝚎 𝚗𝚒𝚗𝚐ú𝚗 𝚙𝚕𝚞𝚐𝚒𝚗 𝚌𝚘𝚗 𝚎𝚕 𝚗𝚘𝚖𝚋𝚛𝚎:

> ✰ *${fileName}*`
      )

    }

    const relPath =
      path
        .relative(
          pluginsDir,
          filePath
        )
        .replace(
          /\\/g,
          '/'
        )

    const fileBuffer =
      fs.readFileSync(
        filePath
      )

    const fileSize =
      (
        fs.statSync(
          filePath
        ).size / 1024
      ).toFixed(2)

    const caption =
`*✰ 𝙿𝙻𝚄𝙶𝙸𝙽 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾 ✰*

> ✰ 𝙰𝚛𝚌𝚑𝚒𝚟𝚘: *${fileName}*

> ✰ 𝚄𝚋𝚒𝚌𝚊𝚌𝚒ó𝚗:
> *plugins/${relPath}*

> ✰ 𝙿𝚎𝚜𝚘:
> *${fileSize} KB*

> ✰ 𝙴𝚜𝚝𝚊𝚍𝚘: 𝙴𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚍𝚘

> ✰ ${config.footer}`

    await conn.sendMessage(
      m.chat,
      {
        document: fileBuffer,
        mimetype: 'application/javascript',
        fileName,
        caption
      },
      {
        quoted: m
      }
    )

  } catch (error) {

    console.error(
      '[VERPLUGIN]',
      error?.message ||
      error
    )

    return m.reply(
`*✰ 𝙴𝚁𝚁𝙾𝚁 ✰*

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚘𝚋𝚝𝚎𝚗𝚎𝚛 𝚎𝚕 𝚙𝚕𝚞𝚐𝚒𝚗.

> ✰ ${error?.message || 'Error desconocido'}`
    )

  }
}

handler.help = [
  'verplugin <nombre>',
  'getplugin <nombre>',
  'getp <nombre>'
]

handler.tags = [
  'owner'
]

handler.command = [
  'verplugin',
  'getplugin',
  'getp'
]

handler.ownerOnly = true

export default handler