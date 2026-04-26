-- ============================================================
-- 中古船マーケット 完全スキーマ
-- Supabase SQL Editor で全文実行してください
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. プロフィール（auth.users と1:1）
-- ============================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'buyer' check (role in ('buyer','seller','admin')),
  display_name text,
  company_name text,
  phone text,
  email text,
  avatar_url text,
  bio text,
  -- 身分証チェック
  id_verified boolean default false,
  id_verified_at timestamptz,
  id_doc_url text,         -- ストレージ参照（管理者のみ閲覧）
  -- サブスクリプション状態
  plan text default 'free' check (plan in ('free','seller_monthly','seller_yearly','seller_premium')),
  plan_started_at timestamptz,
  plan_expires_at timestamptz,
  subsidy_addon boolean default false,    -- 補助金サポート月額1万
  boat_slot_extra int default 0,          -- 追加船枠（10隻ごと+1万）
  -- メタ
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. 船（中古船）出品
-- ============================================================
create table if not exists public.boats (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  -- 基本情報
  title text not null,
  brand text,
  model text,
  year int,
  length_ft numeric,         -- フィート
  hull_material text,         -- FRP, アルミ, 木造 etc.
  engine_type text,           -- 船外機, 船内機, 船内外機
  engine_hours int,
  fuel_type text,
  -- 場所・取引
  location_pref text,         -- 都道府県
  location_city text,
  price int not null,
  negotiable boolean default true,
  -- メディア
  cover_image_url text,
  images jsonb default '[]'::jsonb,    -- [{url, caption}]
  video_url text,
  -- 説明・装備
  description text,
  features jsonb default '[]'::jsonb,   -- ["GPS", "魚群探知機", ...]
  ai_generated_article text,            -- AI記事
  ai_seo_keywords text[],
  -- ステータス
  status text not null default 'draft' check (status in ('draft','published','reserved','sold','archived')),
  is_premium boolean default false,
  -- SNS自動投稿管理
  sns_posted_at timestamptz,
  sns_post_count int default 0,
  -- アナリティクス
  view_count int default 0,
  favorite_count int default 0,
  inquiry_count int default 0,
  -- 検索
  search_text tsvector,
  -- メタ
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

create index if not exists idx_boats_status on public.boats(status);
create index if not exists idx_boats_price on public.boats(price);
create index if not exists idx_boats_pref on public.boats(location_pref);
create index if not exists idx_boats_search on public.boats using gin(search_text);

-- 検索用tsvector自動更新
create or replace function public.boats_search_trigger() returns trigger as $$
begin
  new.search_text :=
    setweight(to_tsvector('simple', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.brand,'') || ' ' || coalesce(new.model,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description,'')), 'C');
  new.updated_at := now();
  return new;
end
$$ language plpgsql;

drop trigger if exists trg_boats_search on public.boats;
create trigger trg_boats_search before insert or update on public.boats
  for each row execute function public.boats_search_trigger();

