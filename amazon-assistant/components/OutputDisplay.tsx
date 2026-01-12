
import React, { useState } from 'react';
import type { GeneratedContent, APlusModule, AllImagePayloads, ImagePayload } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { APlusIcon } from './icons/APlusIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { EditIcon } from './icons/EditIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { DollarIcon } from './icons/DollarIcon';
import { FileCheckIcon } from './icons/FileCheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { generateAPlusImage } from '../services/geminiService';

const CopyButton: React.FC<{ text: string, minimal?: boolean }> = ({ text, minimal = false }) => {
    const [copied, setCopied] = React.useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (minimal) {
        return (
            <button onClick={copyToClipboard} title="コピー" className="text-gray-400 hover:text-indigo-600 transition-colors relative">
                <ClipboardIcon className="h-4 w-4" />
                {copied && <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] bg-gray-800 text-white px-1 py-0.5 rounded whitespace-nowrap">Copied</span>}
            </button>
        )
    }

    return (
        <button onClick={copyToClipboard} title="コピー" className="p-2 bg-gray-100 rounded-md text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors relative">
            <ClipboardIcon className="h-5 w-5" />
            {copied && <span className="absolute -bottom-7 -right-2 text-xs bg-gray-800 text-white px-2 py-1 rounded">コピー!</span>}
        </button>
    );
};

const RefineForm: React.FC<{ sectionTitle: string; onRefine: (section: string, request: string) => void; onCancel: () => void }> = ({ sectionTitle, onRefine, onCancel }) => {
    const [request, setRequest] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (request.trim()) {
            onRefine(sectionTitle, request.trim());
        }
    };
    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg animate-fade-in">
            <label htmlFor={`refine-${sectionTitle}`} className="block text-sm font-medium text-gray-700 mb-1">
                「{sectionTitle}」の修正内容を具体的に入力してください。
            </label>
            <textarea
                id={`refine-${sectionTitle}`}
                rows={3}
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholder="例：タイトルをもっと短く、インパクト重視に。"
            />
            <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={onCancel} className="px-3 py-1 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">
                    キャンセル
                </button>
                <button type="submit" className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    修正を依頼
                </button>
            </div>
        </form>
    );
};

const KDPFieldRow: React.FC<{ label: string; value: string | undefined; subValue?: string }> = ({ label, value, subValue }) => {
    if (!value) return null;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 py-3 border-b border-gray-100 last:border-0 items-start">
            <div className="sm:col-span-4 text-sm font-medium text-gray-500 pt-1">{label}</div>
            <div className="sm:col-span-8 flex items-start justify-between group">
                <div className="w-full">
                    <p className="text-gray-900 font-medium break-words">{value}</p>
                    {subValue && <p className="text-gray-500 text-xs mt-0.5">{subValue}</p>}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <CopyButton text={value} minimal />
                </div>
            </div>
        </div>
    );
};

const OutputSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; onRefine: (section: string, request: string) => void; }> = ({ title, icon, children, onRefine }) => {
    const [isRefining, setIsRefining] = useState(false);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 relative">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center">
                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-4">
                        {icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsRefining(!isRefining)} title="修正を依頼する" className="p-2 bg-gray-100 rounded-md text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                        <EditIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="prose prose-sm max-w-none text-gray-600">
                {children}
            </div>
            {isRefining && <RefineForm sectionTitle={title} onRefine={onRefine} onCancel={() => setIsRefining(false)} />}
        </div>
    );
}

