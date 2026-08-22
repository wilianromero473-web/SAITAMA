import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import { promises as fs } from 'fs'
import crypto from 'crypto'
import path from 'path'

const API_BASE = 'https://luxinfinity.vercel.app/api/anime/reaction?type='
const TMP_DIR = './tmp'

const ACCIONES = {
  angry:      { emoji: '😠', msgs: ['está enojado con {obj}! 😠', 'está enojado consigo mismo 😠'] },
  baka:       { emoji: '😤', msgs: ['le dice baka a {obj} 😤', 'se dice baka a sí mismo 😤'] },
  bite:       { emoji: '🦷', msgs: ['le mordió a {obj}! au! 🦷', 'se mordió a sí mismo... au 🤕'] },
  bleh:       { emoji: '😝', msgs: ['le saca la lengua a {obj} 😝', 'se saca la lengua al espejo 😝'] },
  blowkiss:   { emoji: '💋', msgs: ['le manda un beso a {obj} 💋', 'se manda un beso al espejo 💋'] },
  blush:      { emoji: '😳', msgs: ['se sonrojó por {obj} 😳', 'se sonrojó uwu 😳'] },
  bonk:       { emoji: '🔨', msgs: ['le dio un bonk a {obj} 🔨', 'se dio un bonk a sí mismo 🔨'] },
  bored:      { emoji: '😑', msgs: ['está aburrido de {obj}...', 'está aburrido...'] },
  carry:      { emoji: '🤲', msgs: ['cargó a {obj} en brazos 🤲', 'intenta cargarse a sí mismo 🤲'] },
  clap:       { emoji: '👏', msgs: ['le aplaude a {obj} 👏', 'se aplaude a sí mismo 👏'] },
  confused:   { emoji: '😕', msgs: ['está confundido por {obj} 😕', 'está muy confundido 😕'] },
  cry:        { emoji: '😭', msgs: ['está llorando por culpa de {obj}', 'está llorando...'] },
  cuddle:     { emoji: '🤗', msgs: ['se acurruca con {obj} 💕', 'se acurruca consigo mismo 🥲'] },
  dance:      { emoji: '💃', msgs: ['está bailando con {obj} 💃', 'está bailando~ 💃'] },
  facepalm:   { emoji: '🤦', msgs: ['hace facepalm por culpa de {obj} 🤦', 'hace facepalm 🤦'] },
  feed:       { emoji: '🍽️', msgs: ['le da de comer a {obj} 🍽️', 'se da de comer a sí mismo 🍽️'] },
  handhold:   { emoji: '🤝', msgs: ['le toma la mano a {obj} 🤝', 'se toma la mano a sí mismo 🤝'] },
  handshake:  { emoji: '🤝', msgs: ['saluda con un apretón a {obj} 🤝', 'se da la mano a sí mismo 🤝'] },
  happy:      { emoji: '😊', msgs: ['está feliz gracias a {obj} ~', 'está muy feliz~'] },
  highfive:   { emoji: '🙌', msgs: ['le choca los cinco a {obj} 🙌', 'se choca los cinco solo 🙌'] },
  hug:        { emoji: '🤗', msgs: ['le dio un abrazo a {obj} 💕', 'se dio un abrazo a sí mismo 💔'] },
  kabedon:    { emoji: '💢', msgs: ['le hizo un kabedon a {obj} 💢', 'hace kabedon contra la pared 💢'] },
  kill:       { emoji: '⚰️', msgs: ['derrotó a {obj} 💀', 'está practicando una pose dramática 💀'] },
  kiss:       { emoji: '😘', msgs: ['le dio un beso a {obj} 💋', 'se dio un beso a sí mismo 💋'] },
  lappillow:  { emoji: '😴', msgs: ['usa las piernas de {obj} de almohada 😴', 'usa sus propias piernas de almohada 😴'] },
  laugh:      { emoji: '😂', msgs: ['se ríe de {obj} 😂', 'se está muriendo de risa 😂'] },
  lurk:       { emoji: '👀', msgs: ['está espiando a {obj} 👀', 'está espiando en el chat 👀'] },
  nod:        { emoji: '👍', msgs: ['le da la razón a {obj} 👍', 'asiente solo 👍'] },
  nom:        { emoji: '🍽️', msgs: ['está comiendo con {obj} nom nom 🍽️', 'está comiendo nom nom 🍽️'] },
  nope:       { emoji: '🙅', msgs: ['le dice nope a {obj} 🙅', 'dice nope a todo 🙅'] },
  nya:        { emoji: '🐱', msgs: ['le dice nya a {obj} 🐱', 'dice nya~ 🐱'] },
  pat:        { emoji: '🤲', msgs: ['le acaricia la cabeza a {obj}', 'se acaricia la cabeza a sí mismo'] },
  peck:       { emoji: '😘', msgs: ['le da un besito rápido a {obj} 😘', 'se da un besito a sí mismo 😘'] },
  poke:       { emoji: '👉', msgs: ['pica a {obj} 👉', 'se picó a sí mismo 👉'] },
  pout:       { emoji: '😤', msgs: ['hace pucheros por {obj} 😤', 'está haciendo pucheros 😤'] },
  punch:      { emoji: '👊', msgs: ['le pegó un puñetazo a {obj}! 👊', 'hace una pose de combate 👊'] },
  run:        { emoji: '🏃', msgs: ['está corriendo de {obj} 🏃', 'está corriendo 🏃'] },
  salute:     { emoji: '🫡', msgs: ['le hace un saludo militar a {obj} 🫡', 'saluda al vacío 🫡'] },
  shake:      { emoji: '🤝', msgs: ['le da la mano a {obj} 🤝', 'se da la mano a sí mismo 🤝'] },
  shocked:    { emoji: '😱', msgs: ['está shockeado por {obj} 😱', 'está completamente shockeado 😱'] },
  shoot:      { emoji: '🔫', msgs: ['apunta de forma dramática a {obj} 🔫', 'hace una pose de acción 🔫'] },
  shrug:      { emoji: '🤷', msgs: ['se encoge de hombros ante {obj} 🤷', 'se encoge de hombros 🤷'] },
  sip:        { emoji: '☕', msgs: ['toma té mirando a {obj} ☕', 'toma té tranquilo ☕'] },
  slap:       { emoji: '👋', msgs: ['le dio una cachetada a {obj} 😤', 'hace una pose dramática 😵'] },
  sleep:      { emoji: '😴', msgs: ['se va a dormir con {obj}... zZz 😴', 'se va a dormir... zZz 😴'] },
  smile:      { emoji: '😊', msgs: ['le sonríe a {obj} 😊', 'sonríe al vacío 😊'] },
  smug:       { emoji: '😏', msgs: ['está siendo smug con {obj} 😏', 'está siendo smug solo 😏'] },
  spin:       { emoji: '🌀', msgs: ['gira feliz con {obj} 🌀', 'está girando~ 🌀'] },
  stare:      { emoji: '👁️', msgs: ['le clava la mirada a {obj} 👁️', 'clava la mirada en la nada 👁️'] },
  tableflip:  { emoji: '💢', msgs: ['voltea la mesa por culpa de {obj} (╯°□°）╯', 'voltea la mesa (╯°□°）╯'] },
  teehee:     { emoji: '😄', msgs: ['se ríe de {obj} teehee 😄', 'teehee~ 😄'] },
  think:      { emoji: '🤔', msgs: ['está pensando en {obj}... 🤔', 'está pensando... 🤔'] },
  thumbsup:   { emoji: '👍', msgs: ['le da un thumbsup a {obj} 👍', 'se da un thumbsup a sí mismo 👍'] },
  tickle:     { emoji: '🤣', msgs: ['le hace cosquillas a {obj} 🤣', 'se hace cosquillas a sí mismo 🤣'] },
  wag:        { emoji: '🐾', msgs: ['menea la cola ante {obj} 🐾', 'menea la cola~ 🐾'] },
  wave:       { emoji: '👋', msgs: ['le saluda con la mano a {obj} 👋', 'saluda con la mano 👋'] },
  wink:       { emoji: '😉', msgs: ['le guiña el ojo a {obj} 😉', 'guiña el ojo 😉'] },
  yawn:       { emoji: '🥱', msgs: ['bosteza al lado de {obj} 🥱', 'está bostezando 🥱'] },
  yeet:       { emoji: '💨', msgs: ['manda a {obj} por los aires 💨', 'hace un yeet 💨'] }
}

