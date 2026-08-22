import axios from 'axios'
import { sendSmart } from '../../lib/serializer.js'
import { createWriteStream, existsSync, unlinkSync } from 'fs'
import { pipeline } from 'stream/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { File as MegaFile } from 'megajs'
import {
  aflvSearch,
  aflvDownload,
  tioSearch,
  tioInfo,
  tioDownload
} from '@axel-dev09/zen-dl'

const JIKAN = 'https://api.jikan.moe/v4'
const UA = 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120 Safari/537.36'

global.animeSearchCache ??= new Map()

async function traducir(text) {
  if (!text) return '—'

  try {
    const partes = text.match(/.{1,450}/g) || []
    let resultado = ''

    for (const parte of partes) {
      const { data } = await axios.get(
        'https://api.mymemory.translated.net/get',
        {
          params: {
            q: parte,
            langpair: 'en|es'
          },
          timeout: 10000
        }
      )

      resultado += `${data?.responseData?.translatedText || parte} `
    }

    return resultado.trim()
  } catch {
    return text
  }
}

async function obtenerInfo(title) {
  try {
    const { data } = await axios.get(`${JIKAN}/anime`, {
      params: {
        q: title,
        limit: 1
      },
      timeout: 10000
    })

    const a = data?.data?.[0]
    if (!a) return null

    return {
      thumb:
        a.images?.jpg?.large_image_url ||
        a.images?.jpg?.image_url,

      type: a.type || '—',
      year: a.year || a.aired?.prop?.from?.year || '—',
      status: a.status || '—',
      episodes: a.episodes || '—',
      duration: a.duration || '—',
      score: a.score ? `${a.score}/10` : '—',
      genres: a.genres?.map(x => x.name).join(', ') || '—',
      studio: a.studios?.[0]?.name || '—',
      rating: a.rating || '—',
      desc: a.synopsis?.replace(/\[Written by MAL Rewrite\]/g, '').trim() || '—'
    }
  } catch {
    return null
  }
}

