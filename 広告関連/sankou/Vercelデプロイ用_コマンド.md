# Vercel デプロイ用コマンド（Fドライブ）

変更を Vercel に反映するためのコマンドです。  
**PowerShell または コマンドプロンプト** で実行してください。

---

## 今回の変更ファイル一覧

| ファイル | 内容 |
|----------|------|
| public/lp-consultation/index.html | GAS URL、個別相談（希望日程） |
| public/lp-consultation/index-ebook.html | GAS URL、延べ200名→参考実績 |
| public/lp-consultation/day4-anketo.html | 空き日程選択、GAS連携、決済リンク |
| public/lp-consultation/ebook.html | 延べ200名の削除・修正 |
| 広告関連/sankou/ | 各種ドキュメント・GAS参照用 |

---

## 一括コピー用（まとめて実行）

```powershell
cd F:\AI\manga\cursor
git add public/lp-consultation/index.html public/lp-consultation/index-ebook.html public/lp-consultation/day4-anketo.html public/lp-consultation/ebook.html
git add 広告関連/sankou/
git status
git commit -m "LPフォーム・Day4・GAS連携・延べ200名修正"
git push origin main
```

※ ブランチが `master` の場合は最後を `git push origin master` に変更

---

## 手順（1つずつ実行）

```powershell
cd F:\AI\manga\cursor
```

```powershell
git add public/lp-consultation/index.html public/lp-consultation/index-ebook.html public/lp-consultation/day4-anketo.html public/lp-consultation/ebook.html
```

```powershell
git add 広告関連/sankou/
```

```powershell
git status
```

```powershell
git commit -m "LPフォーム・Day4・GAS連携・延べ200名修正"
```

```powershell
git push origin main
```

---

## 補足

- GitHub と Vercel が連携していれば、`git push` で自動デプロイされます
- デプロイ完了後、本番URLで動作確認してください
