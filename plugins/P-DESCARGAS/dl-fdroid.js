import axios from 'axios'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ༺ 𝙵-𝙳𝚁𝙾𝙸𝙳 ༻
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const F_DROID_API =
  'https://api.vreden.my.id/api/v1/download/fdroid'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 OBTENER URL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getUrl(m, text = '') {

  let url =
    String(text || '').trim()

  if (!url && m.quoted) {

    const quotedText =
      m.quoted.body ||
      m.quoted.text ||
      ''

    const match =
      quotedText.match(
        /https?:\/\/[^\s]+/i
      )

    if (match) {
      url = match[0]
    }
  }

  return url.replace(
    /[)\]}>,]+$/g,
    ''
  )
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔎 VALIDAR F-DROID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function isFDroidUrl(url) {

  return /^https?:\/\/(?:www\.)?f-droid\.org\//i
    .test(url)

}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧹 NOMBRE SEGURO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
    .slice(0, 100)
    || 'Aplicacion'
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command
  }
) => {

  const chatId =
    m.chat

  const url =
    getUrl(
      m,
      text
    )


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ❌ SIN LINK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!url) {

    return m.reply(
`༺ 𝙵-𝙳𝚁𝙾𝙸𝙳 ༻

✰ 𝙻𝚒𝚗𝚔 𝚛𝚎𝚚𝚞𝚎𝚛𝚒𝚍𝚘

> ✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
> ${usedPrefix}${command} https://f-droid.org/en/packages/com.termux/`
    )
  }


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ❌ LINK INVÁLIDO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!isFDroidUrl(url)) {

    return m.reply(
`༺ 𝙵-𝙳𝚁𝙾𝙸𝙳 ༻

✰ 𝙻𝚒𝚗𝚔 𝚒𝚗𝚟𝚊́𝚕𝚒𝚍𝚘

> ✰ 𝚄𝚜𝚊 𝚞𝚗 𝚕𝚒𝚗𝚔 𝚍𝚎 𝙵-𝙳𝚛𝚘𝚒𝚍.`
    )
  }


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏳ REACCIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
`༺ 𝙵-𝙳𝚁𝙾𝙸𝙳 ༻

✰ 𝙾𝚋𝚝𝚎𝚗𝚒𝚎𝚗𝚍𝚘 𝚒𝚗𝚏𝚘𝚛𝚖𝚊𝚌𝚒𝚘́𝚗...`
  )


  try {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌐 API
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const response =
      await axios.get(
        `${F_DROID_API}?url=${encodeURIComponent(url)}`,
        {
          timeout: 120000,

          headers: {
            'User-Agent':
              USER_AGENT,

            Accept:
              'application/json'
          }
        }
      )


    const app =
      response.data?.result


    if (!app) {

      throw new Error(
        'No se encontró la aplicación.'
      )
    }


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📱 DATOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const latest =
      app.versions?.[0]


    const name =
      app.name ||
      'Aplicación'


    const summary =
      app.summary ||
      'Sin descripción'


    const description =
      app.description ||
      'Sin información'


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


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📱 INFORMACIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const shortDescription =
      description
        .replace(/\s+/g, ' ')
        .slice(0, 300)


    await conn.sendMessage(
      chatId,
      {
        text:
`༺ 𝙵-𝙳𝚁𝙾𝙸𝙳 ༻

✰ 𝙽𝚘𝚖𝚋𝚛𝚎: ${name}
✰ 𝚅𝚎𝚛𝚜𝚒𝚘́𝚗: ${version}
✰ 𝚃𝚊𝚖𝚊𝚗̃𝚘: ${size}
✰ 𝙵𝚎𝚌𝚑𝚊: ${added}
✰ 𝚁𝚎𝚚𝚞𝚒𝚜𝚒𝚝𝚘𝚜: ${requirements}

✰ 𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚌𝚒𝚘́𝚗:
> ${summary}

✰ 𝙸𝚗𝚏𝚘:
> ${shortDescription}${description.length > 300 ? '...' : ''}`
      },
      {
        quoted: m
      }
    )


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ SIN APK
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
`༺ 𝙵-𝙳𝚁𝙾𝙸𝙳 ༻

✰ 𝙰𝙿𝙺 𝚗𝚘 𝚍𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎

> ✰ 𝙽𝚘 𝚑𝚊𝚢 𝚎𝚗𝚕𝚊𝚌𝚎 𝚍𝚎 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊.`
      )
    }


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📥 ENVIAR APK
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await conn.sendMessage(
      chatId,
      {
        document: {
          url: latest.link
        },

        mimetype:
          'application/vnd.android.package-archive',

        fileName:
          `${cleanFileName(name)}-${cleanFileName(version)}.apk`,

        caption:
`༺ 𝙰𝙿𝙺 𝙻𝙸𝚂𝚃𝙾 ༻

✰ 𝙽𝚘𝚖𝚋𝚛𝚎: ${name}
✰ 𝚅𝚎𝚛𝚜𝚒𝚘́𝚗: ${version}
✰ 𝙵𝚞𝚎𝚗𝚝𝚎: 𝙵-𝙳𝚛𝚘𝚒𝚍`
      },
      {
        quoted: m
      }
    )


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ FINAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await conn.sendMessage(
      chatId,
      {
        react: {
          text: '✰',
          key: m.key
        }
      }
    ).catch(() => {})


  } catch (error) {

    console.error(
      '[F-DROID]',
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
`༺ 𝙵-𝙳𝚁𝙾𝙸𝙳 ༻

✰ 𝙴𝚛𝚛𝚘𝚛

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚘𝚋𝚝𝚎𝚗𝚎𝚛 𝚕𝚊 𝚊𝚙𝚕𝚒𝚌𝚊𝚌𝚒𝚘́𝚗.

> ✰ ${String(
  error?.message ||
  'Error desconocido'
).slice(0, 300)}`
    )
  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  '𝚏𝚍𝚛𝚘𝚒𝚍 <𝚕𝚒𝚗𝚔>',
  '𝚊𝚙𝚙𝚒𝚗𝚏𝚘 <𝚕𝚒𝚗𝚔>'
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