
import React, { useState } from 'react';
import { DetailedSetting, GeneratedImageData, CharacterSetting } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { DownloadIcon } from './icons';

interface CharacterVisualizerProps {
  setting: DetailedSetting;
  onGenerate: (character: CharacterSetting) => Promise<void>;
  generatedData: GeneratedImageData | null;
  isGenerating: boolean;
}

const CharacterVisualizer: React.FC<CharacterVisualizerProps> = ({ setting, onGenerate, generatedData, isGenerating }) => {
  const characters = [setting.protagonist, ...setting.rivals];
  const [selectedCharacterName, setSelectedCharacterName] = useState(characters[0].name);

  const handleGenerateClick = () => {
    const characterToGenerate = characters.find(c => c.name === selectedCharacterName);
    if (characterToGenerate) {
      onGenerate(characterToGenerate);
    }
  };

  const handleDownload = (base64: string, index: number) => {
    if (!generatedData) return;
    
    // 生成されたデータに含まれる名前を使用（選択肢の状態ではなく、実際に描画されているキャラ名に紐付ける）
    const characterName = generatedData.characterEnglishName || generatedData.characterName;
    // ファイル名として安全な形式に変換
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
                             <DownloadIcon className="w-4 h-4" />
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

export default CharacterVisualizer;
