import os from 'os'
import { performance } from 'perf_hooks'

const formatBytes = (bytes) => {
  const mb = bytes / 1024 / 1024
  return `${mb.toFixed(1)} MB`
}

const runtime = (seconds) => {
  seconds = Number(seconds)

  const d = Math.floor(seconds / 86400)
  const h = Math.floor(seconds % 86400 / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 60)

  return `${d}d ${h}h ${m}m ${s}s`
}

const handler = async (m, { conn }) => {

  const start = performance.now()

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏳ MENSAJE INICIAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━

  const msg = await conn.sendMessage(
    m.chat,
    {
      text:
`╭━━〔 ⚡ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 〕━━⬣
┃ ⏳ 𝚅𝚎𝚛𝚒𝚏𝚒𝚌𝚊𝚗𝚍𝚘...
╰━━━━━━━━━━━━━━⬣`
    },
    {
      quoted: m
    }
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚡ PING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━

  const ping =
    (performance.now() - start).toFixed(2)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧠 RAM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━

  const totalMem =
    os.totalmem()

  const freeMem =
    os.freemem()

  const usedMem =
    totalMem - freeMem

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🖥️ CPU
  // ━━━━━━━━━━━━━━━━━━━━━━━━━

  const cpus =
    os.cpus()

  const cpu =
    cpus[0]

  const cpuModel =
    cpu?.model || 'Desconocido'

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏱️ UPTIME
  // ━━━━━━━━━━━━━━━━━━━━━━━━━

  const uptime =
    runtime(
      process.uptime()
    )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 ESTADO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━

  const pingStatus =
    ping < 100
      ? '𝙴𝚇𝙲𝙴𝙻𝙴𝙽𝚃𝙴 ⚡'
      : ping < 300
        ? '𝙴𝚂𝚃𝙰𝙱𝙻𝙴 ✓'
        : '𝙻𝙴𝙽𝚃𝙾 ⚠️'

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📋 MENSAJE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━

  const text =
`╭━━〔 ⚡ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 〕━━⬣
┃
┃ 🤖 𝙴𝚜𝚝𝚊𝚍𝚘: 🟢 𝙾𝙽𝙻𝙸𝙽𝙴
┃
┣━━〔 ⚡ 𝙿𝚒𝚗𝚐 〕━━⬣
┃ ⚡ ${ping} ms
┃ ✦ ${pingStatus}
┃
┣━━〔 🧠 𝚂𝚒𝚜𝚝𝚎𝚖𝚊 〕━━⬣
┃ 🧠 𝙲𝙿𝚄: ${cpus.length} núcleos
┃ 💾 𝚁𝙰𝙼: ${formatBytes(usedMem)}
┃ ⏱️ 𝚄𝚙𝚝𝚒𝚖𝚎: ${uptime}
┃
┣━━〔 🌐 𝙽𝚘𝚍𝚎 〕━━⬣
┃ 🟢 ${process.version}
┃ 💻 ${os.platform()}
┃
╰━━〔 ✦ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✦ 〕━━⬣`

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✏️ EDITAR MENSAJE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━

  await conn.sendMessage(
    m.chat,
    {
      text,
      edit: msg.key
    }
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━

handler.help = [
  'ping',
  'estado',
  'status',
  'sistema',
  'infobot',
  'botinfo'
]

handler.tags = [
  'info'
]

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