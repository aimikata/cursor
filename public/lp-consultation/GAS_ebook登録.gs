/**
 * ebook登録フォーム用 Google Apps Script
 * 
 * 【セットアップ手順】
 * 1. 決済確認シートを開く: https://docs.google.com/spreadsheets/d/1s1La7aQgFJzi7mJnBLWfro7u4XBkWok0Qd91b6viBEQ/edit
 * 2. メニュー「拡張機能」→「Apps Script」
 * 3. このコードを貼り付け（既存の Code.gs に追加するか、新規作成）
 * 4. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
 *    - 説明: ebook登録
 *    - 実行ユーザー: 自分
 *    - アクセス: 全員
 * 5. デプロイ後、表示されるURLをコピー
 * 6. index-ebook.html の GAS_EBBOOK_URL にそのURLを設定
 */

const SPREADSHEET_ID = '1s1La7aQgFJzi7mJnBLWfro7u4XBkWok0Qd91b6viBEQ';
const SHEET_NAME = 'ebook登録';
const THANK_YOU_URL = 'https://cursor0113.vercel.app/lp-consultation/thank-you.html';

function doPost(e) {
  try {
    const params = e.parameter;
    const email = params.email || '';
    const name = params.name || '';
    
    if (!email) {
      return createErrorResponse('メールアドレスが入力されていません。');
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, 3).setValues([['日時', 'メール', '名前']]);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    }
    
    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
    sheet.appendRow([timestamp, email, name]);
    
    return createRedirectResponse(THANK_YOU_URL);
  } catch (err) {
    console.error(err);
    return createErrorResponse('登録中にエラーが発生しました。少々お待ちください。');
  }
}

function createRedirectResponse(url) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body>
    <p>登録を受け付けました。リダイレクト中...</p>
    <script>window.location.href = "${url}";</script>
    <noscript><a href="${url}">こちらをクリック</a></noscript>
    </body>
    </html>
  `;
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function createErrorResponse(message) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body>
    <p>${message}</p>
    <a href="javascript:history.back()">戻る</a>
    </body>
    </html>
  `;
  return HtmlService.createHtmlOutput(html);
}