-- ============================================================
-- 3. パーツ売ります
-- ============================================================
create table if not exists public.parts_listings (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,            -- エンジン, GPS, 船体パーツ, 他
  condition text,           -- 新品, 中古良好, 中古難あり
  price int not null,
  description text,
  images jsonb default '[]'::jsonb,
  status text default 'published' check (status in ('published','sold','archived')),
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 4. 探しています投稿（買い手側）
-- ============================================================
create table if not exists public.wanted_posts (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  budget_min int,
  budget_max int,
  size_min_ft numeric,
  size_max_ft numeric,
  preferred_period text,    -- "3ヶ月以内", "今年中" など
  preferred_pref text[],    -- 希望都道府県
  status text default 'open' check (status in ('open','closed','matched')),
  ai_match_score jsonb default '{}'::jsonb,   -- 船ID→マッチ度
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 5. 匿名チャット
-- ============================================================
create table if not exists public.chat_rooms (
  id uuid primary key default uuid_generate_v4(),
  boat_id uuid references public.boats(id) on delete set null,
  wanted_id uuid references public.wanted_posts(id) on delete set null,
  buyer_id uuid not null references auth.users(id),
  seller_id uuid not null references auth.users(id),
  -- 匿名表示用ハンドル
  buyer_handle text default 'お客様A',
  seller_handle text default '出品者B',
  is_revealed boolean default false,    -- 双方が本名公開に同意したらtrue
  status text default 'active' check (status in ('active','closed')),
  created_at timestamptz default now(),
  last_message_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  body text,
  attachment_url text,
  is_system boolean default false,    -- AIアシスタント発言
  read_by jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_chat_messages_room on public.chat_messages(room_id, created_at);

-- ============================================================
-- 6. ZOOM見学予約
-- ============================================================
create table if not exists public.viewing_appointments (
  id uuid primary key default uuid_generate_v4(),
  boat_id uuid not null references public.boats(id),
  buyer_id uuid not null references auth.users(id),
  seller_id uuid not null references auth.users(id),
  scheduled_at timestamptz not null,
  duration_min int default 30,
  zoom_url text,
  zoom_meeting_id text,
  status text default 'pending' check (status in ('pending','confirmed','done','cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- 7. 電子契約（電子サインスキル準拠）
-- ============================================================
create table if not exists public.contracts (
  id uuid primary key default uuid_generate_v4(),
  boat_id uuid references public.boats(id),
  seller_id uuid not null references auth.users(id),
  buyer_id uuid not null references auth.users(id),
  contract_title text not null,
  contract_content text,
  status text default 'pending' check (status in ('pending','signed','cancelled')),
  buyer_signed_at timestamptz,
  buyer_signature text,        -- base64 PNG
  seller_signed_at timestamptz,
  seller_signature text,
  signed_pdf_url text,
  sign_token text unique default gen_random_uuid()::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.contract_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  content text not null,
  category text,
  created_at timestamptz default now()
);

-- ============================================================
-- 8. 注文・決済（EC + サブスク）
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  -- 対象
  product_type text not null check (product_type in (
    'subscription_seller_monthly','subscription_seller_yearly',
    'addon_subsidy_monthly','addon_boat_slots','part_purchase','boat_deposit'
  )),
  product_ref_id uuid,    -- パーツID等
  amount int not null,
  currency text default 'jpy',
  status text default 'pending' check (status in ('pending','paid','failed','refunded','cancelled')),
  -- UnivaPay
  univapay_charge_id text,
  univapay_subscription_id text,
  metadata jsonb default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_orders_user on public.orders(user_id, status);

-- ============================================================
-- 9. AI関連：ジョブキュー、生成記事、自動改善ログ
-- ============================================================
create table if not exists public.ai_jobs (
  id uuid primary key default uuid_generate_v4(),
  -- どのエージェントが何をするか
  agent text not null check (agent in (
    'orchestrator','registrar','article_writer','sns_poster','sales_emailer','seo_improver','matcher'
  )),
  task text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','running','done','failed')),
  result jsonb,
  error text,
  parent_job_id uuid references public.ai_jobs(id),
  created_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists idx_ai_jobs_status on public.ai_jobs(status, created_at);

create table if not exists public.seo_articles (
  id uuid primary key default uuid_generate_v4(),
  boat_id uuid references public.boats(id) on delete cascade,
  slug text unique not null,
  title text not null,
  content_md text,
  meta_description text,
  keywords text[],
  view_count int default 0,
  -- 改善履歴
  ai_improvement_history jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sns_posts (
  id uuid primary key default uuid_generate_v4(),
  boat_id uuid references public.boats(id) on delete cascade,
  platform text not null check (platform in ('twitter','facebook','instagram')),
  content text not null,
  media_url text,
  posted_at timestamptz default now(),
  external_id text,
  metrics jsonb default '{}'::jsonb     -- いいね、リツイート等
);

create table if not exists public.sales_email_targets (
  id uuid primary key default uuid_generate_v4(),
  business_name text not null,
  email text not null,
  category text,                -- マリーナ, 釣具店, 船舶整備工場 など
  pref text,
  source text,                  -- どこから取得したか
  status text default 'active' check (status in ('active','paused','unsubscribed','bounced')),
  last_emailed_at timestamptz,
  email_count int default 0,
  created_at timestamptz default now()
);

create table if not exists public.sales_email_logs (
  id uuid primary key default uuid_generate_v4(),
  target_id uuid references public.sales_email_targets(id),
  subject text,
  body text,
  sent_at timestamptz default now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  replied boolean default false
);

-- ============================================================
-- 10. アクセス分析（自動コンテンツ改善用）
-- ============================================================
create table if not exists public.page_analytics (
  id uuid primary key default uuid_generate_v4(),
  path text not null,
  boat_id uuid references public.boats(id) on delete cascade,
  visited_at timestamptz default now(),
  referrer text,
  user_agent text,
  session_id text,
  bounce boolean default false,
  duration_sec int
);

create index if not exists idx_analytics_path on public.page_analytics(path, visited_at desc);

-- ============================================================
-- 11. お気に入り
-- ============================================================
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  boat_id uuid not null references public.boats(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, boat_id)
);

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.boats enable row level security;
alter table public.parts_listings enable row level security;
alter table public.wanted_posts enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;
alter table public.viewing_appointments enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_templates enable row level security;
alter table public.orders enable row level security;
alter table public.ai_jobs enable row level security;
alter table public.seo_articles enable row level security;
alter table public.sns_posts enable row level security;
alter table public.sales_email_targets enable row level security;
alter table public.sales_email_logs enable row level security;
alter table public.page_analytics enable row level security;
alter table public.favorites enable row level security;

-- profiles
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = user_id or true);  -- 公開プロフィールは誰でも閲覧
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = user_id);
drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
  for insert with check (auth.uid() = user_id);

-- boats
drop policy if exists boats_public_select on public.boats;
create policy boats_public_select on public.boats
  for select using (status = 'published' or seller_id = auth.uid());
drop policy if exists boats_seller_all on public.boats;
create policy boats_seller_all on public.boats
  for all using (seller_id = auth.uid());

-- parts_listings (boatsと同じ)
drop policy if exists parts_public_select on public.parts_listings;
create policy parts_public_select on public.parts_listings
  for select using (status = 'published' or seller_id = auth.uid());
drop policy if exists parts_seller_all on public.parts_listings;
create policy parts_seller_all on public.parts_listings
  for all using (seller_id = auth.uid());

-- wanted_posts
drop policy if exists wanted_public_select on public.wanted_posts;
create policy wanted_public_select on public.wanted_posts
  for select using (status = 'open' or buyer_id = auth.uid());
drop policy if exists wanted_buyer_all on public.wanted_posts;
create policy wanted_buyer_all on public.wanted_posts
  for all using (buyer_id = auth.uid());

-- chat_rooms / messages
drop policy if exists rooms_party on public.chat_rooms;
create policy rooms_party on public.chat_rooms
  for all using (auth.uid() = buyer_id or auth.uid() = seller_id);
drop policy if exists messages_party on public.chat_messages;
create policy messages_party on public.chat_messages
  for select using (
    exists (select 1 from public.chat_rooms r where r.id = room_id
            and (r.buyer_id = auth.uid() or r.seller_id = auth.uid()))
  );
drop policy if exists messages_insert on public.chat_messages;
create policy messages_insert on public.chat_messages
  for insert with check (sender_id = auth.uid());

-- viewing_appointments
drop policy if exists view_party on public.viewing_appointments;
create policy view_party on public.viewing_appointments
  for all using (auth.uid() in (buyer_id, seller_id));

-- contracts
drop policy if exists contracts_party on public.contracts;
create policy contracts_party on public.contracts
  for all using (auth.uid() in (buyer_id, seller_id));

-- contract_templates 全員閲覧
drop policy if exists templates_read on public.contract_templates;
create policy templates_read on public.contract_templates for select using (true);

-- orders
drop policy if exists orders_self on public.orders;
create policy orders_self on public.orders
  for all using (user_id = auth.uid());

-- favorites
drop policy if exists fav_self on public.favorites;
create policy fav_self on public.favorites
  for all using (user_id = auth.uid());

-- ai_jobs / seo_articles / sns_posts / sales_email_*: サーバー専用なのでRLS厳格
-- （クライアントからは触らせず、Service Roleキーでサーバーから操作）
drop policy if exists ai_jobs_admin on public.ai_jobs;
create policy ai_jobs_admin on public.ai_jobs for all using (false);
drop policy if exists seo_public on public.seo_articles;
create policy seo_public on public.seo_articles for select using (true);
drop policy if exists sns_public on public.sns_posts;
create policy sns_public on public.sns_posts for select using (true);

-- ============================================================
-- ストレージバケット
-- ============================================================
-- 以下を Supabase Dashboard > Storage で作成してください:
--   boats         (public)
--   parts         (public)
--   contracts     (private)
--   id-docs       (private)
--   videos        (public)
--   avatars       (public)

-- ============================================================
-- 初期データ（契約書ひな形）
-- ============================================================
insert into public.contract_templates (name, content, category) values
('中古船売買基本契約書', E'中古船売買契約書\n\n甲：{{seller_name}}（売主）\n乙：{{buyer_name}}（買主）\n\n甲乙は次の条項に基づき、下記の中古船舶を甲が乙に売り渡すことを契約する。\n\n第1条（目的物）\n船名：{{boat_title}}\nメーカー：{{brand}}\n年式：{{year}}年\n船体材質：{{hull_material}}\n\n第2条（売買代金）\n売買代金 金{{price}}円（消費税込）\n\n第3条（支払い条件）\n本契約締結時に手付金を、引渡時に残金を支払うものとする。\n\n第4条（引渡し）\n甲は乙に対し、{{delivery_date}}までに目的物を引き渡すものとする。\n\n第5条（瑕疵）\n引渡後30日以内に発見された重大な瑕疵については甲が責任を負う。\n\n以上、本契約の成立を証するため双方署名する。\n\n{{today}}\n\n甲：印\n乙：', 'sale')
on conflict do nothing;
