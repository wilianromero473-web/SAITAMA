import axios from 'axios'
import config from '../../config.js'

const API_URL = 'https://luxinfinity.vercel.app/api/images/random'

async function obtenerImagen() {
  const { data } = await axios.get(API_URL, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  })

  const url =
    data?.url ||
    data?.image ||
    data?.data?.url ||
    data?.data?.image ||
    data?.result?.url ||
    data?.result?.image

  if (!url || !/^https?:\/\//i.test(url))
    throw new Error('URL inválida')

  return url
}

const handler = async (m, { conn, command, usedPrefix }) => {
  if (!m.isGroup)
    return m.reply(
      '𝙿𝙰𝙲𝙺 ༻\n' +
      '✰ 𝚄𝚜𝚊 𝚎𝚗 𝚞𝚗 𝚐𝚛𝚞𝚙𝚘'
    )

  try {
    const url = await obtenerImagen()

    await conn.sendMessage(m.chat, {
      image: { url },
      caption:
        '𝙿𝙰𝙲𝙺 ༻\n' +
        '✰ 𝙸𝚖𝚊𝚐𝚎𝚗 𝚊𝚕𝚎𝚊𝚝𝚘𝚛𝚒𝚊\n\n' +
        `✰ 𝚄𝚜𝚊 ${usedPrefix}${command} 𝚙𝚊𝚛𝚊 𝚘𝚝𝚛𝚊`,
      footer: config.botname
    }, { quoted: m })

  } catch {
    return m.reply(
      '𝙿𝙰𝙲𝙺 ༻\n' +
      '✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚘𝚋𝚝𝚎𝚗𝚎𝚛 𝚕𝚊 𝚒𝚖𝚊𝚐𝚎𝚗'
    )
  }
}

handler.help = ['pack2']
handler.tags = ['fun']
handler.command = ['pack2', 'imagenes']
handler.groupOnly = true
handler.register = true

export default handler