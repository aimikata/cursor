
import React from 'react';
import { AppState } from '../types';
import { Loader } from './Loader';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LightbulbIcon, RefreshCwIcon, DownloadIcon } from './icons';

interface ConceptProposalSectionProps {
  onCreateConcept: () => void;
  conceptResult: string;
  appState: AppState;
  selectedTopic: string | null;
}

export const ConceptProposalSection: React.FC<ConceptProposalSectionProps> = ({
  onCreateConcept,
  conceptResult,
  appState,
  selectedTopic,
}) => {
  const isReady = !!selectedTopic;
  const isLoading = appState === AppState.GENERATING_CONCEPT;
  const isComplete = appState === AppState.CONCEPT_COMPLETE;

  // Check if we are in refine mode (topic name is hardcoded in App.tsx)
  const isRefineMode = selectedTopic === "既存の企画案 (インポート済み)";

  const handleDownload = () => {
    if (!conceptResult) return;
    
    // Create a Blob from the content
    const blob = new Blob([conceptResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const a = document.createElement('a');
    a.href = url;
    
    // Determine filename
    let filename = 'manga_concept.md';
    if (selectedTopic && !isRefineMode) {
      // Cleanup topic name for filename
      const safeTopic = selectedTopic.replace(/[^a-z0-9\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/gi, '_').substring(0, 30);
      filename = `${safeTopic}_concept.md`;
    } else {
       const dateStr = new Date().toISOString().split('T')[0];
       filename = `manga_concept_${dateStr}.md`;
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="step3" className={`bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-lg transition-opacity duration-700 ${isReady ? 'opacity-100' : 'opacity-30'}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-blue-900/50 p-3 rounded-full">
          <LightbulbIcon className="h-8 w-8 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">ステップ3: 企画レポートの生成</h2>
          <p className="text-gray-400">選択したテーマを基に、書籍シリーズ化を前提とした詳細な企画レポートを生成します。</p>
        </div>
      </div>
      
      {isReady && !isComplete && !isLoading && (
         <div className="text-center mt-6">
          <p className="text-gray-400 mb-4">選択中のテーマ: <strong className="text-teal-300">{selectedTopic}</strong></p>
          <button
            onClick={onCreateConcept}
            disabled={isLoading || !selectedTopic}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            企画レポートを生成
          </button>
        </div>
      )}

      {!isReady && (
        <div className="text-center mt-6">
            <p className="text-gray-500">ステップ2でテーマを選択してください。</p>
        </div>
      )}

      {isLoading && <Loader text={isRefineMode ? "マスターシートを生成中..." : "ヒット企画を考案中...（これには少し時間がかかります）"} />}

      {conceptResult && (
         <div className="mt-6 p-6 bg-gray-900/70 rounded-xl border border-gray-700 animate-fadeIn">
            <MarkdownRenderer content={conceptResult} />
            
            <div className="mt-8 pt-6 border-t border-gray-700 flex flex-wrap justify-center gap-4">
               {/* Download Button */}
               <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 text-white bg-green-700 hover:bg-green-600 py-2 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span>テキストファイルとして保存</span>
                </button>

              {!isLoading && !isRefineMode && (
                <button
                  onClick={onCreateConcept}
                  className="group flex items-center gap-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 py-2 px-6 rounded-full transition-all duration-300 border border-gray-600 hover:border-gray-500 hover:shadow-md"
                >
                  <RefreshCwIcon className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>最新の設定で再生成する</span>
                </button>
              )}
            </div>
        </div>
      )}
    </section>
  );
};
