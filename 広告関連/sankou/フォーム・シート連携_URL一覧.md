# フォーム・シート連携 & URL一覧

**最終更新**：フォーム・シート設計の整理

---

## 1. 決済確認シート（Googleスプレッドシート）

| 項目 | URL / 内容 |
|------|------------|
| **決済確認シート** | https://docs.google.com/spreadsheets/d/1s1La7aQgFJzi7mJnBLWfro7u4XBkWok0Qd91b6viBEQ/edit |
| **LP** | https://kukuru-m.com/manga/ |
| **申込フォーム（GAS）** | https://script.google.com/macros/s/AKfycbyS-v1LEdf8pfUKXMJLzve9rM5K_oHV9A8q3MTjZHIptACe88ckqEr03nH3pvN1QXA7/exec |
| **デプロイ（GAS）** | https://script.google.com/macros/s/AKfycbxmkUKzgvhJKpjf13Rim5-yGhzALsMCG0xf_FU1kotEUKb2n5LB1U-7ifouCqsa4GYR/exec |

※ 上記は kukuru-m.com/manga 用のフォーム・スプレッドシート

---

## 2. 個別相談LPの仕組み

**ファイル**：`public/lp-consultation/index.html`

### フロー（希望日程・後日調整方式・無料）

```
[LP] 個別相談申込（無料）
  ↓
① フォーム入力（名前・メール・電話・希望曜日・希望時間帯・具体的な希望・目標・時間・メッセージ・アンケート）
  ↓
② GASにPOST（JSON）→ シートに書き出し
  ↓
③ 完了メッセージ表示 → thank-you.html を別タブで開く
```

※ タイマー・決済（Stripe）は削除済み。空き日程のカレンダー選択は廃止。

### 前のLPが使っているGAS

| 項目 | 値 |
|------|------|
| **GAS API URL（個別相談・ebook・Day4）** | `https://script.google.com/macros/s/AKfycbxaUEocqoNigeNSDaRxoqgYkoFypeoeKNckIwWa2_zZKI48ZYnRRsHSqdV1M_yeV1Hw/exec` |
| **取得** | GETで空日程（JSON） |
| **送信** | POSTで予約データ（scheduleRow, name, email, phone, goal, time, message, surveyGood, surveyConcern, surveyWant） |

※ **前のLPのGAS** と **決済確認シートの申込フォームGAS** は別のスクリプトです。  
同一シートで管理するには、どちらかのGASを同じスプレッドシートに紐づけるか、1つのGASに統合する必要があります。

---

## 3. 新しいLP（ebookプレゼント）の仕組み

**ファイル**：`public/lp-consultation/index-ebook.html`

### フロー（現状）

```
[LP] ebookプレゼント申込
  ↓
① フォーム送信（メール・名前のみ）
  ↓
② 送信先：未設定（仮で thank-you.html へリダイレクト）
  ↓
③ サンキューページ（動画＋3日間チャレンジ案内）
```

### 設定済み（GAS）

| 項目 | 状態 |
|------|------|
| **フォーム送信先** | GAS（`GAS_ebook登録.gs` をデプロイ後、index-ebook.html の form action にURLを設定） |
| **シート書き出し** | 決済確認シートの「ebook登録」シートに書き出し |
| **セットアップ手順** | `public/lp-consultation/GAS_ebook登録_セットアップ手順.md` 参照 |

---

## 4. 同じシートで管理するには

### 方針A：決済確認シート用GASを拡張する

1. 決済確認シートに紐づくGAS（申込フォーム用）を開く
2. **新しいLP用のエンドポイント**を追加
   - 例：`?action=ebook` でメール・名前を受け取り、別シート（例：「ebook登録」）に書き出す
3. `index-ebook.html` のフォーム送信先を、そのGASのURLに変更

### 方針B：前のLPのGASを決済確認シートに紐づける

1. 前のLPのGAS（AKfycbxZJcRGBK…）が参照しているスプレッドシートを確認
2. 決済確認シートと同じであれば、すでに同じシートで管理済み
3. 異なる場合は、GASのスプレッドシートIDを決済確認シートのIDに変更

### 方針C：1つのGASで両方のLPを処理する

- GET時：`?action=schedule` で空日程を返す
- POST時：`source` パラメータで `consultation` か `ebook` を判別
- 書き出し先：consultation → 決済確認シート、ebook → 決済確認シート内の「ebook登録」シートなど

---

## 5. ステップメールの状況

| 項目 | 状態 |
|------|------|
| **Day1メール** | `Day1_メール本文.md` 作成済み。翌朝9時送信の想定 |
| **Day2・Day3** | 未作成 |
| **自動配信** | 未設定。メール配信ツール（例：配配メール、Benchmark、Mailchimp等）での設定が必要 |
| **トリガー** | LPフォーム送信 → メール配信ツールに登録 → ステップ配信開始 |

