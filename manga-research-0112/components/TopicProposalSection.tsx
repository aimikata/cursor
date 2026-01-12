
import React from 'react';
import { AppState, TargetRegion } from '../types';
import { Loader } from './Loader';
import { ChartIcon } from './icons';

interface TopicProposalSectionProps {
  onStartProposal: () => void;
  topics: string[];
  selectedTopic: string | null;
  onSelectTopic: (topic: string) => void;
  appState: AppState;
  selectedGenre: string;
  userKeyword: string;
  onKeywordChange: (keyword: string) => void;
  targetRegion: TargetRegion;
}

export const TopicProposalSection: React.FC<TopicProposalSectionProps> = ({
  onStartProposal,
  topics,
  selectedTopic,
  onSelectTopic,
  appState,
  selectedGenre,
  userKeyword,
  onKeywordChange,
  targetRegion,
}) => {
  const isLoading = appState === AppState.PROPOSING_TOPICS;
  const areTopicsProposed = appState >= AppState.TOPICS_PROPOSED;
  
  const marketDisplay = targetRegion === 'domestic' 
    ? { name: '日本国内市場', icon: '🇯🇵', color: 'bg-red-900/40 text-red-200 border-red-700' }
    : { name: '英語圏（北米）市場', icon: '🇺🇸', color: 'bg-blue-900/40 text-blue-200 border-blue-700' };

  return (
    <section id="step2" className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden">
      {/* Market Badge */}
      <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl border-l border-b text-xs font-bold flex items-center gap-2 ${marketDisplay.color}`}>
         <span>{marketDisplay.icon} {marketDisplay.name}のデータを分析中</span>
      </div>

      <div className="flex items-center gap-4 mb-4 mt-2">
        <div className="bg-teal-900/50 p-3 rounded-full">
          <ChartIcon className="h-8 w-8 text-teal-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">ステップ2: テーマを探求</h2>
          <p className="text-gray-400">「{selectedGenre}」のジャンルで、<span className={targetRegion === 'global' ? 'text-blue-300 font-semibold' : 'text-red-300 font-semibold'}>{marketDisplay.name}</span>にヒットするテーマを探します。</p>
        </div>
      </div>

      {!areTopicsProposed && (
        <div className="text-center mt-6">
          <div className="mb-6">
            <label htmlFor="keyword-input" className="block text-sm font-medium text-gray-300 mb-2">
              書籍のテーマと設定（「○○がよくわかる本」として作成します）
            </label>
            <input
              id="keyword-input"
              type="text"
              value={userKeyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="例：Gemini 3.0活用術（広告代理店の新人向け）, Manus AI（塾講師向け）"
              className="w-full max-w-2xl mx-auto bg-gray-900/50 border-2 border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors"
              aria-describedby="keyword-help"
            />
            <p id="keyword-help" className="text-sm text-gray-500 mt-2">
              解説したいツール名やノウハウと、想定する読者の属性を入力してください。<br/>
              実在するツール（Gemini 3.0, Manus等）は現実の機能に基づいた実用書として企画されます。
            </p>
          </div>
          <button
            onClick={onStartProposal}
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            企画の提案を開始
          </button>
        </div>
      )}

      {isLoading && <Loader text={`${marketDisplay.name}のトレンドと競合書籍を詳細分析中...`} />}

      {areTopicsProposed && topics.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-center text-gray-300 mb-4">提案された企画案の中から、最も「これならわかる！」と思えるものをお選びください。</h3>
          <div className="grid grid-cols-1 gap-4">
            {topics.map((topic, index) => (
              <button
                key={index}
                onClick={() => onSelectTopic(topic)}
                className={`w-full text-left p-4 md:p-6 rounded-xl border-2 transition-all duration-200 group ${
                  selectedTopic === topic
                    ? 'bg-teal-900/40 border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.3)]'
                    : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    selectedTopic === topic ? 'bg-teal-500 text-black' : 'bg-gray-600 text-gray-300 group-hover:bg-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed text-gray-200">
                    {topic}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
