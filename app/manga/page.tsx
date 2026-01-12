'use client';

import { useState } from 'react';

// ツールのデータ型定義
type ToolStep = {
  id: string;
  title: string;
  sub: string;
  desc: string;
  color: string;
  icon: string;
  isYoutube?: boolean;
};

export default function KukuruDashboard() {
  const [activeMode, setActiveMode] = useState<'standard' | 'picturebook' | 'business'>('standard');

  // ----------------------------------------------------------------
  // 1. スタンダード漫画
  // ----------------------------------------------------------------
  const standardSteps: ToolStep[] = [
    {
      id: '①', title: 'リサーチ', sub: '企画・勝ち筋分析',
      desc: '市場トレンドから「売れるテーマ」を分析。物語の構成・展開・勝ち理由を含む詳細な企画案レポートを生成します。',
      color: 'bg-blue-600', icon: '📊'
    },
    {
      id: '②', title: '世界観構築', sub: '設定資料・キャラ',
      desc: '企画案を元に、キャラクターの性格・背景・目的を深掘り。「世界観レポート」と「キャラクター画像」を生成します。',
      color: 'bg-indigo-600', icon: '🌍'
    },
    {
      id: '③', title: 'ストーリー', sub: '脚本・プロット',
      desc: '世界観レポートを読み込み、起承転結の整った詳細な物語（シナリオテキスト）を生成します。',
      color: 'bg-purple-600', icon: '📝'
    },
    {
      id: '④', title: 'コマワリ・演出', sub: 'CSV/表紙生成',
      desc: 'シナリオを「マンガの設計図」に変換。ページごとの構図指示書（CSV）と、作品の顔となる表紙を生成します。',
      color: 'bg-pink-600', icon: '🎬'
    },
    {
      id: '⑤', title: '画像生成', sub: '1ページ一括生成',
      desc: '設計図（CSV）を元に、AIがマンガ原稿を描き上げます。1ページ単位での一括生成が可能です。',
      color: 'bg-red-600', icon: '🎨'
    },
    {
      id: '⑥', title: '校正・修正', sub: '誤字検出・提案',
      desc: '「セリフと絵の矛盾」や「誤字脱字」をAIがチェック。より良い表現への改善案も提案します。',
      color: 'bg-orange-500', icon: '🔍'
    },
    {
      id: '⑦', title: 'Amazonアシスタント', sub: '出品データ生成',
      desc: 'Kindle出版に必要な「検索キーワード7選」「紹介文」「A+コンテンツ」「商品画像」をすべて作成します。',
      color: 'bg-green-600', icon: '🛒'
    },
  ];

  // ----------------------------------------------------------------
  // 2. 絵本作成（修正：見開き記述を削除）
  // ----------------------------------------------------------------
  const pictureBookSteps: ToolStep[] = [
    {
      id: '⑧', title: '絵本リサーチ', sub: '市場・テーマ分析',
      desc: '今、子供たちや親に求められているテーマを分析。対象年齢に合わせた心温まる企画を提案します。',
      color: 'bg-teal-500', icon: '🧸'
    },
    {
      id: '⑨', title: '絵本世界観', sub: '画風・キャラ設定',
      desc: '絵本特有の「柔らかい画風」や「親しみやすいキャラクター」を設定し、イメージ画像を生成します。',
      color: 'bg-teal-600', icon: '🌈'
    },
    {
      id: '⑩', title: '絵本ストーリー', sub: 'ひらがな・構成',
      desc: 'ページ数（16p/24p等）に合わせた構成案と、読み聞かせしやすいリズムの良い文章を作成します。',
      color: 'bg-teal-700', icon: '📖'
    },
    {
      id: '⑪', title: '絵本コマワリ', sub: 'ページ構成',
      // 修正箇所：見開きという言葉を削除しました
      desc: '各ページの構図や、イラストと文章の配置バランスを考慮した構成データを作成します。',
      color: 'bg-teal-800', icon: '🖼️'
    },
    {
      id: '⑤', title: '画像生成', sub: '絵本モード',
      desc: '（共通機能）指定した画風（水彩風、クレヨン風など）で、高品質な絵本イラストを生成します。',
      color: 'bg-red-600', icon: '🎨'
    },
    {
      id: '⑥', title: '校正・修正', sub: '子供向けチェック',
      desc: '（共通機能）漢字の開き（ひらがな化）や、不適切な表現がないかを重点的にチェックします。',
      color: 'bg-orange-500', icon: '🔍'
    },
  ];

  // ----------------------------------------------------------------
  // 3. ビジネス・YouTube漫画
  // ----------------------------------------------------------------
  const businessSteps: ToolStep[] = [
    {
      id: '⑫', title: '構成・書き起こし', sub: '原作整理',
      desc: '動画の音声データやブログ記事などから、マンガ化するための「要点」と「ストーリー」を抽出します。',
      color: 'bg-cyan-700', icon: '💼'
    },
    {
      id: '⑬', title: 'ビジネスコマワリ', sub: '解説特化',
      desc: '【書籍・Web用】図解やインフォグラフィックを多用し、情報を「正しく伝える」ための落ち着いたコマ構成を作ります。',
      color: 'bg-cyan-600', icon: '📉'
    },
    {
      id: 'Ex', title: 'YouTubeコマワリ', sub: '動画編集用',
      desc: '【YouTube用】動画編集で動かすことを前提に、カメラワークやレイヤー分け（人物と背景の分離）を指示します。',
      color: 'bg-red-700', icon: '▶️', isYoutube: true
    },
    {
      id: 'Ex', title: 'YouTube画像生成', sub: '差分生成',
      desc: '【YouTube用】動画素材として必要な「口パク（開閉）」「瞬き」「感情差分」のパーツ画像を生成します。',
      color: 'bg-red-600', icon: '📹', isYoutube: true
    },
    {
      id: '⑤', title: '画像生成', sub: '標準生成',
      desc: '【書籍・Web用】（共通機能）ビジネスシーンにマッチした、信頼感のある画風で画像を生成します。',
      color: 'bg-red-600', icon: '🎨'
    },
    {
      id: '⑥', title: '校正・修正', sub: '専門用語チェック',
      desc: '（共通機能）ビジネス用語の誤用チェックや、図解の数値に間違いがないかを確認します。',
      color: 'bg-orange-500', icon: '🔍'
    },
  ];

  const currentSteps =
    activeMode === 'standard' ? standardSteps :
    activeMode === 'picturebook' ? pictureBookSteps : businessSteps;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* ヘッダー＆タブエリア */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 pt-4 pb-0">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-blue-600">Kukuru</span> Studio
            </h1>
            <div className="text-xs text-slate-400 font-mono">Ver 1.0.1</div>
          </div>

          <div className="flex gap-8 text-sm font-bold overflow-x-auto">
            <button
              onClick={() => setActiveMode('standard')}
              className={`pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${activeMode === 'standard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              スタンダード漫画
            </button>
            <button
              onClick={() => setActiveMode('picturebook')}
              className={`pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${activeMode === 'picturebook' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              絵本作成
            </button>
            <button
              onClick={() => setActiveMode('business')}
              className={`pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${activeMode === 'business' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              ビジネス・YouTube
            </button>
          </div>
        </div>
      </div>

      {/* メインリストエリア */}
      <div className="max-w-5xl mx-auto p-8 pb-32">

        <div className="mb-6">
          <p className="text-sm text-slate-500">
            現在のモード：
            <span className="font-bold ml-2 text-slate-800">
              {activeMode === 'standard' && '王道ストーリー漫画を作成します。'}
              {activeMode === 'picturebook' && '子供向けの絵本を作成します。'}
              {activeMode === 'business' && '解説・PR用の漫画や動画素材を作成します。'}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          {currentSteps.map((step, index) => (
            <div key={index} className={`bg-white rounded-xl shadow-sm border p-6 flex items-start gap-6 transition-all hover:shadow-md cursor-pointer group ${step.isYoutube ? 'border-red-200 bg-red-50/50' : 'border-slate-100'}`}>

              <div className={`flex-shrink-0 w-14 h-14 ${step.color} rounded-xl flex items-center justify-center text-2xl text-white shadow-sm group-hover:scale-105 transition-transform`}>
                {step.icon}
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${step.isYoutube ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                      {step.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </h2>
                  </div>
                  {step.isYoutube && (
                    <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                      YouTube専用
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="self-center flex-shrink-0">
                <button className="px-4 py-2 text-sm font-bold border rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-blue-600 whitespace-nowrap">
                  開く
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
