import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import './App.css'

// ─── Content ──────────────────────────────────────────────────────────────────

const TICKER = [
  'EXCLUSIVO: Contratos millonarios en Iztapalapa sin licitación detectados por Xpediente Callejero',
  'URGENTE: Comunidades del oriente exigen cuentas por obra pública abandonada desde 2023',
  'ESPECIAL: El mapa de quién gana con los permisos de construcción irregular en CDMX',
  'INVESTIGACIÓN: Redes de nepotismo documentadas en al menos seis delegaciones capitalinas',
]

const NAV = [
  'La Voz de la Banqueta',
  'El Ojo que Todo lo Ve',
  'La Cuenta Pendiente',
  'Negocio de tu Zona',
  'Aprende y Emprende',
  'Anuncia, Vende y Gana',
  'Xpediente del Día',
  'Lo que No te Contaron',
  'Xpediente Abierto',
  'La Calle No Perdona',
  'Irrelevante pero Importante',
]

const HERO = {
  tag: 'Investigación Especial',
  headline: 'La ciudad que nadie documenta: seis meses en las colonias que el poder prefiere no ver',
  sub: 'Más de doscientas fuentes, miles de documentos y un patrón que se repite: el abandono institucional no es accidente, es política deliberada.',
  by: 'Redacción · Xpediente Callejero',
  date: 'Domingo 19 de julio, 2026',
  mins: '18',
}

const FEATURED = [
  {
    tag: 'Política', tagColor: '#8C1515',
    headline: 'El presupuesto que nadie debate: cómo se asignan millones en tres horas de sesión',
    excerpt: 'Documentos internos revelan que las asignaciones de gasto público se deciden horas antes de la sesión oficial, sin debate ni transparencia.',
    by: 'Oswaldo Herrera', mins: '7', img: 'political',
  },
  {
    tag: 'Sociedad', tagColor: '#1B4A9B',
    headline: 'Tres colonias sin mapa: la lucha de vecinos por existir en el registro oficial',
    excerpt: 'Comunidades enteras ausentes del padrón catastral, sin servicios, sin voz. Documentamos doce meses de lucha invisible en el oriente capitalino.',
    by: 'Rosalva De la Mora', mins: '9', img: 'society',
  },
  {
    tag: 'Economía', tagColor: '#1B6B2E',
    headline: 'El PIB que el INEGI no cuenta: mercados informales y el tejido económico real',
    excerpt: 'Más del 40% de la actividad económica en zonas periféricas opera fuera del radar institucional. Cifras y testimonios de primera mano.',
    by: 'Staff Editorial', mins: '5', img: 'economy',
  },
]

const NACIONAL = [
  { headline: 'Reforma electoral y sus implicaciones para la prensa independiente en estados del sur', by: 'Redacción', mins: '4' },
  { headline: 'Tres entidades, un mismo patrón: contratos de salud señalados por organismos civiles', by: 'Staff', mins: '6' },
  { headline: '40 demandas ciudadanas sin respuesta: el silencio oficial medido en días y documentos', by: 'Redacción', mins: '3' },
  { headline: 'Periodismo local bajo presión: agresiones documentadas en el primer semestre de 2026', by: 'Oswaldo Herrera', mins: '8' },
]


