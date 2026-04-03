# page-views-worker

A Cloudflare Worker that tracks page view counts for a website.  
每次文章頁面載入時，透過此 Worker 將點擊數 +1 並儲存至 Cloudflare KV。

---

## 架構

```
文章頁面載入
  → JS fetch POST { slug: "/p/post-name/" }
    → Cloudflare Worker
      → KV.get(slug) → +1 → KV.put(slug, newCount)
      → 回傳 { count: 42 }
  → 更新頁面上的數字
```

---

## 初次設定

### 1. 建立 KV Namespace

Cloudflare Dashboard → Storage & Databases → KV → Create  
名稱填入 `PAGE_VIEWS`，建立後複製 **KV Namespace ID**。

### 2. 設定環境變數

複製 `.env` 範本並填入 KV Namespace ID：

```bash
cp wrangler.toml.example wrangler.toml.example  # 已存在，直接編輯 .env
```

編輯 `.env`：

```
KV_NAMESPACE_ID=貼上你的 KV Namespace ID
```

### 3. 產生 wrangler.toml

```bash
chmod +x setup.sh
./setup.sh
```

執行後會產生 `wrangler.toml`（已加入 `.gitignore`，不會推上 git）。

### 4. 安裝 Wrangler 並登入

```bash
npm install -g wrangler
wrangler login
```

### 5. 部署

```bash
wrangler deploy
```

部署成功後會顯示 Worker URL：

```
https://page-views.YOUR_SUBDOMAIN.workers.dev
```

---

## 更新部署

修改 `src/worker.js` 後，重新執行：

```bash
wrangler deploy
```

---

## 查看點擊數據

Cloudflare Dashboard → Storage & Databases → KV → PAGE_VIEWS → KV Pairs

| Key | Value |
|---|---|
| `/p/the-last-of-us/` | `42` |
| `/p/dune/` | `17` |

---

## 檔案說明

| 檔案 | 說明 | 推上 git |
|---|---|---|
| `src/worker.js` | Worker 主程式 | ✅ |
| `wrangler.toml.example` | wrangler.toml 範本 | ✅ |
| `.gitignore` | Git 忽略設定 | ✅ |
| `.env` | KV Namespace ID（機密） | ❌ |
| `wrangler.toml` | 由 setup.sh 產生 | ❌ |
| `setup.sh` | 產生 wrangler.toml 的腳本 | ❌ |
