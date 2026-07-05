-- ============================================================
-- STOCK MOVEMENTS LEDGER
-- Tracks every individual stock add/remove action for audit trail
-- ============================================================

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  delta integer not null,
  quantity_before integer not null default 0,
  quantity_after integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_stock_movements_product on stock_movements(product_id);
create index if not exists idx_stock_movements_created on stock_movements(created_at desc);

alter table stock_movements enable row level security;

create policy "Users can view own business stock movements"
  on stock_movements for select
  using (
    product_id in (
      select id from products
      where business_id = public.get_user_business_id()
    )
  );

create policy "Users can insert own business stock movements"
  on stock_movements for insert
  with check (
    product_id in (
      select id from products
      where business_id = public.get_user_business_id()
    )
  );
