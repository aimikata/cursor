# Manga Hub - マンガ制作統合プラットフォーム

マンガ制作の全工程を統合したWebアプリケーションです。

## 機能

- **企画リサーチ**: 市場調査とターゲット分析
- **世界観設定**: 舞台・キャラ・トーン設定
- **ストーリー生成**: プロット作成〜脚本執筆
- **コマ割り**: 演出プランとコマ割り構成
- **画像生成**: AIによるマンガページ生成
- **英語校正**: 翻訳・グラマーチェック
- **Amazon戦略**: Kindle販売・メタデータ戦略

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. Vercelでリポジトリをインポート
3. 環境変数を設定（Vercelのダッシュボードで）
4. 自動デプロイが開始されます

### 環境変数の設定（Vercel）

Vercelのダッシュボードで以下の環境変数を設定してください：

- `GEMINI_API_KEY`: Google Gemini APIキー

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google Gemini API

## プロジェクト構造

```
app/
├── api/              # APIルート
├── components/        # Reactコンポーネント
├── lib/              # ユーティリティと型定義
└── page.tsx          # メインページ
```

## ライセンス

Private
