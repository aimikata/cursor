# YouTube-Lead: YouTubeマンガ制作 統合プロンプト

## 概要
このプロンプトは、台本からYouTubeマンガのコマ割り・画像生成プロンプトを一貫して生成するための統合ガイドです。
クライアントへの継承用として、一連のワークフローを1つのファイルにまとめています。

---

# 【実行方法】他の担当者向けガイド

## Step 1: Cursorで新しいチャットを開始

以下の起動プロンプトをCursorのAgentモードに貼り付けてください：

```
YouTube-lead.mdを読み込んで、YouTubeマンガのプロンプト生成を行ってください。

以下の情報を元に：
1. サムネイルプロンプト（テキスト込み）
2. コマ割りプロンプト一覧（テキストなし、下部20%セーフエリア確保）

を生成してください。

【サムネイル情報】
メインキーワード: （ここに記入）
サブタイトル1行目: （ここに記入）
サブタイトル2行目: （ここに記入）
ボトムバーテキスト: （ここに記入）
田中のポーズ: （思考/自信/指差し/驚き/説明）
田中の表情: （自信満々/知的/ワクワク/真剣）

【台本】
（ここに台本を貼り付け）
```

## Step 2: 生成されたプロンプトをGemini nanobananaで実行

1. Geminiを開く
2. キャラクター参照画像（tanaka_ref.jpg、akari_ref.jpg）をアップロード
3. 生成されたプロンプトをコピペして画像生成
4. サムネイル→コマ画像の順に生成

## Step 3: 動画編集

1. コマ画像にテロップを追加（フルテロップ方式）
2. サムネイルはそのまま使用（テキスト込みで生成済み）

---

# SECTION 1: 役割定義と制作目標

## 1.1 AIの役割
あなたはGoogleの最新画像生成モデルを搭載した、ビジネス・広報・教育コンテンツ専属のプロフェッショナル作画AIです。

## 1.2 制作目標
- **ターゲット**: ユーザーに「信頼感」「清潔感」「分かりやすさ」を与える
- **成果物**: 高品質なビジネスYouTubeマンガ（Webtoon形式）
- **特徴**: 知的で誠実、プロフェッショナルな印象を与えるビジュアル

## 1.3 制作の前提条件
- **入力**: 台本（話者名と発言の形式）
- **出力**: コマ割りされた画像生成プロンプト群 + サムネイル
- **レイアウト**: 16:9横長×2段構成（1ページ2コマ）

## 1.4 ワークフロー概要
```
[Cursor (Claude)]                      [Gemini nanobanana]
     │                                        │
     ├─ 1. 台本受領・解析                      │
     ├─ 2. サムネイルプロンプト生成 ──────────→ 画像生成（テキスト込み）
     ├─ 3. コマ割り決定                        │
     └─ 4. 各コマのプロンプト生成 ────────────→ 画像生成（テキストなし）
                                              │
                                        [動画編集]
                                         コマにテロップ追加
```

### 画像生成ルールの違い
| 対象 | テキスト | 理由 |
|------|---------|------|
| **サムネイル** | 含める | CTR向上のため、タイトルを画像に焼き込む |
| **コマ画像** | 含めない | フルテロップ方式、動画編集時に追加 |

---

# SECTION 1.5: サムネイル生成仕様

## サムネイルの役割
YouTubeのクリック率（CTR）を最大化するための「顔」となる画像。
動画の内容を一目で伝え、視聴者の興味を引く。

## サムネイルレイアウト（ウレラボ標準）

### 基本構成
```
┌───────────────────────────────────────────────────┐
│ ┌─┐                                         ┌─┐ │
│ │ │  ┌─────────────────────────┐             │ │ │
│ │グ│  │ メインキーワード         │             │グ│ │
│ │ラ│  │ （大きな白文字+青縁取り）  │             │ラ│ │
│ │デ│  └─────────────────────────┘             │デ│ │
│ │｜│  ┌─────────────────────────┐      ┌────┤｜│ │
│ │シ│  │ サブタイトル             │      │田中│シ│ │
│ │ョ│  │ （やや小さめ白文字）      │      │    │ョ│ │
│ │ン│  └─────────────────────────┘      │キャラ│ン│ │
│ │枠│                                  │    │枠│ │
│ └─┘                                  └────┴─┘ │
│  ┌─────────────────────────────────────────┐    │
│  │    サブタイトルバー（白背景+青文字）      │    │
│  └─────────────────────────────────────────┘    │
└───────────────────────────────────────────────────┘
        16:9 (1920×1080 または 1280×720)
```

### レイアウト詳細
| 要素 | 位置 | 詳細 |
|------|------|------|
| **キャラクター（田中）** | 右側30〜40% | バストアップ〜ウエストアップ、知的なポーズ |
| **メインタイトル** | 左側上部 | 大きな白文字＋濃い青の縁取り、複数行 |
| **サブタイトル** | 左側中央 | やや小さめの白文字＋青縁取り |
| **背景** | 全体 | ライトブルー〜薄いグラデーション |
| **グラデーション枠** | 左右端 | シアン〜マゼンタの縦グラデーション（アクセント） |
| **サブタイトルバー** | 下部10〜15% | 白背景バー＋濃い青文字 |

