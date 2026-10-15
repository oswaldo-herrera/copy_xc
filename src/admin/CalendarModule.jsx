import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase, videoUrl } from '../lib/supabase'
import { Btn, Icon, Tabs } from '../components/ui'

// ─── Redes ───────────────────────────────────────────────────────────────────

export const NETWORKS = [
  { id: 'youtube', label: 'YouTube', short: 'YT', limit: 5000, titleLimit: 100, open: 'https://studio.youtube.com/' },
  { id: 'instagram', label: 'Instagram', short: 'IG', limit: 2200, open: 'https://www.instagram.com/' },
  { id: 'tiktok', label: 'TikTok', short: 'TT', limit: 2200, open: 'https://www.tiktok.com/upload' },
  { id: 'x', label: 'X', short: 'X', limit: 280, open: 'https://x.com/compose/post' },
]
const NET = Object.fromEntries(NETWORKS.map(n => [n.id, n]))

function NetChip({ id, done }) {
  return (
    <span className={`net net--${id}${done ? ' net--done' : ''}`} title={`${NET[id].label}${done ? ' · publicado' : ''}`}>
      {NET[id].short}
      {done && <Icon name="check" size={10} stroke={3} />}
    </span>
  )
}

// ─── Utilidades de fechas y estado ───────────────────────────────────────────

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const pad = n => String(n).padStart(2, '0')
const toDateInput = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const toTimeInput = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const fmtTime = d => d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
const fmtLong = d => d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function pubState(p, now = new Date()) {
  const done = p.networks.length > 0 && p.networks.every(n => p.status?.[n]?.done)
  if (done) return 'publicada'
  const when = new Date(p.scheduled_at)
  if (when < now) return 'atrasada'
  if (sameDay(when, now)) return 'hoy'
  return 'pendiente'
}
const STATE_LABEL = { publicada: 'Publicada', atrasada: 'Atrasada', hoy: 'Hoy', pendiente: 'Pendiente' }

const mediaUrl = p => (p.video ? videoUrl(p.video.storage_path) : p.video_url || '')

// ─── Formulario (crear / editar) ─────────────────────────────────────────────

const emptyForm = date => ({
  title: '',
  video_id: '',
  video_url: '',
  date: toDateInput(date),
  time: '10:00',
  networks: ['youtube', 'instagram', 'tiktok', 'x'],
  copies: { youtube: { title: '', text: '' }, instagram: { text: '' }, tiktok: { text: '' }, x: { text: '' } },
  notes: '',
})

const formFromPub = p => {
  const d = new Date(p.scheduled_at)
  const base = emptyForm(d)
  return {
    ...base,
    title: p.title,
    video_id: p.video_id || '',
    video_url: p.video_url || '',
    time: toTimeInput(d),
    networks: p.networks,
    copies: { ...base.copies, ...Object.fromEntries(Object.entries(p.copies || {}).map(([k, v]) => [k, { ...base.copies[k], ...v }])) },
    notes: p.notes || '',
  }
}

