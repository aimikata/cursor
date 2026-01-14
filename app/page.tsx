'use client';

import React, { useState, useCallback } from 'react';
import { 
  Lock, Mail, Key, LogOut, User as UserIcon, 
  PenTool, BookOpen, Gift, Briefcase, 
  ArrowLeft, Search, Globe, Image as ImageIcon, 
  Languages, ShoppingBag, ExternalLink, AlertCircle, Loader2,
  Video, Layout, FileText, X, ChevronRight, ChevronsRight,
  Sparkles, Wrench, PlayCircle, Settings, Zap, Folder, Package, Copy, Check
} from 'lucide-react';
import { getAllReports, deleteReport, SavedReport, downloadAllReportsAsZip } from '@/app/lib/report-manager';
import { getAllApiKeys, getApiKeyTypeLabel, ApiKeyType, setApiKey } from '@/app/lib/api-keys';
import { ApiKeyManager } from '@/app/components/ApiKeyManager';
import { ResearchInterface } from '@/app/components/ResearchInterface';
import { WorldBuildingInterface } from '@/app/components/WorldBuildingInterface';
import { StoryInterface } from '@/app/components/StoryInterface';
import { PanelToolSelectionModal, PanelToolType } from '@/app/components/PanelToolSelectionModal';
import { PanelInterface } from '@/app/components/PanelInterface';
import { ImageStudioInterface } from '@/app/components/ImageStudioInterface';
import { AmazonAssistantInterface } from '@/app/components/AmazonAssistantInterface';
import { CoverGeneratorInterface } from '@/app/components/CoverGeneratorInterface';

// ==========================================
// 1. 型定義 (Types)
// ==========================================

interface User {
  email: string;
  name: string;
  permissions: {
    manga: boolean;
    pictureBook: boolean;
    giftBook: boolean;
    business: boolean;
  };
}

enum CreatorCategory {
  MANGA = 'manga',
  PICTURE_BOOK = 'picture_book',
  GIFT_BOOK = 'gift_book',
  BUSINESS = 'business',
}

// コマ割り選択の状態
type PanelLayoutSelection = {
  category: 'story' | 'business' | null;
  media: 'youtube' | 'manga' | null;
};

const APP_TITLE = "Story Creator Portal";

// ==========================================
// 2. 共通コンポーネント
// ==========================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
    outline: "bg-transparent text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent focus:ring-red-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

// ==========================================
// 3. 画面コンポーネント
// ==========================================

// ■ ログイン画面
const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // ダミーログイン
    setTimeout(() => {
      const mockUser: User = {
        email: email,
        name: email.split('@')[0],
        permissions: { manga: true, pictureBook: false, giftBook: false, business: false }
      };
      onLoginSuccess(mockUser);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 p-4 font-sans text-slate-800">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{APP_TITLE}</h1>
          <p className="text-slate-500 mt-2 text-sm">Login with your email and license key</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-3 block w-full border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2.5 text-slate-800 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">License Key</label>
            <input
              type="password"
              required
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="pl-3 block w-full border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2.5 text-slate-800 outline-none"
              placeholder="XXXX-XXXX-XXXX"
            />
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>Login and Continue</Button>
        </form>
      </div>
    </div>
  );
};

