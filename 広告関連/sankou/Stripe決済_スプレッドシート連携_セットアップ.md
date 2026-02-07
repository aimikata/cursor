# Stripe 決済 → スプレッドシート連携 セットアップ手順

2,980円の決済が完了したら、自動でスプレッドシートに書き出すための設定です。

**決済リンク**: https://buy.stripe.com/00wbJ03Vb2g4cBL2X8ffy0e

---

## 仕組み

```
[Day4アンケート] → 決済リンクへ
  ↓
[Stripe Checkout] 顧客が支払い完了
  ↓
[Stripe Webhook] 決済完了イベントをGASのURLにPOST
  ↓
[GAS] 受信 → 「Day4決済」シートに書き出し
```

---

## 1. Stripe で Webhook を設定

1. **Stripe ダッシュボード**にログイン  
   https://dashboard.stripe.com/

2. **開発者** → **Webhook** を開く

3. **エンドポイントを追加** をクリック

4. 設定：
   - **エンドポイントURL**：GASのデプロイURL（後述のステップ4で取得）
   - **リッスンするイベント**：
     - `checkout.session.completed`（Payment Link 使用時）
     - または `payment_intent.succeeded`

5. **追加** をクリック

6. **署名シークレット**をコピー（`whsec_` で始まる文字列）

---

## 2. GAS スクリプトを追加

1. **決済確認シート**を開く  
   https://docs.google.com/spreadsheets/d/1s1La7aQgFJzi7mJnBLWfro7u4XBkWok0Qd91b6viBEQ/edit

2. **拡張機能** → **Apps Script**

3. **新規ファイル**を作成し、`GAS_Stripe決済Webhook.gs` の内容を貼り付け

4. **STRIPE_WEBHOOK_SECRET** に、ステップ1でコピーした署名シークレットを設定  
   ```javascript
   const STRIPE_WEBHOOK_SECRET = 'whsec_実際の値';
   ```

---

## 3. デプロイ

1. **デプロイ** → **新しいデプロイ**

2. **ウェブアプリ** を選択

3. 設定：
   - 実行ユーザー：自分
   - アクセス：全員

4. **デプロイ** 後、表示されるURLをコピー  
   例: `https://script.google.com/macros/s/AKfycbz.../exec`

---

## 4. Stripe の Webhook URL を更新

1. Stripe ダッシュボード → **開発者** → **Webhook**

2. 作成したエンドポイントの **詳細** を開く

3. **エンドポイントURL** に、GASのデプロイURLを入力（未設定の場合）

4. または、新規作成時にGASのURLを入力していた場合はそのまま

---

## 5. 決済リンクにメタデータを渡す（任意）

Day4アンケートのメールと紐づけたい場合、決済リンクのURLにパラメータを追加できます。

Stripe Payment Link の設定で：
- **メタデータ** に `customer_email` などを設定可能
- または、アンケート送信後に **Stripe Checkout Session** をAPIで作成し、メタデータを付与する方法もある

※ シンプルな Payment Link の場合、Webhook の `customer_email` は Stripe の支払い画面で入力されたメールが入ります。

---

## 書き出し先シート

| シート名   | 内容                     |
|-----------|--------------------------|
| **Day4決済** | 日時、金額、顧客メール、決済ID など |

シートが存在しない場合は、GAS が自動で作成します。

---

## テスト方法

1. Stripe のテストモードで、決済リンクから少額（例：50円）で決済

2. スプレッドシートの「Day4決済」シートに1行追加されることを確認

3. Stripe ダッシュボード → Webhook → イベントログで、送信成功の有無を確認

---

## トラブルシューティング

| 問題             | 対処                                   |
|------------------|----------------------------------------|
| 書き出されない   | Webhookのイベントログでエラー内容を確認 |
| 署名エラー       | STRIPE_WEBHOOK_SECRET が正しいか確認    |
| 404エラー        | GASのデプロイURLが正しいか確認          |
