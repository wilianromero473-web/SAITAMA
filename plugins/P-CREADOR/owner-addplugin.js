import fs from 'fs'
import path from 'path'


// ═════════════════════════════════════
// ✦ SAITAMABOT • ADD PLUGIN
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
    // ✦ OBTENER DOCUMENTO
    // ═══════════════════════════════

    const q =
      m.quoted


    if (
      !q ||
      !q.msg?.fileName
    ) {

      return m.reply(
`༺ ✦ 𝙳𝙾𝙲𝚄𝙼𝙴𝙽𝚃𝙾 𝚁𝙴𝚀𝚄𝙴𝚁𝙸𝙳𝙾 ✦ ༻

> ✦ Responde a un archivo *.js* enviado como documento.

༺ ✦ 𝚄𝚂𝙾 ✦ ༻

> ✦ ${usedPrefix}${command} <carpeta>

༺ ✦ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✦ ༻

> ✦ ${usedPrefix}${command} convertidores
> ✦ ${usedPrefix}${command} owner`
      )

    }


    // ═══════════════════════════════
    // ✦ COMPROBAR EXTENSIÓN
    // ═══════════════════════════════

    const fileName =
      q.msg.fileName


    if (
      !fileName
        .toLowerCase()
        .endsWith('.js')
    ) {

      return m.reply(
`༺ ✦ 𝙵𝙾𝚁𝙼𝙰𝚃𝙾 𝙸𝙽𝚅𝙰́𝙻𝙸𝙳𝙾 ✦ ༻

> ✦ Solo se permiten archivos con extensión *.js*.

> ✦ Archivo recibido:
> *${fileName}*`
      )

    }


    // ═══════════════════════════════
    // ✦ CARPETA DESTINO
    // ═══════════════════════════════

    let folderPath =
      (text || '').trim()


    // Evitar que la ruta empiece con /

    if (
      folderPath.startsWith('/')
    ) {

      folderPath =
        folderPath.slice(1)

    }


    // Evitar rutas absolutas

    folderPath =
      folderPath.replace(
        /^[/\\]+/,
        ''
      )


    // ═══════════════════════════════
    // ✦ RUTA DEL PLUGIN
    // ═══════════════════════════════

    const pluginsPath =
      path.resolve(
        process.cwd(),
        'plugins'
      )


    const destPath =
      path.resolve(
        pluginsPath,
        folderPath,
        fileName
      )


    // ═══════════════════════════════
    // ✦ SEGURIDAD DE RUTA
    // ═══════════════════════════════

    const relativeTarget =
      path.relative(
        pluginsPath,
        destPath
      )


    if (
      relativeTarget.startsWith('..') ||
      path.isAbsolute(relativeTarget)
    ) {

      return m.reply(
`༺ ✦ 𝚁𝚄𝚃𝙰 𝙽𝙾 𝙿𝙴𝚁𝙼𝙸𝚃𝙸𝙳𝙰 ✦ ༻

> ✦ La carpeta indicada está fuera de la carpeta *plugins*.

> ✦ Usa solamente rutas internas de plugins.`
      )

    }


    // ═══════════════════════════════
    // ✦ CREAR CARPETA
    // ═══════════════════════════════

    fs.mkdirSync(
      path.dirname(destPath),
      {
        recursive: true
      }
    )


    // ═══════════════════════════════
    // ✦ PROCESANDO
    // ═══════════════════════════════

    await m.reply(
`༺ ✦ 𝙸𝙽𝚂𝚃𝙰𝙻𝙰𝙽𝙳𝙾 𝙿𝙻𝚄𝙶𝙸𝙽 ✦ ༻

> ✦ 📦 Archivo: *${fileName}*
> ✦ 📁 Destino: *plugins/${folderPath || 'raíz'}*
> ✦ ⏳ Descargando archivo...`
    )


    // ═══════════════════════════════
    // ✦ DESCARGAR ARCHIVO
    // ═══════════════════════════════

    const buffer =
      await q.download()


    if (
      !buffer ||
      !buffer.length
    ) {

      throw new Error(
        'No se pudo descargar el archivo.'
      )

    }


    // ═══════════════════════════════
    // ✦ GUARDAR PLUGIN
    // ═══════════════════════════════

    fs.writeFileSync(
      destPath,
      buffer
    )


    // ═══════════════════════════════
    // ✦ RUTA RELATIVA
    // ═══════════════════════════════

    const relPath =
      path
        .relative(
          process.cwd(),
          destPath
        )
        .replace(/\\/g, '/')


    // ═══════════════════════════════
    // ✦ RESPUESTA FINAL
    // ═══════════════════════════════

    return m.reply(
`༺ ✦ 𝙿𝙻𝚄𝙶𝙸𝙽 𝙸𝙽𝚂𝚃𝙰𝙻𝙰𝙳𝙾 ✦ ༻

> ✦ 📦 *Archivo:* ${fileName}
> ✦ 📁 *Ubicación:* ${relPath}

༺ ✦ 𝙴𝚂𝚃𝙰𝙳𝙾 ✦ ༻

> ✦ El plugin fue guardado correctamente.
> ✦ Puedes usar tu comando de *reload* para cargarlo inmediatamente si el bot no está en modo desarrollo.`
    )

  } catch (error) {

    console.error(
      '[ADDPLUGIN]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✦ 𝙴𝚁𝚁𝙾𝚁 ✦ ༻

> ✦ No se pudo instalar el plugin.

> ✦ ${error?.message || 'Error desconocido.'}`
    )

  }

}


// ═════════════════════════════════════
// ✦ CONFIGURACIÓN DEL PLUGIN
// ═════════════════════════════════════

handler.help = [
  'addplugin <carpeta>',
  'saveplugin <carpeta>',
  'addp <carpeta>'
]

handler.command = [
  'addplugin',
  'saveplugin',
  'addp'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler