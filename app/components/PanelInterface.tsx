'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PanelToolType, PanelInputData } from '@/app/lib/panel/types';
import { ArrowLeft, Layout, Wand2, Sparkles, Loader2, Check } from 'lucide-react';

interface PanelInterfaceProps {
  toolType: PanelToolType;
  inputData: PanelInputData | null;
  onClose?: () => void;
  mode?: 'semi-auto' | 'manual';
  onComplete?: (outputData: {
    csvString: string;
    rows: Array<{
      pageNumber: string;
      template: string;
      prompt: string;
      scriptSegment?: string;
    }>;
    characterImages: Array<{
      name: string;
      data: string;
      mimeType: string;
    }>;
    target: 'JP' | 'EN';
    title?: string;
  }) => void;
}

export const PanelInterface: React.FC<PanelInterfaceProps> = ({
  toolType,
  inputData,
  onClose,
  mode = 'manual',
  onComplete,
}) => {
  const [scenario, setScenario] = useState<string>('');
  const [worldSettings, setWorldSettings] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(4);
  const [genre, setGenre] = useState<string>('AIおまかせ');
  const [includeChapterTitle, setIncludeChapterTitle] = useState<boolean>(true); // デフォルトで章扉を含める
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [autoAnalyzed, setAutoAnalyzed] = useState<boolean>(false);
  const [result, setResult] = useState<{ csvString: string; rows: Array<{ pageNumber: string; template: string; prompt: string }> } | null>(null);
  const [target, setTarget] = useState<'JP' | 'EN'>('JP');

  // 初期データを設定
  useEffect(() => {
    if (inputData) {
      // ストーリーデータからシナリオと世界観を設定
      const firstEpisode = inputData.storyData.episodes[0];
      if (firstEpisode) {
        setScenario(firstEpisode.story);
        setWorldSettings(inputData.storyData.world_setting);
      }
    }
  }, [inputData]);

  // セミオートモードは無効化：自動解析を削除

  const handleAutoAnalyze = useCallback(async () => {
    if (!scenario.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    // セミオートモードは無効化

    try {
      const res = await fetch('/api/panel/analyze-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          worldSettings,
          mode: 'story', // 通常はストーリーモード
          toolType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze scenario');

      setPageCount(data.pageCount);
      setGenre(data.genre);
    } catch (error: any) {
      console.error('Analysis failed:', error);
      // エラーが発生しても処理を続行（デフォルト値を使用）
      // セミオートモードは無効化
    } finally {
      setIsAnalyzing(false);
    }
  }, [scenario, worldSettings, toolType]);

  const handleGenerate = useCallback(async () => {
    if (!scenario.trim()) {
      alert('シナリオを入力してください。');
      return;
    }

    setIsGenerating(true);
    try {
      // キャラクター画像を変換
      const characterImagesForAPI: Array<{ name: string; base64: string; mimeType: string }> = [];
      if (inputData?.characterImages) {
        inputData.characterImages.forEach((base64, characterId) => {
          // キャラクター名を取得（inputDataから）
          const character = inputData.storyData.characters.find(c => c.name === characterId || `char_${c.name}` === characterId);
          const name = character?.name || characterId;
          characterImagesForAPI.push({
            name: `${name}.png`,
            base64: base64.split(',')[1] || base64, // data:image/png;base64, のプレフィックスを除去
            mimeType: 'image/png',
          });
        });
      }

      const res = await fetch('/api/panel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType,
          scenario,
          worldSettings,
          pageCount,
          genre,
          includeCover: false, // 表紙生成機能は独立ツールに移行
          includeChapterTitle, // 章扉を含めるかどうか
          title: inputData?.storyData.episodes[0]?.title || '無題',
          chapterTitle: inputData?.storyData.episodes[0]?.title || 'Chapter 1',
          target,
          characterImages: characterImagesForAPI,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate panel plan');

      setResult(data);

      // コマ割り生成完了後、画像生成ツールへ進む
      if (onComplete) {
        // キャラクター画像を画像生成ツール用の形式に変換
        const characterImagesForStudio: Array<{ name: string; data: string; mimeType: string }> = [];
        if (inputData?.characterImages) {
          inputData.characterImages.forEach((base64, characterId) => {
            const character = inputData.storyData.characters.find(c => c.name === characterId || `char_${c.name}` === characterId);
            const name = character?.name || characterId;
            characterImagesForStudio.push({
              name: `${name}.png`,
              data: base64.split(',')[1] || base64,
              mimeType: 'image/png',
            });
          });
        }

        onComplete({
          csvString: data.csvString,
          rows: data.rows,
          characterImages: characterImagesForStudio,
          target,
          title: inputData?.storyData.episodes[0]?.title,
        });
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      alert(`生成に失敗しました: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [scenario, worldSettings, pageCount, genre, includeChapterTitle, toolType, target, inputData, onComplete]);

  const toolNames = {
    normal: '通常用コマ割り',
    business: 'ビジネス用コマ割り',
    youtube: '動画用コマ割り',
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">
      <div className="max-w-7xl mx-auto p-4 sm:p-12">
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-12 border-b border-gray-900 pb-8">
          <div className="flex items-center space-x-8">
            <div className={`p-6 rounded-[2rem] shadow-2xl ${
              'bg-indigo-600 shadow-indigo-600/30'
            }`}>
              <Layout className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
                {toolNames[toolType]}
              </h1>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.6em] mt-3">
                Manual Mode
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

        {/* モード表示（セミオートモードは無効化：常にマニュアルモード） */}
        <div className="border rounded-2xl p-4 mb-8 bg-indigo-900/20 border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wand2 className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Manual Mode</p>
                <p className="text-xs text-gray-400">手動で設定を調整できます</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 入力パネル */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">入力設定</h2>
            
            {/* シナリオ */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">シナリオ</label>
              <textarea
                value={scenario}
                onChange={(e) => {
                  setScenario(e.target.value);
                  setAutoAnalyzed(false); // 変更されたら再解析可能にする
                }}
                rows={10}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ストーリーのシナリオを入力..."
                disabled={false}
              />
            </div>

            {/* 世界観設定 */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">世界観設定（任意）</label>
              <textarea
                value={worldSettings}
                onChange={(e) => setWorldSettings(e.target.value)}
                rows={4}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:ring-2 focus:ring-indigo-500"
                placeholder="世界観や補足情報..."
                disabled={false}
              />
            </div>

            {/* ページ数とジャンル */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2">ページ数</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={pageCount}
                    onChange={(e) => setPageCount(parseInt(e.target.value) || 4)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  {(
                    <button
                      onClick={handleAutoAnalyze}
                      disabled={isAnalyzing || !scenario.trim()}
                      className={`px-4 py-2 rounded-lg border flex items-center gap-2 text-sm transition-all ${
                        !scenario.trim() || isAnalyzing
                          ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                          : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500'
                      }`}
                    >
                      <Wand2 className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      {isAnalyzing ? '解析中' : '解析'}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">ジャンル</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 章扉を含める */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeChapterTitle}
                  onChange={(e) => setIncludeChapterTitle(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-700 focus:ring-indigo-500"
                />
                <span className="text-sm font-bold">章扉（Chapter Title Page）を含める</span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-7">
                {includeChapterTitle ? '✓ Page 1が章扉として生成されます' : '章扉なしで生成されます'}
              </p>
            </div>

            {/* 生成ボタン */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !scenario.trim()}
              className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                isGenerating || !scenario.trim()
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>コマ割り構成案を生成</span>
                </>
              )}
            </button>
          </div>

          {/* 出力パネル */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">出力結果</h2>
            {result ? (
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">生成されたページ数: {result.rows.length}</p>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Page</th>
                          <th className="px-3 py-2 text-left">Template</th>
                          <th className="px-3 py-2 text-left">Prompt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, index) => (
                          <tr key={index} className="border-t border-gray-700">
                            <td className="px-3 py-2 font-mono text-white">{row.pageNumber}</td>
                            <td className="px-3 py-2 text-white">{row.template}</td>
                            <td className="px-3 py-2 text-xs text-gray-300 max-w-md truncate">{row.prompt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-400 font-bold">
                    ✓ コマ割り構成案が生成されました。画像生成ツールに進みます...
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>コマ割り構成案がここに表示されます</p>
              </div>
            )}
          </div>
        </div>

        {/* セミオートモードは無効化 */}
      </div>
    </div>
  );
};
