import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase, uploadVideoFile, videoUrl, VIDEO_BUCKET, MAX_VIDEO_MB, VIDEO_TYPES } from '../lib/supabase'
import { MUNICIPIOS_DENUNCIA } from '../data'
import { Btn, Icon } from '../components/ui'

const fmtMB = b => `${(b / 1024 / 1024).toFixed(1)} MB`
const fmtDate = d => new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'video'

const EMPTY = { title: '', description: '', municipio: '' }

// ─── Formulario de subida ────────────────────────────────────────────────────

function UploadForm({ onDone }) {
  const [file, setFile] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)
  const preview = useMemo(() => file && URL.createObjectURL(file), [file])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const pick = f => {
    setError('')
    if (!f) return
    if (!VIDEO_TYPES.includes(f.type)) return setError('Formato no válido. Usa MP4, WebM o MOV.')
    if (f.size > MAX_VIDEO_MB * 1024 * 1024) return setError(`El video pesa ${fmtMB(f.size)}. El máximo es ${MAX_VIDEO_MB} MB; comprímelo antes de subirlo.`)
    setFile(f)
    if (!form.title) setForm(v => ({ ...v, title: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') }))
  }

  const submit = async e => {
    e.preventDefault()
    if (!file) return setError('Selecciona un video.')
    setError('')
    setProgress(0)
    const now = new Date()
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}-${slug(form.title)}.${ext}`
    try {
      await uploadVideoFile(file, path, setProgress)
      const { error: dbError } = await supabase.from('videos').insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        municipio: form.municipio || null,
        storage_path: path,
        size_bytes: file.size,
      })
      if (dbError) {
        await supabase.storage.from(VIDEO_BUCKET).remove([path])
        throw dbError
      }
      setFile(null)
      setForm(EMPTY)
      onDone()
    } catch (err) {
      setError(err.message || 'No se pudo subir el video.')
    } finally {
      setProgress(null)
    }
  }

  const uploading = progress !== null

  return (
    <form className="adm-panel adm-upload" onSubmit={submit}>
      <h2 className="adm-h2"><Icon name="play" size={18} /> Subir video</h2>

      <div
        className={`drop${drag ? ' drop--on' : ''}${file ? ' drop--file' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); if (!uploading) pick(e.dataTransfer.files[0]) }}
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept={VIDEO_TYPES.join(',')} hidden onChange={e => pick(e.target.files[0])} />
        {file ? (
          <>
            <video src={preview} muted playsInline preload="metadata" />
            <span className="drop-name">{file.name} · {fmtMB(file.size)}</span>
          </>
        ) : (
          <>
            <Icon name="camera" size={34} stroke={1.4} />
            <strong>Arrastra el video aquí o haz clic</strong>
            <span>MP4, WebM o MOV · máximo {MAX_VIDEO_MB} MB</span>
          </>
        )}
      </div>

      <div className="adm-grid">
        <label className="field field--full">
          <span>Título</span>
          <input required value={form.title} onChange={set('title')} placeholder="Ej. Árboles sin podar en Atizapán" />
        </label>
        <label className="field field--full">
          <span>Descripción</span>
          <textarea rows={3} value={form.description} onChange={set('description')} placeholder="Texto que acompaña al video" />
        </label>
        <label className="field field--full">
          <span>Municipio</span>
          <select value={form.municipio} onChange={set('municipio')}>
            <option value="">Sin municipio</option>
            <option>Estado de México</option>
            {MUNICIPIOS_DENUNCIA.map(m => <option key={m}>{m}</option>)}
          </select>
        </label>
      </div>

      {uploading && (
        <div className="progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <motion.span className="progress-bar" animate={{ width: `${progress * 100}%` }} transition={{ ease: 'linear' }} />
          <span className="progress-label">{progress < 1 ? `Subiendo… ${Math.round(progress * 100)}%` : 'Guardando…'}</span>
        </div>
      )}
      {error && <p className="adm-error" role="alert">{error}</p>}

      <Btn type="submit" variant="primary" icon="play" iconRight="arrow" block disabled={uploading}>
        {uploading ? 'Subiendo…' : 'Subir video'}
      </Btn>
    </form>
  )
}

