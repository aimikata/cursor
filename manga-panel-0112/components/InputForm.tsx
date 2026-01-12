import React, { useRef } from 'react';
import { GENRES } from '../constants';
import { MangaInput, CharacterImage, MangaMode, Genre } from '../types';
import { Settings, PenTool, Users, FileText, Layers, Globe, Wand2, BookOpen, BookTemplate, Upload, X, Type, Book, List, Loader2, Sparkles, Hash, Quote, User } from 'lucide-react';

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

  const handleModeChange = (mode: MangaMode) => {
    setInput((prev) => ({
      ...prev,
      mode,
      // Auto-switch genre for convenience, but allow user to change back
      genre: mode === 'explanatory' ? 'ビジネス' : 'AIおまかせ'
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Split to remove data:image/png;base64, prefix
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
      
      // Reset input so same file can be selected again if needed
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
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
        <Settings className="w-5 h-5 text-indigo-600" />
        制作設定
      </h2>

      {/* Mode Selection Tabs */}
      <div className="bg-slate-100 p-1 rounded-lg flex mb-6">
        <button
          onClick={() => handleModeChange('story')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all ${
            input.mode === 'story'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Book className="w-4 h-4" />
          ストーリー漫画
        </button>
        <button
          onClick={() => handleModeChange('explanatory')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all ${
            input.mode === 'explanatory'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <List className="w-4 h-4" />
          解説・実用本
        </button>
      </div>

      <div className="space-y-5 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Book Metadata Section (Unified) */}
        <div className={`space-y-4 rounded-lg border p-4 ${input.mode === 'explanatory' ? 'bg-teal-50/50 border-teal-100' : 'bg-slate-50/50 border-slate-200'}`}>
           
           {/* Row 1: Main Title */}
           <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> 書籍タイトル (必須)
              </label>
              <input
                type="text"
                placeholder="例: 銀河の果てのレストラン"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
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
                  placeholder="例: 〜初心者がまず知るべき3つの法則〜"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={input.subtitle || ''}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> キャッチコピー (煽り文)
                </label>
                <input
                  type="text"
                  placeholder="例: 全米が泣いた、衝撃の結末！"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={input.catchphrase || ''}
                  onChange={(e) => handleChange('catchphrase', e.target.value)}
                />
             </div>
           </div>

           {/* Row 3: Author & Volume */}
           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
             <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> 著者名
                </label>
                <input
                  type="text"
                  placeholder="例: 山田タロウ"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-sm"
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
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={input.volume || ''}
                  onChange={(e) => handleChange('volume', e.target.value)}
                />
             </div>
           </div>

           {/* Row 4: Chapter Title */}
           <div>
              <label className="block text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-sm">重要</span>
                章タイトル (今回の生成範囲)
              </label>
              <input
                type="text"
                placeholder={input.mode === 'story' ? "例: 第3話「予期せぬ再会」" : "例: 第1章 原子の構造を知ろう"}
                className="w-full border border-indigo-200 bg-indigo-50/30 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
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
            <label className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${input.target === 'JP' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'hover:bg-slate-50'}`}>
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
            <label className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${input.target === 'EN' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'hover:bg-slate-50'}`}>
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
              <Layers className="w-4 h-4" /> ジャンル
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={input.pageCount}
                onChange={(e) => handleChange('pageCount', parseInt(e.target.value))}
              />
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing || !input.scenario}
                className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-sm transition-all whitespace-nowrap
                  ${!input.scenario 
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                  }
                  ${isAnalyzing ? 'opacity-70 cursor-wait' : ''}
                `}
                title="シナリオから自動解析"
              >
                <Wand2 className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? '解析中' : '解析'}
              </button>
            </div>
            
            {/* Include Cover Checkbox */}
            <label className="flex items-center gap-2 mt-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
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
            <Users className="w-4 h-4" /> キャラクター画像 (参照用)
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
          
          {/* Image Previews */}
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

        {/* World Settings (New) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> 世界観・企画設定 (任意)
          </label>
          <textarea
            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed h-20"
            placeholder="時代設定、世界観、キャラクターの裏設定などの補足情報をここに入力..."
            value={input.worldSettings || ''}
            onChange={(e) => handleChange('worldSettings', e.target.value)}
          />
        </div>

        {/* Scenario */}
        <div className="flex-grow flex flex-col min-h-[150px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            <PenTool className="w-4 h-4" /> シナリオ本文
          </label>
          <textarea
            className="w-full flex-grow border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed"
            placeholder={input.mode === 'explanatory' ? "解説内容、または「メンターと生徒の会話劇」などストーリー形式のテキストも可能です..." : "物語のシナリオ、ト書き、セリフを入力してください..."}
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
              : input.mode === 'explanatory'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              生成中 (Gemini 2.5)...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {input.mode === 'explanatory' ? '解説マンガ構成案を生成' : 'ストーリー構成案を生成'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};