import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import {
  SECCIONES, TICKER, KPIS, MUNICIPIOS, INCIDENTES, TENDENCIA, ESTATUS,
  ALERTAS, PERSONAJES, MUNICIPIOS_DENUNCIA, WHATSAPP_NUMBER, TEASER_VIDEO, TEASER_CLOSABLE,
} from './data'
import { Btn, Icon, Panel, PanelHead, Tabs, Counter, StatusBadge } from './components/ui'
import { RankBars, Donut, TrendLine } from './components/Charts'
import HeatMap from './components/HeatMap'
import { supabase, supabaseReady } from './lib/supabase'
import TeaserIntro from './components/TeaserIntro'

const NAV = [
  { id: 'inicio', label: 'Inicio', icon: 'home' },
  { id: 'expedientes', label: 'Secciones', icon: 'folder' },
  { id: 'mapa', label: 'Mapa de calor', icon: 'map' },
  { id: 'datos', label: 'Datos', icon: 'chart' },
  { id: 'evidencia', label: 'Evidencia aérea', icon: 'drone' },
  { id: 'denuncia', label: 'Denuncia Ciudadana', icon: 'megaphone' },
  { id: 'nosotros', label: 'Nosotros', icon: 'users' },
]

const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// ─── Reloj en vivo (hora del centro de México) ───────────────────────────────

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const tz = 'America/Mexico_City'
  return {
    time: now.toLocaleTimeString('es-MX', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    date: now.toLocaleDateString('es-MX', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
  }
}

// ─── Sección activa al hacer scroll ──────────────────────────────────────────

function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-35% 0px -60% 0px' },
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [ids])
  return active
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ active, open, onClose }) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
        <div className="side-brand">
          <span className="stamp stamp--side" role="img" aria-label="Xpediente Callejero" />
          <button className="side-close" onClick={onClose} aria-label="Cerrar menú">
            <Icon name="close" />
          </button>
        </div>
        <nav className="side-nav" aria-label="Secciones">
          {NAV.map(n => (
            <motion.button
              key={n.id}
              className={`side-link${active === n.id ? ' side-link--on' : ''}`}
              onClick={() => { scrollTo(n.id); onClose() }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.96 }}
            >
              {active === n.id && (
                <motion.span className="side-pill" layoutId="side-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
              )}
              <Icon name={n.icon} size={18} />
              <span>{n.label}</span>
            </motion.button>
          ))}
        </nav>
        <Btn variant="outline" icon="megaphone" block onClick={() => { scrollTo('denuncia'); onClose() }}>
          Denuncia ciudadana
        </Btn>
        <p className="side-quote">La información<br />también <em>es poder.</em></p>
      </aside>
    </>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header({ query, setQuery, onMenu }) {
  const { time, date } = useClock()
  return (
    <header className="header" id="inicio">
      <div className="header-bg" aria-hidden />
      <button className="menu-btn" onClick={onMenu} aria-label="Abrir menú"><Icon name="menu" size={22} /></button>

      <div className="brand">
        <motion.img
          className="brand-logo"
          src="/logos/LOGO%20SOBRE%20OSCUROS.png"
          alt="Xpediente Callejero"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="header-tools">
        <label className="search">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Buscar municipio, expediente, sección…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && scrollTo('expedientes')}
          />
        </label>
        <div className="clock">
          <span className="clock-date">{date}</span>
          <span className="clock-time">{time}</span>
          <span className="clock-tz">Edo. Méx. (GMT-6)</span>
        </div>
        <Btn variant="primary" icon="megaphone" onClick={() => scrollTo('denuncia')}>Denuncia aquí</Btn>
      </div>
    </header>
  )
}

// ─── Ticker ──────────────────────────────────────────────────────────────────

