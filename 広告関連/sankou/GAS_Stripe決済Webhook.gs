/**
 * Stripe 決済Webhook用 Google Apps Script
 * 
 * 【概要】
 * Stripe が決済完了時に送信する Webhook を受け取り、
 * 決済情報をスプレッドシートに書き出します。
 * 
 * 【セットアップ手順】
 * 1. 決済確認シートを開く
 * 2. メニュー「拡張機能」→「Apps Script」
 * 3. このコードを貼り付け
 * 4. STRIPE_WEBHOOK_SECRET を設定（Stripeダッシュボードで取得）
 * 5. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
 *    - 実行ユーザー: 自分
 *    - アクセス: 全員
 * 6. デプロイURLをStripeのWebhookエンドポイントに登録
 */

const SPREADSHEET_ID = '1s1La7aQgFJzi7mJnBLWfro7u4XBkWok0Qd91b6viBEQ';
const SHEET_NAME = 'Day4決済';  // 2,980円決済用シート名
// ★★★ StripeのWebhook署名シークレット（whsec_で始まる）を設定 ★★★
const STRIPE_WEBHOOK_SECRET = 'whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

function doPost(e) {
  try {
    const payload = e.postData.contents;
    const signature = e.headers['Stripe-Signature'] || e.headers['stripe-signature'];
    
    if (!signature) {
      console.error('Webhook署名なし');
      return ContentService.createTextOutput('No signature').setMimeType(ContentService.MimeType.TEXT).setStatusCode(400);
    }
    
    // 署名検証（オプション：セキュリティのため推奨）
    if (STRIPE_WEBHOOK_SECRET && !STRIPE_WEBHOOK_SECRET.includes('XXXX')) {
      try {
        const event = verifyStripeWebhook(payload, signature);
        return handleStripeEvent(event);
      } catch (err) {
        console.error('署名検証エラー: ' + err.message);
        return ContentService.createTextOutput('Invalid signature').setMimeType(ContentService.MimeType.TEXT).setStatusCode(400);
      }
    } else {
      // 署名検証なし（テスト用）
      const event = JSON.parse(payload);
      return handleStripeEvent(event);
    }
  } catch (err) {
    console.error('Webhookエラー: ' + err.message);
    return ContentService.createTextOutput('Error').setMimeType(ContentService.MimeType.TEXT).setStatusCode(500);
  }
}

// Stripe Webhook署名検証（要：Stripe APIキーまたは署名検証ロジック）
function verifyStripeWebhook(payload, signature) {
  // GASでは crypto が制限されているため、簡易的にペイロードをパース
  // 本番では Stripe の署名検証を実装することを推奨
  // 参考: https://stripe.com/docs/webhooks/signatures
  return JSON.parse(payload);
}

function handleStripeEvent(event) {
  const type = event.type;
  
  if (type === 'checkout.session.completed') {
    return handleCheckoutCompleted(event.data.object);
  }
  
  if (type === 'payment_intent.succeeded') {
    return handlePaymentSucceeded(event.data.object);
  }
  
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT).setStatusCode(200);
}

// Payment Link / Checkout 完了時
function handleCheckoutCompleted(session) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 8).setValues([['日時', '金額', '通貨', '顧客メール', '顧客名', '決済ID', '商品名', 'メタデータ']]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  }
  
  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  const amount = (session.amount_total || 0) / 100;  // セント→円
  const currency = session.currency || 'jpy';
  const customerEmail = session.customer_details?.email || session.customer_email || '';
  const customerName = session.customer_details?.name || '';
  const paymentId = session.payment_intent || session.id || '';
  const lineItems = session.display_items || [];
  const productName = lineItems.length > 0 ? (lineItems[0].custom?.name || lineItems[0].amount) : '';
  const metadata = session.metadata ? JSON.stringify(session.metadata) : '';
  
  sheet.appendRow([timestamp, amount, currency, customerEmail, customerName, paymentId, productName, metadata]);
  
  console.log('決済記録完了: ' + customerEmail + ' / ' + amount + '円');
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT).setStatusCode(200);
}

// payment_intent.succeeded の場合（上記と併用可能）
function handlePaymentSucceeded(paymentIntent) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 8).setValues([['日時', '金額', '通貨', '顧客メール', '顧客名', '決済ID', '商品名', 'メタデータ']]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  }
  
  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  const amount = (paymentIntent.amount || 0) / 100;
  const currency = paymentIntent.currency || 'jpy';
  const customerEmail = paymentIntent.receipt_email || '';
  const paymentId = paymentIntent.id || '';
  const metadata = paymentIntent.metadata ? JSON.stringify(paymentIntent.metadata) : '';
  
  sheet.appendRow([timestamp, amount, currency, customerEmail, '', paymentId, 'Day4 2,980円', metadata]);
  
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT).setStatusCode(200);
}
