/**
 * Kindle印税資産 フォーム受付システム（整理後）
 * 
 * 【対応フォーム】
 * 1. ebook登録（index-ebook.html）… form-urlencoded → ebook登録シート
 * 2. 個別相談（index.html）… JSON → 決済確認シート（希望日程方式・無料）
 * 3. Day4 2,980円（day4-anketo.html）… 空き日程選択 → Stripe決済 → 決済確認シート
 * 
 * 【セットアップ】
 * 1. スプレッドシートに「決済確認シート」「空き日程」を用意
 * 2. STRIPE_WEBHOOK_SECRET を設定（Stripe Webhook用）
 * 3. デプロイ → ウェブアプリ（自分・全員）
 */

// スプレッドシートID
const SPREADSHEET_ID = '1s1La7aQgFJzi7mJnBLWfro7u4XBkWok0Qd91b6viBEQ';

// シート名
const BOOKING_SHEET_NAME = '決済確認シート';
const SHEET_NAME_EBOOK = 'ebook登録';
const SCHEDULE_SHEET_NAME = '空き日程';
const SHEET_DAY4_PAYMENT = 'Day4決済';  // Stripe決済の書き出し先

// 空き日程シートの列インデックス（0始まり）
// シート構成が異なる場合はここを調整（例：A=日付,B=時間,C=ステータス → 0,1,2）
const SCHEDULE_COL_DATE = 0;   // 日付列（A列）
const SCHEDULE_COL_TIME = 1;   // 時間列（B列）
const SCHEDULE_COL_STATUS = 2; // ステータス列（C列）

// 管理者メールアドレス
const ADMIN_EMAIL = 'master.ai022@gmail.com';

// サンキューページURL
const THANK_YOU_URL = 'https://cursor0113.vercel.app/lp-consultation/thank-you.html';

// 完全ガイド動画・ebook・Day4
const VIDEO_URL = 'https://youtu.be/fo90zVEWTNY';
const EBOOK_URL = 'https://cursor0113.vercel.app/lp-consultation/ebook.html';
const DAY4_ANKETO_URL = 'https://cursor0113.vercel.app/lp-consultation/day4-anketo.html';

// Day4 2,980円 Stripe決済リンク
const STRIPE_DAY4_URL = 'https://buy.stripe.com/00wbJ03Vb2g4cBL2X8ffy0e';

// Stripe Webhook署名シークレット（whsec_で始まる。Stripeダッシュボードで取得）
const STRIPE_WEBHOOK_SECRET = 'whsec_ob3RD8SgwEDjhY84x3QGTzdau1mrV7J7';

/**
 * スプレッドシートを取得（紐づきシート優先、なければID指定）
 */
function getSpreadsheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * GET: 空き日程取得（Day4用。?action=schedule で呼び出し）
 */
