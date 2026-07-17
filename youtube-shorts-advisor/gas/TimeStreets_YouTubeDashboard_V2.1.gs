/**
 * YouTube改善ダッシュボード V2.1
 * Time Streets 向け（チャンネル別シート運用）
 *
 * V2からの差分（今回の診断に必要な項目）:
 * - 動画尺_秒 を追加（contentDetails.duration）
 * - shares / engagedViews / 登録者増減 を Analytics から追加
 * - Shortsフィード経由再生数 を流入元から集計
 * - ChatGPT入力用の対象名を実チャンネル名に修正（INSIGHT MANGA固定を廃止）
 * - Time Streets向けの検索意図推定を追加
 *
 * まだAPIで取れない（Studio手動 or 未対応）:
 * - 視聴を選んだ割合（Stayed to watch / How many chose to view）
 * - スワイプされた割合
 * - Shortsフィード表示数（impessions。取得できるのはフィード経由の再生数）
 * - 維持率の最大下落秒数（audienceRetention は別関数で試験取得）
 * - 現在の冒頭文（手入力）
 */

const CONFIG = {
  CHANNEL_IDS: [
    'UCkD8_KvuA5egxWtW2vDmuKQ' // Time Streets
  ],

  RECENT_VIDEO_LIMIT: 10,
  ANALYTICS_DAYS_BACK: 7,
  TIMEZONE: 'Asia/Tokyo',

  ENGLISH_COUNTRIES: ['US', 'CA', 'GB', 'AU', 'NZ'],

  COUNTRY_NAMES: {
    JP: '日本', US: 'アメリカ', CA: 'カナダ', GB: 'イギリス', AU: 'オーストラリア',
    NZ: 'ニュージーランド', PH: 'フィリピン', IN: 'インド', ID: 'インドネシア',
    KR: '韓国', TW: '台湾', SG: 'シンガポール', MY: 'マレーシア', TH: 'タイ',
    VN: 'ベトナム', DE: 'ドイツ', FR: 'フランス', BR: 'ブラジル', MX: 'メキシコ', ZZ: '不明'
  },

  TRAFFIC_SOURCE_NAMES: {
    ADVERTISING: '広告', ANNOTATION: 'アノテーション', CAMPAIGN_CARD: 'カード',
    END_SCREEN: '終了画面', EXT_URL: '外部サイト', HASHTAGS: 'ハッシュタグ',
    LIVE_REDIRECT: 'ライブリダイレクト', NO_LINK_OTHER: '直接・不明',
    NOTIFICATION: '通知', PLAYLIST: '再生リスト', PRODUCT_PAGE: '商品ページ',
    PROMOTED: 'プロモーション', RELATED_VIDEO: '関連動画', SHORTS: 'Shortsフィード',
    SOUND_PAGE: 'サウンドページ', SUBSCRIBER: '登録チャンネル・ホーム',
    YT_CHANNEL: 'チャンネルページ', YT_OTHER_PAGE: 'YouTube内その他',
    YT_SEARCH: 'YouTube検索', VIDEO_REMIXES: 'リミックス'
  }
};

const SHEET_NAMES = {
  videos: '動画一覧',
  daily: '日次分析',
  country: '国別分析',
  traffic: '流入元分析',
  search: '検索キーワード分析',
  memo: '改善メモ',
  prompt: 'ChatGPT入力用',
  log: 'ログ',
  manual: 'Studio手動追記' // 視聴選択率などAPI外
};

