
import { TargetRegion } from './types';

export const GENRE_LIST = [
  "「マンガでわかる」・解説学習系",
  "恋愛・人間ドラマ系",
  "ライフハック・自己成長・教育系",
  "マネー・経済・キャリア系",
  "AI・テクノロジー系（2025年トレンド）",
  "ライト文芸・ストーリー系",
  "実用系・ノウハウ系",
  "ビジネス・起業ストーリー系",
  "実話ベース・ドキュメンタリー系",
  "美容・健康・ライフスタイル系",
  "クリエイター・アート系",
  "パーソナルストーリー・半自伝系",
  "SNS向けショート系",
  "アクション・アドベンチャー",
  "ミーム・ユーモア・風刺",
  "古典文学・名作リメイク",
];

const isPracticalGenre = (genre: string): boolean => {
  const STORY_KEYWORDS = ["ストーリー", "物語", "ドラマ", "文芸", "冒険", "ファンタジー", "ドキュメンタリー", "伝記", "自伝", "リメイク", "ショート", "ミーム"];
  if (STORY_KEYWORDS.some(k => genre.includes(k))) return false;
  const PRACTICAL_KEYWORDS = ["マンガでわかる", "解説", "学習", "ビジネス", "ノウハウ", "実用", "入門", "ライフハック", "AI", "マネー", "経済", "健康", "教育", "クリエイター"];
  return PRACTICAL_KEYWORDS.some(k => genre.includes(k));
};

const getRegionContext = (region: TargetRegion) => {
  return region === 'domestic' 
    ? { 
        name: '日本国内', 
        market: '日本国内市場', 
        audience: '日本の読者', 
        crossBorder: '海外トレンドの日本流ローカライズ',
        admonition: '日本の社会背景（少子高齢化、将来不安、推し活、タイパ重視）と、SNS上の本音（建前ではない悩み）を踏まえて分析してください。',
        subjectPrefix: '日本国内では',
        namingPolicy: '現代的で実在感のある日本人のフルネーム。佐藤 健斗、小林 芽依などのように、職業や年齢にふさわしい信頼感のある名前。'
      }
    : { 
        name: '英語圏（特に北米）', 
        market: '英語圏（特に北米）の市場', 
        audience: '英語圏の読者（北米中心）', 
        crossBorder: '日本の漫画的表現（Graphic Guides）の活用',
        admonition: '重要: 日本独自の概念（偏差値、先輩後輩など）を避け、現地の文化背景（Gen Z, Millennials, FIRE）やトレンド用語（GPA, Prom, Internship）に合わせて分析してください。',
        subjectPrefix: '北米・英語圏市場では',
        namingPolicy: '多様な文化的背景（Elena, Mateo, Priya, Jordan, Marcus, Kenjiなど）を反映した、現代的な英語圏の名前。'
      };
};

export const getGenreProposalPrompt = (region: TargetRegion) => {
  const ctx = getRegionContext(region);
  return `
あなたは「${ctx.market}専門のマンガトレンドアナリスト」です。
現在の${ctx.market}において、**「需要は爆発しているが、決定版となる書籍（マンガ）がまだ存在しない（供給不足）」**ブルーオーシャンなジャンルを5つ特定してください。

# ターゲット市場と分析方針
- **対象市場**: ${ctx.market}
- **文脈**: ${ctx.admonition}

# 出力形式
- 5つのジャンルを提案してください。
- 各ジャンルの間には、必ず **\`---SECTION_SPLIT---\`** を入れてください。
- 冒頭の挨拶は不要です。

# 出力フォーマット
1. **ジャンル名**：【市場の痛み/欲求】...【なぜ今マンガなのか】...
---SECTION_SPLIT---
...
`;
};

