import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  SECCIONES, CATEGORIAS, TICKER, KPIS, MUNICIPIOS, INCIDENTES, TENDENCIA, ESTATUS,
  ALERTAS, MUNICIPIOS_DENUNCIA, WHATSAPP_NUMBER,
} from './data'
import { Btn, Icon, Panel, PanelHead, Tabs, Counter, StatusBadge } from './components/ui'
import { RankBars, Donut, TrendLine } from './components/Charts'
import HeatMap from './components/HeatMap'

const NAV = [
  { id: 'inicio', label: 'Inicio', icon: 'home' },
  { id: 'mapa', label: 'Mapa de calor', icon: 'map' },
  { id: 'datos', label: 'Datos', icon: 'chart' },
  { id: 'expedientes', label: 'Expedientes', icon: 'folder' },
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
        <motion.span
          className="brand-x"
          initial={{ scale: 2.4, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >X</motion.span>
        <div className="brand-words">
          <motion.span className="brand-top" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            PEDIENTE
          </motion.span>
          <motion.span className="brand-bottom" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            CALLEJERO
          </motion.span>
        </div>
        <p className="brand-pillars">Periodismo · Ciudadanía · Investigación · Resultados</p>
      </div>

      <motion.div className="claim" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <p>Abrimos el expediente.</p>
        <p className="claim-hl">Cerramos con la verdad.</p>
      </motion.div>

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

function FeaturedRow({ onOpen }) {
  const f = SECCIONES[2]
  return (
    <div className="row row--featured">
      <Panel className="panel--featured">
        <PanelHead icon="play" title="Video destacado" sub={`Sección ${f.num} · ${f.name}`}>
          <Btn as="a" variant="ghost" size="sm" iconRight="arrow" href="#expedientes"
            onClick={e => { e.preventDefault(); scrollTo('expedientes') }}>
            Ver todos
          </Btn>
        </PanelHead>
        <button className="feature" onClick={() => onOpen(f)}>
          <img src={f.imgSrc} alt="" />
          <span className="feature-shade" />
          <motion.span className="play" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}>
            <Icon name="play" size={30} />
          </motion.span>
          <span className="feature-body">
            <span className="badge badge--red">Investigación</span>
            <span className="feature-title">{f.title}</span>
            <span className="feature-meta"><Icon name="pin" size={14} /> {f.municipio} · {f.date}</span>
          </span>
        </button>
      </Panel>
      <Panel className="panel--alerts" delay={0.1}>
        <PanelHead icon="alert" title="Alertas recientes" sub="Hechos de alto impacto en el Estado de México">
          <span className="chip-live chip-live--red"><span className="live-dot" />En vivo</span>
        </PanelHead>
        <ul className="alerts">
          {ALERTAS.map((a, i) => (
            <motion.li
              key={i}
              className={`alert alert--${a.level}`}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
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

function Expedientes({ query, setQuery, cat, setCat, onOpen }) {
  const q = query.trim().toLowerCase()
  const list = SECCIONES.filter(s =>
    (cat === 'Todos' || s.cat === cat) &&
    (!q || [s.name, s.title, s.municipio, s.folio, s.desc].some(t => t.toLowerCase().includes(q))),
  )
  return (
    <Panel id="expedientes" className="panel--exp">
      <PanelHead icon="folder" title="Secciones" sub="Nuestras 11 secciones · notas publicadas en campo">
        {q && (
          <Btn variant="ghost" size="sm" icon="close" onClick={() => setQuery('')}>“{query}”</Btn>
        )}
      </PanelHead>
      <Tabs id="cat" items={CATEGORIAS} value={cat} onChange={setCat} small />
      <motion.div className="exp-grid" layout>
        <AnimatePresence mode="popLayout">
          {list.map(s => (
            <motion.article
              key={s.num}
              layout
              className="exp"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -6 }}
            >
              <button
                className={`exp-media${s.video ? ' exp-media--video' : ''}`}
                onClick={() => onOpen(s)}
                aria-label={`Abrir expediente ${s.folio}`}
                onPointerEnter={e => e.currentTarget.querySelector('video')?.play().catch(() => {})}
                onPointerLeave={e => e.currentTarget.querySelector('video')?.pause()}
              >
                {s.video ? (
                  <video src={s.video} poster={s.imgSrc} muted loop playsInline preload="metadata" />
                ) : (
                  <img src={s.imgSrc} alt="" loading="lazy" />
                )}
                <span className="exp-cat">{s.cat}</span>
                {s.video && <span className="exp-vid"><span className="live-dot" />Video</span>}
                <span className="exp-num">{s.num}</span>
                <span className="exp-play"><Icon name="play" size={18} /></span>
              </button>
              <div className="exp-body">
                <p className="exp-folio">{s.folio}</p>
                <h3 className="exp-title">{s.title}</h3>
                {s.tagline && <p className="exp-tagline">{s.tagline}</p>}
                <p className="exp-sec">{s.name}</p>
                <p className="exp-meta"><Icon name="pin" size={13} />{s.municipio}<span>{s.date}</span></p>
                <div className="exp-foot">
                  <StatusBadge status={s.status} />
                  <Btn variant="ghost" size="sm" iconRight="arrow" onClick={() => onOpen(s)}>Abrir</Btn>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="empty">Sin expedientes que coincidan con la búsqueda.</p>}
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
            {CATEGORIAS.map(c => (
              <li key={c}>
                <a href="#expedientes" onClick={e => { e.preventDefault(); onGo(c) }}>{c}</a>
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

// ─── App ─────────────────────────────────────────────────────────────────────

const SPY_IDS = NAV.map(n => n.id)

export default function App() {
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState(false)
  const [openSec, setOpenSec] = useState(null)
  const active = useScrollSpy(SPY_IDS)
  const closeSec = useCallback(() => setOpenSec(null), [])
  const [cat, setCat] = useState('Todos')

  // Desde el pie de página: filtra Secciones por categoría y lleva a ellas
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
          <Kpis />
          <MapRow />
          <DataRow />
          <FeaturedRow onOpen={setOpenSec} />
          <Expedientes query={query} setQuery={setQuery} cat={cat} setCat={setCat} onOpen={setOpenSec} />
          <EvidenceRow onOpen={setOpenSec} />
          <Denuncia />
        </main>
        <Footer onGo={goToCat} />
      </div>
      <ExpedienteModal sec={openSec} onClose={closeSec} />
    </div>
  )
}