// ■ ホーム画面
const HomeScreen = ({ user, onNavigateToManga, onLogout }: { user: User, onNavigateToManga: () => void, onLogout: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-slate-800">Story Creator Home</div>
          <button onClick={onLogout} className="text-sm font-medium text-slate-500 hover:text-red-600 flex items-center">
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </button>
        </div>
      </header>
      <main className="flex-grow p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">Select a Creator Studio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div onClick={onNavigateToManga} className="cursor-pointer group rounded-xl border-2 border-indigo-100 p-8 bg-white hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="bg-indigo-50 text-indigo-900 w-fit p-4 rounded-xl mb-6"><PenTool className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Manga Creation</h3>
              <p className="mt-3 text-slate-500">Create narrative manga from concept to panel layout seamlessly.</p>
              <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm">Enter Studio →</div>
            </div>
            <div className="rounded-xl border-2 border-slate-100 p-8 bg-white opacity-75">
              <div className="bg-emerald-50 text-emerald-900 w-fit p-4 rounded-xl mb-6"><BookOpen className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-slate-400">Picture Book</h3>
              <p className="mt-3 text-slate-400">Coming Soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ■ コマ割り選択モーダル (分岐ロジック実装)
const PanelSelectionModal = ({ 
  isOpen, 
  onClose, 
  onComplete 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onComplete: (selection: PanelLayoutSelection) => void 
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selection, setSelection] = useState<PanelLayoutSelection>({ category: null, media: null });

  if (!isOpen) return null;

  // ステップ1: カテゴリ選択
  const handleCategorySelect = (cat: 'story' | 'business') => {
    const newSelection = { ...selection, category: cat };
    setSelection(newSelection);
    
    if (cat === 'story') {
      // 物語の場合はここで完了
      onComplete(newSelection);
    } else {
      // ビジネスの場合は次のステップ(メディア選択)へ
      setStep(2);
    }
  };

  // ステップ2: メディア選択
  const handleMediaSelect = (media: 'youtube' | 'manga') => {
    const newSelection = { ...selection, media: media };
    setSelection(newSelection);
    onComplete(newSelection);
  };

  const reset = () => {
    setStep(1);
    setSelection({ category: null, media: null });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900">
            {step === 1 ? '作品の「目的」を選択' : 'ビジネス用途の「媒体」を選択'}
          </h3>
          <button onClick={reset}><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="min-h-[300px]">
          {step === 1 ? (
             // STEP 1: Story vs Business
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => handleCategorySelect('story')}
                className="group flex flex-col items-center p-8 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:bg-purple-200">
                  <BookOpen className="w-10 h-10 text-purple-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-800">物語 (ストーリー)</h4>
                <p className="text-sm text-slate-500 text-center mt-2">創作マンガ・絵本向け。<br/>自由度の高いコマ割り。</p>
              </button>
              <button 
                onClick={() => handleCategorySelect('business')}
                className="group flex flex-col items-center p-8 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all relative"
              >
                <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200">
                  <Briefcase className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-800">ビジネス・解説</h4>
                <p className="text-sm text-slate-500 text-center mt-2">広告・PR・解説向け。<br/>伝わりやすさ重視。</p>
                <div className="absolute top-4 right-4">
                    <ChevronsRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />
                </div>
              </button>
            </div>
          ) : (
            // STEP 2: YouTube vs Manga (Business only)
            <div className="animate-in slide-in-from-right-4 duration-300">
               <button 
                onClick={() => setStep(1)} 
                className="mb-4 flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> 戻る
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => handleMediaSelect('youtube')}
                  className="group flex flex-col items-center p-8 rounded-xl border-2 border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all"
                >
                  <div className="bg-red-100 p-4 rounded-full mb-4 group-hover:bg-red-200">
                    <Video className="w-10 h-10 text-red-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">YouTube動画用</h4>
                  <p className="text-sm text-slate-500 text-center mt-2">16:9比率・テロップ対応。<br/>動画編集に最適化。</p>
                </button>
                <button 
                  onClick={() => handleMediaSelect('manga')}
                  className="group flex flex-col items-center p-8 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                >
                  <div className="bg-emerald-100 p-4 rounded-full mb-4 group-hover:bg-emerald-200">
                    <Layout className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">通常マンガ・Web用</h4>
                  <p className="text-sm text-slate-500 text-center mt-2">LP・資料・チラシ向け。<br/>読みやすさ重視。</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ■ マンガスタジオ（Hub画面）
const MangaHubScreen = ({ user, onBack }: { user: User, onBack: () => void }) => {
  // セミオートモードは無効化：常にマニュアルモード
  const mode: 'manual' = 'manual';
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [showReportsPanel, setShowReportsPanel] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showApiKeyPanel, setShowApiKeyPanel] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<ApiKeyType, string | null>>({} as Record<ApiKeyType, string | null>);
  const [copiedReportId, setCopiedReportId] = useState<string | null>(null);

  // レポート一覧とAPIキーを更新
  React.useEffect(() => {
    setSavedReports(getAllReports());
    setApiKeys(getAllApiKeys());
  }, []);
  const [showResearch, setShowResearch] = useState(false);
  const [showWorldBuilding, setShowWorldBuilding] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showPanelTool, setShowPanelTool] = useState(false);
  const [selectedPanelTool, setSelectedPanelTool] = useState<PanelToolType | null>(null);
  const [isPanelSelectionModalOpen, setIsPanelSelectionModalOpen] = useState(false);
  const [researchData, setResearchData] = useState<{
    genre?: string;
    title?: string;
    concept?: string;
    protagonistIdea?: string;
    firstEpisodeHook?: string;
  } | null>(null);
  const [storyInputData, setStoryInputData] = useState<{
    world_setting: string;
    characters: Array<{
      id: string;
      name: string;
      role: string;
      description: string;
    }>;
  } | null>(null);
  const [panelInputData, setPanelInputData] = useState<{
    storyData: any;
    characterImages: Map<string, string>;
  } | null>(null);
  const [showImageStudio, setShowImageStudio] = useState(false);
  const [imageStudioData, setImageStudioData] = useState<{
    toolType: PanelToolType;
    csvString: string;
    rows: Array<{ pageNumber: string; template: string; prompt: string }>;
    characterImages: Array<{ name: string; data: string; mimeType: string }>;
    target: 'JP' | 'EN';
    title?: string;
  } | null>(null);
  const [showProofreading, setShowProofreading] = useState(false);
  const [proofreadingData, setProofreadingData] = useState<{
    csvString: string;
    imageFiles: File[];
    pageNumbers: number[];
  } | null>(null);
  const [showAmazonAssistant, setShowAmazonAssistant] = useState(false);
  const [amazonAssistantData, setAmazonAssistantData] = useState<{
    storyContent?: string;
    researchContent?: string;
    worldReport?: string;
    characterImage?: string;
    memorableImages?: string[];
    language?: 'ja' | 'en';
  } | null>(null);
  const [showCoverGenerator, setShowCoverGenerator] = useState(false);

  // マニュアルモード用ツール
  const tools = [
    { id: 'research', title: '企画リサーチャー', description: '市場調査とターゲット分析', icon: <Search className="w-5 h-5" />, color: 'bg-blue-500' },
    { id: 'world', title: '世界観ディガー', description: '舞台・キャラ・トーン設定', icon: <Globe className="w-5 h-5" />, color: 'bg-indigo-500' },
    { id: 'script', title: '物語脚本', description: 'プロット作成〜脚本執筆', icon: <FileText className="w-5 h-5" />, color: 'bg-purple-500' },
    { id: 'panel', title: 'コマ割りディレクター', description: '演出プランとコマ割り構成', icon: <Layout className="w-5 h-5" />, color: 'bg-pink-500' },
    { id: 'image', title: '画像ジェネレーター', description: '生成AIプロンプト作成', icon: <ImageIcon className="w-5 h-5" />, color: 'bg-rose-500' },
    { id: 'cover', title: '表紙生成', description: '書籍表紙の自動生成', icon: <ImageIcon className="w-5 h-5" />, color: 'bg-cyan-500' },
    { id: 'proof', title: '英語校正', description: '翻訳・グラマーチェック', icon: <Languages className="w-5 h-5" />, color: 'bg-orange-500' },
    { id: 'strategy', title: 'アマゾン戦略', description: 'Kindle販売・メタデータ戦略', icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-emerald-500' }
  ];

  // セミオートモードは無効化

  // amazon-assistant用のデータを収集
  const collectAmazonAssistantData = useCallback(() => {
    // ストーリー内容を取得
    let storyContent = '';
    if (typeof window !== 'undefined') {
      const storyOutputStr = localStorage.getItem('story_output');
      if (storyOutputStr) {
        try {
          const storyOutput = JSON.parse(storyOutputStr);
          storyContent = `タイトル: ${storyOutput.episodes?.[0]?.title || '無題'}\n`;
          storyContent += `あらすじ: ${storyOutput.episodes?.[0]?.summary || ''}\n`;
          storyContent += `ストーリー: ${storyOutput.episodes?.[0]?.story || ''}\n`;
          storyContent += `世界観設定: ${storyOutput.world_setting || ''}\n`;
          storyContent += `キャラクター:\n`;
          storyOutput.characters?.forEach((char: any) => {
            storyContent += `- ${char.name} (${char.role}): ${char.description || ''}\n`;
          });
        } catch (e) {
          console.error('Failed to parse story output:', e);
        }
      }
    }

    // リサーチ内容を取得
    let researchContent = '';
    if (researchData) {
      researchContent = `ジャンル: ${researchData.genre || ''}\n`;
      researchContent += `タイトル: ${researchData.title || ''}\n`;
      researchContent += `コンセプト: ${researchData.concept || ''}\n`;
      researchContent += `主人公のアイデア: ${researchData.protagonistIdea || ''}\n`;
      researchContent += `第1話のフック: ${researchData.firstEpisodeHook || ''}\n`;
    }

    // 世界観レポートを取得（world_settingから）
    let worldReport = '';
    if (typeof window !== 'undefined') {
      const storyOutputStr = localStorage.getItem('story_output');
      if (storyOutputStr) {
        try {
          const storyOutput = JSON.parse(storyOutputStr);
          worldReport = storyOutput.world_setting || '';
        } catch (e) {
          console.error('Failed to parse world setting:', e);
        }
      }
    }

    // 画像を取得（画像生成ツールから）
    let characterImage: string | undefined;
    let memorableImages: string[] = [];
    
    if (imageStudioData) {
      // キャラクター画像（最初のキャラクター画像を使用）
      if (imageStudioData.characterImages.length > 0) {
        characterImage = `data:${imageStudioData.characterImages[0].mimeType};base64,${imageStudioData.characterImages[0].data}`;
      }
    }
    
    // 印象的な画像（proofreadingから取得した画像ファイルから3枚を選択）
    if (proofreadingData && proofreadingData.imageFiles.length >= 3) {
      // 画像ファイルをbase64に変換
      const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };
      
      Promise.all([
        convertToBase64(proofreadingData.imageFiles[0]),
        convertToBase64(proofreadingData.imageFiles[1]),
        convertToBase64(proofreadingData.imageFiles[2]),
      ]).then(images => {
        memorableImages = images;
        
        // amazon-assistantへ遷移
        setAmazonAssistantData({
          storyContent,
          researchContent,
          worldReport,
          characterImage,
          memorableImages,
          language: imageStudioData?.target === 'EN' ? 'en' : 'ja',
        });
        setShowProofreading(false);
        setShowAmazonAssistant(true);
      });
      return;
    }

    // 画像がない場合でも遷移（マニュアルモード用）
    setAmazonAssistantData({
      storyContent,
      researchContent,
      worldReport,
      characterImage,
      memorableImages,
      language: imageStudioData?.target === 'EN' ? 'en' : 'ja',
    });
    setShowProofreading(false);
    setShowAmazonAssistant(true);
  }, [researchData, imageStudioData, proofreadingData]);

  const handlePanelConfigComplete = (selection: PanelLayoutSelection) => {
    setIsPanelModalOpen(false);
    // セミオートモードは無効化：この関数は使用されていません
  };

  // リサーチツールが表示されている場合は、それだけを表示
  if (showResearch) {
    return (
      <ResearchInterface 
        onClose={() => setShowResearch(false)}
        onComplete={(data) => {
          setResearchData(data);
          // セミオートモードを無効化：自動遷移しない
          // setShowResearch(false);
          // setShowWorldBuilding(true);
        }}
      />
    );
  }

  // 世界観ツールが表示されている場合は、それだけを表示
  if (showWorldBuilding) {
    return (
      <WorldBuildingInterface 
        onClose={() => setShowWorldBuilding(false)}
        initialData={researchData || undefined}
        onProceedToStory={(storyInput: {
          world_setting: string;
          characters: Array<{
            id: string;
            name: string;
            role: string;
            description: string;
          }>;
        }) => {
          setStoryInputData(storyInput);
          setShowWorldBuilding(false);
          setShowStory(true);
        }}
      />
    );
  }

  // ストーリーツールが表示されている場合は、それだけを表示
  if (showStory) {
    return (
      <StoryInterface 
        onClose={() => {
          setShowStory(false);
          setIsPanelSelectionModalOpen(false); // 閉じる時にモーダルも閉じる
        }}
        initialData={storyInputData || undefined}
        onComplete={(storyOutput) => {
          // ストーリー確定時の処理（次の工程へ進む準備）
          if (typeof window !== 'undefined') {
            localStorage.setItem('story_output', JSON.stringify(storyOutput, null, 2));
          }
          // マニュアルモードの場合は選択モーダルを表示
          if (mode === 'manual') {
            // キャラクター画像を取得してpanelInputDataに設定
            const imageRefsStr = localStorage.getItem('image_references');
            const imageRefs: Map<string, string> = new Map();
            if (imageRefsStr) {
              try {
                const refs = JSON.parse(imageRefsStr);
                Object.entries(refs).forEach(([id, img]) => {
                  imageRefs.set(id, img as string);
                });
              } catch (e) {
                console.error('Failed to parse image references:', e);
              }
            }
            setPanelInputData({
              storyData: storyOutput,
              characterImages: imageRefs,
            });
            setIsPanelSelectionModalOpen(true);
          }
        }}
        onProceedToPanel={(panelData) => {
          // コマ割りツール選択モーダルを表示
          setPanelInputData(panelData);
          setIsPanelSelectionModalOpen(true);
        }}
      />
    );
  }

  // コマ割りツールが表示されている場合
  if (showPanelTool && selectedPanelTool) {
    return (
      <PanelInterface
        toolType={selectedPanelTool}
        inputData={panelInputData}
        onClose={() => {
          setShowPanelTool(false);
          setSelectedPanelTool(null);
          setPanelInputData(null);
        }}
        mode={mode}
        onComplete={(outputData) => {
          // コマ割り生成完了後、対応する画像生成ツールへ進む
          setImageStudioData({
            toolType: selectedPanelTool,
            ...outputData,
          });
          setShowPanelTool(false);
          setShowImageStudio(true);
        }}
      />
    );
  }

  // 画像生成ツールが表示されている場合
  if (showImageStudio && imageStudioData) {
    return (
      <ImageStudioInterface
        data={imageStudioData}
        mode={mode}
        onClose={() => {
          setShowImageStudio(false);
          setImageStudioData(null);
        }}
        onComplete={(result) => {
          // j-manga-studio、bizmanga-studioの場合のみproofreadingへ進む
          if (imageStudioData.toolType === 'normal' || imageStudioData.toolType === 'business') {
            setProofreadingData(result);
            setShowImageStudio(false);
            setShowProofreading(true);
          }
          // youtube-manga-studioの場合はストップ（何もしない）
        }}
      />
    );
  }

  // proofreadingツールが表示されている場合
  if (showProofreading && proofreadingData) {
    // TODO: proofreadingツールのコンポーネントを表示
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => {
              setShowProofreading(false);
              setProofreadingData(null);
            }}
            className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            戻る
          </button>
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h1 className="text-3xl font-bold mb-4">英語校正 (Proofreading)</h1>
            <p className="text-gray-600 mb-4">
              proofreadingツールの実装は次のステップで行います。
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700 mb-2">
                画像ファイル数: {proofreadingData.imageFiles.length}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                ページ番号: {proofreadingData.pageNumbers.join(', ')}
              </p>
            </div>
            {/* セミオートモードは無効化 */}
          </div>
        </div>
      </div>
    );
  }

  // amazon-assistantツールが表示されている場合
  if (showAmazonAssistant) {
    return (
      <AmazonAssistantInterface
        initialData={amazonAssistantData || undefined}
        mode={mode}
        onClose={() => {
          setShowAmazonAssistant(false);
          setAmazonAssistantData(null);
        }}
      />
    );
  }

  // 表紙生成ツールが表示されている場合
  if (showCoverGenerator) {
    // 世界観レポートを取得（localStorageから）
    let worldviewReportText = '';
    if (typeof window !== 'undefined') {
      const worldReports = getAllReports().filter(r => r.type === 'world');
      if (worldReports.length > 0) {
        worldviewReportText = worldReports[worldReports.length - 1].content;
      }
    }

    return (
      <CoverGeneratorInterface
        onClose={() => setShowCoverGenerator(false)}
        initialWorldviewReport={worldviewReportText || undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors font-medium text-sm group">
            <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> ホームへ戻る
          </button>
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            {/* セミオートモードは無効化：常にマニュアルモード */}
          </div>
          <div className="text-xs text-slate-400 font-mono w-24 text-right truncate">{user.email}</div>
        </div>
      </header>

      <main className="flex-grow p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* APIキー管理パネル */}
          {showApiKeyPanel && (
            <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                  <Key className="w-6 h-6 text-indigo-600" />
                  <span>APIキー設定</span>
                </h2>
                <button
                  onClick={() => {
                    setShowApiKeyPanel(false);
                    setApiKeys(getAllApiKeys());
                  }}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-4">
                <ApiKeyManager 
                  onApiKeyChange={(type, key) => {
                    setApiKeys(getAllApiKeys());
                  }}
                  defaultType="default"
                  showAdvanced={true}
                />
              </div>
            </div>
          )}

          {/* 保存済みレポートパネル */}
          {showReportsPanel && (
            <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                  <Folder className="w-6 h-6 text-indigo-600" />
                  <span>保存済みレポート</span>
                </h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => downloadAllReportsAsZip()}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-bold text-sm"
                  >
                    <Package className="w-4 h-4" />
                    <span>一式ダウンロード</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowReportsPanel(false);
                      setSavedReports(getAllReports());
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* 企画レポート */}
                {savedReports.filter(r => r.type === 'research').length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="text-lg font-bold mb-3 text-teal-600">企画レポート ({savedReports.filter(r => r.type === 'research').length})</h3>
                    <div className="space-y-2">
                      {savedReports.filter(r => r.type === 'research').map(report => (
                        <div key={report.id} className="bg-white rounded-lg p-3 border border-slate-200 flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-sm">{report.title}</h4>
                            <p className="text-xs text-slate-500">
                              {new Date(report.createdAt).toLocaleString('ja-JP')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(report.content);
                                  setCopiedReportId(report.id);
                                  setTimeout(() => setCopiedReportId(null), 2000);
                                } catch (err) {
                                  console.error('Failed to copy:', err);
                                  alert('コピーに失敗しました。');
                                }
                              }}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-xs font-bold flex items-center space-x-1"
                            >
                              {copiedReportId === report.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>コピー済み</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>コピー</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                deleteReport(report.id);
                                setSavedReports(getAllReports());
                              }}
                              className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white text-xs font-bold"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 世界観レポート */}
                {savedReports.filter(r => r.type === 'world').length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="text-lg font-bold mb-3 text-blue-600">世界観レポート ({savedReports.filter(r => r.type === 'world').length})</h3>
                    <div className="space-y-2">
                      {savedReports.filter(r => r.type === 'world').map(report => (
                        <div key={report.id} className="bg-white rounded-lg p-3 border border-slate-200 flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-sm">{report.title}</h4>
                            <p className="text-xs text-slate-500">
                              {new Date(report.createdAt).toLocaleString('ja-JP')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setShowReportsPanel(false);
                                setShowWorldBuilding(true);
                              }}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-xs font-bold"
                            >
                              開く
                            </button>
                            <button
                              onClick={() => {
                                deleteReport(report.id);
                                setSavedReports(getAllReports());
                              }}
                              className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white text-xs font-bold"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ストーリーレポート */}
                {savedReports.filter(r => r.type === 'story').length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="text-lg font-bold mb-3 text-purple-600">ストーリーレポート ({savedReports.filter(r => r.type === 'story').length})</h3>
                    <div className="space-y-2">
                      {savedReports.filter(r => r.type === 'story').map(report => (
                        <div key={report.id} className="bg-white rounded-lg p-3 border border-slate-200 flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-sm">{report.title}</h4>
                            <p className="text-xs text-slate-500">
                              {new Date(report.createdAt).toLocaleString('ja-JP')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setShowReportsPanel(false);
                                setShowStory(true);
                              }}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-xs font-bold"
                            >
                              開く
                            </button>
                            <button
                              onClick={() => {
                                deleteReport(report.id);
                                setSavedReports(getAllReports());
                              }}
                              className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white text-xs font-bold"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* レポートがない場合 */}
                {savedReports.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Folder className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>保存されたレポートがありません。</p>
                    <p className="text-sm mt-1">各ツールでレポートを保存すると、ここに表示されます。</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* マニュアルモードの表示 */}
          {(
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <Wrench className="w-6 h-6 mr-2 text-slate-500" /> Manual Studio Tools
                  </h1>
                  <p className="text-slate-600 mt-1">各工程を個別に調整・制作するためのプロ向けツールキットです。</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setApiKeys(getAllApiKeys());
                      setShowApiKeyPanel(!showApiKeyPanel);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm shadow-md"
                  >
                    <Key className="w-4 h-4" />
                    <span>APIキー設定</span>
                    {apiKeys.default && (
                      <span className="ml-1 px-2 py-0.5 bg-purple-700 rounded text-xs">✓</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSavedReports(getAllReports());
                      setShowReportsPanel(!showReportsPanel);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm shadow-md"
                  >
                    <Folder className="w-4 h-4" />
                    <span>保存済みレポート ({savedReports.length})</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map((tool) => (
                  <button 
                    key={tool.id} 
                    onClick={() => {
                      if (tool.id === 'research') {
                        setShowResearch(true);
                      } else if (tool.id === 'world') {
                        // マニュアルモード：initialDataなしで世界観ツールを開く
                        setShowWorldBuilding(true);
                        setResearchData(null); // マニュアルモードなのでリサーチデータをクリア
                      } else if (tool.id === 'script') {
                        // マニュアルモード：ストーリーツールを開く
                        setShowStory(true);
                        setStoryInputData(null); // マニュアルモードなので初期データをクリア
                        setIsPanelSelectionModalOpen(false); // ストーリーツールを開く時はモーダルを閉じる
                      } else if (tool.id === 'panel') {
                        // マニュアルモード：コマ割りツール選択モーダルを表示
                        // ストーリー確定済みの場合はデータを取得、未確定の場合はnull
                        if (typeof window !== 'undefined') {
                          const storyOutputStr = localStorage.getItem('story_output');
                          if (storyOutputStr) {
                            try {
                              const storyOutput = JSON.parse(storyOutputStr);
                              const imageRefsStr = localStorage.getItem('image_references');
                              const imageRefs: Map<string, string> = new Map();
                              
                              if (imageRefsStr) {
                                try {
                                  const refs = JSON.parse(imageRefsStr);
                                  Object.entries(refs).forEach(([id, img]) => {
                                    imageRefs.set(id, img as string);
                                  });
                                } catch (e) {
                                  console.error('Failed to parse image references:', e);
                                }
                              }
                              
                              setPanelInputData({
                                storyData: storyOutput,
                                characterImages: imageRefs,
                              });
                            } catch (e) {
                              console.error('Failed to parse story output:', e);
                              setPanelInputData(null);
                            }
                          } else {
                            setPanelInputData(null);
                          }
                        } else {
                          setPanelInputData(null);
                        }
                        setIsPanelSelectionModalOpen(true);
                      } else if (tool.id === 'image') {
                        // マニュアルモード：画像生成ツール選択モーダルを表示
                        // まずコマ割りツールを選択してもらう必要がある
                        alert('画像生成ツールを使用するには、先にコマ割りツールで構成案を生成してください。');
                      } else if (tool.id === 'cover') {
                        // 表紙生成ツールを開く
                        setShowCoverGenerator(true);
                      } else if (tool.id === 'proof') {
                        // マニュアルモード：proofreadingツールを開く
                        // 画像ファイルとCSVファイルを手動でアップロードする必要がある
                        setShowProofreading(true);
                        setProofreadingData({
                          csvString: '',
                          imageFiles: [],
                          pageNumbers: [],
                        });
                      } else if (tool.id === 'strategy') {
                        // マニュアルモード：amazon-assistantツールを開く
                        setShowAmazonAssistant(true);
                        setAmazonAssistantData(null);
                      } else {
                        alert(`${tool.title} を開きます`);
                      }
                    }}
                    className="group bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:shadow-lg hover:border-indigo-300 transition-all text-left relative overflow-hidden"
                  >
                     <div className={`absolute top-0 left-0 right-0 h-1 ${tool.color}`}></div>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-lg ${tool.color} bg-opacity-10 text-opacity-100 text-slate-700`}>
                        <div className={tool.color.replace('bg-', 'text-')}>{tool.icon}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-700">{tool.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{tool.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* コマ割り選択モーダル */}
      <PanelSelectionModal 
        isOpen={isPanelModalOpen} 
        onClose={() => setIsPanelModalOpen(false)}
        onComplete={handlePanelConfigComplete}
      />

      {/* コマ割りツール選択モーダル（常に表示可能） */}
      <PanelToolSelectionModal
        isOpen={isPanelSelectionModalOpen}
        onClose={() => setIsPanelSelectionModalOpen(false)}
        onSelect={(toolType) => {
          // panelInputDataがnullの場合、localStorageからストーリーデータとキャラクター画像を取得
          if (!panelInputData && typeof window !== 'undefined') {
            const storyOutputStr = localStorage.getItem('story_output');
            const imageRefsStr = localStorage.getItem('image_references');
            
            if (storyOutputStr) {
              try {
                const storyOutput = JSON.parse(storyOutputStr);
                const imageRefs: Map<string, string> = new Map();
                
                if (imageRefsStr) {
                  try {
                    const refs = JSON.parse(imageRefsStr);
                    Object.entries(refs).forEach(([id, img]) => {
                      imageRefs.set(id, img as string);
                    });
                  } catch (e) {
                    console.error('Failed to parse image references:', e);
                  }
                }
                
                setPanelInputData({
                  storyData: storyOutput,
                  characterImages: imageRefs,
                });
              } catch (e) {
                console.error('Failed to parse story output:', e);
              }
            }
          }
          
          setSelectedPanelTool(toolType);
          setIsPanelSelectionModalOpen(false);
          setShowStory(false); // ストーリーツールが開いている場合は閉じる
          setShowPanelTool(true);
        }}
        mode={mode}
      />
    </div>
  );
};

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'manga'>('home');

  if (!user) return <LoginScreen onLoginSuccess={setUser} />;
  if (currentView === 'manga') return <MangaHubScreen user={user} onBack={() => setCurrentView('home')} />;
  return <HomeScreen user={user} onNavigateToManga={() => setCurrentView('manga')} onLogout={() => setUser(null)} />;
}
