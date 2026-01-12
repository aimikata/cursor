import React from 'react';
import { MangaPage, Language } from '../types';
import { Play, RotateCw, Edit2, AlertTriangle, Image as ImageIcon, Download, PenTool } from 'lucide-react';
import { downloadSingleImage } from '../utils/downloadUtils';
import { splitPrompt } from '../utils/promptUtils';
import { t } from '../i18n';

interface MangaViewerProps {
  pages: MangaPage[];
  onGenerate: (page: MangaPage) => void;
  onEdit: (page: MangaPage) => void;
  onRegenerate: (page: MangaPage) => void;
  lang: Language;
}

export default function MangaViewer({ pages, onGenerate, onEdit, onRegenerate, lang }: MangaViewerProps) {
  if (pages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <ImageIcon size={32} className="opacity-50" />
        </div>
        <p className="text-xl font-medium">{t(lang, 'noPages')}</p>
        <p className="text-base mt-2">{t(lang, 'noPagesSub')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-12 scroll-smooth bg-slate-900/50">
      {pages.map((page, index) => {
        // Extract only the story part for display, hiding the confidential header
        let promptSplit = splitPrompt(page.prompt);
        let visiblePrompt = promptSplit.body;

        return (
          <div key={index} className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-start animate-fade-in group/page">
              {/* Page Info */}
            <div className="w-full md:w-64 shrink-0 space-y-3 sticky md:top-8">
              <div className="flex justify-between items-baseline">
                  <h2 className="text-3xl font-bold text-white">{t(lang, 'page')} {page.pageNumber}</h2>
                  <div className="text-xs font-mono text-slate-500">{page.template}</div>
              </div>
              
              <div className="flex flex-col gap-3 pt-2">
                  {page.status === 'idle' && (
                      <button 
                          onClick={() => onGenerate(page)}
                          className="bg-slate-700 hover:bg-slate-600 text-white text-base py-3 px-4 rounded-lg flex items-center gap-2 transition-colors w-full justify-center"
                      >
                          <Play size={16} /> {t(lang, 'generate')}
                      </button>
                  )}
                  
                   {page.status === 'generating' && (
                      <button disabled className="bg-blue-600/20 text-blue-400 text-base py-3 px-4 rounded-lg flex items-center gap-2 w-full justify-center cursor-wait border border-blue-500/20">
                          <RotateCw size={16} className="animate-spin" /> {t(lang, 'generating')}
                      </button>
                  )}
                  
                   {page.status === 'completed' && (
                      <div className="space-y-3">
                          {/* Fix / Regenerate (Correction Mode) */}
                          <button 
                              onClick={() => onRegenerate(page)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-base py-3 px-4 rounded-lg flex items-center gap-2 transition-colors w-full justify-center shadow-lg shadow-indigo-900/20"
                          >
                              <PenTool size={16} /> {t(lang, 'fixPrompt')}
                          </button>

                          {/* Visual Edit */}
                          <button 
                              onClick={() => onEdit(page)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-3 px-4 rounded-lg flex items-center gap-2 transition-colors w-full justify-center border border-slate-700"
                          >
                              <Edit2 size={14} /> {t(lang, 'editRefine')}
                          </button>
                          
                          {/* Download */}
                          {page.imageUrl && (
                              <button
                                  onClick={() => downloadSingleImage(page.imageUrl!, page.pageNumber)}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-3 px-4 rounded-lg flex items-center gap-2 transition-colors w-full justify-center border border-slate-700"
                              >
                                  <Download size={14} /> Download
                              </button>
                          )}
                      </div>
                  )}

                   {page.status === 'error' && (
                      <button 
                          onClick={() => onGenerate(page)}
                          className="bg-red-900/50 hover:bg-red-900/70 text-red-200 text-base py-3 px-4 rounded-lg flex items-center gap-2 transition-colors w-full justify-center border border-red-800"
                      >
                          <RotateCw size={16} /> {t(lang, 'retry')}
                      </button>
                  )}
              </div>

              {/* Prompt Preview (Truncated, Story Only) */}
              <div className="mt-4 text-xs md:text-sm text-slate-500 line-clamp-6 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono leading-relaxed" title={visiblePrompt}>
                  {visiblePrompt}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 w-full bg-slate-950 rounded-lg shadow-2xl border border-slate-800 min-h-[400px] relative group overflow-hidden">
               {/* Aspect Ratio 1:1.6 (Portrait) - using pb-[160%] */}
               <div className="relative w-full pb-[160%]">
                  <div className="absolute inset-0 flex items-center justify-center">
                      {page.imageUrl ? (
                          <img 
                              src={page.imageUrl} 
                              alt={`Page ${page.pageNumber}`} 
                              className="w-full h-full object-contain"
                          />
                      ) : (
                          <div className="text-center p-6">
                              {page.status === 'error' ? (
                                  <div className="text-red-500 flex flex-col items-center gap-2">
                                      <AlertTriangle size={40} />
                                      <span className="text-base">{page.error || t(lang, 'generationFailed')}</span>
                                  </div>
                              ) : (
                                  <div className="text-slate-700 flex flex-col items-center gap-3">
                                      {/* Vertical Placeholder */}
                                      <div className="w-48 h-72 border-2 border-dashed border-slate-800 rounded-lg"></div>
                                      <span className="text-sm uppercase tracking-wider font-semibold">{t(lang, 'waiting')}</span>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}