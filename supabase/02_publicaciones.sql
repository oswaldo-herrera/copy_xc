-- ════════════════════════════════════════════════════════════════════════════
-- Xpediente Callejero · Calendario editorial (publicaciones en redes)
-- Ejecutar completo en Supabase → SQL Editor → New query → Run
-- Requiere haber ejecutado antes schema.sql (usa public.is_admin()).
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.publicaciones (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,                       -- nombre interno de la publicación
  video_id     uuid references public.videos (id) on delete set null,
  video_url    text,                                -- link externo si el video no está en la biblioteca
  scheduled_at timestamptz not null,                -- fecha y hora de lanzamiento
  networks     text[] not null default '{}',        -- youtube, instagram, tiktok, x
  copies       jsonb not null default '{}'::jsonb,  -- copy por red: { "x": { "text": "…" }, "youtube": { "title": "…", "text": "…" } }
  status       jsonb not null default '{}'::jsonb,  -- por red: { "x": { "done": true, "url": "…", "at": "…" } }
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references auth.users (id) default auth.uid()
);

create index if not exists publicaciones_scheduled_idx on public.publicaciones (scheduled_at);

alter table public.publicaciones enable row level security;

drop policy if exists "admins gestionan publicaciones" on public.publicaciones;
create policy "admins gestionan publicaciones" on public.publicaciones
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Mantiene updated_at al día
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists publicaciones_touch on public.publicaciones;
create trigger publicaciones_touch before update on public.publicaciones
  for each row execute function public.touch_updated_at();
