
import React, { useState } from 'react';
import { WorldviewProposal } from '../types';
import { GENRES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { WandIcon } from './icons';
// Corrected import to include GenerateContentResponse
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

interface ProjectPlanAnalyzerProps {
  onAnalysisComplete: (proposal: WorldviewProposal, genreId: string) => void;
}

// 429エラー対策の再試行ユーティリティ
async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            if (error.message?.includes('429') || error.status === 429) {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`Analysis failed (429). Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

const ProjectPlanAnalyzer: React.FC<ProjectPlanAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [planText, setPlanText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planText.trim()) {
      setError('企画案を入力してください。');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const analysisSchema = {
          type: Type.OBJECT,
          properties: {
              proposal: {
                  type: Type.OBJECT,
                  properties: {
                      title: { type: Type.STRING },
                      coreConcept: { type: Type.STRING },
                      protagonistIdea: { type: Type.STRING },
                      firstEpisodeHook: { type: Type.STRING },
                      currentStatus: { type: Type.STRING },
                      unresolvedList: { type: Type.STRING, description: "全巻の構成、チャプター、技術ツール名等を一文字も漏らさず格納" },
                      progress: { type: Type.STRING },
                  },
                  required: ["title", "coreConcept", "protagonistIdea", "firstEpisodeHook"],
              },
              genreId: { type: Type.STRING },
          },
          required: ["proposal", "genreId"],
      };

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const genreOptions = GENRES.map(g => `- id: "${g.id}", name: "${g.name}"`).join('\n');

      const prompt = `
          あなたは「情報の完全性」を司る編集者です。
          入力された企画案から、あらゆる詳細情報を抽出・継承してください。

          **【抽出の絶対ルール：要約厳禁】**
          1. **情報を絶対に削らない**: 入力された「Vol.1〜Vol.5」の全チャプター、具体的ツール名、手順をすべて \`unresolvedList\` に書き写してください。
          2. **役割の変換**: 実用書や解説本の場合、\`protagonistIdea\` は「悩める読者（生徒）」、\`firstEpisodeHook\` は「解決したい悩み（Pain Point）」として抽出。
          3. **ジャンル選定**: 
             ${genreOptions} から最適なIDを1つ選んでください。

          **入力データ:**
          ${planText}
      `;

      // Explicitly typed the generic to GenerateContentResponse to fix line 96 error
      const response = await fetchWithRetry<GenerateContentResponse>(() => 
          ai.models.generateContent({
              model: "gemini-3-pro-preview",
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: analysisSchema,
              },
          })
      );
      
      const jsonStr = response.text?.trim() || "{}";
      const result = JSON.parse(jsonStr);
      onAnalysisComplete(result.proposal, result.genreId);
    } catch (err: any) {
      console.error(err);
      setError(`情報の解析に失敗しました: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  if (isLoading) return <LoadingSpinner message="情報を100%継承するため、精密に解析しています..." />;

  return (
    <div className="mt-20">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-900"></div></div>
        <div className="relative flex justify-center"><span className="bg-black px-8 text-xs font-black text-gray-700 uppercase tracking-[0.5em]">Advanced Plan Analysis</span></div>
      </div>
      <form onSubmit={handleSubmit} className="mt-12 space-y-8">
        <textarea
          rows={12}
          className="w-full p-8 bg-gray-900/50 border border-gray-800 rounded-[2rem] text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent placeholder-gray-800 text-sm leading-relaxed shadow-inner"
          placeholder="Vol.1〜Vol.5の構成案やメモをここにすべて貼り付けてください。情報の完全継承を約束します。"
          value={planText}
          onChange={(e) => setPlanText(e.target.value)}
        />
        {error && <p className="text-xs text-red-500 font-bold ml-4">{error}</p>}
        <button type="submit" disabled={!planText.trim()} className="w-full flex justify-center items-center space-x-4 bg-indigo-600 text-white font-black py-6 rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 uppercase tracking-[0.2em]">
          <WandIcon className="w-6 h-6" />
          <span>情報の100%継承で深掘り開始</span>
        </button>
      </form>
    </div>
  );
};

export default ProjectPlanAnalyzer;
