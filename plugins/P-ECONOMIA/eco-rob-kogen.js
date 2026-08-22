import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const extraerNum = (jid = '') => {
  return typeof jid === 'string'
    ? jid.split('@')[0].split(':')[0].replace(/\D/g, '')
    : ''
}

const resolveTargetJid = (m, participants = []) => {
  const raw = m.mentionedJid?.[0] || m.quoted?.sender || null

  if (!raw) return null

  if (!raw.endsWith('@lid')) {
    return raw
  }

  const p = participants.find(
    p => p.id === raw || p.lid === raw
  )

  if (p?.phoneNumber) {
    return `${String(p.phoneNumber).replace(/\D/g, '')}@s.whatsapp.net`
  }

  if (p?.id?.includes('@s.whatsapp.net')) {
    return p.id
  }

  return raw
}

const findByNum = (jid) => {
  const num = extraerNum(jid)

  if (!num) return null

  return User.findOne({
    jid: {
      $regex: `^${num}@`
    }
  }).lean()
}

function parseGenos(val) {
  if (val == null) return 0

  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : 0
  }

  if (typeof val === 'string') {
    return parseFloat(val) || 0
  }

  if (typeof val === 'object') {
    if (val.$numberDecimal) {
      return parseFloat(val.$numberDecimal) || 0
    }

    if (typeof val.toString === 'function') {
      const s = val.toString()

      if (s !== '[object Object]') {
        return parseFloat(s) || 0
      }
    }
  }

  return 0
}

function bestShield(inv) {
  const stock =
    inv?.shieldStock instanceof Map
      ? Object.fromEntries(inv.shieldStock)
      : (inv?.shieldStock || {})

  for (const tier of ['mythic', 'rare', 'normal']) {
    if (Number(stock[tier]) > 0) {
      return { tier }
    }
  }

  // Compatibilidad con el sistema antiguo de escudos
  if (
    Number(inv?.shield || 0) > 0 &&
    !stock.normal &&
    !stock.rare &&
    !stock.mythic
  ) {
    return {
      tier: 'normal',
      legacy: true
    }
  }

  return null
}

/*
 * Escenarios ficticios.
 * No contienen instrucciones reales de intrusión.
 */

const ESCENARIOS_EXITO = [
  'Atravesaste la bóveda virtual después de superar todos los protocolos de seguridad del sistema.',
  'La IA centinela confundió tu terminal con un dispositivo autorizado y abrió la cámara de Genos.',
  'El sistema sufrió una falla dimensional y dejó la bóveda temporalmente sin protección.',
  'Tu terminal consiguió sincronizarse con la red cuántica y encontró una ruta secreta hacia la bóveda.',
  'La defensa automática quedó atrapada en un bucle y aprovechaste el momento para completar el asalto.',
  'Un error de la IA de seguridad hizo aparecer una puerta secreta hacia los depósitos premium.',
  'El sistema de defensa perdió la conexión durante unos segundos y lograste completar la extracción.',
  'Tu terminal descifró el acertijo de la bóveda y consiguió acceso al depósito.',
  'La red de seguridad confundió tu identidad con la de un administrador del sistema.',
  'Un fallo en los protocolos de la bóveda permitió realizar la extracción sin activar la alarma.',
  'La IA centinela quedó distraída por una alerta falsa y tu operación fue un éxito.',
  'La bóveda cuántica aceptó tu terminal como dispositivo autorizado.',
  'El sistema sufrió una anomalía y abrió accidentalmente el compartimento premium.',
  'Encontraste una ruta secreta dentro de la red virtual y llegaste directamente a la bóveda.',
  'La defensa automática se reinició justo cuando comenzaba tu incursión.',
  'La inteligencia artificial de seguridad cometió un error y permitió el acceso.',
  'Tu terminal logró atravesar las defensas virtuales antes de que pudieran reaccionar.',
  'La bóveda sufrió una pequeña anomalía energética y sus defensas quedaron inactivas.',
  'Un error del sistema generó una autorización temporal que aprovechaste para completar el asalto.',
  'Después de una larga batalla contra la IA, conseguiste llegar al depósito de Genos.',
  'La red virtual abrió una ruta secreta que nadie conocía.',
  'El sistema de seguridad perdió tu señal y no pudo detener la operación.',
  'La bóveda entró en modo de mantenimiento y dejó disponible el depósito.',
  'Una anomalía cuántica alteró los sensores y tu presencia pasó desapercibida.',
  'Tu terminal encontró una vulnerabilidad ficticia en el sistema de seguridad.',
  'El protocolo de defensa se reinició y tu operación terminó con éxito.',
  'La IA centinela calculó mal tu trayectoria y dejaste atrás todas sus defensas.',
  'La cámara premium quedó temporalmente desbloqueada por un error del sistema.',
  'Tu incursión fue tan rápida que la alarma no alcanzó a reaccionar.',
  'La bóveda reconoció tu terminal como una unidad autorizada y abrió sus puertas.'
]

