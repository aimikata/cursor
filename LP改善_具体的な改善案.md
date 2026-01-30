# LP改善：具体的な改善案

## 改善の目的

### 目標
- 画像広告からのコンバージョンを向上させる（100クリック0申込 → コンバージョン獲得）
- 動画広告の効果を最大化するための基盤を整備する

---

## 改善内容

### 改善1：LPのデモ動画セクションを改善

#### 現在の内容
```html
<!-- デモ動画 -->
<section class="demo" id="demo">
  <div class="container">
    <h2 class="section-title">実際の操作を<span class="gold">3分で見る</span></h2>
    <p class="solution-text" style="margin-bottom: 30px;">
      90分で1冊のマンガを出版する仕組みを、<br>
      実際の操作画面でご紹介します。
    </p>
    <div style="max-width: 800px; margin: 0 auto; background: #0f0f1f; border-radius: 16px; padding: 20px;">
      <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #1a1a2e;">
        <iframe
          src="https://www.youtube.com/embed/JVGTDB-y7to"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
        </iframe>
      </div>
      <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #808090;">
        ※ 動画は約3分です。プロジェクト作成から世界観設計まで、実際の操作をご覧いただけます。
      </p>
    </div>
  </div>
</section>
```

#### 改善案
```html
<!-- デモ動画 -->
<section class="demo" id="demo">
  <div class="container">
    <h2 class="section-title">印税収入を<span class="gold">仕組みで構築するからくり</span>を3分で解説</h2>
    <p class="solution-text" style="margin-bottom: 30px;">
      文章が得意じゃない、絵も描けない。<br>
      それでも印税収入は「仕組み」で構築できます。<br>
      この仕組みのからくりを、3分で解説します。
    </p>
    <div style="max-width: 800px; margin: 0 auto; background: #0f0f1f; border-radius: 16px; padding: 20px;">
      <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #1a1a2e;">
        <iframe
          src="https://www.youtube.com/embed/JVGTDB-y7to"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
        </iframe>
      </div>
      <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #808090;">
        ※ 動画は約3分です。印税収入を仕組みで構築するからくりを、詳しく解説します。
      </p>
    </div>
  </div>
</section>
```

#### 変更点
1. **タイトル**: 「実際の操作を3分で見る」→「印税収入を仕組みで構築するからくりを3分で解説」
2. **説明文**: 「90分で1冊のマンガを出版する仕組みを、実際の操作画面でご紹介します」→「文章が得意じゃない、絵も描けない。それでも印税収入は「仕組み」で構築できます。この仕組みのからくりを、3分で解説します。」
3. **注記**: 「プロジェクト作成から世界観設計まで、実際の操作をご覧いただけます」→「印税収入を仕組みで構築するからくりを、詳しく解説します。」

---

### 改善2：トップの注記を修正

#### 現在の内容
```html
<p class="cta-note">※ 動画視聴後、個別相談（1,000円）にお申し込みいただけます</p>
```

#### 改善案
```html
<p class="cta-note">※ 動画視聴後、個別相談（1,100円）にお申し込みいただけます</p>
```

#### 変更点
- 価格を1,000円 → 1,100円に修正

---

### 改善3：トップのCTAボタンのテキストを改善（オプション）

#### 現在の内容
```html
<a href="#demo" class="cta-button">まずはデモ動画を見る</a>
```

#### 改善案
```html
<a href="#demo" class="cta-button">仕組みのからくりを3分で確認する（無料）</a>
```

#### 変更点
- 「まずはデモ動画を見る」→「仕組みのからくりを3分で確認する（無料）」
- 「無料」を明記することで、ユーザーの不安を解消

---

## 改善の優先順位

### 最優先：改善1（デモ動画セクションの改善）
- **理由**: ユーザーの期待と実際の内容の不一致を解決する
- **影響**: 100クリック0申込という問題を解決する可能性が高い

### 次点：改善2（トップの注記の修正）
- **理由**: 価格の不一致を解決する
- **影響**: 信頼性が高まる

### オプション：改善3（CTAボタンのテキスト改善）
- **理由**: より明確なCTAで、クリック率が向上する可能性がある
- **影響**: クリック率が向上する可能性がある

---

## 改善後の期待効果

### 1. 画像広告からのコンバージョン向上
- ユーザーの期待と実際の内容が一致する
- 「仕組みのからくり」を知りたいという期待に応えられる
- 100クリック0申込 → コンバージョン獲得

### 2. 動画広告の効果を最大化
- LP改善後、動画広告を作成することで、動画広告の効果を最大化できる
- 動画広告とLPの整合性が取れる

### 3. 検証がしやすい
- LP改善後、動画広告を作成することで、動画広告の効果を正確に測定できる

---

## 次のステップ

### ステップ1：LPの改善を実施
1. デモ動画セクションの改善
2. トップの注記の修正
3. CTAボタンのテキスト改善（オプション）

### ステップ2：改善後の検証
1. 画像広告からのコンバージョンを測定
2. 改善前後の比較

### ステップ3：動画広告を作成
1. LP改善後、動画広告を作成
2. セミナーの成功例を踏襲
3. LPの内容と整合性を取る

---

*この資料は、LP改善の具体的な改善案を提案したものです。*
