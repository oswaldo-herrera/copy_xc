// ─── Contenido real (notas publicadas) ────────────────────────────────────────

export const SECCIONES = [
  {
    num: '01', who: 'donaPelos', reporter: 'lizzet', folio: 'XC-EDOMEX-2026-07-001', cat: 'Comunidad', status: 'Publicado',
    municipio: 'Estado de México', date: '19 jul 2026',
    imgSrc: '/la_voz_banqueta.png',
    video: '/lizzete_video.mp4',
    tagline: 'Periodismo local: desde el aire lo vemos, pero al ras de calle lo entendemos.',
    name: 'La Voz de la Banqueta',
    desc: 'Entrevistas a personas de la zona contándonos sobre problemas de su comunidad.',
    title: 'Árboles sin podar en Atizapán',
    intro: 'Xpediente Callejero… te cuenta cómo gracias al haber levantado la voz, hoy disfrutan de una reubicación favorable de puestos ambulantes… y sale el audio original del chavo que habla.',
    link: 'https://www.facebook.com/share/r/193WCeu5KY/?mibextid=wwXIfr',
  },
  {
    num: '02', who: 'misteriozo', folio: 'XC-ATIZAPAN-2026-07-002', cat: 'Evidencia aérea', status: 'En seguimiento',
    municipio: 'Atizapán de Zaragoza', date: '18 jul 2026',
    imgSrc: '/nota_ojo_02.png',
    name: 'El Ojo que Todo lo Ve',
    desc: 'La mirada del dron reportando baches, inundaciones y todo lo que afecta al municipio desde arriba.',
    title: 'Recorrido aéreo por San Miguel Xochimanga',
    intro: 'Xpediente Callejero hizo un recorrido por San Miguel Xochimanga en Atizapán de Zaragoza… y sale el audio original de Crystal.',
    link: 'https://www.facebook.com/share/v/18z3bNH844/?mibextid=wwXIfr',
  },
  {
    num: '03', who: 'elPoli', folio: 'XC-TLALNEPANTLA-2026-07-003', cat: 'Denuncia', status: 'En investigación',
    municipio: 'Tlalnepantla de Baz', date: '17 jul 2026',
    imgSrc: '/la_cuenta_pendiente.png',
    name: 'La Cuenta Pendiente',
    desc: 'Lo que te prometieron vs lo que te cumplieron.',
    title: 'Vecinos de Lomas Boulevares exigen cuentas al presidente municipal',
    intro: 'Xpediente Callejero… vecinos de la Colonia Lomas Boulevares en Tlalnepantla de Baz denuncian al PM Raciel Pérez Cruz… y sale el audio original de la chava que habla.',
    link: 'https://www.facebook.com/share/v/1GzFd2yEoS/?mibextid=wwXIfr',
  },
  {
    num: '04', who: 'pancracio', folio: 'XC-HUIXQUILUCAN-2026-07-004', cat: 'Comercio local', status: 'Publicado',
    municipio: 'Huixquilucan', date: '16 jul 2026',
    imgSrc: '/negocio_de_tu_zona.png',
    name: 'Negocio de tu Zona',
    desc: 'Aquí se pueden anunciar los negocios de tu zona.',
    title: 'Mercado Municipal de Huixquilucan: servicios y productos',
    intro: 'Xpediente Callejero… visita el Mercado Municipal de Huixquilucan para que conozcas opciones de servicios y productos que puedes disfrutar… y sale el audio original del chavo que habla.',
    link: 'https://www.facebook.com/share/v/1Db3n4wtkn/?mibextid=wwXIfr',
  },
  {
    num: '05', who: 'dulceVictoria', folio: 'XC-EDOMEX-2026-07-005', cat: 'Cultura', status: 'Publicado',
    municipio: 'Estado de México', date: '15 jul 2026',
    imgSrc: '/aprende_y_emprende.png',
    name: 'Aprende y Emprende',
    desc: 'Para los mexiquenses amantes de la danza.',
    title: 'Festival Internacional de la Danza, del 13 al 16 de agosto',
    intro: 'Xpediente Callejero… te invita a disfrutar el próximo Festival Internacional de la Danza del 13 al 16 de agosto… y sale el audio original del chavo que habla.',
    link: 'https://www.facebook.com/share/v/19akfx4iFv/?mibextid=wwXIfr',
  },
  {
    num: '06', who: 'laMari', folio: 'XC-HUIXQUILUCAN-2026-07-006', cat: 'Comercio local', status: 'Publicado',
    municipio: 'Huixquilucan', date: '14 jul 2026',
    imgSrc: '/anuncia_vende.png',
    name: 'Anuncia, Vende y Gana',
    desc: 'Eventos, descuentos, comida de fin de semana y todo lo que quieras ofrecer en tu zona.',
    title: 'Restaurante La Cabaña en Dos Ríos, Huixquilucan',
    intro: 'Xpediente Callejero… Visita el Restaurante La Cabaña ubicado en Av. Vicente Guerrero en Dos Ríos Huixquilucan EDOMEX… y sale el audio original de la chava que habla.',
    link: 'https://www.facebook.com/share/v/19NPbxxx9S/?mibextid=wwXIfr',
  },
  {
    num: '07', who: 'rolando', folio: 'XC-NAUCALPAN-2026-07-007', cat: 'Obra pública', status: 'En seguimiento',
    municipio: 'Naucalpan de Juárez', date: '13 jul 2026',
    imgSrc: '/xpediente_del_dia.png',
    name: 'Xpediente del Día',
    desc: 'Lo más importante del día.',
    title: 'Mejoramiento de la Av. Jardines de San Mateo',
    intro: 'Xpediente Callejero… informa el mejoramiento de la Av. Jardines de San Mateo que fue visitada por la Gobernadora de EDOMEX, Delfina Gómez Álvarez… y sale el audio original.',
    link: 'https://www.facebook.com/share/r/1DUnFgMPpU/?mibextid=wwXIfr',
  },
  {
    num: '08', who: 'chicharo', folio: 'XC-NAUCALPAN-2026-07-008', cat: 'Denuncia', status: 'En seguimiento',
    municipio: 'Naucalpan de Juárez', date: '12 jul 2026',
    imgSrc: '/nota_no_contaron.png',
    name: 'Lo que No te Contaron',
    desc: 'Te dijeron una cosa y era otra. ¡Aguas! Seguimiento a denuncias ciudadanas.',
    title: 'Habitantes de la Zona Azul de Cd. Satélite alzan la voz',
    intro: 'Xpediente Callejero... habitantes de la Zona Azul de Cd. Satélite en Naucalpan de Juárez de EDOMEX… y sale el audio original de la chava que habla.',
    link: 'https://www.facebook.com/share/r/1E9aULKFuA/?mibextid=wwXIfr',
  },
  {
    num: '09', who: 'yakazi', folio: 'XC-EDOMEX-2026-07-009', cat: 'Denuncia', status: 'En investigación',
    municipio: 'Estado de México', date: '11 jul 2026',
    imgSrc: '/xpediente_abierto.png',
    name: 'Xpediente Abierto',
    desc: 'Casos más profundos de corrupción y abuso.',
    title: 'Historias de autoridades locales bajo la lupa',
    intro: 'Xpediente Callejero… nos cuentan las historias de las autoridades locales y XC las investiga… y sale el audio original del chavo que habla (avatar).',
    link: 'https://www.facebook.com/share/v/1Dk7jR8VUS/?mibextid=wwXIfr',
  },
  {
    num: '10', who: 'betoBarrigol', folio: 'XC-TOLUCA-2026-07-010', cat: 'Viral', status: 'Publicado',
    municipio: 'Toluca', date: '10 jul 2026',
    imgSrc: '/la_calle_no_perdona.png',
    name: 'La Calle No Perdona',
    desc: 'Humor callejero y momentos absurdos #virales.',
    title: 'Fútbol en el Valle de Toluca para despedir el Mundial 2026',
    intro: 'Xpediente Callejero… captó en una zona del Valle de Toluca a chavos disfrutando del fútbol despidiendo el Mundial 2026… y sale el audio original.',
    link: 'https://www.facebook.com/share/v/1HmaNRJFZC/?mibextid=wwXIfr',
  },
  {
    num: '11', who: 'elVrayan', folio: 'XC-NICOLASROMERO-2026-07-011', cat: 'Cultura', status: 'Publicado',
    municipio: 'Nicolás Romero', date: '09 jul 2026',
    imgSrc: '/irrelevante_pero_importante.png',
    name: 'Irrelevante pero Importante',
    desc: 'Un día como hoy — curiosidades en EDOMEX.',
    title: 'Efemérides de Nicolás Romero',
    intro: 'Xpediente Callejero… te cuenta las efemérides en Nicolás Romero… y sale el audio original del chavo que habla.',
    link: 'https://www.facebook.com/share/v/1Bdpw6s6Mk/?mibextid=wwXIfr',
  },
]

