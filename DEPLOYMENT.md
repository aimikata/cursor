# Vercelデプロイ手順

## 事前準備

### 1. GitHubリポジトリの作成

1. GitHubで新しいリポジトリを作成
2. ローカルで以下のコマンドを実行：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

### 2. 環境変数の確認

以下の環境変数が必要です：
- `GEMINI_API_KEY`: Google Gemini APIキー

## Vercelデプロイ手順

### 1. Vercelアカウントの作成

1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでログイン

### 2. プロジェクトのインポート

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
3. プロジェクト設定を確認：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (プロジェクトルート)
   - **Build Command**: `npm run build` (自動検出されるはず)
   - **Output Directory**: `.next` (自動検出されるはず)

### 3. 環境変数の設定

Vercelのプロジェクト設定で、以下の環境変数を追加：

| 変数名 | 値 |
|--------|-----|
| `GEMINI_API_KEY` | あなたのGemini APIキー |

**重要**: 環境変数を追加した後、再デプロイが必要です。

### 4. デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待機（通常1-3分）
3. デプロイが成功すると、URLが発行されます

## トラブルシューティング

### ビルドエラーが発生する場合

1. **型エラーの確認**:
   ```bash
   npm run type-check
   ```

2. **ローカルでビルドテスト**:
   ```bash
   npm run build
   ```

3. **ログの確認**:
   - Vercelダッシュボードの「Deployments」タブでログを確認

### 環境変数が反映されない場合

1. 環境変数を追加した後、必ず再デプロイを実行
2. 変数名のタイプミスを確認（大文字小文字に注意）
3. Vercelの「Settings」→「Environment Variables」で確認

### ページが表示されない場合

1. **404エラー**: ルーティング設定を確認
2. **500エラー**: サーバーサイドのエラーを確認（Vercelのログを参照）
3. **APIエラー**: 環境変数が正しく設定されているか確認

## 本番環境での注意点

1. **APIキーの管理**: 環境変数は絶対にGitHubにコミットしない
2. **レート制限**: Gemini APIのレート制限に注意
3. **エラーハンドリング**: 本番環境では適切なエラーメッセージを表示

## 継続的デプロイ

GitHubにプッシュすると、自動的にVercelで再デプロイされます。

- `main`ブランチへのプッシュ → 本番環境にデプロイ
- その他のブランチへのプッシュ → プレビュー環境にデプロイ
