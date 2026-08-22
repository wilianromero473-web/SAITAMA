// ═════════════════════════════════════
// ✰ SAITAMABOT • CALCULADORA
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ FUNCIONES MATEMÁTICAS
// ═════════════════════════════════════

const MATH_FUNCS = {

  sqrt: Math.sqrt,
  cbrt: Math.cbrt,

  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,

  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,

  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,

  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,

  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,

  exp: Math.exp,
  pow: Math.pow,

  max: Math.max,
  min: Math.min,

  sign: Math.sign,
  trunc: Math.trunc,
  hypot: Math.hypot,


  // ═══════════════════════════════
  // ✰ FACTORIAL
  // ═══════════════════════════════

  factorial: n => {

    if (
      n < 0 ||
      n > 170 ||
      !Number.isFinite(n)
    ) {
      return NaN
    }

    let resultado = 1

    for (
      let i = 2;
      i <= n;
      i++
    ) {
      resultado *= i
    }

    return resultado
  }

}


// ═════════════════════════════════════
// ✰ CONSTANTES
// ═════════════════════════════════════

const MATH_CONSTS = {

  PI: Math.PI,

  E: Math.E,

  LN2: Math.LN2,

  LN10: Math.LN10,

  SQRT2: Math.SQRT2

}


// ═════════════════════════════════════
// ✰ CALCULAR EXPRESIÓN
// ═════════════════════════════════════

function calcular(expr) {

  let e =
    String(expr || '')
      .trim()


  // ═══════════════════════════════
  // ✰ POTENCIAS
  // ═══════════════════════════════

  e =
    e.replace(
      /\^/g,
      '**'
    )


  // ═══════════════════════════════
  // ✰ FACTORIALES
  // ═══════════════════════════════

  e =
    e.replace(
      /(\d+)!/g,
      'factorial($1)'
    )


  // ═══════════════════════════════
  // ✰ PORCENTAJES
  // ═══════════════════════════════

  e =
    e.replace(
      /(\d+)\s*%\s*(\d+)/g,
      '($1/100*$2)'
    )


  // ═══════════════════════════════
  // ✰ CONSTANTES
  // ═══════════════════════════════

  e =
    e.replace(
      /\bpi\b/gi,
      'PI'
    )

  e =
    e.replace(
      /\be\b/g,
      'E'
    )


  // ═══════════════════════════════
  // ✰ VALIDAR EXPRESIÓN
  // ═══════════════════════════════

  if (
    !/^[\d+\-*/().,\s%^!a-zA-Z_]+$/.test(e)
  ) {
    return null
  }


  // ═══════════════════════════════
  // ✰ CREAR FUNCIÓN
  // ═══════════════════════════════

  const fn =
    new Function(
      ...Object.keys(MATH_FUNCS),
      ...Object.keys(MATH_CONSTS),
      `"use strict";return (${e})`
    )


  // ═══════════════════════════════
  // ✰ EJECUTAR
  // ═══════════════════════════════

  const res =
    fn(
      ...Object.values(MATH_FUNCS),
      ...Object.values(MATH_CONSTS)
    )


  if (
    !Number.isFinite(res)
  ) {
    return null
  }


  return +parseFloat(
    res.toPrecision(12)
  )

}


// ═════════════════════════════════════
// ✰ CONSTRUIR PASOS
// ═════════════════════════════════════

