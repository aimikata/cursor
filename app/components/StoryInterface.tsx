'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  GenerationMode, Character, Episode, StoryGenerationInput, StoryOutput 
} from '@/app/lib/story/types';
import { ArrowLeft, Sparkles, Wrench, FileText, Save, Download, Copy, Edit3, Check, Layout } from 'lucide-react';

interface StoryInterfaceProps {
  onClose?: () => void;
  initialData?: StoryGenerationInput; // セミオートモード用
  onComplete?: (storyData: StoryOutput) => void; // ストーリー確定時に呼ばれる
  onProceedToPanel?: (panelData: {
    storyData: StoryOutput;
    characterImages: Map<string, string>; // characterId -> image base64
  }) => void; // コマ割りツールへ進む
}

const DEFAULT_CHARACTERS: Character[] = [
  { name: 'キャラクター1', role: '', image: null, imageMimeType: null },
];

export const StoryInterface: React.FC<StoryInterfaceProps> = ({ 
  onClose, 
  initialData,
  onComplete,
  onProceedToPanel
}) => {
  // モード判定
  const isSemiAutoMode = !!initialData;
  
  // 基本状態
  const [generationMode, setGenerationMode] = useState<GenerationMode>('series');
  const [worldSetting, setWorldSetting] = useState<string>('');
  const [storyTheme, setStoryTheme] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>(DEFAULT_CHARACTERS);
  const [episodeTitles, setEpisodeTitles] = useState<string[]>(Array(12).fill(''));
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [chatHistory, setChatHistory] = useState<any[] | null>(null);
  
  // UI状態
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedStory, setEditedStory] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // セミオートモード：初期データを設定
  useEffect(() => {
    if (isSemiAutoMode && initialData) {
      setWorldSetting(initialData.world_setting);
      setStoryTheme(initialData.world_setting); // テーマは世界観から生成
      
      // キャラクターを変換
      const convertedCharacters: Character[] = initialData.characters.map(char => ({
        name: char.name,
        role: char.description || char.role,
        image: null,
        imageMimeType: null,
      }));
      setCharacters(convertedCharacters.length > 0 ? convertedCharacters : DEFAULT_CHARACTERS);
    }
  }, [initialData, isSemiAutoMode]);

  // エピソード選択時に編集テキストを更新
  useEffect(() => {
    if (episodes.length > 0 && selectedEpisode < episodes.length) {
      setEditedStory(episodes[selectedEpisode].story);
    }
  }, [selectedEpisode, episodes]);

  const handleCharacterChange = useCallback((index: number, updatedCharacter: Partial<Character>) => {
    setCharacters(prev => 
      prev.map((char, i) => i === index ? { ...char, ...updatedCharacter } : char)
    );
  }, []);

  const handleAddCharacter = useCallback(() => {
    setCharacters(prev => [
      ...prev,
      { name: `キャラクター${prev.length + 1}`, role: '', image: null, imageMimeType: null }
    ]);
  }, []);

  const handleRemoveCharacter = useCallback((index: number) => {
    setCharacters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isLoading) return;
    if (!worldSetting.trim()) {
      setError('世界観を入力してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (generationMode === 'series') {
        const isContinuing = chatHistory && episodes.length > 0;
        if (isContinuing) {
          const lastEpisode = episodes[episodes.length - 1];
          const res = await fetch('/api/story/generate-next-episode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              previousSummary: lastEpisode.summary,
              worldSetting,
              characters,
              storyTheme,
              episodeNumber: episodes.length + 1,
              episodeTitle: episodeTitles[episodes.length] || '',
              history: chatHistory,
              previousMasterSheet: lastEpisode.masterSheet,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to generate next episode');
          setEpisodes(prev => [...prev, data.episode]);
          setChatHistory(data.history);
        } else {
          const res = await fetch('/api/story/generate-first-episode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              worldSetting,
              characters,
              storyTheme,
              episodeTitle: episodeTitles[0] || '',
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to generate first episode');
          setEpisodes([data.episode]);
          setChatHistory(data.history);
          if (!episodeTitles[0] && data.episode.title) {
            setEpisodeTitles(prev => {
              const newTitles = [...prev];
              newTitles[0] = data.episode.title;
              return newTitles;
            });
          }
        }
      } else if (generationMode === 'oneshot') {
        const res = await fetch('/api/story/generate-oneshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ worldSetting, characters, storyTheme }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate oneshot story');
        setEpisodes([data.episode]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '物語の生成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, generationMode, chatHistory, episodes, worldSetting, characters, storyTheme, episodeTitles]);

  const handleSaveEdit = useCallback(() => {
    if (episodes.length > 0 && selectedEpisode < episodes.length) {
      setEpisodes(prev => prev.map((ep, i) => 
        i === selectedEpisode ? { ...ep, story: editedStory } : ep
      ));
      setIsEditing(false);
    }
  }, [episodes, selectedEpisode, editedStory]);

  const handleConfirm = useCallback(() => {
    if (episodes.length === 0) {
      alert('ストーリーを生成してください。');
      return;
    }

    const storyOutput: StoryOutput = {
      world_setting: worldSetting,
      characters,
      episodes,
      generationMode,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    // ローカルストレージに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('story_output', JSON.stringify(storyOutput, null, 2));
    }

    // 親コンポーネントに通知
    if (onComplete) {
      onComplete(storyOutput);
    }

    // コマ割りツールへ進む（セミオートモードの場合）
    if (onProceedToPanel && isSemiAutoMode) {
      // キャラクター画像を取得（localStorageから）
      const imageRefsStr = localStorage.getItem('image_references');
      const imageRefs: Map<string, string> = new Map();
      if (imageRefsStr) {
        try {
          const refs = JSON.parse(imageRefsStr);
          Object.entries(refs).forEach(([id, img]) => {
            imageRefs.set(id, img as string);
          });
        } catch (e) {
          console.error('Failed to parse image references:', e);
        }
      }
      
      onProceedToPanel({
        storyData: storyOutput,
        characterImages: imageRefs,
      });
    } else {
      alert('ストーリーを確定しました。\n\n次の工程（コマ割り生成）に進む準備が整いました。');
    }
  }, [episodes, worldSetting, characters, generationMode, onComplete, onProceedToPanel, isSemiAutoMode]);

  const handleCopy = useCallback(async () => {
    if (episodes.length > 0 && selectedEpisode < episodes.length) {
      const ep = episodes[selectedEpisode];
      const text = `【${ep.title}】\n\n${ep.story}\n\n${ep.commentary ? `【深層解析】\n\n${ep.commentary}\n\n` : ''}`;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }, [episodes, selectedEpisode]);

  const isSeriesStarted = generationMode === 'series' && episodes.length > 0;

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">
      <div className="max-w-7xl mx-auto p-4 sm:p-12">
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-12 border-b border-gray-900 pb-8">
          <div className="flex items-center space-x-8">
            <div className={`p-6 rounded-[2rem] shadow-2xl ${
              isSemiAutoMode 
                ? 'bg-green-600 shadow-green-600/30' 
                : 'bg-indigo-600 shadow-indigo-600/30'
            }`}>
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
                Story <span className={isSemiAutoMode ? 'text-green-400' : 'text-indigo-600'}>Generator</span>
              </h1>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.6em] mt-3">
                {isSemiAutoMode ? 'Semi-Auto Mode' : 'Manual Mode'}
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            {onClose && (
              <button 
                onClick={onClose}
                className="px-10 py-4 rounded-full bg-gray-900 hover:bg-gray-800 text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-gray-800 flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>戻る</span>
              </button>
            )}
          </div>
        </header>

        {/* モード表示 */}
        <div className={`border rounded-2xl p-4 mb-8 ${
          isSemiAutoMode 
            ? 'bg-green-900/20 border-green-500/30' 
            : 'bg-indigo-900/20 border-indigo-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isSemiAutoMode ? (
                <>
                  <Sparkles className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm font-bold text-green-400 uppercase tracking-widest">Semi-Auto Mode</p>
                    <p className="text-xs text-gray-400">前工程のデータを自動読み込み中</p>
                  </div>
                </>
              ) : (
                <>
                  <Wrench className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Manual Mode</p>
                    <p className="text-xs text-gray-400">手動でストーリーを入力・生成します</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 入力パネル */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">入力</h2>
            
            {/* モード選択（マニュアルモードのみ） */}
            {!isSemiAutoMode && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">生成モード</label>
                <div className="flex space-x-2">
                  {(['series', 'oneshot'] as GenerationMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setGenerationMode(mode)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        generationMode === mode
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {mode === 'series' ? '連載' : '一話完結'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 世界観 */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">世界観・設定</label>
              <textarea
                value={worldSetting}
                onChange={(e) => setWorldSetting(e.target.value)}
                rows={6}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:ring-2 focus:ring-indigo-500"
                placeholder="世界観や舞台設定を入力してください..."
                disabled={isSemiAutoMode}
              />
            </div>

            {/* テーマ（マニュアルモードのみ） */}
            {!isSemiAutoMode && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">テーマ・未回収リスト</label>
                <textarea
                  value={storyTheme}
                  onChange={(e) => setStoryTheme(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="物語のテーマや伏線を入力..."
                />
              </div>
            )}

            {/* キャラクター */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold">キャラクター</label>
                {!isSemiAutoMode && (
                  <button
                    onClick={handleAddCharacter}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    + 追加
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {characters.map((char, index) => (
                  <div key={index} className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => handleCharacterChange(index, { name: e.target.value })}
                        className="font-bold text-white bg-transparent focus:outline-none flex-1"
                        placeholder="名前"
                        disabled={isSemiAutoMode}
                      />
                      {!isSemiAutoMode && characters.length > 1 && (
                        <button
                          onClick={() => handleRemoveCharacter(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          削除
                        </button>
                      )}
                    </div>
                    <textarea
                      value={char.role}
                      onChange={(e) => handleCharacterChange(index, { role: e.target.value })}
                      rows={2}
                      className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-300 resize-none"
                      placeholder="役割・設定..."
                      disabled={isSemiAutoMode}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 生成ボタン */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !worldSetting.trim()}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-all shadow-lg"
            >
              {isLoading ? '生成中...' : isSeriesStarted ? '次のエピソードを生成' : 'ストーリーを生成'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* 出力パネル */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">出力</h2>
              {episodes.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'コピー済み!' : 'コピー'}</span>
                  </button>
                  {isEditing ? (
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>保存</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>編集</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {episodes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>ストーリーを生成してください</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* エピソード選択タブ */}
                {episodes.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {episodes.map((ep, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedEpisode(index)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                          selectedEpisode === index
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {ep.title || `第${index + 1}話`}
                      </button>
                    ))}
                  </div>
                )}

                {/* ストーリー表示/編集 */}
                {selectedEpisode < episodes.length && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">
                      {episodes[selectedEpisode].title || `第${selectedEpisode + 1}話`}
                    </h3>
                    {isEditing ? (
                      <textarea
                        value={editedStory}
                        onChange={(e) => setEditedStory(e.target.value)}
                        rows={20}
                        className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                      />
                    ) : (
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {episodes[selectedEpisode].story}
                        </div>
                        {episodes[selectedEpisode].commentary && (
                          <div className="mt-8 pt-8 border-t border-gray-700">
                            <h4 className="text-lg font-bold text-indigo-400 mb-4">【深層解析・設定資料】</h4>
                            <div className="text-gray-400 whitespace-pre-wrap leading-relaxed">
                              {episodes[selectedEpisode].commentary}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 確定ボタン */}
        {episodes.length > 0 && (
          <div className="mt-8 bg-gray-900/90 p-6 rounded-2xl border border-gray-800 sticky bottom-4 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">
                  {episodes.length} エピソード生成済み
                </span>
              </div>
              <button
                onClick={handleConfirm}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-white transition-all shadow-lg flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>ストーリーを確定して次へ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