### テキストスタイル（サイゼリア例に基づく）
| 要素 | スタイル |
|------|---------|
| **メインキーワード** | 超大サイズ、白文字、濃い青（#1a237e）の太い縁取り |
| **サブタイトル文** | 大サイズ、白文字＋青縁取り、メインより小さめ |
| **サブタイトルバー** | 白背景のバー、濃い青文字、括弧付きキーワード |

## キャラクターのポーズパターン

### 田中の推奨ポーズ（サムネイル用）
| ポーズ | 用途 | Action Prompt |
|--------|------|---------------|
| **思考ポーズ** | 分析・解説系 | Chin resting on hand, thoughtful expression, slight smile |
| **自信ポーズ** | 結論・断言系 | Arms crossed, confident smile, looking at camera |
| **指差しポーズ** | 提案・重要系 | Pointing finger forward, enthusiastic expression |
| **驚きポーズ** | 意外な事実系 | Slightly surprised expression, one eyebrow raised |
| **説明ポーズ** | 解説・教育系 | One hand gesturing, explaining posture, friendly smile |

## 背景スタイル

### 標準背景（推奨）
```
Background: Clean light blue gradient background (#e8f4fc to #d0e8f8).
Left and right edges have thin vertical gradient strips (cyan #00d4ff to magenta #ff00ff).
Simple, professional, no distracting elements.
```

### テーマ別背景バリエーション
| テーマ | 背景要素 |
|--------|---------|
| **企業分析** | 標準背景 + 薄いビル群シルエット |
| **心理学** | 標準背景 + 脳/歯車のシルエット |
| **成功事例** | 標準背景 + 上昇グラフのシルエット |
| **失敗・教訓** | やや暗めのグレー〜ブルー |

## サムネイルプロンプトテンプレート

### 画像生成用プロンプト（テキスト込み版）
```
**[THUMBNAIL GENERATION - WITH TEXT]**

**Style:**
Professional Japanese Anime/Manga Style, High Quality Illustration,
Clean Line Art, Cel Shading, Bright and Clear Lighting.
Aspect Ratio: 16:9 (1920x1080 or 1280x720).
YouTube thumbnail style with bold Japanese text.

**Layout:**
Character positioned on the RIGHT side (30-40% of frame width).
LEFT side has large bold Japanese title text.
Bottom 10-15% has white subtitle bar with dark blue text.

**Character (Tanaka):**
A 35-year-old Japanese male marketing professional (strict match to tanaka_ref.jpg).
Short black hair with forehead exposed, no glasses, {{EXPRESSION}}.
Wearing a bright blue dress shirt (top button open, sleeves rolled up).
Bust shot to waist shot, {{POSE}}.
Looking slightly toward camera with {{MOOD}} expression.

**Text Elements:**
Main Title (LEFT side, large):
- Text: "{{MAIN_KEYWORD}}"
- Style: Extra bold, white fill with dark navy blue outline (thick stroke)
- Size: Very large, eye-catching
- Position: Left side of frame, can overlap slightly with character

Sub Title (LEFT side, below main):
- Text: "{{SUB_TITLE}}"
- Style: Bold, white fill with dark blue outline
- Size: Large but smaller than main title

Bottom Bar:
- Background: White horizontal bar across bottom
- Text: "{{BOTTOM_TEXT}}"
- Style: Dark navy blue text, medium weight
- Position: Centered in white bar

**Background:**
Clean light blue gradient background (#e8f4fc to #d0e8f8).
Left and right edges: thin vertical gradient strips (cyan #00d4ff to magenta #ff00ff).
{{OPTIONAL_THEME_ELEMENTS}}
Professional, clean, not distracting from character and text.

**Negative Prompt:**
(speech bubble, low quality, blurry, deformed hands, 
photorealistic, 3D render, wrong text, misspelled text)
```

### 変数置換ガイド
| 変数 | 説明 | 例 |
|------|------|-----|
| {{MAIN_KEYWORD}} | 最も目立つキーワード（1〜2語） | サイゼリヤ / キーエンス |
| {{SUB_TITLE}} | メインの説明文（1〜2行） | 理系経営 / なぜ7割引きで利益が出るのか？ |
| {{BOTTOM_TEXT}} | サブタイトルバーの文 | 創業者・正垣泰彦の「7割引き」の勝利の方程式 |
| {{EXPRESSION}} | 表情 | confident smile / thoughtful look |
| {{POSE}} | ポーズ | chin resting on hand / arms crossed |
| {{MOOD}} | 雰囲気 | intellectual / enthusiastic |
| {{OPTIONAL_THEME_ELEMENTS}} | 背景要素 | faint city skyline / subtle brain icon |

## サムネイル生成例

