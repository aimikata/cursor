
import React from 'react';
import { CsvRow } from '../types';
// Fixed error: Added Zap to imports
import { Download, Table, Copy, FileText, Image as ImageIcon, Zap } from 'lucide-react';

interface ResultTableProps {
  csvString: string;
  rows: CsvRow[];
  target: 'JP' | 'EN';
}

export const ResultTable: React.FC<ResultTableProps> = ({ csvString, rows }) => {
  if (!rows || rows.length === 0) return null;

  const handleDownload = () => {
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'youtube_visual_plan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm sm:text-base">
          <ImageIcon className="w-5 h-5 text-red-600" />
          映像制作プラン (8:9スタック構成)
        </h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Download className="w-4 h-4" />
          CSV出力
        </button>
      </div>

      <div className="overflow-auto flex-grow">
        <table className="w-full text-left text-sm table-fixed min-w-[800px]">
          <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-600 w-16 text-center">Slide</th>
              <th className="px-4 py-3 font-bold text-slate-600 w-1/3">
                <div className="flex items-center gap-1"><FileText className="w-4 h-4" /> 対応台本 (動画用)</div>
              </th>
              <th className="px-4 py-3 font-bold text-slate-600">
                <div className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-500" /> 描画用プロンプト (文字抜き・高詳細)</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-red-50/30 transition-colors group">
                <td className="px-4 py-5 text-slate-800 font-mono text-center align-top font-black border-r text-base">{row.pageNumber}</td>
                <td className="px-4 py-5 text-slate-700 align-top leading-relaxed border-r bg-slate-50/40">
                    <div className="whitespace-pre-wrap font-medium">
                        {row.scriptSegment}
                    </div>
                </td>
                <td className="px-4 py-5 text-slate-700 align-top relative">
                    <div className="max-h-[300px] overflow-y-auto whitespace-pre-wrap pr-10 text-[11px] leading-relaxed font-mono bg-white p-3 border border-slate-200 rounded-lg shadow-sm group-hover:border-red-200 group-hover:shadow-md transition-all">
                        {row.prompt}
                    </div>
                    <button 
                        onClick={() => handleCopy(row.prompt)}
                        className="absolute top-7 right-6 p-2 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                        title="Copy Prompt"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-center gap-4 text-[10px] text-slate-500">
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div>文字なし画像生成</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div>キャラ参照 [REF_IMG] 埋込済</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div>8:9 (16:9×2段) 比率</div>
      </div>
    </div>
  );
};
