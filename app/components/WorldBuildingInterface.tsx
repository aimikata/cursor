'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Genre, WorldviewProposal, DetailedSetting, GeneratedImageData, 
  CharacterSetting, TargetMarket, VolumeDetail 
} from '@/app/lib/world/types';
import { GENRES } from '@/app/lib/world/constants';
import { getAllReports, deleteReport, SavedReport, downloadAllReportsAsZip } from '@/app/lib/report-manager';
import { getApiKey, ApiKeyType } from '@/app/lib/api-keys';

// リサーチツールのジャンル名を世界観構築ツールのGenreオブジェクトにマッピング
const mapResearchGenreToWorldGenre = (researchGenre: string): Genre | null => {
  // リサーチツールのジャンル名から世界観構築ツールのGenreを検索
  const genreMap: Record<string, string> = {
    '「マンガでわかる」・解説学習系': 'educational',
    '恋愛・人間ドラマ系': 'romance',
    'ライフハック・自己成長・教育系': 'educational',
    'マネー・経済・キャリア系': 'business',
    'AI・テクノロジー系（2025年トレンド）': 'sci_fi',
    'ライト文芸・ストーリー系': 'romance',
    '実用系・ノウハウ系': 'educational',
    'ビジネス・起業ストーリー系': 'business',
    '実話ベース・ドキュメンタリー系': 'slice_of_life',
    '美容・健康・ライフスタイル系': 'slice_of_life',
    'クリエイター・アート系': 'slice_of_life',
    'パーソナルストーリー・半自伝系': 'slice_of_life',
    'SNS向けショート系': 'slice_of_life',
    'アクション・アドベンチャー': 'battle',
    'ミーム・ユーモア・風刺': 'slice_of_life',
    '古典文学・名作リメイク': 'romance',
  };
  
  const genreId = genreMap[researchGenre];
  if (genreId) {
    return GENRES.find(g => g.id === genreId) || null;
  }
  
  // 直接マッチする場合（既にGENRESのnameやidが渡されている場合）
  return GENRES.find(g => g.name === researchGenre || g.id === researchGenre) || null;
};
import { ArrowLeft, Download, RefreshCw, Sparkles, WandSparkles, FileText, BookMarked, ChartBar, Lightbulb, Globe, Image as ImageIcon, Wrench, Folder, X, Package } from 'lucide-react';
import { CharacterSelectionInterface } from './CharacterSelectionInterface';
import { WorldGenerationResult, StoryGenerationData, ImageReferenceMap } from '@/app/lib/world/types';

// ==========================================
// サブコンポーネント
// ==========================================

const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center space-y-4 my-8">
    <svg
      className="animate-spin h-12 w-12 text-indigo-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p className="text-lg text-gray-300 font-medium animate-pulse">{message}</p>
  </div>
);

const StepHeader = ({ step, title, icon }: { step: number; title: string; icon: React.ReactNode }) => (
  <div className="flex items-center space-x-4">
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg">
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-indigo-400">STEP {step}</p>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
  </div>
);