const HEADERS = {
  '動画一覧': [
    '取得日', 'チャンネル名', 'チャンネルID', '動画タイトル', '動画ID', 'URL',
    '投稿日', '動画尺_秒', '累計再生数', '累計高評価数', '累計コメント数'
  ],
  '日次分析': [
    '取得日', '期間開始', '期間終了', 'チャンネル名', 'チャンネルID', '動画タイトル',
    '動画ID', 'URL', '投稿日', '公開後日数', '動画尺_秒',
    '累計再生数', '期間内再生数', 'engagedViews',
    '平均視聴時間_秒', '平均視聴率_%',
    '累計高評価数', '累計コメント数', '期間内シェア数',
    '登録者増', '登録者減', '登録者増減',
    'Shortsフィード経由再生数',
    '視聴を選んだ割合_%', // Studio手動（VLOOKUP想定）
    'スワイプされた割合_%', // Studio手動
    '維持率の最大下落秒数', // Studio手動 or retention試験
    '現在の冒頭文', // 手動
    '自動判定'
  ],
  '国別分析': [
    '取得日', '期間開始', '期間終了', 'チャンネル名', 'チャンネルID', '動画タイトル',
    '動画ID', '国コード', '国名', '視聴回数'
  ],
  '流入元分析': [
    '取得日', '期間開始', '期間終了', 'チャンネル名', 'チャンネルID', '動画タイトル',
    '動画ID', '流入元コード', '流入元名', '視聴回数'
  ],
  '検索キーワード分析': [
    '取得日', '期間開始', '期間終了', 'チャンネル名', 'チャンネルID', '動画タイトル',
    '動画ID', '検索キーワード', '視聴回数', '視聴者の期待メモ', '次の企画案メモ'
  ],
  '改善メモ': [
    '取得日', '期間開始', '期間終了', 'チャンネル名', 'チャンネルID',
    '一番伸びた動画', '止まった候補', '日本比率_%', '英語圏比率_%',
    '今日の仮説', '次に試す改善点_1つだけ'
  ],
  'ChatGPT入力用': [
    '作成日', '対象', 'コピー用テキスト'
  ],
  'ログ': [
    '日時', '種類', '対象', 'メッセージ'
  ],
  'Studio手動追記': [
    '動画ID', '視聴を選んだ割合_%', 'スワイプされた割合_%',
    '維持率の最大下落秒数', '現在の冒頭文', 'メモ', '更新日'
  ]
};

// ===== OAuth（Playground トークン）=====

function getAccessTokenFromRefresh() {
  const props = PropertiesService.getScriptProperties();
  const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    payload: {
      client_id: props.getProperty('OAUTH_CLIENT_ID'),
      client_secret: props.getProperty('OAUTH_CLIENT_SECRET'),
      refresh_token: props.getProperty('OAUTH_REFRESH_TOKEN'),
      grant_type: 'refresh_token'
    },
    muteHttpExceptions: true
  });

  const json = JSON.parse(response.getContentText());
  if (!json.access_token) {
    throw new Error('トークン取得失敗: ' + response.getContentText());
  }
  return json.access_token;
}

function analyticsQueryWithToken(params) {
  const token = getAccessTokenFromRefresh();
  const query = Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');

  const url = 'https://youtubeanalytics.googleapis.com/v2/reports?' + query;
  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  });

  const text = response.getContentText();
  const json = JSON.parse(text);
  if (json.error) {
    throw new Error(json.error.message || text);
  }
  return json;
}

function safeAnalyticsQuery(params, label) {
  try {
    return analyticsQueryWithToken(params);
  } catch (error) {
    logAction('API_ERROR', label, error.message);
    return null;
  }
}

// ===== メニュー =====

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('YouTube分析')
    .addItem('1. 初期セットアップ', 'setupSheets')
    .addItem('2. 今日の分析を取得', 'runDailyYouTubeDashboard')
    .addItem('3. 毎朝トリガーを作成', 'createDailyTrigger')
    .addSeparator()
    .addItem('対象チャンネル確認', 'checkTargetChannels')
    .addToUi();
}

function setupSheets() {
  Object.keys(HEADERS).forEach(function(sheetName) {
    const sheet = getOrCreateSheet(sheetName);
    sheet.clear();
    sheet.getRange(1, 1, 1, HEADERS[sheetName].length).setValues([HEADERS[sheetName]]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS[sheetName].length);
  });
  logAction('SETUP', 'Sheets', '初期シートを作成しました（V2.1）。');
}

