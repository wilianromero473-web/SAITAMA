import axios from 'axios'
import config from '../../config.js'


// ═══════════════════════════════════════
// ✰ SAITAMABOT • SPOTIFY MP3 DOCUMENT
// ═══════════════════════════════════════

const STELLAR_API =
  'https://api.stellarwa.xyz'

const STELLAR_KEY =
  'proyectsV2'


const BOT_NAME =
  config.botName ||
  '𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃'


// ═══════════════════════════════════════
// ✰ LIMPIAR NOMBRE
// ═══════════════════════════════════════

function cleanFileName(name) {

  return String(
    name || 'Spotify Music'
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
    .slice(
      0,
      150
    )

}


// ═══════════════════════════════════════
// ✰ VALIDAR SPOTIFY
// ═══════════════════════════════════════

function isSpotifyTrack(url) {

  return /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+/i
    .test(
      String(url || '').trim()
    )

}


// ═══════════════════════════════════════
// ✰ HANDLER
// ═══════════════════════════════════════

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

    const url =
      String(
        text || ''
      ).trim()


    // ═════════════════════════════════
    // ✰ SIN URL
    // ═════════════════════════════════

    if (!url) {

      return m.reply(

`༺ 𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙼𝙿𝟹 𝙳𝙾𝙲 ༻

✰ 𝙴𝚗𝚟í𝚊 𝚎𝚕 𝚎𝚗𝚕𝚊𝚌𝚎 𝚍𝚎 𝚞𝚗𝚊 𝚌𝚊𝚗𝚌𝚒ó𝚗 𝚍𝚎 𝚂𝚙𝚘𝚝𝚒𝚏𝚢.

✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘:
${usedPrefix + command} https://open.spotify.com/track/09mEdoA6zrmBPgTEN5qXmN

✰ ${BOT_NAME}`

      )

    }


    // ═════════════════════════════════
    // ✰ VALIDAR URL
    // ═════════════════════════════════

    if (!isSpotifyTrack(url)) {

      return m.reply(

`༺ 𝙴𝚁𝚁𝙾𝚁 𝚂𝙿𝙾𝚃𝙸𝙵𝚈 ༻

✰ 𝙻𝚊 𝚄𝚁𝙻 𝚗𝚘 𝚎𝚜 𝚟á𝚕𝚒𝚍𝚊.

✰ 𝙳𝚎𝚋𝚎𝚜 𝚎𝚗𝚟𝚒𝚊𝚛 𝚞𝚗𝚊 𝚄𝚁𝙻 𝚍𝚎 𝚞𝚗𝚊 𝚌𝚊𝚗𝚌𝚒ó𝚗:

https://open.spotify.com/track/...

✰ ${BOT_NAME}`

      )

    }


    // ═════════════════════════════════
    // ✰ REACCIÓN INICIAL
    // ═════════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '📄',
          key: m.key
        }
      }
    ).catch(() => {})


    // ═════════════════════════════════
    // ✰ STELLARWA
    // ═════════════════════════════════

    const response =
      await axios.get(

        `${STELLAR_API}/dl/spotify`,

        {

          params: {

            url,

            key:
              STELLAR_KEY

          },

          timeout:
            120000,

          validateStatus:
            status =>
              status >= 200 &&
              status < 500

        }

      )


    const data =
      response?.data


    // ═════════════════════════════════
    // ✰ VALIDAR RESPUESTA
    // ═════════════════════════════════

    if (!data) {

      throw new Error(
        'StellarWA no devolvió respuesta.'
      )

    }


    if (
      data.status === false
    ) {

      throw new Error(

        data.message ||
        data.msg ||
        'StellarWA rechazó la solicitud.'

      )

    }


    // ═════════════════════════════════
    // ✰ INFORMACIÓN
    // ═════════════════════════════════

    const song =
      data.data ||
      data.result ||
      {}


    const audioUrl =
      song.dl ||
      song.mp3 ||
      song.download ||
      song.url


    if (!audioUrl) {

      throw new Error(
        'StellarWA no devolvió el enlace del MP3.'
      )

    }


    const title =
      song.title ||
      song.name ||
      'Spotify Music'


    const artist =
      song.artist ||
      song.artists ||
      'Desconocido'


    const album =
      song.album ||
      'Desconocido'


    const duration =
      song.duration ||
      'Desconocida'


    const year =
      song.year ||
      song.publish ||
      'Desconocido'


    // ═════════════════════════════════
    // ✰ NOMBRE DEL ARCHIVO
    // ═════════════════════════════════

    const fileName =
      `${cleanFileName(title)} - ${cleanFileName(artist)}.mp3`


    // ═════════════════════════════════
    // ✰ DESCARGAR MP3
    // ═════════════════════════════════

    const audioResponse =
      await axios.get(

        audioUrl,

        {

          responseType:
            'arraybuffer',

          timeout:
            180000,

          maxContentLength:
            Infinity,

          maxBodyLength:
            Infinity

        }

      )


    const audioBuffer =
      Buffer.from(
        audioResponse.data
      )


    if (
      !audioBuffer ||
      !audioBuffer.length
    ) {

      throw new Error(
        'El archivo MP3 está vacío.'
      )

    }


    // ═════════════════════════════════
    // ✰ INFORMACIÓN DEL DOCUMENTO
    // ═════════════════════════════════

    const caption =

`༺ 𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙼𝙿𝟹 ༻

✰ 𝚃í𝚝𝚞𝚕𝚘:
${title}
✰ 𝙰𝚛𝚝𝚒𝚜𝚝𝚊:
${artist}
✰ 𝙰́𝚕𝚋𝚞𝚖:
${album}
✰ 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:
${duration}
✰ 𝙰ñ𝚘:
${year}
✰ 𝙵𝚘𝚛𝚖𝚊𝚝𝚘:
MP3

✰ ${BOT_NAME}`


    // ═════════════════════════════════
    // ✰ ENVIAR DOCUMENTO
    // ═════════════════════════════════

    await conn.sendMessage(

      m.chat,

      {

        document:
          audioBuffer,

        mimetype:
          'audio/mpeg',

        fileName,

        caption

      },

      {

        quoted:
          m

      }

    )


    // ═════════════════════════════════
    // ✰ REACCIÓN FINAL
    // ═════════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    ).catch(() => {})


  } catch (error) {

    console.error(
      '[SPOTIFY MP3 DOC]',
      error?.response?.data ||
      error?.message ||
      error
    )


    // ═════════════════════════════════
    // ✰ REACCIÓN ERROR
    // ═════════════════════════════════

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '❌',
          key: m.key
        }
      }
    ).catch(() => {})


    const details =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      error?.message ||
      'Error desconocido.'


    return m.reply(

`༺ 𝙴𝚁𝚁𝙾𝚁 𝚂𝙿𝙾𝚃𝙸𝙵𝚈 ༻

✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚎𝚗𝚟𝚒𝚊𝚛 𝚎𝚕 𝙼𝙿𝟹 𝚌𝚘𝚖𝚘 𝚍𝚘𝚌𝚞𝚖𝚎𝚗𝚝𝚘.

✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
${String(details).slice(0, 350)}

✰ ${BOT_NAME}`

    )

  }

}


// ═══════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═══════════════════════════════════════

handler.help = [
  'spotifymp3doc <url>'
]


handler.tags = [
  'descargas'
]


handler.command = [
  'spotifymp3doc',
  'spmp3doc'
]


export default handler