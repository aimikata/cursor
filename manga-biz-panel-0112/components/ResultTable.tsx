import React from 'react';
import { CsvRow } from '../types';
import { Download, Table, Copy } from 'lucide-react';

interface ResultTableProps {
  csvString: string;
  rows: CsvRow[];
  target: 'JP' | 'EN';
}

export const ResultTable: React.FC<ResultTableProps> = ({ csvString, rows, target }) => {
  if (!rows || rows.length === 0) return null;

  const handleDownload = () => {
    // Add BOM for Excel compatibility with UTF-8
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'manga_plan.csv');
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
        <h2 className="font-bold text-slate-700 flex items-center gap-2">
          <Table className="w-5 h-5 text-emerald-600" />
          構成案出力結果 (3列構成)
        </h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          CSVダウンロード
        </button>
      </div>

      <div className="overflow-auto flex-grow p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 border-b w-24">Page</th>
              <th className="px-4 py-3 font-semibold text-slate-600 border-b w-32">Template</th>
              <th className="px-4 py-3 font-semibold text-slate-600 border-b">
                Prompt Content ({target === 'EN' ? 'Full English' : 'JP Header + EN Visuals + JP Bubbles'})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-800 font-mono text-center align-top font-bold">{row.pageNumber}</td>
                <td className="px-4 py-3 text-slate-600 align-top">
                    <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-mono">
                        {row.template}
                    </span>
                </td>
                <td className="px-4 py-3 text-slate-700 align-top group relative">
                    <div className="max-h-60 overflow-y-auto whitespace-pre-wrap pr-8 text-xs leading-relaxed font-mono bg-slate-50/50 p-2 rounded">
                        {row.prompt}
                    </div>
                    <button 
                        onClick={() => handleCopy(row.prompt)}
                        className="absolute top-2 right-2 p-1.5 bg-white border rounded-md shadow-sm hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all"
                        title="Copy Prompt"
                    >
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 text-center">
         ※CSV columns: Page, Template, Prompt (Strict 3-column format)
      </div>
    </div>
  );
};