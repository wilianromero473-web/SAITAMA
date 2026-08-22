import * as baileysMod from '@whiskeysockets/baileys'
import config from '../../config.js'
import { plugins } from '../../handler.js'

const pkg =
  baileysMod.default &&
  Object.keys(baileysMod).length === 1
    ? baileysMod.default
    : baileysMod

const {
  prepareWAMessageMedia,
  generateWAMessageFromContent
} = pkg

const START_TIME = Date.now()

// ═════════════════════════════════════
// ✦ IMÁGENES DEL MENÚ
// ═════════════════════════════════════

const IMAGENES = [
  'https://files.catbox.moe/dkxngv.png',
  'https://files.catbox.moe/a8id3b.png',
  'https://files.catbox.moe/7ess2z.png',
  'https://files.catbox.moe/eb7zb2.png',
  'https://files.catbox.moe/wj6sad.png'
]

// ═════════════════════════════════════
// ✦ CATEGORÍAS
// ═════════════════════════════════════

const ETIQUETAS = {

  info:
    '『 ✦ 』𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸Ó𝙽',

  owner:
    '『 ♛ 』𝙾𝚆𝙽𝙴𝚁 / 𝙳𝚄𝙴Ñ𝙾',

  rpg:
    '『 ⚔ 』𝚁𝙾𝙻 𝚈 𝙰𝚅𝙴𝙽𝚃𝚄𝚁𝙰',

  eco:
    '『 ◈ 』𝙴𝙲𝙾𝙽𝙾𝙼Í𝙰',

  registro:
    '『 ✎ 』𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾',

  juegos:
    '『 🎮 』𝙼𝙸𝙽𝙸𝙹𝚄𝙴𝙶𝙾𝚂',

  fun:
    '『 ✧ 』𝙳𝙸𝚅𝙴𝚁𝚂𝙸Ó𝙽',

  group:
    '『 ♟ 』𝙶𝙴𝚂𝚃𝙸Ó𝙽 𝙳𝙴 𝙶𝚁𝚄𝙿𝙾𝚂',

  tools:
    '『 ⚙ 』𝙷𝙴𝚁𝚁𝙰𝙼𝙸𝙴𝙽𝚃𝙰𝚂',

  descargas:
    '『 ⇩ 』𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚂',

  busquedas:
    '『 ⌕ 』𝙱Ú𝚂𝚀𝚄𝙴𝙳𝙰𝚂',

  convertidores:
    '『 ↻ 』𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝙳𝙾𝚁𝙴𝚂',

  anime:
    '『 ✺ 』𝙰𝙽𝙸𝙼𝙴 / 𝙾𝚃𝙰𝙺𝚄',

  nsfw:
    '『 +18 』𝙲𝙾𝙽𝚃𝙴𝙽𝙸𝙳𝙾',

  jadibot:
    '『 ◉ 』𝚂𝚄𝙱-𝙱𝙾𝚃𝚂',

  ia:
    '『 ▣ 』𝙸𝙽𝚃𝙴𝙻𝙸𝙶𝙴𝙽𝙲𝙸𝙰 𝙰𝚁𝚃𝙸𝙵𝙸𝙲𝙸𝙰𝙻'
}

// ═════════════════════════════════════
// ✦ TIEMPO ACTIVO
// ═════════════════════════════════════

function getTime() {

  const t =
    Math.floor(
      (Date.now() - START_TIME) / 1000
    )

  const d =
    Math.floor(t / 86400)

  const h =
    Math.floor(
      (t / 3600) % 24
    )

  const min =
    Math.floor(
      (t / 60) % 60
    )

  const s =
    t % 60

  return (
    `${d > 0 ? d + 'd ' : ''}` +
    `${h > 0 ? h + 'h ' : ''}` +
    `${min > 0 ? min + 'm ' : ''}` +
    `${s}s`
  )
}

// ═════════════════════════════════════
// ✦ OBTENER CATEGORÍAS
// ═════════════════════════════════════

