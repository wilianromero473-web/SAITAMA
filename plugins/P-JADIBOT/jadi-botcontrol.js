import GroupDb from '../../lib/database/models/zen-groups.js'
import { groupDbCache } from '../../lib/caches.js'
import { subBots } from '../../lib/jadibot.js'


// ═════════════════════════════════════
// ✰ SAITAMABOT • CONTROL DE BOTS
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ NÚMERO DEL BOT
// ═════════════════════════════════════

const myNum = (conn) => {

  return normalizarNum(
    (conn.user?.id || '')
      .split(':')[0]
      .split('@')[0]
  )

}


// ═════════════════════════════════════
// ✰ NORMALIZAR NÚMERO
// ═════════════════════════════════════

function normalizarNum(numero) {

  if (!numero) return ''

  let n =
    String(numero)
      .replace(/\D/g, '')

  if (n.startsWith('549')) {
    n = '54' + n.slice(3)
  }

  if (n.startsWith('521')) {
    n = '52' + n.slice(3)
  }

  return n

}


// ═════════════════════════════════════
// ✰ RESOLVER BOT
// ═════════════════════════════════════

function resolverNumeroBot(
  m,
  args,
  conn
) {

  // ✰ BOT MENCIONADO
  if (
    m.mentionedJid?.length
  ) {

    return normalizarNum(
      m.mentionedJid[0]
        .split('@')[0]
    )

  }


  // ✰ MENSAJE CITADO
  if (
    m.quoted?.sender
  ) {

    return normalizarNum(
      m.quoted.sender
        .split('@')[0]
    )

  }


  // ✰ NÚMERO ESCRITO
  const primer =
    String(
      args[0] || ''
    ).replace(/\D/g, '')


  if (
    primer.length > 5
  ) {

    return normalizarNum(
      primer
    )

  }


  // ✰ BOT ACTUAL
  return myNum(conn)

}


// ═════════════════════════════════════
// ✰ ACTUALIZAR BASE DE DATOS
// ═════════════════════════════════════

async function actualizarGroupDb(
  groupDb,
  updates
) {

  Object.assign(
    groupDb,
    updates
  )


  await GroupDb.findOneAndUpdate(
    {
      id: groupDb.id
    },
    {
      $set: updates
    },
    {
      upsert: true
    }
  )


  groupDbCache.set(
    groupDb.id,
    groupDb
  )

}


// ═════════════════════════════════════
// ✰ HANDLER PRINCIPAL
// ═════════════════════════════════════

