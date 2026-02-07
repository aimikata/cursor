# PIVOT風サムネ画像生成プロンプト

サムネイルは**別で作る**前提。このプロンプトで「キャラ＋背景」のみを生成し、タイトル・キャプションなどのテキストは後からデザインツールでオーバーレイする。

---

## 使い方

1. 下記プロンプトを画像生成AI（例：Midjourney / niji など）にそのまま渡す。
2. 生成画像の**左側にネガティブスペース**が確保されているので、そこにテキストを乗せる。
3. 動画ごとの見出し・サブタイトル・下部バーは、Canva・Photoshop・Figma 等で別途追加。

---

## コピペ用プロンプト（英語・niji用）

```
# PIVOT風サムネ画像生成プロンプト
# アスペクト比 16:9（YouTubeサイズ）

YouTube thumbnail background, a Japanese male marketing consultant standing on the right side, arms crossed, confident and serious expression, looking at the viewer. He is wearing a vivid blue button-down shirt with rolled-up sleeves and clean white trousers. No glasses.

**Dark Navy Blue gradient background**, subtle geometric business patterns, dim studio lighting, rim light, cinematic lighting.

**Significant negative space on the left side for text overlay.**

Style: High-quality anime style, "Seinen Manga" style, sharp line art, G-pen touch, detailed shading, cel shading, masterpiece, 8k resolution. --ar 16:9 --niji 6
```

---

## パラメータメモ

| 項目 | 指定内容 |
|------|----------|
| アスペクト比 | 16:9（YouTubeサムネイル） |
| キャラ位置 | 右側 |
| 左側 | テキストオーバーレイ用のネガティブスペース（空けておく） |
| 背景 | Dark Navy Blue グラデーション、控えめな幾何学ビジネスパターン |
| 照明 | 薄暗いスタジオ、リムライト、シネマティック |
| スタイル | 青年漫画風、Gペンタッチ、セルシェーディング、8k |

---

## 生成時の注意（プロンプトと結果のズレ）

実際の生成では次のようなズレが出ることがあります。必要に応じてプロンプトを調整してください。

- **腕のポーズ**：「arms crossed」と指定しても、指差しなど別ポーズになることがある → ポーズを固定したい場合はプロンプトを強めに書くか、複数回生成して選ぶ。
- **背景の明るさ**：「Dark Navy Blue」と指定しても、明るいスカイブルーや水色寄りになることがある → 「dark」「navy」「gradient」を強調する、またはネガティブプロンプトで「bright sky blue」を入れる。

テキストは画像に含めず別レイヤーで乗せるため、文言の typo や文字化けの心配がなく、動画ごとに差し替えも容易です。