const SECCIONES = [
  {
    num: '01', color: '#8C1515',
    img: ['#2A0A0A', '#6B1A1A', '#A03030', '#3A0A0A'],
    name: 'La Voz de la Banqueta',
    desc: 'Entrevistas a vecinos de la zona que nos cuentan sobre los problemas reales de su comunidad.',
  },
  {
    num: '02', color: '#1B4A9B',
    img: ['#050E2A', '#0E2460', '#1A3A9B', '#08183A'],
    name: 'El Ojo que Todo lo Ve',
    desc: 'La mirada del dron reportando baches, inundaciones y todo lo que afecta al municipio desde arriba.',
  },
  {
    num: '03', color: '#7A5E18',
    img: ['#1A1508', '#4A3810', '#8B6A20', '#2A2008'],
    name: 'La Cuenta Pendiente',
    desc: 'Lo que sucede en cada municipio frente a las promesas incumplidas de los partidos políticos.',
  },
  {
    num: '04', color: '#1B6B2E',
    img: ['#081A0E', '#10421A', '#1A7A30', '#0A2814'],
    name: 'Negocio de tu Zona',
    desc: 'Espacio para que los negocios locales se anuncien y conecten directamente con su comunidad.',
  },
  {
    num: '05', color: '#5B1B9B',
    img: ['#100820', '#2A1050', '#4A1E8B', '#180A30'],
    name: 'Aprende y Emprende',
    desc: 'Cursos, talleres y recursos de apoyo a la comunidad para crecer y desarrollarse.',
  },
  {
    num: '06', color: '#9B5B1B',
    img: ['#200E04', '#5A2E08', '#9B5010', '#301808'],
    name: 'Anuncia, Vende y Gana',
    desc: 'Eventos, descuentos, comida de fin de semana y todo lo que quieras ofrecer en tu zona.',
  },
  {
    num: '07', color: '#8C1515',
    img: ['#1A0404', '#580808', '#8C1414', '#280404'],
    name: 'Xpediente del Día',
    desc: 'Lo más importante del día en un solo lugar. Tu resumen esencial de lo que no puedes perderte.',
  },
  {
    num: '08', color: '#1B3A7A',
    img: ['#060A18', '#101E50', '#1A308A', '#080E28'],
    name: 'Lo que No te Contaron',
    desc: 'Te dijeron una cosa y era otra. ¡Aguas! Seguimiento a denuncias ciudadanas.',
  },
  {
    num: '09', color: '#6B1010',
    img: ['#150404', '#400808', '#6B1010', '#200404'],
    name: 'Xpediente Abierto',
    desc: 'Casos profundos de corrupción y abuso con seguimiento continuo. Nada se cierra sin respuesta.',
  },
  {
    num: '10', color: '#9B7B1B',
    img: ['#1E1804', '#5A4808', '#9B7B18', '#2C2404'],
    name: 'La Calle No Perdona',
    desc: 'Momentos absurdos, contenido viral y el análisis chistoso del personaje más honesto del barrio.',
  },
  {
    num: '11', color: '#2B6B3E',
    img: ['#081410', '#104030', '#1E7048', '#0A2018'],
    name: 'Irrelevante pero Importante',
    desc: 'Clima, efemérides, espectáculos, eventos y todo lo que hace único al Estado de México.',
  },
]

const OPINION = [
  {
    initial: 'X',
    title: 'El periodismo callejero como acto de resistencia democrática',
    author: 'Editorial · Xpediente Callejero',
    excerpt: 'Cuando las instituciones callan, la calle documenta. No como alternativa romántica sino como necesidad democrática urgente.',
  },
  {
    initial: 'C',
    title: '¿Por qué la transparencia duele? El poder y su relación con la información',
    author: 'Colaboración especial',
    excerpt: 'La opacidad no es descuido burocrático. Es política deliberada. Y el antídoto no llegará desde arriba.',
  },
]

// ─── Primitives ───────────────────────────────────────────────────────────────

function Rule({ thick }) {
  return <div className={thick ? 'rule rule--thick' : 'rule'} />
}

function Tag({ children, color }) {
  return (
    <span className="tag" style={color ? { color, borderColor: color } : {}}>
      {children}
    </span>
  )
}

const IMG_COLORS = {
  hero:      ['#1E1008', '#4A2810', '#7A4A22', '#2E1A08'],
  political: ['#10101E', '#202048', '#3A3A70', '#181830'],
  society:   ['#101E08', '#203A10', '#387020', '#162A0A'],
  economy:   ['#1A1208', '#3A2A10', '#6A4A20', '#241A08'],
}