function getCategorias(
  isOwner,
  groupDb
) {

  const categorias = {}
  let total = 0

  for (
    const p of Object.values(plugins)
  ) {

    if (
      !p ||
      !p.help
    ) continue

    if (
      (p.owner || p.ownerOnly) &&
      !isOwner
    ) continue

    const tagRaw =
      Array.isArray(p.tags)
        ? p.tags[0]
        : (
            p.tags ||
            'otros'
          )

    const tag =
      String(tagRaw).toLowerCase()

    if (
      groupDb &&
      groupDb.disabledCategories?.includes(tag)
    ) {
      continue
    }

    const comandosReales =
      Array.isArray(p.command)
        ? p.command
        : [p.command]

    if (
      groupDb &&
      comandosReales.every(
        c =>
          groupDb.disabledCmds?.includes(c)
      )
    ) {
      continue
    }

    if (!categorias[tag]) {
      categorias[tag] = []
    }

    const comandos =
      Array.isArray(p.help)
        ? p.help
        : [p.help]

    for (
      const cmd of comandos
    ) {

      if (!cmd) continue

      categorias[tag].push(cmd)
      total++
    }
  }

  return {
    categorias,
    total
  }
}

// ═════════════════════════════════════
// ✦ ORDEN DE CATEGORÍAS
// ═════════════════════════════════════

function getOrdenActivo(
  isOwner,
  groupDb
) {

  const {
    categorias,
    total
  } =
    getCategorias(
      isOwner,
      groupDb
    )

  return {
    categorias,
    total,
    ordenFinal:
      Object.keys(categorias)
  }
}

// ═════════════════════════════════════
// ✦ CONTEXT INFO
// ═════════════════════════════════════

function getContextInfo(
  conn,
  m
) {

  return {

    mentionedJid: [
      m.sender
    ],

    forwardingScore: 999,

    isForwarded: true,

    forwardedNewsletterMessageInfo: {

      newsletterJid:
        global.newsletterJid ||
        '120363408885875268@newsletter',

      newsletterName:
        `${conn.botname || config.botName} - ${config.ownerName}`,

      serverMessageId:
        Math.floor(
          Math.random() * 999
        ) + 1
    }
  }
}

// ═════════════════════════════════════
// ✦ SUBMENÚ
// ═════════════════════════════════════

