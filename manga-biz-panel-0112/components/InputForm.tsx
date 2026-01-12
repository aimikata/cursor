import React, { useRef } from 'react';
import { GENRES } from '../constants';
import { MangaInput, CharacterImage, Genre } from '../types';
import { Settings, PenTool, Users, FileText, Layers, Globe, Wand2, BookTemplate, Upload, X, Type, Hash, Quote, User, Sparkles, Loader2, Briefcase } from 'lucide-react';

interface InputFormProps {
  input: MangaInput;
  setInput: React.Dispatch<React.SetStateAction<MangaInput>>;
  onSubmit: () => void;
  isLoading: boolean;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ 
  input, 
  setInput, 
  onSubmit, 
  isLoading,
  onAnalyze,
  isAnalyzing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof MangaInput, value: any) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];
          const newImage: CharacterImage = {
            id: Math.random().toString(36).substring(2, 11),
            file: file,
            base64: base64Data,
            mimeType: file.type,
            name: file.name
          };
          setInput(prev => ({
            ...prev,
            characterImages: [...prev.characterImages, newImage]
          }));
        };
        reader.readAsDataURL(file);
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setInput(prev => ({
      ...prev,
      characterImages: prev.characterImages.filter(img => img.id !== id)
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 border-b pb-2">
        <Briefcase className="w-5 h-5 text-indigo-700" />
        ビジネスコミック制作設定
      </h2>

      <div className="space-y-5 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Book Metadata Section */}
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
           
           {/* Row 1: Main Title */}
           <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> 書籍タイトル (必須)
              </label>
              <input
                type="text"
                placeholder="例: まんがでわかる 伝え方が9割"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-700 font-bold text-sm"
                value={input.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
           </div>

           {/* Row 2: Subtitle & Catchphrase */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <Quote className="w-3.5 h-3.5" /> サブタイトル
                </label>
                <input
                  type="text"
                  placeholder="例: NOをYESに変える技術"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-700 text-sm"
                  value={input.subtitle || ''}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 帯のキャッチコピー
                </label>
                <input
                  type="text"
                  placeholder="例: シリーズ累計100万部突破！"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-700 text-sm"
                  value={input.catchphrase || ''}
                  onChange={(e) => handleChange('catchphrase', e.target.value)}
                />
             </div>
           </div>

           {/* Row 3: Author & Volume */}
           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
             <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> 著者名・監修
                </label>
                <input
                  type="text"
                  placeholder="例: 佐々木圭一 / 漫画：〇〇"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-700 text-sm"
                  value={input.author || ''}
                  onChange={(e) => handleChange('author', e.target.value)}
                />
             </div>
             <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> 巻数
                </label>
                <input
                  type="text"
                  placeholder="例: 第1巻"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-700 text-sm"
                  value={input.volume || ''}
                  onChange={(e) => handleChange('volume', e.target.value)}
                />
             </div>
           </div>

           {/* Row 4: Chapter Title */}
           <div>
              <label className="block text-xs font-bold text-indigo-800 mb-1 flex items-center gap-1">
                <span className="bg-indigo-700 text-white text-[10px] px-1.5 py-0.5 rounded-sm">重要</span>
                章タイトル (今回の生成範囲)
              </label>
              <input
                type="text"
                placeholder="例: 第1章 なぜ、あなたの言葉は届かないのか？"
                className="w-full border border-indigo-200 bg-indigo-50/30 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-700 font-bold text-sm"
                value={input.chapterTitle || ''}
                onChange={(e) => handleChange('chapterTitle', e.target.value)}
              />
           </div>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            <Globe className="w-4 h-4" /> ターゲット読者（出力言語）
          </label>
          <div className="flex gap-4">
            <label className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${input.target === 'JP' ? 'bg-indigo-50 border-indigo-700 ring-1 ring-indigo-700' : 'hover:bg-slate-50'}`}>
              <input
                type="radio"
                name="target"
                className="hidden"
                checked={input.target === 'JP'}
                onChange={() => handleChange('target', 'JP')}
              />
              <div className="text-center font-bold text-slate-800">日本向け (JP)</div>
              <div className="text-xs text-center text-slate-500 mt-1">日本語ヘッダー + 英語描写</div>
            </label>
            <label className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${input.target === 'EN' ? 'bg-indigo-50 border-indigo-700 ring-1 ring-indigo-700' : 'hover:bg-slate-50'}`}>
              <input
                type="radio"
                name="target"
                className="hidden"
                checked={input.target === 'EN'}
                onChange={() => handleChange('target', 'EN')}
              />
              <div className="text-center font-bold text-slate-800">英語圏向け (EN)</div>
              <div className="text-xs text-center text-slate-500 mt-1">Full English Output</div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <Layers className="w-4 h-4" /> カテゴリ
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-700 focus:border-indigo-700"
              value={input.genre}
              onChange={(e) => handleChange('genre', e.target.value as Genre)}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Page Count */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4" /> ページ数
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={50}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-700 focus:border-indigo-700"
                value={input.pageCount}
                onChange={(e) => handleChange('pageCount', parseInt(e.target.value))}
              />
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing || !input.scenario}
                className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-sm transition-all whitespace-nowrap
                  ${!input.scenario 
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                  }
                  ${isAnalyzing ? 'opacity-70 cursor-wait' : ''}
                `}
                title="シナリオから自動解析"
              >
                <Wand2 className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? '解析中' : '解析'}
              </button>
            </div>
            
            <label className="flex items-center gap-2 mt-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-indigo-700 rounded border-slate-300 focus:ring-indigo-700"
                checked={input.includeCover}
                onChange={(e) => handleChange('includeCover', e.target.checked)}
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors flex items-center gap-1">
                <BookTemplate className="w-3.5 h-3.5" />
                表紙/章扉を含める
              </span>
            </label>
          </div>
        </div>

        {/* Characters (File Upload) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            <Users className="w-4 h-4" /> キャラクター画像 (メンター/主人公)
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative">
            <input
               type="file"
               ref={fileInputRef}
               onChange={handleFileChange}
               accept="image/*"
               multiple
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2 text-slate-400">
               <Upload className="w-8 h-8" />
               <span className="text-xs">クリックして画像をアップロード<br/>(ファイル名が識別に使用されます)</span>
            </div>
          </div>
          
          {input.characterImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {input.characterImages.map((img) => (
                <div key={img.id} className="relative group rounded-md overflow-hidden border border-slate-200 bg-slate-50">
                  <img 
                    src={`data:${img.mimeType};base64,${img.base64}`} 
                    alt={img.name}
                    className="w-full h-16 object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="text-white bg-red-500/80 p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] truncate px-1 py-0.5">
                    {img.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* World Settings */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            <Settings className="w-4 h-4" /> 企画背景・補足 (任意)
          </label>
          <textarea
            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-700 focus:border-indigo-700 font-mono text-sm leading-relaxed h-20"
            placeholder="「30代の営業マンがターゲット」「信頼感を重視したい」など..."
            value={input.worldSettings || ''}
            onChange={(e) => handleChange('worldSettings', e.target.value)}
          />
        </div>

        {/* Scenario */}
        <div className="flex-grow flex flex-col min-h-[150px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            <PenTool className="w-4 h-4" /> シナリオ・解説内容
          </label>
          <textarea
            className="w-full flex-grow border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-700 focus:border-indigo-700 font-mono text-sm leading-relaxed"
            placeholder="解説したい内容、またはメンターと主人公の会話形式のテキストを入力してください。AIが自動的に「課題→解決→変化」の構成に再構築します。"
            value={input.scenario}
            onChange={(e) => handleChange('scenario', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={onSubmit}
          disabled={isLoading || !input.scenario}
          className={`w-full py-3 px-4 rounded-lg text-white font-bold shadow-md transition-all flex items-center justify-center gap-2
            ${isLoading || !input.scenario 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-indigo-700 hover:bg-indigo-800 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              構成案を生成中...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              ビジネス漫画構成案を生成
            </>
          )}
        </button>
      </div>
    </div>
  );
};