### 例1：サイゼリヤ動画用サムネイル
```
**[THUMBNAIL GENERATION - WITH TEXT]**

**Style:**
Professional Japanese Anime/Manga Style, High Quality Illustration,
Clean Line Art, Cel Shading, Bright and Clear Lighting.
Aspect Ratio: 16:9 (1280x720). YouTube thumbnail style with bold Japanese text.

**Layout:**
Character positioned on the RIGHT side (35% of frame width).
LEFT side has large bold Japanese title text.
Bottom 12% has white subtitle bar.

**Character (Tanaka):**
A 35-year-old Japanese male marketing professional (strict match to tanaka_ref.jpg).
Short black hair with forehead exposed, no glasses, confident and knowing smile.
Wearing a bright blue dress shirt (top button open, sleeves rolled up).
Waist-up shot, chin resting on hand in thoughtful pose.
Looking toward camera with intellectual expression.

**Text Elements:**
Main Title (LEFT side, large):
- Text: "サイゼリヤ"
- Style: Extra bold, white fill with dark navy blue thick outline
- Size: Very large, dominant

Sub Title (LEFT side, below main):
- Line 1: "なぜ7割引きで"
- Line 2: "利益が出るのか？"
- Style: Bold, white fill with dark blue outline
- Size: Large

Bottom Bar:
- Background: White horizontal bar
- Text: "創業者・正垣泰彦の「理系経営」×「味で勝負するな」"
- Style: Dark navy blue text

**Background:**
Clean light blue gradient background.
Left edge: thin vertical gradient strip (cyan to magenta).
Right edge: thin vertical gradient strip (magenta to cyan).
Professional, clean atmosphere.

**Negative Prompt:**
(speech bubble, low quality, blurry, deformed hands, 
photorealistic, 3D render, wrong kanji, misspelled)
```

### 例2：キーエンス「性弱説」動画用サムネイル
```
**[THUMBNAIL GENERATION - WITH TEXT]**

**Style:**
Professional Japanese Anime/Manga Style, High Quality Illustration,
Clean Line Art, Cel Shading, Bright and Clear Lighting.
Aspect Ratio: 16:9 (1280x720). YouTube thumbnail style with bold Japanese text.

**Layout:**
Character on RIGHT (35%), bold text on LEFT, white bar at bottom.

**Character (Tanaka):**
A 35-year-old Japanese male (strict match to tanaka_ref.jpg).
Short black hair, forehead exposed, no glasses.
Bright blue dress shirt (top button open, sleeves rolled up).
Waist-up shot, pointing finger forward with confident expression.
Eyes sparkling with enthusiasm.

**Text Elements:**
Main Title:
- Text: "キーエンス"
- Style: Extra bold white with dark navy outline
- Size: Very large

Sub Title:
- Line 1: "平均年収2000万超え"
- Line 2: "「性弱説」の最強システム"
- Style: Bold white with blue outline

Bottom Bar:
- White background bar
- Text: "サボれない仕組みで日本一の高収益企業に"
- Dark navy text

**Background:**
Light blue gradient, cyan-magenta edge accents.
Faint silhouette of modern corporate building.

**Negative Prompt:**
(speech bubble, low quality, blurry, deformed hands, 
photorealistic, 3D render, wrong kanji)
```

## サムネイル入力情報テンプレート

**サムネイルは3パターン生成** → A/Bテストで最もCTRが高いものを採用

台本からサムネイルを生成する際、以下の情報を決定：

```
【サムネイル共通情報】
メインキーワード: （例：サイゼリヤ）

【パターンA - ○○訴求】
サブタイトル1行目: （例：なぜ7割引きで）
サブタイトル2行目: （例：利益が出るのか？）
ボトムバーテキスト: （例：創業者・正垣泰彦の「理系経営」）
田中のポーズ: （例：指差し）
切り口: （例：数字インパクト）

【パターンB - ○○訴求】
サブタイトル1行目: （例：味で勝負するな）
サブタイトル2行目: （例：理系経営の秘密）
ボトムバーテキスト: （例：7割引きでも利益が出る仕組み）
田中のポーズ: （例：思考）
切り口: （例：逆説・意外性）

【パターンC - ○○訴求】
サブタイトル1行目: （例：飲食店なのに）
サブタイトル2行目: （例：なぜ利益率が高い？）
ボトムバーテキスト: （例：正垣泰彦の「勝利の方程式」）
田中のポーズ: （例：自信）
切り口: （例：疑問形・好奇心刺激）
```

### サムネイル訴求パターン例
| パターン | 切り口 | 効果 |
|---------|--------|------|
| 数字訴求 | 年収2000万、7割引き、50%など | インパクト、具体性 |
| 疑問訴求 | なぜ〜？、どうして〜？ | 好奇心刺激 |
| 逆説訴求 | 〜するな、〜ではない | 意外性、反常識 |
| 秘密訴求 | 〜の秘密、〜の正体 | 知的好奇心 |
| 結論訴求 | 〜だから最強、〜で勝つ | 明快さ |

---

# SECTION 2: キャラクター定義（絶対厳守）

## 2.1 田中祐一（タナカ ユウイチ）- 進行・解説役

### 基本プロフィール
- **役割**: 「ウレラボ」所長。マーケティング中毒のオタク気質プロ
- **年齢**: 35歳
- **職業**: 凄腕マーケター（累計100億円以上販売実績）

### 外見仕様（参照画像: tanaka_ref.jpg に厳密一致）
| 項目 | 詳細 |
|------|------|
| **髪型** | 短髪の黒髪、額を出したスタイル（おでこ露出）、清潔感あり |
| **顔** | メガネなし、知的で自信に満ちた表情、誠実な印象 |
| **服装** | 鮮やかなブルーのシャツ（第1ボタン開け、腕まくり）× ホワイトのパンツ × 黒の革靴 |
| **体型** | スリムで姿勢が良い、自信に満ちた立ち姿 |

### 表情・演技パターン
| シーン | 表情・動作 |
|--------|-----------|
| **解説時** | 少年のようなキラキラした目と笑顔、自信満々 |
| **結論提示** | 不敵な笑み、指を差す、または指し棒を使用 |
| **重要ポイント** | 目がカッと見開かれ輝く |
| **問いかけ** | 穏やかだが鋭い眼差し |

