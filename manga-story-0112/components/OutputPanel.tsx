
import React, { useState, useEffect, useRef } from 'react';
import { CatIcon } from './CatIcon';
import { PersonIcon } from './PersonIcon';
import type { GenerationMode, Episode } from '../types';

interface OutputPanelProps {
  episodes: Episode[];
  isLoading: boolean;
  error: string | null;
  generationMode: GenerationMode;
}

const FormattedOutput: React.FC<{ text: string }> = ({ text }) => {
  const contentBlocks: React.ReactNode[] = [];
  const lines = text.split('\n');
  let keyIndex = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      contentBlocks.push(<div key={keyIndex++} className="h-8"></div>);
      return;
    }

    if (trimmedLine.startsWith('# ')) {
      contentBlocks.push(
        <h2 key={keyIndex++} className="text-4xl font-black text-white mt-20 mb-10 border-b-4 border-indigo-900 pb-6 tracking-tight font-sans">
          {trimmedLine.replace('# ', '')}
        </h2>
      );
    } else if (trimmedLine.startsWith('「') || trimmedLine.startsWith('『')) {
      contentBlocks.push(
        <p key={keyIndex++} className="text-gray-100 text-2xl leading-relaxed mb-8 font-medium pl-6 border-l-4 border-indigo-800/30 font-serif">
          {trimmedLine}
        </p>
      );
    } else if (trimmedLine.match(/^（.+）$/)) {
      contentBlocks.push(
        <p key={keyIndex++} className="text-indigo-400/80 text-xl italic mb-8 leading-relaxed px-6 py-4 bg-indigo-950/10 rounded-lg font-serif">
          {trimmedLine}
        </p>
      );
    } else {
      contentBlocks.push(
        <p key={keyIndex++} className="text-gray-300 text-2xl leading-[1.8] mb-8 indent-8 font-normal tracking-wide text-justify font-serif">
          {trimmedLine}
        </p>
      );
    }
  });
  return <div className="space-y-2 pb-20">{contentBlocks}</div>;
};

