-- ============================================================
-- 課金モデル変更マイグレーション (2026-04)
-- 月額/年額サブスク → 初期費用¥30,000 + 成約手数料5%
-- ============================================================

-- profiles.plan の制約を緩和（既存値も保持しつつ新値を許可）
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check
  check (plan in (
    'free',
    'seller_yearly',     -- 新: 年間掲載プラン (¥30,000/年, 最大20艇)
    'seller_monthly',    -- 旧: 互換のため残置
    'seller_premium',    -- 旧: 互換のため残置
    'subsidy'            -- 補助金サポートオプション (¥10,000/月)
  ));

-- orders.product_type の制約を緩和
alter table public.orders drop constraint if exists orders_product_type_check;
alter table public.orders add constraint orders_product_type_check
  check (product_type in (
    'seller_yearly_listing',     -- 新: 年間掲載プラン (¥30,000)
    'commission_5pct',           -- 新: 売買成約手数料 5%
    'subsidy_monthly',           -- 補助金サポート月額 (¥10,000)
    -- 旧プラン（互換性のため残置）
    'subscription_seller_monthly',
    'subscription_seller_yearly',
    'addon_subsidy_monthly',
    'addon_boat_slots',
    'part_purchase',
    'boat_deposit'
  ));

-- 売買エスクロー用の取引テーブル
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  boat_id uuid not null references public.boats(id),
  seller_id uuid not null references auth.users(id),
  buyer_id uuid not null references auth.users(id),

  agreed_price int not null,
  commission_amount int,                    -- 5% (agreed_price * 0.05)
  seller_payout_amount int,                  -- 売り手の手取り

  -- ステータスフロー
  status text not null default 'agreed' check (status in (
    'agreed',         -- 1. 売買合意
    'paid',           -- 2. 買い手から代金受領（エスクロー）
    'reviewing',      -- 3. AI瑕疵チェック中
    'approved',       -- 4. 双方同意完了
    'paid_out',       -- 5. 売り手にお支払い完了
    'cancelled',      -- キャンセル/返金
    'disputed'        -- 異議申立中
  )),

  ai_review_result jsonb,                    -- AIによる瑕疵チェック結果
  ai_review_at timestamptz,
  buyer_approved_at timestamptz,
  seller_approved_at timestamptz,

  paid_at timestamptz,
  paid_out_at timestamptz,

  univapay_charge_id text,
  payout_destination jsonb,                  -- 売り手の振込先（暗号化推奨）

  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_transactions_seller on public.transactions(seller_id, status);
create index if not exists idx_transactions_buyer on public.transactions(buyer_id, status);
create index if not exists idx_transactions_boat on public.transactions(boat_id);

alter table public.transactions enable row level security;

drop policy if exists transactions_party on public.transactions;
create policy transactions_party on public.transactions
  for all using (auth.uid() in (seller_id, buyer_id));

-- 既存の boats テーブルに最大掲載数のカウント用カラム追加
-- (既に存在する場合はスキップ)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'boats' and column_name = 'plan_period_id'
  ) then
    alter table public.boats add column plan_period_id uuid;
  end if;
end $$;
