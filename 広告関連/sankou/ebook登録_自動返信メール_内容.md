# ebook登録 自動返信メール

`handleEbookRegistration` 実行時に送信される歓迎メールの内容です。

---

## 件名

**【Kindle印税資産】ebook＆完全ガイド動画のご案内**

---

## 本文構成

1. **挨拶**（名前があれば「〇〇 様」、なければ「お客様」）
2. **完全ガイド動画**（約12分）の案内・リンク
3. **ebook** の案内・リンク
4. **3日間チャレンジ**の案内（Day1〜Day3の概要）
5. **Day4 2,980円実体験**の案内・リンク
6. 署名

---

## 含まれるURL

| 項目 | URL |
|------|-----|
| 動画 | https://youtu.be/fo90zVEWTNY |
| ebook | https://cursor0113.vercel.app/lp-consultation/ebook.html |
| Day4アンケート | https://cursor0113.vercel.app/lp-consultation/day4-anketo.html |

---

## 注意

- メール送信に失敗しても、登録処理（スプレッドシート書き出し・リダイレクト）は成功として処理されます
- GAS の `MailApp` を使用するため、1日あたりの送信数制限（通常100通〜）に注意してください
