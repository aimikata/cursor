import React, { useState, useRef } from 'react';
import { CharacterImage } from '../types';

interface CharacterImageUploadProps {
  onImagesChange: (images: CharacterImage[]) => void;
  initialImages?: CharacterImage[];
}

export const CharacterImageUpload: React.FC<CharacterImageUploadProps> = ({
  onImagesChange,
  initialImages = []
}) => {
  const [images, setImages] = useState<CharacterImage[]>(initialImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: CharacterImage[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} は画像ファイルではありません。`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newImage: CharacterImage = {
          name: file.name.replace(/\.[^/.]+$/, ''), // 拡張子を除去
          data: dataUrl,
          mimeType: file.type
        };

        newImages.push(newImage);

        // すべてのファイルを読み込んだら更新
        if (newImages.length === Array.from(files).length) {
          const updatedImages = [...images, ...newImages];
          setImages(updatedImages);
          onImagesChange(updatedImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          キャラクター画像（参照用・任意）
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
        >
          画像を追加
        </button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.data}
                alt={img.name}
                className="w-full h-32 object-cover rounded-lg border border-gray-600"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                title="削除"
              >
                ×
              </button>
              <p className="text-xs text-gray-400 mt-1 truncate">{img.name}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        キャラクター画像を追加すると、表紙デザインの参照として使用されます。
        物語系の表紙で特に有効です。
      </p>
    </div>
  );
};
