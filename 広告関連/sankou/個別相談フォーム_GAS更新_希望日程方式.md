# 個別相談フォーム GAS 更新：希望日程方式への対応

index.html の個別相談フォームを「日程選択式」から「希望日程・後日調整」方式に変更しました。
新フォーム.gs の doPost を以下のように更新してください。

---

## 元の doPost（日程選択式）― 置き換え対象

あなたの 新フォーム.gs に、以下のような doPost があるはずです。**これを丸ごと置き換えます**。

```javascript
/**
 * POST: 予約を登録
 */
function doPost(e) {
  console.log('doPost 開始');
  console.log('受信データ: ' + e.postData.contents);
  
  try {
    const postData = JSON.parse(e.postData.contents);
    const { scheduleRow, name, email, phone, goal, time, message, surveyGood, surveyConcern, surveyWant } = postData;
    
    // ... 空き日程シートから日時取得
    // ... 空き日程のステータスを「予約済」に更新
    // ... bookingSheet.appendRow([now, name, email, phone, reservationDateTime, goal, time, surveyGood, surveyConcern, surveyWant, message]);
    // ... sendConfirmationEmail(...);
    
    return createJsonResponse({ success: true });
  } catch (error) { ... }
}
```

**探し方**：Apps Script エディタで
- `scheduleRow` で検索
- または `JSON.parse(e.postData.contents)` で検索（doPost 内）
- または `空き日程` `bookingSheet` `予約済` で検索

**該当コードがない場合**：
- 個別相談フォーム（index.html）のフォーム送信先 GAS URL を確認
- その URL が紐づくスプレッドシート → 拡張機能 → Apps Script を開く
- もしくは、以前は別の GAS（例：申込フォーム用）で処理していた可能性があります

---

## 変更内容

### 受信データの形式

| 項目 | 変更前（日程選択式） | 変更後（希望日程） |
|------|----------------------|---------------------|
| scheduleRow | あり（空き日程の行番号） | **なし** |
| preferredDay | なし | **あり**（相談希望の曜日） |
| preferredTime | なし | **あり**（希望の時間帯） |
| preferredDetail | なし | **あり**（具体的な希望） |
| 決済 | 1,100円 Stripe | **なし**（無料） |

---

## doPost の個別相談処理の修正例

```javascript
// 個別相談（JSONで送信）— 希望日程方式
const postData = JSON.parse(e.postData.contents);
const { name, email, phone, preferredDay, preferredTime, preferredDetail, goal, time, message, surveyGood, surveyConcern, surveyWant } = postData;

// 空き日程の参照・更新は不要
// 決済リンク表示も不要（無料のため）

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
const bookingSheet = ss.getSheetByName(BOOKING_SHEET_NAME); // または「個別相談申込」等の専用シート

// 書き出し列を変更（例）
bookingSheet.appendRow([
  new Date(),
  name,
  email,
  phone || '',
  preferredDay || '',      // 相談希望の曜日
  preferredTime || '',    // 希望の時間帯
  preferredDetail || '',  // 具体的な希望
  goal || '',
  time || '',
  surveyGood || '',
  surveyConcern || '',
  surveyWant || '',
  message || ''
]);

// 確認メール送信（予約日時ではなく希望日程を記載）
sendConfirmationEmail(email, name, preferredDay, preferredTime, preferredDetail, goal, time, message, surveyGood, surveyConcern, surveyWant, phone);

return createJsonResponse({ success: true });
```

---

## 注意点

- **空き日程シート**：参照・更新は不要になりました
- **決済（Stripe）**：個別相談は無料のため、決済リンクの表示は不要です
- **確認メール**：予約日時の代わりに「希望日程を確認のうえ、別途ご連絡します」等の文言に変更してください
- **シート構成**：既存の「決済確認シート」に追記するか、「個別相談申込」等の専用シートを新設して書き出す形にしてください
