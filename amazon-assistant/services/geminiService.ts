
import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedContent, AllImagePayloads, ImagePayload } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    kdpDetails: {
      type: Type.OBJECT,
      description: "Kindle本の詳細情報",
      properties: {
        language: { type: Type.STRING, description: "言語 (日本語 or English)" },
        title: { type: Type.STRING, description: "本のタイトル。特殊記号を排除したクリーンなテキスト。" },
        titleKana: { type: Type.STRING, description: "タイトルのカタカナ表記（英語の場合は空欄または読み方）" },
        titleRomaji: { type: Type.STRING, description: "タイトルのローマ字表記" },
        subtitle: { type: Type.STRING, description: "サブタイトル" },
        subtitleKana: { type: Type.STRING, description: "サブタイトルのカタカナ表記" },
        subtitleRomaji: { type: Type.STRING, description: "サブタイトルのローマ字表記" },
        seriesName: { type: Type.STRING, description: "シリーズ名（該当する場合）" },
        seriesVolume: { type: Type.STRING, description: "巻数" },
        author: { type: Type.STRING, description: "著者名（入力から推測、または[未入力]）" },
        description: { type: Type.STRING, description: "Amazonページ用紹介文。HTMLタグ込みで4000文字以内のSEO対策テキスト。" },
        publishingRights: { type: Type.STRING, description: "出版権に関する記述" },
        keywords: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "7つの検索キーワード"
        },
        categories: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "カテゴリーパス (3つ)"
        },
        adultContent: { type: Type.STRING, description: "成人向けコンテンツか否か" },
      },
      required: ["language", "title", "titleKana", "titleRomaji", "subtitle", "description", "publishingRights", "keywords", "categories", "adultContent"]
    },
    kdpContent: {
      type: Type.OBJECT,
      description: "Kindle本のコンテンツ情報",
      properties: {
        drm: { type: Type.STRING, description: "DRM設定" },
        manuscriptFileName: { type: Type.STRING, description: "原稿ファイル名の例" },
        coverFileName: { type: Type.STRING, description: "表紙ファイル名の例" },
        aiGeneratedContent: { type: Type.STRING, description: "AI生成コンテンツに関する申告（Gemini使用の旨）" },
      },
      required: ["drm", "manuscriptFileName", "coverFileName", "aiGeneratedContent"]
    },
    kdpPricing: {
      type: Type.OBJECT,
      description: "Kindle本の価格設定",
      properties: {
        kdpSelect: { type: Type.STRING, description: "KDPセレクト登録" },
        marketplace: { type: Type.STRING, description: "主なマーケットプレイス" },
        territory: { type: Type.STRING, description: "テリトリー" },
        royaltyPlan: { type: Type.STRING, description: "ロイヤリティプラン" },
        price: { type: Type.STRING, description: "推奨価格 (JPY or USD)" },
      },
      required: ["kdpSelect", "marketplace", "territory", "royaltyPlan", "price"]
    },
    aPlusContent: {
      type: Type.ARRAY,
      description: "Amazon A+コンテンツのモジュール案。",
      items: {
        type: Type.OBJECT,
        properties: {
          moduleName: { type: Type.STRING },
          purpose: { type: Type.STRING },
          imageSuggestion: { type: Type.STRING },
          bigHeadline: { type: Type.STRING, description: "大見出し (Amazon入力欄の『大きなタブタイトル』用)" },
          headline: { type: Type.STRING, description: "見出し (Amazon入力欄の『タイトル』用)" },
          description: { type: Type.STRING },
        },
        required: ["moduleName", "purpose", "imageSuggestion", "bigHeadline", "headline", "description"],
      },
    },
  },
  required: ["kdpDetails", "kdpContent", "kdpPricing", "aPlusContent"],
};

interface RefinementRequest {
    section: string;
    request: string;
    originalContent: GeneratedContent;
}

