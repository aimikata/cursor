'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AppState, TargetRegion } from '@/app/lib/research/types';
import { GENRE_LIST } from '@/app/lib/research/constants';
import { ArrowLeft, Download, RefreshCw, Sparkles, WandSparkles, FileText, BookMarked, ChartBar, Lightbulb, Copy, Folder, X, Package } from 'lucide-react';
import { ApiKeyManager } from './ApiKeyManager';
import { getApiKey, ApiKeyType } from '@/app/lib/api-keys';
import { getAllReports, deleteReport, SavedReport, downloadAllReportsAsZip } from '@/app/lib/report-manager';

// ==========================================
// リサーチツールの型定義とコンポーネント
// ==========================================

const REFINE_MODE_GENRE = "REFINE_MODE";

// Loader コンポーネント
const Loader = ({ text = "読み込み中..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center p-8 my-4 text-center">
    <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-lg text-gray-400">{text}</p>
  </div>
);

// MarkdownRenderer コンポーネント
const MarkdownRenderer = ({ content }: { content: string }) => {
  const elements: React.ReactNode[] = [];
  const lines = content.split('\n');
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-2 my-4">
          {listItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    }
    listItems = [];
    inList = false;
  };

  const parseLine = (line: string) => {
    const parts = line.split('**');
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-teal-300">{part}</strong> : part
    );
  };
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (!inList) {
        flushList();
        inList = true;
      }
      listItems.push(parseLine(trimmedLine.substring(2)));
    } else {
      flushList();
      if (trimmedLine.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-xl font-bold text-teal-400 mt-6 border-b border-gray-600 pb-2">{parseLine(trimmedLine.substring(4))}</h3>);
      } else if (trimmedLine.startsWith('## ')) {
        elements.push(<h2 key={index} className="text-2xl font-bold text-blue-400 mt-8 border-b-2 border-blue-500 pb-2">{parseLine(trimmedLine.substring(3))}</h2>);
      } else if (trimmedLine) {
        elements.push(<p key={index} className="leading-relaxed">{parseLine(trimmedLine)}</p>);
      }
    }
  });

  flushList();

  return <div className="space-y-4 text-gray-300">{elements}</div>;
};

