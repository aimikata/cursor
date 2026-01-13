'use client';

import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, Plus, Settings } from 'lucide-react';
import { ApiKeyType, getApiKey, setApiKey, getAllApiKeys, getApiKeyTypeLabel } from '@/app/lib/api-keys';

interface ApiKeyManagerProps {
  onApiKeyChange?: (type: ApiKeyType, apiKey: string | null) => void;
  defaultType?: ApiKeyType;
  showAdvanced?: boolean;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ 
  onApiKeyChange,
  defaultType = 'default',
  showAdvanced = false
}) => {
  const [apiKeys, setApiKeys] = useState<Record<ApiKeyType, string>>({} as Record<ApiKeyType, string>);
  const [showKeys, setShowKeys] = useState<Record<ApiKeyType, boolean>>({} as Record<ApiKeyType, boolean>);
  const [savedStates, setSavedStates] = useState<Record<ApiKeyType, boolean>>({} as Record<ApiKeyType, boolean>);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(showAdvanced);
  const [expandedTypes, setExpandedTypes] = useState<Set<ApiKeyType>>(new Set([defaultType]));

  useEffect(() => {
    // ローカルストレージからすべてのキーを読み込む
    const allKeys = getAllApiKeys();
    const keysState: Record<ApiKeyType, string> = {} as any;
    for (const type of Object.keys(allKeys) as ApiKeyType[]) {
      keysState[type] = allKeys[type] || '';
    }
    setApiKeys(keysState);
  }, []);

  const handleSave = (type: ApiKeyType) => {
    const key = apiKeys[type]?.trim();
    if (key) {
      setApiKey(type, key);
      setSavedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);
      onApiKeyChange?.(type, key);
    } else {
      setApiKey(type, null);
      onApiKeyChange?.(type, null);
    }
  };

  const handleClear = (type: ApiKeyType) => {
    setApiKeys(prev => ({ ...prev, [type]: '' }));
    setApiKey(type, null);
    onApiKeyChange?.(type, null);
    setSavedStates(prev => ({ ...prev, [type]: false }));
  };

  const toggleExpand = (type: ApiKeyType) => {
    setExpandedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const defaultKey = apiKeys.default || '';
  const hasDefaultKey = !!defaultKey;
  const hasSpecificKeys = Object.entries(apiKeys).some(([type, key]) => 
    type !== 'default' && !!key
  );

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-semibold text-gray-300">Gemini APIキー設定</h3>
        </div>
        {!showAdvancedSettings && (
          <button
            onClick={() => setShowAdvancedSettings(true)}
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            詳細設定
          </button>
        )}
      </div>

      {/* デフォルトキー（常に表示） */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">
            {getApiKeyTypeLabel('default')}
            <span className="ml-2 text-teal-400">*</span>
          </label>
          {expandedTypes.has('default') && (
            <button
              onClick={() => toggleExpand('default')}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {expandedTypes.has('default') ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={showKeys.default ? 'text' : 'password'}
                value={apiKeys.default || ''}
                onChange={(e) => setApiKeys(prev => ({ ...prev, default: e.target.value }))}
                placeholder="Gemini APIキーを入力してください"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKeys(prev => ({ ...prev, default: !prev.default }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showKeys.default ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => handleSave('default')}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-1 text-sm"
            >
              {savedStates.default ? (
                <>
                  <Check className="w-3 h-3" />
                  保存済み
                </>
              ) : (
                '保存'
              )}
            </button>
            {apiKeys.default && (
              <button
                onClick={() => handleClear('default')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors text-sm"
              >
                クリア
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => toggleExpand('default')}
            className="w-full text-left px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors text-sm"
          >
            {hasDefaultKey ? '✓ 設定済み' : '+ デフォルトキーを設定'}
          </button>
        )}
      </div>

      {/* 詳細設定（機能別キー） */}
      {showAdvancedSettings && (
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-semibold">機能別キー設定（オプション）</span>
            <button
              onClick={() => setShowAdvancedSettings(false)}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            特定の機能のみ別のAPIキーを使用したい場合に設定します。未設定の場合はデフォルトキーが使用されます。
          </p>
          
          {(['image_generation', 'story', 'research', 'panel', 'world', 'amazon'] as ApiKeyType[]).map((type) => {
            const isExpanded = expandedTypes.has(type);
            const hasKey = !!apiKeys[type];
            
            return (
              <div key={type} className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-400">
                    {getApiKeyTypeLabel(type)}
                  </label>
                  {isExpanded && (
                    <button
                      onClick={() => toggleExpand(type)}
                      className="text-xs text-gray-500 hover:text-gray-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {isExpanded ? (
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showKeys[type] ? 'text' : 'password'}
                        value={apiKeys[type] || ''}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, [type]: e.target.value }))}
                        placeholder="未設定の場合はデフォルトキーを使用"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, [type]: !prev[type] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        {showKeys[type] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleSave(type)}
                      className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-1 text-sm"
                    >
                      {savedStates[type] ? (
                        <>
                          <Check className="w-3 h-3" />
                          保存済み
                        </>
                      ) : (
                        '保存'
                      )}
                    </button>
                    {apiKeys[type] && (
                      <button
                        onClick={() => handleClear(type)}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors text-sm"
                      >
                        クリア
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => toggleExpand(type)}
                    className="w-full text-left px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors text-sm"
                  >
                    {hasKey ? '✓ 設定済み' : '+ 設定する'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        APIキーはブラウザのローカルストレージに保存されます。取得方法: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Google AI Studio</a>
      </p>
    </div>
  );
};