export const getTopicProposalPrompt = (genre: string, keyword: string | undefined, region: TargetRegion) => {
  const ctx = getRegionContext(region);
  const isPractical = isPracticalGenre(genre);
  
  const keywordConstraint = keyword 
    ? `\n# 最優先事項：テーマ「${keyword}」の深掘り
1. **検索分析**: ${keyword} に関して、今SNSやフォーラムで最も「議論されている課題」や「未解決の疑問」を検索して特定せよ。
2. **タイトルへの反映**: 提案する5つのうち3つ以上は、タイトルに「${keyword}」を明確に含めること。
3. **実用性の定義**: 実在ツール（Gemini 3, Manus等）の場合、機能説明ではなく「読者が明日から得られる具体的利益」をタイトルと企画の核にすること。`
    : "";

  return `
あなたはAmazonランキング1位を連発する「世界最高のブックプロデューサー」です。
Gemini 3.0のSearch Grounding機能を使い、**「${genre}」**というジャンルにおいて、読者が「これは自分のための本だ！」と叫びたくなる強力なマンガ企画を5つ提案してください。

# 厳守すべきリサーチ・思考ステップ
1. **【Search & Analysis】**: 
   - まず、${ctx.market}において「${genre} ${keyword || ''}」に関連する現在の検索トレンド、YouTubeの再生数が多い動画、フォーラム（RedditやYahoo知恵袋）での切実な悩みを検索し、**「未だ解決されていない深い痛み（Deep Pain）」**を3つ特定してください。
2. **【Ideation】**: 特定したPainを解決する「世界で最もわかりやすいマンガ解説」または「感情を激しく揺さぶるストーリー」を構築してください。
3. **【Copywriting】**: 人間の心理（好奇心、恐怖、利得）を刺激する、思わずクリックしたくなるタイトルを付けてください。

# 設定上の制約
- **ネーミング**: **「Alex (アレックス)」は禁止です。** ${ctx.namingPolicy} に従い、背景を感じさせる名前を付けてください。

# 前提条件
- **Target Market**: ${ctx.market}
- **Market Context**: ${ctx.admonition}
${keywordConstraint}

# 出力形式
- 各提案の間に **\`---SECTION_SPLIT---\`** を入れてください。
- 冒頭の挨拶は不要です。

# 出力テンプレート
1. **タイトル案**: [メインタイトル] 〜[サブタイトル]〜
2. **リサーチ・インサイト**: [検索で判明した最新の市場ニーズや、競合が触れていない欠落点]
3. **ターゲットの渇望**: [Before: どんな具体的な悩みや渇望を抱えているか]
4. **企画の勝ち筋**: [After: 読後どうなれるか。なぜこの企画が既存の活字本に勝てるのか]
5. **主人公設定**: [名前(フルネーム) / 属性 / 性格 / 現在の悩み]
`;
};

export const getConceptPrompt = (topic: string, region: TargetRegion) => {
  const ctx = getRegionContext(region);
  return `
Role: あなたは「グローバル・ベストセラー・プロデューサー」兼「シリーズ構成の達人」です。
Gemini 3.0の能力を駆使し、シリーズ累計100万部を狙える全5巻のマンガ構成案を作成します。

# 対象企画
${topic}

# Target Market
- ${ctx.market}
- ${ctx.admonition}

# ネーミングポリシー（厳守）
- **名前**: ${ctx.namingPolicy}
- **禁止**: "Alex" のようなありふれた名前は使用禁止。

---

### 🧠 Phase 2: High-Density Structuring (構成作成)
この作品が「実用・解説マンガ」か「物語・エンタメマンガ」かを判断し、適切な構成ロジックを採用してください。

**A. 実用・解説マンガの場合（黄金の5巻ロードマップ）**
   * Vol.1: 【拒絶の突破】「私には無理」を解除。最初の成功体験。
   * Vol.2: 【原則】基礎固めと挫折の回避。
   * Vol.3: 【構造】応用力と本質の理解。
   * Vol.4: 【実践】現場での連携・高度な活用。
   * Vol.5: 【変革】プロへの到達。

**B. 物語・エンタメマンガの場合（ストーリーアーク）**
   * Vol.1: 【発端】日常の崩壊。
   * Vol.2: 【試練】挫折と覚醒。
   * Vol.3: 【転換】大きなひねり。
   * Vol.4: 【絶望】最大の危機。
   * Vol.5: 【解決】最終決戦。

**⚠️ 重要ルール**
1. **章番号**: 各巻ごとにChapter 1からリセット。

---

### 📝 Output Format (出力形式)
#### ■ 1. 企画分析レポート
* **形式判定**: [実用解説 or ストーリー]
* **勝算の根拠**: [リサーチに基づく市場の空き地]

#### ■ 2. シリーズ構成案 (The Master Plan)
**シリーズタイトル**: [タイトル]
**コンセプト**: [一言でいうと何の本か]

---
### 【Vol.1: [サブタイトル]】
... (Vol.5まで)

---
# シリーズマスターシート
--- [SERIES MASTER SHEET: START] ---
【基本設定】
- タイトル: [確定タイトル]
- ジャンル形式: [実用解説 / ストーリー]
- 全体構成: 全5巻

【主人公 (Hero/Heroine)】
- 名前: [フルネーム]
- 属性: [具体的な職業・役割]
- Start地点: [当初の悩み]
- Goal地点: [最終的な姿]

【構成進行表】
- Vol.1: [タイトル]
- Vol.2: [タイトル]
- Vol.3: [タイトル]
- Vol.4: [タイトル]
- Vol.5: [タイトル]
--- [SERIES MASTER SHEET: END] ---
`;
};

export const getMasterSheetOnlyPrompt = (concept: string) => `
あなたは「シリーズ構成作家」です。
以下の企画案から「シリーズマスターシート」を抽出・整理してください。
# 企画案
${concept}
--- [SERIES MASTER SHEET: START] ---
【基本設定】
- タイトル: [タイトル]
- ジャンル形式: [実用解説 / ストーリー]
- 全体構成: 全5巻
【主人公】
- 名前: [名前]
- 属性: [職業]
- Start地点: [悩み]
- Goal地点: [到達点]
【構成進行表】
- Vol.1: [タイトル]
- Vol.2: [タイトル]
- Vol.3: [タイトル]
- Vol.4: [タイトル]
- Vol.5: [タイトル]
--- [SERIES MASTER SHEET: END] ---
`;
