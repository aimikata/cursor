import React, { useState } from 'react';
import { WorldviewReport } from '../types';
import { parseWorldviewReport, extractWorldviewInfo } from '../utils/worldviewParser';

interface WorldviewInputFormProps {
  onReportLoaded: (report: WorldviewReport | null, title?: string) => void;
}

export const WorldviewInputForm: React.FC<WorldviewInputFormProps> = ({ onReportLoaded }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonText(text);
      handleParse(text);
    } catch (err) {
      setError('クリップボードからの読み取りに失敗しました。');
    }
  };

  const handleParse = (text?: string) => {
    const inputText = text || jsonText;
    setError(null);
    setSuccess(false);

    if (!inputText.trim()) {
      onReportLoaded(null);
      return;
    }

    // まずJSONとしてパースを試みる
    const result = parseWorldviewReport(inputText);

    if (result.success && result.report) {
      setSuccess(true);
      setError(null);
      onReportLoaded(result.report, result.report.seriesTitle);
    } else if (result.partialData) {
      // 部分的なデータでも受け入れる
      setSuccess(true);
      setError(`警告: ${result.error}。部分的な情報のみ読み込みました。`);
      onReportLoaded(result.partialData as WorldviewReport, result.partialData.seriesTitle);
    } else {
      // JSONでない場合、テキストから情報を抽出
      const extracted = extractWorldviewInfo(inputText);
      if (extracted.seriesTitle) {
        setSuccess(true);
        setError('JSON形式ではありませんが、タイトルを抽出しました。');
        onReportLoaded(extracted as WorldviewReport, extracted.seriesTitle);
      } else {
        setError(result.error || '世界観レポートの情報を読み込めませんでした。');
        onReportLoaded(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          世界観レポート（JSON形式またはテキスト）
        </label>
        <button
          type="button"
          onClick={handlePaste}
          className="text-xs text-indigo-400 hover:text-indigo-300 underline"
        >
          クリップボードから貼り付け
        </button>
      </div>
      
      <textarea
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          setError(null);
          setSuccess(false);
        }}
        onBlur={() => handleParse()}
        placeholder="世界観レポートのJSONを貼り付けるか、テキストを入力してください。&#10;例: {&quot;seriesTitle&quot;: &quot;タイトル&quot;, ...}&#10;&#10;※ JSON形式でなくても、タイトルなどの主要情報があれば自動抽出します。"
        rows={8}
        className={`w-full p-4 bg-gray-900/50 border rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none ${
          error ? 'border-red-500' : success ? 'border-green-500' : 'border-gray-600'
        }`}
      />
      
      {error && (
        <div className={`text-xs p-2 rounded ${error.includes('警告') ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700' : 'bg-red-900/30 text-red-300 border border-red-700'}`}>
          {error}
        </div>
      )}
      
      {success && !error && (
        <div className="text-xs p-2 rounded bg-green-900/30 text-green-300 border border-green-700">
          ✓ 世界観レポートを読み込みました
        </div>
      )}
      
      <button
        type="button"
        onClick={() => handleParse()}
        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
      >
        読み込む
      </button>
    </div>
  );
};
