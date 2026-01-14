import React, { useState } from 'react';
import { CoverInput, WorldviewReport, GeneratedCover, CharacterImage } from '../types';
import { generateCoverImage } from '../services/geminiService';
import { CharacterImageUpload } from './CharacterImageUpload';

interface CoverGeneratorProps {
  apiKey: string;
  worldviewReport: WorldviewReport | null;
  defaultTitle?: string;
}

export const CoverGenerator: React.FC<CoverGeneratorProps> = ({
  apiKey,
  worldviewReport,
  defaultTitle = ''
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [genre, setGenre] = useState<'practical' | 'story' | 'auto'>('auto');
  const [customConcept, setCustomConcept] = useState('');
  const [characterImages, setCharacterImages] = useState<CharacterImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCover, setGeneratedCover] = useState<GeneratedCover | null>(null);

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('タイトルを入力してください。');
      return;
    }

    if (!apiKey) {
      setError('APIキーが設定されていません。');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCover(null);

    try {
      // 世界観レポートからキャラクター画像を取得
      const reportCharacterImages = worldviewReport?.characterImages?.map(img => ({
        name: img.characterName,
        data: img.imageData,
        mimeType: 'image/png'
      })) || [];

      // 手動でアップロードした画像と世界観レポートの画像を結合
      const allCharacterImages = [...characterImages, ...reportCharacterImages];

      const input: CoverInput = {
        title: title.trim(),
        genre,
        worldviewReport: worldviewReport || undefined,
        customConcept: customConcept.trim() || undefined,
        characterImages: allCharacterImages.length > 0 ? allCharacterImages : undefined
      };

      const result = await generateCoverImage(input, apiKey);
      
      setGeneratedCover({
        imageData: result.imageData,
        prompt: result.prompt,
        timestamp: Date.now()
      });
    } catch (err: any) {
      setError(err.message || '表紙生成に失敗しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCover) return;

    const link = document.createElement('a');
    link.href = generatedCover.imageData;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_')}_cover_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            タイトル *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="書籍のタイトルを入力"
            className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ジャンル
          </label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as 'practical' | 'story' | 'auto')}
            className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="auto">自動判定（世界観レポートから）</option>
            <option value="practical">実用・ビジネス</option>
            <option value="story">物語・エンタメ</option>
          </select>
        </div>

        {!worldviewReport && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              カスタムコンセプト（任意）
            </label>
            <textarea
              value={customConcept}
              onChange={(e) => setCustomConcept(e.target.value)}
              placeholder="表紙のデザインコンセプトを記述（例: 主人公が未来都市を背景に立っている）"
              rows={3}
              className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>
        )}

        <CharacterImageUpload
          onImagesChange={setCharacterImages}
          initialImages={characterImages}
        />

        {worldviewReport && (
          <div className="p-4 bg-indigo-900/20 border border-indigo-700 rounded-lg">
            <p className="text-xs text-indigo-300 mb-2">✓ 世界観レポートから情報を取得中</p>
            {worldviewReport.seriesTitle && (
              <p className="text-sm text-indigo-200">タイトル: {worldviewReport.seriesTitle}</p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !title.trim()}
        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-bold transition-all shadow-lg disabled:cursor-not-allowed"
      >
        {isGenerating ? '表紙を生成中...' : '表紙を生成'}
      </button>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {generatedCover && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={generatedCover.imageData}
              alt={`${title} の表紙`}
              className="w-full rounded-lg border-2 border-gray-700 shadow-2xl"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
            >
              画像をダウンロード
            </button>
            <button
              onClick={() => setGeneratedCover(null)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              再生成
            </button>
          </div>

          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer hover:text-gray-300">生成プロンプトを表示</summary>
            <pre className="mt-2 p-3 bg-gray-900/50 rounded text-xs overflow-auto">
              {generatedCover.prompt}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};
