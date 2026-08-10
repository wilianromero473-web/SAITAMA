import fetch from 'node-fetch'
import * as baileysMod from '@whiskeysockets/baileys'
import config from '../../config.js'


// ━━━━━━━ API PINTEREST ━━━━━━━
const API_URL = 'https://api.stellarwa.xyz'
const API_KEY = 'proyectsV2'
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━


const pkg = baileysMod.default && Object.keys(baileysMod).length === 1
  ? baileysMod.default
  : baileysMod


const {
  generateWAMessageFromContent,
  generateWAMessage
} = pkg



const handler = async (m, { conn, text, usedPrefix, command }) => {


if (!text) {
return m.reply(
`*『 📌 』PINTEREST*

> Uso:
${usedPrefix + command} Sakura

> También puedes enviar un enlace de Pinterest.`
)
}



try {


await m.reply(
`*『 🔍 』Buscando en Pinterest...*

> SaitamaBot procesando 🌸`
)



const isUrl = /^https?:\/\//i.test(text)



//━━━━━━━━━━━━━━━━━━
// DESCARGAR PINTEREST
//━━━━━━━━━━━━━━━━━━

if (isUrl) {


const api =
`${API_URL}/dl/pinterest?url=${encodeURIComponent(text)}&key=${API_KEY}`



const res = await fetch(api)
const json = await res.json()

const data = json.data



if (!data?.dl) {

return m.reply(
`*『 ❌ 』No se encontró contenido.`
)

}



const type =
['image','video'].includes(data.type)
? data.type
: 'document'



await conn.sendMessage(
m.chat,
{
[type]: {
url:data.dl
},
caption:
`*『 📌 』PINTEREST*

> Descargado por ${config.botName || 'SaitamaBot'} 🌸`
},
{
quoted:m
}
)


return

}




//━━━━━━━━━━━━━━━━━━
// BUSCAR PINTEREST
//━━━━━━━━━━━━━━━━━━


const api =
`${API_URL}/search/pinterest?query=${encodeURIComponent(text)}&key=${API_KEY}`



const res = await fetch(api)

const json = await res.json()


const results = json.data



if (!results?.length) {

return m.reply(
`*『 ❌ 』Sin resultados.*

> No encontré imágenes para:
${text}`
)

}




const medias = results
.slice(0,10)
.map((img)=>({

url: img.hd || img.url,

caption:
`*『 📌 』PINTEREST SEARCH*

`+
`${img.title ? `> 📝 Título: ${img.title}\n` : ''}`+
`${img.description ? `> 📖 Descripción: ${img.description}\n` : ''}`+
`${img.full_name ? `> 👤 Autor: ${img.full_name}\n` : ''}`+
`${img.likes ? `> ❤️ Likes: ${img.likes}\n` : ''}`+
`\n🌸 ${config.botName || 'SaitamaBot'}`

}))



//━━━━━━━━━━━━━━━━━━
// ÁLBUM WHATSAPP
//━━━━━━━━━━━━━━━━━━


const album = generateWAMessageFromContent(
m.chat,
{
albumMessage:{
expectedImageCount: medias.length,
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



for (const img of medias) {


try {


const buffer = Buffer.from(
await (
await fetch(img.url)
).arrayBuffer()
)



const imageMsg = await generateWAMessage(
m.chat,
{
image:buffer,
caption:img.caption
},
{
upload:conn.waUploadToServer
}
)



imageMsg.message.messageContextInfo = {
messageAssociation:{
associationType:1,
parentMessageKey:album.key
}
}



await conn.relayMessage(
m.chat,
imageMsg.message,
{
messageId:imageMsg.key.id
}
)



} catch {}

}



} catch(e) {


console.error('[PINTEREST ERROR]', e)


m.reply(
`*『 ❌ 』ERROR.*

> ${e.message || 'Error desconocido'}`
)


}


}



handler.help=[
'pin <texto>',
'pinterest <texto>'
]


handler.tags=[
'descargas'
]


handler.command=[
'pin',
'pinterest'
]


export default handler