function ImgPlaceholder({ variant = 'hero', className = '' }) {
  const [c1, c2, c3, c4] = IMG_COLORS[variant] || IMG_COLORS.economy
  return (
    <div
      className={`img-ph ${className}`}
      style={{ background: `linear-gradient(135deg,${c1} 0%,${c2} 35%,${c3} 70%,${c4} 100%)` }}
      aria-hidden="true"
    >
      <div className="img-grain" />
      <div className="img-vignette" />
    </div>
  )
}

// ─── Masthead ─────────────────────────────────────────────────────────────────

const TITLE = 'Xpediente Callejero'

function Masthead({ dark, onToggle }) {
  return (
    <header className="masthead">
      <div className="masthead-eyebrow">
        <span>Edo Mex · 2026</span>
        <span>Periodismo de Investigación y Participación Ciudadana</span>
        <div className="eyebrow-right">
          <span className="eyebrow-no"><span className="eyebrow-full">Dom. 19 Jul. 2026 · </span>No. 001</span>
          <ThemeBtn dark={dark} onToggle={onToggle} className="theme-wrap--eyebrow" />
        </div>
      </div>
      <Rule thick />
      <div className="masthead-title" aria-label={TITLE}>
        <motion.div
          className="masthead-logo-wrap"
          initial={{ opacity: 0, y: -56 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src="/logo_oficial.png" className="masthead-logo" alt="" aria-hidden="true" />
        </motion.div>
        <div className="masthead-text">
          {TITLE.split('').map((ch, i) => (
            <motion.span
              key={i}
              className={ch === ' ' ? 'mchar mchar--space' : 'mchar'}
              initial={{ opacity: 0, y: -56, rotateX: 90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.19 + i * 0.04, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {ch === ' ' ? '\u00a0' : ch}
            </motion.span>
          ))}
        </div>
      </div>
      <Rule thick />
      <motion.p
        className="masthead-tagline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15, duration: 0.9 }}
      >
        Periodismo local desde el aire
      </motion.p>
      <Rule />
    </header>
  )
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function Ticker() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="ticker" role="marquee" aria-live="off">
      <div className="ticker-badge">Última hora</div>
      <div className="ticker-track">
        <motion.div
          className="ticker-inner"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
        >
          {items.map((t, i) => (
            <span key={i} className="ticker-item">
              {t}<span className="ticker-sep" aria-hidden>◆</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Theme button (presentational) ───────────────────────────────────────────

function ThemeBtn({ dark, onToggle, className = '' }) {
  return (
    <div className={`theme-wrap ${className}`}>
      <span className="theme-label">👆 Estilo visual</span>
      <button
        className="theme-btn"
        onClick={onToggle}
        aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {dark ? '○ Claro' : '● Oscuro'}
      </button>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({ dark, onToggle, active, setActive }) {
  return (
    <motion.nav
      className="sec-nav"
      aria-label="Secciones"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.3, duration: 0.5 }}
    >
      {NAV.map(s => (
        <button
          key={s}
          className={`nav-btn${active === s ? ' nav-btn--on' : ''}`}
          onClick={() => setActive(s)}
          aria-current={active === s ? 'page' : undefined}
        >
          {s}
          {active === s && (
            <motion.span className="nav-rail" layoutId="nav-rail" />
          )}
        </button>
      ))}
      <ThemeBtn dark={dark} onToggle={onToggle} className="theme-wrap--nav" />
    </motion.nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.65, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hero-media">
        <ImgPlaceholder variant="hero" className="hero-img" />
        <p className="hero-caption">CDMX, julio 2026 — Documentación en campo</p>
      </div>
      <div className="hero-body">
        <Tag>{HERO.tag}</Tag>
        <h1 className="hero-hl">{HERO.headline}</h1>
        <Rule />
        <p className="hero-sub">{HERO.sub}</p>
        <div className="hero-meta">
          <span>{HERO.by}</span>
          <span aria-hidden className="sep">·</span>
          <span>{HERO.date}</span>
          <span aria-hidden className="sep">·</span>
          <span>{HERO.mins} min</span>
        </div>
        <button className="read-btn">Leer expediente completo →</button>
      </div>
    </motion.section>
  )
}

// ─── Featured grid ────────────────────────────────────────────────────────────

function Card({ s, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.article
      ref={ref}
      className="card"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <ImgPlaceholder variant={s.img} className="card-img" />
      <Tag color={s.tagColor}>{s.tag}</Tag>
      <h3 className="card-hl">{s.headline}</h3>
      <p className="card-ex">{s.excerpt}</p>
      <div className="card-meta">
        <span>{s.by}</span>
        <span>{s.mins} min de lectura</span>
      </div>
    </motion.article>
  )
}


// ─── Active section panel ────────────────────────────────────────────────────

function ActiveSection({ sec }) {
  const [c1, c2, c3, c4] = sec.img
  return (
    <motion.section
      key={sec.num}
      className="active-sec"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="active-sec-inner">
        <div className="active-sec-img-wrap">
          <div
            className="img-ph active-sec-img"
            style={{ background: `linear-gradient(135deg,${c1} 0%,${c2} 35%,${c3} 70%,${c4} 100%)` }}
            aria-hidden="true"
          >
            <div className="img-grain" />
            <div className="img-vignette" />
          </div>
        </div>
        <div className="active-sec-body">
          <Tag color={sec.color}>Sección {sec.num}</Tag>
          <h2 className="active-sec-title" style={{ color: sec.color }}>{sec.name}</h2>
          <p className="active-sec-desc">
            {sec.desc}{' '}
            <span className="active-sec-tematica">(Temática a desarrollar en la sección)</span>
          </p>
          <Rule />
          <p className="active-sec-soon">Contenido próximamente · Xpediente Callejero · EdoMex</p>
        </div>
      </div>
    </motion.section>
  )
}

// ─── Secciones grid ──────────────────────────────────────────────────────────

function SeccionCard({ s, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [c1, c2, c3, c4] = s.img
  return (
    <motion.article
      ref={ref}
      className="card"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: (index % 3) * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div
        className="img-ph card-img"
        style={{ background: `linear-gradient(135deg,${c1} 0%,${c2} 35%,${c3} 70%,${c4} 100%)` }}
        aria-hidden="true"
      >
        <div className="img-grain" />
        <div className="img-vignette" />
      </div>
      <Tag color={s.color}>Sección {s.num}</Tag>
      <h3 className="card-hl seccion-name" style={{ color: s.color }}>{s.name}</h3>
      <p className="card-ex">{s.desc}</p>
      <div className="card-meta">
        <span>Sección {s.num}</span>
        <span>Xpediente Callejero</span>
      </div>
    </motion.article>
  )
}

function SeccionesGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <section className="secciones-sec">
      <div ref={ref} className="sec-head">
        <Rule thick />
        <div className="sec-head-row">
          <motion.h2
            className="sec-title"
            initial={{ opacity: 0, x: -18 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Nuestras Secciones
          </motion.h2>
          <motion.span
            className="sec-more"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            Xpediente Callejero · EdoMex
          </motion.span>
        </div>
        <Rule />
      </div>
      <div className="featured-grid secciones-grid">
        {SECCIONES.map((s, i) => (
          <SeccionCard key={s.num} s={s} index={i} />
        ))}
      </div>
    </section>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SecHead({ title }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <div ref={ref} className="sec-head">
      <Rule thick />
      <div className="sec-head-row">
        <motion.h2
          className="sec-title"
          initial={{ opacity: 0, x: -18 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>
        <motion.a
          href="#"
          className="sec-more"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          Ver todos →
        </motion.a>
      </div>
      <Rule />
    </div>
  )
}

// ─── Pull quote ───────────────────────────────────────────────────────────────

function PullQuote() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.blockquote
      ref={ref}
      className="pull"
      initial={{ opacity: 0, scaleY: 0.88 }}
      animate={inView ? { opacity: 1, scaleY: 1 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="pull-mark" aria-hidden>"</span>
      <p>Cuando las instituciones fallan en documentar, la calle asume esa responsabilidad. No como sustituto, sino como evidencia.</p>
      <cite>— Manifiesto editorial · Xpediente Callejero</cite>
    </motion.blockquote>
  )
}

// ─── Nacional list ────────────────────────────────────────────────────────────

function ListItem({ story, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      className="list-item"
      initial={{ opacity: 0, x: -22 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.09, duration: 0.5 }}
      whileHover={{ x: 7, transition: { duration: 0.18 } }}
    >
      <span className="list-num" aria-hidden>{String(index + 1).padStart(2, '0')}</span>
      <div>
        <h4 className="list-hl">{story.headline}</h4>
        <span className="list-meta">{story.by} · {story.mins} min</span>
      </div>
    </motion.div>
  )
}

// ─── Opinion ──────────────────────────────────────────────────────────────────

function OpCard({ item, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      className="op-card"
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.14, duration: 0.6 }}
    >
      <div className="op-avatar" aria-hidden>{item.initial}</div>
      <div className="op-body">
        <span className="op-label">Opinión</span>
        <h4 className="op-title">{item.title}</h4>
        <p className="op-ex">{item.excerpt}</p>
        <span className="op-by">— {item.author}</span>
      </div>
    </motion.div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="footer">
      <Rule thick />
      <div className="footer-grid">
        <div>
          <div className="footer-brand">Xpediente Callejero</div>
          <p className="footer-desc">Periodismo de investigación y participación ciudadana desde la Ciudad de México.</p>
          <p className="footer-dossier">DOSSIER · XC-2026 · CDMX · Edición Digital</p>
        </div>
        <div>
          <p className="footer-heading">Secciones</p>
          <ul className="footer-list">
            {NAV.map(s => <li key={s}><a href="#" className="footer-link">{s}</a></li>)}
          </ul>
        </div>
        <div>
          <p className="footer-heading">Contacto</p>
          <ul className="footer-list">
            <li><a href="mailto:oswaldo@xpedientecallejero.com" className="footer-link">oswaldo@xpedientecallejero.com</a></li>
            <li><a href="https://www.xpedientecallejero.com" className="footer-link">www.xpedientecallejero.com</a></li>
            <li><span className="footer-link">@xpediente.callejero</span></li>
          </ul>
        </div>
        <div>
          <p className="footer-heading">Red Social</p>
          <ul className="footer-list">
            {['Instagram', 'TikTok', 'YouTube', 'X', 'Facebook'].map(s => (
              <li key={s}><a href="#" className="footer-link">{s}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <Rule />
      <p className="footer-copy">© 2026 Xpediente Callejero — Un proyecto de periodismo de investigación y participación ciudadana · Todos los derechos reservados</p>
    </footer>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('xc-theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [activeNav, setActiveNav] = useState(NAV[0])

  useEffect(() => {
    const theme = dark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('xc-theme', theme)
  }, [dark])

  const toggleDark = () => setDark(d => !d)
  const activeSec = SECCIONES.find(s => s.name === activeNav)

  return (
    <div className="newspaper">
      <Masthead dark={dark} onToggle={toggleDark} />
      <Ticker />
      <Nav dark={dark} onToggle={toggleDark} active={activeNav} setActive={setActiveNav} />
      <main>
        <Hero />
        <div className="divider" />
        {activeSec && <ActiveSection sec={activeSec} />}
        <PullQuote />
        <section className="nac-sec">
          <SecHead title="Nacional" />
          <div className="list-stories">
            {NACIONAL.map((s, i) => <ListItem key={i} story={s} index={i} />)}
          </div>
        </section>
        <section className="op-sec">
          <SecHead title="Opinión" />
          <div className="op-grid">
            {OPINION.map((item, i) => <OpCard key={i} item={item} index={i} />)}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
