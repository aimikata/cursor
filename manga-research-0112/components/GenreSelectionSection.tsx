
import React, { useState } from 'react';
import { GENRE_LIST } from '../constants';
import { BookMarkedIcon, WandSparklesIcon, FileTextIcon, ChartIcon } from './icons';
import { generateGenres } from '../services/geminiService';
import { Loader } from './Loader';
import { TargetRegion } from '../types';


interface GenreSelectionSectionProps {
  onSelectGenre: (genre: string) => void;
  onRefineConcept: (text: string) => void;
  targetRegion: TargetRegion;
}

export const GenreSelectionSection: React.FC<GenreSelectionSectionProps> = ({ onSelectGenre, onRefineConcept, targetRegion }) => {
  const [proposedGenres, setProposedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for Refine Mode
  const [isRefineMode, setIsRefineMode] = useState(false);
  const [conceptText, setConceptText] = useState('');

  const handleProposeGenres = async () => {
    setIsLoading(true);
    setError(null);
    setProposedGenres([]);
    try {
      const genres = await generateGenres(targetRegion);
      setProposedGenres(genres);
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'ジャンルの提案中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToGenreList = () => {
    setProposedGenres([]);
    setError(null);
  };
  
  const handleSelectProposedGenre = (fullString: string) => {
    // Splits by full-width or half-width colon
    const parts = fullString.split(/[:：]/);
    const genreName = parts[0].trim();
    onSelectGenre(genreName);
  };

  const handleSubmitRefine = () => {
    if (conceptText.trim()) {
      onRefineConcept(conceptText);
    }
  };

  const regionLabel = targetRegion === 'domestic' ? '日本国内' : '英語圏（北米）';
  const marketDisplay = targetRegion === 'domestic' 
    ? { name: '日本国内市場', icon: '🇯🇵', color: 'bg-red-900/40 text-red-200 border-red-700' }
    : { name: '英語圏（北米）市場', icon: '🇺🇸', color: 'bg-blue-900/40 text-blue-200 border-blue-700' };

  if (isRefineMode) {
    return (
      <section id="step1-refine" className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-lg">
         <div className="flex items-center gap-4 mb-6">
          <div className="bg-green-900/50 p-3 rounded-full">
            <FileTextIcon className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">既存の企画をブラッシュアップ</h2>
            <p className="text-gray-400">手持ちの企画案に「シリーズマスターシート」を追加します。</p>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="concept-input" className="block text-sm font-medium text-gray-300 mb-2">
            企画案のテキストを貼り付けてください
          </label>
          <textarea
            id="concept-input"
            rows={10}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
            placeholder="ここに企画案を入力..."
            value={conceptText}
            onChange={(e) => setConceptText(e.target.value)}
          ></textarea>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setIsRefineMode(false)}
            className="px-6 py-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmitRefine}
            disabled={!conceptText.trim()}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-full transition-all shadow-lg"
          >
            マスターシートを生成
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="step1" className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden">
      {/* Market Badge for Analysis Results */}
      {proposedGenres.length > 0 && (
         <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl border-l border-b text-xs font-bold flex items-center gap-2 ${marketDisplay.color}`}>
            <span>{marketDisplay.icon} {marketDisplay.name}のデータを分析中</span>
         </div>
      )}

      <div className="flex items-center gap-4 mb-6 mt-2">
        <div className="bg-purple-900/50 p-3 rounded-full">
          <BookMarkedIcon className="h-8 w-8 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">ステップ1: ジャンルを選択</h2>
          <p className="text-gray-400">どのようなジャンルの漫画のアイデアを探しますか？</p>
        </div>
      </div>

      {isLoading && <Loader text={`${regionLabel}で話題だが、まだ決定版書籍がない「供給不足ジャンル」を分析中...`} />}
      
      {error && (
        <div className="text-center my-4 p-4 bg-red-900/30 rounded-lg">
          <p className="text-red-300 font-medium">{error}</p>
          <button onClick={resetToGenreList} className="mt-4 text-sm text-gray-300 hover:text-white underline">
            ジャンル一覧に戻る
          </button>
        </div>
      )}

      {!isLoading && !error && proposedGenres.length > 0 && (
        <div className="animate-fadeIn">
          <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-lg p-4 mb-6">
             <h3 className="text-lg font-bold text-center text-purple-300 mb-1 flex items-center justify-center gap-2">
                <ChartIcon className="h-5 w-5" />
                分析完了：{regionLabel}のブルーオーシャン
             </h3>
             <p className="text-sm text-gray-400 text-center">
                SNS等で需要が高まっているものの、まだ決定的な書籍が存在しない領域を特定しました。
             </p>
          </div>

          <div className="flex flex-col gap-3">
            {proposedGenres.map((genre, index) => {
               // Robust splitting for Title and Description
               const parts = genre.split(/[:：]/);
               const title = parts[0] ? parts[0].trim() : genre;
               const description = parts.length > 1 ? parts.slice(1).join('：').trim() : '';
               
               return (
                <button
                  key={index}
                  onClick={() => handleSelectProposedGenre(genre)}
                  className="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 bg-gray-700 border-gray-600 hover:bg-purple-800/50 hover:border-purple-600 group"
                >
                  <span className="font-bold text-purple-300 group-hover:text-purple-200 text-lg block mb-1">
                    {title}
                  </span>
                  {description && (
                    <span className="text-sm text-gray-300 block leading-relaxed opacity-90">
                      {description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="text-center mt-6">
            <button onClick={resetToGenreList} className="text-gray-400 hover:text-white transition-colors">
              ‹ ジャンル一覧から選ぶ
            </button>
          </div>
        </div>
      )}
      
      {!isLoading && !error && proposedGenres.length === 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GENRE_LIST.map((genre) => (
              <button
                key={genre}
                onClick={() => onSelectGenre(genre)}
                className="text-center p-4 rounded-lg border-2 border-gray-600 bg-gray-700 hover:bg-purple-800/50 hover:border-purple-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 h-full"
              >
                <span className="font-semibold text-gray-200">{genre}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-8 border-t border-gray-700 pt-6">
            {/* Logic Explanation Box */}
            <div className="bg-gray-900/60 border border-indigo-500/30 rounded-xl p-5 mb-6 max-w-3xl mx-auto">
              <h4 className="text-indigo-400 font-bold text-sm mb-3 flex items-center justify-center gap-2">
                 <span className="bg-indigo-600/20 px-2 py-0.5 rounded text-indigo-300 border border-indigo-500/50">AI分析ロジック</span>
                 トレンドの発生源と供給ギャップを特定
              </h4>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <span className="bg-gray-700 px-2 py-1 rounded">SNS話題化</span>
                    <span>→</span>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="bg-gray-700 px-2 py-1 rounded">YouTube解説増</span>
                    <span>→</span>
                </div>
                 <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <span className="border border-indigo-500 px-2 py-1 rounded bg-indigo-900/40">書籍がまだない (狙い目)</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs text-center mt-3">
                 このギャップ（供給不足）を狙うことで、需要に対して競合が少ない企画を立案します。
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                onClick={handleProposeGenres}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
                >
                <WandSparklesIcon className="h-5 w-5" />
                {regionLabel}のブルーオーシャンを提案
                </button>

                <span className="text-gray-500 hidden md:inline">|</span>
                <span className="text-gray-500 md:hidden">- OR -</span>

                <button
                onClick={() => setIsRefineMode(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 border border-gray-500 hover:border-gray-400 inline-flex items-center gap-2"
                >
                <FileTextIcon className="h-5 w-5" />
                既存の企画案にマスターシートを追加
                </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
