import axios from 'axios'
import { exec } from 'child_process'
import fs from 'fs'
import { rm } from 'fs/promises'
import path from 'path'

// ═══════════════════════════════════════
// 𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻
// ✰ 𝚄𝚜𝚊
// ═══════════════════════════════════════

const DEFAULT_PIC = 'https://files.catbox.moe/s1zyut.jpg'

// ───────────────────────────────────────
// 𝚃𝙸𝙿𝙾𝚂 𝙳𝙴 𝚃𝙾𝙿
// ───────────────────────────────────────

const TIPOS_MAP = {
  top5lindos: 'lindos',
  lindos: 'lindos',
  top5lindo: 'lindos',
  top5lindas: 'lindos',

  top5feos: 'feos',
  feos: 'feos',
  top5feo: 'feos',

  top5otakus: 'otakus',
  otakus: 'otakus',
  otaku: 'otakus',

  top5divas: 'divas',
  divas: 'divas',
  top5diva: 'divas',

  top5aventureros: 'aventureros',
  aventureros: 'aventureros',
  aventurero: 'aventureros',

  top5caoticos: 'caoticos',
  caoticos: 'caoticos',
  caotico: 'caoticos',

  top5cornudos: 'cornudos',
  cornudos: 'cornudos',
  top5cornudo: 'cornudos',
  cornudo: 'cornudos',

  top5borrachos: 'borrachos',
  borrachos: 'borrachos',
  top5borracho: 'borrachos',

  top5idiotas: 'idiotas',
  idiotas: 'idiotas',
  top5idiota: 'idiotas'
}

// ───────────────────────────────────────
// 𝙴𝙼𝙾𝙹𝙸𝚂
// ───────────────────────────────────────

const MEDALLAS = [
  '🥇',
  '🥈',
  '🥉',
  '4️⃣',
  '5️⃣'
]

const EMOJIS_TOP10 = [
  '🔥', '🦄', '😈', '🍕', '😅',
  '😂', '😍', '👹', '🤡', '🐸',
  '👑', '🛸', '🦖', '🤠', '🧟',
  '😱', '👻', '🙈', '😎', '🦋',
  '⚡', '🌟', '🧸', '🍀', '🎉'
]

// ───────────────────────────────────────
// 𝙵𝚄𝙽𝙲𝙸𝙾𝙽𝙴𝚂
// ───────────────────────────────────────

const rnd = arr =>
  arr[Math.floor(Math.random() * arr.length)]

const pick = (arr, cantidad) => {
  const pool = [...arr]
  const result = []

  while (result.length < cantidad && pool.length) {
    const index = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(index, 1)[0])
  }

  return result
}

// ───────────────────────────────────────
// 𝙴𝚂𝚃𝙸𝙻𝙾 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃
// ───────────────────────────────────────

const HEADER = `𝙼𝙴𝙳𝙸𝙰𝙵𝙸𝚁𝙴 ༻
✰ 𝚄𝚜𝚊`