function doGet(e) {
  console.log('doGet 開始');
  try {
    const params = e.parameter || {};
    if (params.action === 'schedule') {
      return createJsonResponse(getScheduleData());
    }
    return createJsonResponse([]);
  } catch (error) {
    console.log('doGet エラー: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * 日付値（Date or 文字列）を日本時間の日付に変換（締め切り判定用）
 */
function parseScheduleDateToJst(dateVal) {
  if (dateVal instanceof Date) {
    const y = Utilities.formatDate(dateVal, 'Asia/Tokyo', 'yyyy');
    const m = Utilities.formatDate(dateVal, 'Asia/Tokyo', 'MM');
    const d = Utilities.formatDate(dateVal, 'Asia/Tokyo', 'dd');
    return Utilities.parseDate(y + '/' + m + '/' + d, 'Asia/Tokyo', 'yyyy/MM/dd');
  }
  const str = String(dateVal || '').trim();
  if (!str) return null;
  const m = str.match(/(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/);
  if (m) {
    const ymd = m[1] + '/' + m[2].padStart(2, '0') + '/' + m[3].padStart(2, '0');
    return Utilities.parseDate(ymd, 'Asia/Tokyo', 'yyyy/MM/dd');
  }
  return null;
}

/**
 * 空き日程シートの締め切りを更新（前日12時を過ぎた枠を「締め切り」に設定）
 * トリガーで定期的に実行（例：毎時0分）することを推奨
 */
function updateScheduleDeadlines() {
  const ss = getSpreadsheet();
  const scheduleSheet = ss.getSheetByName(SCHEDULE_SHEET_NAME);
  if (!scheduleSheet) return;

  const data = scheduleSheet.getDataRange().getValues();
  const displayData = scheduleSheet.getDataRange().getDisplayValues();
  const now = new Date();
  let updateCount = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const displayRow = displayData[i] || [];
    const dateVal = row[SCHEDULE_COL_DATE];
    const status = (row[SCHEDULE_COL_STATUS] || '').toString().trim();

    // available のみ締め切りに更新。済・予約済・空き・その他は変更しない
    if (status !== 'available') continue;

    try {
      const slotDate = parseScheduleDateToJst(dateVal);
      if (!slotDate) continue;
      const deadline = new Date(slotDate.getTime());
      deadline.setDate(deadline.getDate() - 1);
      deadline.setHours(12, 0, 0, 0);

      if (now > deadline) {
        scheduleSheet.getRange(i + 1, SCHEDULE_COL_STATUS + 1).setValue('締め切り');
        updateCount++;
      }
    } catch (err) {
      continue;
    }
  }
  if (updateCount > 0) {
    console.log('締め切り更新: ' + updateCount + '件');
  }
}

/**
 * 空き日程シートから空き枠を取得
 * 日付はシートに表示されている文字列（getDisplayValues）をそのまま返し、タイムゾーンずれを防ぐ
 */
function getScheduleData() {
  const ss = getSpreadsheet();
  const scheduleSheet = ss.getSheetByName(SCHEDULE_SHEET_NAME);
  if (!scheduleSheet) return [];

  const data = scheduleSheet.getDataRange().getValues();
  const displayData = scheduleSheet.getDataRange().getDisplayValues();
  const schedules = [];
  const now = new Date();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const displayRow = displayData[i] || [];
    const dateVal = row[SCHEDULE_COL_DATE];
    const timeStr = (displayRow[SCHEDULE_COL_TIME] || row[SCHEDULE_COL_TIME] || '').toString().trim();
    const status = (row[SCHEDULE_COL_STATUS] || '').toString().trim();

    if (status !== 'available') continue;

    try {
      const slotDate = parseScheduleDateToJst(dateVal);
      if (!slotDate) continue;
      const deadline = new Date(slotDate.getTime());
      deadline.setDate(deadline.getDate() - 1);
      deadline.setHours(12, 0, 0, 0);
      if (now > deadline) continue;

      // シートの表示値をそのまま返す（タイムゾーンずれ防止）
      const dateDisplay = (displayRow[SCHEDULE_COL_DATE] || dateVal).toString().trim();
      schedules.push({
        date: dateDisplay,
        dateDisplay: dateDisplay,
        timeDisplay: timeStr || '',
        row: i + 1
      });
    } catch (err) {
      continue;
    }
  }
  return schedules;
}

/**
 * POST: 司令塔（ebook / 個別相談 / Day4 / Stripe Webhook）
 */
function doPost(e) {
  console.log('doPost 開始');

  // ----- 1. Stripe Webhook（Stripe-Signature ヘッダーで判定）-----
  const signature = (e.headers && (e.headers['Stripe-Signature'] || e.headers['stripe-signature'])) || null;
  if (signature) {
    return handleStripeWebhook(e);
  }

  const postContent = (e.postData && e.postData.contents) ? e.postData.contents : '';

  // ----- 2. ebook登録（index-ebook.html / form-urlencoded）-----
  if (postContent && postContent.indexOf('action=ebook') >= 0 && postContent.indexOf('{') !== 0) {
    const params = parseFormUrlEncoded(postContent);
    if (params.action === 'ebook') {
      return handleEbookRegistration(params);
    }
  }

  // ----- 3. Day4申込 or 個別相談（JSON）-----
  try {
    const postData = JSON.parse(postContent);
    if (postData.action === 'day4') {
      return handleDay4Application(postData);
    }
    return handleConsultation(postData);
  } catch (error) {
    console.log('doPost エラー: ' + error.message);
    return createJsonResponse({ success: false, message: error.message });
  }
}

/**
 * Stripe Webhook: 決済完了 → 決済確認シートに書き出し
 */
function handleStripeWebhook(e) {
  try {
    const payload = e.postData.contents;
    const signature = e.headers['Stripe-Signature'] || e.headers['stripe-signature'];
    if (!signature) {
      return ContentService.createTextOutput('No signature').setMimeType(ContentService.MimeType.TEXT).setStatusCode(400);
    }

    const event = JSON.parse(payload);
    const type = event.type;

    if (type === 'checkout.session.completed') {
      return handleStripeCheckoutCompleted(event.data.object);
    }
    if (type === 'payment_intent.succeeded') {
      return handleStripePaymentSucceeded(event.data.object);
    }
    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT).setStatusCode(200);
  } catch (err) {
    console.error('Webhookエラー: ' + err.message);
    return ContentService.createTextOutput('Error').setMimeType(ContentService.MimeType.TEXT).setStatusCode(500);
  }
}

function handleStripeCheckoutCompleted(session) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_DAY4_PAYMENT);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_DAY4_PAYMENT);
    sheet.getRange(1, 1, 1, 10).setValues([['日時', '種別', '金額', '通貨', '顧客メール', '顧客名', '決済ID', '商品名', 'メタデータ', '備考']]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }

  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  const amount = (session.amount_total || 0) / 100;
  const customerEmail = session.customer_details?.email || session.customer_email || '';
  const customerName = session.customer_details?.name || '';
  const paymentId = session.payment_intent || session.id || '';
  const metadata = session.metadata ? JSON.stringify(session.metadata) : '';

  sheet.appendRow([timestamp, 'Day4決済', amount, 'jpy', customerEmail, customerName, paymentId, 'Day4 2,980円', metadata, '']);
  console.log('Stripe決済記録完了: ' + customerEmail + ' / ' + amount + '円');
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT).setStatusCode(200);
}

