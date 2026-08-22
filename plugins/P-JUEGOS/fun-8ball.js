const RESPUESTAS = [
  '✦ Sí, definitivamente.',
  '✦ Todo apunta a que sí.',
  '✦ Sin dudas.',
  '✦ Podés contar con ello.',
  '✧ Es difícil saberlo ahora.',
  '✧ Preguntá de nuevo más tarde.',
  '✧ Mejor no te lo digo ahora.',
  '✧ No me es posible predecirlo.',
  '✘ No cuentes con ello.',
  '✘ Mi respuesta es no.',
  '✘ Las perspectivas no son buenas.',
  '✘ Muy dudoso.'
]

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `*✰ 𝙵𝙰𝙻𝚃𝙰 𝙻𝙰 𝙿𝚁𝙴𝙶𝚄𝙽𝚃𝙰 ༻*\n\n` +
      `> ✦ Haceme una pregunta.\n` +
      `> ✦ Ejemplo: *${usedPrefix}${command} ¿Voy a tener suerte hoy?*`
    )
  }

  const respuesta =
    RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)]

  return m.reply(
    `*✰ 𝟾-𝙱𝙰𝙻𝙻 ༻*\n\n` +
    `> ❓ 𝙿𝚛𝚎𝚐𝚞𝚗𝚝𝚊: ${text}\n` +
    `> 🔮 𝚁𝚎𝚜𝚙𝚞𝚎𝚜𝚝𝚊: ${respuesta}`
  )
}

handler.help = ['8ball <pregunta>']
handler.tags = ['fun']
handler.command = ['8ball', 'bola8', 'prediccion']

export default handler