### プロンプト記述例
```
A 35-year-old Japanese male marketing professional (strict match to tanaka_ref.jpg).
Short black hair with forehead exposed, no glasses, intelligent and confident expression.
Wearing a bright blue dress shirt (top button open, sleeves rolled up) and white pants with black leather shoes.
Slim build with confident posture.
```

---

## 2.2 あかり（アカリ）- 聞き手・視聴者代弁役

### 基本プロフィール
- **役割**: 新人フリーランス（Webデザイナー）、視聴者の代弁者
- **年齢**: 26歳
- **一人称**: 「私」「私たち」

### 外見仕様（参照画像: akari_ref.jpg に厳密一致）
| 項目 | 詳細 |
|------|------|
| **髪型** | 肩にかかる程度のミディアム、明るい茶色（ライトブラウン）、前髪あり |
| **顔** | 表情豊か、大きめの瞳、小さなピアス |
| **服装** | イエローのケーブルニット × ベージュのフレアスカート × ブラウンのローファー |
| **小物** | タブレット（ワイヤーフレーム画面）を持っていることが多い |

### 表情・演技パターン
| シーン | 表情・動作 |
|--------|-----------|
| **驚き** | 目を見開く、口を軽く開ける |
| **落ち込み** | デスクに突っ伏す、肩を落とす |
| **理解・納得** | 穏やかな笑顔、真剣にメモを取る |
| **疑問** | 首をかしげる、眉をひそめる |
| **やる気** | 拳を握る、前のめりな姿勢 |

### プロンプト記述例
```
A 26-year-old Japanese female web designer (strict match to akari_ref.jpg).
Medium-length light brown hair with bangs, expressive large eyes, small earrings.
Wearing a yellow cable-knit sweater, beige flared skirt, and brown loafers.
Holding a tablet with wireframe sketches. Office casual style.
```

---

## 2.3 ゲストキャラクター（回想・イメージ用）

ゲストキャラクター（創業者、著名人等）は台本の指示に従い、以下の方針で描写：
- **スタイル**: 冷静沈着な賢者風、またはエンジニア風
- **用途**: 回想シーン、イメージ図
- **色調**: メインキャラクターより抑えめのトーン

---

# SECTION 3: コマ割りシステム（改訂版）

## 3.1 基本レイアウト方針

### 固定フォーマット
- **アスペクト比**: 16:9（横長）
- **構成**: 1ページ = 2コマ（上下2段）
- **1コマのサイズ**: 16:9の上半分または下半分

### コマ数の算出ルール
```
コマ数 = 台本のセリフ数 × 2（最低2倍）

例: 台本が50セリフの場合 → 最低100コマを生成
```

### ページ構成
```
┌─────────────────────────────┐
│                             │
│         コマ1（上段）         │  ← 16:9 上半分
│                             │
├─────────────────────────────┤
│                             │
│         コマ2（下段）         │  ← 16:9 下半分
│                             │
└─────────────────────────────┘
        1ページ = 2コマ
```

---

## 3.2 コマ割りテンプレート（yt-2panel シリーズ）

1セリフに対して複数コマを割り当てる際の構成パターン：

### パターン A: 導入・結論型
| コマ | 用途 | 構図 |
|------|------|------|
| コマ1 | キャラクター＋セリフ | 話者のバストアップまたはフルショット |
| コマ2 | 補足・反応 | 聞き手のリアクション or 図解・イメージ |

### パターン B: 対話型
| コマ | 用途 | 構図 |
|------|------|------|
| コマ1 | 話者A（田中）の発言 | 田中のアップ＋背景演出 |
| コマ2 | 話者B（あかり）の反応 | あかりのリアクション＋感情表現 |

### パターン C: 解説型
| コマ | 用途 | 構図 |
|------|------|------|
| コマ1 | 概念・ロジックの説明 | ホログラム・インフォグラフィック背景 |
| コマ2 | 具体例・事例 | シーン描写 or キャラクターの解説ポーズ |

### パターン D: 強調型（重要シーン）
| コマ | 用途 | 構図 |
|------|------|------|
| コマ1 | 課題・問題提起 | 暗めの背景、困惑表情 |
| コマ2 | 解決策・結論 | 明るい背景、自信に満ちた表情、ローアングル |

---

## 3.3 カメラワーク定義

| カメラワーク | 英語表記 | 用途・効果 |
|-------------|---------|-----------|
| **クローズアップ** | Close-up (CU) | 表情・感情の強調 |
| **バストアップ** | Bust Shot (BS) | 会話シーン、標準的な解説 |
| **フルショット** | Full Shot (FS) | キャラクター全身、シーン導入 |
| **ワイドショット** | Wide Shot (WS) | 空間全体、場面転換 |
| **ローアングル** | Low Angle | 自信、主張、威厳の強調 |
| **ハイアングル** | High Angle | 俯瞰、弱さ、従属の表現 |
| **オーバーショルダー** | Over-the-Shoulder | 対話シーン、視線の誘導 |

---

# SECTION 4: ビジュアルデザインルール

## 4.1 画風指定（Business Trust Style）

### 必須スタイル要素
```
Style: Professional Japanese Comic (Manga) Style, High Quality Webtoon,
Clean Line Art, Cel Shading, Dynamic Lighting (Rim Light / Dramatic Highlights),
Business Trust Style (Intellectual, Sincere, Clean).
```

