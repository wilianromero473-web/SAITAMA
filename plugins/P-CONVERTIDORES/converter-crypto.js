// ═════════════════════════════════════
// ✰ SAITAMABOT • ENCRIPTADOR
// ═════════════════════════════════════


// ═════════════════════════════════════
// ✰ CÓDIGO MORSE
// ═════════════════════════════════════

const MORSE = {

  a: '.-',
  b: '-...',
  c: '-.-.',
  d: '-..',
  e: '.',
  f: '..-.',
  g: '--.',
  h: '....',
  i: '..',

  j: '.---',
  k: '-.-',
  l: '.-..',
  m: '--',
  n: '-.',
  o: '---',
  p: '.--.',
  q: '--.-',
  r: '.-.',

  s: '...',
  t: '-',
  u: '..-',
  v: '...-',
  w: '.--',
  x: '-..-',
  y: '-.--',
  z: '--..',

  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',

  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',

  ' ': '/'

}


// ═════════════════════════════════════
// ✰ MORSE INVERSO
// ═════════════════════════════════════

const MORSE_INV =
  Object.fromEntries(
    Object.entries(MORSE)
      .map(([key, value]) => [value, key])
  )


// ═════════════════════════════════════
// ✰ MD5
// ═════════════════════════════════════

function md5(str) {

  const buf =
    Buffer.from(
      str,
      'utf8'
    )

  let h0 = 0x67452301
  let h1 = 0xEFCDAB89
  let h2 = 0x98BADCFE
  let h3 = 0x10325476


  const K =
    Array.from(
      {
        length: 64
      },
      (_, i) =>
        Math.floor(
          Math.abs(
            Math.sin(i + 1)
          ) * 2 ** 32
        ) >>> 0
    )


  const s = [
    7, 12, 17, 22,
    7, 12, 17, 22,
    7, 12, 17, 22,
    7, 12, 17, 22,

    5, 9, 14, 20,
    5, 9, 14, 20,
    5, 9, 14, 20,
    5, 9, 14, 20,

    4, 11, 16, 23,
    4, 11, 16, 23,
    4, 11, 16, 23,
    4, 11, 16, 23,

    6, 10, 15, 21,
    6, 10, 15, 21,
    6, 10, 15, 21,
    6, 10, 15, 21
  ]


  const bits =
    buf.length * 8


  const pad =
    Buffer.alloc(
      buf.length +
      1 +
      (
        buf.length % 64 < 56
          ? 55 - buf.length % 64
          : 119 - buf.length % 64
      ) +
      8
    )


  buf.copy(pad)

  pad[buf.length] =
    0x80

  pad.writeBigUInt64LE(
    BigInt(bits),
    pad.length - 8
  )


  for (
    let offset = 0;
    offset < pad.length;
    offset += 64
  ) {

    const M =
      Array.from(
        {
          length: 16
        },
        (_, i) =>
          pad.readUInt32LE(
            offset + i * 4
          )
      )


    let [a, b, c, d] =
      [h0, h1, h2, h3]


    for (
      let i = 0;
      i < 64;
      i++
    ) {

      let F
      let g


      if (i < 16) {

        F =
          (b & c) |
          (~b & d)

        g = i

      } else if (i < 32) {

        F =
          (d & b) |
          (~d & c)

        g =
          (5 * i + 1) % 16

      } else if (i < 48) {

        F =
          b ^ c ^ d

        g =
          (3 * i + 5) % 16

      } else {

        F =
          c ^ (b | (~d >>> 0))

        g =
          (7 * i) % 16
      }


      F =
        (
          F +
          a +
          K[i] +
          M[g]
        ) >>> 0


      a = d
      d = c
      c = b


      b =
        (
          b +
          (
            (F << s[i]) |
            (F >>> (32 - s[i]))
          )
        ) >>> 0

    }


    h0 =
      (h0 + a) >>> 0

    h1 =
      (h1 + b) >>> 0

    h2 =
      (h2 + c) >>> 0

    h3 =
      (h3 + d) >>> 0

  }


  return [
    h0,
    h1,
    h2,
    h3
  ]
    .map(
      n =>
        n
          .toString(16)
          .padStart(8, '0')
          .match(/../g)
          .reverse()
          .join('')
    )
    .join('')
}


