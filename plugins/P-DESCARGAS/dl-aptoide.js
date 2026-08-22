import axios from 'axios'
import config from '../../config.js'

// ═════════════════════════════════════
// ✰ SAITAMABOT • APTOIDE
// ═════════════════════════════════════

global.aptoideCache = global.aptoideCache || {}

const APTOIDE_SEARCH =
  'https://luxinfinity.vercel.app/api/aptoide/search'

const APTOIDE_INFO =
  'https://luxinfinity.vercel.app/api/aptoide/info'


// ═════════════════════════════════════
// ✰ LIMPIAR NOMBRE
// ═════════════════════════════════════

function cleanFileName(name) {
  return String(name || 'Aplicacion')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
    || 'Aplicacion'
}


// ═════════════════════════════════════
// ✰ BUSCAR APLICACIONES
// ═════════════════════════════════════

async function searchAptoide(query) {
  const response = await axios.get(
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
    !Array.isArray(response.data?.data)
  ) {
    return []
  }

  return response.data.data
}


// ═════════════════════════════════════
// ✰ INFORMACIÓN DE APP
// ═════════════════════════════════════

async function getAppInfo(packageId) {
  const response = await axios.get(
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
// ✰ DESCARGAR APK
// ═════════════════════════════════════

async function downloadApk(url) {
  const response = await axios.get(
    url,
    {
      responseType: 'arraybuffer',
      timeout: 300000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,

      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
      }
    }
  )

  const buffer = Buffer.from(response.data)

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
// ✰ TARJETA DE APLICACIÓN
// ═════════════════════════════════════

async function sendAppCard(
  conn,
  m,
  results,
  index,
  usedPrefix
) {

  const app = results[index]

  if (!app) {
    return m.reply(
      `✰ 𝙽𝚘 𝚎𝚡𝚒𝚜𝚝𝚎 𝚎𝚜𝚎 𝚛𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘`
    )
  }

  const title =
    app.title ||
    app.name ||
    'Aplicación'

  const version =
    app.version ||
    'N/A'

  const size =
    app.size ||
    'N/A'

  const rating =
    app.rating ||
    'N/A'

  const packageId =
    app.id ||
    app.package ||
    app.packageName ||
    app.package_id ||
    'N/A'

  const thumbnail =
    app.thumb ||
    app.thumbnail ||
    app.image ||
    app.icon ||
    null


  const infoText =
`༺ ✰ 𝙰𝙿𝚃𝙾𝙸𝙳𝙴 ✰ ༻

> ✰ 𝙽𝚘𝚖𝚋𝚛𝚎: ${title}
> ✰ 𝙿𝚊𝚚𝚞𝚎𝚝𝚎: ${packageId}
> ✰ 𝚅𝚎𝚛𝚜𝚒ó𝚗: ${version}
> ✰ 𝚃𝚊𝚖𝚊ñ𝚘: ${size}
> ✰ 𝚁𝚊𝚝𝚒𝚗𝚐: ${rating}

༺ ✰ ${index + 1}/${results.length} ✰ ༻`


  // ═══════════════════════════════
  // ✰ BOTONES
  // ═══════════════════════════════

  const buttons = [
    {
      buttonId:
        `${usedPrefix}apkselect ${index}`,

      buttonText: {
        displayText:
          '✰ 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛'
      },

      type: 1
    },

    {
      buttonId:
        `${usedPrefix}apknext`,

      buttonText: {
        displayText:
          '✰ 𝚂𝚒𝚐𝚞𝚒𝚎𝚗𝚝𝚎'
      },

      type: 1
    }
  ]


  // ═══════════════════════════════
  // ✰ CON IMAGEN
  // ═══════════════════════════════

  if (thumbnail) {

    return conn.sendMessage(
      m.chat,
      {
        image: {
          url: thumbnail
        },

        caption: infoText,

        footer:
          config.botName ||
          'SaitamaBot',

        buttons,

        headerType: 4
      },
      {
        quoted: m
      }
    )
  }


  // ═══════════════════════════════
  // ✰ SIN IMAGEN
  // ═══════════════════════════════

  return conn.sendMessage(
    m.chat,
    {
      text: infoText,

      footer:
        config.botName ||
        'SaitamaBot',

      buttons,

      headerType: 1
    },
    {
      quoted: m
    }
  )
}


// ═════════════════════════════════════
// ✰ HANDLER
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

    const sender = m.sender


    // ═══════════════════════════════
    // ✰ SIGUIENTE
    // ═══════════════════════════════

    if (command === 'apknext') {

      const session =
        global.aptoideCache[sender]

      if (
        !session ||
        !session.results?.length
      ) {
        return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙱Ú𝚂𝚀𝚄𝙴𝙳𝙰 ✰ ༻

> ✰ 𝚄𝚜𝚊: ${usedPrefix}apk WhatsApp`
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
    // ✰ SELECCIONAR APK
    // ═══════════════════════════════

    if (command === 'apkselect') {

      const session =
        global.aptoideCache[sender]

      if (
        !session ||
        !session.results?.length
      ) {
        return m.reply(
          `༺ ✰ 𝙱ú𝚜𝚚𝚞𝚎𝚍𝚊 𝚎𝚡𝚙𝚒𝚛𝚊𝚍𝚊 ✰ ༻`
        )
      }

      const index =
        Number(
          String(text || '').trim()
        )

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= session.results.length
      ) {
        return m.reply(
          `༺ ✰ 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘 𝚒𝚗𝚟á𝚕𝚒𝚍𝚘 ✰ ༻`
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
          `༺ ✰ 𝙿𝚊𝚚𝚞𝚎𝚝𝚎 𝚒𝚗𝚟á𝚕𝚒𝚍𝚘 ✰ ༻`
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
`༺ ✰ 𝙰𝙿𝙺 ✰ ༻

> ✰ 𝙾𝚋𝚝𝚎𝚗𝚒𝚎𝚗𝚍𝚘 𝚒𝚗𝚏𝚘...
> ✰ ${selected.title || selected.name || 'Aplicación'}`
      )


      const info =
        await getAppInfo(packageId)

      if (!info) {
        throw new Error(
          'No se encontró información de la aplicación.'
        )
      }


      const downloadUrl =
        info.download ||
        info.dl ||
        info.url

      if (!downloadUrl) {
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
        'N/A'

      const thumb =
        info.thumb ||
        info.image ||
        info.icon ||
        selected.thumb ||
        selected.image ||
        null


      // ═══════════════════════════════
      // ✰ INFORMACIÓN
      // ═══════════════════════════════

      const appInfoText =
`༺ ✰ 𝙰𝙿𝙺 ✰ ༻

> ✰ 𝙽𝚘𝚖𝚋𝚛𝚎: ${title}
> ✰ 𝚅𝚎𝚛𝚜𝚒ó𝚗: ${version}
> ✰ 𝚃𝚊𝚖𝚊ñ𝚘: ${info.size || 'N/A'}
> ✰ 𝚁𝚊𝚝𝚒𝚗𝚐: ${info.rating || 'N/A'}
> ✰ 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚜: ${info.downloads || 'N/A'}
> ✰ 𝙰𝚗𝚍𝚛𝚘𝚒𝚍: ${info.min_android || 'N/A'}

༺ ✰ 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚗𝚍𝚘... ✰ ༻`


      if (thumb) {

        await conn.sendMessage(
          m.chat,
          {
            image: {
              url: thumb
            },

            caption:
              appInfoText
          },
          {
            quoted: m
          }
        )

      } else {

        await m.reply(
          appInfoText
        )
      }


      // ═══════════════════════════════
      // ✰ DESCARGAR
      // ═══════════════════════════════

      const apk =
        await downloadApk(
          downloadUrl
        )


      const fileName =
        `${cleanFileName(title)} v${cleanFileName(version)}.apk`


      // ═══════════════════════════════
      // ✰ ENVIAR APK
      // ═══════════════════════════════

      await conn.sendMessage(
        m.chat,
        {
          document: apk,

          mimetype:
            'application/vnd.android.package-archive',

          fileName,

          caption:
`༺ ✰ 𝙰𝙿𝙺 𝙻𝙸𝚂𝚃𝙾 ✰ ༻

> ✰ ${title}
> ✰ 𝚅𝚎𝚛𝚜𝚒ó𝚗: ${version}

✰ 𝙰𝚛𝚌𝚑𝚒𝚟𝚘 𝚕𝚒𝚜𝚝𝚘`
        },
        {
          quoted: m
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
    // ✰ BUSCAR
    // ═══════════════════════════════

    if (
      command === 'apk' ||
      command === 'aptoide'
    ) {

      const query =
        String(text || '').trim()

      if (!query) {
        return m.reply(
`༺ ✰ 𝙰𝙿𝚃𝙾𝙸𝙳𝙴 ✰ ༻

> ✰ 𝙴𝚜𝚌𝚛𝚒𝚋𝚎 𝚞𝚗𝚊 𝙰𝙿𝙺
> ✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘: ${usedPrefix}apk WhatsApp`
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
`༺ ✰ 𝙱Ú𝚂𝚀𝚄𝙴𝙳𝙰 ✰ ༻

> ✰ 𝙱𝚞𝚜𝚌𝚊𝚗𝚍𝚘: ${query}`
      )


      const results =
        await searchAptoide(
          query
        )


      if (!results.length) {
        return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 ✰ ༻

> ✰ 𝙽𝚘 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚍𝚘: ${query}`
        )
      }


      // ═══════════════════════════════
      // ✰ GUARDAR RESULTADOS
      // ═══════════════════════════════

      global.aptoideCache[sender] = {
        query,
        index: 0,
        results: results.slice(0, 10)
      }


      // ═══════════════════════════════
      // ✰ MOSTRAR
      // ═══════════════════════════════

      return sendAppCard(
        conn,
        m,
        global.aptoideCache[sender].results,
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
`༺ ✰ 𝙰𝙿𝚃𝙾𝙸𝙳𝙴 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛.

> ✰ ${String(
  error?.response?.data?.message ||
  error?.message ||
  'Error desconocido.'
).slice(0, 300)}`
    )
  }
}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
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