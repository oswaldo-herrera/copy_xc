import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si faltan las variables de entorno el sitio público funciona igual,
// y el admin muestra las instrucciones de configuración.
export const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = supabaseReady ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null

export const VIDEO_BUCKET = 'videos'
export const MAX_VIDEO_MB = 50
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export const videoUrl = path => supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path).data.publicUrl

// Sube un archivo al bucket reportando el progreso (supabase-js no lo expone).
export async function uploadVideoFile(file, path, onProgress) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('La sesión expiró. Vuelve a iniciar sesión.')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${VIDEO_BUCKET}/${path}`)
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.upload.onprogress = e => e.lengthComputable && onProgress?.(e.loaded / e.total)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let msg = `Error ${xhr.status} al subir el archivo`
      try { msg = JSON.parse(xhr.responseText).message || msg } catch { /* sin cuerpo JSON */ }
      reject(new Error(msg))
    }
    xhr.onerror = () => reject(new Error('Falló la conexión durante la subida.'))
    xhr.send(file)
  })
}
