import fetch from 'node-fetch'

const API = 'https://api.mangadex.org'
const COVER = 'https://uploads.mangadex.org/covers'

async function traducir(texto) {
  if (!texto) return ''

  try {
    const partes = texto.match(/.{1,450}/g) || []
    let resultado = ''

    for (const parte of partes) {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(parte)}&langpair=en|es`
      )

      if (!res.ok) continue

      const data = await res.json()
      resultado += (data?.responseData?.translatedText || parte) + ' '
    }

    return resultado.trim() || texto
  } catch {
    return texto
  }
}

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return m.reply(
`༺ ✰ 𝙼𝙰𝙽𝙷𝚆𝙰 ✰

> ❯ Escribí el nombre del manga o manhwa.
> ❯ Ejemplo: *${usedPrefix}${command} Solo Leveling*`
    )
  }

  const query = text.trim()

  try {
    const res = await fetch(
      `${API}/manga?title=${encodeURIComponent(query)}&limit=1&includes[]=author&includes[]=artist`
    )

    if (!res.ok) throw new Error('Mangadex no respondió correctamente')

    const data = await res.json()
    const manga = data?.data?.[0]

    if (!manga) {
      return m.reply(
`༺ ✰ 𝙼𝙰𝙽𝙷𝚆𝙰 ✰

> ❯ No encontré resultados para:
> *${query}*`
      )
    }

    const attr = manga.attributes || {}
    const id = manga.id

    const titulo =
      attr.title?.en ||
      attr.title?.es ||
      attr.title?.ja ||
      attr.title?.ko ||
      Object.values(attr.title || {})[0] ||
      'Sin título'

    const descripcion =
      attr.description?.es ||
      attr.description?.en ||
      Object.values(attr.description || {})[0] ||
      'Sin descripción disponible.'

    const estado = attr.status || 'No disponible'
    const demografia = attr.publicationDemographic || 'No disponible'
    const año = attr.year || 'No disponible'
    const rating = attr.contentRating || 'No disponible'

    const generos =
      (attr.tags || [])
        .map(t => t?.attributes?.name?.es || t?.attributes?.name?.en)
        .filter(Boolean)
        .slice(0, 5)
        .join(', ') || 'No disponible'

    const autores =
      (manga.relationships || [])
        .filter(r => r.type === 'author' || r.type === 'artist')
        .map(r => r.attributes?.name)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(', ') || 'No disponible'

    let imagen = null

    try {
      const coverRes = await fetch(
        `${API}/cover?manga[]=${id}&limit=1`
      )

      if (coverRes.ok) {
        const coverData = await coverRes.json()
        const file = coverData?.data?.[0]?.attributes?.fileName

        if (file) {
          imagen = `${COVER}/${id}/${file}`
        }
      }
    } catch {}

    const [generosT, descripcionT, estadoT, demografiaT, ratingT] =
      await Promise.all([
        traducir(generos),
        traducir(descripcion),
        traducir(estado),
        traducir(demografia),
        traducir(rating)
      ])

    const caption =
`༺ ✰ 𝙼𝙰𝙽𝙷𝚆𝙰 ✰

> ❯ *𝙽𝙾𝙼𝙱𝚁𝙴:* ${titulo}
> ❯ *𝙰𝚄𝚃𝙾𝚁:* ${autores}
> ❯ *𝙶𝙴𝙽𝙴𝚁𝙾𝚂:* ${generosT}
> ❯ *𝙴𝚂𝚃𝙰𝙳𝙾:* ${estadoT}
> ❯ *𝙳𝙴𝙼𝙾𝙶𝚁𝙰𝙵Í𝙰:* ${demografiaT}
> ❯ *𝙰Ñ𝙾:* ${año}
> ❯ *𝙲𝙾𝙽𝚃𝙴𝙽𝙸𝙳𝙾:* ${ratingT}

> ❯ *𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝙲𝙸Ó𝙽:*
${descripcionT}

༺ ✰ 𝙵𝙸𝙽 ✰`

    if (imagen) {
      return await m.replyImg(
        { url: imagen },
        caption
      )
    }

    return m.reply(caption)

  } catch (error) {
    return m.reply(
`༺ ✰ 𝙼𝙰𝙽𝙷𝚆𝙰 ✰

> ❯ Ocurrió un error al buscar *${query}*.
> ❯ Intentá nuevamente en unos segundos.`
    )
  }
}

handler.command = [
  'manhwa',
  'manga'
]

handler.tags = [
  'anime'
]

handler.help = [
  'manhwa <nombre>',
  'manga <nombre>'
]

export default handler