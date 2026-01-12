
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MangaViewer from './components/MangaViewer';
import EditModal from './components/EditModal';
import RegenerateModal from './components/RegenerateModal';
import ApiKeyModal from './components/ApiKeyModal';
import { MangaPage, CharacterImage, Language } from './types';
import { generatePageImage } from './services/geminiService';
import { downloadAllImagesAsZip } from './utils/downloadUtils';
import { MODELS, SAFE_MODE_DELAYS, PRICING } from './constants';
import { t } from './i18n';

export default function App() {
  let [pages, setPages] = useState<MangaPage[]>([]);
  let [characterImages, setCharacterImages] = useState<CharacterImage[]>([]);
  let [editingPage, setEditingPage] = useState<MangaPage | null>(null);
  let [regeneratingPage, setRegeneratingPage] = useState<MangaPage | null>(null);
  let [isGeneratingAll, setIsGeneratingAll] = useState(false);
  let [lang, setLang] = useState<Language>('ja');
  let [apiKey, setApiKey] = useState<string>('');
  let [showApiKeyModal, setShowApiKeyModal] = useState(false);
  let [selectedModel, setSelectedModel] = useState<string>(MODELS.HIGH_QUALITY);
  
  let [isBudgetMode, setIsBudgetMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('IS_BUDGET_MODE');
    return saved ? JSON.parse(saved) : false;
  });
  
  let [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    let storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowApiKeyModal(true);
    }

    let storedUsage = localStorage.getItem('DAILY_USAGE');
    let storedDate = localStorage.getItem('USAGE_DATE');
    let today = new Date().toDateString();

    if (storedDate === today && storedUsage) {
      setUsageCount(parseInt(storedUsage, 10));
    } else {
      setUsageCount(0);
      localStorage.setItem('USAGE_DATE', today);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('DAILY_USAGE', usageCount.toString());
    localStorage.setItem('USAGE_DATE', new Date().toDateString());
  }, [usageCount]);

  useEffect(() => {
    localStorage.setItem('IS_BUDGET_MODE', JSON.stringify(isBudgetMode));
  }, [isBudgetMode]);

  function incrementUsage() {
    setUsageCount(prev => prev + 1);
  }

  function handleResetUsage() {
    if (confirm(lang === 'ja' ? '使用量カウンターをリセットしますか？' : 'Reset usage counter?')) {
      setUsageCount(0);
    }
  }

  function handleSaveApiKey(key: string) {
    setApiKey(key);
    localStorage.setItem('GEMINI_API_KEY', key);
    setShowApiKeyModal(false);
  }
  
  function handleResetApiKey() {
      if (confirm(lang === 'ja' ? '現在のAPIキーを削除して再入力しますか？' : 'Clear current API key and re-enter?')) {
          setApiKey('');
          localStorage.removeItem('GEMINI_API_KEY');
          setShowApiKeyModal(true);
      }
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

  async function generateSpecificPage(page: MangaPage, newPrompt?: string, maxRetries = 0) {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    // 1. Check Daily Limit as a Warning only
    let pricing = PRICING[selectedModel] || PRICING[MODELS.HIGH_QUALITY];
    let dailyLimit = pricing.dailyFree;
    
    if (usageCount >= dailyLimit) {
        const msg = lang === 'ja' 
            ? `【警告】本日の推奨無料上限 (${dailyLimit}回) を超えています。続行しますか？ (課金設定済みの場合は料金が発生する可能性があります。無料枠の場合はエラーになる可能性があります)` 
            : `[Warning] You have exceeded the recommended daily free limit (${dailyLimit}). Proceed anyway? (Charges may apply if billing is enabled, or it may error on free tier)`;
        
        if (!confirm(msg)) {
            return;
        }
    }

    let promptToUse = newPrompt || page.prompt;

    setPages(prev => prev.map(p => 
      p.pageNumber === page.pageNumber ? { ...p, status: 'generating', error: undefined, prompt: promptToUse } : p
    ));

    let updatedPageObj = { ...page, prompt: promptToUse };

    const attemptGeneration = async (retryCount: number): Promise<void> => {
      try {
        let imageUrl = await generatePageImage(updatedPageObj, characterImages, apiKey, selectedModel);
        incrementUsage();
        setPages(prev => prev.map(p => 
          p.pageNumber === page.pageNumber ? { ...p, status: 'completed', imageUrl } : p
        ));
      } catch (error: any) {
        let isRateLimit = error.message.includes('429') || error.message.includes('Quota');
        if (isRateLimit && retryCount > 0) {
          let delay = 2000 * Math.pow(2, maxRetries - retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptGeneration(retryCount - 1);
        }
        setPages(prev => prev.map(p => 
          p.pageNumber === page.pageNumber ? { ...p, status: 'error', error: error.message } : p
        ));
      }
    };

    await attemptGeneration(maxRetries);
  }

  function handleGenerate(page: MangaPage) {
    generateSpecificPage(page, undefined, 0); 
  }

  async function handleGenerateAll() {
    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }

    let pricing = PRICING[selectedModel] || PRICING[MODELS.HIGH_QUALITY];
    if (usageCount >= pricing.dailyFree) {
        const msg = lang === 'ja' 
          ? `本日の推奨上限を超えていますが、一括生成を強行しますか？` 
          : `Exceeded recommended limit. Force batch generation?`;
        if (!confirm(msg)) return;
    }
    
    setIsGeneratingAll(true);
    let pendingPages = pages.filter(p => p.status !== 'completed' && p.status !== 'generating');
    
    if (pendingPages.length === 0) {
        setIsGeneratingAll(false);
        return;
    }

    if (isBudgetMode) {
        let delayMs = SAFE_MODE_DELAYS[selectedModel] || 5000;
        for (let i = 0; i < pendingPages.length; i++) {
            let page = pendingPages[i];
            if (i > 0) await new Promise(resolve => setTimeout(resolve, delayMs));
            await generateSpecificPage(page, undefined, 1);
        }
    } else {
        let concurrency = selectedModel === MODELS.FAST ? 3 : 1;
        let maxRetries = 3;

        if (concurrency === 1) {
            for (let page of pendingPages) {
                await generateSpecificPage(page, undefined, maxRetries);
            }
        } else {
            let queue = [...pendingPages];
            let runWorker = async () => {
                 while (queue.length > 0) {
                     let page = queue.shift();
                     if (page) await generateSpecificPage(page, undefined, maxRetries);
                 }
            };
            let workers = [];
            for (let i = 0; i < concurrency; i++) workers.push(runWorker());
            await Promise.all(workers);
        }
    }

    setIsGeneratingAll(false);
    alert(lang === 'ja' ? `生成処理が完了しました。` : `Generation process complete.`);
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

  function handleEditSuccess() {
      incrementUsage();
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
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        usageCount={usageCount}
        resetUsage={handleResetUsage}
        isBudgetMode={isBudgetMode}
        setIsBudgetMode={setIsBudgetMode}
        onChangeApiKey={handleResetApiKey}
      />
      <MangaViewer 
        pages={pages} 
        onGenerate={handleGenerate}
        onEdit={handleEditClick}
        onRegenerate={handleRegenerateClick}
        lang={lang}
      />
      <ApiKeyModal isOpen={showApiKeyModal} onSave={handleSaveApiKey} lang={lang} />
      {editingPage && editingPage.imageUrl && (
        <EditModal 
            isOpen={!!editingPage}
            onClose={() => setEditingPage(null)}
            originalImage={editingPage.imageUrl}
            onImageUpdate={handleImageUpdate}
            apiKey={apiKey}
            onSuccess={handleEditSuccess}
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