### 想定フロー

```
登録（index-ebook.html）
  ↓
メール配信ツールに登録
  ↓
直後：歓迎メール（ebookリンク等）
  ↓
翌朝9時：Day1（『発見』）
  ↓
2日後：Day2（『確信』）
  ↓
3日後：Day3（『感動』）
  ↓
4日後：Day4申し込み案内（day4-anketo.html）
```

---

## 6. URL一覧（サンキューページ・LP・フォーム）

### 本番ドメイン（cursor0113.vercel.app）

| ページ | URL |
|--------|-----|
| **LP（ebook用）** | https://cursor0113.vercel.app/lp-consultation/index-ebook.html |
| **LP（個別相談）** | https://cursor0113.vercel.app/lp-consultation/ または index.html |
| **サンキューページ** | https://cursor0113.vercel.app/lp-consultation/thank-you.html |
| **Day4アンケート** | https://cursor0113.vercel.app/lp-consultation/day4-anketo.html |
| **ebook** | https://cursor0113.vercel.app/lp-consultation/ebook.html |
| **ebook表紙** | https://cursor0113.vercel.app/lp-consultation/ebook-cover.png |

### 外部リンク

| 種類 | URL |
|------|-----|
| **サンキューページ動画** | https://youtu.be/fo90zVEWTNY |
| **特商法** | https://kukuru-m.com/manga/law.html |
| **プライバシーポリシー** | https://kukuru-m.com/manga/pra.html |
| **Day4 2,980円 決済リンク** | https://buy.stripe.com/00wbJ03Vb2g4cBL2X8ffy0e |

※ 決済完了時にスプレッドシートへ書き出すには、Stripe Webhook の設定が必要。`Stripe決済_スプレッドシート連携_セットアップ.md` 参照。

※ 上記リンクは index-ebook.html、index.html、thank-you.html、day4-anketo.html、ebook.html の各ページに設置済み。

### 参照するファイル

| 用途 | ファイル |
|------|----------|
| **URL一覧（簡易）** | `広告素材一覧.md` セクション1 |
| **フォーム・シート詳細** | 本ファイル |
| **Day1メール本文** | `Day1_メール本文.md` |
| **3日間チャレンジ設計** | `3日間チャレンジ_スケジュール.md` |

---

## 7. 今後の作業（優先順位）

1. **index-ebook.html** のフォーム送信先を GAS またはメール配信ツールに設定
2. **同一シート管理**：GASを決済確認シートに紐づけ、ebook登録も同じスプレッドシートに書き出す
3. **ステップメール**：メール配信ツールで登録→Day1〜Day3の自動配信を設定
4. **day4-anketo.html** の送信先を設定（GAS or メール配信ツール）

---

## 8. Day4＝2,980円変更に伴う更新チェックリスト

**登録元**：`index-ebook.html` → 送信先未設定のため、現状は**データはどこにも書き込まれていません**。

### 現状の流れと更新が必要な箇所

| 段階 | 現状 | Day4変更での更新要否 |
|------|------|----------------------|
| **① フォーム送信** | `index-ebook.html` → 送信先未設定。thank-you.htmlへリダイレクトのみ | 送信先の設定が必要（GAS or メール配信ツール） |
| **② スプレッドシート** | 書き出しなし | GASで「ebook登録」シート等に書き出す設定が必要 |
| **③ 歓迎メール（直後）** | 未設定 | 設定する場合、Day4が2,980円・マンガ1冊持ち帰りである旨を記載 |
| **④ Day1〜Day3メール** | Day1本文は更新済み（2,980円・マンガ1冊） | Day2・Day3作成時も同様にDay4＝2,980円で統一 |
| **⑤ 4日後：Day4案内** | day4-anketo.html へのリンク | アンケートページの文言は2,980円に更新済み |
| **⑥ Day4アンケート送信** | 送信先未設定 | 同様にGAS等への送信設定が必要 |

### スプレッドシート・自動返信で変更が必要なもの

- **歓迎メール**（登録直後に送る場合）：Day4が「2,980円の実体験」「マンガ1冊持ち帰り」である旨を記載
- **GASの自動返信**（設定している場合）：上記と同様
- **メール配信ツールのテンプレート**：Day4関連の文言を「無料」→「2,980円」に統一

### すでに更新済み

- サンキューページ（thank-you.html）
- Day4アンケート（day4-anketo.html）のタイトル・見出し
- Day1メール本文
- 各種ドキュメント（スケジュール、ナレーション全文等）
