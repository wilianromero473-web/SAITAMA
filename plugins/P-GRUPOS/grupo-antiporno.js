const handler = async (m, { args, groupDb }) => {
const option = (args[0] || '').toLowerCase()

if (!option) {
return m.reply(`╭━━━〔 🚫 ANTI-NSFW 〕━━━⬣

«Estado: ${groupDb.antiPorno ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}»

📌 Uso:

• .antiporno on
• .antiporno off

╰━━━━━━━━━━━━━━━━━━⬣`)
}

if (
['on', '1', 'true', 'activar', 'enable']
.includes(option)
) {
if (groupDb.antiPorno) {
return m.reply(
'⚠️ El sistema Anti-NSFW ya estaba activado.'
)
}

groupDb.antiPorno = true
await groupDb.save()

return m.reply(`╭━━━〔 🚫 ANTI-NSFW 〕━━━⬣

🟢 Sistema activado.

El bot revisará imágenes, vídeos y stickers
enviados al grupo y eliminará los que sean
detectados como contenido inapropiado.

╰━━━━━━━━━━━━━━━━━━⬣`)
}

if (
['off', '0', 'false', 'desactivar', 'disable']
.includes(option)
) {
if (!groupDb.antiPorno) {
return m.reply(
'⚠️ El sistema Anti-NSFW ya estaba desactivado.'
)
}

groupDb.antiPorno = false
await groupDb.save()

return m.reply(`╭━━━〔 🚫 ANTI-NSFW 〕━━━⬣

🔴 Sistema desactivado.

El bot dejará de moderar contenido multimedia.

╰━━━━━━━━━━━━━━━━━━⬣`)
}

return m.reply(`❌ Opción inválida.

Usa:

.antiporno on
.antiporno off`)
}

handler.help = ['antiporno <on/off>']
handler.tags = ['group']
handler.command = [
'antiporno',
'antinsfw'
]
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true

export default handler