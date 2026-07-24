import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { ytmp4 } = require('@hiudyy/ytdl')


const SEARCH =
'https://api.delirius.store/search/ytsearch'


function timeToSeconds(time = '') {

    const p = time.split(':').map(Number)

    if (p.length === 3)
        return p[0] * 3600 + p[1] * 60 + p[2]

    if (p.length === 2)
        return p[0] * 60 + p[1]

    return 0
}



const handler = async (m,{conn,text}) => {

if(!text){

return m.reply(
`╭━━━〔 *🎬 PELÍCULA* 〕━━━⬣
┃ Uso:
┃ #pelicula nombre
╰━━━━━━━━━━━━━━━━━━⬣`
)

}


let filePath = null
let msg = null


try{


// BUSCAR VIDEO

const {data} = await axios.get(
`${SEARCH}?q=${encodeURIComponent(text)}`
)


const result = data?.data?.find(
v => timeToSeconds(v.duration) >= 3600
)


if(!result){

return m.reply(
'❌ No encontré una película válida'
)

}



// INFORMACIÓN

await conn.sendMessage(
m.chat,
{
image:{
url: result.thumbnail || result.image
},
caption:
`╭━━━〔 *🎬 PELÍCULA ENCONTRADA* 〕━━━⬣
┃ 🎬 Nombre:
┃ ${result.title}

┃ ⏱️ Duración:
┃ ${result.duration}

┃ 📥 Preparando descarga...
╰━━━━━━━━━━━━━━━━━━⬣`
},
{quoted:m}
)



msg = await conn.sendMessage(
m.chat,
{
text:
`╭━━━〔 *📥 DESCARGANDO* 〕━━━⬣
┃ 🎬 ${result.title}
┃ ⏳ Obteniendo enlace...
╰━━━━━━━━━━━━━━━━━━⬣`
},
{quoted:m}
)




// OBTENER LINK

const download = await ytmp4(result.url)



const url =
typeof download === 'string'
? download
:
download?.url ||
download?.download ||
download?.downloadUrl ||
download?.result ||
download?.data?.url



if(!url){

throw new Error(
'No se encontró enlace de descarga'
)

}




// CREAR CARPETA

const folder='./tmp'


if(!fs.existsSync(folder)){

fs.mkdirSync(
folder,
{recursive:true}
)

}



filePath = path.join(
folder,
`pelicula_${Date.now()}.mp4`
)




// DESCARGAR ARCHIVO

const response = await axios.get(
url,
{
responseType:'arraybuffer',
timeout:0
}
)



fs.writeFileSync(
filePath,
response.data
)




// ACTUALIZAR ESTADO

await conn.sendMessage(
m.chat,
{
text:
`╭━━━〔 ✅ DESCARGADO 〕━━━⬣
┃ 🎬 ${result.title}
┃ 📦 Tamaño:
┃ ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB

┃ 📤 Enviando archivo...
╰━━━━━━━━━━━━━━━━━━⬣`,
edit:msg.key
}
)




// ENVIAR VIDEO


await conn.sendMessage(
m.chat,
{
document:
fs.createReadStream(filePath),

mimetype:
'video/mp4',

fileName:
`${result.title}.mp4`,

caption:
`ѕαιтαмαвσт

🎬 ${result.title}
⏱️ ${result.duration}`
},
{quoted:m}
)



}catch(e){


console.log(
'[PELÍCULA ERROR]',
e.response?.data || e
)


m.reply(
`❌ Error:
${e.message}`
)


}finally{


if(filePath){

await rm(
filePath,
{
force:true
}
).catch(()=>{})

}


}


}



handler.command=[
'pelicula',
'peliculas',
'pl',
'pldl'
]


handler.tags=[
'descargas'
]


handler.help=[
'pelicula <nombre>'
]


export default handler
