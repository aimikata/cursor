# Vercel にアップするコマンド

PowerShell で **プロジェクトルート** に移動してから、以下を実行してください。

---

## 一括コピー用（まとめて実行）

```powershell
cd f:\AI\manga\cursor
git add public/lp-consultation/index.html public/lp-consultation/index-ebook.html public/lp-consultation/day4-anketo.html public/lp-consultation/ebook.html public/lp-consultation/thank-you.html public/lp-consultation/ebook-cover.png
git status
git commit -m "LP・ebook・Vercel反映"
git push origin main
```

※ ブランチが `master` の場合は、最後を `git push origin master` にしてください。

---

## 手順（1つずつ実行）

```powershell
cd f:\AI\manga\cursor
```

```powershell
git add public/lp-consultation/index.html public/lp-consultation/index-ebook.html public/lp-consultation/day4-anketo.html public/lp-consultation/ebook.html public/lp-consultation/thank-you.html public/lp-consultation/ebook-cover.png
```

```powershell
git status
```

```powershell
git commit -m "LP・ebook・Vercel反映"
```

```powershell
git push origin main
```

---

## 補足

- GitHub と Vercel が連携していれば、`git push` 後に自動で Vercel がデプロイします。
- デプロイ完了後、本番URL（例: https://cursor0113.vercel.app/lp-consultation/index-ebook.html ）で表示・フォーム送信を確認してください。
