# Vercelへのデプロイ手順（lp-consultation）

## 📋 前提条件

- `lp-consultation`フォルダは静的HTMLファイル（index.html, slides.html, simulator.html）
- Vercelは静的サイトとして自動的にデプロイ可能

---

## 🎬 動画差し替え後のデプロイ（いますぐやる場合）

LPの埋め込み動画を差し替えたあと、本番（https://lp-consultation.vercel.app/）に反映するには、**下記のいずれか**を実行してください。

### 方法A：Git でプッシュ（Vercel と連携している場合）

1. **PowerShell** を開き、`cd f:\AI\manga\cursor` でリポジトリのルートへ移動
2. `git add lp-consultation/index.html`
3. `git commit -m "LP埋め込み動画を本編に差し替え（pCM2Dg3_iIk）"`
4. `git push origin main`
5. Vercel が連携されていれば、数分で本番に自動デプロイされます

### 方法B：Vercel CLI で直接デプロイ

1. **PowerShell** を開き、`cd f:\AI\manga\cursor\lp-consultation` で lp-consultation へ移動
2. `vercel --prod` を実行（未ログインの場合は先に `vercel login`）
3. 表示された URL が本番です

---

## 💻 PowerShellの使い方（初心者向け）

### PowerShellとは？

PowerShellは、Windowsでコマンドを実行するためのツールです。ファイルの操作やGitの操作などができます。

### PowerShellの開き方（3つの方法）

**方法1: スタートメニューから**
1. Windowsキー（キーボード左下）を押す
2. 「PowerShell」と入力
3. 「Windows PowerShell」をクリック

**方法2: ファイルエクスプローラーから**
1. `lp-consultation`フォルダを開く
2. アドレスバー（上部）をクリック
3. 「powershell」と入力してEnterキーを押す

**方法3: 右クリックメニューから**
1. `lp-consultation`フォルダを右クリック
2. 「PowerShellウィンドウをここで開く」を選択（表示されない場合があります）

### コマンドの実行方法

1. **コマンドをコピー**: このドキュメント内のコマンドをマウスで選択してCtrl+C
2. **PowerShellに貼り付け**: PowerShellのウィンドウをクリックして、右クリック → 貼り付け（またはCtrl+V）
3. **Enterキーを押す**: コマンドが実行されます

**注意**: 
- コマンドは1つずつ実行してください
- 前のコマンドが完了するまで待ってから、次のコマンドを実行してください

---

## 🚀 方法1: Git経由で自動デプロイ（推奨）

### PowerShellの開き方

1. **Windowsキーを押す**（またはスタートメニューをクリック）
2. **「PowerShell」と入力**して検索
3. **「Windows PowerShell」をクリック**して開く
   - または、**「Windows Terminal」**があればそれでもOK

### ステップ1: Gitロックファイルの削除（必要に応じて）

PowerShellが開いたら、以下のコマンドを**1行ずつ**コピー＆ペーストして、**Enterキー**を押します：

```powershell
Remove-Item F:\AI\manga\cursor\.git\index.lock -ErrorAction SilentlyContinue
```

**実行方法**:
1. 上記のコマンドをマウスで選択してコピー（Ctrl+C）
2. PowerShellのウィンドウをクリック
3. 右クリックして貼り付け（またはCtrl+V）
4. Enterキーを押す

**注意**: エラーが出ても問題ありません（ファイルが存在しない場合など）

### ステップ2: ファイルをGitに追加

**現在の場所**: PowerShellのプロンプトが `PS C:\WINDOWS\System32>` となっている場合、まず作業フォルダに移動する必要があります。

以下のコマンドを**順番に**実行します：

**① まず、作業フォルダに移動します：**

```powershell
cd f:\AI\manga\cursor
```

**実行方法**:
1. 上記のコマンドをコピー（マウスで選択してCtrl+C）
2. PowerShellのウィンドウをクリック
3. 右クリックして貼り付け（またはCtrl+V）
4. Enterキーを押す
5. プロンプトが `PS F:\AI\manga\cursor>` に変わることを確認

**② 次に、ファイルをGitに追加します：**

```powershell
git add lp-consultation/
```

**実行方法**:
- 上記のコマンドをコピーして、PowerShellに貼り付け、Enterキーを押す
- エラーメッセージが出ないことを確認

**注意**: 
- 各コマンドは1つずつ実行してください
- 前のコマンドが完了してから、次のコマンドを実行してください

### ステップ3: コミット

```powershell
git commit -m "LPとスライドを更新: スライド番号追加、スクリプトと順番を一致"
```

### ステップ4: プッシュ

```powershell
git push origin main
```

**実行の流れ**:
1. ステップ1のコマンドを実行（Enter）
2. ステップ2の1つ目のコマンドを実行（Enter）
3. ステップ2の2つ目のコマンドを実行（Enter）
4. ステップ3のコマンドを実行（Enter）
5. ステップ4のコマンドを実行（Enter）

### ステップ5: Vercelの自動デプロイ確認

- Vercelダッシュボードにアクセス
- プロジェクトの「Deployments」タブを確認
- 新しいデプロイが自動的に開始されます（通常1-3分）

---

## 🔧 方法2: Vercel CLIで直接デプロイ

### PowerShellの開き方

