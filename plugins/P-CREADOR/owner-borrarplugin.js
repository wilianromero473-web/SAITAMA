import fs from 'fs'
import path from 'path'


// ═════════════════════════════════════
// ✦ SAITAMABOT • DELETE PLUGIN
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✦ BUSCAR PLUGIN RECURSIVAMENTE
// ═════════════════════════════════════

function findFileRecursively(
  dir,
  fileName
) {

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


    // ✦ Entrar en subcarpetas

    if (
      item.isDirectory()
    ) {

      const found =
        findFileRecursively(
          fullPath,
          fileName
        )

      if (found) {
        return found
      }

    }


    // ✦ Plugin encontrado

    else if (
      item.name === fileName
    ) {

      return fullPath

    }

  }

  return null

}


// ═════════════════════════════════════
// ✦ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    text,
    usedPrefix,
    command
  }
) => {

  try {

    // ═══════════════════════════════
    // ✦ VERIFICAR NOMBRE
    // ═══════════════════════════════

    if (
      !text?.trim()
    ) {

      return m.reply(
`༺ ✦ 𝙽𝙾𝙼𝙱𝚁𝙴 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙾 ✦ ༻

> ✦ Debes indicar el nombre del plugin que quieres eliminar.

༺ ✦ 𝚄𝚂𝙾 ✦ ༻
> ✦ ${usedPrefix}${command} <nombre>
༺ ✦ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✦ ༻
> ✦ ${usedPrefix}${command} eco-bal`
      )

    }


    // ═══════════════════════════════
    // ✦ PREPARAR NOMBRE
    // ═══════════════════════════════

    let fileName =
      text.trim()


    if (
      !fileName
        .toLowerCase()
        .endsWith('.js')
    ) {

      fileName += '.js'

    }


    // ═══════════════════════════════
    // ✦ CARPETA DE PLUGINS
    // ═══════════════════════════════

    const pluginsDir =
      path.resolve(
        process.cwd(),
        'plugins'
      )


    // ═══════════════════════════════
    // ✦ VERIFICAR CARPETA
    // ═══════════════════════════════

    if (
      !fs.existsSync(
        pluginsDir
      )
    ) {

      return m.reply(
`༺ ✦ 𝙿𝙻𝚄𝙶𝙸𝙽𝚂 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾𝚂 ✦ ༻

> ✦ La carpeta *plugins* no existe.`
      )

    }


    // ═══════════════════════════════
    // ✦ BUSCAR PLUGIN
    // ═══════════════════════════════

    const filePath =
      findFileRecursively(
        pluginsDir,
        fileName
      )


    if (!filePath) {

      return m.reply(
`༺ ✦ 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾 ✦ ༻

> ✦ No existe ningún plugin llamado:
> ✦ *${fileName}*
> ✦ Revisa el nombre e inténtalo nuevamente.`
      )

    }


    // ═══════════════════════════════
    // ✦ CONFIRMAR QUE ESTÁ EN PLUGINS
    // ═══════════════════════════════

    const relativeCheck =
      path.relative(
        pluginsDir,
        filePath
      )


    if (
      relativeCheck.startsWith('..') ||
      path.isAbsolute(
        relativeCheck
      )
    ) {

      return m.reply(
`༺ ✦ 𝚁𝚄𝚃𝙰 𝙽𝙾 𝙿𝙴𝚁𝙼𝙸𝚃𝙸𝙳𝙰 ✦ ༻

> ✦ El archivo está fuera de la carpeta *plugins*.`
      )

    }


    // ═══════════════════════════════
    // ✦ INFORMACIÓN
    // ═══════════════════════════════

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


    await m.reply(
`༺ ✦ 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙽𝙳𝙾 𝙿𝙻𝚄𝙶𝙸𝙽 ✦ ༻

> ✦ 📦 *Archivo:* ${fileName}
> ✦ 📁 *Ubicación:* plugins/${relPath}

> ✦ ⏳ Eliminando archivo...`
    )


    // ═══════════════════════════════
    // ✦ ELIMINAR
    // ═══════════════════════════════

    fs.unlinkSync(
      filePath
    )


    // ═══════════════════════════════
    // ✦ RESPUESTA FINAL
    // ═══════════════════════════════

    return m.reply(
`༺ ✦ 𝙿𝙻𝚄𝙶𝙸𝙽 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾 ✦ ༻

> ✦ 🗑️ *Plugin:* ${fileName}
> ✦ 📁 *Ruta:* plugins/${relPath}

༺ ✦ 𝙴𝚂𝚃𝙰𝙳𝙾 ✦ ༻

> ✦ El plugin fue eliminado correctamente.

> ✦ Si el bot está en modo producción, utiliza tu comando *reload* para actualizar la memoria.`
    )

  } catch (error) {

    console.error(
      '[DELETE PLUGIN]',
      error?.message ||
      error
    )

    return m.reply(
`༺ ✦ 𝙴𝚁𝚁𝙾𝚁 ✦ ༻

> ✦ No se pudo eliminar el plugin.

> ✦ ${error?.message || 'Error desconocido.'}`
    )

  }

}


// ═════════════════════════════════════
// ✦ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'borrarplugin <nombre>',
  'delplugin <nombre>',
  'delp <nombre>'
]

handler.command = [
  'borrarplugin',
  'delplugin',
  'delp'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler