import React from 'react';
import type { Project } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projects,
  onLoadProject,
  onDeleteProject,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-purple-300">保存した企画を読み込む</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="閉じる">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <main className="p-6 overflow-y-auto custom-scrollbar">
          {projects.length === 0 ? (
            <p className="text-center text-gray-400">保存された企画はありません。</p>
          ) : (
            <ul className="space-y-3">
              {projects.map(project => (
                <li key={project.id} className="bg-gray-900 rounded-lg p-4 flex justify-between items-center group">
                  <div>
                    <h3 className="font-bold text-lg text-cyan-300">{project.name}</h3>
                    <p className="text-sm text-gray-400 truncate max-w-md" title={project.storyTheme}>
                      {project.storyTheme}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      最終更新: {new Date(project.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onLoadProject(project.id)}
                      className="py-2 px-4 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700"
                    >
                      読み込む
                    </button>
                    <button 
                      onClick={() => onDeleteProject(project.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md"
                      aria-label={`「${project.name}」を削除`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
      `}</style>
    </div>
  );
};