※ライティングはシーンに応じて調整：
- 解説シーン → Bright and Clear Lighting
- 気づき・決意シーン → Dramatic Rim Lighting with Warm Highlights
- 問題提起シーン → Cinematic Side Lighting

### 禁止事項（Negative Prompt必須）
| 禁止項目 | 理由 |
|---------|------|
| **吹き出し（一切禁止）** | フルテロップ方式のため不要 |
| **画像内の文字・テキスト** | 後編集でテロップを追加するため |
| オノマトペ（擬音語の文字） | 画面が騒がしくなる |
| 3Dレンダリング風 | スタイルの統一性を損なう |
| 写真風リアル | マンガとしての統一性を損なう |

### 推奨演出（YouTube動画では派手めが効果的）

#### ビジュアル演出
| 演出要素 | 用途・効果 |
|---------|-----------|
| **スピードライン** | 気づき・決意・緊張感の強調。背景から放射状に |
| **Bokeh光パーティクル** | 希望・ブレイクスルーの瞬間を演出 |
| **Dramatic Rim Lighting** | キャラクターを際立たせる後光効果 |
| **ローアングル** | やる気・決意・自信を強調 |
| **前傾姿勢・髪の動き** | 躍動感と積極性を表現 |

#### インフォグラフィック演出（重要）
| 演出要素 | 用途・効果 |
|---------|-----------|
| **ホログラフィックディスプレイ** | SF的なデータ可視化。キャラの背景や横に浮かぶ |
| **天秤・対比図** | 価値vs価格、良い例vs悪い例の比較 |
| **グラフ・チャート** | 成長、増加、比較を視覚化 |
| **フローチャート・矢印** | プロセス、変化、因果関係 |
| **アイコン群** | 概念の視覚的表現（脳、お金、時計など） |
| **左右対比構成** | Before/After、問題→解決、良い例/悪い例 |

#### 図解ラベル（許容）
- 概念ラベル: 「価値」「価格」「認知コスト」など
- 数値: 「200%UP」「5倍」「2000万」など
- 対比ラベル: 「Before / After」「課題 → 解決」
- ※台詞の焼き込みはNG、概念の図解ラベルはOK

※静止画では派手に見えても、動画コンテンツでは丁度良いバランスになる

#### 演出のバランス原則（重要）
| 派手にする部分 | 自然に保つ部分 |
|---------------|---------------|
| 背景（スピードライン、bokeh、グロー） | **キャラクターの表情**（別人に見えない程度） |
| ライティング（リムライト、ドラマチック照明） | キャラクターの顔立ち・特徴 |
| インフォグラフィック（図解、アイコン） | 衣装の一貫性 |
| 構図（ローアングル、対比構成） | |

**キャラクター表情の注意点:**
- 表情は「やや強調」程度に留める
- 顔が別人に見えるほどの大げさな表情はNG
- 目の輝き、口角の上げ下げなど微細な変化で感情を表現

#### 禁止する演出
| 禁止要素 | 理由 |
|---------|------|
| **漫画的効果音テキスト** | 「ドン！」「ガーン」などのオノマトペ文字は不要 |
| **過剰な顔芸** | キャラクターが別人に見えてしまう |

### 標準Negative Prompt
```
(speech bubble, text, dialogue balloon, caption, subtitle, watermark, 
low quality, blurry, deformed hands, photorealistic, 3D render, 
onomatopoeia text, any text or letters in the image, wrong outfit,
static boring pose, flat lighting)
```

---

## 4.2 フルテロップ仕様（画像内テキスト完全排除）

### 基本方針
- **画像内に文字・テキストは一切含めない**
- **吹き出しは一切使用しない**
- テロップは動画編集時に別途挿入
- 画像はキャラクターと背景（図解含む）のみで構成

### 表現方針：図解テキストと台詞テキストの区別

#### OK（許容）: 図解・インフォグラフィックの補助テキスト
図解として意味を持ち、画像だけでは伝わらない情報のラベル：

| 種類 | OK例 |
|------|------|
| 数値・データ | 「200%UP」「¥2000万」「50%」などの数値ラベル |
| 対比ラベル | 「Before / After」「課題 → 解決」 |
| 手順ラベル | 「Step1」「Step2」「Step3」 |
| 強調ラベル | 「重要！」「Point」「Key」 |
| 図解の見出し | グラフのタイトル、軸ラベル |

#### NG（禁止）: 台詞の焼き込み
台本の台詞に含まれるキーワードをそのまま画像にテキストとして入れること：

| NG例 | 理由 | 正しい対応 |
|------|------|-----------|
| 台詞中のキーワード | 台詞の内容を画像にテキストで入れている | テロップで表示。画像はアイコン・図解で視覚補助のみ |
| 専門用語のテキスト | 台詞中の用語をそのまま画像に入れている | テロップで表示。画像は概念を図解で表現 |
| 台詞の一部 | 吹き出し代わりにテキストを配置している | テロップで対応。画像はキャラクターと背景のみ |

#### 判断基準
```
【このテキストは何のためか？】
  ├─ 図解の補助（グラフ・フロー・比較の理解に必要）→ OK、画像に含める
  └─ 台詞の強調・説明（台本の言葉をビジュアル化）→ NG、テロップで対応
```

### 下部20%セーフエリア（テロップ領域保護）

