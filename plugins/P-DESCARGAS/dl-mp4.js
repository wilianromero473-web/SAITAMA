import fetch from 'node-fetch'
import https from 'https'
import dns from 'dns'
import config from '../../config.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌸 SAITAMABOT • YOUTUBE MP4
//
// 🔎 SEARCH:
//    AZBRY
//
// 📥 DOWNLOAD:
//    SaiAPI1 → AZBRY
//    SaiAPI2 → SYLPHY
//
// 🔄 FALLBACK:
//    Si Azbry falla → Sylphy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


// ╭──────────────────────────────────────╮
// │              SAI API 1               │
// │                AZBRY                  │
// ╰──────────────────────────────────────╯

const SEARCH_API =
  'https://api.azbry.com/api/search/yts'

const AZBRY_DOWNLOAD_API =
  'https://api.azbry.com/api/download/ytmp4'


// ╭──────────────────────────────────────╮
// │              SAI API 2               │
// │               SYLPHY                  │
// ╰──────────────────────────────────────╯

const SYLPHY_API =
  'https://www.sylphyy.xyz/download/ytmp4'

const SYLPHY_API_KEY =
  'sylph-d7ed7664'


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'

const API_TIMEOUT =
  60_000

const DOWNLOAD_TIMEOUT =
  300_000


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌐 IPV4
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

dns.setDefaultResultOrder(
  'ipv4first'
)

