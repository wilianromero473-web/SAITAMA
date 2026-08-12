import axios from 'axios'
import config from '../../config.js'

// ═════════════════════════════════════
// 📱 SAITAMABOT • APTOIDE SEARCH
// ═════════════════════════════════════

// Cache de búsquedas
global.aptoideCache =
  global.aptoideCache || {}

// API
const APTOIDE_SEARCH =
  'https://luxinfinity.vercel.app/api/aptoide/search'

const APTOIDE_INFO =
  'https://luxinfinity.vercel.app/api/aptoide/info'


// ═════════════════════════════════════
// 🧹 LIMPIAR NOMBRE
// ═════════════════════════════════════

function cleanFileName(name) {

  return String(
    name || 'Aplicacion'
  )
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .slice(0, 120)
    || 'Aplicacion'
}


// ═════════════════════════════════════
// 🔎 BUSCAR APLICACIONES
// ═════════════════════════════════════

async function searchAptoide(query) {

  const response =
    await axios.get(
      APTOIDE_SEARCH,
      {
        params: {
          query,
          limit: 10
        },

        timeout: 60000
      }
    )

  if (
    !response.data?.status ||
    !Array.isArray(
      response.data?.data
    )
  ) {

    return []
  }

  return response.data.data
}


// ═════════════════════════════════════
// 📱 INFORMACIÓN DE APP
// ═════════════════════════════════════

async function getAppInfo(packageId) {

  const response =
    await axios.get(
      APTOIDE_INFO,
      {
        params: {
          query: packageId
        },

        timeout: 60000
      }
    )

  if (
    !response.data?.status ||
    !response.data?.data
  ) {

    return null
  }

  return response.data.data
}


// ═════════════════════════════════════
// 📥 DESCARGAR APK
// ═════════════════════════════════════

async function downloadApk(url) {

  const response =
    await axios.get(
      url,
      {
        responseType:
          'arraybuffer',

        timeout:
          300000,

        maxContentLength:
          Infinity,

        maxBodyLength:
          Infinity,

        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
        }
      }
    )

  const buffer =
    Buffer.from(
      response.data
    )

  if (
    !buffer.length ||
    buffer.length < 1000
  ) {

    throw new Error(
      'El archivo APK está vacío o es inválido.'
    )
  }

  return buffer
}


// ═════════════════════════════════════
// 📱 ENVIAR INFORMACIÓN + BOTONES
// ═════════════════════════════════════

async function sendAppCard(
  conn,
  m,
  results,
  index,
  usedPrefix
) {

  const app =
    results[index]

  if (!app) {

    return m.reply(
      '❌ No existe ese resultado.'
    )
  }


  const title =
    app.title ||
    app.name ||
    'Aplicación'


  const version =
    app.version ||
    'Desconocida'


  const size =
    app.size ||
    'Desconocido'


  const rating =
    app.rating ||
    'Sin rating'


  const packageId =
    app.id ||
    app.package ||
    app.packageName ||
    app.package_id ||
    ''


  const thumbnail =
    app.thumb ||
    app.thumbnail ||
    app.image ||
    app.icon ||
    null


  const infoText =
`╭━━━〔 📱 𝐀𝐏𝐓𝐎𝐈𝐃𝐄 〕━━━⬣
┃
┃ ✦ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍
┃
┃ 📱 𝐍𝐨𝐦𝐛𝐫𝐞 ❯ ${title}
┃ 📦 𝐏𝐚𝐪𝐮𝐞𝐭𝐞 ❯ ${packageId || 'Desconocido'}
┃ 🔖 𝐕𝐞𝐫𝐬𝐢ó𝐧 ❯ ${version}
┃ ⚖️ 𝐓𝐚𝐦𝐚ñ𝐨 ❯ ${size}
┃ ⭐ 𝐑𝐚𝐭𝐢𝐧𝐠 ❯ ${rating}
┃
┃ ✧ 𝐑𝐞𝐬𝐮𝐥𝐭𝐚𝐝𝐨 ❯ ${index + 1}/${results.length}
┃
┃ ╰─➤ 𝐄𝐥𝐢𝐠𝐞 𝐮𝐧𝐚 𝐨𝐩𝐜𝐢ó𝐧
┃
╰━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`


  // ═══════════════════════════════
  // 🔘 BOTONES
  // ═══════════════════════════════

  const buttons = [

    {
      buttonId:
        `${usedPrefix}apkselect ${index}`,

      buttonText: {
        displayText:
          `📥 Descargar APK`
      },

      type: 1
    },

    {
      buttonId:
        `${usedPrefix}apknext`,

      buttonText: {
        displayText:
          `➡️ Siguiente`
      },

      type: 1
    }

  ]


  // ═══════════════════════════════
  // 🖼️ CON IMAGEN
  // ═══════════════════════════════

  if (thumbnail) {

    return conn.sendMessage(

      m.chat,

      {
        image: {
          url: thumbnail
        },

        caption:
          infoText,

        footer:
          config.botName ||
          'SaitamaBot',

        buttons,

        headerType:
          4
      },

      {
        quoted:
          m
      }

    )

  }


  // ═══════════════════════════════
  // 📝 SIN IMAGEN
  // ═══════════════════════════════

  return conn.sendMessage(

    m.chat,

    {
      text:
        infoText,

      footer:
        config.botName ||
        'SaitamaBot',

      buttons,

      headerType:
        1
    },

    {
      quoted:
        m
    }

  )
}


