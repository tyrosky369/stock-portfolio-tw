# 台美股資產儀表板

台灣與美國股票庫存現值統計 Web 應用程式。

## 技術規格

- Next.js 14 App Router + TypeScript + Tailwind CSS
- PostgreSQL + Prisma 7 ORM
- 股價來源：Yahoo Finance（`yahoo-finance2`）
- 圖表：Recharts

## 本地開發設定

### 1. 啟動 PostgreSQL

```bash
# 用 Docker 啟動
docker run -d \
  --name stock-portfolio-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stock_portfolio \
  -p 5432:5432 \
  postgres:16
```

### 2. 設定環境變數

`.env.local` 已建立，預設值：
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stock_portfolio?schema=public"
```

### 3. 執行資料庫 Migration

```bash
npx prisma migrate dev --name init
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 http://localhost:3000

## 頁面

| 路徑 | 功能 |
|------|------|
| `/` | 儀表板：總市值、圓餅圖、趨勢折線圖 |
| `/tw-stocks` | 台股庫存管理 |
| `/us-stocks` | 美股庫存管理 |

## API 路由

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/holdings?market=TW\|US` | 取得持股列表（含最新股價） |
| POST | `/api/holdings` | 新增持股 |
| DELETE | `/api/holdings/[id]` | 刪除持股 |
| POST | `/api/prices/refresh` | 更新現價（body: `{ market: "TW"\|"US" }`） |
| GET | `/api/portfolio/summary` | 儀表板摘要 |
| GET | `/api/portfolio/snapshots` | 趨勢圖歷史資料 |

## 部署（Vercel + Supabase）

1. 在 [Supabase](https://supabase.com) 建立���費 PostgreSQL
2. 複製 connection string → 設定 Vercel 環境變數 `DATABASE_URL`
3. `git push` → Vercel 自動部署
