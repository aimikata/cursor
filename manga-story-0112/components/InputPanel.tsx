
import React, { useCallback, useState } from 'react';
import { PersonIcon } from './PersonIcon';
import { CatIcon } from './CatIcon';
import type { GenerationMode, Character } from '../types';

interface CharacterEditorProps {
  character: Character;
  onCharacterChange: (update: Partial<Character>) => void;
  onRemove: () => void;
  icon: React.ReactNode;
  canRemove: boolean;
  isLocked: boolean;
}

const CharacterEditor: React.FC<CharacterEditorProps> = ({ character, onCharacterChange, onRemove, icon, canRemove, isLocked }) => {
  const [isImageLoading, setIsImageLoading] = useState(false);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setIsImageLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
        onCharacterChange({ image: reader.result as string, imageMimeType: file.type });
        setIsImageLoading(false);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className={`bg-gray-900 p-4 rounded-lg flex gap-4 relative transition-opacity ${isLocked ? 'opacity-70' : ''}`}>
      {canRemove && (
        <button onClick={onRemove} disabled={isLocked} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors z-10 p-1 rounded-full bg-gray-800/50 hover:bg-gray-700/80 disabled:opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}
      <div className="flex-shrink-0 w-24">
         <label htmlFor={`file-upload-${character.name.replace(/\s+/g, '-')}`} className={`group block w-24 h-24 bg-gray-800 rounded-md border border-dashed border-gray-700 hover:border-pink-500 transition-colors relative ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
           {isImageLoading ? (
               <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-md">
                 <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               </div>
            ) : character.image ? (
              <img src={character.image} alt={character.name} className="w-full h-full object-cover rounded-md" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 group-hover:text-pink-400 transition-colors text-center p-1">
                 <div className="w-8 h-8">{icon}</div>
                 <span className="text-[10px] mt-1">画像を<br/>アップ</span>
              </div>
            )}
         </label>
         <input id={`file-upload-${character.name.replace(/\s+/g, '-')}`} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} disabled={isImageLoading || isLocked} />
      </div>
      <div className="flex-grow flex flex-col">
        <input type="text" value={character.name} onChange={e => onCharacterChange({ name: e.target.value })} className="font-bold text-lg text-pink-300 bg-transparent focus:outline-none focus:ring-0 w-full mb-1 p-0 border-b border-transparent focus:border-pink-500 transition-colors" placeholder="名前" disabled={isLocked} />
        <textarea value={character.role} onChange={e => onCharacterChange({ role: e.target.value })} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 resize-none text-xs focus:ring-1 focus:ring-pink-500 flex-grow" placeholder="役割・動機・過去の出来事など..." disabled={isLocked} />
      </div>
    </div>
  );
};

interface InputPanelProps {
  generationMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  worldSetting: string;
  onWorldSettingChange: (value: string) => void;
  storyTheme: string;
  onStoryThemeChange: (value: string) => void;
  seriesTitle?: string;
  onSeriesTitleChange?: (value: string) => void;
  chapterTitle?: string;
  onChapterTitleChange?: (value: string) => void;
  tocList?: string;
  onTocListChange?: (value: string) => void;
  characters: Character[];
  onCharacterChange: (index: number, updatedCharacter: Partial<Character>) => void;
  onAddCharacter: () => void;
  onRemoveCharacter: (index: number) => void;
  episodeTitles: string[];
  onEpisodeTitleChange: (index: number, title: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isGeneratingTitles: boolean;
  onGenerateTitles: () => void;
  isSeriesStarted: boolean;
  isSeriesComplete?: boolean;
  latestSummary: string;
  onSummaryChange: (newSummary: string) => void;
  onReset: () => void;
  onSave: () => void;
  onLoad: () => void;
  isAlertVisible: boolean;
  onDismissAlert: () => void;
  optimalEpisodeCount: number | null;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  generationMode, onModeChange, worldSetting, onWorldSettingChange, storyTheme, onStoryThemeChange,
  seriesTitle = '', onSeriesTitleChange = (_: string) => {}, chapterTitle = '', onChapterTitleChange = (_: string) => {},
  tocList = '', onTocListChange = (_: string) => {}, characters, onCharacterChange, onAddCharacter, onRemoveCharacter,
  episodeTitles, onEpisodeTitleChange, onGenerate, isLoading, isGeneratingTitles, onGenerateTitles,
  isSeriesStarted, isSeriesComplete = false, latestSummary, onSummaryChange, onReset, onSave, onLoad,
  isAlertVisible, onDismissAlert, optimalEpisodeCount,
}) => {
  const isSettingsEmpty = !worldSetting.trim() || characters.length === 0 || (generationMode === 'chapter' ? (!seriesTitle.trim() || !chapterTitle.trim() || !tocList.trim()) : !storyTheme.trim());
  const isGenerateDisabled = isLoading || isGeneratingTitles || isSettingsEmpty;
  const isLocked = generationMode === 'series' && isSeriesStarted;

  return (
    <div className="flex flex-col bg-gray-800 rounded-xl shadow-2xl p-6 h-full border border-gray-700">
       <div className="flex-grow overflow-y-auto custom-scrollbar -mr-4 pr-4">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-400 tracking-tighter uppercase">物語構築パネル</h3>
              <div className="flex items-center gap-2">
                <button onClick={onSave} className="text-xs font-bold text-gray-300 bg-gray-700/80 hover:bg-gray-700 px-3 py-1.5 rounded-md border border-gray-600 transition-all">保存</button>
                <button onClick={onLoad} className="text-xs font-bold text-gray-300 bg-gray-700/80 hover:bg-gray-700 px-3 py-1.5 rounded-md border border-gray-600 transition-all">読込</button>
                <button onClick={onReset} className="text-xs font-bold text-gray-500 hover:text-white px-3 py-1.5 transition-all">新規</button>
              </div>
          </div>

          <div className="bg-gray-900/50 p-1 rounded-xl grid grid-cols-3 gap-1 border border-gray-700">
            {['series', 'oneshot', 'chapter'].map((mode) => (
              <button key={mode} onClick={() => onModeChange(mode as GenerationMode)} disabled={isLocked} className={`py-2 text-[10px] md:text-xs font-black rounded-lg transition-all uppercase tracking-widest ${generationMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 disabled:opacity-30'}`}>
                {mode === 'series' ? '連載モード' : mode === 'oneshot' ? '短編モード' : 'マスター形式'}
              </button>
            ))}
          </div>
          
          <div className={isLocked ? 'opacity-70' : ''}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-cyan-500"></div>
              <h3 className="text-sm font-black text-cyan-400 tracking-widest">1. 世界観とルール設定</h3>
            </div>
            <textarea 
              value={worldSetting} 
              onChange={(e) => onWorldSettingChange(e.target.value)} 
              placeholder={`【核心ルール】: 魔法が科学を凌駕した世界\n【社会体制】: 4つの浮遊大陸による均衡\n【制約】: 魔法の使用には"感情"の対価が必要...`} 
              className="w-full h-32 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300 focus:ring-2 focus:ring-cyan-500/50 outline-none resize-none font-serif text-sm leading-relaxed" 
              disabled={isLocked} 
            />
          </div>
          
          <div className={isLocked ? 'opacity-70' : ''}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-pink-500"></div>
              <h3 className="text-sm font-black text-pink-400 tracking-widest">2. 登場人物の設定</h3>
            </div>
            <div className="space-y-3">
              {characters.map((character, index) => (
                <CharacterEditor key={index} character={character} onCharacterChange={(update) => onCharacterChange(index, update)} onRemove={() => onRemoveCharacter(index)} icon={index % 2 === 0 ? <PersonIcon className="w-6 h-6"/> : <CatIcon className="w-6 h-6"/>} canRemove={characters.length > 1} isLocked={isLocked} />
              ))}
              <button onClick={onAddCharacter} className="w-full py-2 bg-gray-700/50 text-gray-400 text-xs font-bold rounded-lg border border-dashed border-gray-600 hover:border-pink-500 hover:text-pink-400 transition-all" disabled={isLocked}>+ キャラクターを追加</button>
            </div>
          </div>

          <div className="space-y-6">
               <div className={isLocked ? 'opacity-70' : ''}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-purple-500"></div>
                    <h3 className="text-sm font-black text-purple-400 tracking-widest">3. 連載テーマ / 未回収リスト</h3>
                  </div>
                  {generationMode === 'chapter' ? (
                    <input type="text" value={seriesTitle} onChange={(e) => onSeriesTitleChange(e.target.value)} placeholder="例: 聖刻のアルケミスト Vol.1" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300 focus:ring-2 focus:ring-purple-500/50 outline-none text-sm font-serif" />
                  ) : (
                    <textarea value={storyTheme} onChange={(e) => onStoryThemeChange(e.target.value)} placeholder={`【物語の終着点】: 離れ離れの兄妹が再会し、世界を救う\n【未回収リスト・伏線】:\n- 第1章: 故郷の崩壊 [未]\n- 第2章: 謎の守護者との遭遇 [未]`} className="w-full h-32 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none text-sm font-serif leading-relaxed" disabled={isLocked} />
                  )}
               </div>

               {generationMode === 'chapter' && (
                 <>
                   <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-6 bg-purple-500"></div>
                        <h3 className="text-sm font-black text-purple-400 tracking-widest">4. 章のタイトル</h3>
                      </div>
                      <input type="text" value={chapterTitle} onChange={(e) => onChapterTitleChange(e.target.value)} placeholder="例: 第1章：運命の胎動" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300 focus:ring-2 focus:ring-purple-500/50 outline-none text-sm font-serif" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-6 bg-purple-500"></div>
                        <h3 className="text-sm font-black text-purple-400 tracking-widest">5. 構成案（ドラフト）</h3>
                      </div>
                      <textarea value={tocList} onChange={(e) => onTocListChange(e.target.value)} placeholder={`- 物語パート: 主人公が魔王軍の襲撃を受け、秘められた力を覚醒させる。\n- 解析パート: 覚醒した魔力の仕組みと、古代魔法との共通点。`} className="w-full h-48 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none text-xs font-serif leading-relaxed" />
                   </div>
                 </>
               )}
          </div>

          {generationMode === 'series' && (
            <div className={isLocked ? 'opacity-90' : ''}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-teal-500"></div>
                  <h3 className="text-sm font-black text-teal-400 tracking-widest">4. 各章のサブタイトル案</h3>
                </div>
                {!isLocked && (
                  <button onClick={onGenerateTitles} disabled={isLoading || isGeneratingTitles} className="text-[10px] font-black text-gray-400 hover:text-teal-400 flex items-center gap-1 transition-all">
                    AIで案を作成
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {episodeTitles.map((title, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-600 w-8 shrink-0">{String(index+1).padStart(2, '0')}</span>
                    <input type="text" value={title} onChange={(e) => onEpisodeTitleChange(index, e.target.value)} placeholder={`第${index+1}章のタイトル...`} className={`w-full bg-gray-900/50 border rounded-lg p-2 text-xs text-gray-300 outline-none focus:ring-1 focus:ring-teal-500 ${isLocked ? 'border-gray-800' : 'border-gray-700'}`} disabled={isLocked} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 pt-6">
        <button onClick={onGenerate} disabled={isGenerateDisabled} className={`w-full py-5 text-white font-black rounded-2xl shadow-2xl transform transition-all flex items-center justify-center gap-3 group ${isGenerateDisabled ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:scale-[1.02] active:scale-[0.98] shadow-indigo-500/20'}`}>
          {isLoading ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          )}
          <span className="tracking-[0.2em] uppercase text-sm">
            {isLoading ? '執筆中...' : '物語を生成する'}
          </span>
        </button>
        <div className="mt-3 flex justify-between items-center px-1">
          <span className="text-[9px] text-gray-600 font-black uppercase tracking-tighter">AIアーキテクト・モード</span>
          <span className="text-[9px] text-cyan-500 font-black uppercase tracking-tighter">最大 18,000 文字出力</span>
        </div>
      </div>
    </div>
  );
};
