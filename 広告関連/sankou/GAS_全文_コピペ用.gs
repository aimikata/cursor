/**
 * Kindle印税資産 フォーム受付システム（全文コピペ用・メール差し替え済）
 * 
 * 【対応フォーム】
 * 1. ebook登録（index-ebook.html）… form-urlencoded → ebook登録シート
 * 2. 個別相談（index.html）… JSON → 決済確認シート（希望日程方式・無料）
 * 3. Day4 2,980円（day4-anketo.html）… 空き日程選択 → Stripe決済 → 決済確認シート
 * 
 * 【メール】自動返信＋Day1〜Day3 は最新版に差し替え済み
 * 
 * 【セットアップ】
 * 1. スプレッドシートに「決済確認シート」「空き日程」「ebook登録」を用意
 * 2. STRIPE_WEBHOOK_SECRET を設定（Stripe Webhook用）
 * 3. setupStepEmailTrigger() を1回実行 → 毎日9時にDay1〜3送信
 * 4. デプロイ → ウェブアプリ（自分・全員）
 */

// スプレッドシートID
const SPREADSHEET_ID = '1s1La7aQgFJzi7mJnBLWfro7u4XBkWok0Qd91b6viBEQ';

// シート名
const BOOKING_SHEET_NAME = '決済確認シート';
const SHEET_NAME_EBOOK = 'ebook登録';
const SCHEDULE_SHEET_NAME = '空き日程';
const SHEET_DAY4_PAYMENT = 'Day4決済';  // Stripe決済の書き出し先

// 空き日程シートの列インデックス（0始まり）
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
const STRIPE_DAY4_URL = 'https://buy.stripe.com/00wbJ03Vb2g4cBL2X8ffy0e';          // 本番
const STRIPE_DAY4_URL_TEST = 'https://buy.stripe.com/test_fZu9ASezPf2Q7hr8hsffy00'; // テスト
const USE_TEST_STRIPE = false;  // 本番運用（テスト時は true に戻す）

// 実体験前準備用マニュアル
const API_KEY_MANUAL_URL = 'https://gemini.google.com/share/3e4d49d18fcd';
const KDP_ACCOUNT_MANUAL_URL = 'https://ktjwfldx.gensparkspace.com/';
const KINDLE_CREATE_MANUAL_URL = 'https://cursor0113.vercel.app/lp-consultation/kindle-create-manual.html';

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
    } catch (err) { continue; }
  }
  if (updateCount > 0) console.log('締め切り更新: ' + updateCount + '件');
}

/**
 * 空き日程シートから空き枠を取得
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
      const dateDisplay = (displayRow[SCHEDULE_COL_DATE] || dateVal).toString().trim();
      schedules.push({ date: dateDisplay, dateDisplay: dateDisplay, timeDisplay: timeStr || '', row: i + 1 });
    } catch (err) { continue; }
  }
  return schedules;
}

/**
 * POST: 司令塔（ebook / 個別相談 / Day4 / Stripe Webhook）
 */
function doPost(e) {
  console.log('doPost 開始');
  const signature = (e.headers && (e.headers['Stripe-Signature'] || e.headers['stripe-signature'])) || null;
  if (signature) return handleStripeWebhook(e);
  const postContent = (e.postData && e.postData.contents) ? e.postData.contents : '';
  if (postContent && postContent.indexOf('action=ebook') >= 0 && postContent.indexOf('{') !== 0) {
    const params = parseFormUrlEncoded(postContent);
    if (params.action === 'ebook') return handleEbookRegistration(params);
  }
  try {
    const postData = JSON.parse(postContent);
    if (postData.action === 'day4') return handleDay4Application(postData);
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
    if (!signature) return ContentService.createTextOutput('No signature').setMimeType(ContentService.MimeType.TEXT).setStatusCode(400);
    const event = JSON.parse(payload);
    const type = event.type;
    if (type === 'checkout.session.completed') return handleStripeCheckoutCompleted(event.data.object);
    if (type === 'payment_intent.succeeded') return handleStripePaymentSucceeded(event.data.object);
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
  if (amount === 2980 && customerEmail) {
    try { updateDay4PaymentStatusToComplete(customerEmail); } catch (updateErr) { console.log('Day4申込ステータス更新エラー: ' + updateErr.message); }
    try { sendDay4PaymentCompletedEmail(customerEmail, customerName); } catch (mailErr) { console.log('Day4決済完了メール送信エラー: ' + mailErr.message); }
  }
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
  if (amount === 2980 && customerEmail) {
    try { updateDay4PaymentStatusToComplete(customerEmail); } catch (err) { console.log('Day4申込ステータス更新エラー: ' + err.message); }
  }
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT).setStatusCode(200);
}

function updateDay4PaymentStatusToComplete(customerEmail) {
  if (!customerEmail) return;
  const email = String(customerEmail).trim().toLowerCase();
  const ss = getSpreadsheet();
  const day4Sheet = ss.getSheetByName('Day4申込');
  if (!day4Sheet) return;
  const data = day4Sheet.getDataRange().getValues();
  if (data.length < 2) return;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowEmail = String(row[2] || '').trim().toLowerCase();
    const status = String(row[7] || '').trim();
    if (rowEmail === email && status === '決済待ち') {
      day4Sheet.getRange(i + 1, 8).setValue('決済済');
      console.log('Day4申込 決済済に更新: 行' + (i + 1) + ' / ' + email);
      break;
    }
  }
}

function formatScheduleDisplay(val) {
  if (val && val.map) return val.map(function(row) { return [formatScheduleDisplayImpl(row[0] != null ? row[0] : row)]; });
  return formatScheduleDisplayImpl(val);
}
function formatScheduleDisplayImpl(val) {
  if (!val) return '';
  const str = String(val).trim();
  if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(str)) return str;
  const timeMatch = str.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/);
  const timePart = timeMatch ? timeMatch[1] + '-' + timeMatch[2] : '';
  const dateStr = timeMatch ? str.substring(0, timeMatch.index).replace(/\([^)]*\)/g, '').trim() : str.replace(/\([^)]*\)/g, '').trim();
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return str;
    const formatted = Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy/MM/dd');
    return timePart ? formatted + ' ' + timePart : formatted;
  } catch (e) { return str; }
}

function setupDay4ConditionalFormat() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Day4申込');
  if (!sheet) return;
  const lastRow = Math.max(sheet.getLastRow(), 100);
  const range = sheet.getRange(2, 1, lastRow, 10);
  const rules = sheet.getConditionalFormatRules();
  const newRule = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=ISBLANK($I2)').setBackground('#FFE4E1').setRanges([range]).build();
  rules.push(newRule);
  sheet.setConditionalFormatRules(rules);
  console.log('Day4申込 条件付き書式を設定しました');
}
function handleDay4ConditionalFormat() { setupDay4ConditionalFormat(); }