export const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')


export const CATEGORIAS = ['Todos', ...new Set(SECCIONES.map(s => s.cat))]

export const TICKER = SECCIONES.map(s => `${s.municipio.toUpperCase()}: ${s.title}`)

// ─── Cifras del tablero ───────────────────────────────────────────────────────
// IMPORTANTE: cifras ILUSTRATIVAS de diseño. Sustituir por datos verificados
// antes de publicar.

export const KPIS = [
  { icon: 'folder', label: 'Expedientes abiertos', value: 1284, delta: '+12%', note: 'Casos en investigación' },
  { icon: 'target', label: 'En seguimiento', value: 892, delta: '+8%', note: 'Con actividad reciente' },
  { icon: 'check', label: 'Cerrados', value: 431, delta: '+21%', note: 'Con respuesta o resolución' },
  { icon: 'doc', label: 'Respuestas oficiales', value: 276, delta: '+34%', note: 'Oficios y comunicados' },
  { icon: 'pin', label: 'Municipios activos', value: 125, suffix: ' / 125', delta: '100%', note: 'Estado de México' },
]

export const MUNICIPIOS = [
  { name: 'Ecatepec', lon: -99.050, lat: 19.601, total: 312, mes: 41 },
  { name: 'Naucalpan', lon: -99.239, lat: 19.478, total: 214, mes: 33 },
  { name: 'Tlalnepantla', lon: -99.195, lat: 19.540, total: 176, mes: 29 },
  { name: 'Nezahualcóyotl', lon: -99.015, lat: 19.400, total: 168, mes: 22 },
  { name: 'Cuautitlán Izcalli', lon: -99.215, lat: 19.646, total: 142, mes: 18 },
  { name: 'Atizapán de Zaragoza', lon: -99.255, lat: 19.559, total: 138, mes: 24 },
  { name: 'Toluca', lon: -99.657, lat: 19.292, total: 131, mes: 15 },
  { name: 'Tultitlán', lon: -99.169, lat: 19.645, total: 129, mes: 12 },
  { name: 'Chimalhuacán', lon: -98.950, lat: 19.421, total: 121, mes: 14 },
  { name: 'Nicolás Romero', lon: -99.313, lat: 19.635, total: 118, mes: 16 },
  { name: 'Huixquilucan', lon: -99.350, lat: 19.360, total: 102, mes: 19 },
  { name: 'Coacalco', lon: -99.107, lat: 19.629, total: 97, mes: 9 },
  { name: 'Ixtapaluca', lon: -98.882, lat: 19.318, total: 88, mes: 11 },
  { name: 'Tecámac', lon: -98.968, lat: 19.713, total: 81, mes: 8 },
  { name: 'Valle de Chalco', lon: -98.939, lat: 19.290, total: 74, mes: 10 },
  { name: 'Metepec', lon: -99.604, lat: 19.251, total: 62, mes: 7 },
  { name: 'Chalco', lon: -98.897, lat: 19.263, total: 58, mes: 6 },
  { name: 'Texcoco', lon: -98.882, lat: 19.511, total: 46, mes: 5 },
  { name: 'Zumpango', lon: -99.099, lat: 19.797, total: 39, mes: 4 },
  { name: 'Tenancingo', lon: -99.590, lat: 18.960, total: 22, mes: 2 },
  { name: 'Valle de Bravo', lon: -100.130, lat: 19.195, total: 18, mes: 3 },
  { name: 'Atlacomulco', lon: -99.877, lat: 19.799, total: 21, mes: 2 },
]