// ═════════════════════════════════════
// ✰ ENCRIPTADORES
// ═════════════════════════════════════

const encriptadores = {

  base64: texto =>
    Buffer
      .from(texto)
      .toString('base64'),


  hex: texto =>
    Buffer
      .from(texto)
      .toString('hex'),


  rot13: texto =>
    texto.replace(
      /[a-zA-Z]/g,
      caracter => {

        const base =
          caracter <= 'Z'
            ? 65
            : 97

        return String.fromCharCode(
          (
            caracter.charCodeAt(0) -
            base +
            13
          ) % 26 +
          base
        )
      }
    ),


  url: texto =>
    encodeURIComponent(texto),


  binario: texto =>
    texto
      .split('')
      .map(
        caracter =>
          caracter
            .charCodeAt(0)
            .toString(2)
            .padStart(8, '0')
      )
      .join(' '),


  unicode: texto =>
    texto
      .split('')
      .map(
        caracter =>
          '\\u' +
          caracter
            .charCodeAt(0)
            .toString(16)
            .padStart(4, '0')
      )
      .join(''),


  md5: texto =>
    md5(texto),


  morse: texto =>
    texto
      .toLowerCase()
      .split('')
      .map(
        caracter =>
          MORSE[caracter] || '?'
      )
      .join(' ')

}


// ═════════════════════════════════════
// ✰ COMPROBAR TEXTO LEGIBLE
// ═════════════════════════════════════

const esLegible = texto =>
  typeof texto === 'string' &&
  texto.length > 0 &&
  /^[\x20-\x7E\n\r\t]*$/.test(texto)


// ═════════════════════════════════════
// ✰ DETECTAR Y DESENCRIPTAR
// ═════════════════════════════════════

function intentarDecodificar(texto) {

  // ═══════════════════════════════
  // ✰ BASE64
  // ═══════════════════════════════

  try {

    const valor =
      Buffer
        .from(
          texto,
          'base64'
        )
        .toString('utf-8')


    if (
      esLegible(valor) &&
      valor !== texto
    ) {

      return {
        tipo: 'Base64',
        valor
      }

    }

  } catch {}



  // ═══════════════════════════════
  // ✰ HEX
  // ═══════════════════════════════

  try {

    if (
      /^[0-9a-fA-F\s]+$/.test(texto) &&
      texto
        .replace(/\s/g, '')
        .length % 2 === 0
    ) {

      const valor =
        Buffer
          .from(
            texto.replace(/\s/g, ''),
            'hex'
          )
          .toString('utf-8')


      if (
        esLegible(valor)
      ) {

        return {
          tipo: 'Hex',
          valor
        }

      }

    }

  } catch {}



  // ═══════════════════════════════
  // ✰ BINARIO
  // ═══════════════════════════════

  if (
    /^[01\s]+$/.test(texto) &&
    texto.trim().split(/\s+/).length > 1
  ) {

    try {

      const valor =
        texto
          .trim()
          .split(/\s+/)
          .map(
            bin =>
              String.fromCharCode(
                parseInt(bin, 2)
              )
          )
          .join('')


      if (
        esLegible(valor)
      ) {

        return {
          tipo: 'Binario',
          valor
        }

      }

    } catch {}

  }



  // ═══════════════════════════════
  // ✰ URL
  // ═══════════════════════════════

  try {

    const valor =
      decodeURIComponent(texto)


    if (
      valor !== texto &&
      esLegible(valor)
    ) {

      return {
        tipo: 'URL',
        valor
      }

    }

  } catch {}



  // ═══════════════════════════════
  // ✰ UNICODE
  // ═══════════════════════════════

  if (
    /\\u[\dA-F]{4}/i.test(texto)
  ) {

    try {

      const valor =
        texto.replace(
          /\\u([\dA-F]{4})/gi,
          (_, hexadecimal) =>
            String.fromCharCode(
              parseInt(
                hexadecimal,
                16
              )
            )
        )


      if (
        esLegible(valor)
      ) {

        return {
          tipo: 'Unicode',
          valor
        }

      }

    } catch {}

  }



  // ═══════════════════════════════
  // ✰ MORSE
  // ═══════════════════════════════

  if (
    /^[.\-/\s]+$/.test(texto)
  ) {

    try {

      const valor =
        texto
          .trim()
          .split(' / ')
          .map(
            palabra =>
              palabra
                .split(' ')
                .map(
                  codigo =>
                    MORSE_INV[codigo] || '?'
                )
                .join('')
          )
          .join(' ')


      if (
        esLegible(valor) &&
        !valor.includes('?')
      ) {

        return {
          tipo: 'Morse',
          valor
        }

      }

    } catch {}

  }



  // ═══════════════════════════════
  // ✰ ROT13
  // ═══════════════════════════════

  try {

    const valor =
      texto.replace(
        /[a-zA-Z]/g,
        caracter => {

          const base =
            caracter <= 'Z'
              ? 65
              : 97

          return String.fromCharCode(
            (
              caracter.charCodeAt(0) -
              base +
              13
            ) % 26 +
            base
          )

        }
      )


    if (
      valor !== texto &&
      esLegible(valor)
    ) {

      return {
        tipo: 'ROT13',
        valor
      }

    }

  } catch {}


  return null
}


