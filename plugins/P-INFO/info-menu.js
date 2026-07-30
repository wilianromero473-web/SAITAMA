import * as baileysMod from '@whiskeysockets/baileys'
import config from '../../config.js'
import { plugins } from '../../handler.js'
import { sendSmart } from '../../lib/serializer.js'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1 ? baileysMod.default : baileysMod
const { prepareWAMessageMedia, generateWAMessageFromContent } = pkg

const START_TIME = Date.now()

const IMAGENES = [
  'https://files.catbox.moe/dkxngv.png',
  'https://files.catbox.moe/a8id3b.png',
  'https://files.catbox.moe/7ess2z.png',
  'https://files.catbox.moe/eb7zb2.png',
  'https://files.catbox.moe/wj6sad.png',
]

const ETIQUETAS = {
  info:          '『 ℹ️ 』𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍',
  owner:         '『 👑 』𝐎𝐖𝐍𝐄𝐑 / 𝐃𝐔𝐄Ñ𝐎',
  rpg:           '『 ⚔️ 』𝐑𝐎𝐋 𝐘 𝐀𝐕𝐄𝐍𝐓𝐔𝐑𝐀',
  eco:           '『 💰 』𝐄𝐂𝐎𝐍𝐎𝐌Í𝐀',
  registro:      '『 👤 』𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎',
  juegos:        '『 🎮 』𝐌𝐈𝐍𝐈𝐉𝐔𝐄𝐆𝐎𝐒',
  fun:           '『 🎉 』𝐃𝐈𝐕𝐄𝐑𝐒𝐈Ó𝐍',
  group:         '『 👥 』𝐆𝐄𝐒𝐓𝐈Ó𝐍 𝐃𝐄 𝐆𝐑𝐔𝐏𝐎𝐒',
  tools:         '『 🔧 』𝐇𝐄𝐑𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀𝐒',
  descargas:     '『 📥 』𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒',
  busquedas:     '『 🔍 』𝐁Ú𝐒𝐐𝐔𝐄𝐃𝐀𝐒',
  convertidores: '『 🔄 』𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈𝐃𝐎𝐑𝐄𝐒',
  anime:         '『 🎌 』𝐀𝐍𝐈𝐌𝐄 / 𝐎𝐓𝐀𝐊𝐔',
  nsfw:          '『 🔞 』𝐂𝐎𝐍𝐓𝐄𝐍𝐈𝐃𝐎 +𝟏𝟖',
  jadibot:       '『 🤖 』𝐒𝐔𝐁-𝐁𝐎𝐓𝐒',
  otros:         '『 📦 』𝐎𝐓𝐑𝐎𝐒 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒'
}

