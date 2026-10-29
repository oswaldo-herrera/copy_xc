-- ════════════════════════════════════════════════════════════════════════════
-- Xpediente Callejero · Campos de portada para noticias
-- Ejecutar completo en Supabase → SQL Editor → New query → Run
-- Requiere haber ejecutado antes 03_noticias.sql.
-- ════════════════════════════════════════════════════════════════════════════

-- Nivel de la alerta en "Alertas recientes" (color de la etiqueta del municipio)
alter table public.noticias
  add column if not exists nivel text not null default 'media';

alter table public.noticias drop constraint if exists noticias_nivel_check;
alter table public.noticias
  add constraint noticias_nivel_check check (nivel in ('alta', 'media', 'baja'));

-- Noticia que ocupa el panel "Video destacado" de la portada (se usa la más reciente)
alter table public.noticias
  add column if not exists destacada boolean not null default false;

create index if not exists noticias_destacada_idx on public.noticias (destacada, published_at desc);
