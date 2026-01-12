
import React, { useState } from 'react';
import { Key, ExternalLink, CheckCircle, AlertCircle, DollarSign, Lightbulb } from 'lucide-react';
import { t } from '../i18n';
import { Language } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  lang: Language;
}

export default function ApiKeyModal({ isOpen, onSave, lang }: ApiKeyModalProps) {
  let [keyInput, setKeyInput] = useState('');
  let [error, setError] = useState('');

  if (!isOpen) return null;

  function handleSave() {
    let trimmed = keyInput.trim();
    if (!trimmed) {
      setError(lang === 'en' ? 'API Key is required' : 'APIキーを入力してください');
      return;
    }
    if (!trimmed.startsWith('AIza')) {
      setError(lang === 'en' ? 'Invalid API Key format (starts with AIza...)' : '無効な形式です（AIzaで始まるキーを入力してください）');
    }
    onSave(trimmed);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl animate-fade-in p-6 space-y-6">
        
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto text-blue-400 border border-blue-500/30">
            <Key size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white">{t(lang, 'apiKeyRequired')}</h2>
          <p className="text-base text-slate-400 leading-relaxed">
            {t(lang, 'apiKeyExplain')}
          </p>
        </div>
        
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 flex gap-3 text-sm text-yellow-200/90">
             <Lightbulb className="shrink-0 text-yellow-400" size={18} />
             <p className="text-xs leading-relaxed">
                 {t(lang, 'freeTierTip')}
             </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
              Gemini API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setError('');
              }}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-base"
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-950/30 p-3 rounded-lg border border-blue-900/50 hover:bg-blue-900/40"
            >
              <span>{t(lang, 'getApiKey')}</span>
              <ExternalLink size={14} />
            </a>
            
            <a 
              href="https://ai.google.dev/pricing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors bg-slate-800 p-3 rounded-lg border border-slate-700 hover:bg-slate-700"
            >
              <span>{t(lang, 'checkPricing')}</span>
              <DollarSign size={14} />
            </a>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] text-base"
        >
          {t(lang, 'saveAndStart')}
        </button>

        <p className="text-xs text-center text-slate-600">
          {t(lang, 'apiKeyStorage')}
        </p>
      </div>
    </div>
  );
}