const getTime = () => {
  const t = Math.floor((Date.now() - START_TIME) / 1000)
  const d = Math.floor(t / 86400)
  const h = Math.floor((t / 3600) % 24)
  const min = Math.floor((t / 60) % 60)
  const s = t % 60

  return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${min > 0 ? min + 'm ' : ''}${s}s`
}

function getCategorias(isOwner, groupDb) {
  const categorias = {}
  let total = 0

  for (const p of Object.values(plugins)) {
    if (!p || !p.help) continue

    if ((p.owner || p.ownerOnly) && !isOwner) continue

    const tagRaw = Array.isArray(p.tags)
      ? p.tags[0]
      : (p.tags || 'otros')

    const tag = tagRaw.toLowerCase()

    if (groupDb && groupDb.disabledCategories?.includes(tag)) continue

    const cmdsReales = Array.isArray(p.command)
      ? p.command
      : [p.command]

    if (
      groupDb &&
      cmdsReales.every(c => groupDb.disabledCmds?.includes(c))
    ) continue

    if (!categorias[tag]) {
      categorias[tag] = []
    }

    const cmds = Array.isArray(p.help)
      ? p.help
      : [p.help]

    for (const cmd of cmds) {
      categorias[tag].push(cmd)
      total++
    }
  }

  return {
    categorias,
    total
  }
}

function getOrdenActivo(isOwner, groupDb) {
  const { categorias, total } = getCategorias(
    isOwner,
    groupDb
  )

  const ordenFinal = Object.keys(categorias)

  return {
    categorias,
    total,
    ordenFinal
  }
}

const getContextInfo = (conn, m) => ({
  mentionedJid: [m.sender],
  forwardingScore: 999,
  isForwarded: true,

  forwardedNewsletterMessageInfo: {
    newsletterJid:
      global.newsletterJid ||
      '120363408885875268@newsletter',

    newsletterName:
      `${conn.botname || config.botName} - ${config.ownerName}`,

    serverMessageId:
      Math.floor(Math.random() * 999) + 1
  }
})

/*
|--------------------------------------------------------------------------
| SUBMENÚ
|--------------------------------------------------------------------------
*/

async function enviarSubmenu(
  conn,
  m,
  tag,
  isOwner,
  usedPrefix,
  groupDb,
  userDb
) {
  const { categorias } = getOrdenActivo(
    isOwner,
    groupDb
  )

  const comandos = categorias[tag]

  if (!comandos?.length) {
    return m.reply(
      '╭━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑 〕━━⬣\n' +
      '┃\n' +
      '┃ 𝐍𝐨 𝐡𝐚𝐲 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐚𝐜𝐭𝐢𝐯𝐨𝐬\n' +
      '┃ 𝐞𝐧 𝐞𝐬𝐭𝐚 𝐜𝐚𝐭𝐞𝐠𝐨𝐫í𝐚.\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━⬣'
    )
  }

  const nombreCat =
    ETIQUETAS[tag] || ETIQUETAS.otros

  const prefix =
    usedPrefix ||
    config.prefix.source.replace(/[\^\[\]\\]/g, '')[0] ||
    '.'

  const linkCanal =
    config.groupLink ||
    'https://whatsapp.com'

  const currentBotName =
    conn.botname ||
    config.botName

  /*
  |--------------------------------------------------------------------------
  | TEXTO DECORADO DEL SUBMENÚ
  |--------------------------------------------------------------------------
  */

  let caption = ''

  caption +=
    `╭━━〔 ✦ ${nombreCat} ✦ 〕━━⬣\n`

  caption +=
    `┃\n`

  caption +=
    `┃  ✧ 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒\n`

  caption +=
    `┃  ╰─➤ 𝐒𝐞𝐥𝐞𝐜𝐜𝐢𝐨𝐧𝐚 𝐮𝐧 𝐜𝐨𝐦𝐚𝐧𝐝𝐨\n`

  caption +=
    `┃\n`

  for (const cmd of comandos) {
    caption +=
      `┃  ⟡ ${prefix}${cmd}\n`
  }

  caption +=
    `┃\n`

  caption +=
    `┃  ✦ 𝐓𝐨𝐭𝐚𝐥: ${comandos.length} 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬\n`

  caption +=
    `┃\n`

  caption +=
    `╰━━〔 ✧ ${currentBotName} ✧ 〕━━⬣`

  const imageUrl =
    conn.menuImage ||
    IMAGENES[
      Math.floor(
        Math.random() * IMAGENES.length
      )
    ]

  /*
  |--------------------------------------------------------------------------
  | MODO SIN BOTONES
  |--------------------------------------------------------------------------
  */

  if (
    conn.noButtons ||
    userDb?.noButtons
  ) {
    return conn.sendMessage(
      m.chat,
      {
        image: {
          url: imageUrl
        },
        caption
      },
      {
        quoted: m
      }
    )
  }

  /*
  |--------------------------------------------------------------------------
  | MEDIA
  |--------------------------------------------------------------------------
  */

  const media =
    await prepareWAMessageMedia(
      {
        image: {
          url: imageUrl
        }
      },
      {
        upload:
          conn.waUploadToServer
      }
    )

  /*
  |--------------------------------------------------------------------------
  | MENSAJE INTERACTIVO
  |--------------------------------------------------------------------------
  */

  const msg =
    generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },

            interactiveMessage: {
              body: {
                text: caption
              },

              footer: {
                text:
                  `✦ ${currentBotName} ✦`
              },

              header: {
                hasMediaAttachment: true,
                imageMessage:
                  media.imageMessage
              },

              nativeFlowMessage: {
                buttons: [

                  {
                    name: 'quick_reply',

                    buttonParamsJson:
                      JSON.stringify({
                        display_text:
                          '↩️ 𝐕𝐎𝐋𝐕𝐄𝐑 𝐀𝐋 𝐌𝐄𝐍Ú',

                        id:
                          `${prefix}menu`
                      })
                  },

                  {
                    name: 'cta_url',

                    buttonParamsJson:
                      JSON.stringify({
                        display_text:
                          '📢 𝐒𝐄𝐆𝐔𝐈𝐑 𝐂𝐀𝐍𝐀𝐋',

                        url:
                          linkCanal,

                        merchant_url:
                          linkCanal
                      })
                  }

                ]
              },

              contextInfo:
                getContextInfo(
                  conn,
                  m
                )
            }
          }
        }
      },
      {
        quoted: m
      }
    )

  await conn.relayMessage(
    m.chat,
    msg.message,
    {
      messageId: msg.key.id
    }
  )
}

/*
|--------------------------------------------------------------------------
| HANDLER PRINCIPAL
|--------------------------------------------------------------------------
*/

const handler = async (
  m,
  {
    conn,
    usedPrefix,
    isOwner,
    command,
    groupDb,
    userDb
  }
) => {

  const {
    categorias,
    total,
    ordenFinal
  } = getOrdenActivo(
    isOwner,
    groupDb
  )

  /*
  |--------------------------------------------------------------------------
  | MENÚ 1, MENÚ 2, MENÚ 3...
  |--------------------------------------------------------------------------
  */

  const numMatch =
    command.match(/^menu(\d+)$/)

  if (numMatch) {

    const idx =
      parseInt(
        numMatch[1]
      ) - 1

    const tag =
      ordenFinal[idx]

    if (tag) {
      return enviarSubmenu(
        conn,
        m,
        tag,
        isOwner,
        usedPrefix,
        groupDb,
        userDb
      )
    }

    return m.reply(
      '╭━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑 〕━━⬣\n' +
      '┃\n' +
      '┃ 𝐂𝐚𝐭𝐞𝐠𝐨𝐫í𝐚 𝐧𝐨 𝐞𝐧𝐜𝐨𝐧𝐭𝐫𝐚𝐝𝐚\n' +
      '┃ 𝐨 𝐝𝐞𝐬𝐚𝐜𝐭𝐢𝐯𝐚𝐝𝐚.\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━⬣'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | DATOS DEL USUARIO
  |--------------------------------------------------------------------------
  */

  const nombreUsuario =
    m.pushName ||
    'Usuario'

  const prefix =
    usedPrefix ||
    config.prefix.source.replace(
      /[\^\[\]\\]/g,
      ''
    )[0] ||
    '.'

  const currentBotName =
    conn.botname ||
    config.botName

  /*
  |--------------------------------------------------------------------------
  | OPCIONES DEL MENÚ
  |--------------------------------------------------------------------------
  */

  const rows =
    ordenFinal.map(
      (tag, i) => {

        const nombreCat =
          ETIQUETAS[tag] ||
          ETIQUETAS.otros

        const n =
          categorias[tag]?.length ||
          0

        return {

          header:
            nombreCat.toUpperCase(),

          title:
            '✦ 𝐕𝐄𝐑 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 ✦',

          description:
            `✧ ${n} 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 · ${prefix}menu${i + 1}`,

          id:
            `menu_cat_${tag}`
        }
      }
    )

  const imageUrl =
    conn.menuImage ||
    IMAGENES[
      Math.floor(
        Math.random() * IMAGENES.length
      )
    ]

  /*
  |--------------------------------------------------------------------------
  | MENÚ SIN BOTONES
  |--------------------------------------------------------------------------
  */

  if (
    conn.noButtons ||
    userDb?.noButtons
  ) {

    const cats =
      ordenFinal
        .map(
          (tag, i) =>
            `┃  『 ${i + 1} 』 ${ETIQUETAS[tag] || tag}\n` +
            `┃       ⤷ ${categorias[tag]?.length || 0} 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 · ${prefix}menu${i + 1}`
        )
        .join('\n')

    const textoNoBtn =

`╭━━〔 ✦ 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 ✦ 〕━━⬣
┃
┃  ╭─〔 👋 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐎/𝐀 〕
┃  │
┃  │  ✧ 𝐇𝐨𝐥𝐚, *${nombreUsuario}* ♡
┃  │
┃  │  𝐌𝐞 𝐚𝐥𝐞𝐠𝐫𝐚 𝐯𝐞𝐫𝐭𝐞 𝐩𝐨𝐫 𝐚𝐪𝐮í.
┃  │  𝐄𝐬𝐭𝐞 𝐞𝐬 𝐞𝐥 𝐦𝐞𝐧ú 𝐩𝐫𝐢𝐧𝐜𝐢𝐩𝐚𝐥 𝐝𝐞
┃  │  *${currentBotName}* ✨
┃  ╰───────────────
┃
┣━━〔 📊 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍 〕━━⬣
┃
┃  👑 𝐂𝐫𝐞𝐚𝐝𝐨𝐫:
┃     ${config.ownerName}
┃
┃  ⚙️ 𝐏𝐫𝐞𝐟𝐢𝐣𝐨:
┃     『 ${prefix} 』
┃
┃  ⏱️ 𝐀𝐜𝐭𝐢𝐯𝐨:
┃     ${getTime()}
┃
┃  📦 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬:
┃     ${total}
┃
┣━━〔 ✦ 𝐑𝐄𝐃𝐄𝐒 ✦ 〕━━⬣
┃
┃  🎵 𝐓𝐢𝐤𝐓𝐨𝐤 𝐝𝐞 𝐦𝐢 𝐜𝐫𝐞𝐚𝐝𝐨𝐫:
┃  🔗 https://www.tiktok.com/@sai16172?_r=1&_t=ZS-97okvUBLwyT
┃
┃  ♡ 𝐒𝐢𝐠𝐮𝐞 𝐚 𝐦𝐢 𝐜𝐫𝐞𝐚𝐝𝐨𝐫 𝐩𝐚𝐫𝐚
┃     𝐚𝐩𝐨𝐲𝐚𝐫 𝐞𝐥 𝐩𝐫𝐨𝐲𝐞𝐜𝐭𝐨 💯❤️
┃
┣━━〔 📚 𝐂𝐀𝐓𝐄𝐆𝐎𝐑Í𝐀𝐒 〕━━⬣
┃
${cats}
┃
╰━━〔 ✧ ${config.footer} ✧ 〕━━⬣`

    return conn.sendMessage(
      m.chat,
      {
        image: {
          url: imageUrl
        },
        caption: textoNoBtn
      },
      {
        quoted: m
      }
    )
  }

  /*
  |--------------------------------------------------------------------------
  | MENÚ PRINCIPAL CON BOTONES
  |--------------------------------------------------------------------------
  */

  const textoMenu =

`╭━━〔 ✦ 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 ✦ 〕━━⬣
┃
┃  ╭─〔 👋 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐎/𝐀 〕
┃  │
┃  │  ✧ 𝐇𝐨𝐥𝐚, *${nombreUsuario}* ♡
┃  │
┃  │  𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝𝐨/𝐚 𝐚𝐥 𝐦𝐞𝐧ú 𝐩𝐫𝐢𝐧𝐜𝐢𝐩𝐚𝐥.
┃  │  𝐄𝐬𝐭𝐚𝐬 𝐞𝐧 𝐒𝐚𝐢𝐭𝐚𝐦𝐚𝐁𝐨𝐭 ✨
┃  │
┃  │  𝐄𝐥𝐢𝐠𝐞 𝐮𝐧𝐚 𝐜𝐚𝐭𝐞𝐠𝐨𝐫í𝐚
┃  │  𝐩𝐚𝐫𝐚 𝐯𝐞𝐫 𝐬𝐮𝐬 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬.
┃  ╰───────────────
┃
┣━━〔 📊 𝐄𝐒𝐓𝐀𝐃Í𝐒𝐓𝐈𝐂𝐀𝐒 〕━━⬣
┃
┃  👑 𝐂𝐫𝐞𝐚𝐝𝐨𝐫:
┃     ${config.ownerName}
┃
┃  ⚙️ 𝐏𝐫𝐞𝐟𝐢𝐣𝐨:
┃     『 ${prefix} 』
┃
┃  ⏱️ 𝐓𝐢𝐞𝐦𝐩𝐨 𝐚𝐜𝐭𝐢𝐯𝐨:
┃     ${getTime()}
┃
┃  📦 𝐓𝐨𝐭𝐚𝐥 𝐝𝐞 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬:
┃     ${total}
┃
┣━━〔 ✦ 𝐑𝐄𝐃𝐄𝐒 ✦ 〕━━⬣
┃
┃  🎵 𝐓𝐢𝐤𝐓𝐨𝐤 𝐝𝐞 𝐦𝐢 𝐜𝐫𝐞𝐚𝐝𝐨𝐫:
┃  🔗 https://www.tiktok.com/@sai16172?_r=1&_t=ZS-97okvUBLwyT
┃
┃  ♡ 𝐒𝐢𝐠𝐮𝐞 𝐚 𝐦𝐢 𝐜𝐫𝐞𝐚𝐝𝐨𝐫 𝐩𝐚𝐫𝐚
┃     𝐚𝐩𝐨𝐲𝐚𝐫 𝐞𝐥 𝐩𝐫𝐨𝐲𝐞𝐜𝐭𝐨 💯❤️
┃
┣━━〔 📖 𝐌𝐄𝐍Ú 〕━━⬣
┃
┃  ✧ 𝐏𝐮𝐥𝐬𝐚 𝐞𝐥 𝐛𝐨𝐭ó𝐧
┃     𝐩𝐚𝐫𝐚 𝐯𝐞𝐫 𝐥𝐚𝐬 𝐜𝐚𝐭𝐞𝐠𝐨𝐫í𝐚𝐬.
┃
╰━━〔 ✧ ${config.footer} ✧ 〕━━⬣`

  const media =
    await prepareWAMessageMedia(
      {
        image: {
          url: imageUrl
        }
      },
      {
        upload:
          conn.waUploadToServer
      }
    )

  /*
  |--------------------------------------------------------------------------
  | MENSAJE INTERACTIVO
  |--------------------------------------------------------------------------
  */

  const msg =
    generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {

            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },

            interactiveMessage: {

              body: {
                text: textoMenu
              },

              footer: {
                text:
                  `✦ ${currentBotName} • ${new Date().getFullYear()} ✦`
              },

              header: {
                hasMediaAttachment: true,
                imageMessage:
                  media.imageMessage
              },

              nativeFlowMessage: {

                buttons: [

                  /*
                  |--------------------------------------------------------------------------
                  | BOTÓN DE CATEGORÍAS
                  |--------------------------------------------------------------------------
                  */

                  {
                    name: 'single_select',

                    buttonParamsJson:
                      JSON.stringify({

                        title:
                          '📚 𝐒𝐄𝐋𝐄𝐂𝐂𝐈𝐎𝐍𝐀𝐑 𝐌𝐄𝐍Ú',

                        sections: [

                          {
                            title:
                              '✦ 𝐂𝐀𝐓𝐄𝐆𝐎𝐑Í𝐀𝐒 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐋𝐄𝐒 ✦',

                            rows
                          }

                        ]
                      })
                  },

                  /*
                  |--------------------------------------------------------------------------
                  | BOTÓN DEL CANAL
                  |--------------------------------------------------------------------------
                  */

                  {
                    name: 'cta_url',

                    buttonParamsJson:
                      JSON.stringify({

                        display_text:
                          '📢 𝐔𝐍𝐈𝐑𝐒𝐄 𝐀𝐋 𝐂𝐀𝐍𝐀𝐋',

                        url:
                          config.groupLink ||
                          'https://whatsapp.com',

                        merchant_url:
                          config.groupLink ||
                          'https://whatsapp.com'
                      })
                  }

                ]
              },

              contextInfo:
                getContextInfo(
                  conn,
                  m
                )
            }
          }
        }
      },
      {
        quoted: m
      }
    )

  await conn.relayMessage(
    m.chat,
    msg.message,
    {
      messageId: msg.key.id
    }
  )
}

/*
|--------------------------------------------------------------------------
| RESPUESTAS DE LOS BOTONES
|--------------------------------------------------------------------------
*/

handler.all = async (
  m,
  {
    conn,
    isOwner,
    usedPrefix,
    groupDb,
    userDb
  }
) => {

  if (
    m.responseId &&
    m.responseId.startsWith(
      'menu_cat_'
    )
  ) {

    const tag =
      m.responseId.replace(
        'menu_cat_',
        ''
      )

    await enviarSubmenu(
      conn,
      m,
      tag,
      isOwner,
      usedPrefix,
      groupDb,
      userDb
    )
  }
}

/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DEL COMANDO
|--------------------------------------------------------------------------
*/

handler.help = [
  'menu'
]

handler.tags = [
  'info'
]

handler.command = [
  'menu',
  'help',
  'ayuda',
  'menú',
  ...Array.from(
    {
      length: 20
    },
    (_, i) =>
      `menu${i + 1}`
  )
]

export default handler