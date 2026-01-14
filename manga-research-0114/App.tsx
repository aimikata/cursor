
import React, { useState, useCallback } from 'react';
import { AppState, TargetRegion } from './types';
import { TopicProposalSection } from './components/TopicProposalSection';
import { ConceptProposalSection } from './components/ConceptProposalSection';
import { GenreSelectionSection } from './components/GenreSelectionSection';
import { generateTopics, generateMangaConcept, generateMasterSheet } from './services/geminiService';
import { PenSparkleIcon } from './components/icons';

const REFINE_MODE_GENRE = "REFINE_MODE";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [proposedTopics, setProposedTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [conceptResult, setConceptResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [userKeyword, setUserKeyword] = useState<string>('');
  const [targetRegion, setTargetRegion] = useState<TargetRegion>('global');

  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre);
    setAppState(AppState.IDLE);
    setProposedTopics([]);
    setSelectedTopic(null);
    setConceptResult('');
    setError('');
    setUserKeyword('');
  };

  const resetSelection = useCallback(() => {
    setSelectedGenre(null);
    setAppState(AppState.IDLE);
    setProposedTopics([]);
    setSelectedTopic(null);
    setConceptResult('');
    setError('');
    setUserKeyword('');
  }, []);

  const handleRefineConcept = useCallback(async (text: string) => {
    setSelectedGenre(REFINE_MODE_GENRE);
    setSelectedTopic("既存の企画案 (インポート済み)");
    setConceptResult(text); 
    setAppState(AppState.GENERATING_CONCEPT);
    setError('');
    
    try {
      const masterSheet = await generateMasterSheet(text);
      const newContent = `${text}\n\n${masterSheet}`;
      setConceptResult(newContent);
      setAppState(AppState.CONCEPT_COMPLETE);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'マスターシートの生成中にエラーが発生しました。');
      setAppState(AppState.IDLE); 
      setSelectedGenre(null); 
    }
  }, []);

  const handleStartTopicProposal = useCallback(async () => {
    if (!selectedGenre || selectedGenre === REFINE_MODE_GENRE) return;

    setAppState(AppState.PROPOSING_TOPICS);
    setError('');
    setSelectedTopic(null);
    setConceptResult('');
    try {
      const topics = await generateTopics(selectedGenre, userKeyword, targetRegion);
      setProposedTopics(topics);
      setAppState(AppState.TOPICS_PROPOSED);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'テーマの提案中にエラーが発生しました。');
      setAppState(AppState.IDLE);
    }
  }, [selectedGenre, userKeyword, targetRegion]);

  const handleCreateConcept = useCallback(async () => {
    if (!selectedTopic) return;
    setAppState(AppState.GENERATING_CONCEPT);
    setError('');
    try {
      const result = await generateMangaConcept(selectedTopic, targetRegion);
      setConceptResult(result);
      setAppState(AppState.CONCEPT_COMPLETE);
    } catch (e: any) {
      console.error(e);
      setError(e.message || '企画案の作成中にエラーが発生しました。');
      setAppState(AppState.TOPICS_PROPOSED);
    }
  }, [selectedTopic, targetRegion]);

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setConceptResult('');
    setAppState(AppState.TOPICS_PROPOSED);
  };

  const isRefineMode = selectedGenre === REFINE_MODE_GENRE;

  const toggleRegion = () => {
    if (selectedGenre) {
      if (!window.confirm("対象マーケットを変更すると、現在の進行状況はリセットされます。よろしいですか？")) {
        return;
      }
      resetSelection();
    }
    setTargetRegion(prev => prev === 'global' ? 'domestic' : 'global');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12 relative">
          <div className="flex justify-center items-center gap-4">
            <PenSparkleIcon className="h-10 w-10 text-teal-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
              マンガ企画リサーチ
            </h1>
          </div>
          
          <div className="mt-6 flex justify-center items-center gap-3">
             <span className={`text-sm font-medium ${targetRegion === 'domestic' ? 'text-white' : 'text-gray-500'}`}>日本国内</span>
             <button 
               onClick={toggleRegion}
               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${targetRegion === 'global' ? 'bg-teal-600' : 'bg-gray-600'}`}
             >
               <span
                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${targetRegion === 'global' ? 'translate-x-6' : 'translate-x-1'}`}
               />
             </button>
             <span className={`text-sm font-medium ${targetRegion === 'global' ? 'text-white' : 'text-gray-500'}`}>英語圏 (北米)</span>
          </div>

          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            {targetRegion === 'global' 
              ? '英語圏のトレンドを分析し、需要過多・供給不足の「ブルーオーシャン」となる漫画企画を提案します。'
              : '日本国内のトレンドを分析し、需要過多・供給不足の「ブルーオーシャン」となる漫画企画を提案します。'
            }
          </p>
        </header>

        {error && (
          <div className="bg-red-900/40 border border-red-700 p-6 rounded-2xl mb-8 max-w-2xl mx-auto shadow-2xl backdrop-blur-sm animate-fadeIn">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-200 mb-2">アクセス制限が発生しました</h3>
                <p className="text-red-100 text-sm leading-relaxed mb-4">
                  {error}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-4 rounded-full transition-colors"
                  >
                    ページを更新する
                  </button>
                  <button 
                    onClick={resetSelection} 
                    className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-4 rounded-full transition-colors"
                  >
                    最初からやり直す
                  </button>
                  <a 
                    href="https://aistudio.google.com/app/plan_and_billing" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-red-300 hover:text-white text-xs underline py-2"
                  >
                    API利用枠を確認する
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedGenre && !error && (
          <div className="text-center mb-6">
            <button onClick={resetSelection} className="text-gray-400 hover:text-white hover:bg-gray-700 py-2 px-4 rounded-lg transition-colors">
              ‹ {isRefineMode ? 'トップに戻る' : 'ジャンル選択に戻る'}
            </button>
          </div>
        )}

        <div className="space-y-12">
          {!selectedGenre ? (
            <GenreSelectionSection 
              onSelectGenre={handleSelectGenre} 
              onRefineConcept={handleRefineConcept} 
              targetRegion={targetRegion}
            />
          ) : (
            <>
              {!isRefineMode && (
                <TopicProposalSection
                  onStartProposal={handleStartTopicProposal}
                  topics={proposedTopics}
                  selectedTopic={selectedTopic}
                  onSelectTopic={handleSelectTopic}
                  appState={appState}
                  selectedGenre={selectedGenre}
                  userKeyword={userKeyword}
                  onKeywordChange={setUserKeyword}
                  targetRegion={targetRegion}
                />
              )}
              
              <ConceptProposalSection
                onCreateConcept={handleCreateConcept}
                conceptResult={conceptResult}
                appState={appState}
                selectedTopic={selectedTopic}
              />
            </>
          )}
        </div>
        
        <footer className="text-center mt-16 text-gray-500">
          <p>Powered by Google Gemini 3.0</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
