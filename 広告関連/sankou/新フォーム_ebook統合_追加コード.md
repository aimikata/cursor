# 新フォーム.gs に ebook登録を統合する手順

同じ GAS で ebook 登録と個別相談の両方を受け付けるための変更です。

---

## 1. doPost の先頭に振り分け処理を追加

**変更前**（doPost の先頭）:
```javascript
function doPost(e) {
  console.log('doPost 開始');
  console.log('受信データ: ' + e.postData.contents);
  
  try {
    const postData = JSON.parse(e.postData.contents);
```

**変更後**:
```javascript
function doPost(e) {
  console.log('doPost 開始');
  
  // ★ebook登録の振り分け（form-urlencoded で action=ebook が送られる）
  const params = e.parameter || {};
  if (params.action === 'ebook') {
    return handleEbookRegistration(params);
  }
  
  // 個別相談（JSONで送信）
  console.log('受信データ: ' + (e.postData ? e.postData.contents : ''));
  
  try {
    const postData = JSON.parse(e.postData.contents);
```

---

## 2. 新フォーム.gs の末尾に以下を追加

```javascript
/**
 * ebook登録処理（index-ebook.html から送信）
 */
function handleEbookRegistration(params) {
  const SHEET_NAME_EBOOK = 'ebook登録';
  const THANK_YOU_URL = 'https://cursor0113.vercel.app/lp-consultation/thank-you.html';
  
  try {
    const email = params.email || '';
    const name = params.name || '';
    
    if (!email) {
      return createEbookErrorResponse('メールアドレスが入力されていません。');
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME_EBOOK);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME_EBOOK);
      sheet.getRange(1, 1, 1, 3).setValues([['日時', 'メール', '名前']]);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    }
    
    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
    sheet.appendRow([timestamp, email, name]);
    
    console.log('ebook登録完了: ' + email);
    return createEbookRedirectResponse(THANK_YOU_URL);
    
  } catch (err) {
    console.log('ebook登録エラー: ' + err.message);
    return createEbookErrorResponse('登録中にエラーが発生しました。');
  }
}

function createEbookRedirectResponse(url) {
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><p>登録を受け付けました。リダイレクト中...</p><script>window.location.href="' + url + '";</script><noscript><a href="' + url + '">こちらをクリック</a></noscript></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function createEbookErrorResponse(message) {
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><p>' + message + '</p><a href="javascript:history.back()">戻る</a></body></html>';
  return HtmlService.createHtmlOutput(html);
}
```

---

## 3. index-ebook.html のフォームに hidden を追加

フォーム内に次を追加（`</form>` の直前に）:

```html
<input type="hidden" name="action" value="ebook">
```

そして、form の `action` を **個別相談と同じ GAS の URL** に設定してください。

---

## まとめ

| フォーム | 送信形式 | 振り分け | 書き出し先 |
|----------|----------|----------|------------|
| **index-ebook.html** | form-urlencoded（action=ebook, email, name） | params.action === 'ebook' | ebook登録シート |
| **index.html**（個別相談） | JSON（scheduleRow, name, email...） | 上記以外 | 決済確認シート |

個別相談の doPost はそのまま維持され、ebook 登録だけ上記の分岐で処理されます。