// ═════════════════════════════════════
// 🎵 HANDLER
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

    const sender =
      m.sender


    // ═══════════════════════════════
    // ➡️ SIGUIENTE
    // ═══════════════════════════════

    if (
      command === 'apknext'
    ) {

      const session =
        global.aptoideCache[
          sender
        ]


      if (
        !session ||
        !session.results?.length
      ) {

        return m.reply(
`╭━━━〔 ❌ SIN BÚSQUEDA 〕━━━⬣

No hay una búsqueda activa.

Usa:

${usedPrefix}apk WhatsApp

╰━━━━━━━━━━━━━━━━━━⬣`
        )
      }


      session.index++


      if (
        session.index >=
        session.results.length
      ) {

        session.index = 0
      }


      return sendAppCard(
        conn,
        m,
        session.results,
        session.index,
        usedPrefix
      )
    }


    // ═══════════════════════════════
    // 📥 DESCARGAR RESULTADO
    // ═══════════════════════════════

    if (
      command === 'apkselect'
    ) {

      const session =
        global.aptoideCache[
          sender
        ]


      if (
        !session ||
        !session.results?.length
      ) {

        return m.reply(
          '❌ La búsqueda expiró. Realiza otra búsqueda.'
        )
      }


      const index =
        Number(
          String(text || '')
            .trim()
        )


      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= session.results.length
      ) {

        return m.reply(
          '❌ Resultado inválido.'
        )
      }


      const selected =
        session.results[index]


      const packageId =
        selected.id ||
        selected.package ||
        selected.packageName ||
        selected.package_id


      if (!packageId) {

        return m.reply(
          '❌ Esta aplicación no tiene un identificador válido.'
        )
      }


      await conn.sendMessage(

        m.chat,

        {
          react: {
            text: '⏳',
            key: m.key
          }
        }

      ).catch(() => {})


      await m.reply(
`╭━━━〔 📱 𝐀𝐏𝐓𝐎𝐈𝐃𝐄 〕━━━⬣

⏳ Obteniendo información de la aplicación...

📱 ${selected.title || selected.name || 'Aplicación'}

╰━━━━━━━━━━━━━━━━━━⬣`
      )


      const info =
        await getAppInfo(
          packageId
        )


      if (
        !info
      ) {

        throw new Error(
          'No se encontró información de la aplicación.'
        )
      }


      const downloadUrl =
        info.download ||
        info.dl ||
        info.url


      if (
        !downloadUrl
      ) {

        throw new Error(
          'La aplicación no tiene una descarga disponible.'
        )
      }


      const title =
        info.title ||
        info.name ||
        selected.title ||
        'Aplicación'


      const version =
        info.version ||
        selected.version ||
        'Desconocida'


      const thumb =
        info.thumb ||
        info.image ||
        info.icon ||
        selected.thumb ||
        selected.image ||
        null


      // ═══════════════════════════════
      // 🖼️ INFORMACIÓN
      // ═══════════════════════════════

      if (thumb) {

        await conn.sendMessage(

          m.chat,

          {
            image: {
              url:
                thumb
            },

            caption:
`╭━━━〔 📱 𝐀𝐏𝐏 〕━━━⬣

📱 *${title}*

🔖 *Versión:* ${version}
⚖️ *Tamaño:* ${info.size || 'Desconocido'}
⭐ *Rating:* ${info.rating || 'Sin rating'}
📥 *Descargas:* ${info.downloads || 'Desconocidas'}
📱 *Android:* ${info.min_android || 'Desconocido'}
🏗️ *Arquitectura:* ${info.arch || 'Desconocida'}

⏳ Descargando APK...

🌸 ${config.botName || 'SaitamaBot'}`
          },

          {
            quoted:
              m
          }

        )

      } else {

        await m.reply(
`📱 *${title}*

🔖 Versión: ${version}

⏳ Descargando APK...`
        )
      }


      // ═══════════════════════════════
      // 📥 DESCARGAR
      // ═══════════════════════════════

      const apk =
        await downloadApk(
          downloadUrl
        )


      const fileName =
        `${cleanFileName(title)} v${cleanFileName(version)}.apk`


      // ═══════════════════════════════
      // 📤 ENVIAR APK
      // ═══════════════════════════════

      await conn.sendMessage(

        m.chat,

        {

          document:
            apk,

          mimetype:
            'application/vnd.android.package-archive',

          fileName,

          caption:
`╭━━━〔 ✅ 𝐀𝐏𝐊 𝐋𝐈𝐒𝐓𝐎 〕━━━⬣

📱 *${title}*

🔖 *Versión:* ${version}

📦 Archivo APK listo.

🌸 ${config.botName || 'SaitamaBot'}`
        },

        {
          quoted:
            m
        }

      )


      await conn.sendMessage(

        m.chat,

        {
          react: {
            text: '✅',
            key: m.key
          }
        }

      ).catch(() => {})


    }


    // ═══════════════════════════════
    // 🔎 BUSCAR
    // ═══════════════════════════════

    if (
      command === 'apk' ||
      command === 'aptoide'
    ) {

      const query =
        String(
          text || ''
        ).trim()


      if (!query) {

        return m.reply(
`╭━━━〔 📱 𝐀𝐏𝐓𝐎𝐈𝐃𝐄 〕━━━⬣

❌ Escribe el nombre de una aplicación.

✧ Ejemplo:

${usedPrefix}apk WhatsApp

╰━━━━━━━━━━━━━━━━━━⬣`
        )
      }


      await conn.sendMessage(

        m.chat,

        {
          react: {
            text: '🔎',
            key: m.key
          }
        }

      ).catch(() => {})


      await m.reply(
`╭━━━〔 🔎 𝐁Ú𝐒𝐐𝐔𝐄𝐃𝐀 〕━━━⬣

🔍 Buscando aplicaciones...

📱 Consulta:
${query}

⏳ Espera un momento...`
      )


      const results =
        await searchAptoide(
          query
        )


      if (
        !results.length
      ) {

        return m.reply(
`╭━━━〔 ❌ SIN RESULTADOS 〕━━━⬣

No encontré aplicaciones para:

📱 *${query}*

Intenta con otro nombre.

╰━━━━━━━━━━━━━━━━━━⬣`
        )
      }


      // ═══════════════════════════════
      // 💾 GUARDAR BÚSQUEDA
      // ═══════════════════════════════

      global.aptoideCache[
        sender
      ] = {

        query,

        index:
          0,

        results:
          results.slice(0, 10)
      }


      // ═══════════════════════════════
      // 📱 MOSTRAR PRIMER RESULTADO
      // ═══════════════════════════════

      return sendAppCard(

        conn,

        m,

        global.aptoideCache[
          sender
        ].results,

        0,

        usedPrefix

      )
    }

  } catch (error) {

    console.error(
      '[APTOIDE]',
      error?.response?.data ||
      error?.message ||
      error
    )


    await conn.sendMessage(

      m.chat,

      {
        react: {
          text: '❌',
          key: m.key
        }
      }

    ).catch(() => {})


    return m.reply(
`╭━━━〔 ❌ 𝐀𝐏𝐓𝐎𝐈𝐃𝐄 𝐄𝐑𝐑𝐎𝐑 〕━━━⬣

No se pudo completar la operación.

⚠️ ${String(
  error?.response?.data?.message ||
  error?.message ||
  'Error desconocido.'
).slice(0, 500)}

╰━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`
    )
  }
}


// ═════════════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'apk <nombre>',
  'aptoide <nombre>',
  'apknext',
  'apkselect <número>'
]

handler.tags = [
  'descargas'
]

handler.command = [
  'apk',
  'aptoide',
  'apknext',
  'apkselect'
]

export default handler