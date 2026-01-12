

import { Language } from './types';

export let translations = {
  en: {
    title: "BizManga AI",
    subtitle: "Business Comic Architecture",
    uploadScript: "Script (CSV)",
    uploadScriptPlaceholder: "Upload Business Script (CSV)",
    scriptLoaded: "Script Loaded",
    pagesLoaded: "Pages Queued",
    pageList: "Page Structure",
    uploadChars: "Cast & Assets",
    uploadCharsPlaceholder: "Upload Character Profiles (JPG/PNG)",
    tips: "Professional Tips",
    tip1: "Ensure CSV follows the standard layout template.",
    tip2: "Describe specific business attire (e.g., 'Navy Suit') for realism.",
    tip3: "Use 'Generate All' for consistent style batching.",
    poweredBy: "Powered by Gemini 3.0 / 2.5 Flash",
    generateAll: "Generate Full Manuscript",
    downloadAll: "Export All (ZIP)",
    noPages: "No Manuscript Loaded",
    noPagesSub: "Upload a CSV script to begin production.",
    page: "Page",
    generate: "Visualize",
    generating: "Rendering...",
    editRefine: "Refine / In-paint",
    fixPrompt: "Revise Instruction",
    regenerate: "Regenerate",
    retry: "Retry",
    waiting: "Ready to Render",
    generationFailed: "Rendering Failed",
    
    // Character Verification
    charLinkStatus: "Asset Link Status",
    noCharsFound: "No character references found in script",
    
    // Regenerate Modal
    fixModalTitle: "Revise Page / Regenerate",
    currentPrompt: "Current Scene Instruction",
    editOption: "Additional Direction",
    regenOption: "This direction will be appended to refine the output.",
    close: "Cancel",
    applyAndGenerate: "Apply & Render",

    // API Key Modal
    apiKeyRequired: "Studio Access Required",
    apiKeyExplain: "This professional tool requires a Gemini API Key. Your key is stored locally and used only for rendering.",
    getApiKey: "Get API Key (Google AI Studio)",
    saveAndStart: "Initialize Studio",
    apiKeyStorage: "Key stored in localStorage. Clear browser data to reset.",
  },
  ja: {
    title: "BizManga AI",
    subtitle: "ビジネスコミック制作スタジオ",
    uploadScript: "原稿データ (CSV)",
    uploadScriptPlaceholder: "CSV原稿をアップロード",
    scriptLoaded: "原稿読み込み完了",
    pagesLoaded: "ページ待機中",
    pageList: "ページ構成 (Page List)",
    uploadChars: "キャラクター・資料",
    uploadCharsPlaceholder: "人物画・資料をアップロード",
    tips: "制作のヒント",
    tip1: "30-50代向けのリアルな描写が得意です。",
    tip2: "「スーツの質感」や「オフィスの照明」など具体的に指示してください。",
    tip3: "ファンタジー表現は自動的にビジネスの隠喩に変換されます。",
    poweredBy: "Powered by Gemini 3.0 / 2.5 Flash",
    generateAll: "全ページ一括生成",
    downloadAll: "一括書き出し (ZIP)",
    noPages: "原稿がありません",
    noPagesSub: "CSVファイルをアップロードして制作を開始してください。",
    page: "Page",
    generate: "生成する",
    generating: "作画中...",
    editRefine: "画像編集 (修正)",
    fixPrompt: "指示修正 / 再生成",
    regenerate: "再生成",
    retry: "リトライ",
    waiting: "待機中",
    generationFailed: "生成失敗",

    // Character Verification
    charLinkStatus: "キャラクター紐付け",
    noCharsFound: "CSV内にキャラクター指定なし",

    // Regenerate Modal
    fixModalTitle: "ページの修正 / 再生成",
    currentPrompt: "現在のシーン指示",
    editOption: "追加ディレクション",
    regenOption: "この指示を追加して、再度作画を行います。",
    close: "閉じる",
    applyAndGenerate: "適用して作画",

    // API Key Modal
    apiKeyRequired: "APIキーが必要です",
    apiKeyExplain: "高品質な画像生成にはGoogle Gemini APIキーが必要です。キーはブラウザ内にのみ保存され、外部に送信されることはありません。",
    getApiKey: "APIキーを取得 (Google AI Studio)",
    saveAndStart: "スタジオを開始",
    apiKeyStorage: "キーはlocalStorageに保存されます。削除するにはブラウザデータをクリアしてください。",
  }
};

export function t(lang: Language, key: keyof typeof translations['en']): string {
  return translations[lang][key] || translations['en'][key];
}