'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PanelToolType } from '@/app/lib/panel/types';
import { ArrowLeft, Image as ImageIcon, Download, Loader2, CheckCircle } from 'lucide-react';

interface ImageStudioData {
  toolType: PanelToolType;
  csvString: string;
  rows: Array<{ pageNumber: string; template: string; prompt: string }>;
  characterImages: Array<{ name: string; data: string; mimeType: string }>;
  target: 'JP' | 'EN';
  title?: string;
}

interface ImageStudioInterfaceProps {
  data: ImageStudioData;
  mode: 'semi-auto' | 'manual';
  onClose?: () => void;
  onComplete?: (result: {
    csvString: string;
    imageFiles: File[];
    pageNumbers: number[];
  }) => void;
}

export const ImageStudioInterface: React.FC<ImageStudioInterfaceProps> = ({
  data,
  mode,
  onClose,
  onComplete,
}) => {
  const [pages, setPages] = useState<Array<{
    pageNumber: number;
    template: string;
    prompt: string;
    status: 'idle' | 'generating' | 'completed' | 'error';
    imageUrl?: string;
    error?: string;
  }>>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Map<number, string>>(new Map());

  // 初期化：CSVデータからページリストを作成
  useEffect(() => {
    const parsedPages = data.rows.map((row) => {
      let pageNumber = 0;
      const pageNumStr = row.pageNumber.toLowerCase().trim();
      if (pageNumStr.includes('cover')) {
        pageNumber = 0;
      } else {
        const match = pageNumStr.match(/(\d+)/);
        if (match) {
          pageNumber = parseInt(match[0], 10);
        }
      }
      return {
        pageNumber,
        template: row.template,
        prompt: row.prompt,
        status: 'idle' as const,
      };
    });
    setPages(parsedPages);
  }, [data]);

  // 画像生成APIを呼び出す
  const generatePageImage = useCallback(async (page: typeof pages[0]) => {
    try {
      // TODO: 実際の画像生成APIを呼び出す
      // 現時点ではプレースホルダーとして、ダミー画像を生成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ダミー画像（実際の実装では、APIから返された画像URLを使用）
      const dummyImageUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
      
      setPages(prev => prev.map(p => 
        p.pageNumber === page.pageNumber 
          ? { ...p, status: 'completed', imageUrl: dummyImageUrl }
          : p
      ));
      
      setGeneratedImages(prev => new Map(prev).set(page.pageNumber, dummyImageUrl));
    } catch (error: any) {
      setPages(prev => prev.map(p => 
        p.pageNumber === page.pageNumber 
          ? { ...p, status: 'error', error: error.message }
          : p
      ));
    }
  }, []);

  // 全ページ生成
  const handleGenerateAll = useCallback(async () => {
    setIsGeneratingAll(true);
    try {
      for (const page of pages) {
        if (page.status !== 'completed') {
          setPages(prev => prev.map(p => 
            p.pageNumber === page.pageNumber 
              ? { ...p, status: 'generating' }
              : p
          ));
          await generatePageImage(page);
        }
      }
    } finally {
      setIsGeneratingAll(false);
    }
  }, [pages, generatePageImage]);

  // 完了時にproofreadingへ遷移
  useEffect(() => {
    const allCompleted = pages.length > 0 && pages.every(p => p.status === 'completed');
    const shouldProceedToProofreading = 
      (data.toolType === 'normal' || data.toolType === 'business') && 
      allCompleted && 
      onComplete;

    if (shouldProceedToProofreading) {
      // 生成された画像をFileオブジェクトに変換
      const imageFiles: File[] = [];
      const pageNumbers: number[] = [];
      
      pages.forEach(page => {
        if (page.imageUrl) {
          // base64データをBlobに変換
          const base64Data = page.imageUrl.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          const file = new File([blob], `page_${page.pageNumber}.png`, { type: 'image/png' });
          imageFiles.push(file);
          pageNumbers.push(page.pageNumber);
        }
      });

      // proofreadingへ遷移
      onComplete({
        csvString: data.csvString,
        imageFiles,
        pageNumbers,
      });
    }
  }, [pages, data, onComplete]);

  const toolNames = {
    normal: 'j-manga-studio',
    business: 'bizmanga-studio',
    youtube: 'youtube-manga-studio',
  };

  const completedCount = pages.filter(p => p.status === 'completed').length;
  const totalCount = pages.length;

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">
      <div className="max-w-7xl mx-auto p-4 sm:p-12">
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-12 border-b border-gray-900 pb-8">
          <div className="flex items-center space-x-8">
            <div className="p-6 rounded-[2rem] shadow-2xl bg-indigo-600 shadow-indigo-600/30">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
                {toolNames[data.toolType]}
              </h1>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.6em] mt-3">
                {mode === 'semi-auto' ? 'Semi-Auto Mode' : 'Manual Mode'}
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

        {/* モード表示 */}
        <div className={`border rounded-2xl p-4 mb-8 ${
          mode === 'semi-auto' 
            ? 'bg-green-900/20 border-green-500/30' 
            : 'bg-indigo-900/20 border-indigo-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-green-400 uppercase tracking-widest">
                {mode === 'semi-auto' ? 'Semi-Auto Mode' : 'Manual Mode'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {completedCount}/{totalCount} ページ生成完了
                {data.toolType === 'youtube' && ' (このツールはproofreadingへ進みません)'}
              </p>
            </div>
            <button
              onClick={handleGenerateAll}
              disabled={isGeneratingAll || completedCount === totalCount}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-sm transition-all flex items-center gap-2"
            >
              {isGeneratingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  全ページ生成
                </>
              )}
            </button>
          </div>
        </div>

        {/* ページ一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div key={page.pageNumber} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">
                  {page.pageNumber === 0 ? 'Cover' : `Page ${page.pageNumber}`}
                </h3>
                <div className="flex items-center gap-2">
                  {page.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {page.status === 'generating' && (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  )}
                  {page.status === 'error' && (
                    <span className="text-red-400 text-xs">エラー</span>
                  )}
                </div>
              </div>
              
              {page.imageUrl ? (
                <img 
                  src={page.imageUrl} 
                  alt={`Page ${page.pageNumber}`}
                  className="w-full rounded-lg mb-3"
                />
              ) : (
                <div className="w-full aspect-[9/16] bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">未生成</span>
                </div>
              )}
              
              <div className="text-xs text-gray-400 space-y-1">
                <p><span className="font-bold">Template:</span> {page.template}</p>
                <p className="line-clamp-2"><span className="font-bold">Prompt:</span> {page.prompt.substring(0, 100)}...</p>
              </div>
            </div>
          ))}
        </div>

        {/* 完了メッセージ */}
        {completedCount === totalCount && data.toolType !== 'youtube' && (
          <div className="mt-8 bg-green-900/20 border border-green-500/30 rounded-2xl p-6 text-center">
            <p className="text-green-400 font-bold text-lg mb-2">
              ✓ 全ページの画像生成が完了しました
            </p>
            <p className="text-gray-400 text-sm">
              proofreadingツールに自動的に進みます...
            </p>
          </div>
        )}

        {completedCount === totalCount && data.toolType === 'youtube' && (
          <div className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
            <p className="text-yellow-400 font-bold text-lg mb-2">
              ✓ 全ページの画像生成が完了しました
            </p>
            <p className="text-gray-400 text-sm">
              youtube-manga-studioはproofreadingへ進みません。ここで完了です。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