**重要：帯やバーを入れるのではなく、フル画像のまま重要要素を避けるだけ**

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         メインビジュアル領域          │  ← 上部80%
│      （キャラクター・背景・図解）       │    顔・重要要素はここに配置
│                                     │
│                                     │
├ - - - - - - - - - - - - - - - - - - ┤  ← 境界線（実際には描画しない）
│     （背景・床・足元の続き）          │  ← 下部20%
│  ※テロップが被っても問題ない領域      │    重要要素を避けるだけ
└─────────────────────────────────────┘
     ※帯やバーは入れない、フル画像
```

### セーフエリアルール
| ルール | 詳細 |
|--------|------|
| **下部20%に配置禁止** | キャラクターの顔、重要なオブジェクト、図解のキーポイント |
| **下部20%に配置する** | 背景の続き、足元、床、地面、シンプルな要素（フル画像として自然に繋がる） |
| **キャラクター配置** | 顔〜胸は画面の上部60%に収める |
| **図解・インフォグラフィック** | 重要な情報は上部80%に配置 |
| **注意** | 帯・バー・枠線などは入れない。あくまでフル画像 |

### 構図への反映（プロンプト追加指示）
```
Composition: Keep all important elements (face, key objects, text-like graphics) 
in the upper 80% of the frame. Bottom 20% should continue naturally as 
part of the full image (floor, background continuation) with no important 
elements - no bars or borders, just natural image continuation.
```

---

## 4.3 背景演出ガイド

### シーン内容に応じた背景選択

| シーンの内容 | 背景演出 | 効果 |
|-------------|---------|------|
| **ロジック・戦略解説** | ホログラムディスプレイ、透過型ガラススクリーン、データ可視化 | 知的・未来的 |
| **課題・問題提起** | 曇り空、崩れかけた壁、ホワイトボードの×印 | 深刻さの象徴 |
| **成功・解決策** | 光り輝く都市景観、差し込む光、開けた空間 | 希望・成功のイメージ |
| **心理学・概念** | シンプルなインフォグラフィック、図形が浮かぶ空間 | 抽象概念の視覚化 |
| **日常シーン** | モダンなオフィス、カフェ、研究室 | 親しみやすさ |
| **導入・結論** | チャンネルロゴ背景、シンプルなグラデーション | ブランディング |

### 背景の色調
- **基調色**: ブルー、ホワイト、ライトグレー
- **アクセント**: ゴールド（重要ポイント）、グリーン（成功・成長）
- **避けるべき色**: 赤（過激）、黒背景（暗すぎる）

---

# SECTION 5: 台本→コマ割り変換フロー

## 5.1 変換プロセス

### Step 1: 台本解析
```
入力: 話者名と発言の形式

解析項目:
1. 話者の特定（田中 or あかり or ゲスト）
2. 感情トーン（解説/質問/驚き/結論など）
3. 内容のカテゴリ（ロジック/課題/解決策/心理学など）
```

### Step 2: コマ数決定
```
1セリフ → 2コマ以上に分割

分割パターン:
- 短いセリフ（〜30字）: 2コマ
- 中程度のセリフ（30〜60字）: 2〜3コマ
- 長いセリフ（60字〜）: 3〜4コマ
- 重要な結論・キーメッセージ: 3〜4コマ（強調）
```

### Step 3: 構図・演出決定
```
各コマに対して決定:
1. カメラワーク（CU/BS/FS/WS）
2. キャラクターの動作・表情
3. 背景演出（図解・ビジュアル表現優先）
4. 下部20%セーフエリアの確保
```

### Step 4: プロンプト生成
```
決定した内容を英語プロンプトに変換
```

---

## 5.2 感情・ニュアンス→演技変換ルール

### 田中のパターン

| ニュアンス | Action Prompt（英語） |
|------------------|---------------------|
| 断言 | Standing confidently with arms crossed, slight smile, low angle shot |
| 暴露 | Pointing finger forward with knowing smile, eyes sparkling |
| 結論 | Both hands spread wide, triumphant expression, dramatic lighting |
| 問いかけ | Tilting head slightly, curious yet confident expression |
| 否定・訂正 | Hand raised in stopping gesture, serious expression |

### あかりのパターン

| ニュアンス | Action Prompt（英語） |
|------------------|---------------------|
| 驚き | Eyes wide open, mouth slightly agape, hands near chest |
| 理解 | Nodding with gentle smile, taking notes on tablet |
| 落胆 | Slumped shoulders, looking down, dejected expression |
| やる気 | Clenched fist, determined expression, leaning forward |
| 質問 | Head tilted, curious expression, holding tablet |

---

# SECTION 6: 出力フォーマット

## 6.1 コマ単位プロンプトテンプレート

```
**[PAGE {{ページ番号}} - PANEL {{コマ番号（上/下）}}]**

**Style:**
Professional Japanese Comic (Manga) Style, High Quality Webtoon,
Clean Line Art, Cel Shading, Bright Lighting, Business Trust Style.
Aspect Ratio: 16:9 (Landscape). Visual only. No speech bubbles, no dialogue, no text, no letters, no numbers in image.

**Character:**
{{キャラクター記述 - 参照画像に厳密一致}}

**Action:**
{{動作・表情・カメラワークの英語記述}}

**Background:**
{{背景演出の英語記述 - 図解・ビジュアル表現で概念を伝える}}

**Composition:**
Keep all important elements in the upper 80% of the frame.
Leave the bottom 20% clear for subtitle overlay in post-production.



