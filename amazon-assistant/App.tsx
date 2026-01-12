
import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { Header } from './components/Header';
import { Spinner } from './components/Spinner';
import { AlertTriangle } from './components/icons/AlertTriangleIcon';
import type { GeneratedContent, ImageFiles, AllImagePayloads, ImagePayload } from './types';
import { generateBestsellerStrategy } from './services/geminiService';

const App: React.FC = () => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePayloads, setImagePayloads] = useState<AllImagePayloads | null>(null);
  const [promptText, setPromptText] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('ja');

  const fileToBase64 = (file: File): Promise<ImagePayload> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const [mimeType, base64Data] = result.split(';base64,');
        resolve({ mimeType: mimeType.replace('data:', ''), data: base64Data });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = useCallback(async (text: string, images: ImageFiles, language: string) => {
    if (!text || !images.character || !images.memorable1 || !images.memorable2 || !images.memorable3) {
      setError('テキストと、キャラクターおよび印象的な画像（3枚）は必須です。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    setPromptText(text);
    setTargetLanguage(language);

    try {
      const requiredImagePromises = [
        fileToBase64(images.character),
        fileToBase64(images.memorable1),
        fileToBase64(images.memorable2),
        fileToBase64(images.memorable3),
      ];
      
      const [character, memorable1, memorable2, memorable3] = await Promise.all(requiredImagePromises);

      const payloads: AllImagePayloads = {
        character,
        memorable1,
        memorable2,
        memorable3,
      };

      if (images.author) {
        payloads.author = await fileToBase64(images.author);
      }
      setImagePayloads(payloads);

      const result = await generateBestsellerStrategy(text, payloads, language);
      setGeneratedContent(result);
    } catch (e) {
      console.error(e);
      setError('コンテンツの生成中にエラーが発生しました。しばらくしてからもう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleRefine = useCallback(async (section: string, request: string) => {
    if (!generatedContent || !imagePayloads || !promptText) {
      setError('修正の元となるデータが見つかりません。');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateBestsellerStrategy(promptText, imagePayloads, targetLanguage, {
        section,
        request,
        originalContent: generatedContent
      });
      setGeneratedContent(result);
    } catch (e) {
      console.error(e);
      setError('コンテンツの修正中にエラーが発生しました。しばらくしてからもう一度お試しください。');
    } finally {
      setIsLoading(false);
    }

  }, [generatedContent, imagePayloads, promptText, targetLanguage]);


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
          <div className="lg:sticky lg:top-8">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex flex-col justify-center items-center rounded-xl z-10">
                <Spinner />
                <p className="mt-4 text-lg font-semibold text-gray-700">AIが最高の戦略を生成中...</p>
                <p className="text-sm text-gray-500">少々お待ちください</p>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center" role="alert">
                <AlertTriangle className="h-6 w-6 mr-3"/>
                <div>
                  <p className="font-bold">エラー</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
            {generatedContent ? (
              <OutputDisplay 
                  content={generatedContent} 
                  onRefine={handleRefine} 
                  language={targetLanguage} 
                  images={imagePayloads} 
              />
            ) : (
                !isLoading && !error && (
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center h-[calc(100vh-10rem)] flex flex-col justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-indigo-300 mb-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                        <h2 className="text-2xl font-bold text-gray-700">準備完了</h2>
                        <p className="mt-2 text-gray-500 max-w-md">左側のフォームにあなたの本の情報を入力して、Amazonベストセラー戦略の生成を開始してください。</p>
                    </div>
                )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
