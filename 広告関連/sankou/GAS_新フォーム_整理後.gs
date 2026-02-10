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

  // Day4申込の「決済待ち」→「決済済」に更新（メールで照合）
  if (amount === 2980 && customerEmail) {
    try {
      updateDay4PaymentStatusToComplete(customerEmail);
    } catch (updateErr) {
      console.log('Day4申込ステータス更新エラー: ' + updateErr.message);
    }
    try {
      sendDay4PaymentCompletedEmail(customerEmail, customerName);
    } catch (mailErr) {
      console.log('Day4決済完了メール送信エラー: ' + mailErr.message);
    }
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

  // payment_intent のみ届く場合のフォールバック（Day4申込の決済済更新のみ。メールはcheckout.session.completedで送信）
  if (amount === 2980 && customerEmail) {
    try {
      updateDay4PaymentStatusToComplete(customerEmail);
    } catch (err) {
      console.log('Day4申込ステータス更新エラー: ' + err.message);
    }
  }

  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT).setStatusCode(200);
}

/**
 * Day4申込シートの「決済待ち」を「決済済」に更新（メールアドレスで照合）
 */
function updateDay4PaymentStatusToComplete(customerEmail) {
  if (!customerEmail) return;
  const email = String(customerEmail).trim().toLowerCase();
  const ss = getSpreadsheet();
  const day4Sheet = ss.getSheetByName('Day4申込');
  if (!day4Sheet) return;

  const data = day4Sheet.getDataRange().getValues();
  if (data.length < 2) return;

  // 列: A=0日時, B=1名前, C=2メール, D=3選択日程, E=4目標, F=5週時間, G=6メッセージ, H=7決済状態
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowEmail = String(row[2] || '').trim().toLowerCase();
    const status = String(row[7] || '').trim();
    if (rowEmail === email && status === '決済待ち') {
      day4Sheet.getRange(i + 1, 8).setValue('決済済');
      console.log('Day4申込 決済済に更新: 行' + (i + 1) + ' / ' + email);
      break; // 最初に一致した行のみ更新
    }
  }
}

/**
 * 選択日程の文字列を「2026/02/25 20:00-21:00」形式に整形
 * "Wed Feb 25 2026 00:00:00 GMT+0900 (日本標準時) 20:00 - 21:00" → "2026/02/25 20:00-21:00"
 * スプレッドシートの D列 で =formatScheduleDisplay(J2) または ARRAYFORMULA で使用可能
 */
function formatScheduleDisplay(val) {
  if (val && val.map) {
    return val.map(function(row) { return [formatScheduleDisplayImpl(row[0] != null ? row[0] : row)]; });
  }
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
  } catch (e) {
    return str;
  }
}

/**
 * Day4申込の条件付き書式を設定
 * 決済日（I列）が空 → 薄いピンク、決済日あり → 白（デフォルト）
 */
function setupDay4ConditionalFormat() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Day4申込');
  if (!sheet) return;
  const lastRow = Math.max(sheet.getLastRow(), 100);
  const range = sheet.getRange(2, 1, lastRow, 10);
  const rules = sheet.getConditionalFormatRules();
  const newRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=ISBLANK($I2)')
    .setBackground('#FFE4E1') // 薄いピンク
    .setRanges([range])
    .build();
  rules.push(newRule);
  sheet.setConditionalFormatRules(rules);
  console.log('Day4申込 条件付き書式を設定しました（決済日なし=薄いピンク）');
}

/**
 * Day4申込 条件付き書式を設定（決済日が無い行を薄いピンクに）
 */
function handleDay4ConditionalFormat() {
  setupDay4ConditionalFormat();
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
      day4Sheet.getRange(1, 1, 1, 10).setValues([['日時', '名前', 'メール', '選択日程', '目標', '週時間', 'メッセージ', '決済状態', '決済日', '選択日程(生)']]);
      day4Sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    }

    const now = new Date();
    const scheduleRaw = (selectedDate instanceof Date)
      ? selectedDate.toString() + ' ' + (String(selectedTime || '').trim())
      : (String(selectedDate || '').trim() + ' ' + String(selectedTime || '').trim()).trim();
    const scheduleDisplay = (selectedDate instanceof Date)
      ? Utilities.formatDate(selectedDate, 'Asia/Tokyo', 'yyyy/MM/dd') + ' ' + (String(selectedTime || '').trim())
      : (String(selectedDate || '').trim() + ' ' + String(selectedTime || '').trim()).trim();
    day4Sheet.appendRow([now, name, email, '', goal || '', time || '', message || '', '決済待ち', '', scheduleRaw]);

    // Stripe URL にメールを付与（prefilled_email）→ Webhook で顧客情報が取得できる
    const baseUrl = USE_TEST_STRIPE ? STRIPE_DAY4_URL_TEST : STRIPE_DAY4_URL;
    const stripeUrl = baseUrl + (email ? '?prefilled_email=' + encodeURIComponent(email) : '');

    // Day4 決済前の自動返信メール送信
    try {
      sendDay4ConfirmationEmail(email, name, scheduleDisplay);
    } catch (mailErr) {
      console.log('Day4自動返信メール送信エラー: ' + mailErr.message);
      // メール送信失敗でも申込処理は成功とする
    }

    return createJsonResponse({ success: true, stripeUrl: stripeUrl });
  } catch (err) {
    console.error('handleDay4Application エラー: ' + err.message);
    return createJsonResponse({ success: false, message: '申込処理でエラーが発生しました。' + err.message });
  }
}

