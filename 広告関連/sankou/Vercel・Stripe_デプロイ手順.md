# Vercel ・ Stripe デプロイ手順

---

## 1. Vercel にアップする（PowerShell）

### 一括実行

```powershell
cd F:\AI\manga\cursor
git add public/lp-consultation/index.html public/lp-consultation/index-ebook.html public/lp-consultation/day4-anketo.html public/lp-consultation/ebook.html public/lp-consultation/thank-you.html
git add 広告関連/sankou/
git status
git commit -m "GAS URL更新・Day4空き日程・締め切り対応"
git push origin main
```

※ ブランチが `master` の場合は `git push origin master` に変更

---

### 手順（1つずつ）

```powershell
cd F:\AI\manga\cursor
```

```powershell
git add public/lp-consultation/index.html public/lp-consultation/index-ebook.html public/lp-consultation/day4-anketo.html public/lp-consultation/ebook.html public/lp-consultation/thank-you.html
```

```powershell
git add 広告関連/sankou/
```

```powershell
git status
```

```powershell
git commit -m "GAS URL更新・Day4空き日程・締め切り対応"
```

```powershell
git push origin main
```

---

### 補足

- GitHub と Vercel が連携していれば、`git push` で自動デプロイされます
- デプロイ完了後、本番URLで動作確認してください

---

## 2. Stripe Webhook の設定（必須）

Day4 決済完了時にスプレッドシートへ自動書き出すには、**Stripe の Webhook** で GAS のデプロイURLを登録する必要があります。

### 手順

1. **Stripe ダッシュボード**にログイン  
   https://dashboard.stripe.com/

2. **開発者** → **Webhook** を開く

3. **エンドポイントを追加** をクリック

4. 設定：
   - **エンドポイントURL**：以下を入力
     ```
     https://script.google.com/macros/s/AKfycbwdL-anRVQF1isl30EapKp3Sr3CVPDKw8mRqev2TNiPvzbl21I9zKngAi7cKBd7iRro/exec
     ```
   - **リッスンするイベント**：
     - `checkout.session.completed` （Payment Link 使用時）
     - `payment_intent.succeeded` （両方チェック推奨）

5. **追加** をクリック

6. 表示される **署名シークレット**（`whsec_` で始まる）をコピー

7. **GAS の STRIPE_WEBHOOK_SECRET を更新**：
   - スプレッドシート → 拡張機能 → Apps Script
   - `GAS_新フォーム_整理後.gs` 内の以下を変更：
     ```javascript
     const STRIPE_WEBHOOK_SECRET = 'whsec_ここにコピーした値を貼り付け';
     ```
   - 保存 → **デプロイ** → **デプロイを管理** → 編集 → 新バージョン → デプロイ

---

### 既に Webhook を作成済みの場合

1. Stripe ダッシュボード → **開発者** → **Webhook**
2. 既存のエンドポイントの **詳細** を開く
3. **エンドポイントURL** が上記の GAS URL になっているか確認
4. 異なる場合は **更新** で正しいURLに変更

---

### 動作確認

1. Stripe のテストモードで、決済リンクから少額（例：50円）で決済
2. スプレッドシートの「Day4決済」シートに1行追加されることを確認
3. Stripe ダッシュボード → Webhook → イベントログで、送信成功を確認

---

## 3. チェックリスト

| 項目 | 状態 |
|------|------|
| GAS コードを Apps Script に反映 | ☐ |
| GAS をデプロイ（新バージョン） | ☐ |
| HTML の GAS URL を新しいデプロイURLに変更 | ☐（済） |
| `git push` で Vercel にデプロイ | ☐ |
| Stripe Webhook に GAS URL を登録 | ☐ |
| STRIPE_WEBHOOK_SECRET を GAS に設定 | ☐ |
| Stripe テスト決済で動作確認 | ☐ |

---

## 4. URL 一覧（参考）

| 種類 | URL |
|------|-----|
| **GAS デプロイ** | https://script.google.com/macros/s/AKfycbwdL-anRVQF1isl30EapKp3Sr3CVPDKw8mRqev2TNiPvzbl21I9zKngAi7cKBd7iRro/exec |
| **空き日程取得（テスト用）** | 上記URL + `?action=schedule` |
| **Day4 決済リンク** | https://buy.stripe.com/00wbJ03Vb2g4cBL2X8ffy0e |