function PubForm({ pub, presetDate, videos, onClose, onSaved }) {
  const [form, setForm] = useState(() => (pub ? formFromPub(pub) : emptyForm(presetDate || new Date())))
  const [tab, setTab] = useState(form.networks[0] || 'youtube')
  const [source, setSource] = useState(pub?.video_url && !pub?.video_id ? 'link' : 'biblioteca')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setCopy = (net, field) => e => setForm(f => ({ ...f, copies: { ...f.copies, [net]: { ...f.copies[net], [field]: e.target.value } } }))
  const toggleNet = id => setForm(f => ({
    ...f,
    networks: f.networks.includes(id) ? f.networks.filter(n => n !== id) : NETWORKS.map(n => n.id).filter(n => n === id || f.networks.includes(n)),
  }))
  const active = form.networks.includes(tab) ? tab : form.networks[0]

  // Copia el texto de la pestaña actual al resto de redes seleccionadas
  const copyToAll = () => setForm(f => {
    const text = f.copies[active].text
    const copies = { ...f.copies }
    f.networks.forEach(n => { copies[n] = { ...copies[n], text } })
    return { ...f, copies }
  })

  const selectedVideo = videos.find(v => v.id === form.video_id)
  const preview = source === 'biblioteca' ? (selectedVideo ? videoUrl(selectedVideo.storage_path) : '') : form.video_url

  const submit = async e => {
    e.preventDefault()
    if (!form.networks.length) return setError('Elige al menos una red.')
    const over = form.networks.find(n => form.copies[n].text.length > NET[n].limit)
    if (over) return setError(`El copy de ${NET[over].label} pasa el límite de ${NET[over].limit} caracteres.`)
    setBusy(true)
    setError('')
    const copies = Object.fromEntries(form.networks.map(n => [n, form.copies[n]]))
    const row = {
      title: form.title.trim(),
      video_id: source === 'biblioteca' ? form.video_id || null : null,
      video_url: source === 'link' ? form.video_url.trim() || null : null,
      scheduled_at: new Date(`${form.date}T${form.time}`).toISOString(),
      networks: form.networks,
      copies,
      notes: form.notes.trim() || null,
    }
    const { error } = pub
      ? await supabase.from('publicaciones').update(row).eq('id', pub.id)
      : await supabase.from('publicaciones').insert(row)
    setBusy(false)
    if (error) return setError(error.message)
    onSaved()
  }

  return (
    <form className="cal-form" onSubmit={submit}>
      <h2 className="adm-h2"><Icon name={pub ? 'edit' : 'clock'} size={18} /> {pub ? 'Editar publicación' : 'Nueva publicación'}</h2>

      <div className="adm-grid">
        <label className="field field--full">
          <span>Nombre interno</span>
          <input required value={form.title} onChange={set('title')} placeholder="Ej. Teaser Narizio — lanzamiento" />
        </label>
        <label className="field">
          <span>Fecha de lanzamiento</span>
          <input type="date" required value={form.date} onChange={set('date')} />
        </label>
        <label className="field">
          <span>Hora</span>
          <input type="time" required value={form.time} onChange={set('time')} />
        </label>
      </div>

      <div className="cal-block">
        <div className="cal-block-head">
          <span className="cal-label">Video</span>
          <Tabs id="vsrc" small items={[{ id: 'biblioteca', label: 'Biblioteca' }, { id: 'link', label: 'Pegar link' }]} value={source} onChange={setSource} />
        </div>
        {source === 'biblioteca' ? (
          <select className="cal-input" value={form.video_id} onChange={set('video_id')}>
            <option value="">Sin video</option>
            {videos.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
          </select>
        ) : (
          <input className="cal-input" type="url" value={form.video_url} onChange={set('video_url')} placeholder="https://…" />
        )}
        {preview && <video className="cal-preview" src={preview} controls preload="metadata" playsInline />}
      </div>

      <div className="cal-block">
        <span className="cal-label">Redes</span>
        <div className="net-toggle">
          {NETWORKS.map(n => (
            <button
              type="button"
              key={n.id}
              className={`net-pick net-pick--${n.id}${form.networks.includes(n.id) ? ' net-pick--on' : ''}`}
              onClick={() => toggleNet(n.id)}
              aria-pressed={form.networks.includes(n.id)}
            >
              <span className={`net net--${n.id}`}>{n.short}</span>{n.label}
            </button>
          ))}
        </div>
      </div>

      {form.networks.length > 0 && (
        <div className="cal-block">
          <div className="cal-block-head">
            <span className="cal-label">Copy por red</span>
            {form.networks.length > 1 && (
              <Btn type="button" variant="ghost" size="sm" icon="layers" onClick={copyToAll}>Usar este copy en todas</Btn>
            )}
          </div>
          <Tabs id="copy" small items={form.networks.map(n => ({ id: n, label: NET[n].label }))} value={active} onChange={setTab} />
          {active === 'youtube' && (
            <label className="field">
              <span>Título de YouTube <em className={`count${form.copies.youtube.title.length > 100 ? ' count--over' : ''}`}>{form.copies.youtube.title.length}/100</em></span>
              <input value={form.copies.youtube.title} onChange={setCopy('youtube', 'title')} maxLength={100} />
            </label>
          )}
          <label className="field">
            <span>
              {active === 'youtube' ? 'Descripción' : 'Copy'}{' '}
              <em className={`count${form.copies[active].text.length > NET[active].limit ? ' count--over' : ''}`}>
                {form.copies[active].text.length}/{NET[active].limit}
              </em>
            </span>
            <textarea rows={6} value={form.copies[active].text} onChange={setCopy(active, 'text')} placeholder="Texto, hashtags y menciones…" />
          </label>
        </div>
      )}

      <label className="field">
        <span>Notas internas</span>
        <textarea rows={2} value={form.notes} onChange={set('notes')} placeholder="Opcional" />
      </label>

      {error && <p className="adm-error" role="alert">{error}</p>}

      <div className="cal-actions">
        <Btn type="submit" variant="primary" icon="check" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Btn>
        <Btn type="button" variant="ghost" icon="close" onClick={onClose} disabled={busy}>Cancelar</Btn>
      </div>
    </form>
  )
}

// ─── Ficha de la publicación ─────────────────────────────────────────────────

function NetRow({ pub, id, onChange }) {
  const st = pub.status?.[id] || {}
  const copy = pub.copies?.[id] || {}
  const [copied, setCopied] = useState('')
  const [url, setUrl] = useState(st.url || '')
  const [busy, setBusy] = useState(false)

  const copyText = async (txt, what) => {
    await navigator.clipboard.writeText(txt)
    setCopied(what)
    setTimeout(() => setCopied(''), 1400)
  }

  const setDone = async done => {
    setBusy(true)
    const status = { ...pub.status, [id]: done ? { done: true, url: url.trim() || null, at: new Date().toISOString() } : { done: false } }
    const { error } = await supabase.from('publicaciones').update({ status }).eq('id', pub.id)
    setBusy(false)
    if (error) return alert(error.message)
    onChange()
  }

  return (
    <div className={`netrow${st.done ? ' netrow--done' : ''}`}>
      <div className="netrow-head">
        <NetChip id={id} done={st.done} />
        <strong>{NET[id].label}</strong>
        {st.done && <span className="netrow-at">Publicado {new Date(st.at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span>}
        <a className="netrow-open" href={NET[id].open} target="_blank" rel="noopener noreferrer">Abrir {NET[id].label} <Icon name="ext" size={13} /></a>
      </div>
      {id === 'youtube' && copy.title && (
        <div className="netrow-copy">
          <p><span className="cal-label">Título</span>{copy.title}</p>
          <Btn variant="ghost" size="sm" icon="doc" onClick={() => copyText(copy.title, 'title')}>{copied === 'title' ? 'Copiado' : 'Copiar'}</Btn>
        </div>
      )}
      <div className="netrow-copy">
        <p className="netrow-text">{copy.text || <em className="adm-muted">Sin copy</em>}</p>
        {copy.text && <Btn variant="ghost" size="sm" icon="doc" onClick={() => copyText(copy.text, 'text')}>{copied === 'text' ? 'Copiado' : 'Copiar'}</Btn>}
      </div>
      {st.done ? (
        <div className="netrow-foot">
          {st.url && <a href={st.url} target="_blank" rel="noopener noreferrer" className="netrow-link">Ver publicación <Icon name="ext" size={13} /></a>}
          <Btn variant="ghost" size="sm" icon="close" onClick={() => setDone(false)} disabled={busy}>Marcar pendiente</Btn>
        </div>
      ) : (
        <div className="netrow-foot">
          <input className="cal-input" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="Link de la publicación (opcional)" />
          <Btn variant="primary" size="sm" icon="check" onClick={() => setDone(true)} disabled={busy}>Marcar publicado</Btn>
        </div>
      )}
    </div>
  )
}

function PubDetail({ pub, onEdit, onDeleted, onChange }) {
  const when = new Date(pub.scheduled_at)
  const state = pubState(pub)
  const media = mediaUrl(pub)
  const download = pub.video ? `${media}?download=${encodeURIComponent(pub.title)}.mp4` : media

  const remove = async () => {
    if (!confirm(`¿Eliminar la publicación "${pub.title}"? El video de la biblioteca no se borra.`)) return
    const { error } = await supabase.from('publicaciones').delete().eq('id', pub.id)
    if (error) return alert(error.message)
    onDeleted()
  }

  return (
    <div className="cal-detail">
      <span className={`state state--${state}`}>{STATE_LABEL[state]}</span>
      <h2 className="adm-h1 cal-detail-title">{pub.title}</h2>
      <p className="cal-detail-when"><Icon name="clock" size={15} /> {fmtLong(when)} · {fmtTime(when)}</p>

      {media && (
        <div className="cal-detail-media">
          <video src={media} controls preload="metadata" playsInline />
          <Btn as="a" variant="ghost" size="sm" icon="arrow" href={download} target="_blank" rel="noopener noreferrer">Descargar video</Btn>
        </div>
      )}

      <div className="netrows">
        {pub.networks.map(n => <NetRow key={n} pub={pub} id={n} onChange={onChange} />)}
      </div>

      {pub.notes && <p className="cal-notes"><Icon name="info" size={14} /> {pub.notes}</p>}

      <div className="cal-actions">
        <Btn variant="ghost" icon="edit" onClick={onEdit}>Editar</Btn>
        <Btn variant="danger" icon="close" onClick={remove}>Eliminar</Btn>
      </div>
    </div>
  )
}

// ─── Vistas ──────────────────────────────────────────────────────────────────

function MonthGrid({ month, pubs, onDay, onPub }) {
  const today = new Date()
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7 // lunes = 0
  const start = new Date(first)
  start.setDate(1 - offset)
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })

  return (
    <div className="month">
      {DAYS.map(d => <div key={d} className="month-dow">{d}</div>)}
      {days.map(d => {
        const items = pubs.filter(p => sameDay(new Date(p.scheduled_at), d))
        const out = d.getMonth() !== month.getMonth()
        return (
          <div
            key={d.toISOString()}
            className={`day${out ? ' day--out' : ''}${sameDay(d, today) ? ' day--today' : ''}`}
            onClick={() => onDay(d)}
          >
            <span className="day-num">{d.getDate()}</span>
            <div className="day-items">
              {items.map(p => (
                <motion.button
                  key={p.id}
                  type="button"
                  className={`pill pill--${pubState(p)}`}
                  onClick={e => { e.stopPropagation(); onPub(p) }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="pill-time">{fmtTime(new Date(p.scheduled_at))}</span>
                  <span className="pill-title">{p.title}</span>
                  <span className="pill-nets">{p.networks.map(n => <NetChip key={n} id={n} done={p.status?.[n]?.done} />)}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PubList({ pubs, onPub }) {
  const now = new Date()
  const groups = [
    ['Atrasadas', pubs.filter(p => pubState(p, now) === 'atrasada')],
    ['Próximas', pubs.filter(p => ['hoy', 'pendiente'].includes(pubState(p, now)))],
    ['Publicadas', pubs.filter(p => pubState(p, now) === 'publicada').reverse()],
  ]
  return (
    <div className="plist">
      {groups.map(([label, items]) => items.length > 0 && (
        <section key={label}>
          <h3 className="plist-h">{label} <span>{items.length}</span></h3>
          {items.map(p => {
            const d = new Date(p.scheduled_at)
            const st = pubState(p, now)
            return (
              <button key={p.id} type="button" className={`prow prow--${st}`} onClick={() => onPub(p)}>
                <span className="prow-date"><strong>{d.getDate()}</strong>{d.toLocaleDateString('es-MX', { month: 'short' })}</span>
                <span className="prow-main">
                  <span className="prow-title">{p.title}</span>
                  <span className="prow-meta">{fmtTime(d)} · {p.video?.title || (p.video_url ? 'Link externo' : 'Sin video')}</span>
                </span>
                <span className="pill-nets">{p.networks.map(n => <NetChip key={n} id={n} done={p.status?.[n]?.done} />)}</span>
                <span className={`state state--${st}`}>{STATE_LABEL[st]}</span>
              </button>
            )
          })}
        </section>
      ))}
      {pubs.length === 0 && <p className="adm-muted">Aún no hay publicaciones programadas.</p>}
    </div>
  )
}

// ─── Módulo ──────────────────────────────────────────────────────────────────

export default function CalendarModule() {
  const [pubs, setPubs] = useState(null)
  const [videos, setVideos] = useState([])
  const [error, setError] = useState('')
  const [view, setView] = useState('calendario')
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [modal, setModal] = useState(null) // { mode: 'new' | 'view' | 'edit', pub?, date? }

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('publicaciones')
      .select('*, video:videos(id, title, storage_path)')
      .order('scheduled_at', { ascending: true })
    if (error) {
      setError(error.code === '42P01' || /publicaciones/.test(error.message)
        ? 'Falta crear la tabla: ejecuta supabase/02_publicaciones.sql en el SQL Editor de Supabase.'
        : error.message)
      setPubs([])
      return
    }
    setError('')
    setPubs(data)
    setModal(m => (m?.pub ? { ...m, pub: data.find(p => p.id === m.pub.id) || null } : m))
  }, [])

  useEffect(() => {
    load()
    supabase.from('videos').select('id, title, storage_path').order('created_at', { ascending: false })
      .then(({ data }) => data && setVideos(data))
  }, [load])

  useEffect(() => {
    if (!modal) return
    const onKey = e => e.key === 'Escape' && setModal(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modal])

  const counts = useMemo(() => {
    const now = new Date()
    const week = new Date(now); week.setDate(now.getDate() + 7)
    const list = pubs || []
    return {
      hoy: list.filter(p => pubState(p, now) === 'hoy').length,
      atrasadas: list.filter(p => pubState(p, now) === 'atrasada').length,
      semana: list.filter(p => pubState(p, now) !== 'publicada' && new Date(p.scheduled_at) >= now && new Date(p.scheduled_at) <= week).length,
    }
  }, [pubs])

  const shiftMonth = n => setMonth(m => new Date(m.getFullYear(), m.getMonth() + n, 1))
  const monthLabel = month.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <p className="adm-kicker">Módulo</p>
          <h1 className="adm-h1">Calendario editorial</h1>
        </div>
        <Btn variant="primary" icon="clock" iconRight="arrow" onClick={() => setModal({ mode: 'new', date: new Date() })}>
          Nueva publicación
        </Btn>
      </header>

      <div className="cal-stats">
        <div className="cal-stat cal-stat--hoy"><strong>{counts.hoy}</strong>para hoy</div>
        <div className="cal-stat cal-stat--atrasada"><strong>{counts.atrasadas}</strong>atrasadas</div>
        <div className="cal-stat"><strong>{counts.semana}</strong>próximos 7 días</div>
      </div>

      {error && <p className="adm-error">{error}</p>}

      <section className="adm-panel">
        <div className="cal-toolbar">
          <Tabs id="calview" items={[{ id: 'calendario', label: 'Calendario', icon: 'clock' }, { id: 'lista', label: 'Lista', icon: 'layers' }]} value={view} onChange={setView} />
          {view === 'calendario' && (
            <div className="cal-nav">
              <button className="map-zbtn" onClick={() => shiftMonth(-1)} aria-label="Mes anterior">‹</button>
              <span className="cal-month">{monthLabel}</span>
              <button className="map-zbtn" onClick={() => shiftMonth(1)} aria-label="Mes siguiente">›</button>
              <Btn variant="ghost" size="sm" onClick={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)) }}>Hoy</Btn>
            </div>
          )}
        </div>

        {pubs === null ? <p className="adm-muted">Cargando…</p> : view === 'calendario' ? (
          <MonthGrid
            month={month}
            pubs={pubs}
            onDay={d => setModal({ mode: 'new', date: d })}
            onPub={p => setModal({ mode: 'view', pub: p })}
          />
        ) : (
          <PubList pubs={pubs} onPub={p => setModal({ mode: 'view', pub: p })} />
        )}
      </section>

      <AnimatePresence>
        {modal && (
          <motion.div className="modal-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
            <motion.div
              className="modal cal-modal"
              role="dialog"
              aria-modal="true"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setModal(null)} aria-label="Cerrar"><Icon name="close" /></button>
              {modal.mode === 'view' && modal.pub ? (
                <PubDetail
                  pub={modal.pub}
                  onEdit={() => setModal({ mode: 'edit', pub: modal.pub })}
                  onDeleted={() => { setModal(null); load() }}
                  onChange={load}
                />
              ) : (
                <PubForm
                  pub={modal.mode === 'edit' ? modal.pub : null}
                  presetDate={modal.date}
                  videos={videos}
                  onClose={() => setModal(null)}
                  onSaved={() => { setModal(null); load() }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
