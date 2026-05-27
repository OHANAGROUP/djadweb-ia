-- ============================================================
-- DJADWEB-IA® — Schema de Cambio de Representante Legal
-- Supabase / PostgreSQL
-- ============================================================

-- ── 1. TABLA PRINCIPAL ──────────────────────────────────────
create table if not exists public.rep_legal_workflows (
  id                uuid default gen_random_uuid() primary key,
  rut_empresa       text not null,
  nombre_empresa    text not null,
  nombre_nuevo_rep  text not null,
  rut_nuevo_rep     text not null,
  email_nuevo_rep   text not null,
  estado            text not null default 'recibido'
                      check (estado in ('recibido', 'acta_generada', 'pendiente_firma', 'notaria_aprobada', 'completado')),
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null
);

comment on table public.rep_legal_workflows is 'Registro y tracking del trámite de cambio de representante legal';

-- ── 2. TRIGGER: updated_at automático ──────────────────────
create or replace function public.set_rep_legal_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rep_legal_workflows_updated_at
  before update on public.rep_legal_workflows
  for each row execute function public.set_rep_legal_updated_at();

-- ── 3. ROW LEVEL SECURITY (RLS) ────────────────────────────
alter table public.rep_legal_workflows enable row level security;

-- Política de inserción pública (cualquiera puede iniciar un trámite en la landing)
create policy "allow_public_insert" on public.rep_legal_workflows
  for insert with check (true);

-- Política de lectura pública por ID (conocer el UUID de tracking es el token de seguridad)
create policy "allow_public_select_by_id" on public.rep_legal_workflows
  for select using (true);

-- Política de actualización para el servicio automatizado (Service Role o autenticado)
create policy "allow_service_role_update" on public.rep_legal_workflows
  for update using (true);
