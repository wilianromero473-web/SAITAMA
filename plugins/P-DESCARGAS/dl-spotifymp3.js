import axios from 'axios'
import config from '../../config.js'


/* ═════════════════════════════════════
   🎵 STELLARWA SPOTIFY MP3
═════════════════════════════════════ */

const STELLAR_API =
  'https://api.stellarwa.xyz'

const STELLAR_KEY =
  'proyectsV2'


/* ═════════════════════════════════════
   🧹 LIMPIAR NOMBRE
═════════════════════════════════════ */

function cleanFileName(name) {

  return String(name || 'Spotify Music')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150)

}


/* ═════════════════════════════════════
   🔗 VALIDAR SPOTIFY
═════════════════════════════════════ */

function isSpotifyTrack(url) {

  return /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+/i
    .test(
      String(url || '').trim()
    )

}


/* ═════════════════════════════════════
   🎵 HANDLER
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

`╭━━━〔 🎧 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐌𝐏𝟑 〕━━━⬣

✦ Envía el enlace de una canción de Spotify.

✧ Ejemplo:

${usedPrefix + command} https://open.spotify.com/track/09mEdoA6zrmBPgTEN5qXmN

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`

      )

    }


    /* ═══════════════════════════════
       🔗 VALIDAR URL
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

          text: '🎵',

          key: m.key

        }

      }

    ).catch(() => {})


    /* ═══════════════════════════════
       ⏳ ESPERANDO
    ═══════════════════════════════ */

    await m.reply(

`╭━━━〔 🎧 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 〕━━━⬣

⏳ Descargando audio...

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
       📦 COMPROBAR RESPUESTA
    ═══════════════════════════════ */

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


    /* ═══════════════════════════════
       🎵 OBTENER INFORMACIÓN
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
       🎵 DATOS
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
       🧹 NOMBRE MP3
    ═══════════════════════════════ */

    const fileName =
      `${cleanFileName(title)} - ${cleanFileName(artist)}.mp3`


    /* ═══════════════════════════════
       📝 CAPTION
    ═══════════════════════════════ */

    const caption =

`╭━━━〔 🎧 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐌𝐏𝟑 〕━━━⬣
┃
┃ 🎵 𝐓í𝐭𝐮𝐥𝐨 ❯ ${title}
┃ 👤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚 ❯ ${artist}
┃ 💿 𝐀́𝐥𝐛𝐮𝐦 ❯ ${album}
┃ ⏱️ 𝐃𝐮𝐫𝐚𝐜𝐢ó𝐧 ❯ ${duration}
┃ 📅 𝐀ñ𝐨 ❯ ${year}
┃
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`


    /* ═══════════════════════════════
       📥 DESCARGAR AUDIO
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


    if (
      !audioBuffer.length
    ) {

      throw new Error(
        'El archivo MP3 está vacío.'
      )

    }


    /* ═══════════════════════════════
       📤 ENVIAR AUDIO
    ═══════════════════════════════ */

    const audioMessage = {

      audio:
        audioBuffer,

      mimetype:
        'audio/mpeg',

      fileName,

      ptt:
        false,

      contextInfo:

        cover

          ? {

              externalAdReply: {

                title:
                  title,

                body:
                  artist,

                thumbnailUrl:
                  cover,

                mediaType:
                  1,

                renderLargerThumbnail:
                  true,

                sourceUrl:
                  url

              }

            }

          : undefined

    }


    await conn.sendMessage(

      m.chat,

      audioMessage,

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

          text:
            '✅',

          key:
            m.key

        }

      }

    ).catch(() => {})

  } catch (error) {

    console.error(

      '[STELLAR SPOTIFY MP3]',

      error?.response?.data ||
      error?.message ||
      error

    )


    /* ═══════════════════════════════
       ❌ REACCIÓN
    ═══════════════════════════════ */

    await conn.sendMessage(

      m.chat,

      {

        react: {

          text:
            '❌',

          key:
            m.key

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
┃ No se pudo descargar el audio.
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

  'spotifymp3 <url>'

]


handler.tags = [

  'descargas'

]


handler.command = [

  'spotifymp3',

  'spmp3'

]


export default handler