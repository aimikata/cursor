# Stripe Webhook 連携チェックリスト

**決済完了時に「Day4決済」シートへ自動書き出す**ための設定です。

---

## 前提

- GAS は **スプレッドシートに紐づけた状態**でデプロイされていること
- デプロイURL: `https://script.google.com/macros/s/AKfycbwdL-anRVQF1isl30EapKp3Sr3CVPDKw8mRqev2TNiPvzbl21I9zKngAi7cKBd7iRro/exec`

---

## 1. Stripe で Webhook を登録

### 手順

1. **Stripe ダッシュボード**にログイン  
   https://dashboard.stripe.com/

2. 右上の **テストモード**  ON/OFF を本番に合わせる

3. **開発者** → **Webhook** を開く

4. **エンドポイントを追加** をクリック

5. 以下を入力：
   - **エンドポイントURL**：
     ```
     https://script.google.com/macros/s/AKfycbwdL-anRVQF1isl30EapKp3Sr3CVPDKw8mRqev2TNiPvzbl21I9zKngAi7cKBd7iRro/exec
     ```
   - **説明**（任意）：Day4 決済

6. **イベントを選択** をクリックし、以下にチェック：
   - `checkout.session.completed`
   - `payment_intent.succeeded`

7. **エンドポイントを追加** をクリック

8. **署名シークレットの表示** をクリック → `whsec_` で始まる文字列をコピー

---

## 2. GAS に署名シークレットを設定

1. スプレッドシートを開く → **拡張機能** → **Apps Script**

2. `GAS_新フォーム_整理後.gs` を開く

3. 次の行を探す：
   ```javascript
   const STRIPE_WEBHOOK_SECRET = 'whsec_ob3RD8SgwEDjhY84x3QGTzdau1mrV7J7';
   ```

4. コピーした署名シークレットで **置き換える**：
   ```javascript
   const STRIPE_WEBHOOK_SECRET = 'whsec_ここに貼り付け';
   ```

5. **保存** → **デプロイ** → **デプロイを管理** → 編集 → **新バージョン** → デプロイ

---

## 3. 動作確認

1. **テスト決済**を行う  
   - Day4アンケート → 申込 → 決済ページへ  
   - または決済リンクから直接: https://buy.stripe.com/00wbJ03Vb2g4cBL2X8ffy0e

2. **スプレッドシート**の「Day4決済」シートに1行追加されることを確認

3. **Stripe ダッシュボード** → 開発者 → Webhook → 作成したエンドポイント → **最近のイベント** で送信成功を確認

---

## 4. 不具合時の確認

| 症状 | 確認すること |
|------|--------------|
| 書き出されない | Stripe Webhook にエンドポイントが登録されているか |
| 書き出されない | エンドポイントURL が GAS のデプロイURLと完全一致しているか |
| 書き出されない | リッスンするイベントに `checkout.session.completed` が含まれているか |
| 書き出されない | Stripe → Webhook → 最近のイベント でエラーの有無を確認 |
| 署名エラー | GAS の STRIPE_WEBHOOK_SECRET が Stripe の署名シークレットと一致しているか |

---

## 5. テストモードと本番モード

- **テストモード** と **本番モード** で Webhook は別々に設定が必要
- テスト用と本番用で、それぞれエンドポイントを追加する
