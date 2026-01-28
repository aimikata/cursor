# manga-sensei チャンネル用　バナー・アイコン生成プロンプト

画像生成AI（DALL・E、Midjourney、Stable Diffusion、Ideogram など）にそのまま貼って使えるプロンプトです。  
チャンネル名 **manga-sensei** と、Kindle印税・資産形成・マンガ出版のテーマに合わせてあります。

---

## 変更履歴（セクション3「クリーン・怪しさのないスタイル」）

| 変更内容 | 対象 |
|----------|------|
| **ネイビーを廃止** | ロゴ・レイヤーの色指定を「青〜ネイビー〜スレート」→「**スレート・ソフトグレー・淡いブルーグレー**」に変更。ネイビー・濃い青は使わない旨を明記。 |
| **文字色** | 「ダークブルーまたはチャコール」→「**チャコールまたはダークグレー**」に統一。 |
| **メインシンボル** | 「白または濃い青」→「**白またはチャコール**」に変更。 |
| **禁則** | 「ネイビー・派手な青は使わない」を追加。 |
| **雰囲気** | 「信頼感」に加えて「**モダン**」を指定。 |

※ セクション1・2（ダーク＋ゴールド系）は従来どおり。ネイビー排除はセクション3のみ。

---

## 前提（サイズ・用途）

| 種類 | 推奨サイズ | 備考 |
|------|------------|------|
| **バナー** | 2560×1440 px | YouTubeチャンネルアート。中央 1546×423px がスマホでも見える「安全エリア」。重要な文字・ロゴはここに収める。 |
| **アイコン** | 800×800 px | プロフィール写真。YouTube側で円形にトリミングされる。端 15% ほどは隠れる想定で、中心にメイン要素を置く。 |

---

## 1. バナー用プロンプト

### 日本語プロンプト（汎用）

```
YouTubeチャンネル用の横長バナー画像。サイズは16:9。

【雰囲気】
ダークで落ち着いた背景。深い紺〜ネイビー（#0a0a1a〜#1a1a2e）のグラデーション。  
アクセントにゴールド（#d4af37）の光や線・タイポグラフィ。  
信頼感と少し未来的な「資産・仕組み」のイメージ。  
マンガや本のアイコンは控えめに、あってもシルエット程度。

【レイアウト】
中央寄せで、次の文言をゴールドまたは白で配置する想定の余白を確保する：
- 上段：「manga-sensei」（チャンネル名、やや大きめ）
- 中段：「Kindle印税を「仕組み」で資産に」（サブコピー）
- 下段：短いURLまたは「lp-consultation.vercel.app」相当のスペース

文字は画像に描かず、あとからデザインツールで重ねる前提でもよい。  
その場合は「文字のない、背景のみのバナー。中央に余白あり」と指定する。

【禁則】
キャラクターの顔・実在人物っぽいイラストは使わない。  
派手な赤・ピンクは避ける。  
フォントやロゴの商標らしい要素は含めない。
```

---

### 英語プロンプト（Midjourney / DALL・E 向け・短縮版）

```
YouTube channel banner, 16:9, dark navy blue gradient background (#0a0a1a to #1a1a2e), 
subtle gold (#d4af37) accent lines or soft glow, no text, no characters, 
minimal abstract shapes suggesting "assets" or "system", 
professional, clean, space left in center for later text overlay, 
digital publishing / royalty / passive income vibe, flat design, high quality
```

**文字を画像内に含めたい場合（英語のみ）**

```
YouTube channel banner, 16:9, dark navy gradient, gold text in center:
top line "manga-sensei", middle "Kindle royalty as an asset", 
bottom "lp-consultation.vercel.app", 
minimal style, no character art, professional
```

※日本語をバナー画像内で生成させる場合は、Ideogram や Stable Diffusion の日本語対応モデルを使うと精度が上がります。

---

### 「背景のみ」で作ってあとから文字を乗せるパターン

```
Dark gradient background for YouTube banner, 16:9. 
Colors: deep navy (#0a0a1a) to dark blue (#1a1a2e). 
Very subtle gold (#d4af37) particles or thin lines, no text, 
empty clean center area, abstract, professional, 2560x1440
```

作り方の流れ：  
1. 上記で背景画像を生成  
2. Canva／Figma／Photopea などで 2560×1440 のキャンバスに配置  
3. 中央の安全エリアに「manga-sensei」「Kindle印税を「仕組み」で資産に」「lp-consultation.vercel.app」をテキストで追加

