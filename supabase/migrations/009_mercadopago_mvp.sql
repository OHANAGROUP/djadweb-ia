-- ============================================================
-- DJADWEB-IA® — 009_mercadopago_mvp.sql
-- MVP Monetización: Bandera is_pro
-- ============================================================

-- Agregar columna para indicar si el usuario ha pagado el plan Pro
alter table public.profiles
add column if not exists is_pro boolean not null default false;

comment on column public.profiles.is_pro is 'Bandera simple para habilitar funciones del sistema completo (MercadoPago MVP)';
