-- ════════════════════════════════════════════════════════════════════════════
-- Xpediente Callejero · Noticias por personaje
-- Ejecutar completo en Supabase → SQL Editor → New query → Run
-- Requiere haber ejecutado antes schema.sql (usa public.is_admin()).
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.noticias (
  id           uuid primary key default gen_random_uuid(),
  personaje    text not null,                 -- clave del personaje: rolando, donaPelos, laMari…
  title        text not null,
  summary      text,                          -- resumen corto para la tarjeta
  body         text,                          -- texto completo de la nota
  cover_url    text,                          -- imagen de portada (bucket "imagenes")
  video_url    text,                          -- video (biblioteca de Supabase o link)
  link_url     text,                          -- link externo (Facebook, YouTube, etc.)
  municipio    text,
  published    boolean not null default true,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references auth.users (id) default auth.uid()
);

create index if not exists noticias_personaje_idx on public.noticias (personaje, published_at desc);

alter table public.noticias enable row level security;

drop policy if exists "público ve noticias publicadas" on public.noticias;
create policy "público ve noticias publicadas" on public.noticias
  for select using ((published = true and published_at <= now()) or public.is_admin());

drop policy if exists "admins gestionan noticias" on public.noticias;
create policy "admins gestionan noticias" on public.noticias
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- updated_at automático (la función se creó en 02_publicaciones.sql; se recrea por si acaso)
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists noticias_touch on public.noticias;
create trigger noticias_touch before update on public.noticias
  for each row execute function public.touch_updated_at();

-- ─── Imágenes de portada ────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagenes', 'imagenes', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins suben imagenes" on storage.objects;
create policy "admins suben imagenes" on storage.objects
  for insert to authenticated with check (bucket_id = 'imagenes' and public.is_admin());

drop policy if exists "admins borran imagenes" on storage.objects;
create policy "admins borran imagenes" on storage.objects
  for delete to authenticated using (bucket_id = 'imagenes' and public.is_admin());