// Peso relativo de cada categoría para el filtro del mapa
export const MAP_FILTERS = [
  { id: 'todas', label: 'Todas', icon: 'layers' },
  { id: 'seguridad', label: 'Seguridad', icon: 'shield', seed: 1 },
  { id: 'corrupcion', label: 'Corrupción', icon: 'coin', seed: 2 },
  { id: 'servicios', label: 'Servicios', icon: 'drop', seed: 3 },
  { id: 'obra', label: 'Obra pública', icon: 'crane', seed: 4 },
]

export const INCIDENTES = [
  { label: 'Seguridad', value: 38, color: '#E5484D' },
  { label: 'Servicios públicos', value: 22, color: '#3584E0' },
  { label: 'Corrupción', value: 14, color: '#B88700' },
  { label: 'Desarrollo urbano', value: 10, color: '#9C68F2' },
  { label: 'Medio ambiente', value: 8, color: '#1F9C5B' },
  { label: 'Otros', value: 8, color: '#6B6B6B' },
]

export const TENDENCIA = [
  { m: 'Nov', v: 62 }, { m: 'Dic', v: 74 }, { m: 'Ene', v: 81 }, { m: 'Feb', v: 79 },
  { m: 'Mar', v: 96 }, { m: 'Abr', v: 104 }, { m: 'May', v: 112 }, { m: 'Jun', v: 128 },
  { m: 'Jul', v: 141 }, { m: 'Ago', v: 156 }, { m: 'Sep', v: 171 }, { m: 'Oct', v: 186 },
]

export const ESTATUS = [
  { label: 'Abiertos', value: 732, icon: 'folder', tone: 'red' },
  { label: 'En investigación', value: 891, icon: 'search', tone: 'yellow' },
  { label: 'Cerrados', value: 219, icon: 'check', tone: 'green' },
]

