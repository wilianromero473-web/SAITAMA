import fetch from 'node-fetch'
import config from '../../config.js'


// ━━━━━━━ API TIKTOK ━━━━━━━
const API_URL = 'https://api.stellarwa.xyz'
const API_KEY = 'proyectsV2'
// ━━━━━━━━━━━━━━━━━━━━━━━━━━



const handler = async (m, { conn, text }) => {

  let url = text?.trim() || ''


  if (!url && m.quoted) {
    const quotedText = m.quoted.body || m.quoted.text || ''
    const match = quotedText.match(/https?:\/\/[^\s]+/i)

    if (match) url = match[0]
  }


  if (!url)
    return m.reply(
`*⌬┤ ✙ ├⌬ ENLACE REQUERIDO.*

> Envía un enlace válido de TikTok.`
    )


  if (!/tiktok\.com|vt\.tiktok\.com/i.test(url))
    return m.reply(
`*⌬┤ ✙ ├⌬ ENLACE INVÁLIDO.*

> El enlace no pertenece a TikTok.`
    )


  await m.reply(
`*⌬┤ 📥 ├⌬ DESCARGANDO...*

> SaitamaBot procesando TikTok 🌸`
  )


try {


const api =
`${API_URL}/dl/tiktok?url=${encodeURIComponent(url)}&key=${API_KEY}`


const res = await fetch(api)
const json = await res.json()

const data = json.data


if (!data)
return m.reply(
`*⌬┤ ❌ ├⌬ ERROR.*

> La API no devolvió datos.`
)



//━━━━━━━━━━━━━━━━
// TIKTOK IMÁGENES
//━━━━━━━━━━━━━━━━

if (data.type === 'images' && data.images?.length) {


const album = data.images.map((img, i)=>({

type:'image',

data:{
url:img
},

caption:
i === 0
? `╭━━━〔 🖼️ TIKTOK 〕━━━⬣

✿ ${data.title || 'Sin título'}
👤 ${data.author?.nickname || 'Desconocido'}
📸 Imágenes:
${data.images.length}
🌸 ${config.botName || 'SaitamaBot'}

╰━━━━━━━━━━━━⬣`
: ''

}))


await conn.sendAlbumMessage(
m.chat,
album,
{
quoted:m
}
)


return
}



//━━━━━━━━━━━━━━━━
// TIKTOK VIDEO
//━━━━━━━━━━━━━━━━


const videoUrl =
data.download?.hd ||
data.download?.sd ||
data.dl



if (!videoUrl)
return m.reply(
`*⌬┤ ❌ ├⌬ SIN DESCARGA.*

> No se encontró vídeo.`
)



const {
id,
title = 'Sin título',
author = {},
stats = {},
music = {}
}=data



const link =
`https://www.tiktok.com/@${author.unique_id}/video/${id}`



const caption =
`╭━━━〔 🅃🄸🄺🅃🄾🄺 〕━━━⬣

✿ Título:
${title}
★ Autor:
${author.nickname || author.unique_id || 'Desconocido'}
♡ Likes:
${(stats.likes || 0).toLocaleString()}
❒ Vistas:
${(stats.views || stats.plays || 0).toLocaleString()}
☄ Compartidos:
${(stats.shares || 0).toLocaleString()}
🎵 Audio:
${music.title || 'Desconocido'}
🔗 Link:
${link}

╰━━━━━━━━━━━━⬣

🌸 ${config.botName || 'SaitamaBot'}`



const video =
Buffer.from(
await (await fetch(videoUrl)).arrayBuffer()
)



await conn.sendMessage(
m.chat,
{
video,
mimetype:'video/mp4',
caption
},
{
quoted:m
}
)



} catch(e){


console.error('[TIKTOK ERROR]', e)


m.reply(
`*⌬┤ ❌ ├⌬ ERROR.*

> ${e.message || 'Error desconocido'}`
)


}

}



handler.help=[
'tiktok <link>'
]


handler.tags=[
'descargas'
]


handler.command=[
'tiktok',
'tt',
'ttk',
'ttkdl',
'tiktokdl'
]


export default handler