import React, { useState, useEffect } from 'react';
import { WorldviewReport } from './types';
import { WorldviewInputForm } from './components/WorldviewInputForm';
import { CoverGenerator } from './components/CoverGenerator';
import { ApiKeyModal } from './components/ApiKeyModal';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [worldviewReport, setWorldviewReport] = useState<WorldviewReport | null>(null);
  const [extractedTitle, setExtractedTitle] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleReportLoaded = (report: WorldviewReport | null, title?: string) => {
    setWorldviewReport(report);
    if (title) {
      setExtractedTitle(title);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />

      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                表紙生成ツール
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Gemini 3.0を使用した高品質な書籍表紙生成
              </p>
            </div>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              APIキー設定
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左パネル: 世界観レポート入力 */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">
                ステップ1: 世界観レポートの読み込み（任意）
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                世界観レポートのJSONを貼り付けると、タイトルやデザインコンセプトを自動抽出します。
                JSON形式でなくても、主要な情報があれば自動抽出します。
              </p>
              <WorldviewInputForm onReportLoaded={handleReportLoaded} />
            </div>
          </div>

          {/* 右パネル: 表紙生成 */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">
                ステップ2: 表紙を生成
              </h2>
              {!apiKey && (
                <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    APIキーを設定してください。
                  </p>
                </div>
              )}
              <CoverGenerator
                apiKey={apiKey}
                worldviewReport={worldviewReport}
                defaultTitle={extractedTitle}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>Powered by Google Gemini 3.0</p>
      </footer>
    </div>
  );
};

export default App;
