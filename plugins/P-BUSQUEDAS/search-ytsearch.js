import axios from 'axios'
import config from '../../config.js'


// ━━━━━━━ API PRINCIPAL ━━━━━━━
const API_URL = 'https://api.stellarwa.xyz'
const API_KEY = 'proyectsV2'

// ━━━━━━━ API BACKUP ━━━━━━━
const BACKUP_API = 'https://luxinfinity.vercel.app/api/search/youtube'


const handler = async (m, { conn, text, usedPrefix, command }) => {


if (!text) {

return m.reply(
`╭━━━〔 🌸 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 🌸 〕━━━╮

🎬 *𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐒𝐄𝐀𝐑𝐂𝐇*

⚠️ Escribe algo para buscar.

📌 Ejemplo:
${usedPrefix + command} Bad Bunny

╰━━━━━━━━━━━━━━━━━━╯`
)

}


await m.reply(
`╭━━━〔 🔎 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎... 〕━━━╮

⏳ Buscando en YouTube...

🎵 Consulta:
${text}

🌸 ${config.botName || 'SaitamaBot'}

╰━━━━━━━━━━━━━━━━━━╯`
)



try {


let results = []



// ━━━━━ API PRINCIPAL ━━━━━

try {

const api =
`${API_URL}/search/youtube?query=${encodeURIComponent(text)}&limit=10&key=${API_KEY}`


const res = await axios.get(api,{
timeout:15000
})


if (
res.data &&
Array.isArray(res.data.data)
) {

results = res.data.data

}


} catch {}



// ━━━━━ API BACKUP ━━━━━

if (!results.length) {


try {

const backup =
`${BACKUP_API}?query=${encodeURIComponent(text)}&limit=10`


const res = await axios.get(backup,{
timeout:15000
})


if (
res.data?.status &&
Array.isArray(res.data.data)
) {

results = res.data.data

}


} catch {}


}




if (!results.length) {


return m.reply(
`╭━━━〔 ❌ SIN RESULTADOS 〕━━━╮

No encontré resultados para:

🔎 ${text}

╰━━━━━━━━━━━━━━━━━━╯`
)

}





let txt =

`╭━━━〔 🌸 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 🌸 〕━━━╮

🎬 *𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐒𝐄𝐀𝐑𝐂𝐇*

🔎 *Búsqueda:*
${text}

📊 *Resultados:*
${Math.min(results.length,10)}

╰━━━━━━━━━━━━━━━━━━╯


`



results.slice(0,10).forEach((v,i)=>{


txt +=

`╭━━〔 🎵 ${i + 1} 〕━━⬣

📌 *Título:*
> ${v.title || 'Desconocido'}
👤 *Canal:*
> ${v.author?.name || v.author || 'Desconocido'}
⏱️ *Duración:*
> ${v.duration?.text || 'No disponible'}
👁️ *Vistas:*
> ${v.views || 'No disponible'}
📅 *Publicado:*
> ${v.publishDate || 'No disponible'}
🔗 *Link:*
> ${v.url || 'Sin enlace'}

╰━━━━━━━━━━━━━━━━━━╯


`


})



txt +=

`🌸 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓
> ✨ Búsqueda completada correctamente.`



await conn.sendMessage(
m.chat,
{
text:txt
},
{
quoted:m
}
)



} catch(e){


console.error('[YTSEARCH ERROR]',e.message)


m.reply(

`╭━━━〔 ❌ ERROR 〕━━━╮

No se pudo realizar la búsqueda.

⚠️ Intenta nuevamente.

╰━━━━━━━━━━━━━━━━━━╯`

)


}


}




handler.help = [
'ytsearch <texto>',
'yts <texto>'
]


handler.tags = [
'busquedas'
]


handler.command = [
'yts',
'ytsearch',
'youtube',
'buscarvideo'
]


handler.register = true


export default handler