async function enviarSubmenu(
  conn,
  m,
  tag,
  isOwner,
  usedPrefix,
  groupDb,
  userDb
) {

  const {
    categorias
  } =
    getOrdenActivo(
      isOwner,
      groupDb
    )

  const comandos =
    categorias[tag]

  if (
    !comandos?.length
  ) {

    return m.reply(
`╭━━〔 ✕ 𝙴𝚁𝚁𝙾𝚁 〕━━⬣
┃
┃ 𝙽𝚘 𝚑𝚊𝚢 𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜
┃ 𝚊𝚌𝚝𝚒𝚟𝚘𝚜 𝚎𝚗 𝚎𝚜𝚝𝚊
┃ 𝚌𝚊𝚝𝚎𝚐𝚘𝚛í𝚊.
┃
╰━━━━━━━━━━━━━━⬣`
    )
  }

  const nombreCat =
    ETIQUETAS[tag] ||
    ETIQUETAS.otros

  const prefix =
    usedPrefix ||
    config.prefix.source
      .replace(
        /[\^\[\]\\]/g,
        ''
      )[0] ||
    '.'

  const linkCanal =
    config.groupLink ||
    'https://whatsapp.com'

  const currentBotName =
    conn.botname ||
    config.botName

  let caption =

`╭━━〔 ✦ ${nombreCat} ✦ 〕━━⬣
┃
┃ 〘 ⟡ 〙 𝙻𝙸𝚂𝚃𝙰 𝙳𝙴
┃      𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂
┃
┃ 〘 ⚡ 〙 𝙼𝚘𝚍𝚘 𝙷é𝚛𝚘𝚎
┃      𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘.
┃
┣━━━━━━━━━━━━━━━━━━
┃
`

  for (
    const cmd of comandos
  ) {

    caption +=
      `┃  ⟡ ${prefix}${cmd}\n`
  }

  caption +=
`┃
┣━━━━━━━━━━━━━━━━━━
┃
┃ 〘 ◈ 〙 𝚃𝚘𝚝𝚊𝚕:
┃      ${comandos.length} 𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜
┃
╰━━〔 ✦ ${currentBotName} ✦ 〕━━⬣`

  const imageUrl =
    conn.menuImage ||
    IMAGENES[
      Math.floor(
        Math.random() *
        IMAGENES.length
      )
    ]

  // ═════════════════════════════════
  // ✦ SIN BOTONES
  // ═════════════════════════════════

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
                hasMediaAttachment:
                  true,

                imageMessage:
                  media.imageMessage
              },

              nativeFlowMessage: {

                buttons: [

                  {
                    name:
                      'quick_reply',

                    buttonParamsJson:
                      JSON.stringify({

                        display_text:
                          '↩ 𝚅𝙾𝙻𝚅𝙴𝚁 𝙰𝙻 𝙼𝙴𝙽Ú',

                        id:
                          `${prefix}menu`
                      })
                  },

                  {
                    name:
                      'cta_url',

                    buttonParamsJson:
                      JSON.stringify({

                        display_text:
                          '➤ 𝚂𝙴𝙶𝚄𝙸𝚁 𝙲𝙰𝙽𝙰𝙻',

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
      messageId:
        msg.key.id
    }
  )
}

// ═════════════════════════════════════
// ✦ HANDLER PRINCIPAL
// ═════════════════════════════════════

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
  } =
    getOrdenActivo(
      isOwner,
      groupDb
    )

  // ═════════════════════════════════
  // ✦ MENU1 / MENU2 / ETC.
  // ═════════════════════════════════

  const numMatch =
    String(command || '')
      .match(
        /^menu(\d+)$/
      )

  if (numMatch) {

    const idx =
      parseInt(
        numMatch[1],
        10
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
`╭━━〔 ✕ 𝙴𝚁𝚁𝙾𝚁 〕━━⬣
┃
┃ 𝙲𝚊𝚝𝚎𝚐𝚘𝚛í𝚊 𝚗𝚘
┃ 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚍𝚊.
┃
╰━━━━━━━━━━━━━━⬣`
    )
  }

  // ═════════════════════════════════
  // ✦ DATOS DEL USUARIO
  // ═════════════════════════════════

  const nombreUsuario =
    m.pushName ||
    'Usuario'

  const prefix =
    usedPrefix ||
    config.prefix.source
      .replace(
        /[\^\[\]\\]/g,
        ''
      )[0] ||
    '.'

  const currentBotName =
    conn.botname ||
    config.botName

  // ═════════════════════════════════
  // ✦ FILAS
  // ═════════════════════════════════

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
            nombreCat,

          title:
            '✦ 𝚅𝙴𝚁 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂 ✦',

          description:
            `⟡ ${n} 𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜 • ${prefix}menu${i + 1}`,

          id:
            `menu_cat_${tag}`
        }
      }
    )

  const imageUrl =
    conn.menuImage ||
    IMAGENES[
      Math.floor(
        Math.random() *
        IMAGENES.length
      )
    ]

  // ═════════════════════════════════
  // ✦ MODO SIN BOTONES
  // ═════════════════════════════════

  if (
    conn.noButtons ||
    userDb?.noButtons
  ) {

    const cats =
      ordenFinal
        .map(
          (tag, i) =>
`┃
┃ 〘 ${i + 1} 〙 ${ETIQUETAS[tag] || tag}
┃      ⤷ ${categorias[tag]?.length || 0} 𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜
┃      ⤷ ${prefix}menu${i + 1}`
        )
        .join('\n')

    const textoNoBtn =

`╭━━〔 ✦ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✦ 〕━━⬣
┃
┃ 〘 ⚡ 〙 𝙷𝚘𝚕𝚊, ${nombreUsuario}!
┃
┃ 𝚂𝚘𝚢 𝚂𝚊𝚒𝚝𝚊𝚖𝚊𝙱𝚘𝚝.
┃
┃ 𝚄𝚗 𝚋𝚘𝚝 𝚙𝚛𝚎𝚙𝚊𝚛𝚊𝚍𝚘
┃ 𝚙𝚊𝚛𝚊 𝚊𝚢𝚞𝚍𝚊𝚛𝚝𝚎.
┃
┃ 〘 👊 〙 𝙼𝙾𝙳𝙾 𝙷É𝚁𝙾𝙴
┃
┃ 𝙴𝚕𝚒𝚐𝚎 𝚞𝚗𝚊 𝚌𝚊𝚝𝚎𝚐𝚘𝚛í𝚊
┃ 𝚢 𝚌𝚘𝚖𝚒𝚎𝚗𝚣𝚊.
┃
┣━━〔 ◈ 𝙴𝚂𝚃𝙰𝙳Í𝚂𝚃𝙸𝙲𝙰𝚂 ◈ 〕━━⬣
┃
┃ 〘 ♛ 〙 𝙲𝚛𝚎𝚊𝚍𝚘𝚛:
┃      ${config.ownerName}
┃
┃ 〘 ⚙ 〙 𝙿𝚛𝚎𝚏𝚒𝚓𝚘:
┃      『 ${prefix} 』
┃
┃ 〘 ◷ 〙 𝙰𝚌𝚝𝚒𝚟𝚘:
┃      ${getTime()}
┃
┃ 〘 ◈ 〙 𝙲𝚘𝚖𝚊𝚗𝚍𝚘𝚜:
┃      ${total}
┃
┣━━〔 👊 𝙲𝙴𝙽𝚃𝚁𝙾 𝙳𝙴 𝙷É𝚁𝙾𝙴𝚂 👊 〕━━⬣
┃
┃ 〘 ⟡ 〙 𝙲𝚊𝚝𝚎𝚐𝚘𝚛í𝚊𝚜:
${cats}
┃
┣━━〔 ✦ 𝚁𝙴𝙳𝙴𝚂 ✦ 〕━━⬣
┃
┃ 〘 ♪ 〙 𝚃𝚒𝚔𝚃𝚘𝚔:
┃  https://www.tiktok.com/@sai16172
┃
╰━━〔 ✦ ${config.footer} ✦ 〕━━⬣`

    return conn.sendMessage(
      m.chat,
      {
        image: {
          url: imageUrl
        },
        caption:
          textoNoBtn
      },
      {
        quoted: m
      }
    )
  }

  // ═════════════════════════════════════
  // ✦ MENÚ PRINCIPAL
  // ═════════════════════════════════════

  const textoMenu =