/**
 * Day4 決済完了メール送信（Stripe Webhook でトリガー）
 * ワクワク・感謝・待ち遠しくなる内容
 */
function sendDay4PaymentCompletedEmail(email, name) {
  const nameAddressed = (name || '').trim() ? name.trim() + '様' : 'お客様';
  const subject = '【Kindle印税資産】決済完了＆当日が楽しみになりました！';

  const body = nameAddressed + '\n\n' +
    'こんにちは。\n' +
    'Kindle資産形成 事務局です。\n\n' +
    '決済が完了いたしました。\n' +
    'この度は誠にありがとうございます。\n\n' +
    '90分で、あなただけのマンガ1冊を\n' +
    'そのままお持ち帰りいただけます。\n\n' +
    '・印税で回り続ける「資産」の感覚\n' +
    '・あなた専用のゴールデンルート\n' +
    '・その日のうちに、仕組みがひとつ増える\n\n' +
    'その全てを、体感していただける日です。\n' +
    '私たちも、お会いできる日を\n' +
    '心より楽しみにしております。\n\n' +
    '当日のご案内は、別途メールでお送りします。\n' +
    'どうぞよろしくお願いいたします。\n\n' +
    '◆------------------------------------◆\n' +
    '運営者：Kindle資産形成事務局\n' +
    'お問い合わせ：' + ADMIN_EMAIL + '\n' +
    '（営業時間：平日10時から18時）\n' +
    '◆------------------------------------◆';

  MailApp.sendEmail(email, subject, body);
  console.log('Day4決済完了メール送信完了: ' + email);
}

/**
 * Day4 決済前の自動返信メール送信
 */
function sendDay4ConfirmationEmail(email, name, scheduleDisplay) {
  const nameAddressed = (name || '').trim() ? name.trim() + '様' : 'お客様';
  const subject = '【Kindle印税資産】実体験＆ゴールデンルートシミュレーション相談 決済のご案内';

  const body = nameAddressed + '\n\n' +
    'こんにちは。\n' +
    'Kindle資産形成 事務局です。\n\n' +
    'この度は\n' +
    '「実体験＆ゴールデンルートシミュレーション相談」\n' +
    'にお申し込みいただきまして\n' +
    '誠にありがとうございます。\n\n' +
    '【お申込内容】\n' +
    '参加希望日程：' + (scheduleDisplay || '（確認中）') + '\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '実体験前に準備していただくと良いもの\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '【1】APIキーの取得\n' +
    'APIキーはこのツールを使う為に必修になります。\n' +
    '特に日本語の使用の場合は必要です。\n' +
    '▼ ' + API_KEY_MANUAL_URL + '\n\n' +
    '【2】Kindle KDPアカウント\n' +
    '順調なペースで進めば当日、体験時間内でもKindleに書籍を並べる事が出来ます。\n' +
    '是非、Kindle KDPアカウントを取得しておいてください。\n' +
    '▼ ' + KDP_ACCOUNT_MANUAL_URL + '\n\n' +
    '【3】Kindle Create ダウンロード\n' +
    'Kindle書籍としてアップする専用のファイル形式に変換するツールです。\n' +
    '▼ ' + KINDLE_CREATE_MANUAL_URL + '\n\n' +
    'もしご準備が間に合わなくても大丈夫です。当日全て一緒に行う事も可能です。\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '決済のお手続きのご案内をさせて頂きます。\n' +
    'ご確認の上、ご対応をお願いいたします。\n\n' +
    '===================\n' +
    'クレジット決済を\n' +
    'お選びの方\n' +
    '===================\n\n' +
    '決済がお済みでない場合、\n' +
    '下記のリンクをご使用ください。\n\n' +
    (USE_TEST_STRIPE ? STRIPE_DAY4_URL_TEST : STRIPE_DAY4_URL) + '\n\n' +
    '※決済期日：本日から3日以内\n\n' +
    '※ご入金時の名義とお申込時のお名前が異なる場合は、事前にご連絡をお願いします。\n\n' +
    '以上です。\n\n' +
    '何かご不明な点がございましたら、\n' +
    '事務局までお問い合わせください。\n' +
    '↓\n' +
    ADMIN_EMAIL + '\n\n' +
    'ご確認のほど、どうぞよろしくお願い致します。\n\n' +
    '◆------------------------------------◆\n' +
    '運営者：Kindle資産形成事務局\n' +
    'お問い合わせは：' + ADMIN_EMAIL + '\n' +
    '（営業時間：平日10時から18時）\n' +
    '＊頂いたお問い合わせには3営業日以内に\n' +
    'お答えさせて頂いております。\n\n' +
    '◆------------------------------------◆';

  MailApp.sendEmail(email, subject, body);
  console.log('Day4決済前自動返信メール送信完了: ' + email);
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
      sheet.getRange(1, 1, 1, 6).setValues([['日時', 'メール', '名前', 'Day1送信済', 'Day2送信済', 'Day3送信済']]);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    }

    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
    sheet.appendRow([timestamp, email, name, '', '', '']);

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

