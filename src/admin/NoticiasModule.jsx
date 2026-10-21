import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase, videoUrl } from '../lib/supabase'
import { PERSONAJES, MUNICIPIOS_DENUNCIA } from '../data'
import { Btn, Icon, Tabs } from '../components/ui'

const IMG_BUCKET = 'imagenes'
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMG_MB = 5

const pad = n => String(n).padStart(2, '0')
const toLocalInput = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
const fmtDate = d => new Date(d).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
const imgPathFromUrl = url => url?.split(`/object/public/${IMG_BUCKET}/`)[1]

const EMPTY = () => ({
  personaje: Object.keys(PERSONAJES)[0],
  title: '',
  summary: '',
  body: '',
  cover_url: '',
  video_url: '',
  link_url: '',
  municipio: '',
  published: true,
  published_at: toLocalInput(new Date()),
})

// ─── Formulario ──────────────────────────────────────────────────────────────

function NoticiaForm({ item, videos, onClose, onSaved }) {
  const [form, setForm] = useState(() => item
    ? { ...EMPTY(), ...Object.fromEntries(Object.entries(item).map(([k, v]) => [k, v ?? ''])), published_at: toLocalInput(new Date(item.published_at)) }
    : EMPTY())
  const [cover, setCover] = useState(null) // archivo nuevo
  const [videoSrc, setVideoSrc] = useState(() => (item?.video_url && !item.video_url.includes('/object/public/videos/') ? 'link' : 'biblioteca'))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const coverPreview = useMemo(() => (cover ? URL.createObjectURL(cover) : form.cover_url), [cover, form.cover_url])
  useEffect(() => () => cover && URL.revokeObjectURL(coverPreview), [cover, coverPreview])

  const pickCover = f => {
    setError('')
    if (!f) return
    if (!IMG_TYPES.includes(f.type)) return setError('La portada debe ser JPG, PNG o WebP.')
    if (f.size > MAX_IMG_MB * 1024 * 1024) return setError(`La portada pesa más de ${MAX_IMG_MB} MB.`)
    setCover(f)
  }

  const submit = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      let cover_url = form.cover_url || null
      if (cover) {
        const ext = cover.name.split('.').pop().toLowerCase()
        const now = new Date()
        const path = `noticias/${now.getFullYear()}/${pad(now.getMonth() + 1)}/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage.from(IMG_BUCKET).upload(path, cover, { contentType: cover.type })
        if (upErr) throw upErr
        cover_url = supabase.storage.from(IMG_BUCKET).getPublicUrl(path).data.publicUrl
      }
      const row = {
        personaje: form.personaje,
        title: form.title.trim(),
        summary: form.summary.trim() || null,
        body: form.body.trim() || null,
        cover_url,
        video_url: form.video_url.trim() || null,
        link_url: form.link_url.trim() || null,
        municipio: form.municipio || null,
        published: form.published,
        published_at: new Date(form.published_at).toISOString(),
      }
      const { error: dbErr } = item
        ? await supabase.from('noticias').update(row).eq('id', item.id)
        : await supabase.from('noticias').insert(row)
      if (dbErr) throw dbErr
      onSaved()
    } catch (err) {
      setError(err.message || 'No se pudo guardar la noticia.')
      setBusy(false)
    }
  }

  return (
    <form className="cal-form" onSubmit={submit}>
      <h2 className="adm-h2"><Icon name={item ? 'edit' : 'doc'} size={18} /> {item ? 'Editar noticia' : 'Nueva noticia'}</h2>

      <div className="cal-block">
        <span className="cal-label">Personaje</span>
        <div className="who-pick">
          {Object.entries(PERSONAJES).map(([key, p]) => (
            <button
              type="button"
              key={key}
              className={`who-opt${form.personaje === key ? ' who-opt--on' : ''}`}
              onClick={() => setForm(f => ({ ...f, personaje: key }))}
              aria-pressed={form.personaje === key}
              title={p.name}
            >
              <img src={p.img} alt="" style={p.pos ? { objectPosition: p.pos } : undefined} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="adm-grid">
        <label className="field field--full">
          <span>Título</span>
          <input required value={form.title} onChange={set('title')} />
        </label>
        <label className="field field--full">
          <span>Resumen <em className="count">{form.summary.length}/220</em></span>
          <textarea rows={2} maxLength={220} value={form.summary} onChange={set('summary')} placeholder="Una o dos líneas para la tarjeta" />
        </label>
        <label className="field field--full">
          <span>Texto de la nota</span>
          <textarea rows={6} value={form.body} onChange={set('body')} />
        </label>
      </div>

      <div className="cal-block">
        <span className="cal-label">Portada</span>
        <div className="cover-row">
          {coverPreview ? <img className="cover-prev" src={coverPreview} alt="" /> : <span className="cover-prev cover-prev--empty"><Icon name="camera" size={24} /></span>}
          <div className="cover-actions">
            <label className="btn btn--ghost btn--sm cover-file">
              <Icon name="camera" size={14} /> {coverPreview ? 'Cambiar imagen' : 'Subir imagen'}
              <input type="file" accept={IMG_TYPES.join(',')} hidden onChange={e => pickCover(e.target.files[0])} />
            </label>
            {coverPreview && (
              <Btn type="button" variant="ghost" size="sm" icon="close" onClick={() => { setCover(null); setForm(f => ({ ...f, cover_url: '' })) }}>Quitar</Btn>
            )}
            <span className="field-hint">JPG, PNG o WebP · máx. {MAX_IMG_MB} MB</span>
          </div>
        </div>
      </div>

      <div className="cal-block">
        <div className="cal-block-head">
          <span className="cal-label">Video (opcional)</span>
          <Tabs id="nvsrc" small items={[{ id: 'biblioteca', label: 'Biblioteca' }, { id: 'link', label: 'Pegar link' }]} value={videoSrc} onChange={setVideoSrc} />
        </div>
        {videoSrc === 'biblioteca' ? (
          <select className="cal-input" value={form.video_url} onChange={set('video_url')}>
            <option value="">Sin video</option>
            {videos.map(v => <option key={v.id} value={videoUrl(v.storage_path)}>{v.title}</option>)}
          </select>
        ) : (
          <input className="cal-input" type="url" value={form.video_url} onChange={set('video_url')} placeholder="Link de YouTube o de un archivo .mp4" />
        )}
      </div>

      <div className="adm-grid">
        <label className="field field--full">
          <span>Link externo (opcional)</span>
          <input type="url" value={form.link_url} onChange={set('link_url')} placeholder="Facebook, Instagram, TikTok…" />
        </label>
        <label className="field">
          <span>Municipio</span>
          <select value={form.municipio} onChange={set('municipio')}>
            <option value="">Sin municipio</option>
            <option>Estado de México</option>
            {MUNICIPIOS_DENUNCIA.map(m => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Fecha de publicación</span>
          <input type="datetime-local" required value={form.published_at} onChange={set('published_at')} />
        </label>
        <label className="check field--full">
          <input type="checkbox" checked={form.published} onChange={set('published')} />
          <span className="check-box" />
          Publicada (si la fecha es futura, aparece hasta ese momento)
        </label>
      </div>

      {error && <p className="adm-error" role="alert">{error}</p>}

      <div className="cal-actions">
        <Btn type="submit" variant="primary" icon="check" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Btn>
        <Btn type="button" variant="ghost" icon="close" onClick={onClose} disabled={busy}>Cancelar</Btn>
      </div>
    </form>
  )
}

// ─── Módulo ──────────────────────────────────────────────────────────────────

export default function NoticiasModule() {
  const [items, setItems] = useState(null)
  const [videos, setVideos] = useState([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('todos')
  const [modal, setModal] = useState(null) // { item? }

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('noticias').select('*').order('published_at', { ascending: false })
    if (error) {
      setError(/noticias/.test(error.message)
        ? 'Falta crear la tabla: ejecuta supabase/03_noticias.sql en el SQL Editor de Supabase.'
        : error.message)
      setItems([])
      return
    }
    setError('')
    setItems(data)
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

  const remove = async n => {
    if (!confirm(`¿Eliminar la noticia "${n.title}"?`)) return
    const { error } = await supabase.from('noticias').delete().eq('id', n.id)
    if (error) return alert(error.message)
    const path = imgPathFromUrl(n.cover_url)
    if (path) await supabase.storage.from(IMG_BUCKET).remove([path])
    load()
  }

  const togglePublish = async n => {
    const { error } = await supabase.from('noticias').update({ published: !n.published }).eq('id', n.id)
    if (error) return alert(error.message)
    load()
  }

  const counts = useMemo(() => {
    const c = {}
    ;(items || []).forEach(n => { c[n.personaje] = (c[n.personaje] || 0) + 1 })
    return c
  }, [items])

  const list = (items || []).filter(n => filter === 'todos' || n.personaje === filter)
  const now = new Date()

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <p className="adm-kicker">Módulo</p>
          <h1 className="adm-h1">Noticias</h1>
        </div>
        <Btn variant="primary" icon="doc" iconRight="arrow" onClick={() => setModal({})}>Nueva noticia</Btn>
      </header>

      {error && <p className="adm-error">{error}</p>}

      <section className="adm-panel">
        <div className="who-filter">
          <button className={`who-chip${filter === 'todos' ? ' who-chip--on' : ''}`} onClick={() => setFilter('todos')}>
            Todos <em>{items?.length ?? 0}</em>
          </button>
          {Object.entries(PERSONAJES).map(([key, p]) => (
            <button key={key} className={`who-chip${filter === key ? ' who-chip--on' : ''}`} onClick={() => setFilter(key)}>
              <img src={p.img} alt="" style={p.pos ? { objectPosition: p.pos } : undefined} />{p.name} <em>{counts[key] || 0}</em>
            </button>
          ))}
        </div>

        {items === null ? <p className="adm-muted">Cargando…</p> : list.length === 0 ? (
          <p className="adm-muted">Aún no hay noticias{filter !== 'todos' && ` de ${PERSONAJES[filter].name}`}.</p>
        ) : (
          <div className="nlist">
            <AnimatePresence>
              {list.map(n => {
                const p = PERSONAJES[n.personaje]
                const scheduled = n.published && new Date(n.published_at) > now
                return (
                  <motion.article key={n.id} layout className="nrow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {n.cover_url ? <img className="nrow-cover" src={n.cover_url} alt="" /> : <span className="nrow-cover nrow-cover--empty"><Icon name="doc" size={20} /></span>}
                    <div className="nrow-main">
                      <p className="nrow-who">{p && <img src={p.img} alt="" style={p.pos ? { objectPosition: p.pos } : undefined} />}{p?.name || n.personaje}</p>
                      <h3 className="nrow-title">{n.title}</h3>
                      <p className="nrow-meta">
                        {fmtDate(n.published_at)}{n.municipio && ` · ${n.municipio}`}
                        {n.video_url && ' · 🎬 video'}
                      </p>
                    </div>
                    <span className={`state ${!n.published ? 'state--pendiente' : scheduled ? 'state--hoy' : 'state--publicada'}`}>
                      {!n.published ? 'Borrador' : scheduled ? 'Programada' : 'Publicada'}
                    </span>
                    <div className="nrow-actions">
                      <Btn variant="ghost" size="sm" icon="edit" onClick={() => setModal({ item: n })}>Editar</Btn>
                      <Btn variant="ghost" size="sm" icon={n.published ? 'close' : 'check'} onClick={() => togglePublish(n)}>
                        {n.published ? 'Ocultar' : 'Publicar'}
                      </Btn>
                      {p && <Btn as="a" variant="ghost" size="sm" icon="ext" href={`/personaje/${p.slug}`} target="_blank" rel="noopener noreferrer">Ver</Btn>}
                      <Btn variant="danger" size="sm" icon="close" onClick={() => remove(n)}>Eliminar</Btn>
                    </div>
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </div>
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
              <NoticiaForm
                item={modal.item}
                videos={videos}
                onClose={() => setModal(null)}
                onSaved={() => { setModal(null); load() }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
