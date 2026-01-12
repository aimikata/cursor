import React from 'react';

interface HeaderProps {
  activeModel: string | null;
}

export const Header: React.FC<HeaderProps> = ({ activeModel }) => {
  const getModelDisplayName = (model: string) => {
    if (model.includes('gemini-3-pro') || model.includes('gemini-3')) return 'Gemini 3.0 Pro (High Quality)';
    if (model.includes('flash')) return 'Gemini 2.5 Flash (Standard)';
    return model;
  };

  const getModelBadgeColor = (model: string) => {
    if (model.includes('gemini-3-pro') || model.includes('gemini-3')) return 'bg-purple-900/80 text-purple-200 border-purple-500/50';
    if (model.includes('flash')) return 'bg-green-900/80 text-green-200 border-green-500/50';
    return 'bg-gray-800 text-gray-400 border-gray-600';
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            AI Manga Story Weaver
          </h1>
          <p className="text-sm text-gray-400 mt-1">あなただけの一話完結・連続物語を創ろう</p>
        </div>
        
        {activeModel && (
          <div className={`px-3 py-1 rounded-full text-xs font-mono border flex items-center gap-2 shadow-sm ${getModelBadgeColor(activeModel)}`}>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
            Model: {getModelDisplayName(activeModel)}
          </div>
        )}
        {!activeModel && (
          <div className="px-3 py-1 rounded-full text-xs font-mono border bg-gray-800/50 text-gray-500 border-gray-700">
             Model: Ready (Gemini 3.0 Pro)
          </div>
        )}
      </div>
    </header>
  );
};