'use client';

import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check } from 'lucide-react';

interface ApiKeySettingsProps {
  onApiKeyChange?: (apiKey: string | null) => void;
  storageKey?: string;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ 
  onApiKeyChange,
  storageKey = 'gemini_api_key'
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // ローカルストレージからAPIキーを読み込む
    const savedKey = localStorage.getItem(storageKey);
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeyChange?.(savedKey);
    }
  }, [storageKey, onApiKeyChange]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(storageKey, apiKey.trim());
      setIsSaved(true);
      onApiKeyChange?.(apiKey.trim());
      setTimeout(() => setIsSaved(false), 2000);
    } else {
      localStorage.removeItem(storageKey);
      onApiKeyChange?.(null);
    }
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem(storageKey);
    onApiKeyChange?.(null);
    setIsSaved(false);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-semibold text-gray-300">Gemini APIキー設定</h3>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Gemini APIキーを入力してください"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              保存済み
            </>
          ) : (
            '保存'
          )}
        </button>
        {apiKey && (
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
          >
            クリア
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        APIキーはブラウザのローカルストレージに保存されます。取得方法: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Google AI Studio</a>
      </p>
    </div>
  );
};
