import {
downloadMediaMessage
} from '@whiskeysockets/baileys'

const API =
'https://nsfwsky.ultraplus.click/api/v1/check'

const MODERAR = {
nsfw: true,
gore: true
}

const UMBRAL = 70
const UMBRAL_GORE = 25
const AVISAR = true

export async function moderarMensaje(sock, msg, groupDb) {
try {
// El sistema debe estar activado en el grupo
if (!groupDb?.antiPorno) return

const jid = msg?.key?.remoteJid

// Solo grupos
if (!jid?.endsWith('@g.us')) return

// Ignorar mensajes enviados por el bot
if (msg.key.fromMe) return

const m = msg.message
if (!m) return

// Detectar imagen, vídeo o sticker
const contenido =
  m.imageMessage ||
  m.videoMessage ||
  m.stickerMessage ||
  m.viewOnceMessage?.message?.imageMessage ||
  m.viewOnceMessage?.message?.videoMessage ||
  m.viewOnceMessageV2?.message?.imageMessage ||
  m.viewOnceMessageV2?.message?.videoMessage

if (!contenido) return

// Descargar multimedia
const buffer = await downloadMediaMessage(
  msg,
  'buffer',
  {},
  {
    reuploadRequest: sock.updateMediaMessage
  }
)

if (!buffer || !buffer.length) return

// FormData disponible en Node 18+
const form = new FormData()

const mime =
  contenido.mimetype ||
  'application/octet-stream'

const extension =
  mime.includes('video')
    ? 'video.mp4'
    : mime.includes('image')
      ? 'image.jpg'
      : 'media'

form.append(
  'file',
  new Blob([buffer], { type: mime }),
  extension
)

const url =
  `${API}?threshold=${UMBRAL}&gore_threshold=${UMBRAL_GORE}`

const response = await fetch(url, {
  method: 'POST',
  body: form
})

if (!response.ok) return

const data = await response.json()

// Si la API falla, no borrar
if (!data?.ok) return

const motivos = []

if (
  MODERAR.nsfw &&
  data.flags?.nsfw
) {
  motivos.push(
    `🔞 +18 *${data.percent ?? 0}%*`
  )
}

if (
  MODERAR.gore &&
  data.flags?.gore
) {
  motivos.push(
    `🩸 Sangre *${data.gore?.percent ?? 0}%*`
  )
}

// No se detectó contenido
if (!motivos.length) return

// Eliminar mensaje
await sock.sendMessage(jid, {
  delete: msg.key
}).catch(() => {})

if (!AVISAR) return

const autor =
  msg.key.participant ||
  msg.key.remoteJid

const numero =
  autor
    .split('@')[0]
    .split(':')[0]

await sock.sendMessage(jid, {
  text:

`╭━━━〔 🚫 ANTI-NSFW 〕━━━⬣

🚫 Contenido eliminado

👤 Usuario: @${numero}

📊 Motivo:
${motivos.join('\n')}

╰━━━━━━━━━━━━━━━━━━⬣`,
mentions: [autor]
}).catch(() => {})

} catch {}
}