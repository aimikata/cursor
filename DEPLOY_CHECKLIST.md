# Vercelデプロイ前チェックリスト

## ✅ 必須チェック項目

### 1. 環境変数の設定

Vercelのダッシュボードで以下の環境変数を設定してください：

- [ ] `GEMINI_API_KEY` - Google Gemini APIキー（必須）

**設定方法**:
1. Vercelダッシュボード → プロジェクト → Settings → Environment Variables
2. 変数名と値を入力
3. Environment: Production, Preview, Development すべてにチェック
4. 保存後、再デプロイを実行

### 2. ビルド確認

ローカルでビルドが成功することを確認：

```bash
npm run build
```

エラーが出た場合は修正してからデプロイしてください。

### 3. 型チェック

型エラーがないことを確認：

```bash
npm run type-check
```

**注意**: `manga-story-0112`フォルダ内のエラーは無視して構いません（プロジェクトのメインファイルではないため）

### 4. 依存関係の確認

`package.json`に必要なパッケージがすべて含まれていることを確認：

- [ ] `next`
- [ ] `react`
- [ ] `react-dom`
- [ ] `@google/generative-ai`
- [ ] `lucide-react`
- [ ] `tailwindcss`

### 5. ファイル構造の確認

以下のファイルが存在することを確認：

- [ ] `next.config.js`
- [ ] `tsconfig.json`
- [ ] `tailwind.config.ts`
- [ ] `postcss.config.js`
- [ ] `package.json`
- [ ] `.gitignore`

## 🔧 よくある問題と解決方法

### 問題1: ビルドエラー「Module not found」

**原因**: インポートパスが間違っている

**解決方法**:
- `@/amazon-assistant/types` → `@/app/lib/amazon-assistant/types` に修正済み
- 他のインポートパスも確認

### 問題2: 環境変数が読み込まれない

**原因**: 環境変数が設定されていない、または再デプロイしていない

**解決方法**:
1. Vercelダッシュボードで環境変数を確認
2. 環境変数を追加/変更した後、必ず再デプロイ
3. 変数名のタイプミスを確認（大文字小文字に注意）

### 問題3: ページが表示されない（404エラー）

**原因**: ルーティング設定の問題

**解決方法**:
- Next.js App Routerを使用しているため、`app/`ディレクトリ構造を確認
- `app/page.tsx`が存在することを確認

### 問題4: APIルートが動作しない（500エラー）

**原因**: サーバーサイドのエラー

**解決方法**:
1. Vercelのログを確認（Deployments → 該当デプロイ → Functions Log）
2. 環境変数が正しく設定されているか確認
3. APIルートのエラーハンドリングを確認

### 問題5: スタイルが適用されない

**原因**: Tailwind CSSの設定問題

**解決方法**:
- `tailwind.config.ts`の`content`パスを確認
- ビルド時にTailwindが正しく処理されているか確認

## 📝 デプロイ後の確認事項

1. **ホームページが表示されるか**
   - URLにアクセスして、ログイン画面が表示されることを確認

2. **APIが動作するか**
   - 各機能（リサーチ、世界観設定など）をテスト
   - ブラウザの開発者ツール（F12）でエラーを確認

3. **環境変数が正しく読み込まれているか**
   - APIを呼び出して、エラーメッセージを確認
   - 「GEMINI_API_KEY is not configured」エラーが出る場合は環境変数の設定を確認

## 🚀 デプロイ手順（再確認）

1. **GitHubにプッシュ**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Vercelでインポート**
   - Vercelダッシュボード → New Project
   - GitHubリポジトリを選択
   - 設定を確認（自動検出されるはず）

3. **環境変数を設定**
   - Settings → Environment Variables
   - `GEMINI_API_KEY`を追加

4. **デプロイ**
   - Deployボタンをクリック
   - ビルドが完了するまで待機

5. **動作確認**
   - 発行されたURLにアクセス
   - 各機能をテスト

## ⚠️ 重要な注意事項

1. **APIキーの管理**
   - 環境変数は絶対にGitHubにコミットしない
   - `.env`ファイルは`.gitignore`に含まれていることを確認

2. **レート制限**
   - Gemini APIのレート制限に注意
   - 本番環境での使用量を監視

3. **エラーハンドリング**
   - 本番環境では適切なエラーメッセージを表示
   - ユーザーに分かりやすいメッセージを提供

4. **パフォーマンス**
   - 画像の最適化を検討
   - API呼び出しの最適化を検討
