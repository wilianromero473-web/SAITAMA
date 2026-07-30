 import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import axios from 'axios'
import FormData from 'form-data'
import ffmpeg from 'fluent-ffmpeg'
import config from '../../config.js'
import User from '../../lib/database/models/zen-users.js'

async function toMp3(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .save(output)
      .on('end', resolve)
      .on('error', reject)
  })
}

async function identifySong(filePath) {
  const timestamp = Math.floor(Date.now() / 1000)

  const stringToSign = [
    'POST',
    '/v1/identify',
    config.ACR_ACCESS_KEY,
    'audio',
    '1',
    timestamp
  ].join('\n')

  const signature = crypto
    .createHmac('sha1', config.ACR_ACCESS_SECRET)
    .update(stringToSign)
    .digest('base64')

  const form = new FormData()

  form.append('sample', fs.createReadStream(filePath))
  form.append('access_key', config.ACR_ACCESS_KEY)
  form.append('data_type', 'audio')
  form.append('signature_version', '1')
  form.append('signature', signature)
  form.append('timestamp', timestamp)

  const { data } = await axios.post(
    `https://${config.ACR_HOST}/v1/identify`,
    form,
    {
      headers: form.getHeaders(),
      timeout: 60000
    }
  )

  return data
}

async function sendShazamCard(conn, m, song, usedPrefix) {
  const spotifyId =
    song.external_metadata?.spotify?.track?.id

  const youtubeId =
    song.external_metadata?.youtube?.vid

  const spotifyUrl = spotifyId
    ? `https://open.spotify.com/track/${spotifyId}`
    : ''

  const youtubeUrl = youtubeId
    ? `https://youtu.be/${youtubeId}`
    : ''

  const cover =
    song.album?.images?.[0]?.url ||
    'https://i.imgur.com/8Km9tLL.jpg'

  const artist =
    song.artists?.map(a => a.name).join(', ') ||
    'Desconocido'

  const title =
    song.title ||
    'Desconocido'

  const album =
    song.album?.name ||
    'Desconocido'

  const releaseDate =
    song.release_date ||
    'Desconocida'

  const caption = `
╭━━━〔 🎧 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 〕━━━⬣
┃
┃ 🎵 𝐌𝐔́𝐒𝐈𝐂 𝐑𝐄𝐂𝐎𝐆𝐍𝐈𝐙𝐄𝐃
┃
┣━━〔 🎶 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈𝐎́𝐍 〕━━⬣
┃
┃ 🎼 𝐓𝐢́𝐭𝐮𝐥𝐨:
┃ └─ ${title}
┃
┃ 🎤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚:
┃ └─ ${artist}
┃
┃ 💿 𝐀́𝐥𝐛𝐮𝐦:
┃ └─ ${album}
┃
┃ 📅 𝐅𝐞𝐜𝐡𝐚:
┃ └─ ${releaseDate}
┃
┣━━〔 ⚙️ 𝐎𝐏𝐂𝐈𝐎𝐍𝐄𝐒 〕━━━━⬣
┃
┃ ✨ Selecciona una opción
┃ para descargar esta canción.
┃
╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

  const buttons = [
    {
      text: '⚙️ 𝐎𝐏𝐂𝐈𝐎𝐍𝐄𝐒',
      sections: [
        {
          title: '✦ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐋𝐄𝐒 ✦',
          rows: [
            {
              title: '🎵 𝐒𝐩𝐨𝐭𝐢𝐟𝐲 𝐌𝐏𝟑',
              description: '✧ Descargar audio en MP3',
              id: `${usedPrefix}spotifymp3 ${spotifyUrl}`
            },
            {
              title: '📁 𝐒𝐩𝐨𝐭𝐢𝐟𝐲 𝐃𝐨𝐜𝐮𝐦𝐞𝐧𝐭𝐨',
              description: '✧ Enviar audio como documento',
              id: `${usedPrefix}spotifymp3doc ${spotifyUrl}`
            },
            {
              title: '▶️ 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐌𝐏𝟑',
              description: '✧ Descargar audio en MP3',
              id: `${usedPrefix}ytmp3 ${youtubeUrl}`
            },
            {
              title: '📄 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐃𝐨𝐜𝐮𝐦𝐞𝐧𝐭𝐨',
              description: '✧ Enviar audio como documento',
              id: `${usedPrefix}ytmp3doc ${youtubeUrl}`
            }
          ]
        }
      ]
    }
  ]

  await conn.sendMessage(
    m.chat,
    {
      image: {
        url: cover
      },

      caption,

      footer:
        `✦ ${config.botName} ✦`,

      buttons
    },
    {
      quoted: m
    }
  )
}

const handler = async (
  m,
  {
    conn,
    usedPrefix,
    userDb
  }
) => {

  const q =
    m.quoted
      ? m.quoted
      : m

  const mime =
    q.msg?.mimetype ||
    q.mediaType ||
    ''

  if (!/audio|video/.test(mime)) {
    return m.reply(
`╭━━━〔 🎧 𝐒𝐇𝐀𝐙𝐀𝐌 〕━━━⬣
┃
┃ ❌ 𝐌𝐄𝐃𝐈𝐀 𝐍𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎
┃
┃ Responde a un audio o video
┃ para reconocer la canción.
┃
┣━━〔 💡 𝐄𝐉𝐄𝐌𝐏𝐋𝐎 〕━━━━⬣
┃
┃ ${usedPrefix}shazam
┃
╰━━━━━━━━━━━━━━━━━━⬣`
    )
  }

  if (userDb.genos < 1) {
    return m.reply(
`╭━━━〔 💎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 〕━━━⬣
┃
┃ ❌ 𝐒𝐈𝐍 ${config.PREMIUM_NAME}
┃
┃ Necesitas *1 ${config.PREMIUM_NAME}*
┃ para utilizar este comando.
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 💎 Disponible: ${userDb.genos || 0}
╰━━━━━━━━━━━━━━━━━━⬣`
    )
  }

  const tmpDir =
    os.tmpdir()

  const input =
    path.join(
      tmpDir,
      `shazam_${Date.now()}`
    )

  const output =
    `${input}.mp3`

  try {

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '🎧',
          key: m.key
        }
      }
    )

    const buffer =
      await q.download()

    fs.writeFileSync(
      input,
      buffer
    )

    if (/video/.test(mime)) {
      await toMp3(
        input,
        output
      )
    } else {
      fs.renameSync(
        input,
        output
      )
    }

    const result =
      await identifySong(
        output
      )

    if (result.status?.code !== 0) {
      throw new Error(
        'No se reconoció la canción'
      )
    }

    const song =
      result.metadata?.music?.[0]

    if (!song) {
      throw new Error(
        'Sin resultados'
      )
    }

    await sendShazamCard(
      conn,
      m,
      song,
      usedPrefix
    )

    await User.updateOne(
      {
        jid: m.sender
      },
      {
        $inc: {
          genos: -1
        }
      }
    )

    userDb.genos =
      Math.max(
        0,
        (userDb.genos || 0) - 1
      )

    await conn.sendMessage(
      m.chat,
      {
        text:
`╭━━━〔 💎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 〕━━━⬣
┃
┃ ${config.PREMIUM_SYMBOL} Utilizaste *1 ${config.PREMIUM_NAME}*
┃
┃ 💎 Restantes:
┃ └─ ${userDb.genos}
┃
╰━━━━━━━━━━━━━━━━━━⬣`
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
    )

  } catch (e) {

    console.error(
      '[SHAZAM]',
      e
    )

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
`╭━━━〔 ❌ 𝐒𝐇𝐀𝐙𝐀𝐌 〕━━━⬣
┃
┃ ⚠️ 𝐄𝐑𝐑𝐎𝐑
┃
┃ ${e.message}
┃
╰━━━━━━━━━━━━━━━━━━⬣`
    )

  } finally {

    if (
      fs.existsSync(input)
    ) {
      fs.unlinkSync(input)
    }

    if (
      fs.existsSync(output)
    ) {
      fs.unlinkSync(output)
    }
  }
}

handler.help = [
  'shazam'
]

handler.tags = [
  'busquedas'
]

handler.command = [
  'shazam',
  'music'
]

export default handler