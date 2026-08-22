import fs from 'fs'
import path from 'path'
import config from '../../config.js'

// ═══════════════════════════════════════
// ✰ SAITAMABOT • LIMPIAR CACHÉ
// ═══════════════════════════════════════

const SUBBOT_DIR = path.resolve(
  './sessions/subbots'
)

// ═══════════════════════════════════════
// ✰ LIMPIAR ARCHIVOS TEMPORALES
// ═══════════════════════════════════════

async function limpiarTmp() {

  let count = 0

  const tmpPath =
    path.resolve(
      process.cwd(),
      'tmp'
    )

  if (!fs.existsSync(tmpPath)) {
    return count
  }

  for (
    const file of fs.readdirSync(tmpPath)
  ) {

    const fp =
      path.join(
        tmpPath,
        file
      )

    try {

      if (
        fs.statSync(fp).isFile()
      ) {

        fs.unlinkSync(fp)
        count++

      }

    } catch {}

  }

  return count
}

// ═══════════════════════════════════════
// ✰ LIMPIAR KEYS DE UNA SESIÓN
// ═══════════════════════════════════════

async function limpiarKeys(
  sessionPath
) {

  let count = 0

  if (
    !fs.existsSync(sessionPath)
  ) {
    return count
  }

  for (
    const key of fs.readdirSync(sessionPath)
  ) {

    // ✰ Archivos que NO deben eliminarse
    if (
      key === 'creds.json' ||
      key === '.paused'
    ) {
      continue
    }

    const fp =
      path.join(
        sessionPath,
        key
      )

    try {

      const st =
        fs.statSync(fp)

      // ✰ Archivo
      if (st.isFile()) {

        fs.unlinkSync(fp)
        count++

      }

      // ✰ Carpeta
      else if (
        st.isDirectory()
      ) {

        fs.rmSync(
          fp,
          {
            recursive: true,
            force: true
          }
        )

        count++

      }

    } catch {}

  }

  return count
}

// ═══════════════════════════════════════
// ✰ HANDLER
// ═══════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    text
  }
) => {

  // ✰ Reacción inicial
  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  )

  const arg =
    text?.trim().toLowerCase()

  try {

    // ═══════════════════════════════
    // ✰ LIMPIAR TMP
    // ═══════════════════════════════

    const tmpBorrados =
      await limpiarTmp()

    let keysBorradas = 0
    let detalle = ''

    // ═══════════════════════════════
    // ✰ LIMPIAR SUB-BOT ESPECÍFICO
    // ═══════════════════════════════

    if (
      arg &&
      arg !== 'all' &&
      arg !== 'todo'
    ) {

      const numero =
        arg.replace(/\D/g, '')

      const sessionPath =
        path.join(
          SUBBOT_DIR,
          numero
        )

      if (
        !fs.existsSync(sessionPath)
      ) {

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
`༺ ✰ 𝚂𝚄𝙱-𝙱𝙾𝚃 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾 ✰ ༻

> ✰ No existe una sesión para:
> *+${numero}*

༺ ✰ 𝚄𝚂𝙾 ✰ ༻

> *ds <número>*
> *ds all*`
        )
      }

      keysBorradas =
        await limpiarKeys(
          sessionPath
        )

      detalle =
`༺ ✰ 𝚂𝚄𝙱-𝙱𝙾𝚃 𝙻𝙸𝙼𝙿𝙸𝙰𝙳𝙾 ✰ ༻

> ✰ *Número:* +${numero}
> ✰ *Keys eliminadas:* ${keysBorradas} archivos
> ✰ *creds.json:* Conservado
> ✰ *.paused:* Conservado`

    }

    // ═══════════════════════════════
    // ✰ LIMPIAR TODOS LOS SUB-BOTS
    // ═══════════════════════════════

    else if (
      arg === 'all' ||
      arg === 'todo'
    ) {

      let subbotsCleaned = 0

      if (
        fs.existsSync(
          SUBBOT_DIR
        )
      ) {

        for (
          const carpeta of
          fs.readdirSync(SUBBOT_DIR)
        ) {

          const sp =
            path.join(
              SUBBOT_DIR,
              carpeta
            )

          try {

            if (
              fs.statSync(sp).isDirectory()
            ) {

              keysBorradas +=
                await limpiarKeys(sp)

              subbotsCleaned++

            }

          } catch {}

        }
      }

      detalle =
`༺ ✰ 𝚂𝚄𝙱-𝙱𝙾𝚃𝚂 𝙻𝙸𝙼𝙿𝙸𝙰𝙳𝙾𝚂 ✰ ༻

> ✰ *Sub-bots:* ${subbotsCleaned}
> ✰ *Keys eliminadas:* ${keysBorradas} archivos
> ✰ *creds.json:* Todos conservados
> ✰ *.paused:* Todos conservados`

    }

    // ═══════════════════════════════
    // ✰ LIMPIAR SESIÓN PRINCIPAL
    // ═══════════════════════════════

    else {

      const mainSession =
        path.resolve(
          './sessions/main'
        )

      keysBorradas =
        await limpiarKeys(
          mainSession
        )

      detalle =
`༺ ✰ 𝚂𝙴𝚂𝙸Ó𝙽 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻 ✰ ༻

> ✰ *Keys eliminadas:* ${keysBorradas} archivos
> ✰ *creds.json:* Conservado
> ✰ La sesión principal permanece intacta.`
    }

    // ═══════════════════════════════
    // ✰ RESULTADO
    // ═══════════════════════════════

    const txt =
`╔═══⌦ ✰ 𝙲𝙰𝙲𝙷É 𝙻𝙸𝙼𝙿𝙸𝙰𝙳𝙾 ✰ ⌫═══╗

> ✰ *Temporales:* ${tmpBorrados} archivos

${detalle}

╚══⌦ ✰ ${config.footer} ⌫══╝`

    // ✰ Reacción de éxito
    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    )

    return m.reply(txt)

  } catch (e) {

    console.error(
      '[CLEARCACHE]',
      e?.message || e
    )

    // ✰ Reacción de error
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
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 𝙰𝙻 𝙻𝙸𝙼𝙿𝙸𝙰𝚁 ✰ ༻

> ✰ No se pudo completar la limpieza.
> ✰ Error: ${e.message}`
    )
  }
}

// ═══════════════════════════════════════
// ✰ CONFIGURACIÓN DEL PLUGIN
// ═══════════════════════════════════════

handler.help = [
  'ds [número|all]',
  'clearcache [número|all]',
  'limpiarcache [número|all]'
]

handler.command = [
  'ds',
  'clearcache',
  'limpiarcache',
  'borrartmp'
]

handler.tags = [
  'owner'
]

handler.ownerOnly = true

export default handler