`╭━━〔 ✦ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✦ 〕━━⬣
┃
┃ 〘 ⚡ 〙 𝙷𝚘𝚕𝚊, ${nombreUsuario}!
┃
┃ 𝚂𝚘𝚢 𝚂𝚊𝚒𝚝𝚊𝚖𝚊𝙱𝚘𝚝.
┃
┃ 𝚄𝚗 𝚊𝚜𝚒𝚜𝚝𝚎𝚗𝚝𝚎
┃ 𝚙𝚛𝚎𝚙𝚊𝚛𝚊𝚍𝚘 𝚙𝚊𝚛𝚊
┃ 𝚕𝚕𝚎𝚟𝚊𝚛 𝚝𝚞𝚜
┃ 𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜.
┃
┃ 〘 👊 〙 𝙼𝙾𝙳𝙾 𝙷É𝚁𝙾𝙴
┃
┃ 𝙴𝚕𝚒𝚐𝚎 𝚞𝚗𝚊 𝚌𝚊𝚝𝚎𝚐𝚘𝚛í𝚊
┃ 𝚢 𝚌𝚘𝚖𝚒𝚎𝚗𝚣𝚊 𝚕𝚊
┃ 𝚊𝚟𝚎𝚗𝚝𝚞𝚛𝚊.
┃
┣━━〔 ⚡ 𝙴𝚂𝚃𝙰𝙳Í𝚂𝚃𝙸𝙲𝙰𝚂 ⚡ 〕━━⬣
┃
┃ 〘 ♛ 〙 𝙲𝚛𝚎𝚊𝚍𝚘𝚛:
┃      ${config.ownerName}
┃
┃ 〘 ⚙ 〙 𝙿𝚛𝚎𝚏𝚒𝚓𝚘:
┃      『 ${prefix} 』
┃
┃ 〘 ◷ 〙 𝚃𝚒𝚎𝚖𝚙𝚘 𝚊𝚌𝚝𝚒𝚟𝚘:
┃      ${getTime()}
┃
┃ 〘 ◈ 〙 𝚃𝚘𝚝𝚊𝚕:
┃      ${total} 𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜
┃
┣━━〔 👊 𝙲𝙴𝙽𝚃𝚁𝙾 𝙳𝙴 𝙷É𝚁𝙾𝙴𝚂 👊 〕━━⬣
┃
┃ 〘 ⟡ 〙 𝙿𝚞𝚕𝚜𝚊 𝚎𝚕 𝚋𝚘𝚝ó𝚗
┃      𝚍𝚎 𝚊𝚋𝚊𝚓𝚘 𝚙𝚊𝚛𝚊
┃      𝚟𝚎𝚛 𝚕𝚊𝚜
┃      𝚌𝚊𝚝𝚎𝚐𝚘𝚛í𝚊𝚜.
┃
┃ 〘 ⚔ 〙 𝙴𝚕 𝚎𝚗𝚝𝚛𝚎𝚗𝚊𝚖𝚒𝚎𝚗𝚝𝚘
┃      𝚌𝚘𝚖𝚒𝚎𝚗𝚣𝚊 𝚊𝚑𝚘𝚛𝚊.
┃
┣━━〔 ✦ 𝚁𝙴𝙳𝙴𝚂 ✦ 〕━━⬣
┃
┃ 〘 ♪ 〙 𝚃𝚒𝚔𝚃𝚘𝚔 𝚍𝚎𝚕 𝚌𝚛𝚎𝚊𝚍𝚘𝚛:
┃
┃  https://www.tiktok.com/@sai16172
┃
╰━━〔 ✦ ${config.footer} ✦ 〕━━⬣`

  // ═════════════════════════════════════
  // ✦ PREPARAR IMAGEN
  // ═════════════════════════════════════

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

  // ═════════════════════════════════════
  // ✦ MENSAJE INTERACTIVO
  // ═════════════════════════════════════

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
                text:
                  textoMenu
              },

              footer: {
                text:
                  `✦ ${currentBotName} • ${new Date().getFullYear()} ✦`
              },

              header: {

                hasMediaAttachment:
                  true,

                imageMessage:
                  media.imageMessage
              },

              nativeFlowMessage: {

                buttons: [

                  // ═══════════════════════
                  // ✦ SELECTOR
                  // ═══════════════════════

                  {
                    name:
                      'single_select',

                    buttonParamsJson:
                      JSON.stringify({

                        title:
                          '👊 𝚂𝙴𝙻𝙴𝙲𝙲𝙸𝙾𝙽𝙰𝚁 𝙼𝙴𝙽Ú',

                        sections: [

                          {
                            title:
                              '『 ⚡ 』𝙲𝙴𝙽𝚃𝚁𝙾 𝙳𝙴 𝙷É𝚁𝙾𝙴𝚂',

                            rows
                          }

                        ]
                      })
                  },

                  // ═══════════════════════
                  // ✦ CANAL
                  // ═══════════════════════

                  {
                    name:
                      'cta_url',

                    buttonParamsJson:
                      JSON.stringify({

                        display_text:
                          '➤ 𝚂𝙴𝙶𝚄𝙸𝚁 𝙲𝙰𝙽𝙰𝙻',

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
      messageId:
        msg.key.id
    }
  )
}

// ═════════════════════════════════════
// ✦ RESPUESTAS DEL SELECTOR
// ═════════════════════════════════════

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
}

// ═════════════════════════════════════
// ✦ CONFIGURACIÓN DEL COMANDO
// ═════════════════════════════════════

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