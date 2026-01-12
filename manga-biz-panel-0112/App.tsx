import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { ResultTable } from './components/ResultTable';
import { ApiKeySettings } from './components/ApiKeySettings';
import { generateMangaPlan, analyzeScenario } from './services/geminiService';
import { MangaInput, CsvRow } from './types';
import { Sparkles, AlertTriangle, Loader2, XCircle, Settings, HelpCircle, Zap, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setUserApiKey(storedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };
  
  const [input, setInput] = useState<MangaInput>({
    title: '',
    target: 'JP',
    genre: 'ビジネス・自己啓発',
    pageCount: 8,
    characterImages: [],
    scenario: '',
    worldSettings: '',
    includeCover: false,
  });

  const [result, setResult] = useState<{ csvString: string; rows: CsvRow[] } | null>(null);

  const hasApiKey = !!(userApiKey || process.env.API_KEY);

  const executeGeneration = async () => {
    setError(null);
    if (!input.scenario) {
      setError("シナリオを入力してください。");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setIsSettingsOpen(false);

    try {
      const data = await generateMangaPlan(input, userApiKey);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "生成中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!hasApiKey) {
      setIsSettingsOpen(true);
      return;
    }
    executeGeneration();
  };

  const handleAnalyzeScenario = async () => {
    setError(null);
    if (!input.scenario) {
      setError("解析するには、まずシナリオを入力してください。");
      return;
    }

    if (!hasApiKey) {
       setIsSettingsOpen(true);
       return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeScenario(input.scenario, input.worldSettings, userApiKey);
      setInput(prev => ({ 
        ...prev, 
        pageCount: analysis.pageCount,
        genre: analysis.genre
      }));
    } catch (err: any) {
      setError(err.message || "シナリオの解析に失敗しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans relative">
      <ApiKeySettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentKey={userApiKey} 
        onSave={handleSaveApiKey}
      />

      {(isLoading || isAnalyzing) && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center flex-col">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full animate-ping opacity-75 bg-indigo-100"></div>
                <div className="relative bg-white p-4 rounded-full shadow-lg border-4 border-indigo-50">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-700" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
                {isLoading ? "ビジネス構成案を生成中..." : "シナリオを解析中..."}
            </h3>
            <p className="text-slate-500 text-center text-sm">
               Gemini 3.0 Pro を優先試行中...<br/>
               <span className="text-xs text-slate-400 mt-1 block">信頼と威厳のある構成を作成しています</span>
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-700 p-2 rounded-lg text-white shadow-md">
                <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg font-bold text-indigo-900 tracking-tight leading-none">
                  ビジネスコミック制作
                </h1>
                <span className="text-[10px] text-slate-500 font-medium">AI Art Director for Business Books</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors mr-2 ${
              hasApiKey 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
               {hasApiKey ? (
                 <>
                   <Zap className="w-3 h-3 fill-current" />
                   AI Ready (Gemini 3.0 Pro)
                 </>
               ) : (
                 <>
                   <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                   APIキー未設定
                 </>
               )}
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-colors relative group"
              title="APIキー設定"
            >
              <Settings className="w-5 h-5" />
              {!hasApiKey && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-grow">
                    <h3 className="font-bold text-red-800 text-sm">エラーが発生しました</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
                <button 
                    onClick={() => setError(null)} 
                    className="text-red-400 hover:text-red-600 transition-colors"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-4 h-full overflow-hidden flex flex-col">
            <InputForm 
                input={input} 
                setInput={setInput} 
                onSubmit={handleSubmit} 
                isLoading={isLoading}
                onAnalyze={handleAnalyzeScenario}
                isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-8 h-full overflow-hidden flex flex-col">
            {result ? (
              <ResultTable 
                csvString={result.csvString} 
                rows={result.rows} 
                target={input.target}
              />
            ) : (
              <div className="h-full bg-white rounded-xl border-2 border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 p-8">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative group">
                    <BookOpen className={`w-10 h-10 transition-colors duration-300 ${hasApiKey ? 'text-indigo-300' : 'text-slate-300'}`} />
                </div>
                <h2 className="text-lg font-bold text-slate-600 mb-2">準備完了</h2>
                <p className="text-sm text-center max-w-md leading-relaxed mb-6">
                    左側のパネルに書籍情報とシナリオを入力してください。<br/>
                    「伝え方が9割」のような、信頼と威厳のある<br/>
                    ビジネスコミック構成案を生成します。
                </p>
                {!hasApiKey && (
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-indigo-700 hover:text-indigo-900 text-sm font-medium underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-500 transition-all"
                  >
                    Gemini APIキーを設定する
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
