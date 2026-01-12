
import React, { useState, useCallback, useEffect } from 'react';
import { generateFirstEpisode, generateNextEpisode, generateOneShotStory, generateEpisodeTitles, generateProjectTitle, generateChapterContent } from './services/geminiService';
import { getProjects, saveProject, deleteProject } from './services/projectService';
import type { Content } from '@google/genai';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { ProjectModal } from './components/ProjectModal';
import { DEFAULT_CHARACTERS } from './constants';
import type { Project, GenerationMode, Character, Episode } from './types';


const App: React.FC = () => {
  const [worldSetting, setWorldSetting] = useState<string>('');
  const [storyTheme, setStoryTheme] = useState<string>('');
  
  // Chapter Mode State
  const [seriesTitle, setSeriesTitle] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [tocList, setTocList] = useState<string>('');

  const [characters, setCharacters] = useState<Character[]>(DEFAULT_CHARACTERS);
  const [episodeTitles, setEpisodeTitles] = useState<string[]>(Array(12).fill(''));
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [chatHistory, setChatHistory] = useState<Content[] | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('series');
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(true);
  
  // Track the model used for the last operation
  const [currentModel, setCurrentModel] = useState<string | null>(null);

  // Project Management State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

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

  const handleSummaryChange = useCallback((index: number, newSummary: string) => {
    setEpisodes(prev => prev.map((ep, i) => i === index ? { ...ep, summary: newSummary } : ep));
  }, []);

  const handleEpisodeTitleChange = useCallback((index: number, title: string) => {
    setEpisodeTitles(prev => {
      const newTitles = [...prev];
      newTitles[index] = title;
      return newTitles;
    });
  }, []);

  // Check if the series is started
  const isSeriesStarted = generationMode === 'series' && episodes.length > 0;
  
  // Check if series is complete logic
  let isSeriesComplete = false;
  let optimalEpisodeCount: number | null = null;

  if (isSeriesStarted) {
    const lastEpisode = episodes[episodes.length - 1];
    if (lastEpisode.masterSheet && lastEpisode.masterSheet.unrecovered_list) {
      // "[未]" が含まれる項目があるか、またはリストが完全に空でない場合は未完結とみなす
      const remainingTopics = lastEpisode.masterSheet.unrecovered_list.filter(item => 
        item.includes('[未]') || (!item.includes('[済]') && item.trim() !== '')
      ).length;
      
      optimalEpisodeCount = episodes.length + remainingTopics;
      
      // 未完了トピックが0で、かつ1話以上存在する場合のみ完結とする
      if (remainingTopics === 0 && episodes.length > 0) {
          isSeriesComplete = true;
      }
    }
  }

  const handleReset = useCallback(() => {
    if (episodes.length > 0 && !window.confirm('現在の物語のデータは失われます。新しい物語を始めますか？')) {
      return;
    }
    setWorldSetting('');
    setStoryTheme('');
    setSeriesTitle('');
    setChapterTitle('');
    setTocList('');
    setCharacters(DEFAULT_CHARACTERS);
    setEpisodeTitles(Array(12).fill(''));
    setEpisodes([]);
    setChatHistory(null);
    setError(null);
    setCurrentProjectId(null);
    setIsAlertVisible(true);
    setCurrentModel(null);
  }, [episodes.length]);

  const handleModeChange = useCallback((mode: GenerationMode) => {
    if (episodes.length > 0) {
       if (!window.confirm('モードを変更すると現在の生成内容はリセットされます。よろしいですか？')) {
        return;
      }
      handleReset();
    }
    setGenerationMode(mode);
    setEpisodes([]);
    setChatHistory(null);
    setError(null);
  }, [episodes.length, handleReset]);

  const handleSaveProject = useCallback(async () => {
    let projectId = currentProjectId;
    let projectName = projects.find(p => p.id === projectId)?.name;

    if (!projectId) {
      try {
        let generatedName = "無題の企画";
        if (generationMode === 'chapter' && seriesTitle) {
             generatedName = seriesTitle + " " + chapterTitle;
        } else if (storyTheme) {
             generatedName = await generateProjectTitle(worldSetting, storyTheme);
        }
        
        const finalName = window.prompt("企画のタイトルを入力してください：", generatedName);
        if (!finalName) return; 
        projectName = finalName;
      } catch(e) {
        console.error("Failed to generate project title", e);
        projectName = window.prompt("企画のタイトルを入力してください：", "無題の企画");
        if (!projectName) return;
      }
    }
    
    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      name: projectName!,
      worldSetting,
      storyTheme,
      seriesTitle,
      chapterTitle,
      tocList,
      characters,
      episodeTitles,
      episodes,
      generationMode,
      chatHistory,
    };

    const saved = saveProject(projectData, projectId);
    setProjects(getProjects());
    setCurrentProjectId(saved.id);
    alert(`企画「${saved.name}」を保存しました。`);

  }, [currentProjectId, projects, worldSetting, storyTheme, seriesTitle, chapterTitle, tocList, characters, episodeTitles, episodes, generationMode, chatHistory]);

  const handleLoadProject = useCallback((id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setWorldSetting(project.worldSetting);
      setStoryTheme(project.storyTheme);
      setSeriesTitle(project.seriesTitle || '');
      setChapterTitle(project.chapterTitle || '');
      setTocList(project.tocList || '');
      setCharacters(project.characters);
      setEpisodeTitles(project.episodeTitles);
      setEpisodes(project.episodes);
      setGenerationMode(project.generationMode);
      setChatHistory(project.chatHistory);
      setCurrentProjectId(project.id);
      setError(null);
      setIsAlertVisible(true);
      setIsProjectModalOpen(false);
      if (project.episodes.length > 0) {
        setCurrentModel(project.episodes[project.episodes.length - 1].generatedBy || null);
      } else {
        setCurrentModel(null);
      }
    }
  }, [projects]);

  const handleDeleteProject = useCallback((id: string) => {
    const project = projects.find(p => p.id === id);
    if(project && window.confirm(`企画「${project.name}」を本当に削除しますか？`)) {
      deleteProject(id);
      setProjects(getProjects());
      if (currentProjectId === id) {
        handleReset();
      }
    }
  }, [projects, currentProjectId, handleReset]);


  const handleGenerateTitles = useCallback(async () => {
    if (isLoading || isGeneratingTitles) return;

    setIsGeneratingTitles(true);
    setError(null);

    try {
      const { titles, usedModel } = await generateEpisodeTitles(worldSetting, characters, storyTheme);
      setEpisodeTitles(titles);
      setCurrentModel(usedModel);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('APIの利用制限（クォータ）に達しました。数分待ってから再度お試しください。');
      } else {
        setError('タイトル案の生成に失敗しました。');
      }
    } finally {
      setIsGeneratingTitles(false);
    }
  }, [isLoading, isGeneratingTitles, worldSetting, characters, storyTheme]);


  const handleGenerate = useCallback(async () => {
    if (isLoading || isGeneratingTitles) return;

    setIsLoading(true);
    setError(null);
    
    try {
      if (generationMode === 'series') {
        const isContinuing = chatHistory && episodes.length > 0;
        if (isContinuing) {
          const lastEpisode = episodes[episodes.length - 1];
          const previousSummary = lastEpisode.summary;
          const previousMasterSheet = lastEpisode.masterSheet;
          
          const currentEpisodeIndex = episodes.length;
          const nextEpisodeTitle = episodeTitles[currentEpisodeIndex] || '';

          const { episode: nextEpisode, history: newHistory, usedModel } = await generateNextEpisode(
            previousSummary, 
            worldSetting, 
            characters, 
            storyTheme, 
            currentEpisodeIndex + 1, 
            nextEpisodeTitle, 
            chatHistory,
            previousMasterSheet
          );

          setEpisodes(prev => [...prev, nextEpisode]);
          setChatHistory(newHistory);
          setCurrentModel(usedModel);

          if (!nextEpisodeTitle && nextEpisode.title) {
            setEpisodeTitles(prev => {
              const newTitles = [...prev];
              while (newTitles.length <= currentEpisodeIndex) {
                 newTitles.push('');
              }
              newTitles[currentEpisodeIndex] = nextEpisode.title;
              return newTitles;
            });
          }

        } else {
          setEpisodes([]);
          setChatHistory(null);
          const firstEpisodeTitle = episodeTitles[0] || '';
          const { episode, history, usedModel } = await generateFirstEpisode(worldSetting, characters, storyTheme, firstEpisodeTitle);
          setEpisodes([episode]);
          setChatHistory(history);
          setCurrentModel(usedModel);

           if (!firstEpisodeTitle && episode.title) {
            setEpisodeTitles(prev => {
              const newTitles = [...prev];
              newTitles[0] = episode.title;
              return newTitles;
            });
          }
        }
      } else if (generationMode === 'chapter') {
          const { episode, usedModel } = await generateChapterContent(
              seriesTitle, 
              chapterTitle, 
              tocList, 
              worldSetting, 
              characters
          );
          setEpisodes(prev => [...prev, episode]);
          setCurrentModel(usedModel);

      } else { 
        setEpisodes([]);
        setChatHistory(null);
        setCurrentProjectId(null);
        const { episode, usedModel } = await generateOneShotStory(worldSetting, characters, storyTheme);
        setEpisodes([episode]);
        setCurrentModel(usedModel);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('APIの利用制限（クォータ）に達しました。1分ほど待ってから「再試行」してください。');
      } else {
        setError('物語の生成に失敗しました。');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isGeneratingTitles, generationMode, chatHistory, episodes, worldSetting, characters, storyTheme, episodeTitles, seriesTitle, chapterTitle, tocList]);
  

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <Header activeModel={currentModel} />
      <main className="flex-grow container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <InputPanel
          generationMode={generationMode}
          onModeChange={handleModeChange}
          worldSetting={worldSetting}
          onWorldSettingChange={setWorldSetting}
          storyTheme={storyTheme}
          onStoryThemeChange={setStoryTheme}
          seriesTitle={seriesTitle}
          onSeriesTitleChange={setSeriesTitle}
          chapterTitle={chapterTitle}
          onChapterTitleChange={setChapterTitle}
          tocList={tocList}
          onTocListChange={setTocList}
          characters={characters}
          onCharacterChange={handleCharacterChange}
          onAddCharacter={handleAddCharacter}
          onRemoveCharacter={handleRemoveCharacter}
          episodeTitles={episodeTitles}
          onEpisodeTitleChange={handleEpisodeTitleChange}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          isGeneratingTitles={isGeneratingTitles}
          onGenerateTitles={handleGenerateTitles}
          isSeriesStarted={isSeriesStarted}
          isSeriesComplete={isSeriesComplete}
          latestSummary={isSeriesStarted ? episodes[episodes.length - 1].summary : ''}
          onSummaryChange={(newSummary) => handleSummaryChange(episodes.length - 1, newSummary)}
          onReset={handleReset}
          onSave={handleSaveProject}
          onLoad={() => setIsProjectModalOpen(true)}
          isAlertVisible={isAlertVisible}
          onDismissAlert={() => setIsAlertVisible(false)}
          optimalEpisodeCount={optimalEpisodeCount}
        />
        <OutputPanel
          episodes={episodes}
          isLoading={isLoading}
          error={error}
          generationMode={generationMode}
        />
      </main>
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projects={projects}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
      />
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