function runDailyYouTubeDashboard() {
  validateConfig();
  setupIfNeeded();

  const today = new Date();
  const dateStr = formatDate(today);
  const endDate = formatDate(addDays(today, -1));
  const startDate = formatDate(addDays(today, -CONFIG.ANALYTICS_DAYS_BACK));

  clearRowsByDate(SHEET_NAMES.videos, dateStr);
  clearRowsByDate(SHEET_NAMES.daily, dateStr);
  clearRowsByDate(SHEET_NAMES.country, dateStr);
  clearRowsByDate(SHEET_NAMES.traffic, dateStr);
  clearRowsByDate(SHEET_NAMES.search, dateStr);
  clearRowsByDate(SHEET_NAMES.memo, dateStr);
  clearRowsByDate(SHEET_NAMES.prompt, dateStr);

  const allVideoRows = [];
  const allDailyRows = [];
  const allCountryRows = [];
  const allTrafficRows = [];
  const allSearchRows = [];
  const allMemoRows = [];
  const promptSections = [];
  const manualMap = loadManualStudioMap();

  CONFIG.CHANNEL_IDS.forEach(function(channelId) {
    try {
      const channel = getChannelInfo(channelId);
      const videos = getRecentVideos(channel.uploadsPlaylistId);

      if (!videos.length) {
        logAction('WARN', channel.title, '直近動画が取得できませんでした。');
        return;
      }

      const channelDailyRecords = [];
      const channelCountryRows = [];
      const channelTrafficRows = [];
      const channelSearchRows = [];

      videos.forEach(function(video) {
        const analytics = getVideoSummaryAnalytics(channel.id, video.id, startDate, endDate);
        const trafficRowsForVideo = getTrafficSourceAnalytics(channel.id, video.id, startDate, endDate);
        const shortsFeedViews = sumTrafficViews(trafficRowsForVideo, 'SHORTS');
        const manual = manualMap[video.id] || {};
        const status = makeStatus(video, analytics, shortsFeedViews);

        allVideoRows.push([
          dateStr, channel.title, channel.id, video.title, video.id, video.url,
          video.publishedAt, video.durationSec, video.viewCount, video.likeCount, video.commentCount
        ]);

        allDailyRows.push([
          dateStr, startDate, endDate, channel.title, channel.id, video.title, video.id,
          video.url, video.publishedAt, daysSince(video.publishedAt), video.durationSec,
          video.viewCount, analytics.views, analytics.engagedViews,
          analytics.averageViewDuration, analytics.averageViewPercentage,
          video.likeCount, video.commentCount, analytics.shares,
          analytics.subscribersGained, analytics.subscribersLost, analytics.subscribersNet,
          shortsFeedViews,
          manual.choseToWatchPct || '',
          manual.swipedAwayPct || '',
          manual.retentionDropSec || '',
          manual.hookText || '',
          status
        ]);

        const record = {
          channelTitle: channel.title,
          channelId: channel.id,
          title: video.title,
          id: video.id,
          url: video.url,
          publishedAt: video.publishedAt,
          durationSec: video.durationSec,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          analytics: analytics,
          shortsFeedViews: shortsFeedViews,
          manual: manual,
          status: status
        };
        channelDailyRecords.push(record);

        getCountryAnalytics(channel.id, video.id, startDate, endDate).forEach(function(row) {
          const code = row.country || '';
          const countryRow = [
            dateStr, startDate, endDate, channel.title, channel.id, video.title, video.id,
            code, countryName(code), Number(row.views || 0)
          ];
          allCountryRows.push(countryRow);
          channelCountryRows.push(countryRow);
        });

        trafficRowsForVideo.forEach(function(row) {
          const sourceCode = row.insightTrafficSourceType || '';
          const trafficRow = [
            dateStr, startDate, endDate, channel.title, channel.id, video.title, video.id,
            sourceCode, trafficSourceName(sourceCode), Number(row.views || 0)
          ];
          allTrafficRows.push(trafficRow);
          channelTrafficRows.push(trafficRow);
        });

        getSearchTermAnalytics(channel.id, video.id, startDate, endDate).forEach(function(row) {
          const term = row.insightTrafficSourceDetail || '';
          const searchRow = [
            dateStr, startDate, endDate, channel.title, channel.id, video.title, video.id,
            term, Number(row.views || 0), inferSearchIntent(term), ''
          ];
          allSearchRows.push(searchRow);
          channelSearchRows.push(searchRow);
        });
      });

      allMemoRows.push(
        buildImprovementMemoRow(dateStr, startDate, endDate, channel, channelDailyRecords, channelCountryRows, channelSearchRows)
      );

      promptSections.push(
        buildPromptSection(channel, startDate, endDate, channelDailyRecords, channelCountryRows, channelTrafficRows, channelSearchRows)
      );

      logAction('SUCCESS', channel.title, '分析取得が完了しました。');

    } catch (error) {
      logAction('CHANNEL_ERROR', channelId, error.message);
    }
  });

  appendRows(SHEET_NAMES.videos, allVideoRows);
  appendRows(SHEET_NAMES.daily, allDailyRows);
  appendRows(SHEET_NAMES.country, allCountryRows);
  appendRows(SHEET_NAMES.traffic, allTrafficRows);
  appendRows(SHEET_NAMES.search, allSearchRows);
  appendRows(SHEET_NAMES.memo, allMemoRows);

  writeChatGptPrompt(dateStr, startDate, endDate, promptSections, CONFIG.CHANNEL_IDS);
  logAction('SUCCESS', 'runDailyYouTubeDashboard', '全チャンネルの分析処理が完了しました。');
}

