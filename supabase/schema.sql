-- ════════════════════════════════════════════════════════════════════════════
-- Xpediente Callejero · Esquema inicial del admin / CRM
-- Ejecutar completo en Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Administradores ────────────────────────────────────────────────────────
-- Solo los usuarios listados aquí pueden entrar al admin y modificar datos,
-- aunque alguien más llegara a crear una cuenta.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nombre     text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins se ven a sí mismos" on public.admins;
create policy "admins se ven a sí mismos" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ─── Videos ─────────────────────────────────────────────────────────────────
create table if not exists public.videos (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  seccion      text,
  municipio    text,
  published    boolean not null default false,
  storage_path text not null,
  size_bytes   bigint,
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users (id) default auth.uid()
);

create index if not exists videos_created_at_idx on public.videos (created_at desc);

alter table public.videos enable row level security;

drop policy if exists "público ve videos publicados" on public.videos;
create policy "público ve videos publicados" on public.videos
  for select using (published = true or public.is_admin());

drop policy if exists "admins gestionan videos" on public.videos;
create policy "admins gestionan videos" on public.videos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ─── Almacenamiento de archivos de video ────────────────────────────────────
-- Bucket público de lectura (para reproducir en la web), 50 MB por archivo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins suben videos" on storage.objects;
create policy "admins suben videos" on storage.objects
  for insert to authenticated with check (bucket_id = 'videos' and public.is_admin());

drop policy if exists "admins actualizan videos" on storage.objects;
create policy "admins actualizan videos" on storage.objects
  for update to authenticated using (bucket_id = 'videos' and public.is_admin());

drop policy if exists "admins borran videos" on storage.objects;
create policy "admins borran videos" on storage.objects
  for delete to authenticated using (bucket_id = 'videos' and public.is_admin());

-- ─── Dar de alta al primer administrador ────────────────────────────────────
-- 1) Crea el usuario en Authentication → Users → Add user → Create new user
--    (correo + contraseña) y marca "Auto Confirm User" para que NO se envíe
--    ningún correo de confirmación.
-- 2) Ejecuta esto cambiando el correo:
--
-- insert into public.admins (user_id, nombre)
-- select id, 'Administrador' from auth.users where email = 'tu-correo@ejemplo.com';
