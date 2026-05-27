-- ============================================================
-- DJADWEB-IA® — Schema Inicial
-- Supabase / PostgreSQL
-- ============================================================

-- ── 1. PROFILES (extiende auth.users) ──────────────────────
create table if not exists public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  nombre_completo text,
  rut             text,
  telefono        text,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

comment on table public.profiles is 'Datos de perfil del usuario, 1:1 con auth.users';

-- ── 2. SUBSCRIPTIONS ───────────────────────────────────────
create table if not exists public.subscriptions (
  id                    uuid default gen_random_uuid() primary key,
  user_id               uuid references auth.users on delete cascade not null unique,
  plan                  text not null default 'free'
                          check (plan in ('free','basic','premium')),
  status                text not null default 'active'
                          check (status in ('active','cancelled','past_due','trialing')),
  mp_subscription_id    text,
  mp_payer_id           text,
  current_period_start  timestamptz default now(),
  current_period_end    timestamptz,
  cancelled_at          timestamptz,
  created_at            timestamptz default now() not null,
  updated_at            timestamptz default now() not null
);

comment on table public.subscriptions is 'Plan activo del usuario (free/basic/premium)';
comment on column public.subscriptions.mp_subscription_id is 'ID de suscripción en MercadoPago';

-- ── 3. SEARCHES (historial de consultas) ───────────────────
create table if not exists public.searches (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  params      jsonb not null,
  -- params shape: {nombre, apellidoPaterno, apellidoMaterno?, anio?, competencia, corte?}
  result      jsonb,
  -- result shape: {causas:[], total, fuente, consultadoEn}
  ai_summary  text,
  -- Resumen en lenguaje simple generado por Claude
  created_at  timestamptz default now() not null
);

comment on table public.searches is 'Historial de búsquedas PJUD/SII del usuario';

-- Índice para historial por usuario (más reciente primero)
create index if not exists searches_user_id_created_at_idx
  on public.searches (user_id, created_at desc);

-- Índice para contar consultas del mes (quota free)
create index if not exists searches_user_month_idx
  on public.searches (user_id, date_trunc('month', created_at));

-- ── 4. ALERTS (alertas proactivas) ─────────────────────────
create table if not exists public.alerts (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users on delete cascade not null,
  nombre              text not null,
  apellido_paterno    text not null,
  apellido_materno    text,
  competencias        text[] not null default array['civil','laboral','penal'],
  activa              boolean default true not null,
  last_checked        timestamptz,
  last_result_hash    text,
  -- MD5 del JSON de resultados anterior para detectar cambios
  notify_email        boolean default true,
  notify_whatsapp     boolean default false,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null,

  constraint alerts_user_max check (true)
  -- límite de alertas se verifica en aplicación según plan
);

comment on table public.alerts is 'Configuración de alertas proactivas (plan premium)';

-- ── 5. TRIGGER: updated_at automático ──────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create trigger alerts_updated_at
  before update on public.alerts
  for each row execute function public.set_updated_at();

-- ── 6. TRIGGER: auto-crear profile + subscription al registrarse ──
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- Crear perfil vacío
  insert into public.profiles (id, nombre_completo)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;

  -- Crear suscripción gratuita por defecto
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 7. ROW LEVEL SECURITY ──────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.searches       enable row level security;
alter table public.alerts         enable row level security;

-- profiles: solo el dueño puede leer/modificar
create policy "profiles_owner" on public.profiles
  for all using (auth.uid() = id);

-- subscriptions: solo el dueño puede leer (escritura vía service_role en webhooks)
create policy "subscriptions_read_owner" on public.subscriptions
  for select using (auth.uid() = user_id);

-- searches: solo el dueño puede leer/insertar/borrar
create policy "searches_owner" on public.searches
  for all using (auth.uid() = user_id);

-- alerts: solo el dueño puede leer/insertar/modificar/borrar
create policy "alerts_owner" on public.alerts
  for all using (auth.uid() = user_id);

-- ── 8. FUNCIÓN: contar búsquedas del mes (quota) ───────────
create or replace function public.get_monthly_search_count(p_user_id uuid)
returns integer language sql stable security definer as $$
  select count(*)::integer
  from public.searches
  where user_id = p_user_id
    and date_trunc('month', created_at) = date_trunc('month', now());
$$;

-- ── 9. CUOTAS POR PLAN (referencia, se usa en app) ─────────
-- free:    3  búsquedas/mes  · solo PJUD · sin alertas · sin IA
-- basic:   ∞  búsquedas/mes · PJUD       · sin alertas · sin IA  → $3.990/mes
-- premium: ∞  búsquedas/mes · PJUD+SII   · alertas ✓  · IA ✓   → $7.990/mes