function validateConfig() {
  if (!CONFIG.CHANNEL_IDS || !CONFIG.CHANNEL_IDS.length) {
    throw new Error('CONFIG.CHANNEL_IDS にチャンネルIDを入れてください。');
  }
  CONFIG.CHANNEL_IDS.forEach(function(channelId) {
    if (!channelId || channelId.indexOf('UC') !== 0) {
      throw new Error('CHANNEL_IDS に実際のUCから始まるチャンネルIDを入れてください。現在の値: ' + channelId);
    }
  });
}

function getChannelInfo(channelId) {
  const response = YouTube.Channels.list('id,snippet,contentDetails', { id: channelId });
  if (!response.items || !response.items.length) {
    throw new Error('チャンネル情報を取得できませんでした: ' + channelId);
  }
  const item = response.items[0];
  return {
    id: item.id,
    title: item.snippet.title,
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads
  };
}

function checkTargetChannels() {
  validateConfig();
  const lines = CONFIG.CHANNEL_IDS.map(function(channelId, index) {
    const channel = getChannelInfo(channelId);
    return [
      '【' + (index + 1) + '】',
      'チャンネル名: ' + channel.title,
      'チャンネルID: ' + channel.id,
      'アップロード一覧ID: ' + channel.uploadsPlaylistId
    ].join('\n');
  });
  SpreadsheetApp.getUi().alert(lines.join('\n\n'));
}

function getRecentVideos(uploadsPlaylistId) {
  const playlistResponse = YouTube.PlaylistItems.list('snippet,contentDetails', {
    playlistId: uploadsPlaylistId,
    maxResults: CONFIG.RECENT_VIDEO_LIMIT
  });

  if (!playlistResponse.items || !playlistResponse.items.length) {
    return [];
  }

  const videoIds = playlistResponse.items.map(function(item) {
    return item.contentDetails.videoId;
  });

  const videoResponse = YouTube.Videos.list('snippet,statistics,contentDetails', {
    id: videoIds.join(',')
  });

  const videoMap = {};
  if (videoResponse.items && videoResponse.items.length) {
    videoResponse.items.forEach(function(item) {
      videoMap[item.id] = {
        id: item.id,
        title: item.snippet.title,
        publishedAt: formatDate(new Date(item.snippet.publishedAt)),
        url: 'https://youtu.be/' + item.id,
        durationSec: parseIsoDurationToSeconds(item.contentDetails && item.contentDetails.duration),
        viewCount: Number(item.statistics.viewCount || 0),
        likeCount: Number(item.statistics.likeCount || 0),
        commentCount: Number(item.statistics.commentCount || 0)
      };
    });
  }

  return videoIds.map(function(id) {
    return videoMap[id];
  }).filter(Boolean);
}

