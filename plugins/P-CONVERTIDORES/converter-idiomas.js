import { IDIOMAS } from '../../lib/traductor.js'

const handler = async (m, { conn }) => {

  const lista = Object.entries(IDIOMAS)

  let texto =
    `*⌬┤ 🌎 ├⌬ IDIOMAS DISPONIBLES.*\n\n`

  for (const [codigo, nombre] of lista) {
    texto += `> 🌐 *${codigo}* — ${nombre}\n`
  }

  texto +=
    `\n*⌬┤ 💡 ├⌬ EJEMPLO.*\n` +
    `> #traducir en Hola mundo\n` +
    `> #traducir ja Hola mundo\n` +
    `> #traducir fr Hola mundo`

  return m.reply(texto)
}

handler.help = [
  'idiomas'
]

handler.command = [
  'idiomas',
  'lenguajes',
  'languages'
]

handler.tags = [
  'convertidores'
]

export default handler