export const generateBestsellerStrategy = async (
  promptText: string,
  images: AllImagePayloads,
  language: string = 'ja',
  refinement?: RefinementRequest,
): Promise<GeneratedContent> => {
  const model = "gemini-2.5-pro";
  
  const isEnglish = language === 'en';
  
  const languageInstruction = isEnglish 
    ? `
      # Language Settings
      - **Target Market**: English speaking countries (US, UK, etc.).
      - **Output Language**: Generate Title, Subtitle, Keywords, and Main Content in **English**.
      - **Translation Requirement**: For the **'Description'** field and **'A+ Content description'** fields, YOU MUST append a Japanese translation below the English text.
        - Format: 
          [English Text]
          
          --- 日本語訳 (Japanese Translation) ---
          [Japanese Text]
      - **Currency**: Suggest price in USD (e.g., $9.99).
      `
    : `
      # 言語設定
      - **ターゲット市場**: 日本 (Japan)。
      - **出力言語**: 全て **日本語** で出力してください。
      - **通貨**: 日本円 (JPY) で提案してください。
    `;

  const basePrompt = `
    あなたは、Amazon KDPのベストセラー作家兼マーケティングコンサルタントです。
    ユーザーが提供する書籍のコンセプトに基づいて、KDPの出版申請画面にそのままコピペできる完璧な申請データと、戦略的なマーケティング資料を作成してください。

    ${languageInstruction}

    # 提供情報
    ${promptText}

    # 画像情報
    - キャラクター画像
    - 印象的な画像1, 2, 3
    ${images.author ? '- 著者プロフィール画像' : ''}
  `;

  const generationTaskPrompt = `
    # 生成タスク: Amazon KDP 出版申請完全パッケージ

    以下のセクションに従って、具体的かつ戦略的な内容を生成してください。入力情報から明確に判断できない項目は、ベストセラーを狙うための最適な提案を行うか、ユーザーが確認すべき箇所として「[未入力]」や「[要確認]」としてください。

    ## 1. Kindle本の詳細 (KDP Details)
    - **タイトル/サブタイトル**: 
      - SEOを意識し、クリック率を高める魅力的なタイトルを考案してください。
      - 特殊記号は極力排除してください。
      - ${isEnglish ? "Generate in English. Provide Japanese reading (Kana) only if appropriate or leave blank." : "日本語のKindleストア向けに、カタカナ読み（ヨミガナ）とローマ字読みも正確に生成してください。"}
    - **著者**: テキスト情報に記載があればそれを使用し、なければペンネームを提案するか「[著者名を入力]」としてください。
    - **内容紹介 (Description) 【最重要・長文SEO対策】**: 
      - **目的**: Amazon内の検索エンジン（A9）に最大限ヒットさせ、かつ読者を強烈に惹きつけるための「最強の販売ページ」用テキストを作成します。
      - **文章術**: 読者の感情を揺さぶり、購入ボタンを押さずにはいられないような『催眠的な文章術』や『心理的トリガー』を駆使してください。退屈な説明文ではなく、エモーショナルな「手紙」のように書いてください。
      - **文字数**: **Amazon KDPの仕様（HTMLタグを含めて4000文字以内）を厳守してください**。
        - エラーを防ぐため、**HTMLタグ込みで3800文字以内**を目指してください。
        - **日本語の場合**: テキスト部分は**2000〜2800文字程度**が目安です。
        - **英語の場合**: テキスト部分は**500〜700単語程度**が目安です（HTMLタグの分を考慮）。
      - **SEO**: 選定したキーワード、およびその類義語、共起語を文章全体に自然な形で大量に散りばめてください。
      - **構成**: 以下の流れを意識して構成してください。
        1. **冒頭のフック（3行以内）**: 「もっと見る」をクリックさせるための衝撃的な事実、問いかけ、または強烈なベネフィット。
        2. **問題提起と共感**: 読者が抱える悩みや痛みに寄り添う。
        3. **解決策の提示**: 本書がその悩みをどう解決するか。
        4. **権威性と信頼性**: なぜ著者がそれを語れるのか、本書の信頼性。
        5. **具体的なベネフィット（箇条書き）**: 本書を読むことで得られるメリットを10個以上列挙。
        6. **内容のチラ見せ（目次・章立て）**: 各章で何が学べるかを具体的に記述。
        7. **ターゲット読者**: 「こんな方におすすめ」を具体的に列挙。
        8. **行動喚起 (CTA)**: 今すぐ購入すべき理由、特典、限定性など。
      - **フォーマット**: 
        - 読みやすさを維持するため、適度な空白行を入れてください。
        - 重要な箇所にはHTMLタグ（<b>太字</b>）を使用してください。
        - ${isEnglish ? "**IMPORTANT**: Append the Japanese translation at the bottom." : ""}
    - **キーワード**: 検索ボリュームがあり、かつ競合の隙間を突く7つのキーワードを選定してください。紹介文にもこれらを盛り込んでください。
    - **カテゴリー**: ベストセラーバッジを取りやすい、関連性の高いカテゴリーを必ず**3つ**選定してください。競合が強すぎるレッドオーシャンだけでなく、ニッチな穴場カテゴリーも含めてください。

    ## 2. Kindle本のコンテンツ (KDP Content)
    - **DRM**: 著作権保護のため「はい（有効）」を推奨。
    - **ファイル名**: 適切なファイル名の例を示してください。
    - **AI生成コンテンツ**: Amazon KDPでは、画像やテキストにAIを使用したかどうかの申告が必要です。「画像生成およびテキスト生成にGoogleの生成AI『Gemini』を使用」という旨を明確に記載した申告文を作成してください。${isEnglish ? "(Provide in English)" : ""}

    ## 3. Kindle本の価格設定 (KDP Pricing)
    - **価格戦略**: コンテンツのボリュームやジャンルの相場を考慮し、70%ロイヤリティが得られる最適な価格を提案してください。
    - **KDPセレクト**: 読み放題対象にするメリットを考慮し、基本は「はい」を推奨してください。

    ## 4. A+コンテンツ戦略 (Marketing Strategy)
    - 読者の購買意欲を決定づけるA+コンテンツ（商品紹介コンテンツ）の構成案を5つのモジュールで作成してください。
    - 各モジュールのテキストは簡潔にし、提供された画像をどう配置するか具体的に指示してください。
    - **大見出し (Big Headline)**: 読者を惹きつける強力なキャッチコピー（Amazon入力欄の『大きなタブタイトル』用）。
    - **見出し (Headline)**: 具体的な内容やメリットを示すサブコピー（Amazon入力欄の『タイトル』用）。
    - **説明文 (Description)**: ${isEnglish ? "English (with Japanese translation appended)." : "日本語。"}
    - **画像案**: インパクトのあるテキスト中心のバナー画像を作成するための指示を含めてください。
  `;
  
  const refinementPrompt = refinement ? `
    # 以前の生成結果
    \`\`\`json
    ${JSON.stringify(refinement.originalContent, null, 2)}
    \`\`\`

    # 修正依頼
    以前の生成結果の「${refinement.section}」セクションについて、以下の指示に基づいて修正してください。
    **指示: ${refinement.request}**
    
    もし「内容紹介」の修正であれば、SEOを意識したキーワード選定と、文字数制限（HTMLタグ込み4000文字以内）を厳守してください。
    ${isEnglish ? "Ensure output is in English with Japanese translation appended." : ""}
  ` : '';

  const mainPrompt = `
    ${basePrompt}
    ${refinement ? refinementPrompt : generationTaskPrompt}
    # 出力形式
    必ず、指定されたスキーマに厳密に従った単一のJSONオブジェクトとして応答してください。
  `;

  const imageParts = [
    { inlineData: { mimeType: images.character.mimeType, data: images.character.data } },
    { inlineData: { mimeType: images.memorable1.mimeType, data: images.memorable1.data } },
    { inlineData: { mimeType: images.memorable2.mimeType, data: images.memorable2.data } },
    { inlineData: { mimeType: images.memorable3.mimeType, data: images.memorable3.data } },
  ];

  if (images.author) {
    imageParts.push({ inlineData: { mimeType: images.author.mimeType, data: images.author.data } });
  }
  
  const textPart = { text: mainPrompt };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [textPart, ...imageParts] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as GeneratedContent;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("AIからの応答の解析に失敗しました。生成をやり直してください。");
  }
};

