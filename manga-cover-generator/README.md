# 表紙生成ツール

世界観レポートから情報を取得して、高品質な書籍表紙を生成する独立ツールです。

## 機能

- **世界観レポートの自動読み込み**: JSON形式またはテキスト形式の世界観レポートから情報を抽出
- **エラーハンドリング**: JSONパースエラーが発生しても、部分的な情報を抽出して処理を継続
- **自動ジャンル判定**: 世界観レポートの内容から実用書/物語を自動判定
- **高品質な表紙生成**: Gemini 2.5 Flash Imageを使用した9:16アスペクト比の表紙画像生成

## セットアップ

```bash
cd manga-cover-generator
npm install
npm run dev
```

## 使い方

1. **APIキー設定**: 初回起動時にGemini APIキーを設定
2. **世界観レポートの読み込み（任意）**: 
   - 世界観レポートのJSONをテキストエリアに貼り付け
   - JSON形式でなくても、タイトルなどの主要情報があれば自動抽出
3. **表紙生成**:
   - タイトルを入力（世界観レポートから自動入力される場合あり）
   - ジャンルを選択（自動判定も可能）
   - 「表紙を生成」ボタンをクリック

## 世界観レポートの形式

以下の形式のJSONをサポートしています：

```json
{
  "seriesTitle": "タイトル",
  "volumes": [
    {
      "volumeNumber": 1,
      "title": "第1巻",
      "summary": "概要"
    }
  ],
  "worldview": {
    "coreRule": {
      "name": "核心ルール",
      "merit": "メリット",
      "demerit": "デメリット"
    },
    "keyLocations": [
      {
        "name": "場所名",
        "historicalBackground": "背景",
        "structuralFeatures": "特徴"
      }
    ]
  },
  "protagonist": {
    "name": "主人公名",
    "visualTags": "視覚的特徴"
  },
  "artStyleTags": "アートスタイル",
  "backgroundTags": "背景タグ"
}
```

JSON形式でなくても、テキストから主要情報（タイトルなど）を自動抽出します。

## 技術スタック

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini API (@google/genai)
