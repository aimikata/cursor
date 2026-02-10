# Pipedream で Stripe → Google Sheets 連携のセットアップ手順

Day4 決済完了時にスプレッドシートへ自動書き出すための設定です。  
GAS の 302 問題を回避できます。

---

## 1. Pipedream アカウント作成

1. https://pipedream.com/ にアクセス
2. **Sign up** で登録（Google アカウントでログイン可能）
3. ダッシュボードにログイン

---

## 2. ワークフロー作成

### ステップ1：新規ワークフロー

1. **Workflows** → **New Workflow** をクリック
2. ワークフロー名を入力（例：Day4決済）

### ステップ2：トリガーを設定

1. **+** ボタン（または「Select a trigger」）をクリック
2. **Stripe** を検索して選択
3. イベントを選択：
   - **Payment Intent Succeeded** または
   - **Checkout Session Completed**
4. **Connect Account** で Stripe アカウントを連携
   - Stripe の API キー（sk_test_ または sk_live_）を入力
   - または OAuth で Stripe にログイン
5. **Save** で保存

### ステップ3：アクションを追加

1. **+** ボタンをクリックしてステップを追加
2. **Google Sheets** を検索して選択
3. **Add Row to Spreadsheet** を選択
4. **Connect Account** で Google アカウントを連携
5. 次のように設定：

| 項目 | 値 |
|------|-----|
| **Spreadsheet** | 対象のスプレッドシートを選択 |
| **Sheet** | Day4決済（なければ作成） |
| **Spreadsheet Row** | 以下をマッピング |

### ステップ4：列のマッピング

**Checkout Session Completed** の場合の例：

| 列（A, B, C...） | 値（ステップ1のデータから） |
|------------------|---------------------------|
| A: 日時 | `{{steps.trigger.event.created}}` または現在時刻 |
| B: 種別 | `Day4決済` |
| C: 金額 | `{{steps.trigger.event.data.object.amount_total}}` ÷ 100 |
| D: 通貨 | `jpy` |
| E: 顧客メール | `{{steps.trigger.event.data.object.customer_details.email}}` |
| F: 顧客名 | `{{steps.trigger.event.data.object.customer_details.name}}` |
| G: 決済ID | `{{steps.trigger.event.data.object.payment_intent}}` |
| H: 商品名 | `Day4 2,980円` |

**Payment Intent Succeeded** の場合：

| 列 | 値 |
|----|-----|
| A: 日時 | `{{steps.trigger.event.created}}` |
| B: 種別 | `Day4決済` |
| C: 金額 | `{{steps.trigger.event.data.object.amount}}` ÷ 100 |
| D: 通貨 | `jpy` |
| E: 顧客メール | `{{steps.trigger.event.data.object.receipt_email}}` |
| F: 顧客名 | （空） |
| G: 決済ID | `{{steps.trigger.event.data.object.id}}` |
| H: 商品名 | `Day4 2,980円` |

※ `÷ 100` は Pipedream の式で `{{steps.trigger.event.data.object.amount / 100}}` のように入力

### ステップ5：Day4 のみに絞る（任意）

2,980円の決済のみを書き出す場合：

1. ステップ2と3の間に **Filter** ステップを追加
2. 条件：`{{steps.trigger.event.data.object.amount_total}}` が `298000` に等しい  
   （または amount が 2980 の場合は 2980 に等しい）

---

## 3. Stripe Webhook を Pipedream に変更

### 3-1. Pipedream の Webhook URL を取得

1. ワークフローの **Trigger** ステップをクリック
2. **Event Source** または **Webhook URL** をコピー  
   （例：`https://eo1234567.m.pipedream.net` のような URL）

### 3-2. Stripe の Webhook エンドポイントを更新

1. Stripe ダッシュボード → **開発者** → **Webhook**
2. 既存の GAS エンドポイント（Day4決済）を **編集** または **削除**
3. **エンドポイントを追加**
4. **エンドポイントURL** に Pipedream の Webhook URL を貼り付け
5. **リッスンするイベント** を選択：
   - `checkout.session.completed`
   - `payment_intent.succeeded`
6. **追加** をクリック

---

## 4. スプレッドシートの準備

**Day4決済** シートに以下のヘッダー行があることを確認：

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| 日時 | 種別 | 金額 | 通貨 | 顧客メール | 顧客名 | 決済ID | 商品名 |

※ 既存の GAS で作成したシートと同じ構成

---

## 5. 動作確認

1. テストモードで少額決済（2,980円）
2. スプレッドシート「Day4決済」に1行追加されるか確認
3. Pipedream の **Event History** でイベントが届いているか確認

---

## 6. Day4申込シートの「決済済」更新について

Pipedream では **Day4決済** への書き出しのみ行います。  
**Day4申込** シートの「決済待ち」→「決済済」更新は、Pipedream の標準機能では難しいため、以下いずれかになります：

- **手動更新**：Day4決済のメールを確認し、該当の Day4申込行を手動で「決済済」に変更
- **Pipedream の Code ステップ**：Google Sheets API で Day4申込 を検索して更新するコードを追加（カスタム実装が必要）

---

## 7. 本番運用時の注意

- **テストモード** と **本番モード** で Stripe の Webhook は別々に設定
- Pipedream の Stripe 接続も、テスト用・本番用で切り替え可能
- 本番運用時は、Stripe の **本番モード** で Webhook エンドポイントを追加し、Pipedream の本番用 URL を登録

---

## 補足：Pipedream の無料枠

- 月間の実行数に制限あり（無料枠）
- Day4 の決済頻度が低ければ、無料枠内で運用可能
