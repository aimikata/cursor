
import React, { useState, useCallback, ChangeEvent } from 'react';
import type { ImageFiles } from '../types';
import { UploadCloudIcon } from './icons/UploadCloudIcon';
import { XIcon } from './icons/XIcon';

interface InputFormProps {
  onGenerate: (text: string, images: ImageFiles, language: string) => void;
  isLoading: boolean;
}

const ImageInput: React.FC<{ id: string; label: string; onFileChange: (id: string, file: File | null) => void }> = ({ id, label, onFileChange }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setFileName(file.name);
            onFileChange(id, file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setFileName('');
        onFileChange(id, null);
    }

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative group hover:border-indigo-500 transition-colors">
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="max-h-32 rounded-md object-contain" />
                        <button onClick={handleRemove} className="absolute top-2 right-2 p-1 bg-white/70 rounded-full text-gray-600 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                           <XIcon className="h-4 w-4" />
                        </button>
                    </>
                ) : (
                    <div className="space-y-1 text-center">
                        <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor={id} className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <span>ファイルをアップロード</span>
                                <input id={id} name={id} type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('ja');
  const [images, setImages] = useState<ImageFiles>({ character: null, memorable1: null, memorable2: null, memorable3: null, author: null });

  const handleFileChange = useCallback((id: string, file: File | null) => {
    setImages(prev => ({ ...prev, [id]: file }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(text, images, language);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
            <div>
                <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
                    ターゲット市場 / 言語
                </label>
                <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                >
                    <option value="ja">日本国内向け (日本語)</option>
                    <option value="en">英語圏向け (英語 + 日本語訳)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                    ※英語圏を選択すると、Amazon.com向けの英語コンテンツを生成し、日本語訳を併記します。
                </p>
            </div>
            
            <div>
            <label htmlFor="prompt-text" className="block text-lg font-semibold text-gray-900 mb-2">
                企画コンセプト・世界観・本の構成
            </label>
            <textarea
                id="prompt-text"
                rows={10}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                placeholder={`世界観、企画案、本の目次など、AIが戦略を立てるために必要な情報をできるだけ詳しく貼り付けてください。\n\n例：\n【世界観】\n未来の東京を舞台にしたサイバーパンクな世界...\n\n【企画案】\n記憶を失ったアンドロイドが自らの過去を探す物語...\n\n【本の目次】\n第1章：目覚め\n第2章：追跡者\n...`}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageInput id="character" label="キャラクター画像 (必須)" onFileChange={handleFileChange} />
          <ImageInput id="author" label="著者プロフィール画像 (任意)" onFileChange={handleFileChange} />
          <ImageInput id="memorable1" label="印象的な画像 (1/3, 必須)" onFileChange={handleFileChange} />
          <ImageInput id="memorable2" label="印象的な画像 (2/3, 必須)" onFileChange={handleFileChange} />
          <ImageInput id="memorable3" label="印象的な画像 (3/3, 必須)" onFileChange={handleFileChange} />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {isLoading ? '生成中...' : 'ベストセラー戦略を生成'}
          </button>
        </div>
      </form>
    </div>
  );
};
