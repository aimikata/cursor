'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  WorldGenerationResult, 
  SelectedCharacterImage, 
  StoryGenerationData, 
  ImageReferenceMap 
} from '@/app/lib/world/types';
import { ArrowLeft, Upload, Check, X, Download, FileText, Image as ImageIcon, ChevronRight } from 'lucide-react';

interface CharacterSelectionInterfaceProps {
  worldData: WorldGenerationResult;
  onComplete: (storyData: StoryGenerationData, imageRefs: ImageReferenceMap) => void;
  onClose?: () => void;
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

export const CharacterSelectionInterface: React.FC<CharacterSelectionInterfaceProps> = ({
  worldData,
  onComplete,
  onClose,
  onProceedToStory,
}) => {
  const [selectedImages, setSelectedImages] = useState<Map<string, SelectedCharacterImage>>(new Map());
  const [uploadedImages, setUploadedImages] = useState<Map<string, string>>(new Map());
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // 画像選択処理
  const handleImageSelect = useCallback((characterId: string, imageIndex: number, imagePath: string) => {
    setSelectedImages(prev => {
      const newMap = new Map(prev);
      newMap.set(characterId, {
        characterId,
        selectedImage: imagePath,
        isUploaded: false,
      });
      return newMap;
    });
  }, []);

  // 画像アップロード処理
  const handleImageUpload = useCallback((characterId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setUploadedImages(prev => {
        const newMap = new Map(prev);
        newMap.set(characterId, base64);
        return newMap;
      });
      setSelectedImages(prev => {
        const newMap = new Map(prev);
        newMap.set(characterId, {
          characterId,
          selectedImage: base64,
          isUploaded: true,
        });
        return newMap;
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // ファイル選択ダイアログを開く
  const handleUploadClick = useCallback((characterId: string) => {
    const input = fileInputRefs.current.get(characterId);
    if (input) {
      input.click();
    }
  }, []);

  // アップロード画像を削除
  const handleRemoveUpload = useCallback((characterId: string) => {
    setUploadedImages(prev => {
      const newMap = new Map(prev);
      newMap.delete(characterId);
      return newMap;
    });
    setSelectedImages(prev => {
      const newMap = new Map(prev);
      newMap.delete(characterId);
      return newMap;
    });
  }, []);

  // 全キャラクターの画像が選択されているかチェック
  const allCharactersSelected = worldData.characters.every(char => 
    selectedImages.has(char.id)
  );

  // データ整形と確定処理
  const handleConfirm = useCallback(() => {
    if (!allCharactersSelected) {
      alert('すべてのキャラクターの画像を選択してください。');
      return;
    }

    // ストーリー生成用データ（テキストのみ）
    const storyData: StoryGenerationData = {
      world_setting: worldData.world_setting,
      characters: worldData.characters.map(char => ({
        id: char.id,
        name: char.name,
        role: char.role,
        description: char.description,
        // 画像フィールドは除外
      })),
    };

    // 画像参照マップ（コマ割り・作画用）
    const imageRefs: ImageReferenceMap = {};
    selectedImages.forEach((selected, characterId) => {
      imageRefs[characterId] = selected.selectedImage;
    });

    // データをJSONファイルとしてダウンロード（開発用）
    const storyJson = JSON.stringify(storyData, null, 2);
    const imageRefsJson = JSON.stringify(imageRefs, null, 2);

    // ブラウザのローカルストレージに保存（本番ではAPIに送信）
    if (typeof window !== 'undefined') {
      localStorage.setItem('story_generation_data', storyJson);
      localStorage.setItem('image_references', imageRefsJson);
    }

    // 親コンポーネントにデータを渡す
    onComplete(storyData, imageRefs);
    
    // ストーリー生成ツールへ進む（セミオートモード）
    if (onProceedToStory) {
      const storyInput = {
        world_setting: storyData.world_setting,
        characters: storyData.characters,
      };
      onProceedToStory(storyInput);
    }
  }, [worldData, selectedImages, allCharactersSelected, onComplete]);

  // JSONファイルをダウンロード
  const handleDownloadJson = useCallback((data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">
      <div className="max-w-7xl mx-auto p-4 sm:p-12">
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-12 border-b border-gray-900 pb-8">
          <div className="flex items-center space-x-8">
            <div className="p-6 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/30">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
                Character <span className="text-indigo-600">Selection</span>
              </h1>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.6em] mt-3">
                Select Master Images for Each Character
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            {onClose && (
              <button 
                onClick={onClose}
                className="px-10 py-4 rounded-full bg-gray-900 hover:bg-gray-800 text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-gray-800 flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>戻る</span>
              </button>
            )}
          </div>
        </header>

        {/* 説明 */}
        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6 mb-12">
          <p className="text-gray-300 leading-relaxed">
            各キャラクターの候補画像から<strong className="text-indigo-400">ベストな1枚を選択</strong>してください。
            気に入らない場合は、ローカルから画像をアップロードして差し替えることもできます。
            すべてのキャラクターの画像を選択したら、「設定を確定して次へ」ボタンをクリックしてください。
          </p>
        </div>

        {/* キャラクター選択カード */}
        <div className="space-y-12">
          {worldData.characters.map((character, charIndex) => {
            const selected = selectedImages.get(character.id);
            const uploadedImage = uploadedImages.get(character.id);
            const candidateImages = character.candidate_images || [];

            return (
              <div 
                key={character.id}
                className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl"
              >
                {/* キャラクター情報ヘッダー */}
                <div className="bg-gradient-to-r from-indigo-950 via-gray-900 to-indigo-950 p-8 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">
                        {character.role}
                      </p>
                      <h3 className="text-3xl font-black text-white">{character.name}</h3>
                      <p className="text-gray-400 mt-2 text-sm">{character.description}</p>
                    </div>
                    {selected && (
                      <div className="flex items-center space-x-2 bg-green-600/20 px-4 py-2 rounded-full border border-green-500/30">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-bold text-sm">選択済み</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 画像選択エリア */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* 候補画像 */}
                    {candidateImages.map((imagePath, index) => {
                      const isSelected = selected?.selectedImage === imagePath && !selected.isUploaded;
                      return (
                        <div
                          key={index}
                          onClick={() => handleImageSelect(character.id, index, imagePath)}
                          className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                            isSelected
                              ? 'border-indigo-500 shadow-2xl shadow-indigo-500/50 scale-105'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <img 
                            src={imagePath} 
                            alt={`${character.name} candidate ${index + 1}`}
                            className="w-full h-auto"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                              <div className="bg-indigo-600 rounded-full p-3">
                                <Check className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white uppercase tracking-widest border border-white/20">
                            #{index + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* アップロードエリア */}
                  <div className="mt-6 border-t border-gray-800 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        または、画像をアップロード
                      </p>
                      {uploadedImage && (
                        <button
                          onClick={() => handleRemoveUpload(character.id)}
                          className="flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm"
                        >
                          <X className="w-4 h-4" />
                          <span>アップロードを削除</span>
                        </button>
                      )}
                    </div>
                    
                    {uploadedImage ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-2xl shadow-indigo-500/50">
                        <img 
                          src={uploadedImage} 
                          alt={`${character.name} uploaded`}
                          className="w-full h-auto"
                        />
                        <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                          <div className="bg-indigo-600 rounded-full p-3">
                            <Check className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 bg-green-600/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white uppercase tracking-widest">
                          アップロード済み
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUploadClick(character.id)}
                        className="w-full p-8 border-2 border-dashed border-gray-700 rounded-2xl hover:border-indigo-500 hover:bg-indigo-900/10 transition-all flex flex-col items-center justify-center space-y-4"
                      >
                        <Upload className="w-12 h-12 text-gray-500" />
                        <span className="text-gray-400 font-bold">画像をアップロード</span>
                        <span className="text-xs text-gray-600">PNG, JPG形式に対応</span>
                      </button>
                    )}

                    {/* 隠しファイル入力 */}
                    <input
                      ref={(el) => {
                        if (el) fileInputRefs.current.set(character.id, el);
                      }}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(character.id, file);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 確定ボタンエリア */}
        <div className="mt-16 bg-gray-900/90 p-8 rounded-[2.5rem] border border-gray-800 sticky bottom-4 z-20 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                allCharactersSelected 
                  ? 'bg-green-600/20 border border-green-500/30' 
                  : 'bg-yellow-600/20 border border-yellow-500/30'
              }`}>
                {allCharactersSelected ? (
                  <>
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-bold text-sm">
                      {worldData.characters.length} / {worldData.characters.length} キャラクター選択済み
                    </span>
                  </>
                ) : (
                  <span className="text-yellow-400 font-bold text-sm">
                    {selectedImages.size} / {worldData.characters.length} キャラクター選択済み
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const storyData: StoryGenerationData = {
                    world_setting: worldData.world_setting,
                    characters: worldData.characters.map(char => ({
                      id: char.id,
                      name: char.name,
                      role: char.role,
                      description: char.description,
                    })),
                  };
                  handleDownloadJson(storyData, 'story_context.json');
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-all text-white"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-bold">ストーリー用データをダウンロード</span>
              </button>
              <button
                onClick={handleConfirm}
                disabled={!allCharactersSelected}
                className={`flex items-center space-x-4 px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
                  allCharactersSelected
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-600/30 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>設定を確定して次へ</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
