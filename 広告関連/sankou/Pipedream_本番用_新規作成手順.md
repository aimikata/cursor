# Pipedream 本番用 新規作成手順

既存を削除し、本番用だけで最初から作り直す手順です。

---

## 1. 既存の削除

### 1-1. Stripe の Webhook を削除

1. Stripe ダッシュボード → **本番モード**
2. **開発者** → **Webhook**
3. Pipedream の URL（`https://5a6173445458cf52daf8a8ab63c70977.m.pipedream.net`）が登録されているエンドポイントを探す
4. **⋮** → **削除**

### 1-2. Stripe のテストモード Webhook（あれば）

1. Stripe を **テストモード** に切り替え
2. 同上で Pipedream の URL のエンドポイントを削除

### 1-3. Pipedream のワークフローを削除

1. Pipedream → **Projects**
2. 「Stripe Checkout to Google Sheets」の **⋮** → **Delete**

### 1-4. Pipedream の Source を削除

1. Pipedream → **Sources**
2. 「string-69880f4d75d7fbdb757ce806-trigger」を開く
3. トグルを **OFF**（Deactivate）にする
4. **⋮** や設定から **Delete** を実行（Source の削除オプションがあれば）

※ ワークフローを削除すると、紐づく Source が無効になる場合があります。Source 単体の削除ができない場合は、ワークフロー削除のみでよい場合もあります。

---

## 2. 新規作成（本番用のみ）

### 2-1. Accounts の確認

- **Stripe (Day4本番用)** が接続されていること（`sk_live_`）
- テスト用の接続は不要

### 2-2. 新規ワークフロー作成

1. Pipedream → **Projects** → **「+ New workflow」**
2. プロンプト欄に以下を入力：

```
Stripe の checkout.session.completed イベントを受け取り、
Google スプレッドシート「決済確認シート」に
決済金額・顧客メール・日付を追加するワークフローを作成して。
本番用の Stripe 接続（Day4本番用）を使ってください。
```

3. **計画を承認して開始** をクリック

### 2-3. 設定時のポイント

- **Stripe 接続**：必ず **「Day4本番用」** を選択
- **Google Sheets**：対象のスプレッドシート・シートを選択
- **Deploy** で有効化

### 2-4. Stripe Webhook について

- 新規ワークフローでは、Activate 時に Pipedream が **自動で Stripe に Webhook を登録**します
- 手動で Stripe に URL を登録する必要は **ありません**

---

## 3. 動作確認

1. 本番決済を 1 件実行
2. 決済確認シートに行が追加されるか確認

---

## 4. うまくいかない場合

- 1日2名程度なら **手動で Stripe から確認** する運用で十分
- 規模が増えたタイミングで再検討