---

## 2. アイコン用プロンプト

### 日本語プロンプト（汎用）

```
YouTubeチャンネル用のプロフィールアイコン。正方形 1:1。  
円形でトリミングして使うため、重要な要素は中央に配置する。

【雰囲気】
ダーク紺〜ネイビー（#0a0a1a〜#1a1a2e）の背景。  
アクセントはゴールド（#d4af37）。  
「manga-sensei」「本・印税・資産」を連想させる、シンプルなマークまたはロゴタイプの印象。

【中身の案（いずれかで指定）】
A) アルファベット "m" または "M" をモチーフにした、ゴールドのシンプルなシンボル  
B) 本を1冊あしらった、丸の中に収まるミニマルなアイコン（ゴールド線画）  
C) 「manga-sensei」の "m" と本の形を組み合わせた抽象マーク  
D) 楕円または丸の枠の中に、ゴールドで「資産・積み上げ」を暗示するグラフのような minimal な図形

【禁則】
顔写真・キャラクター・実在人物風は使わない。  
極端に細かい文字は読めないので避ける。  
正方形の四隅に重要な要素を置かない（円で切れるため）。
```

---

### 英語プロンプト（Midjourney / DALL・E 向け）

**パターンA：文字なし・シンボルだけ**

```
YouTube profile picture, square 1:1, dark navy blue background (#0a0a1a), 
gold (#d4af37) minimal logo or abstract symbol in center, 
suggesting "m" or book or asset, no face no character, 
simple geometric, circular safe zone in middle, 800x800, clean
```

**パターンB：”m” や本を連想させるマーク**

```
Minimal logo icon for YouTube channel, square, dark navy background, 
gold letter "m" or stylized book symbol, centered, 
no text no face, professional, passive income / publishing vibe, 800x800
```

**パターンC：グラフ・資産のイメージ**

```
Abstract icon, square, dark blue gradient, 
gold simple chart or "stack" shape in center, 
suggesting growth or assets, minimal, no character, 800x800
```

---

## 3. クリーン・怪しさのないスタイル（参考：URELAB風）

「クリーンで怪しさのない」印象にするため、**背景白・文字入れ・スレート〜グレー系のレイヤーロゴ・控えめなサンセリフ** で揃えたプロンプトです。  
**ネイビーは使わない**（ダサく見えやすいため）。スレート・ソフトグレー・淡いブルーグレーで統一。

### デザインの方向性（文字入れ・背景白）

| 要素 | 指定内容 |
|------|----------|
| **背景** | **白**で統一。 |
| **文字** | **画像内に含める（文字入れ）**。「manga-sensei」「Kindle印税を「仕組み」で資産に」「lp-consultation.vercel.app」を画像内に描く。 |
| **ロゴ周り** | **スレート・ソフトグレー・淡いブルーグレー**の半透明の四角・菱形を重ねたレイヤー。ネイビー・濃い青は使わない。 |
| **メインシンボル** | その上に「m」または本＋上向き矢印をモチーフにした、白またはチャコールのすっきりしたマーク。 |
| **タイポグラフィ** | ゴシック・サンセリフ。チャコールまたはダークグレー。 |
| **禁則** | ネイビー・派手な青・煽り文・キャラクター・怪しさを連想させる装飾は使わない。 |

---

### アイコン用プロンプト（文字入れ・背景白）

**★必須★** ロゴの**直下**に、必ず「manga-sensei」という文字を入れる。省略しない。  
（生成結果で「文字なし」になることが多いので、プロンプトに明記すること。）

**日本語（Ideogram など日本語対応ツール向け）**

```
YouTubeチャンネル用プロフィールアイコン。正方形1:1。背景は白。

【レイアウト】
上段：中央に、スレート・ソフトグレー・淡いブルーグレーの半透明の四角・菱形を重ねたレイヤー。ネイビーや濃い青は使わない。その上に白またはチャコールの「m」または本＋上向き矢印のミニマルなマーク。
下段：★必須★ その真下に、必ず「manga-sensei」という文字を描く。チャコールまたはダークグレー、太めのサンセリフ。英小文字 manga-sensei のまま。他の文言に言い換えない。

【雰囲気】
クリーン、モダン、怪しさゼロ。企業・教育チャンネル向け。ネイビーは使わない。
```

