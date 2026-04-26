# イイフネ🚢.com — 中古船売買AIサポートサイト

ココナラ風シンプルUI + AIオーケストレーション + 電子契約 + EC機能を備えた中古船売買マーケットプレイスです。
**Next.js 15 + Supabase + Vercel** で動作し、Git push だけで本番デプロイできます。

---

## 主な機能

### 売り手向け
- 月額 ¥3,000 / 年額 ¥30,000（5隻まで掲載）
- +¥10,000 で 10隻ずつ追加掲載枠
- AI登録支援（自然言語で話すだけで出品データ作成）
- 電子契約（Canvas手書き署名 + トークンURL）
- ZOOM見学予約・身分証チェック
- 中古船登録（動画アップ可能）・パーツ売り場
- +月額¥10,000 で補助金・助成金サポート

### 買い手向け
- 完全無料で全機能利用可
- 「探しています」投稿（予算・サイズ・時期で）
- 匿名チャット → 双方合意で本名公開
- 電子サイン・プレミアム情報閲覧
- +月額¥10,000 で補助金・助成金サポート

### 自動化（AIオーケストレーション）
| エージェント | 役割 | 起動タイミング |
|---|---|---|
| **Orchestrator** | ユーザー意図を分類して各エージェントに振り分け | チャット入力時 |
| **Registrar** | 自然言語から出品ドラフトを作成 | 司令塔から呼出 |
| **Article Writer** | SEO記事と紹介文を自動生成 | 出品公開時 / 毎日3時 cron |
| **Matcher** | 買い手条件と船をスコアリング | チャット検索時 |
| **SNS Poster** | Twitter/Facebookに自動投稿 | 12時・18時 cron |
| **Sales Emailer** | マリーナ等へ営業メールを自動送信 | 月水金9時 cron |
| **SEO Improver** | 直帰率の高いページをAIで書き直し | 毎週日曜4時 cron |

---

## アーキテクチャ

```
[ユーザー]
   │
   ├─ Web (Next.js 15 / Vercel)
   │     ├─ ランディング・検索・船詳細
   │     ├─ ダッシュボード・出品フォーム
   │     ├─ AIチャット FAB（全画面常駐）
   │     ├─ 署名URL（/sign/[token]）
   │     └─ Server Actions / API Routes
   │
   ├─ Supabase
   │     ├─ Auth（Magic Link）
   │     ├─ Postgres（17テーブル + RLS）
   │     └─ Storage（画像・動画・契約PDF・身分証）
   │
   ├─ AI
   │     ├─ Anthropic Claude（司令塔・記事・営業文）
   │     └─ OpenAI（オプション：画像解析・埋込）
   │
   ├─ UnivaPay
   │     ├─ Widget（サブスク・追加枠購入）
   │     └─ Webhook（決済結果でプラン更新）
   │
   ├─ Resend（メール送信）
   │
   └─ Vercel Cron（自動SEO・SNS・営業メール）
```

---

## セットアップ手順

### 1. リポジトリ準備

```bash
cd boat-market
git init
git add .
git commit -m "initial: 中古船マーケット"
```

### 2. Supabase プロジェクト作成

1. https://supabase.com で新規プロジェクト作成
2. **SQL Editor** で次を順番に実行
   - `supabase/schema.sql`（全テーブル + RLS）
   - `supabase/functions.sql`（カウンター関数）
3. **Storage** で次のバケットを作成
   - `boats` （public）
   - `parts` （public）
   - `videos` （public）
   - `avatars` （public）
   - `contracts` （private）
   - `id-docs` （private）
4. **Authentication > URL Configuration** で
   - Site URL: `http://localhost:3000` （開発時）→ 本番では Vercel ドメイン
   - Redirect URLs に `https://your-domain.vercel.app/auth/callback` を追加

### 3. 各サービスのキー取得

| サービス | 取得するもの |
|---|---|
| Supabase | URL / anon key / service_role key |
| Anthropic | `sk-ant-...` |
| OpenAI（任意） | `sk-...` |
| UnivaPay | アプリトークン / シークレットトークン |
| Resend | API Key + 送信元ドメイン認証 |
| Twitter（任意） | API v2 Bearer / Consumer / Access |
| Facebook（任意） | Page Access Token |

### 4. 環境変数を設定

`.env.example` を `.env.local` にコピーして埋めます。

### 5. ローカル起動

```bash
npm install
npm run dev
```
→ http://localhost:3000

### 6. Vercel にデプロイ

```bash
# GitHub に push
git remote add origin git@github.com:YOUR/boat-market.git
git push -u origin main
```

1. Vercel ダッシュボードで GitHub リポジトリを Import
2. **Settings → Environment Variables** に `.env.local` の中身をすべて投入
3. Deploy → 自動で URL 発行
4. Supabase の **Site URL / Redirect URL** を本番ドメインに更新

### 7. Cron の有効化

`vercel.json` ですでに4つの Cron が定義されています（Vercel Pro 以上で動作）:

```json
{
  "crons": [
    { "path": "/api/cron/seo",          "schedule": "0 3 * * *"     },
    { "path": "/api/cron/sales-email",  "schedule": "0 9 * * 1,3,5" },
    { "path": "/api/cron/sns",          "schedule": "0 12,18 * * *" },
    { "path": "/api/cron/seo-improve",  "schedule": "0 4 * * 0"     }
  ]
}
```