// ─── Lista de videos ─────────────────────────────────────────────────────────

function VideoCard({ v, onChange }) {
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [editError, setEditError] = useState('')
  const url = videoUrl(v.storage_path)
  const setD = k => e => setDraft(d => ({ ...d, [k]: e.target.value }))

  const startEdit = () => {
    setDraft({ title: v.title, description: v.description || '', municipio: v.municipio || '' })
    setEditError('')
    setEditing(true)
  }

  const save = async e => {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.from('videos').update({
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      municipio: draft.municipio || null,
    }).eq('id', v.id)
    setBusy(false)
    if (error) return setEditError(error.message)
    setEditing(false)
    onChange()
  }

  const remove = async () => {
    if (!confirm(`¿Eliminar "${v.title}"? Esta acción no se puede deshacer.`)) return
    setBusy(true)
    const { error } = await supabase.from('videos').delete().eq('id', v.id)
    if (!error) await supabase.storage.from(VIDEO_BUCKET).remove([v.storage_path])
    setBusy(false)
    if (error) return alert(error.message)
    onChange()
  }

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.article
      layout
      className="vcard"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <video src={url} controls preload="metadata" playsInline />
      {editing ? (
        <form className="vcard-body vcard-edit" onSubmit={save}>
          <label className="field">
            <span>Título</span>
            <input required autoFocus value={draft.title} onChange={setD('title')} />
          </label>
          <label className="field">
            <span>Descripción</span>
            <textarea rows={3} value={draft.description} onChange={setD('description')} />
          </label>
          <label className="field">
            <span>Municipio</span>
            <select value={draft.municipio} onChange={setD('municipio')}>
              <option value="">Sin municipio</option>
              <option>Estado de México</option>
              {MUNICIPIOS_DENUNCIA.map(m => <option key={m}>{m}</option>)}
            </select>
          </label>
          {editError && <p className="adm-error" role="alert">{editError}</p>}
          <div className="vcard-actions">
            <Btn type="submit" variant="primary" size="sm" icon="check" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Btn>
            <Btn type="button" variant="ghost" size="sm" icon="close" onClick={() => setEditing(false)} disabled={busy}>Cancelar</Btn>
          </div>
        </form>
      ) : (
      <div className="vcard-body">
        <span className="vcard-date">{fmtDate(v.created_at)}</span>
        <h3 className="vcard-title">{v.title}</h3>
        {v.description && <p className="vcard-desc">{v.description}</p>}
        <p className="vcard-meta">
          {[v.municipio, v.size_bytes && fmtMB(v.size_bytes)].filter(Boolean).join(' · ')}
        </p>
        <div className="vcard-actions">
          <Btn variant="ghost" size="sm" icon="edit" onClick={startEdit}>Editar</Btn>
          <Btn variant="ghost" size="sm" icon="share" onClick={copy}>{copied ? 'Link copiado' : 'Copiar link'}</Btn>
          <Btn variant="danger" size="sm" icon="close" onClick={remove} disabled={busy}>Eliminar</Btn>
        </div>
      </div>
      )}
    </motion.article>
  )
}

export default function VideosModule() {
  const [videos, setVideos] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else { setError(''); setVideos(data) }
  }, [])

  useEffect(() => { load() }, [load])

  const total = videos?.reduce((a, v) => a + (v.size_bytes || 0), 0) ?? 0

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <p className="adm-kicker">Módulo</p>
          <h1 className="adm-h1">Videos</h1>
        </div>
        {videos && (
          <p className="adm-stats">
            <strong>{videos.length}</strong> videos · {fmtMB(total)} usados de 1 GB
          </p>
        )}
      </header>

      <div className="adm-cols">
        <UploadForm onDone={load} />
        <section className="adm-panel">
          <h2 className="adm-h2"><Icon name="layers" size={18} /> Biblioteca</h2>
          {error && <p className="adm-error">{error}</p>}
          {videos === null && !error && <p className="adm-muted">Cargando…</p>}
          {videos?.length === 0 && <p className="adm-muted">Aún no hay videos. Sube el primero.</p>}
          <div className="vlist">
            <AnimatePresence>
              {videos?.map(v => <VideoCard key={v.id} v={v} onChange={load} />)}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  )
}
