# Vercel デプロイ用コマンド（Fドライブ）

変更を Vercel に反映するためのコマンドです。  
**PowerShell または コマンドプロンプト** で実行してください。

---

## 1. プロジェクトフォルダへ移動

```powershell
cd F:\AI\manga\cursor
```

---

## 2. 変更を確認

```powershell
git status
```

---

## 3. 変更をステージング

```powershell
git add public/lp-consultation/index.html public/lp-consultation/index-ebook.html public/lp-consultation/day4-anketo.html
```

※ 他に変更したファイルがあれば追加：
```powershell
git add .
```

---

## 4. コミット

```powershell
git commit -m "LPフォーム・Day4・GAS連携の更新"
```

---

## 5. プッシュ（Vercel 自動デプロイ）

```powershell
git push origin main
```

※ ブランチ名が `master` の場合は：
```powershell
git push origin master
```

---

## 一括コピー用（まとめて実行）

```powershell
cd F:\AI\manga\cursor
git add public/lp-consultation/index.html public/lp-consultation/index-ebook.html public/lp-consultation/day4-anketo.html
git add 広告関連/sankou/
git status
git commit -m "LPフォーム・Day4・GAS連携の更新"
git push origin main
```

---

## 補足

- GitHub と Vercel が連携していれば、`git push` で自動デプロイされます
- デプロイ完了後、本番URLで動作確認してください
