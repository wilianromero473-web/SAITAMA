import axios from 'axios'

const handler = async (
  m,
  {
    conn,
    command,
    args,
    usedPrefix
  }
) => {

  if (!args[0]) {
    return m.reply(
`༺ ✰ USO ✰ ༻

> ✰ ${usedPrefix + command} <usuario>
> ✰ Ejemplo: ${usedPrefix + command} octocat`
    )
  }

  await m.react('🔎')

  await m.reply(
`༺ ✰ BUSCANDO EN GITHUB ✰ ༻

> ✰ Buscando información del usuario...
> ✰ Espera un momento.`
  )

  try {

    const username =
      args[0].trim()

    const res = await axios.get(
      `https://api.popcat.xyz/v2/github/${encodeURIComponent(username)}`,
      {
        timeout: 15000
      }
    )

    const d =
      res.data?.message

    if (
      !d ||
      res.data?.error
    ) {
      throw new Error(
        'Usuario no encontrado'
      )
    }

    const name =
      d.name ||
      d.login ||
      username

    const cap =
`༺ ✰ GITHUB ✰ ༻

> ✰ Nombre: ${name}
> ✰ Usuario: @${d.login || username}
> ✰ Tipo: ${d.account_type || '—'}
> ✰ Ubicación: ${d.location || '—'}
> ✰ Email: ${d.email || '—'}
> ✰ Repositorios: ${d.public_repos ?? 0}
> ✰ Seguidores: ${d.followers ?? 0}
> ✰ Siguiendo: ${d.following ?? 0}

༺ ✰ BIO ✰ ༻

> ${d.bio || 'Sin biografía.'}

༺ ✰ CUENTA ✰ ༻

> ✰ Creado: ${d.created_at || '—'}
> ✰ Perfil: ${d.url || '—'}

༺ ✰ SAITAMABOT ✰ ༻`

    if (!d.avatar) {

      await m.react('✅')

      return conn.sendMessage(
        m.chat,
        {
          text: cap
        },
        {
          quoted: m
        }
      )
    }

    await conn.sendMessage(
      m.chat,
      {
        image: {
          url: d.avatar
        },
        caption: cap
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

> ✰ No se pudo encontrar el usuario en GitHub.
> ✰ Verifica que el nombre de usuario sea correcto.`
    )
  }
}

handler.help = [
  'github <usuario>',
  'popgithub <usuario>'
]

handler.tags = [
  'tools'
]

handler.command = [
  'github',
  'popgithub'
]

export default handler