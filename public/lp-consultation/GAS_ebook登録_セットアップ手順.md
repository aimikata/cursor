# ebook登録フォーム → スプレッドシート連携 セットアップ手順

index-ebook.html の登録データを、決済確認シートの「ebook登録」シートに書き出すための手順です。

---

## 1. GASスクリプトを追加

1. **決済確認シート**を開く  
   https://docs.google.com/spreadsheets/d/1s1La7aQgFJzi7mJnBLWfro7u4XBkWok0Qd91b6viBEQ/edit

2. メニュー **「拡張機能」→「Apps Script」**

3. `GAS_ebook登録.gs` の内容を貼り付け  
   - 既存の Code.gs がある場合は、その下に追加するか、新規ファイルを作成して貼り付け

---

## 2. デプロイ

1. Apps Script エディタで **「デプロイ」→「新しいデプロイ」**

2. 種類で **「ウェブアプリ」** を選択

3. 設定  
   - **説明**: `ebook登録`（任意）
   - **実行ユーザー**: 自分
   - **アクセスできるユーザー**: 全員

4. **「デプロイ」** をクリック

5. 表示される **ウェブアプリのURL** をコピー  
   例: `https://script.google.com/macros/s/AKfycbz.../exec`

---

## 3. index-ebook.html にURLを設定

1. `index-ebook.html` を開く

2. フォームの `action` 属性を、コピーしたGASのURLに変更

```html
<!-- 変更前 -->
<form ... action="https://script.google.com/macros/s/AKfycbzXXXXXXXXXXXXXXXX/exec" ...>

<!-- 変更後（あなたのGASのURLに置き換え） -->
<form ... action="https://script.google.com/macros/s/AKfycbz実際のID/exec" ...>
```

---

## 4. 動作確認

1. Vercel にデプロイ（またはローカルで確認）

2. index-ebook.html でフォーム送信

3. 決済確認シートの **「ebook登録」** シートに、日時・メール・名前が追記されることを確認

4. サンキューページ（thank-you.html）へリダイレクトされることを確認

---

## 補足

- **ebook登録シートが存在しない場合**：GASが自動で作成します（列：日時、メール、名前）
- **既にシートがある場合**：そのまま追記されます
- GASのURLは、デプロイごとに変わる場合があります。再デプロイしたら、index-ebook.html の action も更新してください。