**英語（コピペ用）**

```
YouTube profile icon, square 1:1, white background,
top: layered translucent squares and diamonds in slate, soft gray, muted blue-gray only, no navy,
white or charcoal minimal "m" or book with upward arrow on top, centered,
bottom: MUST include exact text "manga-sensei" below the logo, charcoal or dark gray sans-serif, do not omit or paraphrase,
no face, no character, corporate, trustworthy, modern, 800x800, professional
```

---

### バナー用プロンプト（文字入れ・背景白）

**日本語（Ideogram など日本語対応ツール向け）**

```
YouTubeチャンネル用バナー。横長16:9。背景は白。

【レイアウト】
中央に、薄いグレーの帯（軽いシャドウで浮いている感じ）を配置。
帯の左側：スレート・ソフトグレー・淡いブルーグレーの半透明の四角を重ねた抽象ロゴ。ネイビー・濃い青は使わない。その上に白またはチャコールの「m」または本＋上向き矢印のミニマルなマーク。
帯の右側に、次の文字を画像内に含めて描く（文字入れ）：
- 1行目「manga-sensei」（やや大、チャコールまたはダークグレー、サンセリフ）
- 2行目「Kindle印税を「仕組み」で資産に」（中くらい、同じ色、サンセリフ）
- 3行目「lp-consultation.vercel.app」（小さめ、グレー、サンセリフ）

【雰囲気】
クリーン、モダン、怪しさのない企業・教育系。ネイビー・派手な青は使わない。
```

**英語（コピペ用・文字入れ）**

```
YouTube channel banner, 16:9, white background,
central horizontal band in light gray with subtle soft shadow, floating feel,
left side of band: layered translucent geometric shapes in slate, soft gray, muted blue-gray only, no navy,
white or charcoal minimal symbol on top - stylized "m" or book with upward arrow,
right side of band: text included in image -
line 1 "manga-sensei" large charcoal or dark gray sans-serif,
line 2 "Kindle royalty as an asset" medium charcoal sans-serif,
line 3 "lp-consultation.vercel.app" small gray sans-serif,
corporate, trustworthy, educational, clean, modern, 2560x1440, professional
```

---

### ツール別のコツ（文字入れ・背景白）

| ツール | メモ |
|--------|------|
| **Ideogram** | 日本語の「Kindle印税を「仕組み」で資産に」を画像内に含めやすい。背景白・文字入れ指定で生成。 |
| **DALL・E** | 英語のみ「manga-sensei」「Kindle royalty as an asset」「lp-consultation.vercel.app」で文字入れ。日本語は崩れやすい。 |
| **Midjourney** | 文字の精度は低め。ロゴ＋レイアウト用に生成し、文字は Canva 等で重ねる運用も可。 |
| **Canva** | 背景白・帯・ロゴだけ生成 → キャンバスに置き、テキストを手動で「manga-sensei」等追加するやり方だと確実。 |

---

## 4. 生成後のチェック（共通）

### バナー

- [ ] 2560×1440 で出力されている（または拡大しても荒れていない）
- [ ] 中央の「安全エリア」（横 1546×縦 423px 程度）に、重要な文字やロゴを載せられる余白がある
- [ ] LP やチャンネル説明のトーン（ダーク＋ゴールド）と違和感がない

### アイコン

- [ ] 正方形（推奨 800×800）で出力されている
- [ ] 中心から半径 40% 以内にメインのマークやロゴがある（円で切れても認識できる）
- [ ] 小さく表示されても「manga-sensei っぽい」と分かる程度にシンプルか

---

## 5. ツール別の注意

| ツール | メモ |
|--------|------|
| **DALL・E** | 「no text」にすると文字が入りにくい。日本語は崩れやすいので、背景だけ作って別ソフトで文字を足すやり方が確実。 |
| **Midjourney** | `--ar 16:9` でバナー、`--ar 1:1` でアイコン。`--v 6` などでスタイルを揃える。 |
| **Ideogram** | 日本語や「manga-sensei」の文字入りバナーに向いている。 |
| **Canva** | YouTubeバナー・アイコンのテンプレがあり、生成した画像を背景に置いてテキストを追加する運用がしやすい。 |

---

*manga-sensei チャンネル用に、バナー・アイコンを画像生成する際のプロンプト例です。*
