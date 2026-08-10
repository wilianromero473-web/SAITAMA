import axios from 'axios'

const handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command
  }
) => {

  let url = text ? text.trim() : ''

  // Obtener URL desde mensaje citado
  if (!url && m.quoted) {
    const quotedText =
      m.quoted.body ||
      m.quoted.text ||
      ''

    const match =
      quotedText.match(/https?:\/\/[^\s]+/i)

    if (match) {
      url = match[0]
    }
  }

  // Comprobar enlace
  if (!url) {
    return m.reply(
`*⌬┤ ❗ ├⌬ LINK REQUERIDO.*

> Ejemplo:
> *${usedPrefix}${command} https://f-droid.org/en/packages/com.termux/*`
    )
  }

  // Comprobar que sea F-Droid
  if (!url.includes('f-droid.org')) {
    return m.reply(
`*⌬┤ ❗ ├⌬ LINK INVÁLIDO.*

> Asegurate de que sea un link válido de F-Droid.`
    )
  }

  const chatId = m.chat

  // Reacción de espera
  await conn.sendMessage(
    chatId,
    {
      react: {
        text: '⏳',
        key: m.key
      }
    }
  ).catch(() => {})

  await m.reply(
`*⌬┤ ⏳ ├⌬ BUSCANDO APP.*

> Obteniendo información desde F-Droid...`
  )

  try {

    // API F-Droid
    const response = await axios.get(
      `https://api.vreden.my.id/api/v1/download/fdroid?url=${encodeURIComponent(url)}`,
      {
        timeout: 120000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
          Accept: 'application/json'
        }
      }
    )

    const app =
      response.data?.result

    if (!app) {
      throw new Error(
        'No se pudo obtener la información de la aplicación.'
      )
    }

    const latest =
      app.versions?.[0]

    // Información segura
    const name =
      app.name ||
      'Aplicación desconocida'

    const summary =
      app.summary ||
      'Sin descripción disponible'

    const description =
      app.description ||
      'Sin descripción disponible'

    const version =
      latest?.version ||
      '-'

    const added =
      latest?.added ||
      '-'

    const requirements =
      latest?.requirements ||
      '-'

    const size =
      latest?.size ||
      '-'

    // Enviar información
    await conn.sendMessage(
      chatId,
      {
        text:
`*⌬┤ 📱 ├⌬ ${name}*

> 📝 *Descripción:*
> ${summary}

> 📖 *Información:*
> _${description.slice(0, 500)}${description.length > 500 ? '...' : ''}_

> 🔖 *Versión:* ${version}
> 📅 *Fecha:* ${added}
> ⚙️ *Requisitos:* ${requirements}
> 📦 *Tamaño:* ${size}`
      },
      {
        quoted: m
      }
    )

    // Comprobar enlace APK
    if (!latest?.link) {
      await conn.sendMessage(
        chatId,
        {
          react: {
            text: '⚠️',
            key: m.key
          }
        }
      ).catch(() => {})

      return m.reply(
`*⌬┤ ⚠️ ├⌬ APK NO DISPONIBLE.*

> Se encontró la información de la aplicación, pero F-Droid no proporcionó un enlace de descarga.`
      )
    }

    // Enviar APK como documento
    await conn.sendMessage(
      chatId,
      {
        document: {
          url: latest.link
        },

        mimetype:
          'application/vnd.android.package-archive',

        fileName:
          `${name}-${version}.apk`,

        caption:
`*⌬┤ 📥 ├⌬ APK DESCARGADO*

> 📱 *Aplicación:* ${name}
> 🔖 *Versión:* ${version}
> 📦 *Fuente:* F-Droid`
      },
      {
        quoted: m
      }
    )

    // Reacción final
    await conn.sendMessage(
      chatId,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    ).catch(() => {})

  } catch (error) {

    console.error(
      '[F-DROID ERROR]',
      error?.response?.data ||
      error?.message ||
      error
    )

    await conn.sendMessage(
      chatId,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})

    return m.reply(
`*⌬┤ ❌ ├⌬ ERROR.*

> No se pudo obtener o descargar la aplicación desde F-Droid.

⚠️ ${error?.message || 'Error desconocido'}`
    )
  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURACIÓN DEL PLUGIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'fdroid <link>',
  'appinfo <link>'
]

handler.command = [
  'fdroid',
  'appinfo'
]

handler.tags = [
  'descargas'
]

handler.register = true

export default handler