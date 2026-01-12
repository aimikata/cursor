'use client';

import React from 'react';
import { X, Layout, Briefcase, Video, Sparkles, Wrench } from 'lucide-react';

export type PanelToolType = 'normal' | 'business' | 'youtube';

interface PanelToolSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (toolType: PanelToolType) => void;
  mode?: 'semi-auto' | 'manual';
}

export const PanelToolSelectionModal: React.FC<PanelToolSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  mode = 'manual',
}) => {
  if (!isOpen) return null;

  const tools = [
    {
      id: 'normal' as PanelToolType,
      title: '通常用コマ割り',
      description: '物語・エンタメ向けのコマ割り生成',
      icon: <Layout className="w-8 h-8" />,
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-500',
      borderColor: 'border-indigo-500',
    },
    {
      id: 'business' as PanelToolType,
      title: 'ビジネス用コマ割り',
      description: 'ビジネス・自己啓発向けのコマ割り生成',
      icon: <Briefcase className="w-8 h-8" />,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-500',
      borderColor: 'border-blue-500',
    },
    {
      id: 'youtube' as PanelToolType,
      title: '動画用コマ割り',
      description: 'YouTube動画向けのコマ割り生成',
      icon: <Video className="w-8 h-8" />,
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-500',
      borderColor: 'border-red-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl max-w-4xl w-full mx-4 p-8 relative">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {mode === 'semi-auto' ? (
              <Sparkles className="w-8 h-8 text-green-400" />
            ) : (
              <Wrench className="w-8 h-8 text-indigo-400" />
            )}
            <div>
              <h2 className="text-3xl font-black text-white">
                コマ割りツールを選択
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {mode === 'semi-auto' ? 'セミオートモード' : 'マニュアルモード'}
              </p>
            </div>
          </div>
          <p className="text-gray-300">
            ストーリーとキャラクター画像をコマ割りツールに渡します。用途に応じてツールを選択してください。
          </p>
        </div>

        {/* ツール選択グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                onSelect(tool.id);
                onClose();
              }}
              className={`group relative p-8 rounded-2xl border-2 ${tool.borderColor} bg-gray-800/50 hover:bg-gray-800 transition-all text-left overflow-hidden`}
            >
              {/* 背景グラデーション */}
              <div className={`absolute inset-0 ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              {/* コンテンツ */}
              <div className="relative z-10">
                <div className={`${tool.color} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* ホバー時の矢印 */}
              <div className="absolute bottom-4 right-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* フッター */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            選択したツールに、ストーリーとキャラクター画像が自動的に渡されます
          </p>
        </div>
      </div>
    </div>
  );
};