// GenreSelectionSection コンポーネント
const GenreSelectionSection = ({ 
  onSelectGenre, 
  onRefineConcept, 
  targetRegion
}: { 
  onSelectGenre: (genre: string) => void; 
  onRefineConcept: (text: string) => void; 
  targetRegion: TargetRegion;
}) => {
  const [proposedGenres, setProposedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefineMode, setIsRefineMode] = useState(false);
  const [conceptText, setConceptText] = useState('');

  const handleProposeGenres = async () => {
    setIsLoading(true);
    setError(null);
    setProposedGenres([]);
    try {
      const apiKey = getApiKey('research');
      if (!apiKey) {
        throw new Error('APIキーが設定されていません。マンガハブの「APIキー設定」からキーを入力してください。');
      }

      const res = await fetch('/api/research/generate-genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: targetRegion,
          apiKey
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate genres');
      setProposedGenres(data.genres);
    } catch (e: any) {
      setError(e.message || 'ジャンルの提案中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
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
      <section className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-green-900/50 p-3 rounded-full">
            <FileText className="h-8 w-8 text-green-400" />
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
          />
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
    <section className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden">
      {proposedGenres.length > 0 && (
        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl border-l border-b text-xs font-bold flex items-center gap-2 ${marketDisplay.color}`}>
          <span>{marketDisplay.icon} {marketDisplay.name}のデータを分析中</span>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6 mt-2">
        <div className="bg-purple-900/50 p-3 rounded-full">
          <BookMarked className="h-8 w-8 text-purple-400" />
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
          <button onClick={() => setProposedGenres([])} className="mt-4 text-sm text-gray-300 hover:text-white underline">
            ジャンル一覧に戻る
          </button>
        </div>
      )}

      {!isLoading && !error && proposedGenres.length > 0 && (
        <div className="animate-fadeIn">
          <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-center text-purple-300 mb-1 flex items-center justify-center gap-2">
              <ChartBar className="h-5 w-5" />
              分析完了：{regionLabel}のブルーオーシャン
            </h3>
            <p className="text-sm text-gray-400 text-center">
              SNS等で需要が高まっているものの、まだ決定的な書籍が存在しない領域を特定しました。
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {proposedGenres.map((genre, index) => {
              const parts = genre.split(/[:：]/);
              const title = parts[0] ? parts[0].trim() : genre;
              const description = parts.length > 1 ? parts.slice(1).join('：').trim() : '';
              
              return (
                <button
                  key={index}
                  onClick={() => onSelectGenre(genre)}
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
            <button onClick={() => setProposedGenres([])} className="text-gray-400 hover:text-white transition-colors">
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
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={handleProposeGenres}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
              >
                <WandSparkles className="h-5 w-5" />
                {regionLabel}のブルーオーシャンを提案
              </button>

              <span className="text-gray-500 hidden md:inline">|</span>
              <span className="text-gray-500 md:hidden">- OR -</span>

              <button
                onClick={() => setIsRefineMode(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 border border-gray-500 hover:border-gray-400 inline-flex items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                既存の企画案にマスターシートを追加
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

// TopicProposalSection コンポーネント
const TopicProposalSection = ({
  onStartProposal,
  topics,
  selectedTopic,
  onSelectTopic,
  appState,
  selectedGenre,
  userKeyword,
  onKeywordChange,
  targetRegion,
}: {
  onStartProposal: () => void;
  topics: string[];
  selectedTopic: string | null;
  onSelectTopic: (topic: string) => void;
  appState: AppState;
  selectedGenre: string;
  userKeyword: string;
  onKeywordChange: (keyword: string) => void;
  targetRegion: TargetRegion;
}) => {
  const isLoading = appState === AppState.PROPOSING_TOPICS;
  const areTopicsProposed = appState >= AppState.TOPICS_PROPOSED;
  
  const marketDisplay = targetRegion === 'domestic' 
    ? { name: '日本国内市場', icon: '🇯🇵', color: 'bg-red-900/40 text-red-200 border-red-700' }
    : { name: '英語圏（北米）市場', icon: '🇺🇸', color: 'bg-blue-900/40 text-blue-200 border-blue-700' };

  return (
    <section className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden">
      <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl border-l border-b text-xs font-bold flex items-center gap-2 ${marketDisplay.color}`}>
        <span>{marketDisplay.icon} {marketDisplay.name}のデータを分析中</span>
      </div>

      <div className="flex items-center gap-4 mb-4 mt-2">
        <div className="bg-teal-900/50 p-3 rounded-full">
          <ChartBar className="h-8 w-8 text-teal-400" />
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
            />
            <p className="text-sm text-gray-500 mt-2">
              解説したいツール名やノウハウと、想定する読者の属性を入力してください。
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

// ConceptProposalSection コンポーネント
const ConceptProposalSection = ({
  onCreateConcept,
  conceptResult,
  appState,
  selectedTopic,
  selectedGenre,
}: {
  onCreateConcept: () => void;
  conceptResult: string;
  appState: AppState;
  selectedTopic: string | null;
  selectedGenre: string | null;
}) => {
  const isReady = !!selectedTopic;
  const isLoading = appState === AppState.GENERATING_CONCEPT;
  const isComplete = appState === AppState.CONCEPT_COMPLETE;
  const isRefineMode = selectedTopic === "既存の企画案 (インポート済み)";

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!conceptResult) return;
    try {
      await navigator.clipboard.writeText(conceptResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!conceptResult) return;
    
    const blob = new Blob([conceptResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    let filename = 'manga_concept.md';
    if (selectedTopic && !isRefineMode) {
      const safeTopic = selectedTopic.replace(/[^a-z0-9\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/gi, '_').substring(0, 30);
      filename = `${safeTopic}_concept.md`;
    } else {
      const dateStr = new Date().toISOString().split('T')[0];
      filename = `manga_concept_${dateStr}.md`;
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className={`bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-lg transition-opacity duration-700 ${isReady ? 'opacity-100' : 'opacity-30'}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-blue-900/50 p-3 rounded-full">
          <Lightbulb className="h-8 w-8 text-blue-400" />
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

      {isLoading && <Loader text={isRefineMode ? "マスターシートを生成中..." : "企画案を練っています...（これには少し時間がかかります）"} />}

      {conceptResult && (
        <div className="mt-6 p-6 bg-gray-900/70 rounded-xl border border-gray-700 animate-fadeIn">
          <MarkdownRenderer content={conceptResult} />
          
          <div className="mt-8 pt-6 border-t border-gray-700 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 py-2 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
                copied ? 'bg-green-600 text-white' : 'text-white bg-blue-700 hover:bg-blue-600'
              }`}
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? 'コピー完了!' : 'クリップボードにコピー'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 text-white bg-green-700 hover:bg-green-600 py-2 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              <span>テキストファイルとして保存</span>
            </button>

            {!isLoading && !isRefineMode && (
              <button
                onClick={onCreateConcept}
                className="group flex items-center gap-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 py-2 px-6 rounded-full transition-all duration-300 border border-gray-600 hover:border-gray-500 hover:shadow-md"
              >
                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>最新の設定で再生成する</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

// メインの ResearchInterface コンポーネント
export const ResearchInterface = ({ 
  onClose, 
  onComplete 
}: { 
  onClose?: () => void;
  onComplete?: (data: {
    genre?: string;
    title?: string;
    concept?: string;
    protagonistIdea?: string;
    firstEpisodeHook?: string;
  }) => void;
}) => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [proposedTopics, setProposedTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [conceptResult, setConceptResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [userKeyword, setUserKeyword] = useState<string>('');
  const [targetRegion, setTargetRegion] = useState<TargetRegion>('global');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showReportsPanel, setShowReportsPanel] = useState(false);

  // APIキーの変更を処理
  const handleApiKeyChange = (type: ApiKeyType, key: string | null) => {
    // リサーチ用のキーがあればそれを使用、なければデフォルト
    const researchKey = getApiKey('research');
    const defaultKey = getApiKey('default');
    setApiKey(researchKey || defaultKey);
  };

  useEffect(() => {
    // 初期化時にAPIキーを読み込む
    const researchKey = getApiKey('research');
    const defaultKey = getApiKey('default');
    setApiKey(researchKey || defaultKey);
  }, []);

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
  }, [apiKey]);

  const handleRefineConcept = useCallback(async (text: string) => {
    setSelectedGenre(REFINE_MODE_GENRE);
    setSelectedTopic("既存の企画案 (インポート済み)");
    setConceptResult(text); 
    setAppState(AppState.GENERATING_CONCEPT);
    setError('');
    
    const apiKey = getApiKey('research');
    if (!apiKey) {
      setError('APIキーが設定されていません。マンガハブの「APIキー設定」からキーを入力してください。');
      setAppState(AppState.IDLE);
      setSelectedGenre(null);
      return;
    }
    
    try {
      const res = await fetch('/api/research/generate-master-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          concept: text, 
          apiKey
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate master sheet');
      const newContent = `${text}\n\n${data.masterSheet}`;
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

    const apiKey = getApiKey('research');
    if (!apiKey) {
      setError('APIキーが設定されていません。マンガハブの「APIキー設定」からキーを入力してください。');
      return;
    }

    setAppState(AppState.PROPOSING_TOPICS);
    setError('');
    setSelectedTopic(null);
    setConceptResult('');
    try {
      const res = await fetch('/api/research/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          genre: selectedGenre, 
          keyword: userKeyword, 
          region: targetRegion, 
          apiKey
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate topics');
      setProposedTopics(data.topics);
      setAppState(AppState.TOPICS_PROPOSED);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'テーマの提案中にエラーが発生しました。');
      setAppState(AppState.IDLE);
    }
  }, [selectedGenre, userKeyword, targetRegion]);

  const handleCreateConcept = useCallback(async () => {
    if (!selectedTopic) return;
    
    const apiKey = getApiKey('research');
    if (!apiKey) {
      setError('APIキーが設定されていません。マンガハブの「APIキー設定」からキーを入力してください。');
      return;
    }

    setAppState(AppState.GENERATING_CONCEPT);
    setError('');
    try {
      const res = await fetch('/api/research/generate-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: selectedTopic, 
          region: targetRegion, 
          apiKey
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate concept');
      setConceptResult(data.concept);
      setAppState(AppState.CONCEPT_COMPLETE);
      
      // 企画案が完成したら、データを抽出してonCompleteを呼び出す
      if (onComplete) {
        // 企画案からタイトルや概念を抽出
        const conceptText = data.concept;
        
        // タイトル抽出（複数のパターンを試行）
        const titlePatterns = [
          /タイトル[：:]\s*([^\n]+)/i,
          /【タイトル】\s*([^\n]+)/i,
          /シリーズタイトル[：:]\s*([^\n]+)/i,
          /^#+\s*([^\n]+)/m, // Markdownの見出し
        ];
        let title = selectedTopic.split('\n')[0].trim();
        for (const pattern of titlePatterns) {
          const match = conceptText.match(pattern);
          if (match) {
            title = match[1].trim();
            break;
          }
        }
        
        // 主人公情報抽出
        const protagonistPatterns = [
          /主人公[：:]\s*([^\n]+)/i,
          /【主人公[^】]*】\s*([^\n]+)/i,
          /名前[：:]\s*([^\n]+)/i,
        ];
        let protagonistIdea = '';
        for (const pattern of protagonistPatterns) {
          const match = conceptText.match(pattern);
          if (match) {
            protagonistIdea = match[1].trim();
            break;
          }
        }
        
        // 第1話のフック抽出
        const hookPatterns = [
          /第1話[：:]\s*([^\n]+)/i,
          /第1巻[：:]\s*([^\n]+)/i,
          /Vol\.1[：:]\s*([^\n]+)/i,
        ];
        let firstEpisodeHook = '';
        for (const pattern of hookPatterns) {
          const match = conceptText.match(pattern);
          if (match) {
            firstEpisodeHook = match[1].trim();
            break;
          }
        }
        
        // 概念（世界観）は企画案全体から抽出（最初の1000文字）
        const concept = conceptText.substring(0, 1000);
        
        onComplete({
          genre: selectedGenre || undefined,
          title: title,
          concept: concept,
          protagonistIdea: protagonistIdea || selectedTopic.split('\n')[1]?.trim() || '',
          firstEpisodeHook: firstEpisodeHook || selectedTopic.split('\n')[2]?.trim() || '',
        });
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || '企画案の作成中にエラーが発生しました。');
      setAppState(AppState.TOPICS_PROPOSED);
    }
  }, [selectedTopic, targetRegion, selectedGenre, onComplete]);

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

  // 保存されたレポートを読み込む
  const handleLoadReport = useCallback((report: SavedReport) => {
    if (report.data && report.type === 'research') {
      if (report.data.conceptResult) {
        setConceptResult(report.data.conceptResult);
        if (report.data.selectedTopic) setSelectedTopic(report.data.selectedTopic);
        if (report.data.selectedGenre) setSelectedGenre(report.data.selectedGenre);
        setAppState(AppState.CONCEPT_COMPLETE);
        setShowReportsPanel(false);
        alert('レポートを読み込みました。');
      }
    }
  }, []);

  // 保存されたレポートを世界観構築ツールに渡す
  const handleUseReportForWorld = useCallback((report: SavedReport) => {
    if (report.data && report.type === 'research' && onComplete) {
      const data = report.data;
      onComplete({
        genre: data.selectedGenre,
        title: data.selectedTopic?.split('\n')[0]?.replace(/^#+\s*/, '') || '',
        concept: data.conceptResult?.substring(0, 1000) || '',
        protagonistIdea: '',
        firstEpisodeHook: '',
      });
      setShowReportsPanel(false);
    }
  }, [onComplete]);

  // レポート一覧を更新
  useEffect(() => {
    setSavedReports(getAllReports());
  }, [conceptResult]);

  // レポートパネルを表示
  if (showReportsPanel) {
    const researchReports = savedReports.filter(r => r.type === 'research');
    const allReports = savedReports;
    
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold flex items-center space-x-3">
              <Folder className="w-8 h-8 text-blue-400" />
              <span>保存済みレポート</span>
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => downloadAllReportsAsZip()}
                className="flex items-center space-x-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-full font-bold text-sm"
              >
                <Package className="w-5 h-5" />
                <span>一式ダウンロード</span>
              </button>
              <button
                onClick={() => setShowReportsPanel(false)}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-teal-400">企画レポート ({researchReports.length})</h3>
              {researchReports.length === 0 ? (
                <p className="text-gray-400">保存されたレポートがありません。</p>
              ) : (
                <div className="space-y-3">
                  {researchReports.map(report => (
                    <div key={report.id} className="bg-gray-900 rounded-xl p-4 border border-gray-600 flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">{report.title}</h4>
                        <p className="text-xs text-gray-400">
                          {new Date(report.createdAt).toLocaleString('ja-JP')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLoadReport(report)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold"
                        >
                          読み込む
                        </button>
                        {onComplete && (
                          <button
                            onClick={() => handleUseReportForWorld(report)}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-bold"
                          >
                            世界観ツールへ
                          </button>
                        )}
                        <button
                          onClick={() => {
                            deleteReport(report.id);
                            setSavedReports(getAllReports());
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-bold"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {allReports.length > researchReports.length && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-purple-400">すべてのレポート ({allReports.length})</h3>
                <div className="space-y-3">
                  {allReports.map(report => (
                    <div key={report.id} className="bg-gray-900 rounded-xl p-4 border border-gray-600">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">{report.type}</span>
                            <h4 className="font-bold text-white">{report.title}</h4>
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(report.createdAt).toLocaleString('ja-JP')}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            deleteReport(report.id);
                            setSavedReports(getAllReports());
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-bold"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12 relative">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute left-0 top-0 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> 戻る
            </button>
          )}
          <div className="flex justify-center items-center gap-4">
            <Sparkles className="h-10 w-10 text-teal-400" />
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

        <div className="max-w-2xl mx-auto mb-6">
          <ApiKeyManager onApiKeyChange={handleApiKeyChange} defaultType="research" />
        </div>

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
                selectedGenre={selectedGenre}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};