function buildPasos(expr) {

  const pasos = []


  if (
    /[a-zA-Z]/.test(expr)
  ) {

    pasos.push(
      '> ① Funciones o constantes identificadas'
    )

  }


  if (
    /\*\*|\^/.test(expr)
  ) {

    pasos.push(
      '> ② Potencias calculadas'
    )

  }


  if (
    /\(/.test(expr)
  ) {

    pasos.push(
      '> ③ Paréntesis resueltos'
    )

  }


  if (
    /%/.test(expr)
  ) {

    pasos.push(
      '> ④ Porcentajes expandidos'
    )

  }


  pasos.push(
    '> ⑤ Operaciones: × ÷ antes que + −'
  )


  return pasos.join('\n')

}


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    text,
    usedPrefix,
    command
  }
) => {

  try {

    const expresion =
      String(
        text || ''
      ).trim()


    // ═══════════════════════════════
    // ✰ SIN EXPRESIÓN
    // ═══════════════════════════════

    if (!expresion) {

      return m.reply(
`༺ ✰ 𝙲𝙰𝙻𝙲𝚄𝙻𝙰𝙳𝙾𝚁𝙰 ✰ ༻

> ✰ 𝙴𝚜𝚌𝚛𝚒𝚋𝚎 𝚞𝚗𝚊 𝚎𝚡𝚙𝚛𝚎𝚜𝚒ó𝚗 𝚖𝚊𝚝𝚎𝚖á𝚝𝚒𝚌𝚊.

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾𝚂 ✰ ༻

> ✰ ${usedPrefix}${command} 25+25
> ✰ ${usedPrefix}${command} 10*5
> ✰ ${usedPrefix}${command} 2^8
> ✰ ${usedPrefix}${command} sqrt(144)
> ✰ ${usedPrefix}${command} factorial(5)
> ✰ ${usedPrefix}${command} 20%500`
      )

    }


    // ═══════════════════════════════
    // ✰ CALCULAR
    // ═══════════════════════════════

    const resultado =
      calcular(
        expresion
      )


    // ═══════════════════════════════
    // ✰ EXPRESIÓN INVÁLIDA
    // ═══════════════════════════════

    if (
      resultado === null
    ) {

      return m.reply(
`༺ ✰ 𝙴𝚇𝙿𝚁𝙴𝚂𝙸Ó𝙽 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙰 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚊𝚕𝚌𝚞𝚕𝚊𝚛 𝚕𝚊 𝚎𝚡𝚙𝚛𝚎𝚜𝚒ó𝚗.

> ✰ 𝚁𝚎𝚟𝚒𝚜𝚊 𝚕𝚘𝚜 𝚗ú𝚖𝚎𝚛𝚘𝚜,
> ✰ 𝚜í𝚖𝚋𝚘𝚕𝚘𝚜 𝚢 𝚏𝚞𝚗𝚌𝚒𝚘𝚗𝚎𝚜.`
      )

    }


    // ═══════════════════════════════
    // ✰ PASOS
    // ═══════════════════════════════

    const pasos =
      buildPasos(
        expresion
      )


    // ═══════════════════════════════
    // ✰ RESULTADO
    // ═══════════════════════════════

    return m.reply(
`༺ ✰ 𝙲𝙰𝙻𝙲𝚄𝙻𝙰𝙳𝙾𝚁𝙰 ✰ ༻

> ✰ 𝙴𝚡𝚙𝚛𝚎𝚜𝚒ó𝚗:
> \`${expresion}\`

༺ ✰ 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾 ✰ ༻

> ✰ \`${resultado}\`

༺ ✰ 𝙿𝙰𝚂𝙾𝚂 ✰ ༻

${pasos}

༺ ✰ 𝚂𝙰𝙸𝚃𝙰𝙼𝙰𝙱𝙾𝚃 ✰ ༻`
    )


  } catch (error) {

    console.error(
      '[CALCULADORA]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙾𝚌𝚞𝚛𝚛𝚒ó 𝚞𝚗 𝚎𝚛𝚛𝚘𝚛 𝚊𝚕 𝚌𝚊𝚕𝚌𝚞𝚕𝚊𝚛.

> ✰ 𝚁𝚎𝚟𝚒𝚜𝚊 𝚕𝚊 𝚎𝚡𝚙𝚛𝚎𝚜𝚒ó𝚗 𝚎 𝚒𝚗𝚝𝚎𝚗𝚝𝚊 𝚍𝚎 𝚗𝚞𝚎𝚟𝚘.`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'calc <expresión>',
  'calcular <expresión>',
  'calcularpt <expresión>',
  'calculator <expresión>'
]

handler.tags = [
  'convertidores'
]

handler.command = [
  'calc',
  'calcular',
  'calcularpt',
  'calculator'
]

export default handler