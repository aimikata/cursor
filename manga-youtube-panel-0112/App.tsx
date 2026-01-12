
import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { ResultTable } from './components/ResultTable';
import { generateMangaPlan, analyzeScenario } from './services/geminiService';
import { MangaInput, CsvRow } from './types';
import { AlertTriangle, Loader2, XCircle, MonitorPlay, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [input, setInput] = useState<MangaInput>({
    mangaTitle: '',
    genre: 'ビジネス・自己啓発',
    pageCount: 32,
    characterImages: [],
    scenario: '',
    worldSettings: '',
    channelConcept: '',
    includeCover: true,
  });

  const [result, setResult] = useState<{ csvString: string; rows: CsvRow[] } | null>(null);

  const executeGeneration = async () => {
    setError(null);
    if (!input.scenario) {
      setError("シナリオを入力してください。");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const data = await generateMangaPlan(input);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "生成中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    executeGeneration();
  };

  const handleAnalyzeScenario = async () => {
    setError(null);
    if (!input.scenario) {
      setError("解析するには、まずシナリオを入力してください。");
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeScenario(input.scenario, input.worldSettings);
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
      {(isLoading || isAnalyzing) && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center flex-col">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full animate-ping opacity-75 bg-indigo-100"></div>
                <div className="relative bg-white p-4 rounded-full shadow-lg border-4 border-indigo-50">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
                {isLoading ? "構成案を生成中..." : "シナリオを解析中..."}
            </h3>
            <p className="text-slate-500 text-center text-sm">
               Gemini 3 Pro で全編構成中...<br/>
               <span className="text-xs text-slate-400 mt-1 block">指定されたコンセプトに合わせて最適化しています</span>
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
                <MonitorPlay className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
                  マンガ動画ディレクター AI
                </h1>
                <span className="text-[10px] text-slate-500 font-medium">Professional Video Storyboard Planner</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors mr-2 bg-indigo-50 border-indigo-200 text-indigo-700`}>
               <Zap className="w-3 h-3 fill-current" />
               Gemini 3 Engine
            </div>
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
                target={'JP'}
              />
            ) : (
              <div className="h-full bg-white rounded-xl border-2 border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 p-8">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative group">
                    <MonitorPlay className={`w-10 h-10 text-indigo-300`} />
                </div>
                <h2 className="text-lg font-bold text-slate-600 mb-2">プロジェクトの準備</h2>
                <p className="text-sm text-center max-w-md leading-relaxed mb-6">
                    左側のパネルに演出方針や台本を入力してください。<br/>
                    YouTube動画編集に最適な、8:9スタック構成の指示書を自動生成します。
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