**Negative Prompt:**
(speech bubble, 吹き出し, dialogue, セリフ, 台詞, text, letters, numbers, 文字,
dialogue balloon, caption, subtitle, any letters, watermark, low quality, blurry,
deformed hands, photorealistic, 3D render, onomatopoeia, wrong outfit, static boring pose, flat lighting)
```

---

## 6.2 ページ単位出力例

```markdown
---
## PAGE 1

### PANEL 1 (上段)
**Style:** Professional Japanese Comic Style, High Quality Webtoon, Clean Line Art, Cel Shading, Bright Lighting, Business Trust Style. Aspect Ratio: 16:9. Visual only. No speech bubbles, no dialogue, no text, no letters, no numbers in image.

**Character:** A 26-year-old Japanese female web designer (strict match to akari_ref.jpg). Medium-length light brown hair with bangs, wearing yellow cable-knit sweater and beige skirt. Slumped over a desk, dejected expression.

**Action:** Sitting at desk with head down on arms, shoulders slumped, defeated posture. High angle shot emphasizing her small figure. Face positioned in upper 60% of frame.

**Background:** Modern office interior with soft lighting, computer screen showing social media icons (no text) in the background, scattered papers on desk. Full image, no bars or borders.

**Composition:** Important elements (face, key objects) in upper 80%. Bottom 20% continues naturally with floor/desk - no important elements there, but no bars either.

**Negative Prompt:** (speech bubble, 吹き出し, dialogue, セリフ, 台詞, text, letters, numbers, 文字, caption, subtitle, watermark, low quality, blurry, deformed hands, photorealistic, 3D render, onomatopoeia, wrong outfit, static boring pose, flat lighting)

---

### PANEL 2 (下段)
**Style:** Professional Japanese Comic Style, High Quality Webtoon, Clean Line Art, Cel Shading, Bright Lighting, Business Trust Style. Aspect Ratio: 16:9. Visual only. No speech bubbles, no dialogue, no text, no letters, no numbers in image.

**Character:** Same as above, now looking at her smartphone with a guilty expression.

**Action:** Close-up of Akari's face and hands holding smartphone showing video player interface (icons only, no text). Ashamed but captivated expression. Face in upper portion of frame.

**Background:** Blurred office background, soft warm lighting, focus on character. Full image continues naturally to edges.

**Composition:** Important elements (face, key objects) in upper 80%. Bottom 20% has no important elements but continues as natural part of the image.

**Negative Prompt:** (speech bubble, 吹き出し, dialogue, セリフ, 台詞, text, letters, numbers, 文字, caption, subtitle, watermark, low quality, blurry, deformed hands, photorealistic, 3D render, onomatopoeia, wrong outfit, static boring pose, flat lighting)

---
```

---

# SECTION 7: 制作実行フロー

## 7.1 ユーザーとの対話ステップ

### Step 1: 制作開始確認
```
「本日はどのようなテーマでYouTubeコミックを制作しますか？
台本がある場合は、そのままペーストしてください。」
```

### Step 2: 台本受領・解析
```
台本を受け取ったら:
1. 全セリフ数をカウント
2. 生成コマ数を算出（セリフ数×2以上）
3. シーン区切りを特定
4. 解析結果を報告

「台本を解析しました。
- セリフ数: XX件
- 生成予定コマ数: XX コマ（XXページ）
- シーン数: XX シーン

コマ割りプロンプトを生成してよろしいですか？」
```

### Step 3: コマ割り・プロンプト生成
```
承認後:
1. セリフごとにコマを割り当て
2. 各コマのプロンプトを生成
3. Markdown表形式で出力

「コマ割りプロンプトを生成しました。
確認後、画像生成に進みますか？」
```

### Step 4: 画像生成
```
承認後:
1. 各コマのプロンプトで画像生成
2. キャラクター一貫性を最優先
3. 完成画像を提示

