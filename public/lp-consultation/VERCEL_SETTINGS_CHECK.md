# Vercelダッシュボード設定確認方法

## 📋 設定確認の手順

### ステップ1: Vercelダッシュボードにアクセス

1. ブラウザで [https://vercel.com](https://vercel.com) にアクセス
2. ログイン（GitHubアカウントでログインしている場合が多い）

### ステップ2: プロジェクトを選択

1. ダッシュボードの「Projects」または「プロジェクト」をクリック
2. `lp-consultation` または関連するプロジェクト名をクリック
   - プロジェクト名が分からない場合は、一覧から探す
   - または、デプロイURLから判断（例：`lp-consultation-xxx.vercel.app`）

### ステップ3: Settings（設定）を開く

1. プロジェクトページの上部メニューから「**Settings**」をクリック
2. 左側のメニューから「**Build and Deployment**」を選択
   - ⚠️ **重要**: 「General」ではなく「**Build and Deployment**」を選択してください

### ステップ4: Root Directory（ルートディレクトリ）を確認

「Build and Deployment」セクションで以下を確認：

1. ページを下にスクロールして「**Root Directory**」という項目を探す
2. 現在の設定を確認：
   - 空欄または `./` → プロジェクトルートが設定されている（変更が必要）
   - `lp-consultation` → 正しく設定されている ✅

### ステップ5: 設定を変更（必要に応じて）

**Root Directoryが空欄または`./`の場合：**

1. 「Root Directory」の右側にある「**Edit**」または「編集」をクリック
2. 入力欄に `lp-consultation` と入力
3. 「**Save**」または「保存」をクリック
4. 自動的に再デプロイが開始されます

### ステップ6: Framework Preset（フレームワーク）を確認

同じ「Build and Deployment」セクションで：

1. **Framework Preset** を確認（Root Directoryの近くに表示されています）
2. 以下のいずれかに設定されていることを確認：
   - `Other`
   - `Static HTML`
   - または空欄（自動検出）

### ステップ7: その他の設定を確認

同じ「Build and Deployment」セクションで以下も確認：

1. **Build Command**: 空欄（静的ファイルのため不要）
2. **Output Directory**: 空欄または `.`
3. **Install Command**: 空欄でOK

---

## 🔍 確認すべき設定項目（まとめ）

| 項目 | 正しい設定 | 確認方法 |
|------|----------|---------|
| **Root Directory** | `lp-consultation` | Build and Deployment → Root Directory |
| **Framework Preset** | `Other` または `Static HTML` | General → Framework Preset |
| **Build Command** | 空欄 | Build & Development Settings |
| **Output Directory** | 空欄または `.` | Build & Development Settings |

---

## ⚠️ 設定変更後の注意事項

1. **自動再デプロイ**: 設定を変更すると、自動的に再デプロイが開始されます
2. **デプロイ完了を待つ**: 通常1-3分かかります
3. **ブラウザのキャッシュをクリア**: デプロイ完了後、`Ctrl + Shift + R`でハードリロード

---

## 🐛 設定が見つからない場合

### プロジェクトが見つからない場合

1. Vercelダッシュボードの「Projects」で一覧を確認
2. プロジェクト名で検索
3. または、デプロイURLから判断：
   - URL: `lp-consultation-xxx.vercel.app`
   - → プロジェクト名は `lp-consultation` の可能性が高い

### Settingsメニューが見つからない場合

1. プロジェクトページの上部メニューを確認
2. 「Settings」「設定」「⚙️」アイコンを探す
3. または、URLに `/settings` を追加して直接アクセス

---

## 💡 補足情報

### Root Directoryとは？

- プロジェクトのルートディレクトリを指定する設定
- `lp-consultation` に設定すると、Vercelはこのフォルダ内のファイルをデプロイします
- 設定しないと、プロジェクト全体（`app/`フォルダなど）がデプロイ対象になります

### なぜ設定が必要？

- `lp-consultation`フォルダは静的HTMLファイルのみ
- メインプロジェクト（Next.jsアプリ）とは別にデプロイしたい
- ルートディレクトリを指定することで、正しいファイルがデプロイされます

---

## 📞 トラブルシューティング

### 問題1: Root Directoryの設定が反映されない

**解決方法**:
1. 設定を保存後、手動で再デプロイ
2. Vercelダッシュボード → Deployments → 最新デプロイ → 「Redeploy」

### 問題2: デプロイが失敗する

**解決方法**:
1. Deploymentsタブでエラーログを確認
2. Build Logを確認してエラー内容を特定
3. 必要に応じて設定を調整

### 問題3: ファイルが表示されない

**解決方法**:
1. Root Directoryが正しく設定されているか確認
2. ファイルがGitにコミットされているか確認
3. `.vercelignore`で除外されていないか確認