function handleStripePaymentSucceeded(paymentIntent) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_DAY4_PAYMENT);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_DAY4_PAYMENT);
    sheet.getRange(1, 1, 1, 10).setValues([['日時', '種別', '金額', '通貨', '顧客メール', '顧客名', '決済ID', '商品名', 'メタデータ', '備考']]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }
  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  const amount = (paymentIntent.amount || 0) / 100;
  const customerEmail = paymentIntent.receipt_email || '';
  const paymentId = paymentIntent.id || '';
  const metadata = paymentIntent.metadata ? JSON.stringify(paymentIntent.metadata) : '';
  sheet.appendRow([timestamp, 'Day4決済', amount, 'jpy', customerEmail, '', paymentId, 'Day4 2,980円', metadata, '']);
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT).setStatusCode(200);
}

/**
 * Day4 2,980円申込: 空き日程を予約済にし、決済リンクを返す
 */
function handleDay4Application(postData) {
  try {
    const scheduleRow = postData.scheduleRow;
    const name = (postData.name || '').trim();
    const email = (postData.email || '').trim();
    const goal = postData.goal || '';
    const time = postData.time || '';
    const message = postData.message || '';

    if (!scheduleRow || !name || !email) {
      return createJsonResponse({ success: false, message: '名前・メール・日程が必須です。' });
    }

    const ss = getSpreadsheet();
    const scheduleSheet = ss.getSheetByName(SCHEDULE_SHEET_NAME);
    let day4Sheet = ss.getSheetByName('Day4申込');

    if (!scheduleSheet) {
      return createJsonResponse({ success: false, message: '空き日程シートが見つかりません。スプレッドシートに「空き日程」シートを追加してください。' });
    }

    const status = String(scheduleSheet.getRange(scheduleRow, SCHEDULE_COL_STATUS + 1).getValue() || '').trim();
    if (status !== 'available') {
      return createJsonResponse({ success: false, message: '申し訳ありません。選択された枠は満席または締め切りです。' });
    }

    const scheduleData = scheduleSheet.getRange(scheduleRow, 1, scheduleRow, 4).getValues()[0];
    const selectedDate = scheduleData[0];
    const selectedTime = scheduleData[1];

    scheduleSheet.getRange(scheduleRow, 3).setValue('済');

    if (!day4Sheet) {
      day4Sheet = ss.insertSheet('Day4申込');
      day4Sheet.getRange(1, 1, 1, 8).setValues([['日時', '名前', 'メール', '選択日程', '目標', '週時間', 'メッセージ', '決済状態']]);
      day4Sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }

    const now = new Date();
    day4Sheet.appendRow([now, name, email, selectedDate + ' ' + selectedTime, goal || '', time || '', message || '', '決済待ち']);

    return createJsonResponse({ success: true, stripeUrl: STRIPE_DAY4_URL });
  } catch (err) {
    console.error('handleDay4Application エラー: ' + err.message);
    return createJsonResponse({ success: false, message: '申込処理でエラーが発生しました。' + err.message });
  }
}

