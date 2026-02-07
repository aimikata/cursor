# GAS スクリプト 整理方針

**対象プロジェクト**: [Apps Script](https://script.google.com/u/0/home/projects/1_nh8sbg-ev6AcgoephesnW65Wn468DzNHF1FVK3TaSULmC_B9Ye7SerB/edit)

プロジェクト内の4ファイルを確認済み。現在のフォーム・導線に合わせた整理方針です。

---

## 1. プロジェクト内の4ファイル（現状）

| ファイル | 役割 | 判定 |
|----------|------|------|
| **appsscript.json** | 設定（タイムゾーン、スコープ、ウェブアプリ） | 維持 |
| **コード.gs** | doGet_old / doPost_old（未使用）、processForm（日程選択式）、1,100円Stripeリンク | **削除 or 整理** |
| **Stripe_Webhook.gs** | 旧1,100円決済のWebhook（plink_1SgF65..., 申込者シート、サンキューメール） | **削除可** |
| **新フォーム.gs** | doGet / doPost（実際のエントリポイント）、日程選択式、空き日程→決済確認シート | **要更新** |

※ **ebook登録用のGASはプロジェクト内にまだ無い**（index-ebook.html の送信先は未設定の可能性）

---

## 2. 現状の整理

### 新フォーム.gs がメインのエントリポイント

- `doGet`：空き日程取得（希望日程方式では不要）
- `doPost`：`scheduleRow` 使用の日程選択式 → **index.html と不整合**（index.html は希望日程方式に変更済み）

### コード.gs は未使用

- `doGet_old` / `doPost_old` という名前のため、GAS のエントリポイントとして認識されない
- 新フォーム.gs の doGet / doPost だけが有効

### シート参照の違い

| ファイル | 参照シート |
|----------|------------|
| コード.gs | 設定、申込者 |
| Stripe_Webhook.gs | 申込者 |
| 新フォーム.gs | 空き日程、決済確認シート |

※ 決済確認シートのスプレッドシートIDは共通（1s1La7aQgFJzi7mJnBLWfro7u4XBkWok0Qd91b6viBEQ）

---

## 3. 全体のフロー（目標）

```
[Creative] → [LP index-ebook.html] ebook申込
       ↓
[thank-you.html] 動画視聴
       ↓
[ebook登録] シートに書き出し ← ★GASに未実装
       ↓
[3日間チャレンジ] Day1〜Day3メール（メール配信ツールで）
       ↓
[Day4アンケート] day4-anketo.html
       ↓
[Day4決済] 2,980円 Stripe ← ★Webhook未設定
       ↓
[バックエンド] ツール・講座・コンサル（未構築）

※並行：[個別相談] index.html（無料・希望日程方式）← ★GASが日程選択式のまま
```

---

## 4. 実施手順

### ステップ1：削除するもの

| 削除対象 | 理由 |
|----------|------|
| **Stripe_Webhook.gs** | 旧1,100円個別相談決済用。個別相談は無料に変更済み |

### ステップ2：コード.gs の整理

| 対応 | 内容 |
|------|------|
| **削除 or コメントアウト** | STRIPE_URL、doGet_old、doPost_old、getScheduleData、processForm |
| **残す場合** | 将来の共通定数などがあれば移行してから削除 |

### ステップ3：新フォーム.gs の更新

| 対応 | 参照 |
|------|------|
| **① ebook の振り分けを追加** | `新フォーム_ebook統合_追加コード.md` |
| **② 個別相談を希望日程方式に変更** | `個別相談フォーム_GAS更新_希望日程方式.md` |
| **③ doGet の扱い** | 希望日程方式では空き日程取得不要。削除するか、将来用に残す |

### ステップ4：Day4 2,980円用 Webhook（別途）

- 旧 Stripe Webhook を削除したあと、Day4 決済用は**別の GAS デプロイ**か、新フォーム.gs の doPost に Stripe 署名チェックの分岐を追加
- ワークスペースの `GAS_Stripe決済Webhook.gs` を参考に実装

---

## 5. 整理後の推奨構成（新フォーム.gs）

```javascript
// doPost の先頭
function doPost(e) {
  // 1. ebook登録（index-ebook.html、form-urlencoded）
  const params = e.parameter || {};
  if (params.action === 'ebook') {
    return handleEbookRegistration(params);
  }
  
  // 2. 個別相談（index.html、JSON）
  const postData = JSON.parse(e.postData.contents);
  return handleConsultation(postData);  // preferredDay, preferredTime, preferredDetail 使用
}
```

※ doGet は希望日程方式では不要。削除するか、将来用に空実装で残す。

---

## 6. シート・シート名の確認

| 用途 | シート名 | 備考 |
|------|----------|------|
| 個別相談 | 決済確認シート or 個別相談申込 | 新フォーム.gs の BOOKING_SHEET_NAME を確認 |
| ebook | ebook登録 | handleEbookRegistration で自動作成 |
| Day4決済 | Day4決済 | 2,980円用 Webhook で作成 |

---

## 7. ワークスペース内の参考ファイル

| ファイル | 用途 |
|----------|------|
| `sankou/GAS_ebook登録.gs` | ebook登録の処理（新フォームに統合するコード） |
| `sankou/GAS_Stripe決済Webhook.gs` | Day4の2,980円決済用 Webhook（新規追加用） |
| `sankou/新フォーム_ebook統合_追加コード.md` | ebook を新フォームに統合する手順 |
| `sankou/個別相談フォーム_GAS更新_希望日程方式.md` | 個別相談を希望日程方式に変更する手順 |