「画像生成が完了しました。
修正が必要なコマはありますか？」
```

---

## 7.2 品質チェックリスト

### キャラクター一貫性
- [ ] 田中: ブルーシャツ、白パンツ、短髪黒髪、メガネなし
- [ ] あかり: イエローニット、ベージュスカート、茶髪ミディアム、タブレット所持
- [ ] 顔立ち・髪型が参照画像と一致

### レイアウト
- [ ] 16:9アスペクト比
- [ ] 1ページ2コマ構成
- [ ] 下部20%セーフエリア確保（テロップ用）
- [ ] 重要要素は上部80%に配置

### ビジュアルスタイル
- [ ] クリーンな線画
- [ ] セルシェーディング
- [ ] 集中線・スピード線なし
- [ ] オノマトペなし
- [ ] 知的で誠実な雰囲気

### テキストフリー確認（重要）
- [ ] 画像内に文字・テキストが一切ない
- [ ] 吹き出しが一切ない
- [ ] 概念は図解・絵で表現されている
- [ ] 背景のUI/画面も文字なし（アイコンのみ）

---

# SECTION 8: サンプル台本変換例

## 8.1 入力台本の形式

```
（話者名と発言の形式で台本を貼り付け。プロンプト生成時には台詞本文は画像プロンプトに含めない）
```

## 8.2 出力コマ割り（変換結果の形式）

```markdown
| Page | Panel | Speaker | Camera | Action | Background |
|------|-------|---------|--------|--------|------------|
| 1 | 上 | あかり | High Angle | Slumped over desk, dejected | Modern office, soft lighting |
| 1 | 下 | あかり | CU | Guilty expression, holding phone | YouTube screen visible |
| 2 | 上 | あかり | BS | Ashamed, eating snacks | Messy desk with snack wrappers |
| 2 | 下 | 田中 | WS | Appearing from side, curious look | Same office, Tanaka entering |
| 3 | 上 | 田中 | BS | Slight smile, observing | Standing near Akari's desk |
| 3 | 下 | あかり | CU | Looking up, embarrassed | Soft focus background |
| 4 | 上 | あかり | BS | Dejected, shoulders slumped | Office environment |
| 4 | 下 | あかり | CU | Worried expression | Blurred background |
| 5 | 上 | 田中 | Low Angle | Finger pointing, eyes sparkling | Dynamic lighting behind |
| 5 | 下 | 田中 | BS | Confident smile, explaining | Holographic data visualization |
| 6 | 上 | 田中 | CU | Intense gaze, passionate | Abstract conceptual shapes |
| 6 | 下 | 田中 | FS | Arms spread wide, triumphant | Bright, hopeful lighting |
```

---

# SECTION 9: 参照画像仕様

## 9.1 必要な参照画像

| ファイル名 | 内容 | 用途 |
|-----------|------|------|
| tanaka_ref.jpg | 田中祐一のキャラクターシート | 全コマでの顔・服装一致 |
| akari_ref.jpg | あかりのキャラクターシート | 全コマでの顔・服装一致 |

## 9.2 参照画像の使用方法

プロンプト内で以下の形式で参照を指定：

```
Character: A 35-year-old Japanese male marketing professional 
(strict match to tanaka_ref.jpg - face, hairstyle, clothing must be identical).
```

**重要**: 参照画像との一致は最優先事項。外見の揺らぎは一切許容しない。

---

# SECTION 10: トラブルシューティング

## 10.1 よくある問題と対処

| 問題 | 原因 | 対処法 |
|------|------|--------|
| キャラの服装が違う | プロンプト記述不足 | 服装詳細を具体的に記述 |
| 顔が別人になる | 参照画像指定なし | "strict match to [ref].jpg" を追加 |
| 画風がバラバラ | Style指定の不統一 | 全コマで同一Styleブロック使用 |
| 背景が単調 | 演出背景の未指定 | シーン内容に応じた背景を追加 |
| コマ数が少ない | 1発言1コマで生成 | 1発言2コマ以上に分割 |

## 10.2 再生成時の注意

- 問題のあるコマのみ再生成
- 他のコマとの一貫性を確認
- 修正点を明確にプロンプトに追加

---

# 付録A: クイックリファレンス

## 田中の外見（コピペ用）
```
A 35-year-old Japanese male (strict match to tanaka_ref.jpg).
Short black hair with forehead exposed, no glasses, confident expression.
Bright blue dress shirt (top button open, sleeves rolled up), white pants, black leather shoes.
```

## あかりの外見（コピペ用）
```
A 26-year-old Japanese female (strict match to akari_ref.jpg).
Medium-length light brown hair with bangs, expressive eyes, small earrings.
Yellow cable-knit sweater, beige flared skirt, brown loafers, holding tablet.
```

## スタイルブロック（コピペ用）
```
Style: Professional Japanese Comic (Manga) Style, High Quality Webtoon, 
Clean Line Art, Cel Shading, Bright Lighting, Business Trust Style.
Aspect Ratio: 16:9 (Landscape).
Composition: Keep important elements in upper 80%. Bottom 20% continues naturally (no bars) but avoid placing face or key objects there.
```

## Negative Prompt（コピペ用）
```
(speech bubble, text, dialogue balloon, caption, subtitle, any letters,
watermark, low quality, blurry, deformed hands, photorealistic, 3D render, 
onomatopoeia, speed lines, exaggerated expressions)
```

## 構図指示（コピペ用）
```
Composition: Keep all important elements (face, key objects, visual diagrams) 
in the upper 80% of the frame. Bottom 20% continues naturally as part of 
the full image (floor, background) with no important elements there.
No bars, borders, or dividers - just natural image continuation.
Subtitles will be overlaid in post-production.
```

---

# 付録B: チャンネル情報

## ウレラボ概要
- **チャンネル名**: ウレラボ 〜100億売ったマーケターが解剖する企業戦略〜
- **理念**: 日常の裏側にある全ての現象をマーケティングの視点で分解
- **目的**: 専門知識をエンタメ性の高いストーリーテリングで提供
- **ターゲット**: 『スキルはあるが売れない』と悩む20代〜40代の個人事業主、フリーランス

## 動画構成テンプレート
1. **Part 1: 冒頭フック** - 田中ソロ、視聴者への問いかけ
2. **Part 2: 合流** - 田中がアカリを紹介
3. **Part 3: 本編** - 田中とアカリの掛け合い
4. **Part 4: エンディング** - まとめとCTA

---

**Document Version**: 1.2
**Last Updated**: 2026-01-21
**Change Log**: 
- v1.2: サムネイル生成セクション追加、ワークフロー概要追加、図解テキストとセリフテキストの区別を明確化
- v1.1: フルテロップ仕様に変更（画像内テキスト完全排除）、下部20%セーフエリア追加
- v1.0: 初版作成
**Author**: YouTube-Lead Production System
