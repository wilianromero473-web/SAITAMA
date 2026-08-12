import axios from 'axios'
import config from '../../config.js'


/* ═════════════════════════════════════
   🎵 STELLARWA SPOTIFY MP3 DOCUMENTO
═════════════════════════════════════ */

const STELLAR_API =
  'https://api.stellarwa.xyz'

const STELLAR_KEY =
  'proyectsV2'


/* ═════════════════════════════════════
   🧹 LIMPIAR NOMBRE DE ARCHIVO
═════════════════════════════════════ */

function cleanFileName(name) {

  return String(name || 'Spotify Music')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150)

}


/* ═════════════════════════════════════
   🔗 VALIDAR URL DE SPOTIFY
═════════════════════════════════════ */

function isSpotifyTrack(url) {

  return /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+/i
    .test(
      String(url || '').trim()
    )

}


/* ═════════════════════════════════════
   📄 HANDLER
═════════════════════════════════════ */

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


    /* ═══════════════════════════════
       ❌ SIN URL
    ═══════════════════════════════ */

    if (!url) {

      return m.reply(

`╭━━━〔 📄 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐌𝐏𝟑 〕━━━⬣

✦ Envía el enlace de una canción de Spotify.

✧ Ejemplo:

${usedPrefix + command} https://open.spotify.com/track/09mEdoA6zrmBPgTEN5qXmN

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`

      )

    }


    /* ═══════════════════════════════
       🔗 VALIDAR SPOTIFY
    ═══════════════════════════════ */

    if (!isSpotifyTrack(url)) {

      return m.reply(

`╭━━━〔 ❌ 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕━━━⬣

La URL no es válida.

✦ Debes enviar una URL de una canción:

https://open.spotify.com/track/...

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`

      )

    }


    /* ═══════════════════════════════
       🔎 REACCIÓN
    ═══════════════════════════════ */

    await conn.sendMessage(

      m.chat,

      {

        react: {

          text: '📄',

          key: m.key

        }

      }

    ).catch(() => {})


    /* ═══════════════════════════════
       ⏳ MENSAJE
    ═══════════════════════════════ */

    await m.reply(

`╭━━━〔 📄 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐌𝐏𝟑 〕━━━⬣

⏳ Preparando documento MP3...

🔗 Spotify:
${url}

✦ ${config.botName || 'SaitamaBot'}`

    )


    /* ═══════════════════════════════
       📡 STELLARWA
    ═══════════════════════════════ */

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


    /* ═══════════════════════════════
       ❌ SIN RESPUESTA
    ═══════════════════════════════ */

    if (!data) {

      throw new Error(
        'StellarWA no devolvió respuesta.'
      )

    }


    /* ═══════════════════════════════
       ❌ API RECHAZÓ
    ═══════════════════════════════ */

    if (
      data.status === false
    ) {

      throw new Error(

        data.message ||
        data.msg ||
        'StellarWA rechazó la solicitud.'

      )

    }


    /* ═══════════════════════════════
       📦 DATOS
    ═══════════════════════════════ */

    const song =
      data.data ||
      data.result ||
      {}


    /* ═══════════════════════════════
       🔗 URL DEL AUDIO
    ═══════════════════════════════ */

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


    /* ═══════════════════════════════
       🎵 INFORMACIÓN
    ═══════════════════════════════ */

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


    const cover =
      song.cover ||
      song.image ||
      song.thumbnail ||
      null


    /* ═══════════════════════════════
       🧹 NOMBRE DEL DOCUMENTO
    ═══════════════════════════════ */

    const fileName =
      `${cleanFileName(title)} - ${cleanFileName(artist)}.mp3`


    /* ═══════════════════════════════
       📥 DESCARGAR MP3
    ═══════════════════════════════ */

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


    /* ═══════════════════════════════
       ❌ ARCHIVO VACÍO
    ═══════════════════════════════ */

    if (
      !audioBuffer ||
      !audioBuffer.length
    ) {

      throw new Error(
        'El archivo MP3 está vacío.'
      )

    }


    /* ═══════════════════════════════
       📝 CAPTION
    ═══════════════════════════════ */

    const caption =

`╭━━━〔 📄 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐌𝐏𝟑 〕━━━⬣
┃
┃ 🎵 𝐓í𝐭𝐮𝐥𝐨 ❯ ${title}
┃ 👤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚 ❯ ${artist}
┃ 💿 𝐀́𝐥𝐛𝐮𝐦 ❯ ${album}
┃ ⏱️ 𝐃𝐮𝐫𝐚𝐜𝐢ó𝐧 ❯ ${duration}
┃ 📅 𝐀ñ𝐨 ❯ ${year}
┃
┃ 📄 𝐅𝐨𝐫𝐦𝐚𝐭𝐨 ❯ MP3
┃
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`


    /* ═══════════════════════════════
       📤 ENVIAR COMO DOCUMENTO
    ═══════════════════════════════ */

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


    /* ═══════════════════════════════
       ✅ REACCIÓN
    ═══════════════════════════════ */

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

      '[STELLAR SPOTIFY MP3 DOC]',

      error?.response?.data ||
      error?.message ||
      error

    )


    /* ═══════════════════════════════
       ❌ REACCIÓN ERROR
    ═══════════════════════════════ */

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

`╭━━━〔 ❌ 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐌𝐏𝟑 〕━━━⬣
┃
┃ No se pudo enviar el MP3 como documento.
┃
┃ ⚠️ Detalles:
┃ ${String(details).slice(0, 350)}
┃
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`

    )

  }

}


/* ═════════════════════════════════════
   ⚙️ CONFIGURACIÓN
═════════════════════════════════════ */

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