/**
 * Day4 2,980円申込
 */
function handleDay4Application(postData) {
  try {
    const scheduleRow = postData.scheduleRow;
    const name = (postData.name || '').trim();
    const email = (postData.email || '').trim();
    const goal = postData.goal || '';
    const time = postData.time || '';
    const message = postData.message || '';
    if (!scheduleRow || !name || !email) return createJsonResponse({ success: false, message: '名前・メール・日程が必須です。' });
    const ss = getSpreadsheet();
    const scheduleSheet = ss.getSheetByName(SCHEDULE_SHEET_NAME);
    let day4Sheet = ss.getSheetByName('Day4申込');
    if (!scheduleSheet) return createJsonResponse({ success: false, message: '空き日程シートが見つかりません。' });
    const status = String(scheduleSheet.getRange(scheduleRow, SCHEDULE_COL_STATUS + 1).getValue() || '').trim();
    if (status !== 'available') return createJsonResponse({ success: false, message: '申し訳ありません。選択された枠は満席または締め切りです。' });
    const scheduleData = scheduleSheet.getRange(scheduleRow, 1, scheduleRow, 4).getValues()[0];
    const selectedDate = scheduleData[0];
    const selectedTime = scheduleData[1];
    scheduleSheet.getRange(scheduleRow, 3).setValue('済');
    if (!day4Sheet) {
      day4Sheet = ss.insertSheet('Day4申込');
      day4Sheet.getRange(1, 1, 1, 10).setValues([['日時', '名前', 'メール', '選択日程', '目標', '週時間', 'メッセージ', '決済状態', '決済日', '選択日程(生)']]);
      day4Sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    }
    const now = new Date();
    const scheduleRaw = (selectedDate instanceof Date) ? selectedDate.toString() + ' ' + (String(selectedTime || '').trim()) : (String(selectedDate || '').trim() + ' ' + String(selectedTime || '').trim()).trim();
    const scheduleDisplay = (selectedDate instanceof Date) ? Utilities.formatDate(selectedDate, 'Asia/Tokyo', 'yyyy/MM/dd') + ' ' + (String(selectedTime || '').trim()) : (String(selectedDate || '').trim() + ' ' + String(selectedTime || '').trim()).trim();
    day4Sheet.appendRow([now, name, email, '', goal || '', time || '', message || '', '決済待ち', '', scheduleRaw]);
    const baseUrl = USE_TEST_STRIPE ? STRIPE_DAY4_URL_TEST : STRIPE_DAY4_URL;
    const stripeUrl = baseUrl + (email ? '?prefilled_email=' + encodeURIComponent(email) : '');
    try { sendDay4ConfirmationEmail(email, name, scheduleDisplay); } catch (mailErr) { console.log('Day4自動返信メール送信エラー: ' + mailErr.message); }
    return createJsonResponse({ success: true, stripeUrl: stripeUrl });
  } catch (err) {
    console.error('handleDay4Application エラー: ' + err.message);
    return createJsonResponse({ success: false, message: '申込処理でエラーが発生しました。' + err.message });
  }
}

function sendDay4PaymentCompletedEmail(email, name) {
  const nameAddressed = (name || '').trim() ? name.trim() + '様' : 'お客様';
  const subject = '【Kindle印税資産】決済完了＆当日が楽しみになりました！';
  const body = nameAddressed + '\n\nこんにちは。\nKindle資産形成 事務局です。\n\n決済が完了いたしました。\nこの度は誠にありがとうございます。\n\n90分で、あなただけのマンガ1冊を\nそのままお持ち帰りいただけます。\n\n・印税で回り続ける「資産」の感覚\n・あなた専用のゴールデンルート\n・その日のうちに、仕組みがひとつ増える\n\nその全てを、体感していただける日です。\n私たちも、お会いできる日を\n心より楽しみにしております。\n\n当日のご案内は、別途メールでお送りします。\nどうぞよろしくお願いいたします。\n\n◆------------------------------------◆\n運営者：Kindle資産形成事務局\nお問い合わせ：' + ADMIN_EMAIL + '\n（営業時間：平日10時から18時）\n◆------------------------------------◆';
  MailApp.sendEmail(email, subject, body);
  console.log('Day4決済完了メール送信完了: ' + email);
}

function sendDay4ConfirmationEmail(email, name, scheduleDisplay) {
  const nameAddressed = (name || '').trim() ? name.trim() + '様' : 'お客様';
  const subject = '【Kindle印税資産】実体験＆ゴールデンルートシミュレーション相談 決済のご案内';
  const body = nameAddressed + '\n\nこんにちは。\nKindle資産形成 事務局です。\n\nこの度は\n「実体験＆ゴールデンルートシミュレーション相談」\nにお申し込みいただきまして\n誠にありがとうございます。\n\n【お申込内容】\n参加希望日程：' + (scheduleDisplay || '（確認中）') + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n実体験前に準備していただくと良いもの\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n【1】APIキーの取得\nAPIキーはこのツールを使う為に必修になります。\n特に日本語の使用の場合は必要です。\n▼ ' + API_KEY_MANUAL_URL + '\n\n【2】Kindle KDPアカウント\n順調なペースで進めば当日、体験時間内でもKindleに書籍を並べる事が出来ます。\n是非、Kindle KDPアカウントを取得しておいてください。\n▼ ' + KDP_ACCOUNT_MANUAL_URL + '\n\n【3】Kindle Create ダウンロード\nKindle書籍としてアップする専用のファイル形式に変換するツールです。\n▼ ' + KINDLE_CREATE_MANUAL_URL + '\n\nもしご準備が間に合わなくても大丈夫です。当日全て一緒に行う事も可能です。\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n決済のお手続きのご案内をさせて頂きます。\n\n===================\nクレジット決済を\nお選びの方\n===================\n\n決済がお済みでない場合、\n下記のリンクをご使用ください。\n\n' + (USE_TEST_STRIPE ? STRIPE_DAY4_URL_TEST : STRIPE_DAY4_URL) + '\n\n※決済期日：本日から3日以内\n\n※ご入金時の名義とお申込時のお名前が異なる場合は、事前にご連絡をお願いします。\n\n以上です。\n\n何かご不明な点がございましたら、\n事務局までお問い合わせください。\n↓\n' + ADMIN_EMAIL + '\n\nご確認のほど、どうぞよろしくお願い致します。\n\n◆------------------------------------◆\n運営者：Kindle資産形成事務局\nお問い合わせは：' + ADMIN_EMAIL + '\n（営業時間：平日10時から18時）\n＊頂いたお問い合わせには3営業日以内に\nお答えさせて頂いております。\n\n◆------------------------------------◆';
  MailApp.sendEmail(email, subject, body);
  console.log('Day4決済前自動返信メール送信完了: ' + email);
}

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
 * ebook登録処理
 */