const httpsAgent =
  new https.Agent({
    family: 4,
    keepAlive: true
  })


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 DETECTAR YOUTUBE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function isYouTubeUrl(text = '') {

  return /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i
    .test(
      text.trim()
    )
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌐 PETICIÓN JSON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function requestJson(
  url,
  options = {}
) {

  const response =
    await fetch(
      url,
      {
        method: 'GET',

        agent:
          httpsAgent,

        headers: {
          'User-Agent':
            USER_AGENT,

          'Accept':
            'application/json',

          ...(options.headers || {})
        },

        redirect:
          'follow',

        timeout:
          API_TIMEOUT
      }
    )

  const body =
    await response.text()

  if (!response.ok) {

    throw new Error(
      `HTTP ${response.status}`
    )
  }

  let json

  try {

    json =
      JSON.parse(body)

  } catch {

    throw new Error(
      'La API no devolvió JSON válido'
    )
  }

  return json
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔎 BUSCAR YOUTUBE • AZBRY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function searchYouTube(
  query
) {

  const apiUrl =
    `${SEARCH_API}?q=${encodeURIComponent(query)}`

  const json =
    await requestJson(
      apiUrl
    )

  if (
    !json?.status
  ) {

    throw new Error(
      'Azbry no encontró resultados'
    )
  }

  if (
    !Array.isArray(
      json?.result
    ) ||
    !json.result.length
  ) {

    throw new Error(
      'No se encontraron vídeos'
    )
  }

  const first =
    json.result[0]

  if (
    !first?.url
  ) {

    throw new Error(
      'El resultado de Azbry no tiene URL'
    )
  }

  return {

    title:
      first.title ||
      'Vídeo de YouTube',

    thumbnail:
      first.thumbnail ||
      null,

    duration:
      first.duration ||
      'Desconocida',

    uploaded:
      first.uploaded ||
      null,

    views:
      first.views ||
      null,

    url:
      first.url,

    videoId:
      first.videoId ||
      null

  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📥 SAI API 1 • AZBRY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function downloadAzbry(
  url
) {

  const apiUrl =
    `${AZBRY_DOWNLOAD_API}?url=${encodeURIComponent(url)}`

  const json =
    await requestJson(
      apiUrl
    )

  if (
    !json?.status
  ) {

    throw new Error(
      'Azbry no pudo procesar el vídeo'
    )
  }

  const result =
    json?.result

  if (
    !result
  ) {

    throw new Error(
      'Azbry no devolvió result'
    )
  }

  if (
    !result.download
  ) {

    throw new Error(
      'Azbry no devolvió URL de descarga'
    )
  }

  return {

    title:
      result.title ||
      'Vídeo de YouTube',

    author:
      result.author ||
      'Desconocido',

    thumbnail:
      result.thumbnail ||
      null,

    duration:
      result.duration ||
      'Desconocida',

    quality:
      result.quality ||
      'Desconocida',

    download:
      result.download,

    format:
      result.format ||
      'mp4',

    api:
      'SaiAPI1 • Azbry'

  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📥 SAI API 2 • SYLPHY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function downloadSylphy(
  url
) {

  const apiUrl =
    `${SYLPHY_API}?url=${encodeURIComponent(url)}`

  const json =
    await requestJson(
      apiUrl,
      {
        headers: {

          'X-API-Key':
            SYLPHY_API_KEY

        }
      }
    )

  if (
    !json?.status
  ) {

    throw new Error(
      'Sylphy no pudo procesar el vídeo'
    )
  }

  const result =
    json?.result

  if (
    !result
  ) {

    throw new Error(
      'Sylphy no devolvió result'
    )
  }

  if (
    !result.dl_url
  ) {

    throw new Error(
      'Sylphy no devolvió dl_url'
    )
  }

  return {

    title:
      result.title ||
      'Vídeo de YouTube',

    author:
      result.author ||
      'Desconocido',

    quality:
      result.quality ||
      'Desconocida',

    download:
      result.dl_url,

    format:
      'mp4',

    api:
      'SaiAPI2 • Sylphy'

  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📥 DESCARGAR ARCHIVO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function downloadVideo(
  url
) {

  const response =
    await fetch(
      url,
      {

        method:
          'GET',

        agent:
          httpsAgent,

        headers: {

          'User-Agent':
            USER_AGENT,

          'Accept':
            'video/mp4,video/*,*/*'

        },

        redirect:
          'follow',

        timeout:
          DOWNLOAD_TIMEOUT

      }
    )

  if (
    !response.ok
  ) {

    throw new Error(
      `DESCARGA HTTP ${response.status}`
    )
  }

  const contentType =
    response.headers.get(
      'content-type'
    ) || ''

  // Evitar guardar HTML/JSON como MP4
  if (
    contentType.includes(
      'text/html'
    ) ||
    contentType.includes(
      'application/json'
    )
  ) {

    throw new Error(
      `El servidor no devolvió vídeo (${contentType})`
    )
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    )

  if (
    !buffer.length
  ) {

    throw new Error(
      'El archivo de vídeo está vacío'
    )
  }

  return buffer
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🕐 DURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function formatDuration(
  seconds
) {

  if (
    seconds === null ||
    seconds === undefined ||
    seconds === ''
  ) {

    return 'Desconocida'
  }

  if (
    typeof seconds === 'string' &&
    seconds.includes(':')
  ) {

    return seconds
  }

  const total =
    Number(seconds)

  if (
    !Number.isFinite(total)
  ) {

    return String(seconds)
  }

  const hours =
    Math.floor(
      total / 3600
    )

  const minutes =
    Math.floor(
      (total % 3600) / 60
    )

  const secs =
    Math.floor(
      total % 60
    )

  if (
    hours > 0
  ) {

    return (
      `${hours}:` +
      `${String(minutes).padStart(2, '0')}:` +
      `${String(secs).padStart(2, '0')}`
    )
  }

  return (
    `${minutes}:` +
    `${String(secs).padStart(2, '0')}`
  )
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 NOMBRE SEGURO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function safeFileName(
  title
) {

  return String(title)

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
      80
    )

    ||
    'youtube-video'
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const handler =
  async (
    m,
    {
      conn,
      text,
      usedPrefix,
      command
    }
  ) => {

    const input =
      String(
        text || ''
      ).trim()


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ SIN TEXTO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (
      !input
    ) {

      return m.reply(

`╭━━━〔 🎬 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐌𝐏𝟒 〕━━━⬣

❗ *Falta la canción o enlace.*

🎬 *Por nombre:*
${usedPrefix + command} Ozuna ZIZI

🔗 *Por URL:*
${usedPrefix + command} https://youtu.be/xxxxx

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`
      )
    }


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⏳ REACCIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await conn
      .sendMessage(
        m.chat,
        {
          react: {
            text: '⏳',
            key: m.key
          }
        }
      )
      .catch(
        () => {}
      )


    try {

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔎 OBTENER URL
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      let searchData

      if (
        isYouTubeUrl(
          input
        )
      ) {

        searchData = {

          title:
            'Vídeo de YouTube',

          thumbnail:
            null,

          duration:
            'Desconocida',

          url:
            input

        }

      } else {

        searchData =
          await searchYouTube(
            input
          )
      }


      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📝 INFORMACIÓN DE BÚSQUEDA
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const infoCaption =

`╭━━━〔 🎬 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐌𝐏𝟒 〕━━━⬣

🎬 *${searchData.title}*

⏱️ *Duración:* ${searchData.duration || 'Desconocida'}

${searchData.uploaded
  ? `📅 *Publicado:* ${searchData.uploaded}\n`
  : ''}${searchData.views
  ? `👁️ *Vistas:* ${searchData.views}\n`
  : ''}
🌐 *Búsqueda:* SaiAPI1 • SaitamaBot

📥 *Preparando vídeo...*

╰━━━━━━━━━━━━━━━━━━━━━━⬣

⏳ *Espera un momento...*

🌸 ${config.botName || 'SaitamaBot'}`


      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🖼️ ENVIAR MINIATURA
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      if (
        searchData.thumbnail
      ) {

        await conn.sendMessage(
          m.chat,
          {

            image: {
              url:
                searchData.thumbnail
            },

            caption:
              infoCaption

          },
          {
            quoted:
              m
          }
        )

      } else {

        await m.reply(
          infoCaption
        )
      }


      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📥 DESCARGA
      //
      // SAI API 1 → AZBRY
      // SAI API 2 → SYLPHY
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      let data

      let usedApi


      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🥇 INTENTO 1 • AZBRY
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      try {

        data =
          await downloadAzbry(
            searchData.url
          )

        usedApi =
          'SaiAPI1 • SaitamaBot'

      } catch {

        // ━━━━━━━━━━━━━━━━━━━━━━━━
        // 🥈 INTENTO 2 • SYLPHY
        // ━━━━━━━━━━━━━━━━━━━━━━━━

        try {

          data =
            await downloadSylphy(
              searchData.url
            )

          usedApi =
            'SaiAPI2 • SaitamaBot'

        } catch {

          throw new Error(
            'SaiAPI1 y SaiAPI2 no pudieron descargar el vídeo'
          )
        }
      }


      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📥 DESCARGAR VÍDEO
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const videoBuffer =
        await downloadVideo(
          data.download
        )


      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📝 CAPTION FINAL
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const finalCaption =

`╭━━━〔 🎬 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐌𝐏𝟒 〕━━━⬣

🎬 *${data.title}*

👤 *Autor:* ${data.author || 'Desconocido'}

⏱️ *Duración:* ${
  formatDuration(
    data.duration
  )
}

📺 *Calidad:* ${
  data.quality ||
  'Desconocida'
}

🎞️ *Formato:* MP4

🌐 *API:* ${usedApi}

╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`


      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🎥 ENVIAR VÍDEO
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      await conn.sendMessage(
        m.chat,
        {

          video:
            videoBuffer,

          mimetype:
            'video/mp4',

          fileName:
            `${safeFileName(
              data.title
            )}.mp4`,

          caption:
            finalCaption

        },
        {
          quoted:
            m
        }
      )


      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ✅ FINAL
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      await conn
        .sendMessage(
          m.chat,
          {
            react: {
              text: '✅',
              key: m.key
            }
          }
        )
        .catch(
          () => {}
        )


    } catch (
      error
    ) {

      await conn
        .sendMessage(
          m.chat,
          {
            react: {
              text: '❌',
              key: m.key
            }
          }
        )
        .catch(
          () => {}
        )


      return m.reply(

`╭━━━〔 ❌ 𝐌𝐏𝟒 𝐄𝐑𝐑𝐎𝐑 〕━━━╮

No se pudo descargar el vídeo.

⚠️ *Detalles:*
${String(
  error?.message ||
  error
).slice(
  0,
  300
)}

🔄 Intenta nuevamente con otro
nombre o enlace.

╰━━━━━━━━━━━━━━━━━━━━━━╯

🌸 ${config.botName || 'SaitamaBot'}`
      )
    }
  }


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [

  'mp4 <canción>',

  'mp4 <url>',

  'video <canción>',

  'video <url>'

]

handler.tags = [
  'descargas'
]

handler.command = [

  'mp4',

  'mp4dl',

  'videodl',

  'video'

]

export default handler