const APlusModuleCard: React.FC<{ module: APlusModule, language: string, referenceImage?: ImagePayload }> = ({ module, language, referenceImage }) => {
    const [isGeneratingImg, setIsGeneratingImg] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // 画像生成には、よりインパクトの強い「大見出し(bigHeadline)」を使用する。存在しない場合は「見出し」を使用。
    const textForImage = module.bigHeadline || module.headline;

    const handleGenerateImage = async () => {
        setIsGeneratingImg(true);
        try {
            const image = await generateAPlusImage(module.imageSuggestion, textForImage, language, referenceImage);
            setGeneratedImage(image);
        } catch (error) {
            alert("画像の生成に失敗しました。");
            console.error(error);
        } finally {
            setIsGeneratingImg(false);
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900">{module.moduleName}</h4>
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">{module.purpose}</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <p className="font-semibold text-sm text-indigo-700 mt-3">大見出し (大きなタブタイトル):</p>
                    <p className="text-sm text-gray-800 p-2 bg-white rounded border border-gray-200 select-all font-bold">{module.bigHeadline}</p>

                    <p className="font-semibold text-sm text-indigo-700 mt-3">見出し (タイトル):</p>
                    <p className="text-sm text-gray-800 p-2 bg-white rounded border border-gray-200 select-all">{module.headline}</p>

                    <p className="font-semibold text-sm text-indigo-700 mt-3">説明文:</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap select-all">{module.description}</p>

                    <p className="font-semibold text-sm text-indigo-700 mt-3">画像案:</p>
                    <p className="text-xs text-gray-600 italic mb-2">{module.imageSuggestion}</p>
                </div>
                
                <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg p-2 min-h-[200px]">
                    {generatedImage ? (
                        <div className="w-full">
                            <img src={generatedImage} alt="Generated A+ Content" className="w-full h-auto rounded shadow-sm mb-2" />
                            <a href={generatedImage} download={`aplus_${module.moduleName}.png`} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 font-medium">
                                <DownloadIcon className="h-3 w-3" /> 画像をダウンロード
                            </a>
                        </div>
                    ) : (
                        <div className="text-center">
                            {isGeneratingImg ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                                    <span className="text-xs text-gray-500">生成中...</span>
                                </div>
                            ) : (
                                <button onClick={handleGenerateImage} className="flex flex-col items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors p-4">
                                    <div className="bg-indigo-50 p-3 rounded-full">
                                        <SparklesIcon className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium">画像を生成 (Gemini)</span>
                                    <span className="text-[10px] text-gray-400">970x545 (16:9) / マンガスタイル</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const formatContentForDownload = (content: GeneratedContent): string => {
    let text = `Amazon KDP 出版申請・戦略シート\n=================================\n\n`;
    
    text += `I. Kindle本の詳細\n---------------------------------\n`;
    text += `言語: ${content.kdpDetails.language}\n`;
    text += `本のタイトル: ${content.kdpDetails.title}\n`;
    text += `タイトル(カナ): ${content.kdpDetails.titleKana}\n`;
    text += `タイトル(ローマ字): ${content.kdpDetails.titleRomaji}\n`;
    text += `サブタイトル: ${content.kdpDetails.subtitle}\n`;
    text += `サブタイトル(カナ): ${content.kdpDetails.subtitleKana}\n`;
    text += `サブタイトル(ローマ字): ${content.kdpDetails.subtitleRomaji}\n`;
    text += `シリーズ: ${content.kdpDetails.seriesName} (巻数: ${content.kdpDetails.seriesVolume})\n`;
    text += `著者: ${content.kdpDetails.author}\n`;
    text += `\n[内容紹介]\n${content.kdpDetails.description}\n\n`;
    text += `出版権: ${content.kdpDetails.publishingRights}\n`;
    text += `キーワード: ${content.kdpDetails.keywords.join(', ')}\n`;
    text += `カテゴリー: ${content.kdpDetails.categories.join(' / ')}\n`;
    text += `成人向け: ${content.kdpDetails.adultContent}\n\n`;

    text += `II. Kindle本のコンテンツ\n---------------------------------\n`;
    text += `DRM: ${content.kdpContent.drm}\n`;
    text += `原稿ファイル名(例): ${content.kdpContent.manuscriptFileName}\n`;
    text += `表紙ファイル名(例): ${content.kdpContent.coverFileName}\n\n`;

    text += `III. Kindle本の価格設定\n---------------------------------\n`;
    text += `KDPセレクト: ${content.kdpPricing.kdpSelect}\n`;
    text += `マーケットプレイス: ${content.kdpPricing.marketplace}\n`;
    text += `テリトリー: ${content.kdpPricing.territory}\n`;
    text += `ロイヤリティプラン: ${content.kdpPricing.royaltyPlan}\n`;
    text += `価格: ${content.kdpPricing.price}\n\n`;

    text += `IV. A+コンテンツ戦略\n---------------------------------\n`;
    content.aPlusContent.forEach(module => {
        text += `\n【${module.moduleName}】\n`;
        text += `目的: ${module.purpose}\n`;
        text += `大見出し: ${module.bigHeadline}\n`;
        text += `見出し: ${module.headline}\n`;
        text += `説明文: ${module.description}\n`;
        text += `画像案: ${module.imageSuggestion}\n`;
    });

    return text;
};

export const OutputDisplay: React.FC<{ content: GeneratedContent; onRefine: (section: string, request: string) => void; language: string; images?: AllImagePayloads | null }> = ({ content, onRefine, language, images }) => {

    const handleDownload = () => {
        const textContent = formatContentForDownload(content);
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'amazon_kdp_submission.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-end items-center mb-2">
             <p className="text-sm text-gray-500 mr-4">各項目の右側にあるアイコンでコピーできます</p>
            <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <DownloadIcon className="h-5 w-5" />
                一括ダウンロード
            </button>
        </div>

        <OutputSection title="1. Kindle本の詳細 (詳細タブ)" icon={<BookOpenIcon className="h-6 w-6" />} onRefine={onRefine}>
            <div className="flex flex-col gap-0">
                <KDPFieldRow label="言語" value={content.kdpDetails.language} />
                <KDPFieldRow label="本のタイトル" value={content.kdpDetails.title} />
                <KDPFieldRow label="タイトル (フリガナ)" value={content.kdpDetails.titleKana} />
                <KDPFieldRow label="タイトル (ローマ字)" value={content.kdpDetails.titleRomaji} />
                <KDPFieldRow label="サブタイトル" value={content.kdpDetails.subtitle} />
                <KDPFieldRow label="サブタイトル (フリガナ)" value={content.kdpDetails.subtitleKana} />
                <KDPFieldRow label="サブタイトル (ローマ字)" value={content.kdpDetails.subtitleRomaji} />
                <KDPFieldRow label="シリーズ" value={content.kdpDetails.seriesName} subValue={content.kdpDetails.seriesVolume ? `巻数: ${content.kdpDetails.seriesVolume}` : undefined} />
                <KDPFieldRow label="著者" value={content.kdpDetails.author} />
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-700">内容紹介 (Description) - HTMLタグ対応</span>
                        <div className="flex items-center gap-2">
                           <span className={`text-xs font-bold px-2 py-1 rounded ${content.kdpDetails.description.length >= (language === 'en' ? 2000 : 2500) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {content.kdpDetails.description.length}文字
                           </span>
                           <CopyButton text={content.kdpDetails.description} />
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm whitespace-pre-wrap font-mono text-gray-800">
                        {content.kdpDetails.description}
                    </div>
                    <div className="flex justify-between mt-1">
                         <p className="text-xs text-gray-400">※推奨: 3500〜3900文字 (HTMLタグ込み4000文字以内)</p>
                         <p className="text-xs text-gray-400">※ラベルは除外済み。そのままコピペ可能です。</p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                   <KDPFieldRow label="出版権" value={content.kdpDetails.publishingRights} />
                   <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 py-3 border-b border-gray-100">
                        <div className="sm:col-span-4 text-sm font-medium text-gray-500 pt-1">キーワード (7つ)</div>
                        <div className="sm:col-span-8">
                            <div className="flex flex-wrap gap-2">
                                {content.kdpDetails.keywords.map((k, i) => (
                                    <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-sm border border-indigo-100 flex items-center gap-1 group">
                                        {k}
                                        <button onClick={() => navigator.clipboard.writeText(k)} className="opacity-0 group-hover:opacity-100 hover:text-indigo-900"><ClipboardIcon className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 py-3 border-b border-gray-100">
                        <div className="sm:col-span-4 text-sm font-medium text-gray-500 pt-1">カテゴリー (3つ)</div>
                        <div className="sm:col-span-8 space-y-1">
                            {content.kdpDetails.categories.map((c, i) => (
                                <p key={i} className="text-gray-900 text-sm font-medium flex justify-between group">
                                    {c}
                                    <span className="opacity-0 group-hover:opacity-100"><CopyButton text={c} minimal /></span>
                                </p>
                            ))}
                        </div>
                   </div>
                   <KDPFieldRow label="成人向けコンテンツ" value={content.kdpDetails.adultContent} />
                </div>
            </div>
        </OutputSection>
        
        <OutputSection title="2. Kindle本のコンテンツ (コンテンツタブ)" icon={<FileCheckIcon className="h-6 w-6" />} onRefine={onRefine}>
            <div className="flex flex-col gap-0">
                <KDPFieldRow label="デジタル著作権管理 (DRM)" value={content.kdpContent.drm} />
                <KDPFieldRow label="原稿ファイル名 (例)" value={content.kdpContent.manuscriptFileName} />
                <KDPFieldRow label="表紙ファイル名 (例)" value={content.kdpContent.coverFileName} />
                {content.kdpContent.aiGeneratedContent && <KDPFieldRow label="AI生成コンテンツ" value={content.kdpContent.aiGeneratedContent} />}
            </div>
        </OutputSection>

        <OutputSection title="3. Kindle本の価格設定 (価格設定タブ)" icon={<DollarIcon className="h-6 w-6" />} onRefine={onRefine}>
             <div className="flex flex-col gap-0">
                <KDPFieldRow label="KDPセレクト登録" value={content.kdpPricing.kdpSelect} />
                <KDPFieldRow label="主なマーケットプレイス" value={content.kdpPricing.marketplace} />
                <KDPFieldRow label="テリトリー" value={content.kdpPricing.territory} />
                <KDPFieldRow label="ロイヤリティプラン" value={content.kdpPricing.royaltyPlan} />
                <KDPFieldRow label="価格" value={content.kdpPricing.price} />
            </div>
        </OutputSection>
        
        <OutputSection title="4. A+ コンテンツ (マーケティング)" icon={<APlusIcon className="h-6 w-6" />} onRefine={onRefine}>
            <div className="space-y-4">
                {content.aPlusContent.map((module, index) => (
                    <APlusModuleCard 
                        key={index} 
                        module={module} 
                        language={language} 
                        referenceImage={images?.character}
                    />
                ))}
            </div>
        </OutputSection>
    </div>
  );
};