const InputField = ({
  id, label, description, value, onChange, isTextarea
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isTextarea?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-lg font-semibold text-white">
      {label}
    </label>
    <p className="text-sm text-gray-400 mb-2">{description}</p>
    {isTextarea ? (
      <textarea
        id={id}
        rows={4}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
        value={value}
        onChange={onChange}
      />
    ) : (
      <input
        type="text"
        id={id}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
        value={value}
        onChange={onChange}
      />
    )}
  </div>
);

const WorldviewInputForm = ({ 
  onSubmit, 
  initialData,
  autoSubmit = false
}: { 
  onSubmit: (proposal: WorldviewProposal) => void;
  initialData?: { title?: string; coreConcept?: string; protagonistIdea?: string; firstEpisodeHook?: string };
  autoSubmit?: boolean;
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [coreConcept, setCoreConcept] = useState(initialData?.coreConcept || '');
  const [protagonistIdea, setProtagonistIdea] = useState(initialData?.protagonistIdea || '');
  const [firstEpisodeHook, setFirstEpisodeHook] = useState(initialData?.firstEpisodeHook || '');
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCoreConcept(initialData.coreConcept || '');
      setProtagonistIdea(initialData.protagonistIdea || '');
      setFirstEpisodeHook(initialData.firstEpisodeHook || '');
      // セミオートモードで初期データが設定されたら、hasAutoSubmittedをリセット
      if (autoSubmit) {
        setHasAutoSubmitted(false);
      }
    }
  }, [initialData, autoSubmit]);

  // セミオートモード：初期データが揃ったら自動的に送信
  useEffect(() => {
    if (autoSubmit && !hasAutoSubmitted) {
      // セミオートモードでは、タイトルとコアコンセプトがあれば自動送信
      // 他のフィールドは空でもデフォルト値で補完
      if (title && coreConcept) {
        setHasAutoSubmitted(true);
        // 少し遅延を入れて、ユーザーに処理中であることを示す
        const timer = setTimeout(() => {
          onSubmit({ 
            title, 
            coreConcept, 
            protagonistIdea: protagonistIdea || '主人公の詳細は世界観レポート生成時に自動補完されます', 
            firstEpisodeHook: firstEpisodeHook || '第1話の展開は世界観レポート生成時に自動補完されます' 
          });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSubmit, hasAutoSubmitted, title, coreConcept, protagonistIdea, firstEpisodeHook]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coreConcept) {
      alert("タイトルと世界観は入力してください。");
      return;
    }
    onSubmit({ title, coreConcept, protagonistIdea, firstEpisodeHook });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField
        id="title"
        label="企画案タイトル"
        description="あなたの物語のタイトルを入力してください。"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <InputField
        id="core-concept"
        label="企画の核となる「世界観」"
        description="基本的な設定、主人公が置かれている状況、そして海外読者が斬新だと感じる日本的な要素を記述してください。"
        value={coreConcept}
        onChange={(e) => setCoreConcept(e.target.value)}
        isTextarea
      />
      <InputField
        id="protagonist-idea"
        label="主人公の設計"
        description="名前/年齢/職業、普遍的な共感要素、そして日本的な特殊能力や葛藤などを記述してください。"
        value={protagonistIdea}
        onChange={(e) => setProtagonistIdea(e.target.value)}
        isTextarea
      />
      <InputField
        id="first-episode-hook"
        label="第1話の「引き」のアイデア"
        description="読者が「次を読みたい」と感じる、第1話のラストシーンのアイデアを具体的に記述してください。"
        value={firstEpisodeHook}
        onChange={(e) => setFirstEpisodeHook(e.target.value)}
        isTextarea
      />
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-500"
      >
        この内容で設定を深掘りする
      </button>
    </form>
  );
};

const ProjectPlanAnalyzer = ({ 
  onAnalysisComplete 
}: { 
  onAnalysisComplete: (proposal: WorldviewProposal, genreId: string) => void;
}) => {
  const [planText, setPlanText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planText.trim()) {
      setError('企画案を入力してください。');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = getApiKey('world') || getApiKey('default');
      if (!apiKey) {
        throw new Error('APIキーが設定されていません。設定画面からキーを入力してください。');
      }

      const res = await fetch('/api/world/analyze-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planText, genres: GENRES, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze plan');
      onAnalysisComplete(data.proposal, data.genreId);
    } catch (err: any) {
      console.error(err);
      setError(`情報の解析に失敗しました: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) return <LoadingSpinner message="情報を100%継承するため、精密に解析しています..." />;

  return (
    <div className="mt-20">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-900"></div></div>
        <div className="relative flex justify-center"><span className="bg-black px-8 text-xs font-black text-gray-700 uppercase tracking-[0.5em]">Advanced Plan Analysis</span></div>
      </div>
      <form onSubmit={handleSubmit} className="mt-12 space-y-8">
        <textarea
          rows={12}
          className="w-full p-8 bg-gray-900/50 border border-gray-800 rounded-[2rem] text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent placeholder-gray-800 text-sm leading-relaxed shadow-inner"
          placeholder="Vol.1〜Vol.5の構成案やメモをここにすべて貼り付けてください。情報の完全継承を約束します。"
          value={planText}
          onChange={(e) => setPlanText(e.target.value)}
        />
        {error && <p className="text-xs text-red-500 font-bold ml-4">{error}</p>}
        <button type="submit" disabled={!planText.trim()} className="w-full flex justify-center items-center space-x-4 bg-indigo-600 text-white font-black py-6 rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 uppercase tracking-[0.2em]">
          <WandSparkles className="w-6 h-6" />
          <span>情報の100%継承で深掘り開始</span>
        </button>
      </form>
    </div>
  );
};

const CharacterCard = ({ character, title }: { character: CharacterSetting; title: string }) => {
  const DetailItem = ({ label, value, isTag }: { label: string; value: string | undefined; isTag?: boolean }) => {
    if (!value) return null;
    return (
      <div className="space-y-1">
        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{label}</h4>
        <p className={isTag ? "text-gray-300 font-mono bg-black/40 p-3 rounded-xl mt-1 text-[10px] border border-gray-800 break-all" : "text-gray-300 text-sm leading-relaxed"}>{value}</p>
      </div>
    );
  };

  return (
    <div className="bg-gray-900/50 p-10 rounded-[2.5rem] shadow-2xl border border-gray-800">
      <div className="flex justify-between items-start mb-10 border-b border-gray-800 pb-8">
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2">{title}</p>
          <h3 className="text-4xl font-black text-white tracking-tight">{character.name}</h3>
          <p className="text-indigo-400 font-black text-sm uppercase tracking-widest mt-1">{character.englishName}</p>
        </div>
        <div className="bg-indigo-600/10 px-6 py-3 rounded-full border border-indigo-500/20">
          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{character.age} years old / {character.occupation}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="md:col-span-2">
          <DetailItem label="Visual Engine Tags / ビジュアル・タグ" value={character.visualTags} isTag />
        </div>
        <DetailItem label="Public Persona / 表向きの性格" value={character.publicPersona} />
        <DetailItem label="Hidden Self / 隠された内面・虚無感" value={character.hiddenSelf} />
        
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-10 bg-black/20 p-8 rounded-3xl border border-gray-800">
          <DetailItem label="Past Trauma / トラウマ" value={character.pastTrauma} />
          <DetailItem label="Greatest Weakness / 最大の弱点" value={character.greatestWeakness} />
          <DetailItem label="Potential / 克服時の姿" value={character.potentialWhenOvercome} />
        </div>

        {character.relationshipWithProtagonist && <div className="md:col-span-2"><DetailItem label="Relationship / 主人公との関係" value={character.relationshipWithProtagonist} /></div>}
        {character.goal && <DetailItem label="Goal / 目標" value={character.goal} />}
        {character.secret && <DetailItem label="Secret / 秘密" value={character.secret} />}
      </div>
    </div>
  );
};

const CharacterVisualizer = ({
  setting,
  onGenerate,
  generatedData,
  isGenerating
}: {
  setting: DetailedSetting;
  onGenerate: (character: CharacterSetting) => Promise<void>;
  generatedData: GeneratedImageData | null;
  isGenerating: boolean;
}) => {
    const characters = [setting.protagonist, ...setting.rivals, ...(setting.supportingCharacters || [])];
  const [selectedCharacterName, setSelectedCharacterName] = useState(characters[0].name);

  const handleGenerateClick = () => {
    const characterToGenerate = characters.find(c => c.name === selectedCharacterName);
    if (characterToGenerate) {
      onGenerate(characterToGenerate);
    }
  };

  const handleDownload = (base64: string, index: number) => {
    if (!generatedData) return;
    
    const characterName = generatedData.characterEnglishName || generatedData.characterName;
    const safeName = characterName.replace(/[\/\?<>\\:\*\|":]/g, '').replace(/\s+/g, '_');
    
    const link = document.createElement('a');
    link.href = base64;
    link.download = `${safeName}_design_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="mt-4">
      <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-xl">
        <div className="space-y-6">
          <div>
            <label htmlFor="character-select" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">生成するキャラクターを選択</label>
            <select
              id="character-select"
              className="mt-1 block w-full pl-4 pr-10 py-4 text-base bg-gray-900 border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-2xl text-white font-bold"
              value={selectedCharacterName}
              onChange={(e) => setSelectedCharacterName(e.target.value)}
            >
              {characters.map(char => <option key={char.name} value={char.name}>{char.name}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="w-full bg-indigo-600 text-white font-black py-5 px-4 rounded-2xl hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-lg uppercase tracking-widest text-sm"
          >
            {isGenerating ? '生成中...' : 'ビジュアルを生成する'}
          </button>
          <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest leading-relaxed">
            ※白背景・立ち姿・手ぶらの立ち絵を3案生成します
          </p>
        </div>
      </div>

      {generatedData && !isGenerating && (
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-5">
          <h3 className="text-sm font-black text-white mb-6 text-center uppercase tracking-widest">
            Generated Designs for: {generatedData.characterName}
          </h3>
          <div className="grid grid-cols-1 gap-8">
            {generatedData.fullBodyDesigns.map((src, index) => (
              <div key={index} className="relative group bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                <img src={src} alt="generated" className="w-full h-auto block" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-white font-black mb-4 uppercase tracking-widest">Design Concept {index + 1}</p>
                  <button 
                    onClick={() => handleDownload(src, index)}
                    className="flex items-center space-x-2 bg-white text-black py-3 px-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </button>
                </div>
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// メインコンポーネント
// ==========================================

interface WorldBuildingInterfaceProps {
  onClose?: () => void;
  initialData?: {
    genre?: string;
    title?: string;
    concept?: string;
    protagonistIdea?: string;
    firstEpisodeHook?: string;
  };
  onProceedToStory?: (storyInput: {
    world_setting: string;
    characters: Array<{
      id: string;
      name: string;
      role: string;
      description: string;
    }>;
  }) => void;
}

export const WorldBuildingInterface: React.FC<WorldBuildingInterfaceProps> = ({ onClose, initialData, onProceedToStory }) => {
  // セミオートモードを無効化：常にマニュアルモード
  const isSemiAutoMode = false;
  
  const [step, setStep] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [targetMarket, setTargetMarket] = useState<TargetMarket>('japan');
  const [detailedSetting, setDetailedSetting] = useState<DetailedSetting | null>(null);
  const [generatedImageData, setGeneratedImageData] = useState<GeneratedImageData | null>(null);
  const [allCharacterImages, setAllCharacterImages] = useState<Map<string, GeneratedImageData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [proposalData, setProposalData] = useState<WorldviewProposal | null>(null);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [worldGenerationResult, setWorldGenerationResult] = useState<WorldGenerationResult | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showReportsPanel, setShowReportsPanel] = useState(false);

  const normalizeWorldReportData = useCallback((report: SavedReport) => {
    if (report.type !== 'world' || !report.data) return null;
    const data = report.data as any;
    if (data?.detailedSetting) {
      return {
        setting: data.detailedSetting as DetailedSetting,
        genreId: data.genreId as string | undefined,
        targetMarket: data.targetMarket as TargetMarket | undefined,
      };
    }
    if (data?.seriesTitle && data?.worldview) {
      return { setting: data as DetailedSetting };
    }
    return null;
  }, []);

  // セミオートモード：初期データからジャンルとステップを設定
  useEffect(() => {
    if (isSemiAutoMode && initialData) {
      // ジャンルを設定
      if (initialData.genre) {
        const genre = mapResearchGenreToWorldGenre(initialData.genre);
        if (genre) {
          setSelectedGenre(genre);
        } else {
          console.warn(`ジャンル "${initialData.genre}" が見つかりませんでした。デフォルトのジャンルを使用します。`);
          // デフォルトとして最初のジャンルを設定
          if (GENRES.length > 0) {
            setSelectedGenre(GENRES[0]);
          }
        }
      }
      // セミオートモードの場合は直接ステップ2（企画入力）へ
      setStep(2);
    }
  }, [initialData, isSemiAutoMode]);

  const handleReset = () => {
    setStep(1);
    setSelectedGenre(null);
    setTargetMarket('japan');
    setDetailedSetting(null);
    setGeneratedImageData(null);
    setProposalData(null);
    setIsLoading(false);
    setError(null);
  };

  const handleBackToStep3 = () => {
    setError(null);
    setIsLoading(false);
    if (detailedSetting) {
      setStep(3);
      return;
    }
    setStep(1);
  };

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    setStep(2);
  };

  const handleWorldviewSubmit = async (proposal: WorldviewProposal, genreOverride?: Genre) => {
    setIsLoading(true);
    setLoadingMessage(isSemiAutoMode ? '世界観レポートを構成中...' : '最高に魅力的なキャラクターと世界観を構築中...');
    setError(null);
    setProposalData(proposal);

    try {
      const genreToUse = genreOverride || selectedGenre;
      if (!genreToUse) throw new Error("Genre not selected");
      
      const apiKey = getApiKey('world') || getApiKey('default');
      if (!apiKey) {
        throw new Error('APIキーが設定されていません。設定画面からキーを入力してください。');
      }

      const res = await fetch('/api/world/generate-detailed-setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          proposal, 
          genreId: genreToUse.id,
          genres: GENRES,
          apiKey
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate detailed setting');
      
      setDetailedSetting(data.detailedSetting);
      setStep(3);
    } catch (e: any) {
      console.error(e);
      setError(`生成に失敗しました: ${e.message || '不明なエラー'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanAnalysis = (proposal: WorldviewProposal, genreId: string) => {
    const genre = GENRES.find(g => g.id === genreId);
    if (genre) {
      setSelectedGenre(genre);
      handleWorldviewSubmit(proposal, genre);
    }
  };

  const handleImageGenerate = useCallback(async (character: CharacterSetting) => {
    if (!selectedGenre || !detailedSetting) return;
    setIsLoading(true);
    setGeneratedImageData(null);
    try {
      setLoadingMessage(`「${character.name}」の完全な全身立ち絵を生成中...`);
      
      // 画像生成の場合は、world > image_generation > default の順で取得
      const apiKey = getApiKey('world') || getApiKey('image_generation') || getApiKey('default');
      if (!apiKey) {
        throw new Error('APIキーが設定されていません。マンガハブの「APIキー設定」からキーを入力してください。');
      }

      const res = await fetch('/api/world/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          character,
          artStylePrompt: selectedGenre.artStylePrompt,
          apiKey
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate image');
      if (data.warning) {
        alert(data.warning);
        return;
      }
      
      setGeneratedImageData(data);
      
      // 全キャラクターの画像を保存
      setAllCharacterImages(prev => {
        const newMap = new Map(prev);
        newMap.set(character.name, data);
        return newMap;
      });
    } catch (e: any) { 
      setError(`画像生成に失敗しました: ${e.message}`); 
    } finally { 
      setIsLoading(false); 
    }
  }, [selectedGenre, detailedSetting]);

  // 全キャラクターの画像生成完了をチェックし、画像選択画面に遷移
  const handleProceedToSelection = useCallback(() => {
    if (!detailedSetting) return;

    const characters = [detailedSetting.protagonist, ...detailedSetting.rivals, ...(detailedSetting.supportingCharacters || [])];
    const isOptionalRole = (role?: string) => !!role && /(家族|同僚|family|coworker|colleague)/i.test(role);
    const requiredCharacters = characters.filter(char => !isOptionalRole(char.roleType || char.relationshipWithProtagonist));
    const allGenerated = requiredCharacters.every(char => allCharacterImages.has(char.name));

    if (!allGenerated) {
      alert('必須キャラクターの画像を生成してください。');
      return;
    }

    // WorldGenerationResult形式に変換
    const worldResult: WorldGenerationResult = {
      world_setting: detailedSetting.worldview.coreRule.name + '\n' + 
                     detailedSetting.worldview.coreRule.merit + '\n' + 
                     detailedSetting.worldview.coreRule.demerit,
      characters: characters.map((char, index) => {
        const imageData = allCharacterImages.get(char.name);
        return {
          id: `char_${String(index + 1).padStart(3, '0')}`,
          name: char.name,
          role: index === 0 ? '主人公' : (char.roleType || char.relationshipWithProtagonist || 'サブキャラクター'),
          description: `${char.publicPersona}\n${char.hiddenSelf}\n年齢: ${char.age}, 職業: ${char.occupation}\n外見: ${char.visualTags}`,
          candidate_images: imageData?.fullBodyDesigns || [],
        };
      }),
    };

    setWorldGenerationResult(worldResult);
    setShowCharacterSelection(true);
  }, [detailedSetting, allCharacterImages]);

  // 画像選択完了時の処理
  const handleSelectionComplete = useCallback((storyData: StoryGenerationData, imageRefs: ImageReferenceMap) => {
    // データを保存（本番ではAPIに送信）
    if (typeof window !== 'undefined') {
      localStorage.setItem('story_generation_data', JSON.stringify(storyData, null, 2));
      localStorage.setItem('image_references', JSON.stringify(imageRefs, null, 2));
    }

    // 親コンポーネントに通知（ストーリー生成ツールへ進む）
    // この処理は親コンポーネント（app/page.tsx）で実装
  }, []);

  const generateReportText = useCallback((setting: DetailedSetting) => {
    const s = setting;
    let text = `--- [SERIES ARCHITECTURE MASTER SHEET: BILINGUAL VERSION] ---\n`;
    text += `【TITLE / シリーズタイトル】\n`;
    text += `${s.seriesTitle}\n\n`;

    text += `【CORE STRATEGY / 核心戦略】\n`;
    text += `- Core Rule / 核心ルール: ${s.worldview.coreRule.name}\n`;
    text += `- Merit / 強み: ${s.worldview.coreRule.merit}\n`;
    text += `- Demerit / 弱み: ${s.worldview.coreRule.demerit}\n`;
    if (s.currentStatus) {
      text += `- Status Analysis / 現状分析: ${s.currentStatus}\n`;
    }
    if (s.progress) {
      text += `- Progress / 進捗: ${s.progress}\n`;
    }
    if (s.artStyleTags) {
      text += `- Art Style Tags / 作画スタイル: ${s.artStyleTags}\n`;
    }
    if (s.backgroundTags) {
      text += `- Background Tags / 背景タグ: ${s.backgroundTags}\n`;
    }
    text += `- Unresolved Roadmap / 執筆ロードマップ:\n`;
    text += `${s.unresolvedList}\n\n`;

    text += `============================================================\n`;
    text += `【WORLDVIEW DETAILS / 世界観詳細】\n`;
    text += `### Key Locations / 主要ロケーション\n`;
    s.worldview.keyLocations.forEach((loc, idx) => {
      text += `- ${idx + 1}. ${loc.name}\n`;
      text += `  - Historical Background: ${loc.historicalBackground}\n`;
      text += `  - Structural Features: ${loc.structuralFeatures}\n`;
    });
    text += `\n`;
    text += `### Organizations / 組織\n`;
    s.worldview.organizations.forEach((org, idx) => {
      text += `- ${idx + 1}. ${org.name}\n`;
      text += `  - Purpose: ${org.purpose}\n`;
      text += `  - Conflict: ${org.conflictRelationship}\n`;
      text += `  - Hierarchy: ${org.hierarchySystem}\n`;
    });
    text += `\n`;

    text += `============================================================\n`;
    text += `【FULL VOLUME CONFIGURATION / 全巻深掘り構成】\n\n`;

    text += `### VOLUMES & CHAPTERS\n`;
    s.volumes.forEach(v => {
      text += `#### Vol.${v.volumeNumber}: ${v.title}\n`;
      text += `Summary: ${v.summary}\n`;
      v.chapters.forEach(c => {
        text += `  Chapter ${c.chapterNumber}: ${c.title} (${c.estimatedPages} pages)\n`;
        c.sections.forEach(sec => {
          text += `    - ${sec.title}: ${sec.description}\n`;
        });
      });
      text += `\n`;
    });
    
    text += `============================================================\n`;
    text += `【CHARACTERS / キャラクター設定】\n`;
    const chars = [s.protagonist, ...s.rivals, ...(s.supportingCharacters || [])];
    chars.forEach((c, idx) => {
      const roleLabel = idx === 0 ? 'Protagonist' : (c.roleType || 'Sub-Character');
      text += `#### ${roleLabel}: ${c.name} (${c.englishName})\n`;
      text += `- Age: ${c.age} / Occupation: ${c.occupation}\n`;
      text += `- Public Persona: ${c.publicPersona}\n`;
      text += `- Hidden Self: ${c.hiddenSelf}\n`;
      text += `- Trauma: ${c.pastTrauma}\n`;
      if (c.relationshipWithProtagonist) {
        text += `- Relationship: ${c.relationshipWithProtagonist}\n`;
      }
      text += `- Visual Tags: ${c.visualTags}\n\n`;
    });
    
    text += `============================================================\n`;
    text += `【DEVELOPMENT ROADMAP / 執筆ロードマップ】\n`;
    text += s.unresolvedList;
    
    return text;
  }, []);

  const handleCopySettings = useCallback(() => {
    if (!detailedSetting) return;
    const text = generateReportText(detailedSetting);
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  }, [detailedSetting, generateReportText]);

  const handleDownloadSettings = useCallback(() => {
    if (!detailedSetting) return;
    const text = generateReportText(detailedSetting);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${detailedSetting.seriesTitle || 'world_report'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [detailedSetting, generateReportText]);

  // 保存されたレポートを読み込む
  const handleLoadReport = useCallback((report: SavedReport) => {
    const normalized = normalizeWorldReportData(report);
    if (!normalized) return;
    setDetailedSetting(normalized.setting);
    if (normalized.genreId) {
      const genre = GENRES.find(g => g.id === normalized.genreId);
      if (genre) setSelectedGenre(genre);
    } else if (!selectedGenre && GENRES.length > 0) {
      setSelectedGenre(GENRES[0]);
    }
    if (normalized.targetMarket) {
      setTargetMarket(normalized.targetMarket);
    }
    setStep(3);
    setShowReportsPanel(false);
    alert('レポートを読み込みました。');
  }, [normalizeWorldReportData, selectedGenre]);

  // レポート一覧を更新
  useEffect(() => {
    setSavedReports(getAllReports());
  }, [detailedSetting]);

  // レポートパネルを表示
  if (showReportsPanel) {
    const worldReports = savedReports.filter(r => r.type === 'world');
    const researchReports = savedReports.filter(r => r.type === 'research');
    const allReports = savedReports;
    
    return (
      <div className="min-h-screen bg-black text-white p-8">
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
            {/* 企画レポート（リサーチツール） */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4 text-teal-400">企画レポート ({researchReports.length})</h3>
              {researchReports.length === 0 ? (
                <p className="text-gray-400">保存された企画レポートがありません。</p>
              ) : (
                <div className="space-y-3">
                  {researchReports.map(report => (
                    <div key={report.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">{report.title}</h4>
                        <p className="text-xs text-gray-400">
                          {new Date(report.createdAt).toLocaleString('ja-JP')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // リサーチレポートを世界観ツールの初期データとして使用
                            if (report.data && report.type === 'research') {
                              const data = report.data;
                              // リサーチデータを世界観ツールの形式に変換
                              if (data.selectedGenre) {
                                const genre = mapResearchGenreToWorldGenre(data.selectedGenre);
                                if (genre) {
                                  setSelectedGenre(genre);
                                }
                              }
                              // ステップ2（企画入力）に進む
                              setStep(2);
                              setShowReportsPanel(false);
                              // 企画レポートの内容を初期データとして設定（localStorageに保存）
                              if (typeof window !== 'undefined' && data.conceptResult) {
                                // 企画レポートの内容を解析して、タイトルやコンセプトを抽出
                                const conceptText = data.conceptResult;
                                // タイトルを抽出（最初の見出しから）
                                const titleMatch = conceptText.match(/^#+\s*(.+)$/m);
                                const title = titleMatch ? titleMatch[1].trim() : '';
                                // コンセプトを抽出（最初の1000文字）
                                const concept = conceptText.substring(0, 1000);
                                // 初期データとして設定するために、一時的にlocalStorageに保存
                                // これはWorldviewInputFormで使用される
                                localStorage.setItem('world_building_initial_data', JSON.stringify({
                                  title: title || data.selectedTopic?.split('\n')[0]?.replace(/^#+\s*/, '') || '',
                                  coreConcept: concept,
                                  protagonistIdea: '',
                                  firstEpisodeHook: '',
                                }));
                              }
                              alert('企画レポートを読み込みました。世界観ツールで使用できます。');
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold"
                        >
                          読み込む
                        </button>
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

            {/* 世界観レポート */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4 text-blue-400">世界観レポート ({worldReports.length})</h3>
              {worldReports.length === 0 ? (
                <p className="text-gray-400">保存されたレポートがありません。</p>
              ) : (
                <div className="space-y-3">
                  {worldReports.map(report => (
                    <div key={report.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex justify-between items-center">
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
                        {onProceedToStory && report.data && (
                          <button
                            onClick={() => {
                              const normalized = normalizeWorldReportData(report);
                              if (normalized) {
                                const setting = normalized.setting;
                                const storyInput = {
                                  world_setting: JSON.stringify(setting, null, 2),
                                characters: [setting.protagonist, ...setting.rivals, ...(setting.supportingCharacters || [])].map((c, idx) => ({
                                    id: `char_${idx}`,
                                    name: c.name,
                                    role: idx === 0 ? '主人公' : 'サブキャラクター',
                                    description: `${c.publicPersona} / ${c.hiddenSelf}`,
                                  })),
                                };
                                onProceedToStory(storyInput);
                                setShowReportsPanel(false);
                              }
                            }}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-bold"
                          >
                            ストーリーツールへ
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

            {allReports.length > worldReports.length && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold mb-4 text-purple-400">すべてのレポート ({allReports.length})</h3>
                <div className="space-y-3">
                  {allReports.map(report => (
                    <div key={report.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
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

  // 画像選択画面を表示
  if (showCharacterSelection && worldGenerationResult) {
    return (
      <CharacterSelectionInterface
        worldData={worldGenerationResult}
        onComplete={handleSelectionComplete}
        onClose={() => setShowCharacterSelection(false)}
        onProceedToStory={onProceedToStory}
      />
    );
  }

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner message={loadingMessage} />;
    if (error) return (
      <div className="text-center p-12 bg-red-900/10 border border-red-500/20 rounded-[3rem] m-10">
        <p className="text-red-400 font-bold mb-4">{error}</p>
        <div className="flex items-center justify-center space-x-4">
          {detailedSetting && (
            <button onClick={handleBackToStep3} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-xs uppercase">
              STEP3へ戻る
            </button>
          )}
          <button onClick={handleReset} className="px-8 py-3 bg-red-600 text-white rounded-full font-black text-xs uppercase">最初から</button>
        </div>
      </div>
    );

    switch (step) {
      case 1:
        // マニュアルモード：通常のジャンル選択画面
        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* モード表示 */}
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wrench className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Manual Mode</p>
                    <p className="text-xs text-gray-400">ゼロから世界観を作成します</p>
                  </div>
                </div>
                {isSemiAutoMode && (
                  <button
                    onClick={() => {
                      // セミオートモードに切り替え（初期データを使用）
                      if (initialData?.genre) {
                        const genre = mapResearchGenreToWorldGenre(initialData.genre);
                        if (genre) {
                          setSelectedGenre(genre);
                          setStep(2);
                        } else {
                          // デフォルトとして最初のジャンルを設定
                          if (GENRES.length > 0) {
                            setSelectedGenre(GENRES[0]);
                            setStep(2);
                          }
                        }
                      }
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    セミオートモードで続ける →
                  </button>
                )}
              </div>
            </div>
            
            <StepHeader step={1} title="ターゲット市場とジャンルの選択" icon={<BookMarked className="w-6 h-6"/>} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button onClick={() => setTargetMarket('japan')} className={`p-8 rounded-3xl border-2 transition-all group ${targetMarket === 'japan' ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>
                <p className="text-2xl font-black mb-1">Domestic / 日本国内</p>
              </button>
              <button onClick={() => setTargetMarket('english')} className={`p-8 rounded-3xl border-2 transition-all group ${targetMarket === 'english' ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>
                <p className="text-2xl font-black mb-1">Global / 世界市場</p>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {GENRES.map(g => (
                <button key={g.id} onClick={() => handleGenreSelect(g)} className="p-8 bg-gray-900 rounded-[2rem] hover:bg-indigo-600 border border-gray-800 text-center transition-all group shadow-lg">
                  <p className="font-black text-xl text-white group-hover:scale-105 transition-transform">{g.name}</p>
                  <p className="text-[10px] text-gray-500 group-hover:text-indigo-200 uppercase tracking-widest mt-2">{g.styleDescription}</p>
                </button>
              ))}
            </div>
            <ProjectPlanAnalyzer onAnalysisComplete={handlePlanAnalysis} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {/* モード表示 */}
            <div className={`border rounded-2xl p-4 mb-6 ${
              isSemiAutoMode 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-indigo-900/20 border-indigo-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isSemiAutoMode ? (
                    <>
                      <Sparkles className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-sm font-bold text-green-400 uppercase tracking-widest">Semi-Auto Mode</p>
                        <p className="text-xs text-gray-400">前工程の企画案データを自動読み込み中</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Manual Mode</p>
                        <p className="text-xs text-gray-400">手動で企画を入力します</p>
                      </div>
                    </>
                  )}
                </div>
                {isSemiAutoMode && initialData && (
                  <div className="text-xs text-gray-500">
                    読み込み元: 企画リサーチツール
                  </div>
                )}
              </div>
            </div>
            
            <StepHeader step={2} title="企画の骨子を確認" icon={<Globe className="w-6 h-6"/>} />
            {isLoading && loadingMessage ? (
              <LoadingSpinner message={loadingMessage} />
            ) : (
              <WorldviewInputForm 
                onSubmit={handleWorldviewSubmit} 
                initialData={(() => {
                  // セミオートモードの初期データ
                  if (isSemiAutoMode && initialData) {
                    return {
                      title: initialData.title,
                      coreConcept: initialData.concept,
                      protagonistIdea: initialData.protagonistIdea,
                      firstEpisodeHook: initialData.firstEpisodeHook
                    };
                  }
                  // localStorageから読み込んだ企画レポートのデータ
                  if (typeof window !== 'undefined') {
                    const savedDataStr = localStorage.getItem('world_building_initial_data');
                    if (savedDataStr) {
                      try {
                        const savedData = JSON.parse(savedDataStr);
                        // 使用後は削除
                        localStorage.removeItem('world_building_initial_data');
                        return savedData;
                      } catch (e) {
                        console.error('Failed to parse initial data:', e);
                      }
                    }
                  }
                  return undefined;
                })()}
                autoSubmit={isSemiAutoMode}
              />
            )}
          </div>
        );
      case 3:
        if (!detailedSetting || !selectedGenre) return null;
        const s = detailedSetting;
        return (
          <div className="space-y-16 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900/90 p-8 rounded-[2.5rem] border border-gray-800 sticky top-4 z-20 shadow-2xl backdrop-blur-2xl space-y-4 md:space-y-0">
              <StepHeader step={3} title="マスターシート完成 (極限深掘り)" icon={<Sparkles className="w-6 h-6"/>} />
              <div className="flex space-x-4">
                <button onClick={handleCopySettings} className={`flex items-center justify-center space-x-4 py-5 px-10 rounded-full font-black text-xs uppercase tracking-widest transition-all ${copyStatus === 'copied' ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 shadow-xl'} text-white`}>
                  <FileText className="w-4 h-4"/>
                  <span>{copyStatus === 'copied' ? 'コピー完了!' : '設定を全文コピー'}</span>
                </button>
                <button onClick={handleDownloadSettings} className="flex items-center justify-center space-x-4 py-5 px-10 rounded-full font-black text-xs uppercase tracking-widest transition-all bg-teal-600 hover:bg-teal-500 shadow-teal-600/20 shadow-xl text-white">
                  <Download className="w-4 h-4"/>
                  <span>ダウンロード</span>
                </button>
                <button onClick={handleReset} className="p-5 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-all text-white"><RefreshCw className="w-5 h-5"/></button>
              </div>
            </div>

            <section className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-indigo-950 via-gray-900 to-indigo-950 p-16 border-b border-gray-800 text-center">
                <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">{s.seriesTitle}</h3>
              </div>
              <div className="p-16 space-y-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="bg-indigo-900/10 p-12 rounded-[2rem] border border-indigo-500/20">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-8">核心戦略 / CORE STRATEGY</p>
                    <p className="text-2xl font-black text-white mb-6 underline decoration-indigo-600 underline-offset-8">{s.worldview.coreRule.name}</p>
                  </div>
                  <div className="bg-gray-800/30 p-12 rounded-[2rem] border border-gray-700">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">ロードマップ</p>
                    <div className="text-[10px] text-gray-400 font-mono leading-relaxed max-h-64 overflow-y-auto bg-black/40 p-6 rounded-2xl whitespace-pre-wrap">
                      {s.unresolvedList}
                    </div>
                  </div>
                </div>
                <div className="space-y-12">
                  <h4 className="text-3xl font-black text-white border-l-8 border-indigo-600 pl-8 uppercase tracking-widest">全巻構成案</h4>
                  {s.volumes.map(v => (
                    <div key={v.volumeNumber} className="bg-gray-950/60 p-12 rounded-[2.5rem] border border-gray-800">
                      <h5 className="text-3xl font-black text-white mb-6">Vol.{v.volumeNumber}: {v.title}</h5>
                      <p className="bg-indigo-950/20 p-8 rounded-2xl mb-12 text-indigo-200">{v.summary}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {v.chapters.map(c => (
                          <div key={c.chapterNumber} className="p-8 bg-gray-900 rounded-3xl border border-gray-800">
                            <p className="text-xl font-black text-white mb-4">{c.chapterNumber}: {c.title}</p>
                            {c.sections.map((sec, idx) => (
                              <div key={idx} className="mt-4 first:mt-0">
                                <p className="text-sm font-black text-indigo-400">■ {sec.title}</p>
                                <p className="text-xs text-gray-400 leading-loose">{sec.description}</p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-8 space-y-16">
                <h3 className="text-3xl font-black text-white border-l-8 border-indigo-600 pl-8 uppercase tracking-widest">登場人物プロファイル</h3>
                <CharacterCard character={s.protagonist} title="主人公" />
                {s.rivals.map((r, i) => (
                  <CharacterCard key={i} character={r} title="サブキャラクター" />
                ))}
                {(s.supportingCharacters || []).map((r, i) => (
                  <CharacterCard
                    key={`supporting-${i}`}
                    character={r}
                    title={r.roleType || 'サブキャラクター'}
                  />
                ))}
              </div>
              <div className="lg:col-span-4">
                <div className="sticky top-32 space-y-10">
                  <h3 className="text-3xl font-black text-white border-l-8 border-indigo-600 pl-8 uppercase tracking-widest text-center lg:text-left">立ち絵ビジュアライザー</h3>
                  <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 shadow-2xl">
                    <CharacterVisualizer 
                      setting={s} 
                      onGenerate={handleImageGenerate} 
                      generatedData={generatedImageData} 
                      isGenerating={isLoading && loadingMessage.includes('生成中')} 
                    />
                  </div>
                  
                  {/* 画像選択画面へ進むボタン */}
                  <div className="bg-indigo-900/20 p-6 rounded-2xl border border-indigo-500/30">
                    <p className="text-sm text-gray-300 mb-4">
                      {allCharacterImages.size} / {[s.protagonist, ...s.rivals, ...(s.supportingCharacters || [])].length} キャラクターの画像を生成済み
                    </p>
                    <button
                      onClick={handleProceedToSelection}
                      disabled={allCharacterImages.size < [s.protagonist, ...s.rivals, ...(s.supportingCharacters || [])].length}
                      className={`w-full py-4 px-6 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                        allCharacterImages.size >= [s.protagonist, ...s.rivals, ...(s.supportingCharacters || [])].length
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {allCharacterImages.size >= [s.protagonist, ...s.rivals, ...(s.supportingCharacters || [])].length
                        ? '画像選択画面へ進む →'
                        : 'すべてのキャラクターの画像を生成してください'
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-600/30 pb-32">
      <div className="max-w-7xl mx-auto p-4 sm:p-12">
        <header className="flex justify-between items-center mb-20 border-b border-gray-900 pb-12">
          <div className="flex items-center space-x-8">
            <div className="p-6 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/30 animate-pulse"><Sparkles className="w-10 h-10 text-white" /></div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Architect <span className="text-indigo-600">MAX</span></h1>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.6em] mt-3">High-Quality Character & Story Blueprint</p>
            </div>
          </div>
          <div className="flex space-x-4">
            {onClose && (
              <button onClick={onClose} className="px-10 py-4 rounded-full bg-gray-900 hover:bg-gray-800 text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-gray-800 flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>戻る</span>
              </button>
            )}
            <button onClick={handleReset} className="px-10 py-4 rounded-full bg-gray-900 hover:bg-gray-800 text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-gray-800">Restart</button>
          </div>
        </header>
        <main>{renderContent()}</main>
      </div>
    </div>
  );
};