function Ticker() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="ticker" role="marquee" aria-live="off">
      <div className="ticker-badge"><span className="live-dot" />Última hora</div>
      <div className="ticker-track">
        <motion.div
          className="ticker-inner"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        >
          {items.map((t, i) => (
            <span key={i} className="ticker-item">{t}<span className="ticker-sep" aria-hidden>◆</span></span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

function Kpis() {
  return (
    <div className="kpis">
      {KPIS.map((k, i) => (
        <motion.div
          key={k.label}
          className="kpi"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }}
          whileHover={{ y: -4 }}
        >
          <span className="kpi-ico"><Icon name={k.icon} size={26} stroke={1.6} /></span>
          <div>
            <p className="kpi-label">{k.label}</p>
            <p className="kpi-value">
              <Counter value={k.value} />{k.suffix}
              <span className="kpi-delta">▲ {k.delta}</span>
            </p>
            <p className="kpi-note">{k.note}</p>
          </div>
        </motion.div>
      ))}
      <motion.div
        className="kpi kpi--alert"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="kpi-alert-top">
          <Icon name="megaphone" size={30} stroke={1.6} />
          <div>
            <p className="kpi-label">Denuncias ciudadanas este mes</p>
            <p className="kpi-value"><Counter value={342} /><span className="kpi-delta">▲ 18%</span></p>
          </div>
        </div>
        <Btn variant="danger" size="sm" iconRight="arrow" block onClick={() => scrollTo('denuncia')}>
          Denunciar ahora
        </Btn>
      </motion.div>
    </div>
  )
}

// ─── Mapa + ranking ──────────────────────────────────────────────────────────

function MapRow() {
  const [mode, setMode] = useState('total')
  const rows = useMemo(
    () => [...MUNICIPIOS].sort((a, b) => b[mode] - a[mode]).slice(0, 10),
    [mode],
  )
  return (
    <div className="row row--map">
      <Panel id="mapa" className="panel--map">
        <PanelHead icon="map" title="Mapa de calor" sub="Intensidad de incidentes y expedientes · Estado de México">
          <span className="chip-live"><span className="live-dot" />Actualizado</span>
        </PanelHead>
        <HeatMap />
      </Panel>
      <Panel className="panel--rank" delay={0.1}>
        <PanelHead icon="chart" title="Ranking de municipios" sub="Por número de expedientes" />
        <Tabs
          id="rank"
          items={[{ id: 'total', label: 'Total' }, { id: 'mes', label: 'Último mes' }]}
          value={mode}
          onChange={setMode}
        />
        <RankBars rows={rows} valueKey={mode} />
      </Panel>
    </div>
  )
}

// ─── Datos ───────────────────────────────────────────────────────────────────

function DataRow() {
  const total = ESTATUS.reduce((a, s) => a + s.value, 0)
  return (
    <div className="row row--data" id="datos">
      <Panel>
        <PanelHead icon="layers" title="Tipo de incidentes" sub="En expedientes abiertos" />
        <Donut data={INCIDENTES} total={1284} label="expedientes" />
      </Panel>
      <Panel delay={0.08}>
        <PanelHead icon="chart" title="Tendencia de Denuncia Ciudadana" sub="Últimos 12 meses">
          <span className="big-delta">+62%</span>
        </PanelHead>
        <TrendLine data={TENDENCIA} />
      </Panel>
      <Panel delay={0.16}>
        <PanelHead icon="folder" title="Estatus" sub={`Total: ${total.toLocaleString('es-MX')}`} />
        <div className="status-list">
          {ESTATUS.map(s => (
            <div key={s.label} className={`status status--${s.tone}`}>
              <span className="status-ico"><Icon name={s.icon} size={22} /></span>
              <div>
                <p className="status-val"><Counter value={s.value} /></p>
                <p className="status-label">{s.label} · {((s.value / total) * 100).toFixed(1)}%</p>
              </div>
              <motion.span
                className="status-bar"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: s.value / total }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

// ─── Destacado + alertas ─────────────────────────────────────────────────────

// Últimas noticias publicadas (admin → Noticias). Sin noticias: alertas de ejemplo.
function useAlertas() {
  const [items, setItems] = useState(ALERTAS)
  useEffect(() => {
    if (!supabaseReady) return
    supabase
      .from('noticias')
      .select('*') // incluye "nivel" si ya se corrió 04_noticias_portada.sql
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        const rows = (data || []).filter(n => PERSONAJES[n.personaje])
        if (!rows.length) return
        const today = new Date().toDateString()
        setItems(rows.map((n, i) => {
          const d = new Date(n.published_at)
          return {
            id: n.id,
            who: n.personaje,
            time: d.toDateString() === today
              ? d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
              : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
            municipio: n.municipio || 'Edomex',
            text: n.title,
            level: n.nivel || (i < 2 ? 'alta' : i < 4 ? 'media' : 'baja'),
          }
        }))
      })
  }, [])
  return items
}

// Noticia marcada como destacada en el admin; sin ninguna, se queda la imagen de Narizio.
function useDestacada() {
  const [nota, setNota] = useState(null)
  useEffect(() => {
    if (!supabaseReady) return
    supabase
      .from('noticias')
      .select('*')
      .eq('published', true)
      .eq('destacada', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const n = data?.[0]
        if (n && PERSONAJES[n.personaje] && (n.video_url || n.cover_url)) setNota(n)
      })
  }, [])
  return nota
}

function FeaturedRow() {
  const navigate = useNavigate()
  const alertas = useAlertas()
  const destacada = useDestacada()
  const dp = destacada && PERSONAJES[destacada.personaje]
  const playable = /\.(mp4|webm|mov)(\?|$)/i.test(destacada?.video_url || '')

  // Abre la página del personaje con la noticia ya abierta en su pop-up
  const openAlert = a => {
    const slug = PERSONAJES[a.who].slug
    if (a.id) navigate(`/personaje/${slug}?nota=${a.id}`)
    else navigate(`/personaje/${slug}`, {
      state: { nota: { id: `alerta-${a.time}`, title: a.text, municipio: a.municipio, dateLabel: `Hoy · ${a.time}` } },
    })
  }
  return (
    <div className="row row--featured">
      <Panel className="panel--featured">
        <PanelHead icon="play" title="Narizio Olfario" sub={dp ? `${dp.name} · ${destacada.title}` : 'Presentador principal'}>
          <Btn as="a" variant="ghost" size="sm" iconRight="arrow" href={`/personaje/${PERSONAJES.narizio.slug}`}
            onClick={e => { e.preventDefault(); navigate(`/personaje/${PERSONAJES.narizio.slug}`) }}>
            Ver todos
          </Btn>
        </PanelHead>
        {destacada && playable ? (
          <div className="feature feature--video">
            <video src={destacada.video_url} poster={destacada.cover_url || undefined} controls playsInline preload="metadata" />
          </div>
        ) : destacada ? (
          <button className="feature" onClick={() => navigate(`/personaje/${dp.slug}?nota=${destacada.id}`)} aria-label={`Ver: ${destacada.title}`}>
            <img src={destacada.cover_url || dp.img} alt="" />
            <span className="feature-shade" />
            <span className="play"><Icon name="play" size={26} /></span>
          </button>
        ) : (
          <div className="feature feature--still">
            <img src="/presentador.png" alt="Narizio Olfario, presentador principal de Xpediente Callejero" />
          </div>
        )}
      </Panel>
      <Panel className="panel--lizzet" delay={0.1}>
        <PanelHead icon="play" title="Lizzet Arriaga" sub="Periodismo local: desde el aire lo vemos, pero al ras de calle lo entendemos.">
          <Btn as="a" variant="ghost" size="sm" iconRight="arrow" href={`/personaje/${PERSONAJES.lizzet.slug}`}
            onClick={e => { e.preventDefault(); navigate(`/personaje/${PERSONAJES.lizzet.slug}`) }}>
            Ver todos
          </Btn>
        </PanelHead>
        <div className="feature feature--video">
          <video src="/lizzete_video.mp4" poster="/lizzet_arriaga.jpg" controls playsInline preload="metadata" />
        </div>
      </Panel>
      <Panel className="panel--alerts" delay={0.15}>
        <PanelHead icon="alert" title="Notas en General" sub="Hechos de alto impacto en el Estado de México">
          <span className="chip-live chip-live--red"><span className="live-dot" />En vivo</span>
        </PanelHead>
        <ul className="alerts">
          {alertas.map((a, i) => (
            <motion.li
              key={a.id || i}
              className={`alert alert--${a.level}`}
              role="link"
              tabIndex={0}
              onClick={() => openAlert(a)}
              onKeyDown={e => e.key === 'Enter' && openAlert(a)}
              title={`Ver la noticia en la página de ${PERSONAJES[a.who].name}`}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <img
                className="alert-who"
                src={PERSONAJES[a.who].img}
                alt={PERSONAJES[a.who].name}
                title={PERSONAJES[a.who].name}
                loading="lazy"
              />
              <span className="alert-time">{a.time}</span>
              <span className="alert-muni">{a.municipio}</span>
              <span className="alert-text">{a.text}</span>
            </motion.li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

// ─── Expedientes (secciones) ─────────────────────────────────────────────────

// Filtros de la sección: Todos + cada personaje
const FILTROS = [{ id: 'Todos', label: 'Todos' }, ...Object.entries(PERSONAJES).filter(([, p]) => !p.host).map(([id, p]) => ({ id, label: p.name }))]

function Expedientes({ query, setQuery, cat, setCat }) {
  const navigate = useNavigate()
  // "Todos" muestra todas las tarjetas; un nombre lleva directo a la página del personaje
  const pick = id => (id === 'Todos' ? setCat('Todos') : navigate(`/personaje/${PERSONAJES[id].slug}`))
  const q = query.trim().toLowerCase()
  // Una tarjeta por personaje (los 12), en el orden oficial
  const list = Object.values(PERSONAJES).filter(p => !p.host &&
    (cat === 'Todos' || p.key === cat) &&
    (!q || [p.name, p.segmento, p.seccion?.name, p.seccion?.title, p.seccion?.municipio, p.seccion?.folio]
      .some(t => t && t.toLowerCase().includes(q))),
  )
  return (
    <Panel id="expedientes" className="panel--exp">
      <PanelHead icon="folder" title="Equipo Informativo" sub="12 informantes · elige uno para ver sus noticias">
        {q && (
          <Btn variant="ghost" size="sm" icon="close" onClick={() => setQuery('')}>“{query}”</Btn>
        )}
      </PanelHead>
      <Tabs id="cat" items={FILTROS} value={cat} onChange={pick} small />
      <motion.div className="exp-grid" layout>
        <AnimatePresence mode="popLayout">
          {list.map(p => (
            <motion.article
              key={p.key}
              layout
              className="exp"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -6 }}
            >
              <Link to={`/personaje/${p.slug}`} className="exp-link" aria-label={`Ir a la sección de ${p.name}`}>
                <span className="exp-media exp-media--char">
                  <img src={p.img} alt="" loading="lazy" />
                  <span className="exp-play"><Icon name="arrow" size={18} /></span>
                </span>
                <span className="exp-name">{p.name}</span>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && (
        <p className="empty">
          {cat !== 'Todos' && PERSONAJES[cat]
            ? <>Aún no hay notas de {PERSONAJES[cat].name} aquí. <Link to={`/personaje/${PERSONAJES[cat].slug}`}>Ver su página →</Link></>
            : 'Sin expedientes que coincidan con la búsqueda.'}
        </p>
      )}
    </Panel>
  )
}

// ─── Detalle del expediente ──────────────────────────────────────────────────

function ExpedienteModal({ sec, onClose }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!sec) return
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [sec, onClose])

  const share = async () => {
    const data = { title: `Xpediente Callejero · ${sec.title}`, url: sec.link }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(sec.link); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    } catch { /* cancelado */ }
  }

  return (
    <AnimatePresence>
      {sec && (
        <motion.div className="modal-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Expediente ${sec.folio}`}
            initial={{ y: 40, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="Cerrar"><Icon name="close" /></button>
            <div className="modal-head">
              <StatusBadge status={sec.status} />
              <p className="modal-kicker">Expediente</p>
              <h2 className="modal-folio">{sec.folio}</h2>
              <p className="modal-title">{sec.title}</p>
              {sec.tagline && <p className="exp-tagline exp-tagline--lg">{sec.tagline}</p>}
            </div>
            <div className="modal-grid">
              {sec.video ? (
                <div className="modal-media">
                  <video src={sec.video} poster={sec.imgSrc} controls autoPlay playsInline />
                </div>
              ) : (
                <a className="modal-media" href={sec.link} target="_blank" rel="noopener noreferrer">
                  <img src={sec.imgSrc} alt={sec.title} />
                  <span className="play"><Icon name="play" size={28} /></span>
                </a>
              )}
              <div>
                <dl className="facts">
                  <dt>Sección</dt><dd>{sec.num} · {sec.name}</dd>
                  <dt>Lugar</dt><dd>{sec.municipio}</dd>
                  <dt>Categoría</dt><dd>{sec.cat}</dd>
                  <dt>Publicación</dt><dd>{sec.date}</dd>
                  <dt>Estado</dt><dd>{sec.status}</dd>
                </dl>
              </div>
            </div>
            <h3 className="modal-sub"><Icon name="doc" size={16} /> Narrativa del caso</h3>
            <p className="modal-text">{sec.intro}</p>
            <p className="modal-text modal-text--muted">{sec.desc}</p>
            <ol className="timeline">
              {['Reporte ciudadano', 'Recorrido en campo', 'Publicación', 'Seguimiento'].map((t, i) => (
                <motion.li key={t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                  className={i < (sec.status === 'Publicado' ? 4 : 3) ? 'done' : ''}>
                  <span />{t}
                </motion.li>
              ))}
            </ol>
            <div className="modal-actions">
              <Btn as="a" variant="primary" icon="play" iconRight="ext" href={sec.link} target="_blank" rel="noopener noreferrer">
                Ver nota completa
              </Btn>
              <Btn variant="ghost" icon="share" onClick={share}>{copied ? 'Enlace copiado' : 'Compartir'}</Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Evidencia aérea + voces ─────────────────────────────────────────────────

function EvidenceRow({ onOpen }) {
  const main = SECCIONES[1]
  const thumbs = [SECCIONES[6], SECCIONES[7], SECCIONES[9]]
  return (
    <div className="row row--evidence">
      <Panel id="evidencia">
        <PanelHead icon="drone" title="Evidencia aérea - Halcón Negro" sub="El Ojo que Todo lo Ve · imágenes de dron en zonas de investigación">
          <Btn as="a" variant="ghost" size="sm" iconRight="ext" href={main.link} target="_blank" rel="noopener noreferrer">
            Ver video
          </Btn>
        </PanelHead>
        <div className="evi">
          <button className="evi-main" onClick={() => onOpen(main)}>
            <img src={main.imgSrc} alt="" />
            <span className="evi-hud" aria-hidden>
              <span className="hud-c hud-c--tl" /><span className="hud-c hud-c--tr" />
              <span className="hud-c hud-c--bl" /><span className="hud-c hud-c--br" />
              <span className="hud-cross" />
            </span>
            <span className="evi-rec"><span className="live-dot" />REC · DRON XC-01</span>
            <span className="evi-cap">
              <strong>{main.municipio}</strong>
              <span>{main.title}</span>
            </span>
          </button>
          <div className="evi-thumbs">
            {thumbs.map(t => (
              <motion.button key={t.num} className="evi-thumb" onClick={() => onOpen(t)} whileHover={{ x: 4 }}>
                <img src={t.imgSrc} alt="" loading="lazy" />
                <span>
                  <strong>{t.title}</strong>
                  <em>{t.municipio}</em>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </Panel>
      <Panel className="panel--voices" delay={0.1}>
        <PanelHead icon="quote" title="La voz de la banqueta" sub="La ciudadanía también investiga" />
        <figure className="voice">
          <img src="/entrevista.jpeg" alt="Entrevista en campo de Xpediente Callejero" />
          <blockquote>
            “Cuando las instituciones fallan en documentar, la calle asume esa responsabilidad.
            No como sustituto, sino como evidencia.”
          </blockquote>
          <figcaption>— Manifiesto editorial · Xpediente Callejero</figcaption>
        </figure>
      </Panel>
    </div>
  )
}

// ─── Denuncia ciudadana ──────────────────────────────────────────────────────

function Denuncia() {
  const [form, setForm] = useState({ municipio: '', tipo: '', desc: '', nombre: '', anonimo: true, coords: '' })
  const [geo, setGeo] = useState('idle')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const locate = () => {
    if (!navigator.geolocation) return setGeo('error')
    setGeo('loading')
    navigator.geolocation.getCurrentPosition(
      p => { setForm(f => ({ ...f, coords: `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}` })); setGeo('ok') },
      () => setGeo('error'),
      { timeout: 10000 },
    )
  }

  const submit = e => {
    e.preventDefault()
    const text = [
      '*DENUNCIA CIUDADANA · Xpediente Callejero*',
      '',
      `*Municipio:* ${form.municipio}`,
      `*Tipo:* ${form.tipo}`,
      form.coords ? `*Ubicación:* https://maps.google.com/?q=${encodeURIComponent(form.coords)}` : null,
      '',
      form.desc,
      '',
      form.anonimo ? '_Denuncia anónima._' : `*Nombre / contacto:* ${form.nombre}`,
    ].filter(l => l !== null).join('\n')
    // Sin número configurado, WhatsApp deja elegir a quién enviarlo
    const to = WHATSAPP_NUMBER.replace(/\D/g, '')
    window.open(`https://wa.me/${to}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  return (
    <Panel id="denuncia" className="panel--denuncia">
      <div className="den-intro">
        <span className="den-ico"><Icon name="megaphone" size={34} stroke={1.5} /></span>
        <div>
          <h2 className="den-title">Denuncia ciudadana</h2>
          <p>Tu denuncia puede generar un cambio. Cuéntanos qué sucede, dónde y desde cuándo. Nosotros abrimos el expediente.</p>
        </div>
        <ul className="den-steps">
          <li><Icon name="camera" size={20} />Fotos o video</li>
          <li><Icon name="gps" size={20} />Ubicación GPS</li>
          <li><Icon name="doc" size={20} />Descripción</li>
          <li><Icon name="mask" size={20} />Anónimo</li>
        </ul>
      </div>
      <form className="den-form" onSubmit={submit}>
        <label className="field">
          <span>Municipio</span>
          <select required value={form.municipio} onChange={set('municipio')}>
            <option value="">Selecciona…</option>
            {MUNICIPIOS_DENUNCIA.map(m => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Tipo de problema</span>
          <select required value={form.tipo} onChange={set('tipo')}>
            <option value="">Selecciona…</option>
            {INCIDENTES.map(i => <option key={i.label}>{i.label}</option>)}
          </select>
        </label>
        <label className="field field--full">
          <span>¿Qué está pasando?</span>
          <textarea required rows={4} value={form.desc} onChange={set('desc')} placeholder="Describe el problema, la calle o colonia y desde cuándo ocurre." />
        </label>
        <div className="field field--full field--row">
          <Btn type="button" variant="ghost" size="sm" icon="gps" onClick={locate}>
            {geo === 'loading' ? 'Ubicando…' : geo === 'ok' ? 'Ubicación agregada' : 'Usar mi ubicación'}
          </Btn>
          <span className="field-hint">
            {geo === 'ok' ? form.coords : geo === 'error' ? 'No fue posible obtener la ubicación.' : 'Opcional'}
          </span>
        </div>
        <label className="check">
          <input type="checkbox" checked={form.anonimo} onChange={set('anonimo')} />
          <span className="check-box" />
          Enviar como anónimo
        </label>
        {!form.anonimo && (
          <label className="field field--full">
            <span>Nombre y contacto</span>
            <input value={form.nombre} onChange={set('nombre')} placeholder="Nombre, teléfono o correo" />
          </label>
        )}
        <Btn type="submit" variant="primary" icon="megaphone" iconRight="arrow" block className="field--full">
          Realizar denuncia
        </Btn>
        <p className="field-hint field--full">Se abrirá WhatsApp con tu denuncia lista para enviar; ahí puedes adjuntar fotos o video.</p>
      </form>
    </Panel>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer({ onGo }) {
  return (
    <footer className="footer" id="nosotros">
      <div className="footer-grid">
        <div>
          <div className="footer-brand"><span className="stamp stamp--lg" aria-hidden />Xpediente Callejero</div>
          <p className="footer-desc">Periodismo de investigación y participación ciudadana desde el territorio del Estado de México. La calle ya tiene expediente.</p>
          <p className="footer-mono">DOSSIER · XC-2026 · EDOMEX · EDICIÓN DIGITAL</p>
        </div>
        <div>
          <p className="footer-heading">Secciones</p>
          <ul className="footer-list footer-list--cols">
            {Object.entries(PERSONAJES).map(([key, p]) => (
              <li key={key}>
                <Link to={`/personaje/${p.slug}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="footer-heading">Contacto</p>
          <ul className="footer-list">
            <li><a href="https://www.xpedientecallejero.com">www.xpedientecallejero.com</a></li>
            <li><span>@xpediente.callejero</span></li>
          </ul>
        </div>
      </div>
      <p className="footer-copy">© 2026 Xpediente Callejero — Periodismo de investigación y participación ciudadana · Todos los derechos reservados</p>
    </footer>
  )
}

// ─── Botón flotante de WhatsApp ──────────────────────────────────────────────

const WA_PATH = 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41'

function WhatsAppFab() {
  // Sin número configurado, WhatsApp deja elegir a quién enviar el mensaje
  const to = WHATSAPP_NUMBER.replace(/D/g, '')
  const text = 'Hola Xpediente Callejero, quiero compartir información.'
  return (
    <motion.a
      className="wa-fab"
      href={`https://wa.me/${to}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <span className="wa-ring" aria-hidden />
      <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path fill="currentColor" d={WA_PATH} /></svg>
      <span className="wa-tip">Escríbenos por WhatsApp</span>
    </motion.a>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

const SPY_IDS = NAV.map(n => n.id)

export default function App() {
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState(false)
  const [openSec, setOpenSec] = useState(null)
  const active = useScrollSpy(SPY_IDS)
  const closeSec = useCallback(() => setOpenSec(null), [])

  // Al llegar con un ancla (p. ej. /#denuncia desde la página de un personaje)
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 400)
    return () => clearTimeout(t)
  }, [hash])
  const [cat, setCat] = useState('Todos')

  // Desde el pie de página: filtra Secciones por personaje y lleva a ellas
  const goToCat = c => {
    setQuery('')
    setCat(c)
    scrollTo('expedientes')
  }

  return (
    <div className="app">
      <Sidebar active={active} open={menu} onClose={() => setMenu(false)} />
      <div className="main">
        <Header query={query} setQuery={setQuery} onMenu={() => setMenu(true)} />
        <Ticker />
        <main className="content">
          <FeaturedRow />
          <Expedientes query={query} setQuery={setQuery} cat={cat} setCat={setCat} />
          <Kpis />
          <MapRow />
          <DataRow />
          <EvidenceRow onOpen={setOpenSec} />
          <Denuncia />
        </main>
        <Footer onGo={goToCat} />
      </div>
      <WhatsAppFab />
      <TeaserIntro src={TEASER_VIDEO} closable={TEASER_CLOSABLE} />
      <ExpedienteModal sec={openSec} onClose={closeSec} />
    </div>
  )
}
