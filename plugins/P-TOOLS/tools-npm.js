import axios from 'axios'

const API_URL = 'https://api.popcat.xyz/v2/npm'

const handler = async (
  m,
  {
    conn,
    command,
    text,
    usedPrefix
  }
) => {

  if (!text) {
    return m.reply(
`༺ ✰ USO ✰ ༻

> ✰ ${usedPrefix + command} <nombre del paquete>
> ✰ Ejemplo: ${usedPrefix + command} axios`
    )
  }

  const packageName =
    text.trim()

  await m.react('🔎')

  await m.reply(
`༺ ✰ BUSCANDO PAQUETE ✰ ༻

> ✰ Paquete: ${packageName}
> ✰ Consultando NPM...
> ✰ Espera un momento.`
  )

  try {

    const res =
      await axios.get(
        API_URL,
        {
          params: {
            q: packageName
          },
          timeout: 15000,
          validateStatus: () => true
        }
      )

    if (
      res.status < 200 ||
      res.status >= 300
    ) {

      throw new Error(
        `HTTP ${res.status}`
      )
    }

    const data =
      res.data?.message ||
      res.data

    if (
      !data ||
      data.error
    ) {
      throw new Error(
        'Paquete no encontrado'
      )
    }

    const name =
      data.name ||
      packageName

    const version =
      data.version ||
      'Desconocida'

    const description =
      data.description ||
      'Sin descripción'

    const author =
      typeof data.author === 'object'
        ? data.author?.name || 'Desconocido'
        : data.author || 'Desconocido'

    const published =
      data.last_published ||
      'Desconocido'

    const downloads =
      data.downloadsthisyear ??
      0

    const caption =
`༺ ✰ PAQUETE NPM ✰ ༻

> ✰ Nombre: ${name}
> ✰ Versión: ${version}
> ✰ Autor: ${author}

༺ ✰ INFORMACIÓN ✰ ༻

> ✰ Descripción: ${description}
> ✰ Publicado: ${published}
> ✰ Descargas este año: ${downloads}

༺ ✰ API FUNCIONANDO ✰ ༻

> ✰ Estado: Correcto
> ✰ Código HTTP: ${res.status}
> ✰ Fuente: NPM`

    await conn.sendMessage(
      m.chat,
      {
        text: caption
      },
      {
        quoted: m
      }
    )

    await m.react('✅')

  } catch (error) {

    await m.react('❌')

    return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudo obtener información del paquete.
> ✰ La API puede estar caída o el paquete no existe.

> ✰ Error: ${error?.message || 'Desconocido'}`
    )
  }
}

handler.help = [
  'npm <paquete>',
  'popnpm <paquete>'
]

handler.tags = [
  'tools'
]

handler.command = [
  'npm',
  'popnpm'
]

export default handler