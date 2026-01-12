
import React, { useState, useCallback } from 'react';
import type { PageData, AnalysisResult, Correction } from '../types';

const IconCheck = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const IconClipboard = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const IconAlert = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

interface CorrectionRowProps {
    correction: Correction;
}

const CorrectionRow: React.FC<CorrectionRowProps> = ({ correction }) => {
    const [copied, setCopied] = useState(false);
    const hasMistake = correction.original.trim() !== correction.corrected.trim();

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(correction.corrected).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [correction.corrected]);

    return (
        <div className={`p-4 rounded-lg border ${hasMistake ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                    <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">元のセリフ</h5>
                    <pre className="text-sm whitespace-pre-wrap font-sans text-slate-700">{correction.original}</pre>
                </div>
                <div className="relative">
                     <h5 className={`text-xs font-semibold mb-2 uppercase tracking-wider ${hasMistake ? 'text-amber-700' : 'text-slate-500'}`}>AIの修正案</h5>
                    <pre className={`text-sm whitespace-pre-wrap font-sans ${hasMistake ? 'text-amber-900' : 'text-slate-800'}`}>{correction.corrected}</pre>
                    <button
                        onClick={handleCopy}
                        className="absolute top-0 right-0 p-2 rounded-md bg-white/50 text-slate-600 hover:bg-slate-200 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                        aria-label="修正されたテキストをコピー"
                    >
                        {copied ? <IconCheck /> : <IconClipboard />}
                    </button>
                </div>
            </div>
        </div>
    );
};


export const ResultCard: React.FC<{ pageData: PageData; analysisResult: AnalysisResult; }> = ({ pageData, analysisResult }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="p-4 bg-slate-100 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-700">ページ {pageData.pageNumber} <span className="font-normal text-sm text-slate-500">- {pageData.fileName}</span></h3>
      </div>
      <div className="grid md:grid-cols-2 gap-6 p-6">
        <div className="flex justify-center items-center bg-slate-100 rounded-lg p-2 aspect-[3/4]">
            <img src={pageData.imageUrl} alt={`マンガページ ${pageData.pageNumber}`} className="max-w-full max-h-full object-contain rounded-md shadow-md" />
        </div>
        <div className="space-y-4 flex flex-col">
          <div>
            <h4 className="font-semibold text-slate-600 mb-2">抽出されたテキスト全体</h4>
            <pre className="bg-slate-100 p-4 rounded-lg text-sm whitespace-pre-wrap font-sans text-slate-700 max-h-40 overflow-y-auto">{analysisResult.originalFullText || '（テキストは検出されませんでした）'}</pre>
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-slate-600">セリフごとの修正案</h4>
                {analysisResult.pageHasMistake ? (
                    <span className="flex items-center text-sm font-medium bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                        <IconAlert /> 修正を提案
                    </span>
                ) : (
                    <span className="flex items-center text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        <IconCheck /> エラーなし
                    </span>
                )}
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {analysisResult.corrections.length > 0 ? (
                analysisResult.corrections.map((correction, index) => (
                  <CorrectionRow key={index} correction={correction} />
                ))
              ) : (
                <div className="text-center py-8">
                    <p className="text-slate-500">このページでは修正案はありません。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};