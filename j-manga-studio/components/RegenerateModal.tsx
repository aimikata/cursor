import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { MangaPage, Language } from '../types';
import { t } from '../i18n';
import { splitPrompt, combinePrompt } from '../utils/promptUtils';

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: MangaPage;
  onConfirm: (pageNumber: number, newPrompt: string) => void;
  lang: Language;
}

export default function RegenerateModal({ isOpen, onClose, page, onConfirm, lang }: RegenerateModalProps) {
  let [header, setHeader] = useState('');
  let [body, setBody] = useState('');

  useEffect(() => {
    // Split the prompt when the modal opens or page changes
    let promptSplit = splitPrompt(page.prompt);
    setHeader(promptSplit.header);
    setBody(promptSplit.body);
  }, [page]);

  if (!isOpen) return null;

  function handleConfirm() {
    // Recombine the hidden header with the edited body
    let fullPrompt = combinePrompt(header, body);
    onConfirm(page.pageNumber, fullPrompt);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-white font-semibold flex items-center gap-2 text-lg">
            <RefreshCw className="text-blue-400" size={20} />
            {t(lang, 'fixModalTitle')} - {t(lang, 'page')} {page.pageNumber}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-base font-bold text-blue-400">
                        {t(lang, 'currentPrompt')}
                    </label>
                    <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        Config Hidden (Pre-pended on generation)
                    </span>
                </div>
                <textarea 
                    className="w-full h-48 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Story content..."
                />
            </div>

            <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 text-sm text-slate-400 space-y-1">
                <p><strong>{t(lang, 'editOption')}</strong></p>
                <p>{t(lang, 'regenOption')}</p>
            </div>
            
            <div className="flex justify-end pt-2 gap-3">
                 <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-400 hover:text-white text-base"
                >
                    {t(lang, 'close')}
                </button>
                <button
                    onClick={handleConfirm}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 text-base"
                >
                    <RefreshCw size={18} />
                    {t(lang, 'applyAndGenerate')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}