export const generateAPlusImage = async (
    description: string, 
    headline: string, 
    language: string = 'ja',
    referenceImage?: ImagePayload
): Promise<string> => {
    try {
        const isEnglish = language === 'en';
        
        const textInstruction = isEnglish
            ? `RENDER THE TEXT: "${headline}" explicitly in the image. The text must be legible, massive, and central.`
            : `Design the image with a large, bold placeholder area for text. OR if possible, render the text "${headline}". Focus on the VISUAL IMPACT of the typography layout.`;

        const prompt = `
            Create a **High-Impact Manga-Style Marketing Banner** for Amazon A+ content (Aspect Ratio 16:9).
            
            **Concept**: "Manga Original Art Style" x "High-Conversion Marketing".
            
            **Visual Style**: 
            - **Manga Aesthetic**: Strictly use the style of Japanese manga (comic) illustrations. Dynamic line work, dramatic shading, speed lines (beta flash).
            - **Text as Protagonist**: The typography should be massive, explosive, and integrated into the manga art.
            - **Color Palette**: High contrast. Black & White with Gold/Red accents, OR vibrant Manga Cover colors.
            - **Composition**: Dynamic, energetic. Like a "Weekly Shonen Jump" magazine cover or a high-selling manga advertisement.
            
            **Reference**: 
            - **CRITICAL**: If a reference image is provided, MIMIC its art style and character design exactly. Use the character from the reference image.
            
            **Content**:
            - **Headline**: ${textInstruction}
            - **Visual Context**: ${description}
            
            **Goal**: A powerful, dramatic image that looks like a page from a hit manga series turned into an advertisement.
            Avoid subtle or minimal designs. Go for "Maximalist Manga Marketing".
        `;

        const parts: any[] = [{ text: prompt }];
        if (referenceImage) {
            parts.push({
                inlineData: {
                    mimeType: referenceImage.mimeType,
                    data: referenceImage.data
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                imageConfig: {
                    aspectRatio: "16:9" 
                }
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
        
        throw new Error("No image data found in response");

    } catch (error) {
        console.error("Error generating A+ image:", error);
        throw new Error("画像の生成に失敗しました。");
    }
};