Vercel Hobby の場合は別途 [Upstash QStash](https://upstash.com/docs/qstash/overall/getstarted) や GitHub Actions の cron で代替できます。

### 8. UnivaPay の Webhook 設定

UnivaPay 管理画面で:
- Webhook URL: `https://your-domain.vercel.app/api/webhook/univapay`
- カスタムヘッダー: `X-Webhook-Secret: <UNIVAPAY_WEBHOOK_SECRET>`
- イベント: `charge.successful`, `charge.failed`, `subscription.canceled`

---

## ディレクトリ構成

```
boat-market/
├── app/
│   ├── layout.tsx                  # ルートレイアウト（ヘッダー/AIチャット常駐）
│   ├── page.tsx                    # ランディング
│   ├── globals.css
│   ├── boats/
│   │   ├── page.tsx                # 検索・一覧
│   │   └── [id]/page.tsx           # 詳細
│   ├── parts/page.tsx              # パーツ一覧
│   ├── wanted/page.tsx             # 「探しています」一覧
│   ├── pricing/page.tsx            # 料金プラン（UnivaPay起動）
│   ├── contracts/page.tsx          # 電子契約一覧+作成
│   ├── chat/[room]/page.tsx        # 匿名チャット（Realtime）
│   ├── dashboard/
│   │   ├── page.tsx                # マイページ
│   │   ├── boats/
│   │   │   ├── new/page.tsx        # 新規出品
│   │   │   ├── [id]/edit/page.tsx  # 編集
│   │   │   └── actions.ts
│   │   ├── parts/new/page.tsx      # パーツ出品
│   │   ├── wanted/new/page.tsx     # 探しています投稿
│   │   ├── viewings/new/page.tsx   # ZOOM見学予約
│   │   └── verify/page.tsx         # 身分証アップロード
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   ├── sign/[token]/               # 認証不要・トークン署名
│   └── api/
│       ├── ai/orchestrate/         # AIチャット
│       ├── chat/start/             # チャットルーム作成
│       ├── contract/sign/          # 署名保存
│       ├── analytics/              # アクセス計測
│       ├── webhook/univapay/       # 課金Webhook
│       └── cron/{seo,sns,sales-email,seo-improve}/
├── components/
│   ├── ai/ai-chat-widget.tsx       # 司令塔チャットFAB
│   ├── chat/chat-thread.tsx        # Realtime購読チャット
│   ├── contract/
│   │   ├── signature-canvas.tsx    # Canvas手書き署名
│   │   ├── contract-create-button.tsx
│   │   └── copy-link.tsx
│   └── marketplace/
│       ├── header.tsx, footer.tsx
│       ├── boat-card.tsx, category-tile.tsx
│       ├── boat-form.tsx           # 出品/編集フォーム（画像/動画アップ）
│       ├── wanted-form.tsx
│       └── contact-cta.tsx
├── lib/
│   ├── supabase/{client,server,service}.ts
│   ├── utils.ts
│   └── ai/
│       ├── orchestrator.ts                  # 司令塔
│       └── agents/
│           ├── registrar.ts                 # 出品支援
│           ├── article-writer.ts            # SEO記事生成
│           ├── matcher.ts                   # マッチング
│           ├── sns-poster.ts                # SNS投稿
│           ├── sales-emailer.ts             # 営業メール
│           └── seo-improver.ts              # コンテンツ改善
├── supabase/
│   ├── schema.sql                  # 17テーブル + RLS
│   └── functions.sql               # カウンタ関数
├── public/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── vercel.json                     # Cron定義
└── .env.example
```

---

## 主要テーブル

| テーブル | 用途 |
|---|---|
| `profiles` | ユーザー（buyer/seller/admin）+ プラン状態 |
| `boats` | 出品中の船（動画URL含む）+ AI生成記事 |
| `parts_listings` | パーツ販売 |
| `wanted_posts` | 「探しています」投稿（買い手側）|
| `chat_rooms` / `chat_messages` | 匿名チャット（合意で公開） |
| `viewing_appointments` | ZOOM見学予約 |
| `contracts` / `contract_templates` | 電子契約 + トークン署名URL |
| `orders` | サブスク・追加枠・パーツ購入 |
| `ai_jobs` | エージェント実行履歴・再現用 |
| `seo_articles` | AI生成SEO記事 |
| `sns_posts` | SNS投稿履歴 |
| `sales_email_targets` / `sales_email_logs` | 営業メールリストと送信履歴 |
| `page_analytics` | アクセス計測（自動改善のインプット） |
| `favorites` | お気に入り |

すべて RLS 有効。AI関連テーブル（`ai_jobs`, `sales_email_*`）は Service Role からのみ書込可。

---

## 拡張ポイント

すぐに伸ばせる場所:

- **PDF生成**: 署名済み契約書を `pdf` スキルで PDF 化して `signed_pdf_url` に保存
- **動画自動文字起こし**: 出品動画を Whisper で文字起こし → 紹介文に活用
- **画像AI解析**: アップロード画像から船種・装備を OpenAI Vision で抽出
- **マリーナ DB の整備**: `sales_email_targets` を地域別マリーナ・整備工場でシード
- **LINE 通知**: 「LINE Harness」で公式LINE経由のチャット連携
- **多言語化**: 海外バイヤー向けに英語化（next-intl）

---

## ライセンス・注意事項

- 営業メール機能は**特定電子メール法・特定商取引法**を順守してください。事前同意のない無差別大量送信は違法リスクがあります。配信停止リンクは必ず文末に。
- 電子契約の法的有効性は**電子署名法**の要件確認をおすすめします。タイムスタンプ・本人性確認の追加で実用性が上がります。
- 身分証画像（`id-docs`）は厳重に管理。閲覧は管理者のみ・ログを残してください。

---

## 開発メモ

```bash
# 型チェック
npm run typecheck

# 本番ビルドのローカル確認
npm run build && npm start
```

良い航海を！🚤
