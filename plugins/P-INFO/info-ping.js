import os from 'os'
import { performance } from 'perf_hooks'

const formatBytes = (bytes) => {
  const mb = bytes / 1024 / 1024
  return `${mb.toFixed(2)} MB`
}

const runtime = (seconds) => {
  seconds = Number(seconds)

  const d = Math.floor(seconds / 86400)
  const h = Math.floor(seconds % 86400 / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 60)

  return `${d.toString().padStart(2, '0')}d • ${h.toString().padStart(2, '0')}h • ${m.toString().padStart(2, '0')}m • ${s.toString().padStart(2, '0')}s`
}

const handler = async (m, { conn }) => {
  const start = performance.now()

  const msg = await conn.sendMessage(
    m.chat,
    {
      text: '╭━━━〔 ⚡ 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 〕━━━⬣\n┃ ⏳ 𝐕𝐞𝐫𝐢𝐟𝐢𝐜𝐚𝐧𝐝𝐨 𝐬𝐢𝐬𝐭𝐞𝐦𝐚...\n╰━━━━━━━━━━━━━━━━━━⬣'
    },
    { quoted: m }
  )

  const ping = (performance.now() - start).toFixed(2)

  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem

  const cpu = os.cpus()[0]
  const cpuModel = cpu?.model || 'Desconocido'

  const uptime = runtime(process.uptime())

  const text = `
╭━━━〔 ⚡ 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 〕━━━⬣
┃
┃ 🤖 𝐄𝐒𝐓𝐀𝐃𝐎  •  🟢 𝐎𝐍𝐋𝐈𝐍𝐄
┃
┣━━〔 ⚡ 𝐑𝐄𝐍𝐃𝐈𝐌𝐈𝐄𝐍𝐓𝐎 〕━━⬣
┃
┃ ⚡ 𝐏𝐈𝐍𝐆
┃ ├─ ◦ ${ping} ms
┃ └─ ◦ ${ping < 100 ? '𝐄𝐗𝐂𝐄𝐋𝐄𝐍𝐓𝐄 🚀' : ping < 300 ? '𝐄𝐒𝐓𝐀𝐁𝐋𝐄 ✅' : '𝐋𝐄𝐍𝐓𝐎 ⚠️'}
┃
┃ 🧠 𝐂𝐏𝐔
┃ ├─ ◦ ${cpuModel}
┃ └─ ◦ ${os.cpus().length} 𝐍ú𝐜𝐥𝐞𝐨𝐬
┃
┃ 💾 𝐌𝐄𝐌𝐎𝐑𝐈𝐀 𝐑𝐀𝐌
┃ ├─ ◦ 𝐔𝐬𝐚𝐝𝐚: ${formatBytes(usedMem)}
┃ └─ ◦ 𝐓𝐨𝐭𝐚𝐥: ${formatBytes(totalMem)}
┃
┃ ⏳ 𝐔𝐏𝐓𝐈𝐌𝐄
┃ └─ ◦ ${uptime}
┃
┣━━〔 🌐 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 〕━━━━⬣
┃
┃ 💻 𝐏𝐥𝐚𝐭𝐚𝐟𝐨𝐫𝐦𝐚: ${os.platform()}
┃ 🏗️ 𝐀𝐫𝐪𝐮𝐢𝐭𝐞𝐜𝐭𝐮𝐫𝐚: ${os.arch()}
┃ 🟢 𝐍𝐨𝐝𝐞: ${process.version}
┃
╰━━━━━━━━━━━━━━━━━━⬣
      ✦ 『 ⚡ 𝐒𝐀𝐈𝐓𝐀𝐌𝐀𝐁𝐎𝐓 ⚡ 』 ✦
`.trim()

  await conn.sendMessage(
    m.chat,
    {
      text,
      edit: msg.key
    }
  )
}

handler.help = [
  'ping',
  'estado',
  'status',
  'sistema',
  'infobot',
  'botinfo'
]

handler.tags = ['info']

handler.command = [
  'ping',
  'p',
  'estado',
  'status',
  'sistema',
  'infobot',
  'botinfo'
]

export default handler