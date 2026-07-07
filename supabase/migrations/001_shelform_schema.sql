-- ============================================================
-- SHELFORM COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 0. EXTENSIONS
create extension if not exists "pgcrypto";

-- 1. BUSINESSES
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  logo_url text,
  currency text not null default 'USD',
  language text not null default 'en',
  timezone text not null default 'UTC',
  tax_rate numeric(5,2) default 0,
  address text,
  phone text,
  vat_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. PROFILES (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','user')),
  full_name text not null,
  email text not null,
  profile_image_url text,
  phone text,
  language text not null default 'en',
  onboarding_completed boolean not null default false,
  settings jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. CATEGORIES
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  slug text,
  description text default '',
  color text default '#6366f1',
  product_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. SUPPLIERS
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  contact_name text default '',
  email text default '',
  phone text default '',
  address text default '',
  city text default '',
  country text default '',
  status text not null default 'active' check (status in ('active','inactive')),
  product_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. PRODUCTS
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  image text default '',
  name text not null,
  sku text not null,
  barcode text default '',
  category_id uuid references categories(id) on delete set null,
  category_name text default '',
  supplier_id uuid references suppliers(id) on delete set null,
  supplier_name text default '',
  cost_price numeric(10,2) not null default 0,
  selling_price numeric(10,2) not null default 0,
  quantity integer not null default 0,
  reserved_stock integer not null default 0,
  incoming_stock integer not null default 0,
  minimum_stock integer not null default 5,
  maximum_stock integer not null default 100,
  warehouse text default 'Main',
  shelf text default 'A-1',
  status text not null default 'in_stock' check (status in ('in_stock','low_stock','out_of_stock','discontinued')),
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 6. CUSTOMERS
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  email text default '',
  phone text default '',
  company text default '',
  city text default '',
  country text default '',
  total_orders integer not null default 0,
  total_spent numeric(12,2) not null default 0,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

-- 7. ORDERS
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  customer_name text default '',
  customer_email text default '',
  total_amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_method text default 'bank_transfer' check (payment_method in ('credit_card','bank_transfer','cash','paypal','stripe')),
  shipping_address text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. ORDER ITEMS
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text default '',
  quantity integer not null default 1,
  unit_price numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0
);

-- 9. WAREHOUSES
create table if not exists warehouses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  location text default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_profiles_business on profiles(business_id);
create index if not exists idx_products_business on products(business_id);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_supplier on products(supplier_id);
create index if not exists idx_categories_business on categories(business_id);
create index if not exists idx_suppliers_business on suppliers(business_id);
create index if not exists idx_customers_business on customers(business_id);
create index if not exists idx_orders_business on orders(business_id);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_warehouses_business on warehouses(business_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table businesses enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table warehouses enable row level security;

-- BUSINESS: full access for members, owner-only for updates
create policy "Users can view own business"
  on businesses for select
  using (id = public.get_user_business_id());

create policy "Users can insert businesses"
  on businesses for insert
  with check (auth.role() = 'authenticated');

create policy "Owners can update own business"
  on businesses for update
  using (id = public.get_user_business_id() and public.is_business_owner());

create policy "Owners can delete own business"
  on businesses for delete
  using (id = public.get_user_business_id() and public.is_business_owner());

-- PROFILES: users can read own profile or any profile in their business
create policy "Users can view profiles in their business"
  on profiles for select
  using (
    (auth.uid() = id) OR
    (business_id = public.get_user_business_id())
  );

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

-- BUSINESS-OWNED TABLES: users can only access their own business data
create policy "Users can view own business categories"
  on categories for select
  using (business_id = public.get_user_business_id());

create policy "Users can insert own business categories"
  on categories for insert
  with check (business_id = public.get_user_business_id());

create policy "Users can update own business categories"
  on categories for update
  using (business_id = public.get_user_business_id());

create policy "Users can delete own business categories"
  on categories for delete
  using (business_id = public.get_user_business_id());

-- Suppliers
create policy "Users can view own business suppliers"
  on suppliers for select
  using (business_id = public.get_user_business_id());

create policy "Users can insert own business suppliers"
  on suppliers for insert
  with check (business_id = public.get_user_business_id());

create policy "Users can update own business suppliers"
  on suppliers for update
  using (business_id = public.get_user_business_id());

create policy "Users can delete own business suppliers"
  on suppliers for delete
  using (business_id = public.get_user_business_id());

-- Products
create policy "Users can view own business products"
  on products for select
  using (business_id = public.get_user_business_id());

create policy "Users can insert own business products"
  on products for insert
  with check (business_id = public.get_user_business_id());

create policy "Users can update own business products"
  on products for update
  using (business_id = public.get_user_business_id());

create policy "Users can delete own business products"
  on products for delete
  using (business_id = public.get_user_business_id());

-- Customers
create policy "Users can view own business customers"
  on customers for select
  using (business_id = public.get_user_business_id());

create policy "Users can insert own business customers"
  on customers for insert
  with check (business_id = public.get_user_business_id());

create policy "Users can update own business customers"
  on customers for update
  using (business_id = public.get_user_business_id());

create policy "Users can delete own business customers"
  on customers for delete
  using (business_id = public.get_user_business_id());

-- Orders
create policy "Users can view own business orders"
  on orders for select
  using (business_id = public.get_user_business_id());

create policy "Users can insert own business orders"
  on orders for insert
  with check (business_id = public.get_user_business_id());

create policy "Users can update own business orders"
  on orders for update
  using (business_id = public.get_user_business_id());

create policy "Users can delete own business orders"
  on orders for delete
  using (business_id = public.get_user_business_id());

-- Order Items (inherit via order)
create policy "Users can view own business order items"
  on order_items for select
  using (order_id in (select id from orders where business_id = public.get_user_business_id()));

create policy "Users can insert own business order items"
  on order_items for insert
  with check (order_id in (select id from orders where business_id = public.get_user_business_id()));

create policy "Users can delete own business order items"
  on order_items for delete
  using (order_id in (select id from orders where business_id = public.get_user_business_id()));

-- Warehouses
create policy "Users can view own business warehouses"
  on warehouses for select
  using (business_id = public.get_user_business_id());

create policy "Users can insert own business warehouses"
  on warehouses for insert
  with check (business_id = public.get_user_business_id());

create policy "Users can update own business warehouses"
  on warehouses for update
  using (business_id = public.get_user_business_id());

create policy "Users can delete own business warehouses"
  on warehouses for delete
  using (business_id = public.get_user_business_id());

-- ============================================================
-- AUTOMATION FUNCTIONS
-- ============================================================

-- Helper: get business_id bypassing RLS recursion
create or replace function public.get_user_business_id()
returns uuid
language sql
stable
security definer
as $$
  select business_id from profiles where id = auth.uid();
$$;

-- Helper: check if user is owner of their business (bypasses RLS)
create or replace function public.is_business_owner()
returns boolean
language sql
stable
security definer
as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'owner');
$$;

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, business_id, full_name, email, role)
  values (
    new.id,
    (new.raw_user_meta_data->>'business_id')::uuid,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'owner'
  );
  return new;
end;
$$;

-- Trigger after auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_businesses_updated_at
  before update on businesses
  for each row execute function public.update_updated_at();

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function public.update_updated_at();

create trigger update_suppliers_updated_at
  before update on suppliers
  for each row execute function public.update_updated_at();

create trigger update_orders_updated_at
  before update on orders
  for each row execute function public.update_updated_at();