/**
 * ステップメール（Day1〜Day3）を送信
 * トリガーで毎日9時（日本時間）に実行することを推奨
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
      if (daysSince >= 1 && !day1Sent) {
        sendDay1Email(email, name);
        sheet.getRange(i + 1, 4).setValue(Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'));
        sentCount++;
      }
      if (daysSince >= 2 && !day2Sent) {
        sendDay2Email(email, name);
        sheet.getRange(i + 1, 5).setValue(Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'));
        sentCount++;
      }
      if (daysSince >= 3 && !day3Sent) {
        sendDay3Email(email, name);
        sheet.getRange(i + 1, 6).setValue(Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'));
        sentCount++;
      }
    } catch (err) {
      console.log('ステップメール送信エラー 行' + (i + 1) + ': ' + err.message);
    }
  }
  if (sentCount > 0) console.log('ステップメール送信完了: ' + sentCount + '通');
}

/**
 * ステップメール用トリガーを設定（初回1回のみ実行）
 * プロジェクトのタイムゾーンを「日本標準時」にしておくこと
 */
function setupStepEmailTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendStepEmails') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendStepEmails')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  console.log('sendStepEmails トリガーを毎日9時（日本時間）に設定しました');
}

function sendDay1Email(email, name) {
  const displayName = (name && name.trim()) ? name.trim() + 'さん' : '';
  const subject = '【Kindle印税資産】Day1｜狙うべき市場は「マンガ」です——売れるテーマの見つけ方';
  const prompt = 'あなたは、Kindleマンガで印税資産を積み上げるためのリサーチ専門家です。\n\n以下の5段階のフィルターを使って、売れるテーマ候補を絞り込んでください。\n\n【フィルター1：市場データの収集】\n- Amazonのベストセラーランキング（電子コミック）で売れているジャンルを確認\n- Googleキーワードプランナーで検索ボリュームを確認\n- Twitter、Yahoo知恵袋で悩み・検索されているキーワードを探す\n→ 市場に存在するニーズを発見する\n\n【フィルター2：動画化確認】\n- そのキーワードがYouTubeで既に動画化されているか確認\n- 動画が多い＝その分野に需要がある証拠\n\n【フィルター3：痛みの有無】\n- ターゲットが「どうしても解決したい」具体的で切実な痛みがあるか\n- 「〇〇したい」は浅い。「3ヶ月で〇〇したい」「〇〇までに〇〇したい」は深い\n- 痛みが深いほど、人はお金を出す\n\n【フィルター4：シリーズ化の可能性】\n- 1冊では埋もれる。複数冊を積み上げられるテーマか\n- 例：ダイエット→「30代女性向け」「産後」「男性向け」と細分化できるか\n\n【フィルター5：競合分析】\n- Amazon Kindleで同じジャンルを検索し、ベストセラーがあるか確認\n- 競合がいる＝市場が確実に存在する証拠。良い兆候\n\n---\n私の興味・経験・専門分野は〇〇です。\n上記5段階フィルターを使って、売れるテーマ候補を5つ以上提案してください。';
  const body = (displayName ? displayName + '、' : '') + 'こんにちは。\n\n昨日の動画、ご覧いただきありがとうございました。\n\n今日から3日間、あなたのテーマ候補を絞っていく『発見』のステップを始めます。\n\n---\n\n【1】狙うべき市場は、マンガです\n\n電子書籍市場の約9割がマンガ（87.7%）です。文字の本はわずか1割。「1割の文字市場」にはAI作家が殺到して競争が激しくなっています。一方、9割のマンガ側は読者がいて市場が伸びています。結論：狙うべきはマンガ市場です。\n\n---\n\n【2】売れるテーマの見つけ方——5段階フィルター\n\n下記プロンプトをAI（ChatGPT、Claude、Geminiなど）に貼り付けて実行してください。\n\n' + prompt + '\n\n※「〇〇」をあなたの興味・経験・専門分野に置き換えてください。\n\n---\n\n【3】今夜の90分で、約束の一行を仕上げる\n\n上記プロンプトを実行し、出てきたテーマ候補のうちいちばん「これだ」と思うものを1つ選び、そのテーマを一行で書いてください（例：「30代女性が産後ダイエットで挫折する話」）。この「約束の一行」が、明日のDay2、Day3の体験につながります。\n\n---\n\n明日の朝9時に、Day2のメールをお送りします。\nDay2は『確信』——成功する人と失敗する人の決定的な違いが、ここで明確になります。\n\n楽しみにしていてください。\n\n※Day4の2,980円実体験（持ち帰り＝マンガ1冊）にご興味ある方は、事前アンケートにご回答ください。枠は1日2名まで。\n' + DAY4_ANKETO_URL;
  MailApp.sendEmail(email, subject, body);
}