export const OutputPanel: React.FC<OutputPanelProps> = ({ episodes, isLoading, error, generationMode }) => {
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (episodes.length > 0) setSelectedEpisode(episodes.length - 1); }, [episodes.length]);

  const constructExportText = (episode: Episode, title: string) => {
      let text = `【${title}】\n\n`;
      if (episode.introduction) text += `■ 導入・世界観\n${episode.introduction}\n\n---\n\n`;
      text += `${episode.story}\n\n`;
      if (episode.commentary) text += `\n【深層解析・設定資料】\n\n${episode.commentary}\n\n`;
      return text;
  };

  const handleCopy = async () => {
    const ep = episodes[selectedEpisode];
    const text = constructExportText(ep, ep.title || `第${selectedEpisode + 1}話`);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const ep = episodes[selectedEpisode];
    const title = ep.title || `Episode_${selectedEpisode + 1}`;
    const text = constructExportText(ep, title);
    setDownloading(true);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl h-full flex flex-col overflow-hidden border border-gray-700">
      {episodes.length > 0 && (
        <div ref={tabsRef} className="flex overflow-x-auto bg-gray-900 border-b border-gray-800 shrink-0 custom-scrollbar z-20 shadow-inner">
          {episodes.map((ep, index) => (
            <button key={index} onClick={() => setSelectedEpisode(index)} className={`flex-shrink-0 px-8 py-4 text-sm font-black border-b-4 transition-all ${selectedEpisode === index ? 'border-indigo-500 text-indigo-400 bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}>
              {ep.title || `第${index + 1}話`}
            </button>
          ))}
        </div>
      )}
      <div className="flex-grow w-full overflow-y-auto bg-[#0a0c10] custom-scrollbar relative">
        {isLoading && episodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-8">
             <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 border-4 border-pink-500 border-b-transparent rounded-full animate-spin-slow"></div>
                </div>
             </div>
             <div className="text-center space-y-3 px-10">
                <p className="animate-pulse text-indigo-400 text-2xl font-black tracking-[0.3em] uppercase">執筆を開始しています...</p>
                <p className="text-gray-500 text-sm font-bold">重厚な物語と設定資料を並行執筆しています。完了まで約1〜2分お待ちください。</p>
             </div>
          </div>
        ) : episodes.length > 0 ? (
          <div className="pt-12 px-6 md:px-12 pb-48 max-w-5xl mx-auto shadow-2xl bg-[#0a0c10]">
            <div className="sticky top-0 bg-[#0a0c10]/95 backdrop-blur-xl py-6 mb-16 border-b border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4 z-20 px-6 -mx-6">
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate pr-4 w-full md:w-auto">
                {episodes[selectedEpisode].title}
              </h3>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={handleDownload} 
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-xs transition-all ${downloading ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white'}`}
                >
                  ファイル保存
                </button>
                <button 
                  onClick={handleCopy} 
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-xs transition-all ${copied ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'}`}
                >
                  {copied ? 'コピー済み' : '全文コピー'}
                </button>
              </div>
            </div>

            {episodes[selectedEpisode].introduction && (
              <div className="mb-24 p-8 md:p-12 bg-white/[0.02] border-l-8 border-indigo-600 rounded-r-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 font-mono text-[60px] md:text-[100px] text-white/[0.02] pointer-events-none select-none">概要</div>
                <p className="text-indigo-100/90 text-xl md:text-2xl leading-relaxed font-serif relative z-10 italic">
                  {episodes[selectedEpisode].introduction}
                </p>
              </div>
            )}

            <article className="prose prose-invert max-w-none">
              <FormattedOutput text={episodes[selectedEpisode].story} />
            </article>

            {episodes[selectedEpisode].commentary && (
              <div className="my-32 p-10 md:p-16 bg-white/[0.03] border border-white/10 rounded-[2rem] md:rounded-[3rem] shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <CatIcon className="w-64 h-64 text-white" />
                </div>
                <div className="flex items-center gap-4 mb-12">
                   <div className="h-1 w-20 bg-indigo-600"></div>
                   <h4 className="text-indigo-400 text-2xl md:text-3xl font-black tracking-widest uppercase">
                    深層解析・設定資料
                  </h4>
                </div>
                <div className="text-lg md:text-xl text-gray-300 font-sans leading-loose whitespace-pre-wrap selection:bg-indigo-500/30">
                  {episodes[selectedEpisode].commentary}
                </div>
                <div className="mt-16 pt-8 border-t border-white/5 flex justify-end">
                   <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">使用モデル: {episodes[selectedEpisode].generatedBy}</span>
                </div>
              </div>
            )}

            {episodes[selectedEpisode].masterSheet && (
              <div className="mt-40 p-10 border border-gray-800 rounded-2xl bg-black font-mono text-[10px] opacity-40 hover:opacity-100 transition-all">
                <div className="text-gray-500 mb-6 flex justify-between items-center">
                  <span className="tracking-[0.5em] font-black uppercase">連載管理マスターシート（アーカイブ）</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-400">
                   <div className="space-y-4">
                      <p className="border-b border-gray-800 pb-2"><span className="text-indigo-900">習得レベル / 成長段階:</span> <span className="text-gray-200">{episodes[selectedEpisode].masterSheet!.acquisition_level}</span></p>
                      <p className="border-b border-gray-800 pb-2"><span className="text-indigo-900">物語・理論進行度:</span> <span className="text-gray-200">{episodes[selectedEpisode].masterSheet!.progress}</span></p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-indigo-900 mb-2 font-black">伏線・未解決課題:</p>
                      {episodes[selectedEpisode].masterSheet!.plot_points?.map((p, i) => (
                        <p key={i} className="text-gray-500 truncate">>> {p}</p>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-700 gap-6 grayscale opacity-20">
            <CatIcon className="w-32 h-32" />
            <p className="text-xl font-black tracking-[0.5em] uppercase">待機中</p>
          </div>
        )}
      </div>
    </div>
  );
};
