# j-mangagen-ai-studio API 仕様変更アナウンス（2026年1月版）

## 1. 変更日程まとめ

| 項目 | 日程 | 出典 |
|------|------|------|
| **アスペクト比の仕様統一** | **2025年10月2日** | Gemini 2.5 Flash Image が GA となり、10種類のアスペクト比に統一 |
| **gemini-2.5-flash-image-preview リタイア** | **2025年10月31日** (Vertex AI) / **2026年1月15日** (API) | 公式 Deprecation / Changelog |
| **Gemini 3 Pro Image Preview リリース** | **2025年11月20日** | Changelog |
| **Gemini 3 Pro Image 課金** | **リリース時より課金必須**（Free Tier なし） | 公式 Pricing ページ |

### アスペクト比の経緯

- **2025年10月2日以前**: `gemini-2.5-flash-image-preview` 等で、一部の非公式アスペクト比（例: 1:1.6）が許容されていた可能性あり
- **2025年10月2日〜**: `gemini-2.5-flash-image` の GA とともに、**指定可能なアスペクト比が以下に限定**:
  - **指定可能**: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`
  - **非対応**: `1:1.6` は **指定不可**（`400 INVALID_ARGUMENT` の原因）

### 課金の経緯

- **Gemini 3 Pro Image Preview** (`gemini-3-pro-image-preview`): API リリース時点で **Free Tier なし**、課金必須
- **403 PERMISSION_DENIED** の主因: 課金未設定の API キーでアクセスしようとしている

---

## 2. アナウンス用文面（ユーザー向け）

```
【重要】j-mangagen-ai-studio 利用に関する API 仕様変更のお知らせ

お世話になっております。
Google Gemini API の仕様変更に伴い、以下の対応をお願いいたします。

■ 1. アスペクト比の変更（2025年10月2日〜）
  ・指定可能なアスペクト比が変更されました。
  ・従来の 1:1.6 はサポート対象外となったため、縦長マンガ向けには 2:3 を使用するよう修正済みです。
  ・本修正により、フォールバックモデル（gemini-2.5-flash-image）での画像生成が正常に動作するようになります。

■ 2. Gemini 3 Pro Image Preview の課金について
  ・gemini-3-pro-image-preview（Nano Banana Pro）は、API 利用に課金が必須です。
  ・無料枠は設けられておりません。403 エラーが発生する場合は、Google AI Studio で課金を有効にしてください。
  ・日本語の吹き出しをきれいに描画したい場合は、本モデルの利用を推奨します。

■ 3. 推奨モデル
  ・日本語テキスト品質重視: gemini-3-pro-image-preview（課金必須）
  ・コスト・速度重視: gemini-2.5-flash-image（アスペクト比 2:3 で動作確認済み）

■ 4. 英語と日本語の文字描画の違い（重要）
  ・Gemini 2.5 Flash Image では、**英語（ラテン文字）は比較的きれいに描画**されますが、
    **日本語（漢字・ひらがな・カタカナ）は崩れや誤字が出やすい**傾向があります。
  ・これは AI 画像生成モデル全般で見られる傾向です（学習データの偏り、CJK 文字の複雑さ等）。
  ・**英語圏向けのマンガを生成する場合は、Gemini 2.5 Flash Image でも十分な品質が期待できます。**
  ・日本語の吹き出し・本文をきれいに描画したい場合は、Gemini 3 Pro Image の利用を推奨します。

ご不明な点がございましたら、お問い合わせください。
```

---

## 3. 1ページあたりのコスト（gemini-3-pro-image-preview）

| 解像度 | 1枚あたり | 33ページ分（例） | 約円換算（1ドル=150円） |
|--------|-----------|------------------|-------------------------|
| **1K/2K**（デフォルト） | **$0.134** | $4.42 | 約 20円/枚、660円/33頁 |
| **4K** | $0.24 | $7.92 | 約 36円/枚、1,188円/33頁 |
| **Batch API（1K/2K）** | $0.067 | $2.21 | 約 10円/枚、331円/33頁 |
| **Batch API（4K）** | $0.12 | $3.96 | 約 18円/枚、594円/33頁 |

※ 2:3 の縦長マンガページは通常 1K/2K 相当  
※ 入力（プロンプト・参照画像）の料金は画像出力に比べて小さいため省略  
※ 円換算は参考値

---

## 4. Vertex AI 経由での料金

Vertex AI は Google Cloud 上のエンタープライズ向け API で、**Gemini API と同等の料金体系**です。

### Gemini 3 Pro Image Preview（Vertex AI）

| 項目 | 料金 |
|------|------|
| **画像出力（1K/2K）** | $120 / 100万トークン ≒ **$0.134/枚** |
| **画像出力（4K）** | 同上 ≒ **$0.24/枚** |
| **Batch API** | $60 / 100万トークン（50%割引） |

### Vertex AI の課金の流れ

1. **Google Cloud プロジェクト**の作成
2. **Vertex AI API** の有効化
3. **課金アカウント**の紐付け（クレジットカード等）
4. **従量課金**: 利用した分だけ請求
   - 最低料金なし
   - 新規は $300 相当の無料クレジット（90日間）あり

### Vertex AI と Gemini API（AI Studio）の違い

| 項目 | Gemini API（AI Studio） | Vertex AI |
|------|-------------------------|-----------|
| 認証 | API キー | サービスアカウント / OAuth |
| 料金 | 同一 | 同一（※） |
| SLA / サポート | 標準 | エンタープライズ向けオプションあり |
| コンプライアンス | 標準 | より高いセキュリティ・コンプライアンス対応 |

※ 公式: "Prices may differ from the prices listed here and the prices offered on Vertex AI."  
　実務上、Gemini 3 Pro Image の単価はほぼ同等と記載されることが多い。

### 1ページ単位のコスト（Vertex AI）

- **gemini-3-pro-image-preview** 使用時: **$0.134/枚（1K/2K）** ≒ **約20円/ページ**
- 33ページのマンガ1本: **約 $4.42 ≒ 660円**

---

## 5. 英語 vs 日本語の文字描画（Gemini 2.5 Flash Image 使用時）

| 言語 | 吹き出し・画像内テキストの品質 |
|------|------------------------------|
| **英語** | 比較的安定してきれいに描画されやすい |
| **日本語** | 崩れ・誤字が出やすい傾向（漢字は特に） |

**推奨**: 英語圏向けのマンガ（プロンプト・吹き出しを英語で記述）を生成する場合は、Gemini 2.5 Flash Image で十分な品質が期待できます。コスト効率も良く、無料枠も活用しやすいため、**英語圏向けマンガの生成を推奨**します。

---

## 6. 参考リンク

- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- [Gemini Deprecations](https://ai.google.dev/gemini-api/docs/deprecations)
- [Gemini Changelog](https://ai.google.dev/gemini-api/docs/changelog)
- [Nano Banana Image Generation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Gemini 2.5 Flash Image - Production GA (Oct 2, 2025)](https://developers.googleblog.com/en/gemini-2-5-flash-image-now-ready-for-production-with-new-aspect-ratios/)
