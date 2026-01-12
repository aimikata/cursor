import React, { useState, useEffect } from 'react';
import { X, Key, Save, ShieldCheck, ExternalLink, Zap } from 'lucide-react';

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSave: (key: string) => void;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ isOpen, onClose, currentKey, onSave }) => {
  const [key, setKey] = useState(currentKey);

  useEffect(() => {
    setKey(currentKey);
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(key.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 rounded-t-xl z-10">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600" />
            APIキー設定 & ガイド
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Guide Section */}
          {!currentKey && (
            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">!</span>
                まずは無料でAPIキーを取得しましょう
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-indigo-600 font-bold text-lg mb-1">Step 1</div>
                  <div className="text-xs text-slate-600 font-bold mb-2">Google AI Studioへ</div>
                  <p className="text-xs text-slate-500">Googleアカウントでログインします。</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-indigo-600 font-bold text-lg mb-1">Step 2</div>
                  <div className="text-xs text-slate-600 font-bold mb-2">キーを作成</div>
                  <p className="text-xs text-slate-500">"Get API key" ボタンを押し、"Create API key"を選択します。</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-indigo-600 font-bold text-lg mb-1">Step 3</div>
                  <div className="text-xs text-slate-600 font-bold mb-2">コピー＆ペースト</div>
                  <p className="text-xs text-slate-500">生成された文字列をコピーし、下の入力欄に貼り付けます。</p>
                </div>
              </div>

              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-2 mb-2"
              >
                <ExternalLink className="w-4 h-4" />
                Google AI Studioを開く（別タブ）
              </a>
              <p className="text-[10px] text-center text-slate-400">※クレジットカード登録不要で、すぐに発行できます。</p>
            </div>
          )}

          {/* Free Tier Info */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-8">
            <h5 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              無料枠についての安心情報
            </h5>
            <ul className="text-xs text-emerald-700 space-y-1.5 list-disc pl-4">
              <li><strong>1日 1,500回</strong>（リクエスト）まで無料で利用可能です。</li>
              <li>無料枠を超えた場合、エラーになるだけで<strong>勝手に課金されることはありません</strong>。</li>
            </ul>
          </div>

          {/* Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-2">Gemini API Key 入力</label>
            <div className="relative">
              <input 
                type="password" 
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full border border-slate-300 rounded-lg p-3 pr-10 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
              />
              {key && (
                <button 
                  onClick={() => setKey('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                  title="クリア"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              キーはお使いのブラウザ内にのみ保存され、開発者には送信されません。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-100 flex flex-col gap-3 rounded-b-xl sticky bottom-0">
          <div className="flex gap-3 justify-end w-full">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
            >
              閉じる
            </button>
            <button 
              onClick={handleSave}
              disabled={!key.trim()}
              className={`px-6 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2
                ${!key.trim() 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
                }`}
            >
              <Save className="w-4 h-4" />
              設定を保存する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
