const CONFIGS = [
  { key: 'antilink', emoji: '🔗', name: '𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺' },
  { key: 'antinotadevoz', emoji: '🎙️', name: '𝙰𝙽𝚃𝙸 𝙽𝙾𝚃𝙰 𝙳𝙴 𝚅𝙾𝚉' },
  { key: 'antimenciongp', emoji: '📢', name: '𝙰𝙽𝚃𝙸 𝙴𝚃𝙸𝚀𝚄𝙴𝚃𝙰 𝙳𝙴 𝙴𝚂𝚃𝙰𝙳𝙾' },
  { key: 'antisticker', emoji: '🎭', name: '𝙰𝙽𝚃𝙸 𝚂𝚃𝙸𝙲𝙺𝙴𝚁' },
  { key: 'antivideo', emoji: '🎬', name: '𝙰𝙽𝚃𝙸 𝚅𝙸𝙳𝙴𝙾' },
  { key: 'antiimagen', emoji: '🖼️', name: '𝙰𝙽𝚃𝙸 𝙸𝙼𝙰𝙶𝙴𝙽' },
  { key: 'antidelete', emoji: '🗑️', name: '𝙰𝙽𝚃𝙸 𝙳𝙴𝙻𝙴𝚃𝙴' },
  { key: 'antitoxic', emoji: '🚫', name: '𝙰𝙽𝚃𝙸 𝚃𝙾𝚇𝙸𝙲' },
  { key: 'antiCall', emoji: '📞', name: '𝙰𝙽𝚃𝙸 𝙻𝙻𝙰𝙼𝙰𝙳𝙰𝚂' }
]

const handler = async (m, { groupDb, groupMetadata, usedPrefix }) => {
  const grupoName = groupMetadata?.subject || 'Este grupo'

  let texto =
`༺ ✰ 𝙿𝙰𝙽𝙴𝙻 𝙳𝙴 𝙿𝚁𝙾𝚃𝙴𝙲𝙲𝙸Ó𝙽 ✰ ༻

> ✰ Grupo: *${grupoName}*

`

  for (const conf of CONFIGS) {
    const estado = groupDb[conf.key]
      ? '🟢 𝙾𝙽'
      : '🔴 𝙾𝙵𝙵'

    texto +=
`> ${conf.emoji} *${conf.name}*
> ✰ Estado: *${estado}*
> ✰ ${usedPrefix}${conf.key} on/off

`
  }

  texto += `༺ ✰ 𝙵𝙸𝙽 𝙳𝙴𝙻 𝙿𝙰𝙽𝙴𝙻 ✰ ༻`

  return m.reply(texto.trim())
}

handler.help = ['antis']
handler.tags = ['group']
handler.command = ['antis']
handler.groupOnly = true
handler.adminOnly = true
handler.noRegister = true

export default handler