1. **Windowsキーを押す**（またはスタートメニューをクリック）
2. **「PowerShell」と入力**して検索
3. **「Windows PowerShell」をクリック**して開く

### ステップ1: Vercel CLIのインストール（未インストールの場合）

PowerShellで以下のコマンドを実行：

```powershell
npm install -g vercel
```

**実行方法**:
1. コマンドをコピー（Ctrl+C）
2. PowerShellに貼り付け（右クリックまたはCtrl+V）
3. Enterキーを押す
4. インストールが完了するまで待つ（1-2分かかる場合があります）

### ステップ2: Vercelにログイン

まず、lp-consultationフォルダに移動：

```powershell
cd f:\AI\manga\cursor\lp-consultation
```

Enterキーを押した後、次を実行：

```powershell
vercel login
```

**実行方法**:
- ブラウザが自動的に開きます
- Vercelのアカウントでログインしてください
- ログインが完了すると、PowerShellに「Success!」と表示されます

### ステップ3: デプロイ

**プレビュー環境にデプロイ**（テスト用）:

```powershell
vercel
```

**本番環境にデプロイ**（公開用）:

```powershell
vercel --prod
```

**実行方法**:
- コマンドをコピーしてPowerShellに貼り付け
- Enterキーを押す
- いくつか質問されるので、Enterキーを押してデフォルトを選択
- デプロイが完了するとURLが表示されます

---

## ⚙️ Vercelプロジェクト設定

### 静的サイトとして設定する場合

`lp-consultation`フォルダをルートとして設定：

1. Vercelダッシュボード → プロジェクト → Settings
2. **Root Directory** を `lp-consultation` に設定
3. **Framework Preset** を `Other` または `Static HTML` に設定
4. **Build Command** は空欄（静的ファイルのため不要）
5. **Output Directory** は空欄または `.`（ルートディレクトリ）

### サブディレクトリとして設定する場合

メインプロジェクトの一部として設定：

1. Vercelダッシュボード → プロジェクト → Settings
2. **Root Directory** は `./`（プロジェクトルート）
3. ルーティング設定で `/lp-consultation` パスを設定

---

## 📁 デプロイされるファイル

以下のファイルがデプロイされます：

- ✅ `index.html` - ランディングページ
- ✅ `slides.html` - セールススライド
- ✅ `simulator.html` - シミュレーター
- ✅ `sales-talk-script-v2.md` - セールストークスクリプト（参考用）

**除外されるファイル**（`.vercelignore`で指定）：
- ❌ `0122.mp4` - 元の動画ファイル（圧縮版のみアップロード）
- ❌ `*.log` - ログファイル
- ❌ `node_modules/` - 依存関係

---

## 🔍 デプロイ後の確認

### 1. URLの確認

Vercelから発行されたURLにアクセスして以下を確認：

- ✅ `https://your-project.vercel.app/index.html` - LPが表示される
- ✅ `https://your-project.vercel.app/slides.html` - スライドが表示される
- ✅ `https://your-project.vercel.app/simulator.html` - シミュレーターが動作する

### 2. スライド番号の確認

- ✅ 各スライドの左上に「スライド X/25」が表示される
- ✅ スライドの順番がスクリプトと一致している

### 3. 機能の確認

- ✅ スライドのナビゲーション（← → キー、矢印ボタン）が動作する
- ✅ シミュレーターが正常に動作する
- ✅ レスポンシブデザインが正しく表示される

---

## 🐛 トラブルシューティング

### 問題1: Gitロックファイルエラー

**エラー**: `Unable to create '.git/index.lock': File exists`

**解決方法**:
1. PowerShellを開く（Windowsキー → 「PowerShell」と入力）
2. 以下のコマンドをコピー＆ペーストしてEnterキーを押す：

```powershell
Remove-Item F:\AI\manga\cursor\.git\index.lock -ErrorAction SilentlyContinue
```

**実行方法の詳細**:
- コマンドをマウスで選択してコピー（Ctrl+C）
- PowerShellのウィンドウをクリック
- 右クリックして貼り付け（またはCtrl+V）
- Enterキーを押す

### 問題2: デプロイが自動的に開始されない

**原因**: VercelとGitHubの連携が切れている

**解決方法**:
1. Vercelダッシュボード → プロジェクト → Settings → Git
2. GitHubリポジトリとの連携を確認
3. 必要に応じて再連携

### 問題3: ファイルが反映されない

**原因**: キャッシュの問題

**解決方法**:
1. ブラウザのキャッシュをクリア（Ctrl+Shift+R）
2. Vercelで再デプロイを実行
3. デプロイログを確認してエラーがないか確認

### 問題4: 404エラー

**原因**: ルーティング設定の問題

**解決方法**:
1. Vercelの設定で `lp-consultation` をルートディレクトリに設定
2. または、カスタムドメインで `/lp-consultation/` パスを設定

---

## 📝 更新履歴

- 2026-01-24: スライドに番号を追加、スクリプトと順番を一致

---

## 💡 補足情報

### 静的サイトのデプロイについて

`lp-consultation`フォルダは静的HTMLファイルのみなので、ビルドプロセスは不要です。
Vercelは自動的に静的サイトとして認識し、そのままデプロイします。

### カスタムドメインの設定

Vercelダッシュボード → プロジェクト → Settings → Domains でカスタムドメインを設定できます。
