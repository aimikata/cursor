import React, { useState } from 'react';
import { CharacterProfile, PanelConfig, GenerationResult } from './types';
import CharacterCard from './components/CharacterCard';
import { directScene, generateMangaImage } from './services/geminiService';

// Default characters in Japanese
const DEFAULT_CHAR_A: CharacterProfile = {
  id: 'char_a',
  name: '',
  description: 'ビジネススーツ（青いベストとパンツ）、知的な短髪の男性。白シャツ、ネクタイなし。',
  imageData: null,
  mimeType: 'image/png'
};

const DEFAULT_CHAR_B: CharacterProfile = {
  id: 'char_b',
  name: '',
  description: '茶髪のセミロングヘア。グレーのジャケット、白いインナー、黒のパンツ。フリーランスのWebデザイナー。',
  imageData: null,
  mimeType: 'image/png'
};

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  const [charA, setCharA] = useState<CharacterProfile>(DEFAULT_CHAR_A);
  const [charB, setCharB] = useState<CharacterProfile>(DEFAULT_CHAR_B);
  
  const [panelConfig, setPanelConfig] = useState<PanelConfig>({
    scenario: '主人公が自信満々に、フリーランスとして成功するための秘訣を生徒に熱弁している。生徒は目を輝かせてそれを聞いている。'
  });

  const [result, setResult] = useState<GenerationResult>({
    imageUrl: null,
    loading: false,
    statusMessage: '',
    error: null
  });

  const handleGenerate = async () => {
    if (!apiKey) {
      alert('Gemini APIキーを入力してください。');
      return;
    }

    if (!panelConfig.scenario.trim()) {
      alert('シーン・脚本を入力してください。');
      return;
    }

    setResult({ ...result, loading: true, statusMessage: 'AI演出家が構成を考えています...', error: null, directorOutput: undefined });

    try {
      // Step 1: Directing
      const directorOutput = await directScene(apiKey, charA, charB, panelConfig.scenario);
      setResult(prev => ({ 
        ...prev, 
        statusMessage: '画像を生成しています... (演出決定)', 
        directorOutput 
      }));

      // Step 2: Drawing
      const imageUrl = await generateMangaImage(apiKey, charA, charB, directorOutput);
      
      setResult(prev => ({
        ...prev,
        imageUrl,
        loading: false,
        statusMessage: '完了',
        error: null
      }));
    } catch (e: any) {
      setResult(prev => ({
        ...prev,
        imageUrl: null,
        loading: false,
        statusMessage: '',
        error: e.message
      }));
    }
  };

  const hasApiKey = !!apiKey;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            MangaGen Studio
          </h1>
          <p className="text-gray-500 text-sm mt-1">AI演出機能付き YouTube風マンガ動画生成ツール</p>
        </div>
        {!process.env.API_KEY && (
             <div className="w-full md:w-auto">
             <input 
               type="password" 
               placeholder="Gemini APIキーを入力" 
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
               className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
             />
           </div>
        )}
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto max-h-[calc(100vh-150px)] pr-2 scrollbar-hide">
          
          {/* Characters Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">1. キャラクター設定</h2>
              <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">参照画像（必須推奨）</span>
            </div>
            <CharacterCard title="[CHAR_A] メイン・解説役" character={charA} onChange={setCharA} />
            <CharacterCard title="[CHAR_B] サブ・聞き手役" character={charB} onChange={setCharB} />
          </section>

          {/* Scenario Section (The new simplified input) */}
          <section className="space-y-4 pt-4 border-t border-gray-800">
             <div className="flex items-center justify-between">
               <h2 className="text-lg font-semibold text-white">2. シーン・脚本</h2>
               <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">AI自動演出</span>
             </div>
             
             <div className="bg-gray-800/50 p-3 rounded border border-gray-700/50 mb-2">
               <p className="text-xs text-gray-400">
                 状況やセリフを自由に入力してください。AIが最適な「構図」「吹き出し」「セリフの微調整」を自動で行います。
               </p>
             </div>

             <textarea
               value={panelConfig.scenario}
               onChange={(e) => setPanelConfig({...panelConfig, scenario: e.target.value})}
               className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 focus:border-blue-500 outline-none resize-none leading-relaxed"
               placeholder="例: 田中が自信満々にイタリア料理の極意を語る。「これが秘密だ！」と叫んでいる。ケンタは驚いた顔をしている。"
             />
          </section>

          <button
            onClick={handleGenerate}
            disabled={result.loading || !hasApiKey}
            className={`w-full py-4 rounded-lg font-bold text-lg tracking-wide transition-all ${
              result.loading 
                ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            {result.loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {result.statusMessage || "処理中..."}
              </span>
            ) : (
              "AI演出で生成する"
            )}
          </button>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-1 min-h-[400px] flex items-center justify-center relative overflow-hidden shadow-2xl">
            {result.imageUrl ? (
              <img 
                src={result.imageUrl} 
                alt="Generated Manga Panel" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <div className="text-center text-gray-600">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto opacity-20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
                <p className="text-lg font-medium">画像はまだ生成されていません</p>
                <p className="text-sm">左側のパネルにシーンを入力し、「AI演出で生成する」を押してください</p>
              </div>
            )}
            
            {/* Aspect Ratio Guide Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-[20%] border-t border-red-500/30 bg-red-900/5 pointer-events-none flex items-center justify-center">
              <span className="text-red-500/50 text-xs font-mono">テロップ安全領域 (下部20%)</span>
            </div>
          </div>

          {/* Director's Note (Show what the AI decided) */}
          {result.directorOutput && (
            <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg text-sm space-y-2">
              <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider">AI演出ノート</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <span className="text-gray-500 text-xs block">採用されたセリフ</span>
                   <p className="text-gray-200">「{result.directorOutput.dialogue}」</p>
                </div>
                <div>
                   <span className="text-gray-500 text-xs block">吹き出しタイプ</span>
                   <p className="text-gray-200">{result.directorOutput.bubble_type}</p>
                </div>
                <div className="md:col-span-2">
                   <span className="text-gray-500 text-xs block">視覚演出指示</span>
                   <p className="text-gray-400 text-xs whitespace-pre-wrap">{result.directorOutput.visual_direction}</p>
                </div>
              </div>
            </div>
          )}

          {result.error && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 p-4 rounded-lg text-sm">
              <strong>エラー:</strong> {result.error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;