function handleEbookRegistration(params) {
  try {
    const email = params.email || '';
    const name = params.name || '';
    if (!email) return createEbookErrorResponse('メールアドレスが入力されていません。');
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
    sendEbookWelcomeEmail(email, name);
    console.log('ebook登録完了: ' + email);
    return createEbookRedirectResponse(THANK_YOU_URL);
  } catch (err) {
    console.log('ebook登録エラー: ' + err.message);
    return createEbookErrorResponse('登録中にエラーが発生しました。');
  }
}

// ───── ebook自動返信（差し替え済み）────────
function sendEbookWelcomeEmail(email, name) {
  try {
    var displayName = (name && (name + '').trim()) ? (name + '').trim() + '様' : 'お客様';
    var subject = '【登録完了】Kindle印税資産への第一歩——まずこの動画を7分だけご覧ください';
    var body = displayName + '\n\n' +
      'この度は、無料ebookへのご登録ありがとうございます。\n\n' +
      '今から「月20万円の不労所得を作る仕組み」を\n' +
      '手に入れるための旅が始まります。\n\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '【今すぐ】まずこの動画を7分だけご覧ください\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '▼ 完全ガイド動画(12分・倍速推奨)\n' + VIDEO_URL + '\n\n' +
      '※お忙しい方は、1.5倍速で7分視聴がおすすめです\n\n' +
      'この動画で分かること:\n' +
      '・なぜ文章力も絵心もいらないのか\n' +
      '・月20万円への具体的な道筋\n' +
      '・成功する人と失敗する人の決定的な違い\n\n' +
      '動画を見終わったら、下記のebookで\n' +
      'さらに詳しい「設計図」をご確認ください。\n\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '【設計図】ebook(いつでも見返せます)\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '▼ ebookはこちら\n' + EBOOK_URL + '\n\n' +
      '※動画の内容をより詳しく解説しています\n' +
      '※3日間チャレンジ中、何度でも見返してください\n\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '【明日から】3日間チャレンジがスタートします\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '明日の朝9時から、3日間にわたって\n' +
      'あなた専用のテーマを見つけるメールをお届けします。\n\n' +
      '■Day1(明日)『発見』\n' +
      '→ 売れるテーマの見つけ方・第一歩(所要時間:15分)\n\n' +
      '■Day2(明後日)『確信』\n' +
      '→ 成功の鍵となるリサーチの深掘り(所要時間:20分)\n\n' +
      '■Day3(3日後)『感動』\n' +
      '→ 90分で完成する体験のご案内(所要時間:15分)\n\n' +
      '各メールには、AIに貼り付けるだけの\n' +
      '「実行プロンプト」が付いています。\n\n' +
      '1日15〜20分、3日間だけお時間をください。\n' +
      'あなたの「約束の一行」が完成します。\n\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '【Day4】2,980円実体験(希望者のみ・先着順)\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '3日間チャレンジで見つけた「あなたのテーマ」を、\n' +
      'その日のうちにマンガ1冊として完成させる\n' +
      '90分の実体験セッションです。\n\n' +
      '・参加費:2,980円\n' +
      '・枠:1日2名まで(事前アンケート必須)\n' +
      '・持ち帰り:マンガ1冊(その日に出版可能)\n\n' +
      '▼ 事前アンケートはこちら\n' + DAY4_ANKETO_URL + '\n\n' +
      '※枠が埋まり次第、締切となります\n' +
      '※3日間チャレンジ後のご案内でも間に合います\n\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'それでは、まず動画をご覧になって、\n' +
      '明日の朝9時をお楽しみに。\n\n' +
      'あなたの第一歩を、心から応援しています。\n\n\n' +
      'Kindle印税資産 事務局\n' +
      'master.ai022@gmail.com';
    MailApp.sendEmail(email, subject, body);
    console.log('ebook歓迎メール送信完了: ' + email);
  } catch (err) {
    console.log('ebook歓迎メール送信エラー: ' + err.message);
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
 * 個別相談処理
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
  bookingSheet.appendRow([now, name || '', email || '', phone || '', preferredDay || '', preferredTime || '', preferredDetail || '', goal || '', time || '', surveyGood || '', surveyConcern || '', surveyWant || '', message || '']);
  console.log('スプレッドシートに追記完了');
  sendConfirmationEmail(email, name, preferredDay, preferredTime, preferredDetail, goal, time, message, surveyGood, surveyConcern, surveyWant, phone);
  sendAdminNotification(name, email, preferredDay, preferredTime, preferredDetail, goal, time, message, surveyGood, surveyConcern, surveyWant, phone);
  return createJsonResponse({ success: true });
}

function sendConfirmationEmail(email, name, preferredDay, preferredTime, preferredDetail, goal, weeklyTime, message, surveyGood, surveyConcern, surveyWant, phone) {
  try {
    const subject = '【無料相談】ご予約ありがとうございます';
    const scheduleText = [preferredDay, preferredTime, preferredDetail].filter(Boolean).join(' / ') || '要相談';
    const body = name + ' 様\n\nこの度は無料相談にお申し込みいただき、ありがとうございます。\n\n【ご希望日程】\n' + scheduleText + '\n\n※ ご希望を確認のうえ、メールにて日程調整のご連絡をいたします。\n\n【ヒアリング情報】\n目標の月間印税収入: ' + (goal || '未回答') + '\n週に使える時間: ' + (weeklyTime || '未回答') + '\n' + (message ? 'ご質問: ' + message + '\n' : '') + '\n当日はZoomでお話しさせていただきます。\n\n【Zoomリンク】\nhttps://zoom.us/j/5507013969\nミーティングID: 550 701 3969\n\n開始5分前にはご入室ください。\n\nあなた専用の印税資産シミュレーションを準備してお待ちしております。\n\nご不明な点がございましたら、お気軽にご連絡ください。\n\n---\nKindle印税資産 無料相談';
    MailApp.sendEmail(email, subject, body);
    console.log('予約者へのメール送信成功: ' + email);
  } catch (error) { console.log('メール送信エラー: ' + error.message); }
}

function sendAdminNotification(name, email, preferredDay, preferredTime, preferredDetail, goal, weeklyTime, message, surveyGood, surveyConcern, surveyWant, phone) {
  try {
    const scheduleText = [preferredDay, preferredTime, preferredDetail].filter(Boolean).join(' / ') || '要相談';
    const subject = '【新規予約】個別相談の申込がありました';
    const body = '新しい個別相談の予約が入りました。\n\n【予約者情報】\nお名前: ' + name + '\nメール: ' + email + '\n電話番号: ' + (phone || '未入力') + '\n希望日程: ' + scheduleText + '\n\n【ヒアリング情報】\n目標の月間印税収入: ' + (goal || '未回答') + '\n週に使える時間: ' + (weeklyTime || '未回答') + '\nご質問: ' + (message || 'なし') + '\n\n【アンケート回答】\n良いと思った点: ' + (surveyGood || 'なし') + '\n不安に思った点: ' + (surveyConcern || 'なし') + '\n知りたいこと: ' + (surveyWant || 'なし') + '\n\nスプレッドシートを確認してください。';
    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
    console.log('管理者通知メール送信成功');
  } catch (error) { console.log('管理者通知メール送信エラー: ' + error.message); }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// ───── ステップメール（Day1〜Day3・差し替え済み）────────
/**
 * ステップメールを送信（トリガーで毎日9時に実行）
 */
function sendStepEmails() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_EBOOK);
  if (!sheet) return;
  if (sheet.getLastColumn() < 6) {
    sheet.getRange(1, 4, 1, 6).setValues([['Day1送信済', 'Day2送信済', 'Day3送信済']]);
    sheet.getRange(1, 4, 1, 6).setFontWeight('bold');
  }
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return;
  const now = new Date();
  const todayJst = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd');
  const [ty, tm, td] = todayJst.split('/').map(Number);
  const todayDate = new Date(ty, tm - 1, td);
  let sentCount = 0;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const dateStr = String(row[0] || '').trim();
    const email = String(row[1] || '').trim();
    const name = String(row[2] || '').trim();
    const day1Sent = row[3] ? true : false;
    const day2Sent = row[4] ? true : false;
    const day3Sent = row[5] ? true : false;
    if (!email) continue;
    let regDate;
    try {
      const m = dateStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
      if (m) regDate = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
      else regDate = new Date(dateStr);
    } catch (e) { continue; }
    const daysSince = Math.floor((todayDate - regDate) / (24 * 60 * 60 * 1000));
    try {
      if (daysSince >= 1 && !day1Sent) { sendDay1Email(email, name); sheet.getRange(i + 1, 4).setValue(Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm')); sentCount++; }
      if (daysSince >= 2 && !day2Sent) { sendDay2Email(email, name); sheet.getRange(i + 1, 5).setValue(Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm')); sentCount++; }
      if (daysSince >= 3 && !day3Sent) { sendDay3Email(email, name); sheet.getRange(i + 1, 6).setValue(Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm')); sentCount++; }
    } catch (err) { console.log('ステップメール送信エラー 行' + (i + 1) + ': ' + err.message); }
  }
  if (sentCount > 0) console.log('ステップメール送信完了: ' + sentCount + '通');
}

/**
 * ステップメール用トリガーを設定（初回1回のみ実行）
 */
function setupStepEmailTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) { if (t.getHandlerFunction() === 'sendStepEmails') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('sendStepEmails').timeBased().everyDays(1).atHour(9).create();
  console.log('sendStepEmails トリガーを毎日9時（日本時間）に設定しました');
}

var SUBJECT_DAY1 = '【Day1/3】なぜ9割の人が「売れないテーマ」を選んでしまうのか?';
var SUBJECT_DAY2 = '【Day2/3】市場があっても売れない理由——成功の鍵はここにある';
var SUBJECT_DAY3 = '【Day3/3・最終回】あなたの「約束の一行」が、その日に資産になる';

function sendDay1Email(email, name) {
  try {
    MailApp.sendEmail(email, SUBJECT_DAY1, getDay1Body(name));
    console.log('Day1メール送信完了: ' + email);
  } catch (err) { console.log('Day1メール送信エラー: ' + err.message); }
}
function sendDay2Email(email, name) {
  try {
    MailApp.sendEmail(email, SUBJECT_DAY2, getDay2Body(name));
    console.log('Day2メール送信完了: ' + email);
  } catch (err) { console.log('Day2メール送信エラー: ' + err.message); }
}
function sendDay3Email(email, name) {
  try {
    MailApp.sendEmail(email, SUBJECT_DAY3, getDay3Body(name));
    console.log('Day3メール送信完了: ' + email);
  } catch (err) { console.log('Day3メール送信エラー: ' + err.message); }
}

// Day1〜Day3 本文（全文）
var BODY_DAY1 = '○○さん、おはようございます。\n\nKindle印税資産 事務局です。\n\n昨日は無料ebookへのご登録、ありがとうございました。\n\n完全ガイド動画(約12分)は、もうご覧になりましたか?\n\n▼ まだの方はこちら\nhttps://youtu.be/fo90zVEWTNY\n\n今日から3日間、あなた専用の「売れるテーマ」を\n見つけていく実践がスタートします。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n動画・ebookで学んだことを、今日から実践します\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n動画の中で、こうお伝えしました:\n\n「売れるテーマを見つけるには、\n 5段階フィルターを通す必要がある」\n\n**【5段階フィルター】**\n1. 市場データの収集\n2. 動画化確認\n3. 痛みの有無\n4. シリーズ化の可能性\n5. 競合分析\n\nでも、一気に5段階やろうとすると、\nほとんどの人が挫折します。\n\nだから——\n**今日はフィルター1だけ、徹底的に深掘り**します。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【Day1のゴール】たった1つです\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n今日のゴールは、シンプルです:\n\n**「あなたの興味あるテーマが、\n  市場に存在するかを確認する」**\n\nたったこれだけ。\n所要時間は、わずか15分です。\n\nでも、この15分が——\n**月20万円と0円を分ける、決定的な分岐点**になります。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nなぜ9割の人が「売れないテーマ」を選ぶのか?\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nKindle出版で失敗する人には、共通点があります。\n\nそれは——\n\n✗ 「自分が書きたいこと」を優先する\n✗ 「自分の経験を伝えたい」と考える\n✗ 「なんとなく良さそう」で決める\n\n動画でもお伝えした通り、\nこれが失敗のパターンです。\n\nなぜなら——\n**それは「あなたの思い込み」であって、\n  「市場の需要」ではないから**です。\n\n\n成功する人は、逆です。\n\n✓ 「市場が求めていること」を優先する\n✓ データをもとにリサーチする\n✓ 需要があるテーマを選ぶ\n\n動画でこうお伝えしました:\n\n「同じ時間をかけて出版しても、\n テーマ選定の違いで、月5,000円の差が出る。\n 40冊積み上げると、月200万円の差になる」\n\nこの考え方の違いが、\n人生を変えるほどの大きな差になるんです。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【フィルター1】市場の存在確認——なぜ最重要なのか?\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n5段階フィルターの中で、\n**最も重要なのがフィルター1**です。\n\nなぜか?\n\n理由は明確です:\n\n┏━━━━━━━━━━━━━━━━━━━┓\n  市場が存在しない = 誰も買わない\n┗━━━━━━━━━━━━━━━━━━━┛\n\nどんなに素晴らしい内容でも、\nどんなに情熱を注いでも、\n読者がいなければ、印税はゼロです。\n\n逆に言えば——\n**市場さえ存在すれば、\n  あとは「正しい切り口」を見つけるだけ。**\n\n月5,000円の印税が生まれます。\n\n\n■ 具体例で見てみましょう\n\n【× 市場が存在しないテーマ】\n「私の日常を描いたエッセイ漫画」\n\n→ Amazon Kindleで検索:ベストセラーなし\n→ Googleで検索:月間検索ほぼゼロ\n→ Yahoo知恵袋:悩み投稿なし\n\n**結果**:誰も買わない。印税ゼロ。\n\n\n【○ 市場が存在するテーマ】\n「30代女性の産後ダイエット」\n\n→ Amazon Kindleで検索:ベストセラー複数あり\n→ Googleで検索:月間検索1万回以上\n→ Yahoo知恵袋:「産後 痩せない」で悩み投稿多数\n\n**結果**:需要がある。月5,000円の印税が生まれる。\n\n\nこの違い、見えますか?\n\n**市場の有無を確認せずに出版する = ギャンブル**\n**市場の存在を確認してから出版する = 確実な資産構築**\n\nebookでもお伝えした通り、\n「市場優先」で考えることが、すべての基礎です。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n市場の存在を、3つのデータで確認する方法\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n「市場調査って、難しそう…」\n\nそう思われるかもしれません。\n\nでも、やることはシンプルです。\n**たった3つのポイント**を確認するだけ。\n\n\n**【確認ポイント1】Amazonベストセラー**\n\nAmazon Kindleの「コミック」カテゴリで、\nあなたのテーマに近いキーワードを検索。\n\n・ベストセラーバッジがついた本はあるか?\n・レビュー数50件以上の本はあるか?\n\n→ 「はい」なら、市場が存在する証拠\n\n\n**【確認ポイント2】Google検索ボリューム**\n\nそのテーマのキーワードで、\n月間どのくらい検索されているか?\n\n・月間検索1,000回以上 → ○\n・月間検索100回以下 → ×\n\n検索している人 = 悩んでいる人\n= あなたのマンガを買ってくれる人\n\n\n**【確認ポイント3】Yahoo知恵袋・Twitter**\n\nリアルな悩み投稿が複数あるか?\n\n「〇〇で困っています」\n「〇〇が辛いです」\n「〇〇の解決方法を教えてください」\n\n→ こういう投稿が10件以上あれば、\n  市場が存在する証拠\n\n\nこの3つで「○」が出れば、\n**市場は確実に存在します**。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nでも、自分で調査するのは大変…そこでAIの出番です\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n「3つのポイント、自分で調べるの大変そう…」\n\n安心してください。\n\nebookでもお伝えした通り、\n**AIに丸投げできます**。\n\n下記のプロンプトを、\nChatGPT / Claude / Gemini に貼り付けて、\n実行するだけです。\n\nAIが15分で、すべて調査してくれます。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【今夜15分】このプロンプトを実行してください\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n┏━━━━━━━━━━━━━━━━━━━━━┓\n 【フィルター1】市場存在確認プロンプト\n┗━━━━━━━━━━━━━━━━━━━━━┛\n\n下記をコピーして、AIに貼り付けてください:\n\nあなたは、Kindleマンガで印税資産を積み上げるための リサーチ専門家です。\n\n私が興味を持っているテーマについて、 「市場が本当に存在するか」を調査してください。\n\n【私のテーマ】 (ここに、あなたが興味のあるテーマを書いてください)\n\n例: ・30代女性の産後ダイエット ・40代男性の副業スタート ・20代の婚活 ・介護と仕事の両立 ・子どもの不登校 ・英語学習で挫折した人向け ・在宅ワークの始め方\n\n【調査してほしいこと】\n\n■1. Amazonの「Kindleストア > コミック」で調査\nこのテーマに関連する本は存在するか ベストセラーバッジがついた本はあるか レビュー数50件以上の本はあるか どんなタイトルの本が売れているか\n■2. Googleでの検索需要を推定\nこのテーマのキーワードで、 月間どのくらい検索されているか(推定でOK) 関連キーワードで需要が高いものは何か 検索結果の上位に「解決方法」を求める記事があるか\n■3. Yahoo知恵袋・Twitterでのリアルな悩み\nこのテーマで「困っています」 「どうすればいいですか」 「〇〇が辛い」という投稿は複数あるか どんな具体的な悩みが多いか\n【判定基準】\n上記3点を調査し、 ・3つすべてで需要あり → ○(市場が確実に存在) ・2つで需要あり → △(市場が不明瞭・要再検討) ・1つ以下 → ×(市場が存在しない・テーマ変更推奨)\nで判定してください。\n\n【○の場合のみ】 「より具体的で、ニッチなテーマ候補」を 3つ提案してください。\nニッチとは: ・ターゲットを絞る(30代女性、40代男性など) ・状況を具体化する(産後3ヶ月、転職活動中など) ・痛みを明確にする(5キロ戻った、収入が減ったなど)\n【提案例】 元のテーマ:「ダイエット」 ↓ ニッチ化: 1.「産後3ヶ月で5キロ戻った30代ママのダイエット」 2.「40代から始める、無理しないダイエット」 3.「在宅ワークで10キロ太った人向けダイエット」\n【×の場合】 「市場が存在する、近いテーマ」を 3つ提案してください。\n※「私のテーマ」の部分を、あなたの興味・経験・専門分野に置き換えてください。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n実行後、15分後にこうなります\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nこのプロンプトを実行すると、AIが15分で以下を教えてくれます:\n✅ あなたのテーマが「市場あり○」「市場なし×」か判定される\n✅ ○の場合:より具体的なテーマ候補が3つ提案される\n✅ ×の場合:市場が存在する近いテーマが3つ提案される\n✅ Amazon・Google・SNSの具体的なデータが示される\n\nあなたがやることは、提案された中から「これだ!」と思うものを**1つだけ選ぶ**こと。\nその1つが、明日のDay2で深掘りする**あなたの「テーマの種」**になります。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【重要】今夜、必ず実行してください\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nなぜ「今夜」なのか? 理由は2つあります。\n\n**理由1:明日のDay2につながるから**\n明日のDay2では、今日選んだテーマを、さらに深掘りします。「YouTube動画化されているか」「期限付きの深い痛みがあるか」この2つを確認することで、**月5,000円のテーマが、月50,000円のテーマに変わります**。でも、それには「今日のテーマの種」が必要です。\n\n**理由2:行動した人だけが、結果を出すから**\nebookでもお伝えした通り、成功する人と失敗する人の違いは、**「リサーチをやるか、やらないか」**この1点だけです。動画を見て「なるほど!」と思っても、行動しなければ、印税はゼロのままです。でも、今夜15分だけ実行すれば、あなたは「月20万円への第一歩」を踏み出します。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n明日のDay2で、何が起きるか\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n今夜、市場の存在を確認したテーマ。明日のDay2では、そのテーマが**「お金を出してでも解決したい痛み」に刺さっているか**を確認します。動画でもお伝えした通り、市場があっても、痛みが浅ければ、人はお金を出しません。逆に、痛みが深ければ、1冊500円でも、喜んで買います。このフィルター2と3が、**月5,000円と月50,000円の差**を生みます。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n今日のアクションまとめ\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n【今夜15分でやること】\n1. 上記のプロンプトをコピー\n2. ChatGPT / Claude / Gemini に貼り付け\n3. 「私のテーマ」を自分の興味・経験に置き換える\n4. 実行ボタンを押す\n5. AIの提案から「これだ!」と思うテーマを1つ選ぶ\n6. そのテーマをメモ(明日のDay2で使います)\n\nたったこれだけです。難しいことは、ありません。AIが、すべてやってくれます。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nそれでは、今夜15分だけ。まず市場の存在を確認してみてください。\n明日の朝9時に、Day2のメールをお送りします。\nあなたの第一歩を、心から応援しています。\n\nKindle印税資産 事務局\nmaster.ai022@gmail.com\n\n---\n\nP.S.\nもし動画をまだご覧になっていない方は、ぜひ今夜、プロンプト実行の前に7分だけご覧ください。(1.5倍速推奨)\n▼ 完全ガイド動画(約12分)\nhttps://youtu.be/fo90zVEWTNY\n「なぜ市場優先で考えるのか」「なぜ5段階フィルターが必要なのか」その理由が、より深く理解できます。\n\n---\n※Day4の2,980円実体験(90分でマンガ1冊完成)は枠1日2名まで。事前アンケート回答者のみご案内します。\n▼ 事前アンケートはこちら\nhttps://cursor0113.vercel.app/lp-consultation/day4-anketo.html\n※3日間チャレンジ後のご案内でも間に合います';

var BODY_DAY2 = '○○さん、おはようございます。\n\nKindle印税資産 事務局です。\n\n昨日のDay1、フィルター1は実行できましたか?\n\nAIが「○(市場が存在)」と判定したテーマ。\n今日はそのテーマを、さらに深掘りしていきます。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【Day2のゴール】確信を得る日です\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n動画でお伝えした3日間チャレンジ、\n今日は2日目『確信』のフェーズです。\n\n今日のゴールは:\n**「なぜリサーチが成功の鍵なのか、心の底から確信する」**\nそして、あなたのテーマが**「お金を出してでも解決したい痛み」**に刺さっているかを確認します。所要時間は、わずか20分です。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nまず、昨日のテーマを確認してください\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n昨日、AIに市場調査をしてもらいましたね。その中で「これだ!」と選んだテーマ。今、手元にありますか?\n例:・「30代女性の産後ダイエット」・「40代男性の副業スタート」・「在宅ワークで太った人向けダイエット」\nこのテーマを、今日さらに深掘りします。\n※もし昨日実行できなかった方は、今すぐDay1のメールに戻って、フィルター1を実行してください。今日のDay2は、昨日のテーマがあることが前提です。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n衝撃の事実:市場があっても、売れないテーマがある\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n昨日、こうお伝えしました:「市場が存在しないテーマは、誰も買わない」\nでも、実はもう一つ、売れないテーマがあります。それは——**「市場はあるけど、痛みが浅いテーマ」**\n\n■ 2つのテーマを比較してみましょう\n【テーマA】「ダイエットの豆知識50選」→ 市場:○(ダイエット市場は巨大) → Amazon:関連書籍が数千冊存在\n【テーマB】「産後3ヶ月で5キロ戻った30代ママが、90日で目標達成する物語」→ 市場:○(同じダイエット市場) → Amazon:関連書籍が数千冊存在\nどちらも市場は存在します。どちらもAmazonに競合がいます。でも——**売れるのは、圧倒的にテーマB**です。なぜでしょうか?\n答えは、動画でもお伝えした通り:**「痛みの深さ」が違うから**です。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n成功する人と失敗する人の決定的な違い\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n動画の中で、こうお伝えしました:\n「失敗する人は『自分が書きたいこと』を優先する。成功する人は『市場が求めていること』を優先する。同じ時間をかけて出版しても、テーマ選定の違いで、月5,000円の差が出る。40冊積み上げると、月200万円の差になる」\n昨日のフィルター1で、あなたは「市場が存在するテーマ」を見つけました。でも、それだけでは足りません。今日確認するのは:\n┏━━━━━━━━━━━━━━━━━━━┓\n  そのテーマ、読者は本当にお金を出してでも解決したいか?\n┗━━━━━━━━━━━━━━━━━━━┛\nこの確認が、**月5,000円と月50,000円を分けます**。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【フィルター2】YouTube動画化——なぜ重要なのか?\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nebookでもお伝えした5段階フィルター。今日は、その2つ目と3つ目を確認します。まず、フィルター2:**「YouTube動画化されているか」**\n\n■ なぜYouTubeを確認するのか?\n理由は明確です:\n┏━━━━━━━━━━━━━━━━━━━┓\n  動画が多い = お金を出す人が多い証拠\n┗━━━━━━━━━━━━━━━━━━━┛\n\nYouTubeで「〇〇」と検索して、・関連動画が100本以上ある・再生数が数万〜数十万ある・専門チャンネル(登録者1万人以上)が複数ある\nこれは、何を意味するか?**そのテーマで、YouTuberたちが稼げている**ということです。YouTuberは、ビジネスです。稼げないテーマには、時間を使いません。彼らが群がっているテーマ= 広告収入が得られる= 視聴者が多い= 悩んでいる人が多い= **あなたのKindleマンガも売れる**\n\n■ 先ほどの2つのテーマで確認してみましょう\n【テーマA】「ダイエットの豆知識」→ YouTube検索:動画は多いが、「豆知識」単体では再生数が伸びにくい→ ほとんどが「まとめ動画」→ 視聴者の痛みが浅い\n【テーマB】「産後ダイエット 30代」→ YouTube検索:・専門チャンネル多数(登録者10万人超も)・再生数10万超えの動画が複数・「産後 痩せない」「産後 体型戻らない」で切実な悩みを語る動画が豊富→ 視聴者の痛みが深い\nこの違い、見えますか?YouTubeで動画化が進んでいるテーマは、**「お金を出してでも解決したい人」が多い証拠**です。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【フィルター3】痛みの深さ——すべてを決める要素\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n次に、フィルター3:**「期限付きの、切実な痛み」があるか**\nこれが、最も重要な要素です。\n\n■ 人がお金を出すのは、痛みがある時だけ\n動画でもお伝えした通り、人は「痛みの解決」にしか、お金を出しません。でも、痛みには深さがあります。\n【浅い痛み】「いつかダイエットしたいな」「英語、話せるようになりたいな」「副業、興味あるな」→ 緊急性ゼロ。お金を出さない。\n【深い痛み】「3ヶ月後の結婚式までに5キロ痩せたい」「来月の海外出張までに英語が話せないとマズイ」「今月の給料じゃ足りない、副業で3万円必要」→ 期限がある。切実。今すぐお金を出す。\n\nこの違いが、**Kindleマンガが売れるか、埋もれるか**を決定します。\n\n■ 痛みの深さを見分ける3つの質問\nあなたのテーマ、以下の3つに答えてみてください:\n【質問1】読者に「期限」はあるか?例:・「3ヶ月後の結婚式まで」・「来月の転職活動まで」・「子どもの受験まで」→ 期限があるほど、焦りがある。焦るほど、お金を出す。\n【質問2】Yahoo知恵袋・Twitterで、切実な悩み投稿があるか?例:・「産後 痩せない 辛い」・「副業 始めたい でも時間がない」・「在宅ワーク 太った 元に戻したい」→ 「辛い」「困っている」という言葉が複数あれば、痛みが深い証拠。\n【質問3】「〇〇しないと、〇〇になる」という恐怖があるか?例:・「痩せないと、結婚式で恥をかく」・「副業始めないと、生活が苦しいまま」・「英語話せないと、出張で失敗する」→ 恐怖があるほど、人は行動する。行動する = お金を出す。\n\n先ほどの2つのテーマで確認してみましょう:\n【テーマA】「豆知識」→ 期限:なし→ 悩み投稿:「知りたいな」程度→ 恐怖:なし→ 痛み:ほぼゼロ\n【テーマB】「産後3ヶ月で5キロ戻った」→ 期限:結婚式、職場復帰、同窓会など→ 悩み投稿:「体型戻らない 辛い」多数→ 恐怖:「このままじゃ外出できない」→ 痛み:非常に深い\nこの痛みの差が、**売上の差**になるんです。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nなぜリサーチが成功の鍵なのか——確信してください\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nここまで読んで、気づいていただけたでしょうか?Kindle印税で結果を出す人と、出さない人。その違いは、才能でも資金でもありません。**「売れるテーマを、きちんとリサーチしたかどうか」**これだけです。\n\n■ リサーチをしない人の末路\n「なんとなくこれでいいか」→ 市場が存在しない→ 誰も買わない→ 印税ゼロ\n「自分が書きたいから」→ 痛みが浅い→ 誰もお金を出さない→ 印税ゼロ\n\n■ リサーチをした人の未来\n「市場・YouTube・痛み」をちゃんと確認→ 需要がある→ 読者が「これ欲しい!」と思う→ 1冊で月5,000円→ 40冊で月20万円\n\nebookでもお伝えした通り、同じ時間をかけて出版しても、この違いで**月200万円の差**が生まれます。だから——**リサーチが、成功の鍵**なんです。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【今夜20分】フィルター2と3を確認する\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nさあ、確信を持ったところで、実際に確認してみましょう。昨日確認したテーマが、**「YouTube動画化されているか」「期限付きの深い痛みがあるか」**を、AIに調査してもらいます。\n\n┏━━━━━━━━━━━━━━━━━━━━━┓\n 【フィルター2+3】深掘りプロンプト\n┗━━━━━━━━━━━━━━━━━━━━━┛\n\n下記をコピーして、AIに貼り付けてください:\nあなたは、Kindleマンガで印税資産を積み上げるための リサーチ専門家です。私のテーマが「お金を出してでも解決したい 深い痛みのあるテーマ」かどうかを確認してください。\n【私のテーマ】 (昨日のDay1で選んだテーマを書く)\n例: ・30代女性の産後ダイエット ・40代男性の副業スタート ・在宅ワークで太った人向けダイエット\n【確認してほしいこと】\n■フィルター2:YouTube動画化の確認\nYouTubeで「〇〇」と検索した時:関連動画は何本くらいあるか(推定) 再生数1万回以上の動画は複数あるか 再生数10万回以上の動画は存在するか 専門チャンネルの有無:このテーマを専門にしているチャンネル(登録者1万人以上)は存在するか どんなチャンネル名か 動画の鮮度:最近(1年以内)の動画が複数あるか → 最近も動画が作られている = 今も需要がある 動画のタイトル・内容から読み取れること:どんな悩みが語られているか 視聴者のコメント欄に切実な悩みがあるか\n■フィルター3:痛みの深さ確認\n期限付きの痛みがあるか:このテーマの読者は、「いつまでに解決したい」という期限付きの痛みを抱えているか 期限の例:・「3ヶ月後の結婚式まで」・「来月の転職活動まで」・「子どもの受験まで」・「来週のプレゼンまで」・「今月の支払いまで」\nYahoo知恵袋・Twitterでの切実な悩み:「〇〇で困っています」「〇〇が辛いです」「〇〇できなくて悩んでいます」という投稿は複数あるか 具体的に、どんな悩みが多いか教えてください。\n恐怖・焦りの有無:「〇〇しないと、〇〇になる」という恐怖や焦りが存在するか 例:・「痩せないと、結婚式で恥をかく」・「副業始めないと、生活が苦しいまま」・「英語話せないと、出張で失敗する」\n【判定基準】上記を調査し、・YouTube動画が豊富(再生数10万超あり) & 期限付きの深い痛みがある → ○(売れるテーマ)・YouTube動画はあるが再生数が少ない OR 痛みが浅い → △(要改善)・YouTube動画が少ない & 痛みが浅い → ×(テーマ変更推奨)\nで判定してください。\n【○の場合のみ】「痛みをさらに明確にした、より刺さるテーマ表現」を3つ提案してください。【形式】[具体的な状況・数字]の[ターゲット]が、[期限]までに[理想の状態]になる物語\n【例】元のテーマ:「30代女性の産後ダイエット」↓ 痛み明確化: 1.「産後3ヶ月で5キロ戻った30代ママが、90日後に目標体重を達成し、自信を取り戻す物語」2.「産後の骨盤の歪みで悩む30代ママが、職場復帰までに体型を整える物語」3.「二人目妊娠前に体重を戻したい30代ママが、半年で理想の体型を取り戻す物語」\n【△または×の場合】「痛みをより深くするための改善案」または「痛みが深い、近いテーマ」を3つ提案してください。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n実行後、20分後にこうなります\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nこのプロンプトを実行すると、AIが20分で以下を教えてくれます:\n✅ あなたのテーマが「YouTube動画化されている○」か判定\n✅ あなたのテーマに「期限付きの深い痛み」があるか判定\n✅ ○の場合:より刺さるテーマ表現が3つ提案される\n✅ △×の場合:改善案または代替テーマが提案される\n✅ YouTube動画・SNSの具体的なデータが示される\n\nあなたがやることは、提案された中から「これだ!」と思うものを**1つだけ選ぶ**こと。その1つが、明日のDay3で最終確認する**あなたの「約束の一行(原型)」**になります。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【重要】今夜、必ず実行してください\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nなぜ「今夜」なのか?\n**理由1:明日のDay3で完成するから**\n明日のDay3では、今日選んだテーマを、最終確認します。「シリーズ化できるか」「競合が存在するか」この2つを確認することで、**あなたの「約束の一行」が完成します**。その一行が、Day4の体験会で、90分後にマンガ1冊として形になります。でも、それには「今日の痛み明確化」が必要です。\n**理由2:ここが、最大の分岐点だから**\nフィルター1(市場確認)は、基礎。フィルター2+3(YouTube&痛み)は、核心。ここで「痛みの深さ」を見極められるかが、**月5,000円と月50,000円を分けます**。動画でもお伝えした通り、この違いが、40冊で**月200万円の差**になります。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n明日のDay3で、何が起きるか\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n今夜、痛みの深さを確認したテーマ。明日のDay3では、最後のフィルター4と5で、**「シリーズ化できるか」「競合が存在するか」**を確認します。ここまでクリアしたテーマは、**ほぼ確実に売れます**。そして明日の夜には、あなたの「約束の一行」が完成します。その一行が、Day4の体験会で、**90分後にマンガ1冊として形になります**。持ち帰り = マンガ1冊。その日に、Amazonに出版できます。楽しみにしていてください。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n今日のアクションまとめ\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n【今夜20分でやること】\n1. 上記のプロンプトをコピー\n2. ChatGPT / Claude / Gemini に貼り付け\n3. 「私のテーマ」を昨日選んだテーマに置き換える\n4. 実行ボタンを押す\n5. AIの提案から「これだ!」と思うテーマを1つ選ぶ\n6. そのテーマをメモ(明日のDay3で使います)\n\n難しいことは、ありません。AIが、すべてやってくれます。ただし——**実行した人だけが、結果を出します**。\n\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nそれでは、今夜20分だけ。YouTube動画化と痛みの深さを確認してみてください。明日の朝9時に、Day3のメールをお送りします。あなたの確信を、さらに深めていきましょう。\n\nKindle印税資産 事務局\nmaster.ai022@gmail.com\n\n---\n\nP.S.\n今日のフィルター2+3は、5段階の中で最も重要です。「市場があっても売れない理由」「痛みが深いテーマが売れる理由」この違いを理解できれば、あなたはすでに、9割の人より先を行っています。ebookをもう一度読み返すと、今日の学びがより深まります。\n▼ ebook\nhttps://cursor0113.vercel.app/lp-consultation/ebook.html\n\n---\n※Day4の2,980円実体験(90分でマンガ1冊完成)は枠1日2名まで。事前アンケート〆切が近づいています。\n▼ 事前アンケートはこちら\nhttps://cursor0113.vercel.app/lp-consultation/day4-anketo.html\n※明日のDay3メール後のご案内でも間に合います';

var BODY_DAY3 = '○○さん、こんにちは。\n\n3日間チャレンジ、いよいよ最終日です。\n\n今日は『感動』——**ツール導入で、手動10時間かかる工程が90分で完結する体験**をお伝えします。\n\n---\n\n### 1. 90分で1冊——その仕組みの実態\n\n「マンガを1冊作るのに、何時間かかると思いますか？」\n\n昔は、ネーム・下書き・ペン入れ・仕上げ……**手動だと10時間以上**かかることも珍しくありませんでした。\n\nいまは、**AIとテンプレとノウハウ**を使えば、**90分で1冊の流れまで作れる**時代です。\n\n絵が描けなくても、文章が苦手でも、可能です。\n\nこの「90分で1冊」の体験——その驚きが、あなたの確信を決定づけます。\n\n---\n\n### 2. あなたの【約束の一行】が、その日に資産になる\n\nDay1で決めた【約束の一行】。\nDay2で痛みを明確にした【約束の一行】。\n\nその一行が、**その日のうちにマンガ1冊の形になり、Amazonに並ぶ**。\n\nそれが、Day4の2,980円実体験＆ゴールデンルートシミュレーション相談です。\n\n枠は**1日2名まで**。事前アンケートにご回答いただき、ご案内可能と判断した方のみとなります。\n\n**持ち帰り＝マンガ1冊**。その日に出版可能。あなた専用の「仕組み」がひとつ、増えます。\n\n---\n\n### 3. 今日のアクション\n\n**3日間の集大成です。**\n\n1. **ebook**をもう一度読み返す\n   → 数千万円なくても不労所得を築く「Kindle印税資産というゴールデンルートの仕組み」が詰まっています。\n\n2. **Day4アンケート**にご興味があればご回答\n   → https://cursor0113.vercel.app/lp-consultation/day4-anketo.html\n\n3. あなたの【約束の一行】を、心に留めておく\n   → Day4の相談で、その一行を一緒に形にします。\n\n---\n\n3日間、おつかれさまでした。\n\nあなたは『月20万円の確信』を得るための土台を整えました。\n\n次は、**実際に90分で1冊を作る体験**で、確信を形にしてください。\n\n一緒に『仕組み資産』を構築しましょう。応援しています。\n\n---\n\n※Day4 2,980円実体験：枠1日2名・事前アンケート・持ち帰り＝マンガ1冊（その日に出版可能）\nhttps://cursor0113.vercel.app/lp-consultation/day4-anketo.html';

function getDay1Body(name) {
  var d = (name && (name + '').trim()) ? (name + '').trim() + 'さん' : '○○さん';
  return BODY_DAY1.replace('○○さん、', d + '、');
}
function getDay2Body(name) {
  var d = (name && (name + '').trim()) ? (name + '').trim() + 'さん' : '○○さん';
  return BODY_DAY2.replace('○○さん、', d + '、');
}
function getDay3Body(name) {
  var d = (name && (name + '').trim()) ? (name + '').trim() + 'さん' : '○○さん';
  return BODY_DAY3.replace('○○さん、', d + '、');
}
