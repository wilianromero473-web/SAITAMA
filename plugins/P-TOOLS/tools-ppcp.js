import axios from 'axios'

const API_URL = 'https://raw.githubusercontent.com/ShirokamiRyzen/WAbot-DB/main/fitur_db/ppcp.json'

const handler = async (m, { conn }) => {
  await m.react('🔎')

  await m.reply(
`༺ ✰ BUSCANDO PAREJA ✰ ༻

> ✰ Obteniendo imágenes...
> ✰ Consultando la base de datos...
> ✰ Espera un momento.`
  )

  try {
    const res = await axios.get(API_URL, {
      timeout: 15000
    })

    const data = res.data

    if (!Array.isArray(data) || !data.length) {
      throw new Error('La API no devolvió resultados')
    }

    const cita = data[Math.floor(Math.random() * data.length)]

    if (!cita?.cowo || !cita?.cewe) {
      throw new Error('Datos de imágenes inválidos')
    }

    const [cowoRes, ceweRes] = await Promise.all([
      axios.get(cita.cowo, {
        responseType: 'arraybuffer',
        timeout: 15000
      }),

      axios.get(cita.cewe, {
        responseType: 'arraybuffer',
        timeout: 15000
      })
    ])

    await conn.sendMessage(
      m.chat,
      {
        image: Buffer.from(cowoRes.data),
        caption:
`༺ ✰ PAREJA MASCULINA ✰ ༻

> ✰ Tipo: Masculino
> ✰ Símbolo: ♂️
> ✰ Estado: Imagen obtenida correctamente.`
      },
      { quoted: m }
    )

    await conn.sendMessage(
      m.chat,
      {
        image: Buffer.from(ceweRes.data),
        caption:
`༺ ✰ PAREJA FEMENINA ✰ ༻

> ✰ Tipo: Femenina
> ✰ Símbolo: ♀️
> ✰ Estado: Imagen obtenida correctamente.`
      },
      { quoted: m }
    )

    await m.react('✅')

  } catch (error) {

    await m.react('❌')

    return m.reply(
`༺ ✰ ERROR ✰ ༻

> ✰ No se pudieron obtener las imágenes.
> ✰ La API puede estar caída o no devolver resultados.

> ✰ Error: ${error?.message || 'Desconocido'}`
    )
  }
}

handler.command = [
  'ppcp',
  'ppcouple'
]

handler.tags = [
  'tools'
]

handler.help = [
  'ppcouple'
]

export default handler