const randomId = () =>
  `${Date.now()}_${crypto.randomBytes(5).toString('hex')}`

async function gifToMp4(buffer) {
  await fs.mkdir(TMP_DIR, { recursive: true })

  const id = randomId()
  const gif = path.join(TMP_DIR, `${id}.gif`)
  const mp4 = path.join(TMP_DIR, `${id}.mp4`)

  await fs.writeFile(gif, buffer)

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(gif)
        .outputOptions([
          '-pix_fmt yuv420p',
          '-c:v libx264',
          '-movflags +faststart',
          '-vf crop=floor(in_w/2)*2:floor(in_h/2)*2'
        ])
        .toFormat('mp4')
        .on('end', resolve)
        .on('error', reject)
        .save(mp4)
    })

    return await fs.readFile(mp4)
  } finally {
    await fs.unlink(gif).catch(() => {})
    await fs.unlink(mp4).catch(() => {})
  }
}

function construirTexto(accion, remitente, objetivo, tieneObjetivo) {
  const cfg = ACCIONES[accion]
  const frase = tieneObjetivo ? cfg.msgs[0] : cfg.msgs[1]

  return (
    `༺ ✰ 𝙰𝙽𝙸𝙼𝙴 𝚁𝙴𝙰𝙲𝚃 ✰ ༻\n\n` +
    `> ✦ \`${remitente}\` ${frase.replace('{obj}', objetivo)}`
  )
}

