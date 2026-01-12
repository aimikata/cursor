import React from 'react';
import { CharacterProfile } from '../types';

interface Props {
  title: string;
  character: CharacterProfile;
  onChange: (updated: CharacterProfile) => void;
}

const CharacterCard: React.FC<Props> = ({ title, character, onChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          ...character,
          imageData: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h3 className="text-sm font-bold text-blue-400 mb-3 uppercase tracking-wider">{title}</h3>
      
      <div className="flex gap-4">
        {/* Image Uploader */}
        <div className="shrink-0">
          <label className="block w-20 h-20 bg-gray-900 rounded-md border-2 border-dashed border-gray-600 hover:border-blue-500 cursor-pointer overflow-hidden relative flex items-center justify-center group">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {character.imageData ? (
              <img src={character.imageData} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-xs text-center px-1">画像選択</span>
            )}
            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-xs text-white">
              変更
            </div>
          </label>
        </div>

        {/* Text Details */}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={character.name}
            onChange={(e) => onChange({ ...character, name: e.target.value })}
            placeholder="キャラクター名"
            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <textarea
            value={character.description}
            onChange={(e) => onChange({ ...character, description: e.target.value })}
            placeholder="外見の特徴 (例: 青いスーツ、短髪)..."
            className="w-full h-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;