const texto = {
  soloGrupo: `${HEADER}

⚠️ *𝚂𝙾𝙻𝙾 𝙶𝚁𝚄𝙿𝙾𝚂*

> ✰ 𝙴𝚜𝚝𝚎 𝚌𝚘𝚖𝚊𝚗𝚍𝚘
> 𝚜𝚘𝚕𝚘 𝚏𝚞𝚗𝚌𝚒𝚘𝚗𝚊 𝚎𝚗 𝚐𝚛𝚞𝚙𝚘𝚜.`,

  pocos5: `${HEADER}

⚠️ *𝙿𝙾𝙲𝙾𝚂 𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂*

> ✰ 𝚂𝚎 𝚗𝚎𝚌𝚎𝚜𝚒𝚝𝚊𝚗
> 𝚊𝚕 𝚖𝚎𝚗𝚘𝚜 *𝟻 𝚖𝚒𝚎𝚖𝚋𝚛𝚘𝚜*.`,

  pocos10: `${HEADER}

⚠️ *𝙿𝙾𝙲𝙾𝚂 𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂*

> ✰ 𝚂𝚎 𝚗𝚎𝚌𝚎𝚜𝚒𝚝𝚊𝚗
> 𝚊𝚕 𝚖𝚎𝚗𝚘𝚜 *𝟷𝟶 𝚖𝚒𝚎𝚖𝚋𝚛𝚘𝚜*.`,

  sinMotivo: `${HEADER}

⚠️ *𝙵𝙰𝙻𝚃𝙰 𝙴𝙻 𝙼𝙾𝚃𝙸𝚅𝙾*

> ✰ 𝚄𝚜𝚊:
> *.𝚝𝚘𝚙 <𝚖𝚘𝚝𝚒𝚟𝚘>*

> ✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
> *.𝚝𝚘𝚙 𝚕𝚘𝚜 𝚖á𝚜 𝚊𝚌𝚝𝚒𝚟𝚘𝚜*`,

  errorPet: `${HEADER}

⚠️ *𝙴𝚁𝚁𝙾𝚁*

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚐𝚎𝚗𝚎𝚛𝚊𝚛
> 𝚕𝚊 𝚊𝚗𝚒𝚖𝚊𝚌𝚒ó𝚗.
> 𝙸𝚗𝚝𝚎𝚗𝚝𝚊 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
}

// ───────────────────────────────────────
// 𝚃𝙴𝚇𝚃𝙾𝚂 𝙳𝙴 𝙲𝙰𝚃𝙴𝙶𝙾𝚁Í𝙰
// ───────────────────────────────────────

const TEXTOS_TOP = {
  lindos: {
    emoji: '💖',
    titulo: '𝙻𝙸𝙽𝙳𝙾𝚂/𝙰𝚂',
    frases: [
      '𝙱𝚎𝚕𝚕𝚎𝚣𝚊 𝚗𝚊𝚝𝚞𝚛𝚊𝚕',
      '𝚃𝚊𝚕𝚕𝚊𝚍𝚘 𝚙𝚘𝚛 𝚕𝚘𝚜 𝚍𝚒𝚘𝚜𝚎𝚜',
      '𝚁𝚘𝚖𝚙𝚒𝚎𝚗𝚍𝚘 𝚌𝚘𝚛𝚊𝚣𝚘𝚗𝚎𝚜',
      '𝙸𝚖𝚙𝚘𝚜𝚒𝚋𝚕𝚎 𝚗𝚘 𝚖𝚒𝚛𝚊𝚛𝚕𝚎',
      '𝙳𝚎𝚖𝚊𝚜𝚒𝚊𝚍𝚊 𝚏𝚊𝚌𝚑𝚊'
    ]
  },

  feos: {
    emoji: '🤡',
    titulo: '𝙵𝙴𝙾𝚂',
    frases: [
      '𝙴𝚕 𝚎𝚜𝚙𝚎𝚓𝚘 𝚙𝚒𝚍𝚒ó 𝚟𝚊𝚌𝚊𝚌𝚒𝚘𝚗𝚎𝚜',
      '𝙻𝚊 𝚌á𝚖𝚊𝚛𝚊 𝚗𝚘 𝚎𝚗𝚏𝚘𝚌𝚊',
      '𝙽𝚒𝚟𝚎𝚕 𝚙𝚎𝚛𝚜𝚘𝚗𝚊𝚓𝚎 𝚜𝚎𝚌𝚞𝚗𝚍𝚊𝚛𝚒𝚘',
      '𝙲𝚘𝚖𝚙𝚕𝚒𝚌𝚊𝚍𝚘 𝚍𝚎 𝚖𝚒𝚛𝚊𝚛',
      '𝙷𝚞𝚖𝚘𝚛 𝚊𝚗𝚝𝚎 𝚝𝚘𝚍𝚘 😂'
    ]
  },

  otakus: {
    emoji: '🎌',
    titulo: '𝙾𝚃𝙰𝙺𝚄𝚂',
    frases: [
      '𝚁𝚎𝚜𝚙𝚒𝚛𝚊 𝚊𝚗𝚒𝚖𝚎',
      '𝚅𝚒𝚟𝚎 𝚎𝚗 𝚘𝚝𝚛𝚘 𝚞𝚗𝚒𝚟𝚎𝚛𝚜𝚘',
      '𝙽𝚒𝚟𝚎𝚕 𝚙𝚛𝚘𝚝𝚊𝚐𝚘𝚗𝚒𝚜𝚝𝚊',
      '𝙿𝚘𝚍𝚎𝚛 𝚘𝚝𝚊𝚔𝚞 𝚍𝚎𝚜𝚋𝚕𝚘𝚚𝚞𝚎𝚊𝚍𝚘',
      '𝙼𝚘𝚍𝚘 𝚊𝚗𝚒𝚖𝚎 𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘'
    ]
  },

  divas: {
    emoji: '💅',
    titulo: '𝙳𝙸𝚅𝙰𝚂',
    frases: [
      '𝚁𝚎𝚒𝚗𝚊 𝚜𝚞𝚙𝚛𝚎𝚖𝚊',
      '𝙳𝚎𝚖𝚊𝚜𝚒𝚊𝚍𝚘 𝚎𝚜𝚝𝚒𝚕𝚘',
      '𝙴𝚗𝚝𝚛𝚊𝚍𝚊 𝚍𝚎 𝚙𝚛𝚘𝚝𝚊𝚐𝚘𝚗𝚒𝚜𝚝𝚊',
      '𝙽𝚊𝚌𝚒ó 𝚙𝚊𝚛𝚊 𝚋𝚛𝚒𝚕𝚕𝚊𝚛',
      '𝙰𝚌𝚝𝚒𝚝𝚞𝚍 𝚍𝚎 𝚌𝚎𝚕𝚎𝚋𝚛𝚒𝚍𝚊𝚍'
    ]
  },

  aventureros: {
    emoji: '🧭',
    titulo: '𝙰𝚅𝙴𝙽𝚃𝚄𝚁𝙴𝚁𝙾𝚂',
    frases: [
      '𝚂𝚒𝚎𝚖𝚙𝚛𝚎 𝚋𝚞𝚜𝚌𝚊 𝚊𝚟𝚎𝚗𝚝𝚞𝚛𝚊𝚜',
      '𝙴𝚡𝚙𝚕𝚘𝚛𝚊𝚍𝚘𝚛 𝚘𝚏𝚒𝚌𝚒𝚊𝚕',
      '𝙽𝚞𝚗𝚌𝚊 𝚜𝚎 𝚚𝚞𝚎𝚍𝚊 𝚚𝚞𝚒𝚎𝚝𝚘',
      '𝙽𝚘 𝚌𝚘𝚗𝚘𝚌𝚎 𝚎𝚕 𝚊𝚋𝚞𝚛𝚛𝚒𝚖𝚒𝚎𝚗𝚝𝚘',
      '𝙼𝚘𝚍𝚘 𝚊𝚟𝚎𝚗𝚝𝚞𝚛𝚊 𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘'
    ]
  },

  caoticos: {
    emoji: '💀',
    titulo: '𝙲𝙰Ó𝚃𝙸𝙲𝙾𝚂',
    frases: [
      '𝙳𝚘𝚗𝚍𝚎 𝚕𝚕𝚎𝚐𝚊 𝚌𝚘𝚖𝚒𝚎𝚗𝚣𝚊 𝚎𝚕 𝚌𝚊𝚘𝚜',
      '𝙽𝚊𝚍𝚒𝚎 𝚜𝚊𝚋𝚎 𝚚𝚞é 𝚑𝚊𝚛á',
      '𝙿𝚕𝚊𝚗𝚒𝚏𝚒𝚌𝚊𝚛 𝚗𝚘 𝚎𝚜 𝚕𝚘 𝚜𝚞𝚢𝚘',
      '𝙲𝚊𝚘𝚜 𝚙𝚛𝚘𝚏𝚎𝚜𝚒𝚘𝚗𝚊𝚕',
      '𝙿𝚛𝚘𝚋𝚕𝚎𝚖𝚊𝚜 𝚐𝚊𝚛𝚊𝚗𝚝𝚒𝚣𝚊𝚍𝚘𝚜'
    ]
  },

  cornudos: {
    emoji: '🦌',
    titulo: '𝙲𝙾𝚁𝙽𝚄𝙳𝙾𝚂',
    frases: [
      '𝙴𝚕 𝚛𝚎𝚗𝚘 𝚍𝚎𝚕 𝚐𝚛𝚞𝚙𝚘',
      '𝙽𝚒𝚟𝚎𝚕 𝙱𝚊𝚖𝚋𝚒',
      '𝙰𝚜𝚝𝚊 𝚕𝚎𝚐𝚎𝚗𝚍𝚊𝚛𝚒𝚊',
      '𝙿𝚎𝚛𝚜𝚘𝚗𝚊𝚓𝚎 𝚍𝚎 𝙽𝚊𝚟𝚒𝚍𝚊𝚍',
      '𝙴𝚕 𝚐𝚛𝚞𝚙𝚘 𝚗𝚘 𝚙𝚎𝚛𝚍𝚘𝚗𝚊 😂'
    ]
  },

  borrachos: {
    emoji: '🍺',
    titulo: '𝙱𝙾𝚁𝚁𝙰𝙲𝙷𝙾𝚂',
    frases: [
      '𝚁𝚎𝚢 𝚍𝚎 𝚕𝚊 𝚏𝚒𝚎𝚜𝚝𝚊',
      '𝚂𝚒𝚎𝚖𝚙𝚛𝚎 𝚊𝚙𝚊𝚛𝚎𝚌𝚎 𝚎𝚗 𝚕𝚊 𝚛𝚎𝚞𝚗𝚒ó𝚗',
      '𝙽𝚒𝚟𝚎𝚕 𝚌𝚎𝚕𝚎𝚋𝚛𝚊𝚌𝚒ó𝚗',
      '𝙽𝚘 𝚜𝚎 𝚙𝚒𝚎𝚛𝚍𝚎 𝚞𝚗𝚊 𝚏𝚒𝚎𝚜𝚝𝚊',
      '𝙵𝚒𝚎𝚜𝚝𝚎𝚛𝚘 𝚙𝚛𝚘𝚏𝚎𝚜𝚒𝚘𝚗𝚊𝚕'
    ]
  },

  idiotas: {
    emoji: '🤡',
    titulo: '𝙸𝙳𝙸𝙾𝚃𝙰𝚂',
    frases: [
      '𝙽𝚘 𝚜𝚞𝚖𝚊 𝟸+𝟸',
      '𝙵𝚊𝚕𝚝𝚊 𝚖𝚊𝚝𝚎𝚛𝚒𝚊 𝚐𝚛𝚒𝚜',
      '𝚂𝚎 𝚌𝚊𝚎 𝚜𝚘𝚕𝚘',
      '𝙷𝚊𝚋𝚕𝚊 𝚜𝚒𝚗 𝚙𝚎𝚗𝚜𝚊𝚛',
      '𝚄𝚗 𝚖𝚒𝚕𝚊𝚐𝚛𝚘 𝚚𝚞𝚎 𝚏𝚞𝚗𝚌𝚒𝚘𝚗𝚎 😂'
    ]
  }
}

// ───────────────────────────────────────
// 𝙷𝙰𝙽𝙳𝙻𝙴𝚁
// ───────────────────────────────────────

const handler = async (m, ctx) => {

  const {
    conn,
    command,
    args,
    groupMetadata
  } = ctx

  const sender = m.sender

  // ═════════════════════════════════════
  // 𝚃𝙾𝙿 𝟻
  // ═════════════════════════════════════

  if (command in TIPOS_MAP) {

    if (!m.isGroup) {
      return m.reply(texto.soloGrupo)
    }

    const tipo =
      TIPOS_MAP[command]

    const data =
      TEXTOS_TOP[tipo]

    if (!data) return

    const participantes =
      groupMetadata?.participants
        ?.filter(p => !p.admin)
        ?.map(p => p.id)
        ?.filter(Boolean) || []

    if (participantes.length < 5) {
      return m.reply(texto.pocos5)
    }

    const top =
      [...participantes]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)

    const frases =
      [...data.frases]
        .sort(() => Math.random() - 0.5)

    let mensaje =
`${HEADER}

${data.emoji} *${data.titulo}*

`

    top.forEach((jid, i) => {

      const numero =
        jid.split('@')[0]

      const frase =
        frases[i] ||
        rnd(data.frases)

      mensaje +=
`${MEDALLAS[i]} *@${numero}*
> ✰ ${frase}

`
    })

    return conn.sendMessage(
      m.chat,
      {
        text: mensaje.trim(),
        mentions: top
      },
      { quoted: m }
    )
  }

  // ═════════════════════════════════════
  // 𝚃𝙾𝙿 𝟷𝟶
  // ═════════════════════════════════════

  if (
    command === 'top' ||
    command === 'top10'
  ) {

    if (!m.isGroup) {
      return m.reply(texto.soloGrupo)
    }

    const motivo =
      args.join(' ').trim()

    if (!motivo) {
      return m.reply(texto.sinMotivo)
    }

    const participantes =
      groupMetadata?.participants
        ?.map(p => p.id)
        ?.filter(jid =>
          jid !== sender &&
          jid !== 'status@broadcast'
        ) || []

    if (participantes.length < 10) {
      return m.reply(texto.pocos10)
    }

    const seleccionados =
      [...participantes]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)

    const emojis =
      pick(EMOJIS_TOP10, 10)

    let mensaje =
`${HEADER}

${rnd(EMOJIS_TOP10)} *𝚃𝙾𝙿 𝟷𝟶*
✰ ${motivo.toUpperCase()}

`

    seleccionados.forEach(
      (jid, i) => {

        const numero =
          jid.split('@')[0]

        mensaje +=
`${i + 1}. *@${numero}* ${emojis[i]}

`
      }
    )

    return conn.sendMessage(
      m.chat,
      {
        text: mensaje.trim(),
        mentions: seleccionados
      },
      { quoted: m }
    )
  }

  // ═════════════════════════════════════
  // 𝙿𝙴𝚃
  // ═════════════════════════════════════

  if (
    ['pet', 'mascota', 'acariciar']
      .includes(command)
  ) {

    const target =
      m.message
        ?.extendedTextMessage
        ?.contextInfo
        ?.mentionedJid?.[0] ||
      m.message
        ?.extendedTextMessage
        ?.contextInfo
        ?.participant ||
      sender

    const remitente =
      m.pushName ||
      sender.split('@')[0]

    const objetivo =
      target.split('@')[0]

    await m.react('🐾')

    const caption =
      target !== sender

        ? `${HEADER}

🐾 *𝙿𝙴𝚃*

✰ *${remitente}* 𝚕𝚎 𝚑𝚒𝚣𝚘 𝚌𝚊𝚛𝚒𝚌𝚒𝚊𝚜 𝚊 *${objetivo}* 🥰`

        : `${HEADER}

🐾 *𝙿𝙴𝚃*

✰ *${remitente}* 𝚜𝚎 𝚊𝚌𝚊𝚛𝚒𝚌𝚒ó 𝚜𝚘𝚕𝚒𝚝𝚘... 😅`

    const ts = Date.now()

    const gifPath =
      path.join(
        process.cwd(),
        `temp_pet_${ts}.gif`
      )

    const mp4Path =
      path.join(
        process.cwd(),
        `temp_pet_${ts}.mp4`
      )

    try {

      let userPic

      try {

        userPic =
          await conn.profilePictureUrl(
            target,
            'image'
          )

      } catch {

        userPic =
          DEFAULT_PIC
      }

      const response =
        await axios.get(
          `https://api.popcat.xyz/pet?image=${encodeURIComponent(userPic)}`,
          {
            responseType:
              'arraybuffer',
            timeout:
              15000
          }
        )

      fs.writeFileSync(
        gifPath,
        Buffer.from(response.data)
      )

      await new Promise(
        (resolve, reject) => {

          const comando =
            `ffmpeg -y -i "${gifPath}" ` +
            `-movflags faststart ` +
            `-pix_fmt yuv420p ` +
            `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ` +
            `-c:v libx264 "${mp4Path}"`

          exec(
            comando,
            error => {

              if (error)
                return reject(error)

              resolve()
            }
          )
        }
      )

      await conn.sendMessage(
        m.chat,
        {
          video:
            fs.readFileSync(mp4Path),

          gifPlayback:
            true,

          caption,

          mentions: [
            sender,
            target
          ]
        },
        { quoted: m }
      )

    } catch {

      await m.reply(
        texto.errorPet
      )

    } finally {

      await rm(
        gifPath,
        { force: true }
      ).catch(() => {})

      await rm(
        mp4Path,
        { force: true }
      ).catch(() => {})
    }

    return
  }
}

// ───────────────────────────────────────
// 𝙷𝙴𝙻𝙿
// ───────────────────────────────────────

handler.help = [
  'top <motivo>',
  'top10 <motivo>',
  'top5lindos',
  'top5feos',
  'top5otakus',
  'top5divas',
  'top5aventureros',
  'top5caoticos',
  'top5cornudos',
  'top5borrachos',
  'top5idiotas',
  'pet'
]

handler.tags = ['fun']

// ───────────────────────────────────────
// 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂
// ───────────────────────────────────────

handler.command = [
  'top5lindos',
  'lindos',
  'top5lindo',
  'top5lindas',

  'top5feos',
  'feos',
  'top5feo',

  'top5otakus',
  'otakus',
  'otaku',

  'top5divas',
  'divas',
  'top5diva',

  'top5aventureros',
  'aventureros',
  'aventurero',

  'top5caoticos',
  'caoticos',
  'caotico',

  'top5cornudos',
  'cornudos',
  'top5cornudo',
  'cornudo',

  'top5borrachos',
  'borrachos',
  'top5borracho',

  'top5idiotas',
  'idiotas',
  'top5idiota',

  'top',
  'top10',

  'pet',
  'mascota',
  'acariciar'
]

export default handler