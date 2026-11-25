-- ============================================================
-- WORLD OF WORK - Esquema de Base de Datos para Supabase
-- ============================================================

-- 1. Tabla de Presupuestos
create table if not exists public.budgets (
  id text primary key,
  code text not null,
  created_at timestamptz not null default now(),
  client jsonb not null default '{}'::jsonb,
  project jsonb not null default '{}'::jsonb,
  soil_calculation jsonb,
  items jsonb not null default '[]'::jsonb,
  subtotal_items numeric default 0,
  margin_percent numeric default 20,
  margin_amount numeric default 0,
  subtotal_with_margin numeric default 0,
  include_tax boolean default false,
  tax_percent numeric default 21,
  tax_amount numeric default 0,
  discount_percent numeric default 0,
  discount_amount numeric default 0,
  total numeric default 0,
  payment_terms text,
  validity_days integer default 15,
  status text default 'borrador',
  general_notes text,
  updated_at timestamptz not null default now()
);

-- 2. Habilitar seguridad RLS y permitir lectura/escritura pública
alter table public.budgets enable row level security;

create policy "Acceso completo a budgets" 
  on public.budgets 
  for all 
  using (true) 
  with check (true);

-- 3. Tabla opcional de Catálogo de Precios en la nube
create table if not exists public.price_catalog (
  id text primary key,
  category text not null,
  name text not null,
  unit text not null,
  default_price numeric not null,
  description text,
  updated_at timestamptz not null default now()
);

alter table public.price_catalog enable row level security;

create policy "Acceso completo a price_catalog" 
  on public.price_catalog 
  for all 
  using (true) 
  with check (true);
