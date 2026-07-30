import axios from 'axios'

const API = 'https://luxinfinity.vercel.app/api/tools/translate'

export const IDIOMAS = {
  es: 'Español',
  en: 'Inglés',
  af: 'Afrikáans',
  sq: 'Albanés',
  de: 'Alemán',
  am: 'Amárico',
  ar: 'Árabe',
  hy: 'Armenio',
  az: 'Azerbaiyano',
  bn: 'Bengalí',
  be: 'Bielorruso',
  my: 'Birmano',
  bs: 'Bosnio',
  bg: 'Búlgaro',
  km: 'Camboyano',
  kn: 'Canarés',
  ca: 'Catalán',
  ceb: 'Cebuano',
  cs: 'Checo',
  ny: 'Nyanja',
  si: 'Cingalés',
  ko: 'Coreano',
  co: 'Corso',
  ht: 'Criollo haitiano',
  hr: 'Croata',
  da: 'Danés',
  sk: 'Eslovaco',
  sl: 'Esloveno',
  eo: 'Esperanto',
  et: 'Estonio',
  eu: 'Euskera',
  fi: 'Finlandés',
  fr: 'Francés',
  fy: 'Frisón',
  gd: 'Gaélico escocés',
  cy: 'Galés',
  gl: 'Gallego',
  ka: 'Georgiano',
  el: 'Griego',
  gu: 'Guyaratí',
  ha: 'Hausa',
  he: 'Hebreo',
  hi: 'Hindi',
  hmn: 'Hmong',
  hu: 'Húngaro',
  ig: 'Igbo',
  id: 'Indonesio',
  ga: 'Irlandés',
  is: 'Islandés',
  it: 'Italiano',
  ja: 'Japonés',
  jv: 'Javanés',
  kk: 'Kazajo',
  ky: 'Kirguís',
  ku: 'Kurdo',
  lo: 'Laosiano',
  la: 'Latín',
  lv: 'Letón',
  lt: 'Lituano',
  lb: 'Luxemburgués',
  mk: 'Macedonio',
  mg: 'Malagasy',
  ms: 'Malayo',
  ml: 'Malabar',
  mt: 'Maltés',
  mi: 'Maorí',
  mr: 'Maratí',
  mn: 'Mongol',
  ne: 'Nepalés',
  no: 'Noruego',
  ps: 'Pastún',
  fa: 'Persa',
  pl: 'Polaco',
  pt: 'Portugués',
  pa: 'Punjabi',
  ro: 'Rumano',
  ru: 'Ruso',
  sm: 'Samoano',
  sr: 'Serbio',
  st: 'Sesotho',
  sn: 'Shona',
  sd: 'Sindhi',
  so: 'Somalí',
  sv: 'Sueco',
  sw: 'Suajili',
  su: 'Sundanés',
  tl: 'Tagalo',
  tg: 'Tayiko',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Tailandés',
  tr: 'Turco',
  uk: 'Ucraniano',
  ur: 'Urdu',
  uz: 'Uzbeko',
  vi: 'Vietnamita',
  xh: 'Xhosa',
  yi: 'Yiddish',
  yo: 'Yoruba',
  zu: 'Zulú'
}

const ALIAS = {
  español: 'es',
  espanol: 'es',
  inglés: 'en',
  ingles: 'en',
  alemán: 'de',
  aleman: 'de',
  árabe: 'ar',
  arabe: 'ar',
  francés: 'fr',
  frances: 'fr',
  portugués: 'pt',
  portugues: 'pt',
  italiano: 'it',
  japonés: 'ja',
  japones: 'ja',
  coreano: 'ko',
  chino: 'zh-cn',
  ruso: 'ru',
  hindi: 'hi',
  turco: 'tr',
  ucraniano: 'uk',
  vietnamita: 'vi',
  tailandés: 'th',
  tailandes: 'th',
  griego: 'el',
  hebreo: 'he',
  polaco: 'pl',
  sueco: 'sv',
  danés: 'da',
  danes: 'da',
  noruego: 'no',
  finlandés: 'fi',
  finlandes: 'fi'
}

export function obtenerCodigoIdioma(idioma = '') {
  const valor = idioma
    .toLowerCase()
    .trim()

  return IDIOMAS[valor]
    ? valor
    : ALIAS[valor] || null
}

export async function traducir(texto, idioma) {
  const codigo = obtenerCodigoIdioma(idioma)

  if (!codigo) {
    throw new Error('IDIOMA_NO_VALIDO')
  }

  const { data } = await axios.get(API, {
    params: {
      text: texto,
      to: codigo
    },
    timeout: 30000
  })

  // Respuesta real de la API:
  //
  // {
  //   creator: "AxelDev09",
  //   status: true,
  //   data: {
  //     original: "Hola",
  //     translated: "Hello",
  //     from: "es",
  //     to: "en",
  //     fromName: "Español",
  //     toName: "English",
  //     source: "google"
  //   }
  // }

  if (
    !data ||
    data.status !== true ||
    !data.data ||
    !data.data.translated
  ) {
    console.log('[TRADUCTOR API ERROR]', data)
    throw new Error('RESPUESTA_INVALIDA')
  }

  return {
    original: data.data.original,
    texto: data.data.translated,
    codigoOrigen: data.data.from,
    codigo: data.data.to,
    idiomaOrigen: data.data.fromName,
    idioma: data.data.toName,
    source: data.data.source
  }
}