const ESCENARIOS_FALLO = [
  'La IA centinela detectó una anomalía y cerró inmediatamente la bóveda.',
  'Los sensores virtuales detectaron tu presencia antes de que llegaras al depósito.',
  'La defensa automática activó el protocolo de bloqueo y detuvo la operación.',
  'La bóveda reconoció tu terminal como una amenaza y activó sus defensas.',
  'Un sistema de seguridad detectó tu incursión y cerró todas las entradas.',
  'La IA de seguridad calculó tu movimiento y bloqueó la ruta hacia el depósito.',
  'Los sensores de la bóveda detectaron una actividad sospechosa y activaron la alarma.',
  'La defensa cuántica creó una barrera virtual que impidió continuar con el asalto.',
  'La red de seguridad detectó una anomalía y expulsó tu terminal.',
  'El protocolo de emergencia cerró la bóveda justo antes de completar la operación.',
  'La IA centinela identificó tu presencia y activó el bloqueo automático.',
  'El sistema defensivo reinició todos sus protocolos y canceló tu incursión.',
  'La bóveda cambió de ruta y perdiste el acceso al depósito.',
  'Los sensores detectaron tu señal y activaron una alarma de seguridad.',
  'La defensa automática consiguió detener tu operación en el último momento.',
  'El sistema reconoció tu intento de incursión y bloqueó la entrada.',
  'La IA de seguridad predijo tu movimiento y cerró la ruta de acceso.',
  'Una alerta de emergencia activó el cierre completo de la bóveda.',
  'El sistema defensivo detectó la anomalía y comenzó el protocolo de protección.',
  'Tu conexión con la bóveda se perdió justo cuando estabas a punto de completar el asalto.'
]

