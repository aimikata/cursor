
import { Language } from './types';

export let translations = {
  en: {
    title: "MangaGen AI",
    subtitle: "Professional Studio",
    uploadScript: "Script (CSV)",
    uploadScriptPlaceholder: "Click to upload CSV script",
    scriptLoaded: "CSV Loaded Successfully",
    pagesLoaded: "Pages Loaded",
    pageList: "Page List (Verified)",
    uploadChars: "Reference Characters",
    uploadCharsPlaceholder: "Upload Character Sheets (JPG/PNG)",
    tips: "Tips",
    tip1: "Ensure CSV follows the standard template format.",
    tip2: "Reference image filenames in CSV must match uploaded files exactly.",
    tip3: "Use 'Generate All' for batch processing.",
    poweredBy: "Powered by Gemini 3.0 / 2.5 Flash",
    generateAll: "Generate All Pages",
    downloadAll: "Download All (ZIP)",
    noPages: "No pages loaded",
    noPagesSub: "Upload a CSV file to begin your manga creation.",
    page: "Page",
    generate: "Generate",
    generating: "Generating...",
    editRefine: "Refine Image",
    fixPrompt: "Fix / Regenerate",
    regenerate: "Regenerate",
    retry: "Retry",
    waiting: "Waiting to Generate",
    generationFailed: "Generation failed",
    
    // Model Selection
    modelLabel: "Model Selection",
    modelHigh: "Gemini 3.0 Pro (High Quality)",
    modelFast: "Gemini 2.5 Flash (Fast)",
    
    // Character Verification
    charLinkStatus: "Character Link Status",
    noCharsFound: "No character files found in script",
    
    // Regenerate Modal
    fixModalTitle: "Fix Page / Regenerate",
    currentPrompt: "Current Prompt for Page",
    editOption: "Additional Instruction",
    regenOption: "This instruction will be appended to the existing prompt.",
    close: "Close",
    applyAndGenerate: "Apply & Generate",

    // API Key Modal
    apiKeyRequired: "API Key Required",
    apiKeyExplain: "This app requires a Google Gemini API Key. Your key is stored locally.",
    getApiKey: "Get API Key",
    checkPricing: "Check Pricing & Limits",
    saveAndStart: "Save & Start",
    apiKeyStorage: "Key stored in localStorage. Clear browser data to reset.",
    freeTierTip: "Tip: To use the Free Tier, create a new project in Google AI Studio and DO NOT enable billing (do not add a credit card) for that project.",

    // Usage Monitor
    usageMonitor: "Cost Safety & Budget",
    requestsCount: "Daily Usage:",
    usageNote: "Usage is tracked locally to help you stay within budget.",
    setupBudgetAlert: "Set Budget Alert (Google Cloud)",
    changeKey: "Change API Key",
    dailyLimitReached: "Daily Limit Reached",
    dailyLimitReachedDesc: "You have reached the daily free limit for this model. Switch to 'Flash' model or try again tomorrow.",
    
    // Limits
    estDailyLimit: "Daily Free Limit:",
    limitHighDesc: "Limit: ~50 / day",
    limitFastDesc: "Limit: ~1,500 / day",
    limitReset: "(Resets daily)",
    
    // Cost Estimation
    costEstimateTitle: "Batch Cost Estimator",
    freeTierSafe: "Free Tier Optimized",
    paidTierWarning: "Est. Pay-As-You-Go Cost: ",
    freeRemaining: "Remaining Today: ",
    resetUsage: "Reset Counter",
    
    // Batch
    batchInfo: "Safety Mode Enabled",
    
    // Budget Mode
    budgetMode: "Free Tier Mode (Slow)",
    budgetModeDesc: "Optimized for Google AI Studio Free Plan. Throttles speed to avoid rate limits (2 RPM). Only free if your project has NO billing enabled.",
    generatingSlow: "Generating (Free Tier Mode...)",
    checkPlan: "Check My Plan",
  },
  ja: {
    title: "MangaGen AI",
    subtitle: "プロフェッショナルスタジオ",
    uploadScript: "原稿 (CSV)",
    uploadScriptPlaceholder: "CSV原稿をアップロード",
    scriptLoaded: "CSV読み込み完了",
    pagesLoaded: "ページ読み込み済み",
    pageList: "ページ構成一覧 (確認用)",
    uploadChars: "キャラクター参照画像",
    uploadCharsPlaceholder: "設定画をアップロード (JPG/PNG)",
    tips: "ヒント",
    tip1: "CSVは指定のテンプレート形式に従ってください。",
    tip2: "CSV内の参照ファイル名はアップロード画像と完全に一致させる必要があります。",
    tip3: "「一括生成」で全てのページを順番に作成します。",
    poweredBy: "Powered by Gemini 3.0 / 2.5 Flash",
    generateAll: "全ページ一括生成",
    downloadAll: "一括ダウンロード (ZIP)",
    noPages: "原稿がありません",
    noPagesSub: "CSVファイルをアップロードして開始してください。",
    page: "ページ",
    generate: "生成する",
    generating: "生成中...",
    editRefine: "画像編集 (In-painting)",
    fixPrompt: "修正 / 再生成",
    regenerate: "再生成",
    retry: "リトライ",
    waiting: "生成待機中",
    generationFailed: "生成失敗",

    // Model Selection
    modelLabel: "使用モデル",
    modelHigh: "Gemini 3.0 Pro (高画質)",
    modelFast: "Gemini 2.5 Flash (高速)",

    // Character Verification
    charLinkStatus: "キャラクター紐付け確認",
    noCharsFound: "CSV内にキャラクター指定が見つかりません",

    // Regenerate Modal
    fixModalTitle: "ページの修正 / 再生成",
    currentPrompt: "現在のプロンプト",
    editOption: "追加の指示 (Instruction)",
    regenOption: "この指示を既存のプロンプトの末尾に追加して再生成します。",
    close: "閉じる",
    applyAndGenerate: "適用して生成",

    // API Key Modal
    apiKeyRequired: "APIキーが必要です",
    apiKeyExplain: "Google Gemini APIキーが必要です。キーはブラウザ内にのみ保存されます。",
    getApiKey: "APIキーを取得",
    checkPricing: "料金・制限を確認 (無料枠あり)",
    saveAndStart: "保存して開始",
    apiKeyStorage: "キーはlocalStorageに保存されます。削除するにはブラウザデータをクリアしてください。",
    freeTierTip: "【重要】無料枠を使いたい場合、Google AI Studioで「新しいプロジェクト」を作成し、そのプロジェクトにはクレジットカードを登録しないでください。課金設定済みのプロジェクトのキーを使うと、低速モードでも料金が発生します。",

    // Usage Monitor
    usageMonitor: "予算管理・コスト防衛",
    requestsCount: "本日の生成数:",
    usageNote: "ブラウザ内で使用量を記録し、無料枠の目安を表示しています。",
    setupBudgetAlert: "予算アラートを設定 (Google Cloud)",
    changeKey: "APIキーを変更",
    dailyLimitReached: "本日の上限に達しました",
    dailyLimitReachedDesc: "このモデルの無料枠上限（Daily Limit）を超えました。モデルを「Flash」に切り替えるか、明日までお待ちください。",
    
    // Limits
    estDailyLimit: "無料枠の目安 (1日あたり):",
    limitHighDesc: "上限: 約 50枚 / 日",
    limitFastDesc: "上限: 約 1,500枚 / 日",
    limitReset: "(毎日リセット)",
    
    // Cost Estimation
    costEstimateTitle: "今回のバッチ見積もり",
    freeTierSafe: "無料枠モード (コスト目安: ¥0)",
    paidTierWarning: "従量課金モード (コスト目安): $",
    freeRemaining: "本日の残り: ",
    resetUsage: "カウンタをリセット",
    
    // Batch
    batchInfo: "コスト保護モード有効",
    
    // Budget Mode
    budgetMode: "無料枠モード (低速・安全)",
    budgetModeDesc: "Google AI Studioの「無料プラン」の制限（2RPM等）に合わせて速度を制御します。※課金設定済みのプロジェクトでは料金が発生します。",
    generatingSlow: "生成中 (無料枠モード: 待機中...)",
    checkPlan: "プランを確認する",
  }
};

export function t(lang: Language, key: keyof typeof translations['en']): string {
  return translations[lang][key] || translations['en'][key];
}
