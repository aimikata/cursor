'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getApiKey } from '@/app/lib/api-keys';

// 世界観レポートの型定義（簡易版）
interface WorldviewReport {
  seriesTitle?: string;
  volumes?: Array<{
    volumeNumber: number;
    title: string;
    summary?: string;
  }>;
  worldview?: {
    coreRule?: {
      name?: string;
    };
    keyLocations?: Array<{
      name?: string;
    }>;
  };
  protagonist?: {
    name?: string;
    visualTags?: string;
  };
  artStyleTags?: string;
  backgroundTags?: string;
  characterImages?: Array<{
    characterName: string;
    imageData: string;
  }>;
}

interface CoverGeneratorInterfaceProps {
  onClose: () => void;
  initialWorldviewReport?: string; // 世界観レポートのJSON文字列
}

export const CoverGeneratorInterface: React.FC<CoverGeneratorInterfaceProps> = ({
  onClose,
  initialWorldviewReport
}) => {
  const [apiKey, setApiKey] = useState('');
  const [worldviewReportText, setWorldviewReportText] = useState(initialWorldviewReport || '');
  const [worldviewReport, setWorldviewReport] = useState<WorldviewReport | null>(null);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<'practical' | 'story' | 'auto'>('auto');
  const [customConcept, setCustomConcept] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCover, setGeneratedCover] = useState<{ imageData: string; prompt: string } | null>(null);

  useEffect(() => {
    // APIキーを取得（デフォルトキーを優先、古いキー名にもフォールバック）
    const defaultKey = getApiKey('default');
    setApiKey(defaultKey || '');

    // 初期世界観レポートがあればパース
    if (initialWorldviewReport) {
      parseWorldviewReport(initialWorldviewReport);
    }
  }, [initialWorldviewReport]);

  const parseWorldviewReport = (jsonText: string) => {
    if (!jsonText.trim()) {
      setWorldviewReport(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const report: WorldviewReport = {
        seriesTitle: parsed.seriesTitle || parsed.title || '',
        volumes: parsed.volumes || [],
        worldview: parsed.worldview || {},
        protagonist: parsed.protagonist || {},
        artStyleTags: parsed.artStyleTags || '',
        backgroundTags: parsed.backgroundTags || '',
        characterImages: parsed.characterImages || []
      };

      setWorldviewReport(report);
      if (report.seriesTitle) {
        setTitle(report.seriesTitle);
      }
      setError(null);
    } catch (err: any) {
      setError(`世界観レポートのパースに失敗しました: ${err.message}`);
      // 部分的な情報でも抽出を試みる
      const titleMatch = jsonText.match(/(?:title|TITLE|seriesTitle)[\s:：]*["']?([^"'\n]+)["']?/i);
      if (titleMatch) {
        setTitle(titleMatch[1].trim());
      }
    }
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('タイトルを入力してください。');
      return;
    }

    // APIキーを再取得（最新の状態を取得）
    // getApiKey('default')は内部で古いキー名にもフォールバックする
    const currentApiKey = getApiKey('default');
    if (!currentApiKey) {
      setError('APIキーが設定されていません。マンガハブの「APIキー設定」からキーを入力してください。');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCover(null);

    try {
      // APIエンドポイントを呼び出し
      const response = await fetch('/api/cover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          genre,
          worldviewReport: worldviewReport || undefined,
          customConcept: customConcept.trim() || undefined,
          apiKey: currentApiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '表紙生成に失敗しました。');
      }

      const result = await response.json();
      setGeneratedCover({
        imageData: result.imageData,
        prompt: result.prompt
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
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  表紙生成ツール
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Gemini 3.0を使用した高品質な書籍表紙生成
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左パネル: 世界観レポート入力 */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">
                ステップ1: 世界観レポートの読み込み（任意）
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                世界観レポートのJSONを貼り付けると、タイトルやデザインコンセプトを自動抽出します。
              </p>
              <textarea
                value={worldviewReportText}
                onChange={(e) => {
                  setWorldviewReportText(e.target.value);
                  parseWorldviewReport(e.target.value);
                }}
                placeholder="世界観レポートのJSONを貼り付けてください..."
                rows={12}
                className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
              {error && error.includes('パース') && (
                <div className="mt-2 text-xs text-yellow-300">
                  {error} ただし、タイトルは抽出されました。
                </div>
              )}
            </div>
          </div>

          {/* 右パネル: 表紙生成 */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">
                ステップ2: 表紙を生成
              </h2>
              {!apiKey && (
                <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    APIキーが設定されていません。設定画面からキーを入力してください。
                  </p>
                </div>
              )}

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
                      placeholder="表紙のデザインコンセプトを記述"
                      rows={3}
                      className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                    />
                  </div>
                )}

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
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-bold transition-all shadow-lg disabled:cursor-not-allowed"
              >
                {isGenerating ? '表紙を生成中...' : '表紙を生成'}
              </button>

              {error && !error.includes('パース') && (
                <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {generatedCover && (
                <div className="mt-6 space-y-4">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