function parseIsoDurationToSeconds(iso) {
  if (!iso) return '';
  const m = String(iso).match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '';
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

function getVideoSummaryAnalytics(channelId, videoId, startDate, endDate) {
  // engagedViews / shares が使えない環境向けに段階フォールバック
  const metricSets = [
    'views,engagedViews,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,shares,subscribersGained,subscribersLost',
    'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,shares,subscribersGained,subscribersLost',
    'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost',
    'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage'
  ];

  let report = null;
  for (let i = 0; i < metricSets.length; i++) {
    report = safeAnalyticsQuery({
      ids: analyticsIds(channelId),
      startDate: startDate,
      endDate: endDate,
      metrics: metricSets[i],
      filters: 'video==' + videoId
    }, 'summary:' + channelId + ':' + videoId + ':try' + i);
    if (report) break;
  }

  const rows = reportToObjects(report);
  if (!rows.length) {
    return {
      views: 0,
      engagedViews: 0,
      estimatedMinutesWatched: 0,
      averageViewDuration: 0,
      averageViewPercentage: 0,
      shares: 0,
      subscribersGained: 0,
      subscribersLost: 0,
      subscribersNet: 0
    };
  }

  const row = rows[0];
  const gained = Number(row.subscribersGained || 0);
  const lost = Number(row.subscribersLost || 0);
  return {
    views: Number(row.views || 0),
    engagedViews: Number(row.engagedViews || 0),
    estimatedMinutesWatched: Number(row.estimatedMinutesWatched || 0),
    averageViewDuration: round(Number(row.averageViewDuration || 0), 1),
    averageViewPercentage: round(Number(row.averageViewPercentage || 0), 1),
    shares: Number(row.shares || 0),
    subscribersGained: gained,
    subscribersLost: lost,
    subscribersNet: gained - lost
  };
}

function getCountryAnalytics(channelId, videoId, startDate, endDate) {
  const report = safeAnalyticsQuery({
    ids: analyticsIds(channelId),
    startDate: startDate,
    endDate: endDate,
    metrics: 'views',
    dimensions: 'country',
    filters: 'video==' + videoId,
    sort: '-views',
    maxResults: 10
  }, 'country:' + channelId + ':' + videoId);
  return reportToObjects(report);
}

function getTrafficSourceAnalytics(channelId, videoId, startDate, endDate) {
  const report = safeAnalyticsQuery({
    ids: analyticsIds(channelId),
    startDate: startDate,
    endDate: endDate,
    metrics: 'views',
    dimensions: 'insightTrafficSourceType',
    filters: 'video==' + videoId,
    sort: '-views',
    maxResults: 10
  }, 'traffic:' + channelId + ':' + videoId);
  return reportToObjects(report);
}

function getSearchTermAnalytics(channelId, videoId, startDate, endDate) {
  const report = safeAnalyticsQuery({
    ids: analyticsIds(channelId),
    startDate: startDate,
    endDate: endDate,
    metrics: 'views',
    dimensions: 'insightTrafficSourceDetail',
    filters: 'video==' + videoId + ';insightTrafficSourceType==YT_SEARCH',
    sort: '-views',
    maxResults: 25
  }, 'search:' + channelId + ':' + videoId);
  return reportToObjects(report);
}

function sumTrafficViews(trafficRows, sourceCode) {
  let total = 0;
  trafficRows.forEach(function(row) {
    if ((row.insightTrafficSourceType || '') === sourceCode) {
      total += Number(row.views || 0);
    }
  });
  return total;
}

function loadManualStudioMap() {
  const sheet = getOrCreateSheet(SHEET_NAMES.manual);
  const lastRow = sheet.getLastRow();
  const map = {};
  if (lastRow <= 1) return map;
  const values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  values.forEach(function(row) {
    const videoId = String(row[0] || '').trim();
    if (!videoId) return;
    const chose = row[1] === '' ? '' : Number(row[1]);
    const swipe = row[2] === '' ? '' : Number(row[2]);
    map[videoId] = {
      choseToWatchPct: chose,
      swipedAwayPct: swipe !== '' ? swipe : (chose !== '' ? round(100 - chose, 1) : ''),
      retentionDropSec: row[3] === '' ? '' : Number(row[3]),
      hookText: row[4] || ''
    };
  });
  return map;
}

function reportToObjects(report) {
  if (!report || !report.rows || !report.columnHeaders) return [];
  const headers = report.columnHeaders.map(function(header) { return header.name; });
  return report.rows.map(function(row) {
    const obj = {};
    headers.forEach(function(name, index) { obj[name] = row[index]; });
    return obj;
  });
}

function analyticsIds(channelId) {
  return 'channel==' + channelId;
}

function buildImprovementMemoRow(dateStr, startDate, endDate, channel, dailyRecords, countryRows, searchRows) {
  const best = dailyRecords.slice().sort(function(a, b) {
    return b.analytics.views - a.analytics.views;
  })[0];

  const stalledCandidates = dailyRecords.filter(function(record) {
    return record.viewCount >= 100 && record.viewCount <= 350;
  });

  const stalledText = stalledCandidates.length
    ? stalledCandidates.map(function(r) { return r.title; }).join(' / ')
    : '明確な停滞候補なし';

  const countrySummary = calcCountrySummary(countryRows);
  const hypothesis = makeHypothesis(best, stalledCandidates, countrySummary, searchRows);
  const action = makeOneAction(best, stalledCandidates, countrySummary, searchRows);

  return [
    dateStr, startDate, endDate, channel.title, channel.id,
    best ? best.title : '', stalledText,
    countrySummary.jpRate, countrySummary.enRate,
    hypothesis, action
  ];
}

function buildPromptSection(channel, startDate, endDate, dailyRecords, countryRows, trafficRows, searchRows) {
  const dailyText = dailyRecords.map(function(r) {
    return [
      '- ' + r.title,
      '  URL: ' + r.url,
      '  投稿日: ' + r.publishedAt,
      '  動画尺: ' + r.durationSec + '秒',
      '  累計再生数: ' + r.viewCount,
      '  期間内再生数: ' + r.analytics.views,
      '  engagedViews: ' + r.analytics.engagedViews,
      '  平均視聴時間: ' + r.analytics.averageViewDuration + '秒',
      '  平均視聴率: ' + r.analytics.averageViewPercentage + '%',
      '  高評価: ' + r.likeCount,
      '  コメント: ' + r.commentCount,
      '  シェア: ' + r.analytics.shares,
      '  Shortsフィード経由再生: ' + r.shortsFeedViews,
      '  視聴を選んだ割合: ' + (r.manual.choseToWatchPct !== undefined && r.manual.choseToWatchPct !== '' ? r.manual.choseToWatchPct + '%' : '未記入（Studio手動）'),
      '  維持率の最大下落秒数: ' + (r.manual.retentionDropSec || '未記入'),
      '  現在の冒頭文: ' + (r.manual.hookText || '未記入'),
      '  判定: ' + r.status
    ].join('\n');
  }).join('\n\n');

  const countryText = sortRowsByViews(countryRows, 9).slice(0, 40).map(function(row) {
    return '- ' + row[5] + ' / ' + row[8] + ': ' + row[9] + '回';
  }).join('\n');

  const trafficText = sortRowsByViews(trafficRows, 9).slice(0, 40).map(function(row) {
    return '- ' + row[5] + ' / ' + row[8] + ': ' + row[9] + '回';
  }).join('\n');

  const searchText = searchRows.length
    ? sortRowsByViews(searchRows, 8).slice(0, 50).map(function(row) {
        return '- ' + row[5] + ' / "' + row[7] + '": ' + row[8] + '回 / 期待: ' + row[9];
      }).join('\n')
    : '検索キーワードデータなし';

  const countrySummary = calcCountrySummary(countryRows);

  return [
    '==============================',
    'チャンネル: ' + channel.title,
    'チャンネルID: ' + channel.id,
    '分析期間: ' + startDate + '〜' + endDate,
    '',
    '【チャンネル国別サマリー】',
    '日本比率: ' + countrySummary.jpRate + '%',
    '英語圏比率: ' + countrySummary.enRate + '%',
    '',
    '【動画別分析】',
    dailyText || '動画別データなし',
    '',
    '【国別分析】',
    countryText || '国別データなし',
    '',
    '【流入元分析】',
    trafficText || '流入元データなし',
    '',
    '【検索キーワード分析】',
    searchText,
    '',
    '【診断時の優先順位】',
    '1. 視聴を選んだ割合が60%未満 → 冒頭1秒を変える（再投稿検証候補）',
    '2. 入口OKで平均視聴率が65%未満 → 中盤の秒数を指定して削る',
    '3. 維持OKで再生が弱い → タイトルを One Day / Route / 作品名型へ',
    '4. 再生ありで反応が薄い → 末尾CTAを Save this itinerary に固定'
  ].join('\n');
}

function writeChatGptPrompt(dateStr, startDate, endDate, promptSections, channelIds) {
  const targetName = (promptSections[0] && promptSections[0].indexOf('チャンネル: ') !== -1)
    ? promptSections[0].split('\n')[1].replace('チャンネル: ', '')
    : 'Time Streets';

  const prompt = [
    'YouTube Shorts（Time Streets）の直近動画を分析し、伸びた動画・止まった動画・国別視聴・視聴維持率を確認して、次の動画で試す改善点を1つだけ提案してください。',
    '',
    '提案形式の必須条件:',
    '- 「冒頭を改善して」ではなく、変更前テキスト → 変更後テキスト（英語＋日本語意味）まで書く',
    '- 原因は1つだけ選ぶ',
    '- 「次の新作で試す」か「同じ動画を1点変更して再投稿」かを明示する',
    '',
    '取得日: ' + dateStr,
    '分析期間: ' + startDate + '〜' + endDate,
    'CHANNEL_IDS: ' + (channelIds || []).join(', '),
    '',
    promptSections.join('\n\n'),
    '',
    '==============================',
    '出力してほしい内容:',
    '1. 一番伸びた動画',
    '2. 止まった動画',
    '3. 英語圏に届いているか',
    '4. 視聴維持率/視聴選択率から見た弱点（取れる数値だけで判断）',
    '5. 検索キーワードから分かる視聴者の期待',
    '6. 次に試す改善点を1つだけ（変更前→変更後）',
    '',
    '注意:',
    '改善点は複数出さず、次の動画で検証しやすい1つに絞ってください。',
    '視聴を選んだ割合が未記入の場合は、その旨を書き、取れた数値から最も確度の高い原因を1つ選んでください。'
  ].join('\n');

  appendRows(SHEET_NAMES.prompt, [[dateStr, targetName, prompt]]);
}

function makeStatus(video, analytics, shortsFeedViews) {
  const notes = [];
  if (analytics.views >= 100) notes.push('期間内で動きあり');
  if (video.viewCount >= 100 && video.viewCount <= 350) notes.push('200再生前後の停滞候補');
  if (analytics.averageViewPercentage > 0 && analytics.averageViewPercentage < 65) notes.push('維持率低め(Time Streets目安65%)');
  if (analytics.averageViewPercentage >= 80) notes.push('維持率良好');
  if (analytics.averageViewDuration >= 20) notes.push('平均視聴時間長め');
  if (shortsFeedViews > 0) notes.push('Shorts流入あり');
  if (analytics.engagedViews > 0 && analytics.views > 0) {
    const ratio = round((analytics.engagedViews / analytics.views) * 100, 1);
    notes.push('engaged/views=' + ratio + '%');
  }
  if (!notes.length) notes.push('要観察');
  return notes.join(' / ');
}

function calcCountrySummary(countryRows) {
  let total = 0, jp = 0, en = 0;
  countryRows.forEach(function(row) {
    const code = row[7];
    const views = Number(row[9] || 0);
    total += views;
    if (code === 'JP') jp += views;
    if (CONFIG.ENGLISH_COUNTRIES.indexOf(code) !== -1) en += views;
  });
  return {
    total: total,
    jpRate: total ? round((jp / total) * 100, 1) : 0,
    enRate: total ? round((en / total) * 100, 1) : 0
  };
}

function makeHypothesis(best, stalledCandidates, countrySummary, searchRows) {
  if (countrySummary.total === 0) {
    return '国別データがまだ少ないため、まずは視聴回数・平均視聴率・流入元を優先して確認。';
  }
  if (countrySummary.jpRate >= 70 && countrySummary.enRate < 10) {
    return '英語旅行動画なのに日本比率が高め。タイトル/冒頭が英語圏の旅行意図（route/one day/anime）になっていない可能性。';
  }
  if (best && best.analytics.averageViewPercentage >= 80) {
    return '維持率が良い動画がある。Through Timeより、伸びた型の冒頭・条件提示・Local Tipを横展開したい。';
  }
  if (searchRows.length) {
    return '検索キーワードが出ているため、都市名より作品名/ルート条件をタイトル前半に出す価値がある。';
  }
  if (stalledCandidates.length) {
    return '200再生前後で止まる動画がある。初期配信か冒頭1秒（眺め→使える旅程）の入口を疑う。';
  }
  return '大きな偏りは未確定。次はタイトルか冒頭のどちらか1点だけ変えて比較する。';
}

function makeOneAction(best, stalledCandidates, countrySummary, searchRows) {
  if (countrySummary.jpRate >= 70 && countrySummary.enRate < 10) {
    return '次の新作タイトルを「City, year → 2026 — Through Time」から「City in One Day: This Exact Order」に変更する。';
  }
  if (best && best.analytics.averageViewPercentage > 0 && best.analytics.averageViewPercentage < 65) {
    return '中盤の説明を削り、20秒地点に次スポット＋移動時間の予告を入れる。';
  }
  if (searchRows.length) {
    const topSearch = sortRowsByViews(searchRows, 8)[0];
    const term = topSearch ? topSearch[7] : '';
    return term
      ? '検索キーワード「' + term + '」を次のタイトル先頭か冒頭テロップ1行目に入れる。'
      : '検索キーワードから1語だけ選び、次のタイトル先頭に入れる。';
  }
  if (stalledCandidates.length) {
    return '末尾を「Save this itinerary for your trip.」に固定し、旅程一覧カードを最後に残す。';
  }
  return '次の新作は作品名（Your Name / Ghibli / Slam Dunk）をタイトル前半に出す。';
}

function inferSearchIntent(term) {
  const t = String(term || '').toLowerCase();
  if (!t) return '';
  // Time Streets / 旅行
  if (containsAny(t, ['itinerary', 'one day', 'day trip', 'route', 'map', 'travel', 'trip', 'guide'])) {
    return '使える旅程・ルートを探している';
  }
  if (containsAny(t, ['osaka', 'tokyo', 'kyoto', 'okinawa', 'nara', 'hiroshima', 'hokkaido', 'dotonbori'])) {
    return '特定都市の歩き方・見どころを探している';
  }
  if (containsAny(t, ['your name', 'ghibli', 'spirited away', 'slam dunk', 'anime', 'pilgrimage', 'seichi'])) {
    return 'アニメ聖地・作品起点の旅行を探している';
  }
  if (containsAny(t, ['then and now', 'through time', 'old tokyo', 'edo', '1950', '1920'])) {
    return '昔と今の比較・街の変化を見たい';
  }
  // 旧INSIGHT系（他チャンネル流用時）
  if (containsAny(t, ['cheating', 'affair', 'toxic', 'family', 'money', 'debt'])) {
    return '人間ドラマ・家族/お金の葛藤を見たい';
  }
  return '検索意図を要確認';
}

function containsAny(text, words) {
  return words.some(function(word) {
    return text.indexOf(word) !== -1;
  });
}

function createDailyTrigger() {
  const functionName = 'runDailyYouTubeDashboard';
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  ScriptApp.newTrigger(functionName).timeBased().everyDays(1).atHour(8).create();
  logAction('TRIGGER', functionName, '毎朝8時台のトリガーを作成しました。');
}

function setupIfNeeded() {
  Object.keys(HEADERS).forEach(function(sheetName) {
    const sheet = getOrCreateSheet(sheetName);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS[sheetName].length).setValues([HEADERS[sheetName]]);
      sheet.setFrozenRows(1);
    }
  });
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function appendRows(sheetName, rows) {
  if (!rows || !rows.length) return;
  const sheet = getOrCreateSheet(sheetName);
  const startRow = sheet.getLastRow() + 1;
  const width = HEADERS[sheetName].length;
  const normalized = rows.map(function(row) {
    const copy = row.slice(0, width);
    while (copy.length < width) copy.push('');
    return copy;
  });
  sheet.getRange(startRow, 1, normalized.length, width).setValues(normalized);
}