async function obtenerMedia(tipo) {
  const random = randomId()

  const url = `${API_BASE}${encodeURIComponent(tipo)}&r=${random}`

  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 25000,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })

  const contentType = String(res.headers['content-type'] || '').toLowerCase()
  let buffer = Buffer.from(res.data)

  if (
    contentType.includes('application/json') ||
    (!contentType.includes('image') && !contentType.includes('video'))
  ) {
    let json

    try {
      json = JSON.parse(buffer.toString('utf8'))
    } catch {
      throw new Error('La API devolvió una respuesta inválida.')
    }

    const mediaUrl =
      json?.url ||
      json?.image ||
      json?.gif ||
      json?.video ||
      json?.link ||
      json?.result ||
      json?.data?.url ||
      json?.data?.image

    if (!mediaUrl) {
      throw new Error('La API no devolvió ningún GIF.')
    }

    const finalUrl = mediaUrl.includes('?')
      ? `${mediaUrl}&r=${random}`
      : `${mediaUrl}?r=${random}`

    const media = await axios.get(finalUrl, {
      responseType: 'arraybuffer',
      timeout: 25000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    buffer = Buffer.from(media.data)
  }

  if (!buffer.length || buffer.length < 1000) {
    throw new Error('La API devolvió un archivo vacío.')
  }

  return buffer
}

const handler = async (m, { conn, command }) => {
  const cfg = ACCIONES[command]
  if (!cfg) return

  let target = m.sender

  if (m.mentionedJid?.[0]) {
    target = m.mentionedJid[0]
  } else if (m.quoted?.sender) {
    target = m.quoted.sender
  }

  const remitente = m.pushName || m.sender.split('@')[0]
  const objetivo = `@${target.split('@')[0]}`
  const tieneObjetivo = target !== m.sender

  const texto = construirTexto(
    command,
    remitente,
    objetivo,
    tieneObjetivo
  )

  await m.react(cfg.emoji)

  try {
    const buffer = await obtenerMedia(command)

    let video = buffer

    try {
      video = await gifToMp4(buffer)
    } catch {
      video = buffer
    }

    await conn.sendMessage(
      m.chat,
      {
        video,
        gifPlayback: true,
        mimetype: 'video/mp4',
        caption: texto,
        mentions: [...new Set([m.sender, target])]
      },
      { quoted: m }
    )

  } catch (error) {
    await m.react('❌')

    return m.reply(
      `༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻\n\n` +
      `> ✦ No se pudo obtener la reacción *${command}*.\n` +
      `> ✦ Intentá nuevamente.`
    )
  }
}

handler.command = Object.keys(ACCIONES)

handler.tags = ['anime']

handler.help = Object.keys(ACCIONES)
  .map(a => `${a} [@usuario]`)

export default handler