// ═════════════════════════════════════
// ✰ HANDLER
// ═════════════════════════════════════

const handler = async (
  m,
  {
    command,
    text,
    usedPrefix
  }
) => {

  try {

    // ═══════════════════════════════
    // ✰ ENCRIPTAR
    // ═══════════════════════════════

    const isEnc =
      [
        'encriptar',
        'encrypt',
        'criptografar'
      ].includes(command)


    // ═══════════════════════════════
    // ✰ DESENCRIPTAR
    // ═══════════════════════════════

    const isDec =
      [
        'desencriptar',
        'decrypt',
        'descriptografar'
      ].includes(command)



    // ═══════════════════════════════
    // ✰ PROCESO DE ENCRIPTADO
    // ═══════════════════════════════

    if (isEnc) {

      if (!text) {

        return m.reply(
`༺ ✰ 𝙴𝙽𝙲𝚁𝙸𝙿𝚃𝙰𝙳𝙾𝚁 ✰ ༻

> ✰ 𝚄𝚜𝚘:
> *${usedPrefix}${command} <tipo>: <texto>*

༺ ✰ 𝚃𝙸𝙿𝙾𝚂 𝙳𝙸𝚂𝙿𝙾𝙽𝙸𝙱𝙻𝙴𝚂 ✰ ༻

> ✰ base64
> ✰ hex
> ✰ rot13
> ✰ url
> ✰ binario
> ✰ unicode
> ✰ md5
> ✰ morse

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> *${usedPrefix}${command} base64: hola mundo*`
        )

      }


      const match =
        text.match(
          /^([a-zA-Z0-9]+)\s*[:>\-|=>]\s*(.+)$/s
        )


      if (!match) {

        return m.reply(
`༺ ✰ 𝙵𝙾𝚁𝙼𝙰𝚃𝙾 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 ✰ ༻

> ✰ 𝚄𝚜𝚊 𝚎𝚕 𝚏𝚘𝚛𝚖𝚊𝚝𝚘:

*${usedPrefix}${command} base64: hola mundo*

༺ ✰ 𝚃𝙸𝙿𝙾𝚂 ✰ ༻

> ✰ base64
> ✰ hex
> ✰ rot13
> ✰ url
> ✰ binario
> ✰ unicode
> ✰ md5
> ✰ morse`
        )

      }


      const tipo =
        match[1]
          .trim()
          .toLowerCase()


      const msg =
        match[2]
          .trim()


      const fn =
        encriptadores[tipo]


      if (!fn) {

        return m.reply(
`༺ ✰ 𝚃𝙸𝙿𝙾 𝙽𝙾 𝚂𝙾𝙿𝙾𝚁𝚃𝙰𝙳𝙾 ✰ ༻

> ✰ Tipo recibido: ${tipo}

> ✰ Tipos disponibles:

base64
hex
rot13
url
binario
unicode
md5
morse`
        )

      }


      const resultado =
        fn(msg)


      return m.reply(
`༺ ✰ 𝙴𝙽𝙲𝚁𝙸𝙿𝚃𝙰𝙳𝙾 ✰ ༻

> ✰ 𝚃𝚒𝚙𝚘: ${tipo.toUpperCase()}

> ✰ 𝙾𝚛𝚒𝚐𝚒𝚗𝚊𝚕:
> \`${msg}\`

> ✰ 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘:
> \`${resultado}\`

༺ ✰ 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙳𝙾 ✰ ༻`
      )

    }



    // ═══════════════════════════════
    // ✰ PROCESO DE DESENCRIPTADO
    // ═══════════════════════════════

    if (isDec) {

      if (!text) {

        return m.reply(
`༺ ✰ 𝙳𝙴𝚂𝙴𝙽𝙲𝚁𝙸𝙿𝚃𝙰𝙳𝙾𝚁 ✰ ༻

> ✰ 𝚄𝚜𝚘:
> *${usedPrefix}${command} <texto>*

༺ ✰ 𝙵𝙾𝚁𝙼𝙰𝚃𝙾𝚂 𝙳𝙴𝚃𝙴𝙲𝚃𝙰𝙱𝙻𝙴𝚂 ✰ ༻

> ✰ Base64
> ✰ Hex
> ✰ Binario
> ✰ URL
> ✰ Unicode
> ✰ Morse
> ✰ ROT13

༺ ✰ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 ✰ ༻

> *${usedPrefix}${command} SG9sYSBtdW5kbw==*`
        )

      }


      const resultado =
        intentarDecodificar(text)


      if (!resultado) {

        return m.reply(
`༺ ✰ 𝙽𝙾 𝙳𝙴𝚃𝙴𝙲𝚃𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚒𝚍𝚎𝚗𝚝𝚒𝚏𝚒𝚌𝚊𝚛 𝚎𝚕 𝚏𝚘𝚛𝚖𝚊𝚝𝚘.
> ✰ 𝚁𝚎𝚟𝚒𝚜𝚊 𝚚𝚞𝚎 𝚎𝚕 𝚝𝚎𝚡𝚝𝚘 𝚎𝚜𝚝é 𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚘.`
        )

      }


      return m.reply(
`༺ ✰ 𝙳𝙴𝚂𝙴𝙽𝙲𝚁𝙸𝙿𝚃𝙰𝙳𝙾 ✰ ༻

> ✰ 𝙵𝚘𝚛𝚖𝚊𝚝𝚘: ${resultado.tipo}
> ✰ 𝙲ó𝚍𝚒𝚐𝚘:
> \`${text.slice(0, 150)}\`
> ✰ 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘:
> \`${resultado.valor}\`

༺ ✰ 𝙳𝙴𝚃𝙴𝙲𝚃𝙰𝙳𝙾 𝙰𝚄𝚃𝙾𝙼Á𝚃𝙸𝙲𝙰𝙼𝙴𝙽𝚃𝙴 ✰ ༻`
      )

    }

  } catch (error) {

    console.error(
      '[ENCRIPTADOR]',
      error?.message ||
      error
    )


    return m.reply(
`༺ ✰ 𝙴𝚁𝚁𝙾𝚁 ✰ ༻

> ✰ 𝙽𝚘 𝚜𝚎 𝚙𝚞𝚍𝚘 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚊𝚛 𝚕𝚊 𝚘𝚙𝚎𝚛𝚊𝚌𝚒ó𝚗.

> ✰ 𝙳𝚎𝚝𝚊𝚕𝚕𝚎:
> ${String(
  error?.message ||
  'Error desconocido.'
).slice(0, 250)}`
    )

  }

}


// ═════════════════════════════════════
// ✰ CONFIGURACIÓN
// ═════════════════════════════════════

handler.help = [
  'encriptar <tipo>: <texto>',
  'desencriptar <texto>'
]

handler.tags = [
  'convertidores'
]

handler.command = [
  'encriptar',
  'encrypt',
  'criptografar',
  'desencriptar',
  'decrypt',
  'descriptografar'
]

export default handler