const handler = async (
  m,
  {
    conn,
    args,
    command,
    usedPrefix,
    isAdmin,
    isOwner,
    groupDb
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ DATOS DEL USUARIO
    // ═══════════════════════════════

    const senderNum =
      normalizarNum(
        m.sender
          ?.split('@')[0]
      )


    const esSubBotDueno =
      Boolean(
        conn.isSubBot &&
        senderNum ===
          normalizarNum(
            conn.ownerNumber
          )
      )


    const esAdminUOwner =
      Boolean(
        isAdmin ||
        isOwner
      )


    // ═══════════════════════════════
    // ✰ DUEÑO DE OTRO SUB-BOT
    // ═══════════════════════════════

    const esDuenoDeOtroSubBot =
      Boolean(
        !conn.isSubBot &&
        [...subBots.keys()]
          .map(normalizarNum)
          .includes(senderNum)
      )


    if (
      esDuenoDeOtroSubBot
    ) {
      return
    }


    // ═══════════════════════════════
    // ✰ PERMISOS
    // ═══════════════════════════════

    if (
      !esAdminUOwner &&
      !esSubBotDueno
    ) {

      return m.reply(
`༺ ✰ 𝙰𝙲𝙲𝙴𝚂𝙾 𝙳𝙴𝙽𝙴𝙶𝙰𝙳𝙾 ✰ ༻

> ✰ 𝚂𝚘𝚕𝚘 𝚕𝚘𝚜 𝚊𝚍𝚖𝚒𝚗𝚒𝚜𝚝𝚛𝚊𝚍𝚘𝚛𝚎𝚜 𝚘 𝚎𝚕 𝚍𝚞𝚎ñ𝚘 𝚍𝚎𝚕 𝚋𝚘𝚝 𝚙𝚞𝚎𝚍𝚎𝚗 𝚞𝚜𝚊𝚛 𝚎𝚜𝚝𝚎 𝚌𝚘𝚖𝚊𝚗𝚍𝚘.`
      )

    }


    const cmd =
      String(
        command || ''
      ).toLowerCase()


    const primerArg =
      String(
        args[0] || ''
      ).toLowerCase()


    // ═══════════════════════════════
    // ✰ ACTIVAR BOT
    // ═══════════════════════════════

    if (
      cmd === 'bot' ||
      cmd === 'boton'
    ) {

      // ✰ SUB-BOT PROPIO
      if (
        !esAdminUOwner &&
        esSubBotDueno
      ) {

        const myNumber =
          myNum(conn)


        const actuales =
          Array.isArray(
            groupDb.disabledBots
          )
            ? groupDb.disabledBots
            : []


        if (
          !actuales.includes(
            myNumber
          )
        ) {

          return m.reply(
`༺ ✰ 𝙱𝙾𝚃 𝙰𝙲𝚃𝙸𝚅𝙾 ✰ ༻

> ✰ 𝚃𝚞 𝚜𝚞𝚋-𝚋𝚘𝚝 (+${myNumber}) 𝚢𝚊 𝚎𝚜𝚝á 𝚊𝚌𝚝𝚒𝚟𝚘 𝚎𝚗 𝚎𝚜𝚝𝚎 𝚐𝚛𝚞𝚙𝚘.`
          )

        }


        const nuevosDisabled =
          actuales.filter(
            n => n !== myNumber
          )


        await actualizarGroupDb(
          groupDb,
          {
            disabledBots:
              nuevosDisabled
          }
        )


        return m.reply(
`༺ ✰ 𝚂𝚄𝙱-𝙱𝙾𝚃 𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾 ✰ ༻

> ✰ 𝚃𝚞 𝚜𝚞𝚋-𝚋𝚘𝚝 (+${myNumber}) 𝚑𝚊 𝚜𝚒𝚍𝚘 𝚛𝚎𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘 𝚎𝚗 𝚎𝚜𝚝𝚎 𝚐𝚛𝚞𝚙𝚘.`
        )

      }


      // ✰ TODOS
      if (
        primerArg === 'todos'
      ) {

        await actualizarGroupDb(
          groupDb,
          {
            disabledBots: [],
            mainBotSleeping: false,
            primaryBot: ''
          }
        )


        return m.reply(
`༺ ✰ 𝚃𝙾𝙳𝙾𝚂 𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾𝚂 ✰ ༻

> ✰ 𝚃𝚘𝚍𝚘𝚜 𝚕𝚘𝚜 𝚋𝚘𝚝𝚜 𝚎𝚜𝚝á𝚗 𝚊𝚌𝚝𝚒𝚟𝚘𝚜 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎 𝚎𝚗 𝚎𝚜𝚝𝚎 𝚐𝚛𝚞𝚙𝚘.`
        )

      }


      // ✰ BOT ESPECÍFICO
      const numero =
        resolverNumeroBot(
          m,
          args,
          conn
        )


      const actuales =
        Array.isArray(
          groupDb.disabledBots
        )
          ? groupDb.disabledBots
          : []


      const nuevosDisabled =
        actuales.filter(
          n =>
            n !== numero &&
            n !== 'todos'
        )


      if (
        actuales.length ===
          nuevosDisabled.length &&
        !actuales.includes(
          'todos'
        )
      ) {

        return m.reply(
`༺ ✰ 𝙱𝙾𝚃 𝙰𝙲𝚃𝙸𝚅𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚋𝚘𝚝 +${numero} 𝚢𝚊 𝚎𝚜𝚝á 𝚊𝚌𝚝𝚒𝚟𝚘 𝚎𝚗 𝚎𝚜𝚝𝚎 𝚐𝚛𝚞𝚙𝚘.`
        )

      }


      await actualizarGroupDb(
        groupDb,
        {
          disabledBots:
            nuevosDisabled
        }
      )


      return m.reply(
`༺ ✰ 𝙱𝙾𝚃 𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚋𝚘𝚝 +${numero} 𝚎𝚜𝚝á 𝚊𝚌𝚝𝚒𝚟𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎 𝚎𝚗 𝚎𝚜𝚝𝚎 𝚐𝚛𝚞𝚙𝚘.`
      )

    }


    // ═══════════════════════════════
    // ✰ DESACTIVAR BOT
    // ═══════════════════════════════

    if (
      cmd === 'botoff'
    ) {

      // ✰ SUB-BOT PROPIO
      if (
        !esAdminUOwner &&
        esSubBotDueno
      ) {

        const myNumber =
          myNum(conn)


        const actuales =
          Array.isArray(
            groupDb.disabledBots
          )
            ? groupDb.disabledBots
            : []


        if (
          actuales.includes(
            myNumber
          )
        ) {

          return m.reply(
`༺ ✰ 𝙱𝙾𝚃 𝙸𝙽𝙰𝙲𝚃𝙸𝚅𝙾 ✰ ༻

> ✰ 𝚃𝚞 𝚜𝚞𝚋-𝚋𝚘𝚝 (+${myNumber}) 𝚢𝚊 𝚎𝚜𝚝á 𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘 𝚎𝚗 𝚎𝚜𝚝𝚎 𝚐𝚛𝚞𝚙𝚘.`
          )

        }


        const nuevosDisabled = [
          ...actuales.filter(
            n => n !== 'todos'
          ),
          myNumber
        ]


        await actualizarGroupDb(
          groupDb,
          {
            disabledBots:
              nuevosDisabled
          }
        )


        return m.reply(
`༺ ✰ 𝚂𝚄𝙱-𝙱𝙾𝚃 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾 ✰ ༻

> ✰ 𝚃𝚞 𝚜𝚞𝚋-𝚋𝚘𝚝 (+${myNumber}) 𝚑𝚊 𝚜𝚒𝚍𝚘 𝚜𝚒𝚕𝚎𝚗𝚌𝚒𝚊𝚍𝚘 𝚎𝚗 𝚎𝚜𝚝𝚎 𝚐𝚛𝚞𝚙𝚘.`
        )

      }


      // ✰ TODOS
      if (
        primerArg === 'todos'
      ) {

        await actualizarGroupDb(
          groupDb,
          {
            disabledBots: ['todos']
          }
        )


        return m.reply(
`༺ ✰ 𝚃𝙾𝙳𝙾𝚂 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾𝚂 ✰ ༻

> ✰ 𝚃𝚘𝚍𝚘𝚜 𝚕𝚘𝚜 𝚜𝚞𝚋-𝚋𝚘𝚝𝚜 𝚑𝚊𝚗 𝚜𝚒𝚍𝚘 𝚜𝚒𝚕𝚎𝚗𝚌𝚒𝚊𝚍𝚘𝚜 𝚎𝚗 𝚎𝚜𝚝𝚎 𝚐𝚛𝚞𝚙𝚘.

> ✰ 𝚄𝚜𝚊: *${usedPrefix}bot todos* 𝚙𝚊𝚛𝚊 𝚛𝚎𝚊𝚌𝚝𝚒𝚟𝚊𝚛𝚕𝚘𝚜.`
        )

      }


      // ✰ BOT ESPECÍFICO
      const numero =
        resolverNumeroBot(
          m,
          args,
          conn
        )


      const mainBotNumber =
        conn.isSubBot
          ? normalizarNum(
              conn.mainBotNumber
            )
          : myNum(conn)


      // ✰ PROTEGER BOT PRINCIPAL
      if (
        numero ===
        mainBotNumber
      ) {

        return m.reply(
`༺ ✰ 𝙰𝙲𝙲𝙸Ó𝙽 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ✰ ༻

> ✰ 𝙴𝚕 𝚋𝚘𝚝 𝚙𝚛𝚒𝚗𝚌𝚒𝚙𝚊𝚕 𝚗𝚘 𝚙𝚞𝚎𝚍𝚎 𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚛𝚜𝚎 𝚙𝚘𝚛 𝚜í 𝚜𝚘𝚕𝚘.

> ✰ 𝙿𝚊𝚛𝚊 𝚜𝚒𝚕𝚎𝚗𝚌𝚒𝚊𝚛𝚕𝚘, 𝚊𝚜𝚒𝚐𝚗𝚊 𝚘𝚝𝚛𝚘 𝚋𝚘𝚝 𝚌𝚘𝚖𝚘 𝚙𝚛𝚒𝚗𝚌𝚒𝚙𝚊𝚕.`
        )

      }


      const actuales =
        Array.isArray(
          groupDb.disabledBots
        )
          ? groupDb.disabledBots
          : []


      if (
        actuales.includes(
          numero
        )
      ) {

        return m.reply(
`༺ ✰ 𝙱𝙾𝚃 𝙸𝙽𝙰𝙲𝚃𝙸𝚅𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚋𝚘𝚝 +${numero} 𝚢𝚊 𝚎𝚜𝚝á 𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘.`
        )

      }


      const nuevosDisabled = [
        ...actuales.filter(
          n => n !== 'todos'
        ),
        numero
      ]


      await actualizarGroupDb(
        groupDb,
        {
          disabledBots:
            nuevosDisabled
        }
      )


      return m.reply(
`༺ ✰ 𝙱𝙾𝚃 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚋𝚘𝚝 +${numero} 𝚏𝚞𝚎 𝚜𝚒𝚕𝚎𝚗𝚌𝚒𝚊𝚍𝚘 𝚎𝚗 𝚎𝚜𝚝𝚎 𝚐𝚛𝚞𝚙𝚘.

> ✰ 𝚄𝚜𝚊: *${usedPrefix}bot @bot* 𝚙𝚊𝚛𝚊 𝚛𝚎𝚊𝚌𝚝𝚒𝚟𝚊𝚛𝚕𝚘.`
      )

    }


    // ═══════════════════════════════
    // ✰ BOT PRINCIPAL
    // ═══════════════════════════════

    if (
      cmd === 'principal' ||
      cmd === 'setprimary'
    ) {

      if (
        !esAdminUOwner
      ) {

        return m.reply(
`༺ ✰ 𝙰𝙲𝙲𝙴𝚂𝙾 𝙳𝙴𝙽𝙴𝙶𝙰𝙳𝙾 ✰ ༻

> ✰ 𝚂𝚘𝚕𝚘 𝚕𝚘𝚜 𝚊𝚍𝚖𝚒𝚗𝚒𝚜𝚝𝚛𝚊𝚍𝚘𝚛𝚎𝚜 𝚘 𝚎𝚕 𝚍𝚞𝚎ñ𝚘 𝚙𝚞𝚎𝚍𝚎𝚗 𝚌𝚊𝚖𝚋𝚒𝚊𝚛 𝚎𝚕 𝚋𝚘𝚝 𝚙𝚛𝚒𝚗𝚌𝚒𝚙𝚊𝚕.`
        )

      }


      // ✰ QUITAR PRINCIPAL
      if (
        [
          'off',
          'none',
          'todos',
          'quitar',
          'reset'
        ].includes(
          primerArg
        )
      ) {

        if (
          !groupDb.primaryBot
        ) {

          return m.reply(
`༺ ✰ 𝚂𝙸𝙽 𝙱𝙾𝚃 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻 ✰ ༻

> ✰ 𝙽𝚘 𝚑𝚊𝚢 𝚗𝚒𝚗𝚐ú𝚗 𝚋𝚘𝚝 𝚊𝚜𝚒𝚐𝚗𝚊𝚍𝚘 𝚌𝚘𝚖𝚘 𝚙𝚛𝚒𝚗𝚌𝚒𝚙𝚊𝚕.`
          )

        }


        await actualizarGroupDb(
          groupDb,
          {
            primaryBot: ''
          }
        )


        return m.reply(
`༺ ✰ 𝙱𝙾𝚃 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻 𝚀𝚄𝙸𝚃𝙰𝙳𝙾 ✰ ༻

> ✰ 𝚃𝚘𝚍𝚘𝚜 𝚕𝚘𝚜 𝚋𝚘𝚝𝚜 𝚙𝚘𝚍𝚛á𝚗 𝚛𝚎𝚜𝚙𝚘𝚗𝚍𝚎𝚛 𝚗𝚘𝚛𝚖𝚊𝚕𝚖𝚎𝚗𝚝𝚎.`
        )

      }


      // ✰ RESOLVER BOT
      const numero =
        resolverNumeroBot(
          m,
          args,
          conn
        )


      if (
        !numero ||
        numero.length < 5
      ) {

        return m.reply(
`༺ ✰ 𝙱𝙾𝚃 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻 ✰ ༻

> ✰ *${usedPrefix}principal @bot*

> ✰ También puedes responder al mensaje del bot.

> ✰ *${usedPrefix}principal off* — quitar el bot principal.`
        )

      }


      if (
        groupDb.primaryBot ===
        numero
      ) {

        return m.reply(
`༺ ✰ 𝙱𝙾𝚃 𝚈𝙰 𝙴𝚂 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻 ✰ ༻

> ✰ 𝙴𝚕 𝚋𝚘𝚝 +${numero} 𝚢𝚊 𝚎𝚜 𝚎𝚕 𝚙𝚛𝚒𝚗𝚌𝚒𝚙𝚊𝚕 𝚍𝚎𝚕 𝚐𝚛𝚞𝚙𝚘.`
        )

      }


      await actualizarGroupDb(
        groupDb,
        {
          primaryBot:
            numero
        }
      )


      return m.reply(
`༺ ✰ 𝙱𝙾𝚃 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻 𝙰𝚂𝙸𝙶𝙽𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙴𝚕 𝚋𝚘𝚝 +${numero} 𝚊𝚑𝚘𝚛𝚊 𝚎𝚜 𝚎𝚕 𝚙𝚛𝚒𝚗𝚌𝚒𝚙𝚊𝚕 𝚍𝚎𝚕 𝚐𝚛𝚞𝚙𝚘.

> ✰ 𝙻𝚘𝚜 𝚍𝚎𝚖á𝚜 𝚋𝚘𝚝𝚜 𝚒𝚐𝚗𝚘𝚛𝚊𝚛á𝚗 𝚎𝚜𝚝𝚎 𝚐𝚛𝚞𝚙𝚘.

> ✰ 𝙿𝚊𝚛𝚊 𝚚𝚞𝚒𝚝𝚊𝚛𝚕𝚘:
> *${usedPrefix}principal off*`
      )

    }

  } catch (error) {

    console.error(
      '[BOT CONTROL]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛 𝚕𝚊 𝚊𝚌𝚌𝚒ó𝚗.

> ✰ 𝙸𝚗𝚝é𝚗𝚝𝚊𝚕𝚘 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`
    )

  }

}


// ═════════════════════════════════════
// ✰ AYUDA
// ═════════════════════════════════════

handler.help = [
  'bot [todos / @bot]',
  'botoff [todos / @bot]',
  'principal [@bot / off]'
]


// ═════════════════════════════════════
// ✰ CATEGORÍA
// ═════════════════════════════════════

handler.tags = [
  'jadibot'
]


// ═════════════════════════════════════
// ✰ COMANDOS
// ═════════════════════════════════════

handler.command = [
  'bot',
  'boton',
  'botoff',
  'principal',
  'setprimary'
]


// ═════════════════════════════════════
// ✰ SOLO GRUPOS
// ═════════════════════════════════════

handler.groupOnly = true


// ═════════════════════════════════════
// ✰ SIN REGISTRO
// ═════════════════════════════════════

handler.noRegister = true


export default handler