// Personajes de Xpediente Callejero (imágenes en /public)
export const PERSONAJES = {
  // host: presentador principal; tiene página pero no tarjeta en la cuadrícula de 12
  // pos: encuadre de la imagen cuando no es retrato
  narizio: { name: 'Narizio Olfario', segmento: 'Presentador principal', img: '/personajes/NARIZIO.png', host: true },
  lizzet: { name: 'Lizzet Arriaga', segmento: 'Periodismo local', img: '/lizzet_arriaga.jpg', pos: '54% top', host: true, kicker: 'Reportera' },
  rolando: { name: 'El Rol Ando', segmento: 'Dando el rol', img: '/personajes/EL%20ROL%20ANDO.png' },
  donaPelos: { name: 'Doña Pelos', segmento: 'La voz de la banqueta', img: '/personajes/DO%C3%91A%20PELOS.png' },
  chicharo: { name: '«El Chícharo»', segmento: 'Lo que no te contaron', img: '/personajes/EL%20CH%C3%8DCHARO.png' },
  pancracio: { name: 'Pancracio', segmento: 'Con las manos en la masa', img: '/personajes/PANCRACIO%20MIGAJON.png' },
  laMari: { name: 'La Mari', segmento: 'Sobre la mesa', img: '/personajes/LA%20MARI.png' },
  misteriozo: { name: 'Mister Iozo', segmento: 'El ojo que todo lo ve', img: '/personajes/MISTER%20IOZO.png' },
  elPoli: { name: 'El Poli', segmento: 'La cuenta pendiente', img: '/personajes/EL%20POLI.png' },
  elVrayan: { name: 'El Vrayan', segmento: 'Chécatesta', img: '/personajes/EL%20VRAYAN.png' },
  yakazi: { name: 'Yakazi', segmento: 'Ya merito', img: '/personajes/YAKAZI.png' },
  veranito: { name: 'Vera Nito', segmento: 'Clima', img: '/personajes/VERA%20NITA.png' },
  betoBarrigol: { name: 'Beto Barrigol', segmento: 'Deportes', img: '/personajes/BETO%20BARRIGOL.png' },
  dulceVictoria: { name: 'Dulce Victoria', segmento: 'Deportes', img: '/personajes/DULCE%20VICTORIA.png' },
}

export const ALERTAS = [
  { who: 'rolando', time: '18:24', municipio: 'Ecatepec', text: 'Vecinos reportan toma clandestina en zona industrial', level: 'alta' },
  { who: 'donaPelos', time: '16:17', municipio: 'Naucalpan', text: 'Denuncian obra detenida en desarrollo urbano', level: 'alta' },
  { who: 'chicharo', time: '14:03', municipio: 'Tultitlán', text: 'Reportan quema de residuos en predio baldío', level: 'media' },
  { who: 'pancracio', time: '11:46', municipio: 'Cuautitlán Izcalli', text: 'Nuevas denuncias por fugas de agua sin atender', level: 'media' },
  { who: 'misteriozo', time: '09:32', municipio: 'Tlalnepantla', text: 'Usuarios señalan transporte público irregular', level: 'baja' },
  { who: 'veranito', time: '08:15', municipio: 'Toluca', text: 'Alerta por lluvias fuertes en el Valle de Toluca', level: 'media' },
]

export const MUNICIPIOS_DENUNCIA = [
  ...new Set([...MUNICIPIOS.map(m => m.name), 'Otro municipio']),
]

// Número de WhatsApp que recibe las denuncias, con lada de país (ej. '5215512345678').
// Vacío: WhatsApp abre el mensaje listo y el usuario elige a quién enviarlo.
export const WHATSAPP_NUMBER = ''

// Video del teaser de entrada ("Próximamente"). Pega aquí el "Copiar link" del
// admin (Supabase). Vacío = no se muestra la intro.
export const TEASER_VIDEO = ''
// export const TEASER_VIDEO = 'https://xysarosunlwjxhspfiql.supabase.co/storage/v1/object/public/videos/2026/10/02a90e14-b512-4930-b2c0-c0eef4b5fcf2-yakazi-caption.mp4'

// En local (npm run dev) aparece la X para cerrarlo y entrar al sitio;
// en producción (Vercel) no se puede cerrar y el sitio queda oculto detrás.
// Sin X en ningún lado: false · con X en todos lados: true
export const TEASER_CLOSABLE = import.meta.env.DEV

// Cada personaje tiene su página: /personaje/<slug>
Object.entries(PERSONAJES).forEach(([key, p]) => {
  p.key = key
  p.slug = slugify(p.name)
  p.seccion = SECCIONES.find(s => s.who === key || s.reporter === key) || null
})