function sendDay2Email(email, name) {
  const displayName = (name && name.trim()) ? name.trim() + 'さん' : '';
  const subject = '【Kindle印税資産】Day2｜成功する人と失敗する人の決定的な違い——リサーチが成功の鍵';
  const body = (displayName ? displayName + '、' : '') + 'こんにちは。\n\nDay1の5段階フィルター、【約束の一行】は決まりましたか？\n\n今日は『確信』——成功する人と失敗する人の決定的な違いをお伝えします。\n\n---\n\n【1】決定的な違いは「リサーチをやるか、やらないか」\n\n結果を出す人と出さない人。その違いは才能でも資金でもありません。「売れるテーマを、きちんとリサーチしたかどうか」です。Day1の5段階フィルターはそのための設計図。「なんとなくこれでいいか」と飛ばす人と、「市場・YouTube・痛み・シリーズ化・競合」をちゃんと見る人。後者のほうが、圧倒的に売れる本を出します。\n\n---\n\n【2】リサーチが成功の鍵である理由\n\n読者が「お金を出す理由」は、痛みの解決だからです。あなたの【約束の一行】は、読者の痛みに刺さる設計になっていますか？もしまだ決まっていないなら、今日のうちに5段階フィルターをもう一度実行してみてください。\n\n---\n\n【3】今日のアクション\n\nあなたの【約束の一行】を、「誰の・どんな痛みを解決するか」で書き直してください。痛みが明確になるほど、読者は「自分のことだ」と感じ、お金を出します。\n\n---\n\n明日の朝9時に、Day3のメールをお送りします。\nDay3は『感動』——ツール導入で、手動10時間かかる工程が90分で完結する体験をお伝えします。\n\n楽しみにしていてください。\n\n※Day4の2,980円実体験（持ち帰り＝マンガ1冊）にご興味ある方は、事前アンケートにご回答ください。\n' + DAY4_ANKETO_URL;
  MailApp.sendEmail(email, subject, body);
}

function sendDay3Email(email, name) {
  const displayName = (name && name.trim()) ? name.trim() + 'さん' : '';
  const subject = '【Kindle印税資産】Day3｜手動10時間→90分。あなたのマンガ1冊が、その日に資産になる';
  const body = (displayName ? displayName + '、' : '') + 'こんにちは。\n\n3日間チャレンジ、いよいよ最終日です。\n\n今日は『感動』——ツール導入で、手動10時間かかる工程が90分で完結する体験をお伝えします。\n\n---\n\n【1】90分で1冊——その仕組みの実態\n\n昔は手動だと10時間以上かかることも。いまはAIとテンプレとノウハウを使えば、90分で1冊の流れまで作れる時代です。絵が描けなくても、文章が苦手でも、可能です。この「90分で1冊」の体験——その驚きが、あなたの確信を決定づけます。\n\n---\n\n【2】あなたの【約束の一行】が、その日に資産になる\n\nDay1で決めた【約束の一行】が、その日のうちにマンガ1冊の形になり、Amazonに並ぶ。それが、Day4の2,980円実体験＆ゴールデンルートシミュレーション相談です。枠は1日2名まで。持ち帰り＝マンガ1冊。その日に出版可能です。\n\n---\n\n【3】今日のアクション\n\n・ebookをもう一度読み返す\n・Day4アンケートにご興味があればご回答\n▼ ' + DAY4_ANKETO_URL + '\n\n---\n\n3日間、おつかれさまでした。あなたは『月20万円の確信』を得るための土台を整えました。次は、実際に90分で1冊を作る体験で、確信を形にしてください。一緒に『仕組み資産』を構築しましょう。応援しています。';
  MailApp.sendEmail(email, subject, body);
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
