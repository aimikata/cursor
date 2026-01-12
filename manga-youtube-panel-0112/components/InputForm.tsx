
// Added React import to provide access to its namespace types
import React, { useRef } from 'react';
import { GENRES } from '../constants';
import { MangaInput, CharacterImage, Genre } from '../types';
import { PenTool, Users, FileText, Layers, Wand2, Upload, X, Type, Sparkles, Loader2, MonitorPlay, Tv, Landmark } from 'lucide-react';

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
        <MonitorPlay className="w-6 h-6 text-indigo-600" />
        マンガ動画ディレクター
      </h2>

      <div className="space-y-5 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Metadata Section */}
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
           <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> 企画タイトル
              </label>
              <input
                type="text"
                placeholder="例: 未解決事件の謎 / 成功する起業家の習慣"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-600 font-bold text-sm"
                value={input.mangaTitle}
                onChange={(e) => handleChange('mangaTitle', e.target.value)}
              />
           </div>

           <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <Tv className="w-3.5 h-3.5" /> チャンネル名
                </label>
                <input
                  type="text"
                  placeholder="例: ミステリー・ラボ"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-600 text-sm"
                  value={input.channelName || ''}
                  onChange={(e) => handleChange('channelName', e.target.value)}
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> サムネ煽り文句
                </label>
                <input
                  type="text"
                  placeholder="例: 衝撃の結末 / 誰も知らない真実"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-600 text-sm"
                  value={input.catchphrase || ''}
                  onChange={(e) => handleChange('catchphrase', e.target.value)}
                />
             </div>
           </div>

           {/* Enlarged Channel Concept Section */}
           <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
              <label className="block text-[11px] font-black uppercase tracking-wider text-indigo-600 mb-2 flex items-center gap-1">
                <Landmark className="w-4 h-4" /> 演出方針・コンセプト（作風の核）
              </label>
              <textarea
                placeholder="例: 登場人物は全員スーツ。夜の都会を舞台にしたシリアスな画風。セリフよりも情景描写を重視。特定のブランドやアイテムをシンボルとして登場させる。"
                className="w-full border border-slate-200 rounded-lg p-3 text-sm h-36 resize-y bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed font-medium"
                value={input.channelConcept || ''}
                onChange={(e) => handleChange('channelConcept', e.target.value)}
              />
              <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                ※キャラクターの服装、背景の雰囲気、独自の演出ルールなどを詳しく書くと精度が上がります。
              </p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <Layers className="w-4 h-4" /> ジャンル
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              value={input.genre}
              onChange={(e) => handleChange('genre', e.target.value as Genre)}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4" /> スライド数
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={100}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                value={input.pageCount}
                onChange={(e) => handleChange('pageCount', parseInt(e.target.value))}
              />
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing || !input.scenario}
                className="px-2 py-1 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50"
              >
                自動解析
              </button>
            </div>
          </div>
        </div>

        {/* Characters */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            <Users className="w-4 h-4" /> キャラクター参照設定
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative">
            <input type="file" min={1} ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center gap-1 text-slate-400">
               <Upload className="w-6 h-6" />
               <span className="text-[10px]">メインキャラやサブキャラの画像を追加</span>
            </div>
          </div>
          {input.characterImages.length > 0 && (
            <div className="grid grid-cols-4 gap-1 mt-2">
              {input.characterImages.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded overflow-hidden border">
                  <img src={`data:${img.mimeType};base64,${img.base64}`} alt={img.name} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(img.id)} className="absolute top-0 right-0 p-0.5 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scenario */}
        <div className="flex-grow flex flex-col min-h-[300px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            <PenTool className="w-4 h-4" /> シナリオ・台本（全文）
          </label>
          <textarea
            className="w-full flex-grow border border-slate-300 rounded-lg p-3 text-sm font-mono leading-relaxed bg-slate-50 focus:bg-white transition-all"
            placeholder="ここに台本の全内容を貼り付けてください。Slide 1にサムネイル案を、Slide 2以降に本編の全構成を生成します。"
            value={input.scenario}
            onChange={(e) => handleChange('scenario', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={onSubmit}
          disabled={isLoading || !input.scenario}
          className={`w-full py-4 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${isLoading || !input.scenario ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] active:scale-95'}`}
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          全編構成案を生成する
        </button>
      </div>
    </div>
  );
};
