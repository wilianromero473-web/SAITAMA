import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://katanime.vercel.app/api/getrandom')
    if (!res.ok) throw new Error('Katanime API')

    const data = await res.json()
    const item = data?.result?.[0]

    if (!item) throw new Error('Sin resultados')

    const original = item.quote || item.english || item.indo || 'Frase no disponible'

    let frase = original

    try {
      const tr = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(original)}&langpair=en|es`
      )
      const j = await tr.json()
      frase = j?.responseData?.translatedText || original
    } catch {}

    let imagen = null

    try {
      const r = await fetch(
        `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(item.character)}&limit=1`
      )
      const j = await r.json()
      imagen = j?.data?.[0]?.images?.jpg?.image_url || null
    } catch {}

    const caption =
      `𝙰𝙽𝙸𝙼𝙴 𝙵𝚁𝙰𝚂𝙴 ༻\n\n` +
      `✰ 𝙵𝚛𝚊𝚜𝚎\n` +
      `${frase}\n\n` +
      `✰ 𝙿𝚎𝚛𝚜𝚘𝚗𝚊𝚓𝚎\n` +
      `${item.character || 'Desconocido'}\n\n` +
      `✰ 𝙰𝚗𝚒𝚖𝚎\n` +
      `${item.anime || 'Desconocido'}`

    if (imagen) {
      return conn.sendMessage(
        m.chat,
        { image: { url: imagen }, caption },
        { quoted: m }
      )
    }

    return m.reply(caption)

  } catch {
    return m.reply(
      `𝙰𝙽𝙸𝙼𝙴 𝙵𝚁𝙰𝚂𝙴 ༻\n` +
      `✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚘𝚋𝚝𝚎𝚗𝚎𝚛 𝚞𝚗𝚊 𝚏𝚛𝚊𝚜𝚎`
    )
  }
}

handler.help = ['animefrase']
handler.tags = ['anime']
handler.command = ['animefrase', 'fraseanime']

export default handler