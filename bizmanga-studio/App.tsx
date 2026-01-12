import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MangaViewer from './components/MangaViewer';
import EditModal from './components/EditModal';
import RegenerateModal from './components/RegenerateModal';
import ApiKeyModal from './components/ApiKeyModal';
import { MangaPage, CharacterImage, Language } from './types';
import { generatePageImage } from './services/geminiService';
import { downloadAllImagesAsZip } from './utils/downloadUtils';

export default function App() {
  let [pages, setPages] = useState<MangaPage[]>([]);
  let [characterImages, setCharacterImages] = useState<CharacterImage[]>([]);
  let [editingPage, setEditingPage] = useState<MangaPage | null>(null); // Visual edit
  let [regeneratingPage, setRegeneratingPage] = useState<MangaPage | null>(null); // Prompt edit/Regen
  let [isGeneratingAll, setIsGeneratingAll] = useState(false);
  let [lang, setLang] = useState<Language>('ja');
  let [apiKey, setApiKey] = useState<string>('');
  let [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Load API Key on mount
  useEffect(() => {
    let storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowApiKeyModal(true);
    }
  }, []);

  function handleSaveApiKey(key: string) {
    setApiKey(key);
    localStorage.setItem('GEMINI_API_KEY', key);
    setShowApiKeyModal(false);
  }

  function handleCsvLoaded(data: MangaPage[]) {
    setPages(data);
  }

  function handleImagesLoaded(imgs: CharacterImage[]) {
    setCharacterImages(prev => {
        let existingNames = new Set(prev.map(p => p.name));
        let newUnique = imgs.filter(i => !existingNames.has(i.name));
        return [...prev, ...newUnique];
    });
  }

  // Logic to generate a specific page
  async function generateSpecificPage(page: MangaPage, newPrompt?: string) {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    let promptToUse = newPrompt || page.prompt;

    setPages(prev => prev.map(p => 
      p.pageNumber === page.pageNumber ? { ...p, status: 'generating', error: undefined, prompt: promptToUse } : p
    ));

    let updatedPageObj = { ...page, prompt: promptToUse };

    try {
      let imageUrl = await generatePageImage(updatedPageObj, characterImages, apiKey);
      
      setPages(prev => prev.map(p => 
        p.pageNumber === page.pageNumber ? { ...p, status: 'completed', imageUrl } : p
      ));
    } catch (error: any) {
      setPages(prev => prev.map(p => 
        p.pageNumber === page.pageNumber ? { ...p, status: 'error', error: error.message } : p
      ));
    }
  }

  function handleGenerate(page: MangaPage) {
    generateSpecificPage(page);
  }

  async function handleGenerateAll() {
    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }
    setIsGeneratingAll(true);

    for (let page of pages) {
        if (page.status === 'generating') continue;
        await generateSpecificPage(page);
    }

    setIsGeneratingAll(false);
    alert(lang === 'ja' 
        ? `全${pages.length}ページの生成が完了しました。一括ダウンロードして確認してください。` 
        : `Generation of ${pages.length} pages complete. Please download all to review.`
    );
  }

  function handleDownloadAll() {
      downloadAllImagesAsZip(pages);
  }

  function handleEditClick(page: MangaPage) {
    setEditingPage(page);
  }

  function handleRegenerateClick(page: MangaPage) {
      setRegeneratingPage(page);
  }

  function handleImageUpdate(newImage: string) {
    if (editingPage) {
        setPages(prev => prev.map(p => 
            p.pageNumber === editingPage.pageNumber ? { ...p, imageUrl: newImage } : p
        ));
    }
  }

  function handleRegenerateConfirm(pageNumber: number, newPrompt: string) {
      let page = pages.find(p => p.pageNumber === pageNumber);
      if (page) {
          generateSpecificPage(page, newPrompt);
      }
  }

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-200 overflow-hidden font-sans">
      <Sidebar 
        onCsvLoaded={handleCsvLoaded} 
        onImagesLoaded={handleImagesLoaded} 
        onGenerateAll={handleGenerateAll} 
        onDownloadAll={handleDownloadAll}
        characterImages={characterImages}
        hasCsv={pages.length > 0}
        isGeneratingAll={isGeneratingAll}
        lang={lang}
        setLang={setLang}
        pages={pages}
      />
      
      <MangaViewer 
        pages={pages} 
        onGenerate={handleGenerate}
        onEdit={handleEditClick}
        onRegenerate={handleRegenerateClick}
        lang={lang}
      />

      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onSave={handleSaveApiKey}
        lang={lang}
      />

      {editingPage && editingPage.imageUrl && (
        <EditModal 
            isOpen={!!editingPage}
            onClose={() => setEditingPage(null)}
            originalImage={editingPage.imageUrl}
            onImageUpdate={handleImageUpdate}
            apiKey={apiKey}
        />
      )}

      {regeneratingPage && (
          <RegenerateModal 
            isOpen={!!regeneratingPage}
            onClose={() => setRegeneratingPage(null)}
            page={regeneratingPage}
            onConfirm={handleRegenerateConfirm}
            lang={lang}
          />
      )}
    </div>
  );
}