import React, { useRef, useMemo } from 'react';
import { FileText, Image as ImageIcon, AlertCircle, Layers, Download, Globe, CheckCircle, Link2Off, HelpCircle } from 'lucide-react';
import { CharacterImage, Language, MangaPage } from '../types';
import { parseCSV } from '../utils/csvParser';
import { analyzeCharacterLinks } from '../utils/characterUtils';
import { t } from '../i18n';

interface SidebarProps {
  onCsvLoaded: (data: MangaPage[]) => void;
  onImagesLoaded: (images: CharacterImage[]) => void;
  onGenerateAll: () => void;
  onDownloadAll: () => void;
  characterImages: CharacterImage[];
  hasCsv: boolean;
  isGeneratingAll: boolean;
  lang: Language;
  setLang: (l: Language) => void;
  pages?: MangaPage[];
}

export default function Sidebar({ 
  onCsvLoaded, 
  onImagesLoaded, 
  onGenerateAll, 
  onDownloadAll, 
  characterImages, 
  hasCsv, 
  isGeneratingAll, 
  lang, 
  setLang, 
  pages = [] 
}: SidebarProps) {
  let safePages = pages;

  let csvInputRef = useRef<HTMLInputElement>(null);
  let imageInputRef = useRef<HTMLInputElement>(null);

  let characterLinks = useMemo(() => {
    return analyzeCharacterLinks(safePages, characterImages);
  }, [safePages, characterImages]);

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = (event) => {
        let text = event.target?.result as string;
        if (text) {
          let parsed = parseCSV(text);
          onCsvLoaded(parsed);
        }
      };
      reader.readAsText(file);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      let newImages: CharacterImage[] = [];
      let files = Array.from(e.target.files) as File[];
      
      let processed = 0;
      files.forEach((file) => {
        let reader = new FileReader();
        reader.onload = (event) => {
          let result = event.target?.result as string;
          if (result) {
            newImages.push({
              name: file.name,
              data: result,
              mimeType: file.type
            });
          }
          processed++;
          if (processed === files.length) {
            onImagesLoaded(newImages);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full overflow-hidden shrink-0 z-10 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 shrink-0">
        <div className="flex justify-between items-start mb-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{t(lang, 'title')}</span>
            </h1>
            <button 
                onClick={() => setLang(lang === 'en' ? 'ja' : 'en')}
                className="text-sm flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded transition-colors"
            >
                <Globe size={14} /> {lang === 'en' ? 'JP' : 'EN'}
            </button>
        </div>
        <p className="text-slate-400 text-sm mt-1">{t(lang, 'subtitle')}</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {/* CSV Upload */}
        <div className="space-y-3">
          <label className="text-base font-medium text-slate-300 flex items-center gap-2">
            <FileText size={18} />
            {t(lang, 'uploadScript')}
          </label>
          <div 
            onClick={() => csvInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all hover:bg-slate-700/50 ${hasCsv ? 'border-green-500/50 bg-green-500/10' : 'border-slate-600'}`}
          >
            <input 
              type="file" 
              ref={csvInputRef} 
              accept=".csv" 
              className="hidden" 
              onChange={handleCsvUpload} 
            />
            <div className="text-sm text-slate-400">
              {hasCsv ? (
                  <div className="flex flex-col items-center gap-1">
                      <CheckCircle size={24} className="text-green-400" />
                      <span>{t(lang, 'scriptLoaded')}</span>
                      <span className="text-xs opacity-70">
                          {safePages.length} {t(lang, 'pagesLoaded')}
                      </span>
                  </div>
              ) : (
                  t(lang, 'uploadScriptPlaceholder')
              )}
            </div>
          </div>

          {/* Page List Verification */}
          {safePages.length > 0 && (
            <div className="bg-slate-900 rounded border border-slate-700 max-h-40 overflow-y-auto custom-scrollbar">
                <div className="sticky top-0 bg-slate-800 p-2 text-xs font-bold text-slate-400 border-b border-slate-700">
                    {t(lang, 'pageList')}
                </div>
                {safePages.map((p) => (
                    <div key={p.pageNumber} className="flex justify-between items-center px-3 py-2 text-sm border-b border-slate-800/50 last:border-0 hover:bg-slate-800/50">
                        <span className="text-slate-300 font-mono">
                            {p.pageNumber === 0 ? 'COVER' : `P${p.pageNumber}`}
                        </span>
                        <span className="text-slate-500 truncate max-w-[120px]" title={p.template}>{p.template}</span>
                    </div>
                ))}
            </div>
          )}
        </div>

        {/* Character Images Upload */}
        <div className="space-y-3">
          <label className="text-base font-medium text-slate-300 flex items-center gap-2">
            <ImageIcon size={18} />
            {t(lang, 'uploadChars')}
          </label>
          <div 
            onClick={() => imageInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-5 text-center cursor-pointer transition-all hover:bg-slate-700/50"
          >
            <input 
              type="file" 
              ref={imageInputRef} 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleImageUpload} 
            />
            <div className="text-sm text-slate-400">
              {t(lang, 'uploadCharsPlaceholder')}
            </div>
          </div>
          
          {/* Character Link Verification */}
          {hasCsv && (
            <div className="space-y-2">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t(lang, 'charLinkStatus')}</div>
               <div className="bg-slate-900 rounded border border-slate-700 overflow-hidden">
                  {characterLinks.length === 0 ? (
                      <div className="p-3 text-sm text-slate-500 text-center italic">{t(lang, 'noCharsFound')}</div>
                  ) : (
                      <div className="max-h-40 overflow-y-auto custom-scrollbar">
                          {characterLinks.map((status, i) => (
                              <div key={i} className="flex items-center justify-between px-3 py-2 border-b border-slate-800 last:border-0 text-sm">
                                  <div className="flex items-center gap-2 truncate pr-2" title={status.name}>
                                     {status.status === 'linked' && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                                     {status.status === 'missing_image' && <Link2Off size={14} className="text-red-400 shrink-0" />}
                                     {status.status === 'unused_image' && <HelpCircle size={14} className="text-yellow-500 shrink-0" />}
                                     <span className={`truncate ${
                                         status.status === 'missing_image' ? 'text-red-300' : 
                                         status.status === 'linked' ? 'text-green-300' : 
                                         'text-slate-300'
                                     }`}>
                                         {status.name}
                                     </span>
                                  </div>
                                  <div className="shrink-0">
                                      {status.status === 'linked' && <span className="text-[10px] text-green-300 bg-green-900/20 px-1.5 py-0.5 rounded font-medium">OK</span>}
                                      {status.status === 'missing_image' && <span className="text-[10px] text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded">MISSING</span>}
                                      {status.status === 'unused_image' && <span className="text-[10px] text-yellow-500 bg-yellow-900/20 px-1.5 py-0.5 rounded">UNUSED</span>}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
               </div>
            </div>
          )}

        </div>

        {/* Actions */}
        {hasCsv && (
            <div className="space-y-3 pt-4 border-t border-slate-700">
                <button
                    onClick={onGenerateAll}
                    disabled={isGeneratingAll}
                    className={`w-full font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-base ${
                        isGeneratingAll 
                        ? 'bg-blue-900/50 text-blue-300 cursor-wait border border-blue-800' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                    }`}
                >
                    <Layers size={18} className={isGeneratingAll ? "animate-pulse" : ""} />
                    {isGeneratingAll ? t(lang, 'generating') : t(lang, 'generateAll')}
                </button>

                <button
                    onClick={onDownloadAll}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all border border-slate-600 text-base"
                >
                    <Download size={18} />
                    {t(lang, 'downloadAll')}
                </button>
            </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-900/50 rounded-lg p-4 text-sm text-slate-400 space-y-2 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <AlertCircle size={16} /> {t(lang, 'tips')}
          </div>
          <ul className="list-disc pl-4 space-y-1 text-xs">
            <li>{t(lang, 'tip1')}</li>
            <li>{t(lang, 'tip2')}</li>
            <li>{t(lang, 'tip3')}</li>
          </ul>
        </div>
      </div>

      <div className="p-4 text-center text-xs text-slate-600 bg-slate-800 border-t border-slate-700">
        {t(lang, 'poweredBy')}
      </div>
    </div>
  );
}