/**
 * form-urlencoded をパース
 */
function parseFormUrlEncoded(str) {
  const params = {};
  const pairs = str.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const idx = pairs[i].indexOf('=');
    if (idx > 0) {
      const key = decodeURIComponent(pairs[i].substring(0, idx).replace(/\+/g, ' '));
      const val = decodeURIComponent(pairs[i].substring(idx + 1).replace(/\+/g, ' '));
      params[key] = val;
    }
  }
  return params;
}

/**
 * ebook登録処理（index-ebook.html から送信）
 */
function handleEbookRegistration(params) {
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

    // 自動返信メール送信
    sendEbookWelcomeEmail(email, name);

    console.log('ebook登録完了: ' + email);
    return createEbookRedirectResponse(THANK_YOU_URL);

  } catch (err) {
    console.log('ebook登録エラー: ' + err.message);
    return createEbookErrorResponse('登録中にエラーが発生しました。');
  }
}

/**
 * ebook登録後の自動返信メール
 */
function sendEbookWelcomeEmail(email, name) {
  try {
    const displayName = (name && name.trim()) ? name.trim() + ' 様' : 'お客様';
    const subject = '【Kindle印税資産】ebook＆完全ガイド動画のご案内';
    const body = displayName + '\n\n' +
      'この度は、無料ebookへのご登録ありがとうございます。\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '【1】完全ガイド動画（約12分）\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '印税収入を仕組みで構築する「からくり」を解説しています。\n' +
      'まずはこちらをご覧ください。\n\n' +
      '▼ 動画はこちら\n' +
      VIDEO_URL + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '【2】ebook（設計図）\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '▼ ebookはこちら\n' +
      EBOOK_URL + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '【3】3日間チャレンジ\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '登録翌朝9時から、3日間にわたってメールでお届けします。\n\n' +
      '・Day1：『発見』…売れるテーマの見つけ方\n' +
      '・Day2：『確信』…成功の鍵\n' +
      '・Day3：『感動』…90分で完成する体験\n\n' +
      '楽しみにしていてください。\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '【4】Day4 2,980円実体験（任意）\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '90分で1冊のマンガを出版する実体験＆ゴールデンルートシミュレーション相談を、\n' +
      '2,980円でご提供しています。枠は1日2名まで。\n\n' +
      '▼ お申し込み（事前アンケート）\n' +
      DAY4_ANKETO_URL + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'ご不明な点がございましたら、お気軽にご連絡ください。\n\n' +
      'Kindle印税資産 事務局';

    MailApp.sendEmail(email, subject, body);
    console.log('ebook歓迎メール送信完了: ' + email);
  } catch (err) {
    console.log('ebook歓迎メール送信エラー: ' + err.message);
    // メール送信失敗でも登録処理は成功とする
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

/**
 * 個別相談処理（index.html / 希望日程方式・無料）
 */
function handleConsultation(postData) {
  const { name, email, phone, preferredDay, preferredTime, preferredDetail, goal, time, message, surveyGood, surveyConcern, surveyWant } = postData;

  console.log('個別相談申込: ' + name + ' (' + email + ')');

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let bookingSheet = ss.getSheetByName(BOOKING_SHEET_NAME);

  if (!bookingSheet) {
    bookingSheet = ss.insertSheet(BOOKING_SHEET_NAME);
    bookingSheet.getRange(1, 1, 1, 13).setValues([['日時', '名前', 'メール', '電話', '希望曜日', '希望時間帯', '具体的な希望', '目標', '週時間', '良い点', '不安', '知りたい', 'メッセージ']]);
    bookingSheet.getRange(1, 1, 1, 13).setFontWeight('bold');
  }

  const now = new Date();
  bookingSheet.appendRow([
    now,
    name || '',
    email || '',
    phone || '',
    preferredDay || '',
    preferredTime || '',
    preferredDetail || '',
    goal || '',
    time || '',
    surveyGood || '',
    surveyConcern || '',
    surveyWant || '',
    message || ''
  ]);

  console.log('スプレッドシートに追記完了');

  // 確認メール送信
  sendConfirmationEmail(email, name, preferredDay, preferredTime, preferredDetail, goal, time, message, surveyGood, surveyConcern, surveyWant, phone);

  // 管理者通知
  sendAdminNotification(name, email, preferredDay, preferredTime, preferredDetail, goal, time, message, surveyGood, surveyConcern, surveyWant, phone);

  console.log('doPost 完了');
  return createJsonResponse({ success: true });
}

/**
 * 確認メール送信（予約者へ・希望日程方式）
 */
function sendConfirmationEmail(email, name, preferredDay, preferredTime, preferredDetail, goal, weeklyTime, message, surveyGood, surveyConcern, surveyWant, phone) {
  console.log('メール送信開始: ' + email);

  try {
    const subject = '【無料相談】ご予約ありがとうございます';
    const scheduleText = [preferredDay, preferredTime, preferredDetail].filter(Boolean).join(' / ') || '要相談';
    const body = name + ' 様\n\n' +
      'この度は無料相談にお申し込みいただき、ありがとうございます。\n\n' +
      '【ご希望日程】\n' +
      scheduleText + '\n\n' +
      '※ ご希望を確認のうえ、メールにて日程調整のご連絡をいたします。\n\n' +
      '【ヒアリング情報】\n' +
      '目標の月間印税収入: ' + (goal || '未回答') + '\n' +
      '週に使える時間: ' + (weeklyTime || '未回答') + '\n' +
      (message ? 'ご質問: ' + message + '\n' : '') + '\n' +
      '当日はZoomでお話しさせていただきます。\n\n' +
      '【Zoomリンク】\n' +
      'https://zoom.us/j/5507013969\n' +
      'ミーティングID: 550 701 3969\n\n' +
      '開始5分前にはご入室ください。\n\n' +
      'あなた専用の印税資産シミュレーションを準備してお待ちしております。\n\n' +
      'ご不明な点がございましたら、お気軽にご連絡ください。\n\n' +
      '---\n' +
      'Kindle印税資産 無料相談';

    MailApp.sendEmail(email, subject, body);
    console.log('予約者へのメール送信成功: ' + email);

  } catch (error) {
    console.log('メール送信エラー: ' + error.message);
  }
}

/**
 * 管理者への通知メール
 */
function sendAdminNotification(name, email, preferredDay, preferredTime, preferredDetail, goal, weeklyTime, message, surveyGood, surveyConcern, surveyWant, phone) {
  console.log('管理者通知メール送信開始');

  try {
    const scheduleText = [preferredDay, preferredTime, preferredDetail].filter(Boolean).join(' / ') || '要相談';
    const subject = '【新規予約】個別相談の申込がありました';
    const body = '新しい個別相談の予約が入りました。\n\n' +
      '【予約者情報】\n' +
      'お名前: ' + name + '\n' +
      'メール: ' + email + '\n' +
      '電話番号: ' + (phone || '未入力') + '\n' +
      '希望日程: ' + scheduleText + '\n\n' +
      '【ヒアリング情報】\n' +
      '目標の月間印税収入: ' + (goal || '未回答') + '\n' +
      '週に使える時間: ' + (weeklyTime || '未回答') + '\n' +
      'ご質問: ' + (message || 'なし') + '\n\n' +
      '【アンケート回答】\n' +
      '良いと思った点: ' + (surveyGood || 'なし') + '\n' +
      '不安に思った点: ' + (surveyConcern || 'なし') + '\n' +
      '知りたいこと: ' + (surveyWant || 'なし') + '\n\n' +
      'スプレッドシートを確認してください。';

    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
    console.log('管理者通知メール送信成功');

  } catch (error) {
    console.log('管理者通知メール送信エラー: ' + error.message);
  }
}

/**
 * JSONレスポンスを作成
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