async function descargarMega(url, archivo) {
  let link = decodeURIComponent(url).replace(/&amp;/g, '&')

  const iframe = link.match(/src=["'](https?:\/\/[^"']+)/i)
  if (iframe) link = iframe[1]

  const match = link.match(
    /(?:https?:\/\/)?(?:www\.)?mega\.(?:nz|co\.nz)\/(?:file\/|embed\/?|e\/|#!)?[^"'\s]+/i
  )

  if (!match) throw new Error('Enlace de Mega inválido.')

  link = match[0]
    .replace('mega.co.nz', 'mega.nz')
    .replace(/\/embed\/?#!/i, '/#!')
    .replace(/\/embed\//i, '/file/')
    .replace(/\/e\//i, '/file/')

  const file = MegaFile.fromURL(link)

  await file.loadAttributes()

  await pipeline(
    file.download(),
    createWriteStream(archivo)
  )
}

async function descargarArchivo(url, archivo) {
  const { data } = await axios.get(url, {
    responseType: 'stream',
    timeout: 180000,
    headers: {
      'User-Agent': UA,
      Referer: 'https://www.yourupload.com/'
    }
  })

  await pipeline(
    data,
    createWriteStream(archivo)
  )
}

async function buscarAnime(query) {
  try {
    const resultados = await tioSearch(query, 10)

    if (resultados?.length) {
      return {
        resultados,
        fuente: 'tio'
      }
    }
  } catch {}

  const resultados = await aflvSearch(query, 10)

  return {
    resultados: resultados || [],
    fuente: 'aflv'
  }
}

function crearEpisodios(info) {
  const episodios = info.episodeList?.length
    ? info.episodeList
    : Array.from(
        { length: Number(info.episodes) || 0 },
        (_, i) => i + 1
      )

  if (!episodios.length) {
    return [{
      title: 'Sin episodios',
      description: 'No hay episodios disponibles',
      id: 'anime_noop'
    }]
  }

  return episodios.map(ep => ({
    title: `Episodio ${ep}`,
    description: info.title.slice(0, 72),
    id: `anime_ep_${ep}`
  }))
}

const handler = async (m, { conn, args, usedPrefix }) => {
  const query = args.join(' ').trim()

  if (!query) {
    return m.reply(
      `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
      `✰ 𝚄𝚜𝚊\n` +
      `> ${usedPrefix}anime <nombre>\n\n` +
      `✰ 𝙴𝚓𝚎𝚖𝚙𝚕𝚘\n` +
      `> ${usedPrefix}anime Naruto`
    )
  }

  await m.reply(
    `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
    `✰ 𝙱𝚞𝚜𝚌𝚊𝚗𝚍𝚘\n` +
    `> Buscando *${query}*...`
  )

  let resultados
  let fuente

  try {
    ({ resultados, fuente } = await buscarAnime(query))
  } catch {
    return m.reply(
      `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
      `✰ 𝚂𝚒𝚗 𝚛𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘𝚜\n` +
      `> No encontré *${query}*.`
    )
  }

  if (!resultados.length) {
    return m.reply(
      `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
      `✰ 𝚂𝚒𝚗 𝚛𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘𝚜\n` +
      `> No encontré *${query}*.`
    )
  }

  global.animeSearchCache.set(m.chat, {
    resultados,
    fuente,
    paso: 'busqueda',
    usuario: m.sender
  })

  const rows = resultados.map((anime, i) => ({
    title: `${i + 1}. ${anime.title}`.slice(0, 24),
    description: (anime.type || 'Anime').slice(0, 72),
    id: `anime_sel_${i}`
  }))

  return sendSmart(conn, m, {
    text:
      `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
      `✰ 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘𝚜\n\n` +
      `> Encontrados: *${resultados.length}*\n` +
      `> Búsqueda: *${query}*`,

    footer: '𝚂𝚊𝚒𝚝𝚊𝚖𝚊𝙱𝚘𝚝',

    buttons: [{
      text: '✰ Ver resultados',
      sections: [{
        title: '𝙰𝙽𝙸𝙼𝙴 ༻',
        rows
      }]
    }]
  })
}

handler.all = async (m, { conn }) => {
  if (!m.responseId?.startsWith('anime_')) return false

  const cache = global.animeSearchCache.get(m.chat)

  if (!cache) {
    return m.reply(
      `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
      `✰ 𝙱𝚞𝚜𝚚𝚞𝚎𝚍𝚊 𝚎𝚡𝚙𝚒𝚛𝚊𝚍𝚊\n` +
      `> Realizá una nueva búsqueda.`
    )
  }

  if (cache.usuario !== m.sender) {
    return m.reply(
      `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
      `✰ 𝙰𝚌𝚌𝚎𝚜𝚘 𝚍𝚎𝚗𝚎𝚐𝚊𝚍𝚘\n` +
      `> Esta búsqueda pertenece a otro usuario.`
    )
  }

  if (
    m.responseId.startsWith('anime_sel_') &&
    cache.paso === 'busqueda'
  ) {
    const index = Number(
      m.responseId.replace('anime_sel_', '')
    )

    const anime = cache.resultados[index]
    if (!anime) return false

    await m.reply(
      `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
      `✰ 𝙲𝚊𝚛𝚐𝚊𝚗𝚍𝚘\n` +
      `> Obteniendo información de *${anime.title}*...`
    )

    const [tio, jikan] = await Promise.all([
      tioInfo(anime.slug).catch(() => ({
        title: anime.title
      })),
      obtenerInfo(anime.title)
    ])

    const info = {
      title: tio?.title || anime.title,
      slug: anime.slug,

      thumb:
        jikan?.thumb ||
        tio?.thumb ||
        'https://files.catbox.moe/9zzegh.jpg',

      type: jikan?.type || tio?.type || '—',
      year: jikan?.year || tio?.year || '—',
      status: await traducir(jikan?.status || '—'),

      episodes:
        tio?.episodes ||
        jikan?.episodes ||
        '—',

      duration: jikan?.duration || '—',
      score: jikan?.score || '—',

      genres:
        await traducir(jikan?.genres || '—'),

      studio: jikan?.studio || '—',
      rating: jikan?.rating || '—',

      desc:
        await traducir(
          (jikan?.desc || tio?.desc || 'Sin sinopsis')
            .slice(0, 450)
        ),

      episodeList: tio?.episodeList || []
    }

    global.animeSearchCache.set(m.chat, {
      ...cache,
      info,
      paso: 'info',
      slug: anime.slug
    })

    const caption =
      `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
      `✰ 𝙸𝚗𝚏𝚘𝚛𝚖𝚊𝚌𝚒ó𝚗\n\n` +

      `> ✰ *Nombre:* ${info.title}\n` +
      `> ✰ *Tipo:* ${info.type}\n` +
      `> ✰ *Año:* ${info.year}\n` +
      `> ✰ *Estado:* ${info.status}\n` +
      `> ✰ *Episodios:* ${info.episodes}\n` +
      `> ✰ *Duración:* ${info.duration}\n` +
      `> ✰ *Puntuación:* ${info.score}\n` +
      `> ✰ *Géneros:* ${info.genres}\n` +
      `> ✰ *Estudio:* ${info.studio}\n` +
      `> ✰ *Rating:* ${info.rating}\n\n` +

      `✰ 𝚂𝚒𝚗𝚘𝚙𝚜𝚒𝚜\n` +
      `> ${info.desc}`

    return sendSmart(conn, m, {
      image: { url: info.thumb },
      caption,

      footer: '𝚂𝚊𝚒𝚝𝚊𝚖𝚊𝙱𝚘𝚝',

      buttons: [{
        text: '✰ Ver episodios',

        sections: [{
          title: '𝙴𝙿𝙸𝚂𝙾𝙳𝙸𝙾𝚂 ༻',
          rows: crearEpisodios(info)
        }]
      }]
    })
  }

  if (
    m.responseId.startsWith('anime_ep_') &&
    cache.paso === 'info'
  ) {
    const ep = Number(
      m.responseId.replace('anime_ep_', '')
    )

    if (!Number.isInteger(ep) || ep < 1) return false

    const { info, fuente, slug } = cache

    const archivo = join(
      tmpdir(),
      `anime_${Date.now()}_${ep}.mp4`
    )

    try {
      await m.reply(
        `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
        `✰ 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚗𝚍𝚘\n` +
        `> *${info.title}*\n` +
        `> Episodio: *${ep}*`
      )

      const descargar =
        fuente === 'tio'
          ? tioDownload
          : aflvDownload

      const resultado = await descargar(slug, ep)

      if (!resultado?.url) {
        throw new Error(
          'No se encontró un servidor disponible.'
        )
      }

      const servidor =
        resultado.server || 'mega'

      if (servidor.toLowerCase() === 'mega') {
        await descargarMega(
          resultado.url,
          archivo
        )
      } else {
        await descargarArchivo(
          resultado.url,
          archivo
        )
      }

      await conn.sendMessage(
        m.chat,
        {
          video: { url: archivo },
          mimetype: 'video/mp4',
          fileName: `${slug}-ep${ep}.mp4`,

          caption:
            `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
            `✰ 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊\n\n` +
            `> ✰ *Anime:* ${info.title}\n` +
            `> ✰ *Episodio:* ${ep}\n` +
            `> ✰ *Servidor:* ${servidor.toUpperCase()}`
        },
        { quoted: m }
      )

    } catch (error) {
      return m.reply(
        `𝙰𝙽𝙸𝙼𝙴 ༻\n` +
        `✰ 𝙴𝚛𝚛𝚘𝚛\n` +
        `> ${error.message || 'No se pudo descargar el episodio.'}`
      )
    } finally {
      if (existsSync(archivo)) {
        try {
          unlinkSync(archivo)
        } catch {}
      }
    }

    return true
  }

  return false
}

handler.command = [
  'anime',
  'animeflv',
  'buscanime'
]

handler.tags = ['anime']

handler.help = [
  'anime <nombre>'
]

export default handler