function clearRowsByDate(sheetName, dateStr) {
  const sheet = getOrCreateSheet(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    const value = values[i][0];
    const cellDate = value instanceof Date ? formatDate(value) : String(value);
    if (cellDate === dateStr) sheet.deleteRow(i + 2);
  }
}

function logAction(type, target, message) {
  const sheet = getOrCreateSheet(SHEET_NAMES.log);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS[SHEET_NAMES.log].length).setValues([HEADERS[SHEET_NAMES.log]]);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss'),
    type, target, message
  ]);
}

function formatDate(date) {
  return Utilities.formatDate(new Date(date), CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function addDays(date, days) {
  const copied = new Date(date);
  copied.setDate(copied.getDate() + days);
  return copied;
}

function daysSince(dateStr) {
  const published = new Date(dateStr + 'T00:00:00+09:00');
  const today = new Date();
  return Math.max(0, Math.floor((today.getTime() - published.getTime()) / (1000 * 60 * 60 * 24)));
}

function countryName(code) {
  return CONFIG.COUNTRY_NAMES[code] || code || '不明';
}

function trafficSourceName(code) {
  return CONFIG.TRAFFIC_SOURCE_NAMES[code] || code || '不明';
}

function round(num, digit) {
  const base = Math.pow(10, digit);
  return Math.round(num * base) / base;
}

function sortRowsByViews(rows, viewIndex) {
  return rows.slice().sort(function(a, b) {
    return Number(b[viewIndex] || 0) - Number(a[viewIndex] || 0);
  });
}

function testAnalyticsForConfigChannels() {
  const today = new Date();
  const endDate = formatDate(addDays(today, -2));
  const startDate = formatDate(addDays(today, -30));

  CONFIG.CHANNEL_IDS.forEach(function(channelId) {
    try {
      const channel = getChannelInfo(channelId);
      const report = analyticsQueryWithToken({
        ids: 'channel==' + channelId,
        startDate: startDate,
        endDate: endDate,
        metrics: 'views,estimatedMinutesWatched,averageViewDuration',
        dimensions: 'day',
        sort: '-day',
        maxResults: 5
      });

      const rowCount = report && report.rows ? report.rows.length : 0;
      const firstRow = rowCount > 0 ? report.rows[0].join(' / ') : 'no rows';

      logAction(
        'ANALYTICS_CONFIG_TEST_OK',
        channel.title + ' (' + channelId + ')',
        '期間: ' + startDate + '〜' + endDate + ' / rows: ' + rowCount + ' / firstRow: ' + firstRow
      );
    } catch (error) {
      logAction('ANALYTICS_CONFIG_TEST_ERROR', channelId, error.message);
    }
  });
}