const handler = async (m, { userDb, participants }) => {
  if (!userDb) return

  const senderJid = userDb.jid

  /*
   * NIVEL MÍNIMO
   */

  if ((userDb.level || 0) < 15) {
    return m.reply(
`-𝙽𝙸𝚅𝙴𝙻 𝙸𝙽𝚂𝚄𝙵𝙸𝙲𝙸𝙴𝙽𝚃𝙴 ༻

✰ 𝙽𝚎𝚌𝚎𝚜𝚒𝚝𝚊́𝚜: *Nivel 15*
✰ 𝙽𝚒𝚟𝚎𝚕 𝚊𝚌𝚝𝚞𝚊𝚕: *${userDb.level || 0}*
✰ 𝙰𝚌𝚌𝚎𝚜𝚘: 🔒 𝙱𝚕𝚘𝚚𝚞𝚎𝚊𝚍𝚘

> Debés alcanzar *Nivel 15* para realizar incursiones de Genos.

-𝚂𝙰𝙸𝚃𝙰𝙼𝙰 𝙱𝙾𝚃 ༻`
    )
  }

  /*
   * COOLDOWN
   */

  const cooldown = 3600000
  const now = Date.now()

  const elapsed =
    now - (userDb.lastGenosRob || 0)

  if (elapsed < cooldown) {
    const remaining = cooldown - elapsed

    const minutes = Math.floor(
      remaining / 60000
    )

    const seconds = Math.floor(
      (remaining % 60000) / 1000
    )

    return m.reply(
`-𝚂𝙸𝚂𝚃𝙴𝙼𝙰 𝙱𝙻𝙾𝚀𝚄𝙴𝙰𝙳𝙾 ༻

✰ 𝙴𝚜𝚝𝚊𝚍𝚘: ⏳ 𝙴𝚗 𝚎𝚗𝚏𝚛𝚒𝚊𝚖𝚒𝚎𝚗𝚝𝚘
✰ 𝚃𝚒𝚎𝚖𝚙𝚘: *${minutes}m ${seconds}s*

> Tu terminal todavía está en enfriamiento.

-𝚂𝙰𝙸𝚃𝙰𝙼𝙰 𝙱𝙾𝚃 ༻`
    )
  }

  /*
   * OBJETIVO
   */

  const targetRaw = resolveTargetJid(
    m,
    participants
  )

  if (
    !targetRaw ||
    extraerNum(targetRaw) === extraerNum(m.sender)
  ) {
    return m.reply(
`-𝙾𝙱𝙹𝙴𝚃𝙸𝚅𝙾 𝙵𝙰𝙻𝚃𝙰𝙽𝚃𝙴 ༻

✰ 𝚄𝚜𝚘: *${config.PREFIX || '.'}robgenos @usuario*
✰ 𝙰𝚌𝚌𝚒𝚘́𝚗: 𝙼𝚊𝚛𝚌𝚊 𝚊 𝚞𝚗 𝚞𝚜𝚞𝚊𝚛𝚒𝚘

> Etiquetá o respondé al usuario que querés asaltar.

-𝚂𝙰𝙸𝚃𝙰𝙼𝙰 𝙱𝙾𝚃 ༻`
    )
  }

  /*
   * BUSCAR USUARIO
   */

  const targetDb = await findByNum(targetRaw)

  if (!targetDb) {
    return m.reply(
`-𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙽𝙾 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾 ༻

✰ 𝙴𝚜𝚝𝚊𝚍𝚘: ❌ 𝙽𝚘 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚍𝚘
✰ 𝙰𝚌𝚌𝚒𝚘́𝚗: 𝙲𝚊𝚗𝚌𝚎𝚕𝚊𝚍𝚊

> El usuario seleccionado no tiene una cuenta registrada.

-𝚂𝙰𝙸𝚃𝙰𝙼𝙰 𝙱𝙾𝚃 ༻`
    )
  }

  const targetJid = targetDb.jid

  const targetGenosVal =
    parseGenos(targetDb.genos)

  /*
   * PROTECCIÓN DE 30 GENOS
   */

  if (targetGenosVal < 30) {
    return m.reply(
`-𝙱𝙾́𝚅𝙴𝙳𝙰 𝙿𝚁𝙾𝚃𝙴𝙶𝙸𝙳𝙰 ༻

✰ 𝙾𝚋𝚓𝚎𝚝𝚒𝚟𝚘: @${extraerNum(targetJid)}
✰ ${config.PREMIUM_NAME}: *${targetGenosVal}*
✰ 𝙼𝚒́𝚗𝚒𝚖𝚘: *30 ${config.PREMIUM_NAME}*
✰ 𝙴𝚜𝚝𝚊𝚍𝚘: 🛡️ 𝙿𝚛𝚘𝚝𝚎𝚐𝚒𝚍𝚘

> La cuenta no puede ser asaltada mientras tenga menos de *30 ${config.PREMIUM_NAME}*.

-𝚂𝙰𝙸𝚃𝙰𝙼𝙰 𝙱𝙾𝚃 ༻`,
      {
        mentions: [targetJid]
      }
    )
  }

  /*
   * GUARDAR COOLDOWN
   */

  userDb.lastGenosRob = now

  /*
   * ESCUDO
   */

  const shield = bestShield(
    targetDb.inventory
  )

  if (shield) {
    const updateTarget = {
      $inc: {}
    }

    if (shield.legacy) {
      updateTarget.$inc['inventory.shield'] = -1
    } else {
      updateTarget.$inc[
        `inventory.shieldStock.${shield.tier}`
      ] = -1

      updateTarget.$inc['inventory.shield'] = -1
    }

    let penaltyText = ''

    /*
     * ESCUDO MÍTICO
     */

    if (shield.tier === 'mythic') {
      const attackerGenos =
        parseGenos(userDb.genos)

      const penaltyGenos =
        Math.min(attackerGenos, 2)

      if (penaltyGenos > 0) {
        userDb.genos =
          attackerGenos - penaltyGenos

        updateTarget.$inc.genos =
          penaltyGenos

        penaltyText =
`\n✰ 𝙿𝚎𝚗𝚊𝚕𝚒𝚣𝚊𝚌𝚒𝚘́𝚗: *${penaltyGenos} ${config.PREMIUM_NAME}*
✰ 𝙼𝚘𝚝𝚒𝚟𝚘: 𝙴𝚕 𝚎𝚜𝚌𝚞𝚍𝚘 𝙼𝚒́𝚝𝚒𝚌𝚘 𝚛𝚎𝚊𝚕𝚒𝚣𝚘́ 𝚞𝚗 𝚌𝚘𝚗𝚝𝚛𝚊𝚊𝚝𝚊𝚚𝚞𝚎.`
      }
    }

    await Promise.all([
      User.updateOne(
        { jid: targetJid },
        updateTarget
      ),

      User.updateOne(
        { jid: senderJid },
        {
          $set: {
            lastGenosRob: now,
            genos: userDb.genos
          }
        }
      )
    ])

    const shieldTxt =
`-𝙸𝙽𝚃𝚁𝚄𝚂𝙸𝙾́𝙽 𝙳𝙴𝚃𝙴𝙽𝙸𝙳𝙰 ༻

✰ 𝙾𝚋𝚓𝚎𝚝𝚒𝚟𝚘: @${extraerNum(targetJid)}
✰ 𝙴𝚜𝚌𝚞𝚍𝚘: *${shield.tier.toUpperCase()}*
✰ 𝙴𝚜𝚝𝚊𝚍𝚘: 🛡️ 𝙰𝚌𝚝𝚒𝚟𝚘

> El escudo del objetivo detuvo tu incursión.
> El escudo fue destruido.${penaltyText}

-𝚂𝙰𝙸𝚃𝙰𝙼𝙰 𝙱𝙾𝚃 ༻`

    return m.reply(
      shieldTxt,
      {
        mentions: [targetJid]
      }
    )
  }

  /*
   * PROBABILIDAD BASE
   */

  let chance = 0.35

  const bonusLogs = []

  /*
   * AMULETO
   */

  if (
    userDb.inventory?.amulet === 'thief'
  ) {
    chance += 0.10

    bonusLogs.push(
      `✰ 𝙰𝚖𝚞𝚕𝚎𝚝𝚘 𝚍𝚎𝚕 𝙻𝚊𝚍𝚛𝚘́𝚗: *+10%*`
    )
  }

  /*
   * TÍTULO
   */

  if (
    userDb.inventory?.title === 'title_sombra'
  ) {
    chance += 0.10

    bonusLogs.push(
      `✰ 𝚃𝚒́𝚝𝚞𝚕𝚘 "𝚂𝚘𝚖𝚋𝚛𝚊": *+10%*`
    )
  }

  /*
   * MÁSCARA
   */

  let usarMascara = false

  if (
    userDb.inventory?.mask === true
  ) {
    chance += 0.25
    usarMascara = true

    bonusLogs.push(
      `✰ 𝙼𝚊́𝚜𝚌𝚊𝚛𝚊 𝙷𝚊𝚌𝚔𝚎𝚛: *+25%*`
    )
  }

  /*
   * RESULTADO
   */

  if (Math.random() < chance) {

    /*
     * ÉXITO
     */

    let stolenGenos = 3
    let asaltoExcepcional = false

    /*
     * CUENTAS GRANDES
     */

    if (targetGenosVal >= 100000) {
      asaltoExcepcional = true

      const maxWhaleSteal =
        Math.min(
          10000,
          Math.floor(targetGenosVal * 0.05)
        )

      const minWhaleSteal = 100

      stolenGenos = Math.max(
        minWhaleSteal,
        Math.floor(
          Math.random() *
          (maxWhaleSteal - minWhaleSteal + 1)
        ) + minWhaleSteal
      )

    } else {

      const maxStorableSteal =
        Math.min(
          targetGenosVal - 15,
          10
        )

      stolenGenos = Math.max(
        3,
        Math.floor(
          Math.random() *
          (maxStorableSteal - 3 + 1)
        ) + 3
      )
    }

    /*
     * GENOS COINS
     */

    const stolenCoins =
      Math.floor(
        Math.random() * (150 - 40 + 1)
      ) + 40

    /*
     * ACTUALIZAR USUARIO
     */

    const attackerGenos =
      parseGenos(userDb.genos)

    userDb.genos =
      attackerGenos + stolenGenos

    userDb.genosCoins =
      (userDb.genosCoins || 0) +
      stolenCoins

    const updateSender = {
      $inc: {
        genos: stolenGenos,
        genosCoins: stolenCoins
      },

      $set: {
        lastGenosRob: now
      }
    }

    /*
     * CONSUMIR MÁSCARA
     */

    if (usarMascara) {
      updateSender.$set[
        'inventory.mask'
      ] = false
    }

    await Promise.all([
      User.updateOne(
        { jid: targetJid },
        {
          $inc: {
            genos: -stolenGenos
          }
        }
      ),

      User.updateOne(
        { jid: senderJid },
        updateSender
      )
    ])

    /*
     * ESCENARIO
     */

    const escenario =
      ESCENARIOS_EXITO[
        Math.floor(
          Math.random() *
          ESCENARIOS_EXITO.length
        )
      ]

    let successTxt =
`-𝙰𝚂𝙰𝙻𝚃𝙾 𝙴𝚇𝙸𝚃𝙾𝚂𝙾 ༻

✰ 𝚅𝚒́𝚌𝚝𝚒𝚖𝚊: @${extraerNum(targetJid)}
✰ 𝙴𝚜𝚌𝚎𝚗𝚊𝚛𝚒𝚘: ${escenario}

-𝙳𝙰𝚃𝙾𝚂 𝙳𝙴 𝙻𝙰 𝙾𝙿𝙴𝚁𝙰𝙲𝙸𝙾́𝙽 ༻

✰ ${config.PREMIUM_NAME} 𝚛𝚘𝚋𝚊𝚍𝚘𝚜: *${stolenGenos} ${config.PREMIUM_SYMBOL}*
✰ ${config.CURRENCY_NAME} 𝚘𝚋𝚝𝚎𝚗𝚒𝚍𝚘𝚜: *${stolenCoins} ${config.CURRENCY_SYMBOL}*`

    /*
     * ASALTO EXCEPCIONAL
     */

    if (asaltoExcepcional) {
      successTxt +=
`

-𝙰𝚂𝙰𝙻𝚃𝙾 𝙴𝚇𝙲𝙴𝙿𝙲𝙸𝙾𝙽𝙰𝙻 ༻

✰ 𝙱𝚘́𝚟𝚎𝚍𝚊: 🌌 𝙰𝚌𝚞𝚖𝚞𝚕𝚊𝚌𝚒𝚘́𝚗 𝚖𝚊𝚜𝚒𝚟𝚊
✰ 𝙱𝚘𝚗𝚞𝚜: 𝙴𝚡𝚝𝚛𝚊𝚌𝚌𝚒𝚘́𝚗 𝚎𝚜𝚙𝚎𝚌𝚒𝚊𝚕

> La enorme cantidad de activos del objetivo permitió realizar una extracción excepcional.`
    }

    /*
     * POTENCIADORES
     */

    if (bonusLogs.length) {
      successTxt +=
`

-𝙿𝙾𝚃𝙴𝙽𝙲𝙸𝙰𝙳𝙾𝚁𝙴𝚂 ༻

${bonusLogs.join('\n')}`
    }

    successTxt +=
`

-𝚂𝙰𝙸𝚃𝙰𝙼𝙰 𝙱𝙾𝚃 ༻`

    return m.reply(
      successTxt,
      {
        mentions: [targetJid]
      }
    )

  } else {

    /*
     * FALLO
     */

    const failureOutcome =
      Math.random() < 0.50

    const escenario =
      ESCENARIOS_FALLO[
        Math.floor(
          Math.random() *
          ESCENARIOS_FALLO.length
        )
      ]

    const updateSender = {
      $set: {
        lastGenosRob: now
      }
    }

    /*
     * CONSUMIR MÁSCARA
     */

    if (usarMascara) {
      updateSender.$set[
        'inventory.mask'
      ] = false
    }

    /*
     * MULTA DE GENOS COINS
     */

    if (failureOutcome) {

      const zcLoss =
        Math.floor(
          Math.random() *
          (3000 - 1000 + 1)
        ) + 1000

      const actualZcLoss =
        Math.min(
          userDb.genosCoins || 0,
          zcLoss
        )

      userDb.genosCoins =
        (userDb.genosCoins || 0) -
        actualZcLoss

      updateSender.$inc = {
        genosCoins: -actualZcLoss
      }

      await User.updateOne(
        { jid: senderJid },
        updateSender
      )

      let failTxt =
`-𝙰𝚂𝙰𝙻𝚃𝙾 𝙵𝙰𝙻𝙻𝙸𝙳𝙾 ༻

✰ 𝙾𝚋𝚓𝚎𝚝𝚒𝚟𝚘: @${extraerNum(targetJid)}
✰ 𝙴𝚜𝚌𝚎𝚗𝚊𝚛𝚒𝚘: ${escenario}

-𝙲𝙾𝙽𝚂𝙴𝙲𝚄𝙴𝙽𝙲𝙸𝙰𝚂 ༻

✰ 𝙼𝚞𝚕𝚝𝚊: *${actualZcLoss} ${config.CURRENCY_NAME}*
✰ 𝙴𝚜𝚝𝚊𝚍𝚘: 🚨 𝙾𝚙𝚎𝚛𝚊𝚌𝚒𝚘́𝚗 𝚍𝚎𝚝𝚎𝚗𝚒𝚍𝚊`

      /*
       * POTENCIADORES
       */

      if (bonusLogs.length) {
        failTxt +=
`

-𝙲𝙾𝙼𝙿𝙾𝙽𝙴𝙽𝚃𝙴𝚂 𝚄𝚂𝙰𝙳𝙾𝚂 ༻

${bonusLogs.join('\n')}`
      }

      failTxt +=
`

-𝚂𝙰𝙸𝚃𝙰𝙼𝙰 𝙱𝙾𝚃 ༻`

      return m.reply(
        failTxt,
        {
          mentions: [targetJid]
        }
      )

    } else {

      /*
       * PÉRDIDA DE GENOS
       */

      const attackerGenos =
        parseGenos(userDb.genos)

      const genosLoss =
        Math.floor(
          Math.random() *
          (3 - 1 + 1)
        ) + 1

      const actualGenosLoss =
        Math.min(
          attackerGenos,
          genosLoss
        )

      userDb.genos =
        attackerGenos -
        actualGenosLoss

      updateSender.$inc = {
        genos: -actualGenosLoss
      }

      await Promise.all([
        User.updateOne(
          { jid: targetJid },
          {
            $inc: {
              genos: actualGenosLoss
            }
          }
        ),

        User.updateOne(
          { jid: senderJid },
          updateSender
        )
      ])

      let totalFailTxt =
`-𝚃𝙴𝚁𝙼𝙸𝙽𝙰𝙻 𝙲𝙾𝙽𝙵𝙸𝚂𝙲𝙰𝙳𝙰 ༻

✰ 𝙾𝚋𝚓𝚎𝚝𝚒𝚟𝚘: @${extraerNum(targetJid)}
✰ 𝙴𝚜𝚌𝚎𝚗𝚊𝚛𝚒𝚘: ${escenario}

-𝚂𝙰𝙽𝙲𝙸𝙾𝙽𝙴𝚂 ༻

✰ ${config.PREMIUM_NAME} 𝚙𝚎𝚛𝚍𝚒𝚍𝚘𝚜: *${actualGenosLoss} ${config.PREMIUM_SYMBOL}*
✰ 𝙳𝚎𝚜𝚝𝚒𝚗𝚘: 𝙲𝚘𝚖𝚙𝚎𝚗𝚜𝚊𝚌𝚒𝚘́𝚗 𝚊𝚕 𝚘𝚋𝚓𝚎𝚝𝚒𝚟𝚘`

      /*
       * POTENCIADORES
       */

      if (bonusLogs.length) {
        totalFailTxt +=
`

-𝙲𝙾𝙼𝙿𝙾𝙽𝙴𝙽𝚃𝙴𝚂 𝚄𝚂𝙰𝙳𝙾𝚂 ༻

${bonusLogs.join('\n')}`
      }

      totalFailTxt +=
`

-𝚂𝙰𝙸𝚃𝙰𝙼𝙰 𝙱𝙾𝚃 ༻`

      return m.reply(
        totalFailTxt,
        {
          mentions: [targetJid]
        }
      )
    }
  }
}

handler.help = [
  'robgenos @tag'
]

handler.tags = [
  'eco'
]

handler.command = [
  'robgenos',
  'robark',
  'rbk',
  'rk',
  'heist',
  'robargenos'
]

handler.groupOnly = true
handler.register = true

export default handler