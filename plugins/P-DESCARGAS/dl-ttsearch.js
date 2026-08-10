import fetch from 'node-fetch'
import * as baileysMod from '@whiskeysockets/baileys'


// ━━━━━━━ API TIKTOK SEARCH ━━━━━━━
const API_URL = 'https://api.stellarwa.xyz'
const API_KEY = 'proyectsV2'
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


const pkg = baileysMod.default && Object.keys(baileysMod).length === 1
? baileysMod.default
: baileysMod


const {
generateWAMessageFromContent,
generateWAMessage
} = pkg



const handler = async (m,{ conn,text,usedPrefix,command })=>{


let query = text?.trim() || ''


if(!query && m.quoted){
query=(m.quoted.body || m.quoted.text || '').trim()
}


if(!query)
return m.reply(
`*⌬┤ ✙ ├⌬ USO.*

> ${usedPrefix}${command} gatos`
)



await m.reply(
`*⌬┤ 🔍 ├⌬ BUSCANDO TIKTOK.*

> SaitamaBot descargando videos 🌸`
)



try{


const api =
`${API_URL}/search/tiktok?query=${encodeURIComponent(query)}&key=${API_KEY}`


const res = await fetch(api)
const json = await res.json()


const results=json.data



if(!results?.length)
return m.reply(
`*⌬┤ ✙ ├⌬ SIN RESULTADOS.*

> ${query}`
)



const videos = results.slice(0,7)



// Crear álbum

const album = generateWAMessageFromContent(
m.chat,
{
albumMessage:{
expectedVideoCount:videos.length,
contextInfo:{
stanzaId:m.key.id,
participant:m.key.participant || m.chat,
quotedMessage:m.message
}
}
},
{}
)



await conn.relayMessage(
m.chat,
album.message,
{
messageId:album.key.id
}
)




for(const v of videos){


try{


const videoUrl =
v.nowatermark ||
v.url ||
v.dl ||
v.video



if(!videoUrl) continue



const buffer = Buffer.from(
await (
await fetch(videoUrl)
).arrayBuffer()
)



const caption =
`╭━━━〔 🎵 TIKTOK SEARCH 〕━━━⬣

📝 ${v.title || 'Sin título'}

👤 ${v.author?.nickname || 'Desconocido'}

👁️ ${(v.stats?.views || 0).toLocaleString()}

❤️ ${(v.stats?.likes || 0).toLocaleString()}

🔗 TikTok

╰━━━━━━━━━━━━⬣`



const videoMsg = await generateWAMessage(
m.chat,
{
video:buffer,
mimetype:'video/mp4',
caption
},
{
upload:conn.waUploadToServer
}
)



videoMsg.message.messageContextInfo={
messageAssociation:{
associationType:1,
parentMessageKey:album.key
}
}



await conn.relayMessage(
m.chat,
videoMsg.message,
{
messageId:videoMsg.key.id
}
)



}catch(err){}



}



}catch(e){


console.error('[TIKTOK SEARCH]',e)


m.reply(
`*⌬┤ ❌ ├⌬ ERROR.*

> No se pudo completar la búsqueda.`
)


}



}



handler.help=[
'ttsearch <texto>'
]


handler.tags=[
'buscador'
]


handler.command=[
'ttsearch',
'tiktoksearch',
'tts'
]


export default handler