
import React, { useState, useCallback } from 'react';
import { Genre, WorldviewProposal, DetailedSetting, GeneratedImageData, CharacterSetting, TargetMarket, VolumeDetail } from './types';
import { GENRES } from './constants';
import LoadingSpinner from './components/LoadingSpinner';
import StepHeader from './components/StepHeader';
import { BookIcon, WandIcon, WorldIcon, ImageIcon, RestartIcon, ClipboardIcon } from './components/icons';
import CharacterCard from './components/CharacterCard';
import CharacterVisualizer from './components/CharacterVisualizer';
import WorldviewInputForm from './components/WorldviewInputForm';
import ProjectPlanAnalyzer from './components/ProjectPlanAnalyzer';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            if (error.message?.includes('429') || error.status === 429) {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`Quota exceeded (429). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

const App: React.FC = () => {
    const [step, setStep] = useState(1);
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
    const [targetMarket, setTargetMarket] = useState<TargetMarket>('japan');
    const [detailedSetting, setDetailedSetting] = useState<DetailedSetting | null>(null);
    const [generatedImageData, setGeneratedImageData] = useState<GeneratedImageData | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const [proposalData, setProposalData] = useState<WorldviewProposal | null>(null);

    const handleReset = () => {
        setStep(1);
        setSelectedGenre(null);
        setTargetMarket('japan');
        setDetailedSetting(null);
        setGeneratedImageData(null);
        setProposalData(null);
        setIsLoading(false);
        setError(null);
    };

    const handleGenreSelect = (genre: Genre) => {
        setSelectedGenre(genre);
        setStep(2);
    };

    const handleWorldviewSubmit = async (proposal: WorldviewProposal, genreOverride?: Genre) => {
        setIsLoading(true);
        setLoadingMessage('最高に魅力的なキャラクターと世界観を構築中...');
        setError(null);
        setProposalData(proposal);

        try {
            const genreToUse = genreOverride || selectedGenre;
            if (!genreToUse) throw new Error("Genre not selected");
            
            const detailedSettingSchema = {
                type: Type.OBJECT,
                properties: {
                    seriesTitle: { type: Type.STRING },
                    volumes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                volumeNumber: { type: Type.INTEGER },
                                title: { type: Type.STRING },
                                summary: { type: Type.STRING },
                                chapters: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            chapterNumber: { type: Type.STRING },
                                            title: { type: Type.STRING },
                                            estimatedPages: { type: Type.STRING },
                                            sections: {
                                                type: Type.ARRAY,
                                                items: {
                                                    type: Type.OBJECT,
                                                    properties: {
                                                        title: { type: Type.STRING },
                                                        description: { type: Type.STRING },
                                                    },
                                                    required: ["title", "description"],
                                                },
                                            },
                                        },
                                        required: ["chapterNumber", "title", "estimatedPages", "sections"],
                                    },
                                },
                            },
                            required: ["volumeNumber", "title", "summary", "chapters"],
                        },
                    },
                    currentStatus: { type: Type.STRING },
                    unresolvedList: { type: Type.STRING },
                    progress: { type: Type.STRING },
                    artStyleTags: { type: Type.STRING },
                    backgroundTags: { type: Type.STRING },
                    worldview: {
                        type: Type.OBJECT,
                        properties: {
                            coreRule: {
                                type: Type.OBJECT,
                                properties: { name: { type: Type.STRING }, merit: { type: Type.STRING }, demerit: { type: Type.STRING } },
                                required: ["name", "merit", "demerit"],
                            },
                            keyLocations: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: { name: { type: Type.STRING }, historicalBackground: { type: Type.STRING }, structuralFeatures: { type: Type.STRING } },
                                    required: ["name", "historicalBackground", "structuralFeatures"],
                                },
                            },
                            organizations: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: { name: { type: Type.STRING }, purpose: { type: Type.STRING }, conflictRelationship: { type: Type.STRING }, hierarchySystem: { type: Type.STRING } },
                                    required: ["name", "purpose", "conflictRelationship", "hierarchySystem"],
                                },
                            },
                        },
                        required: ["coreRule", "keyLocations", "organizations"],
                    },
                    protagonist: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            englishName: { type: Type.STRING },
                            age: { type: Type.STRING },
                            occupation: { type: Type.STRING },
                            publicPersona: { type: Type.STRING },
                            hiddenSelf: { type: Type.STRING },
                            pastTrauma: { type: Type.STRING },
                            greatestWeakness: { type: Type.STRING },
                            potentialWhenOvercome: { type: Type.STRING },
                            visualTags: { type: Type.STRING, description: "外見描写。健康的で魅力的な容姿（隈、疲れ、さえない要素は厳禁）。清潔感のある服装と、華のあるビジュアル特徴。身体と服のみ。nanobanana形式" },
                        },
                        required: ["name", "englishName", "age", "occupation", "publicPersona", "hiddenSelf", "pastTrauma", "greatestWeakness", "potentialWhenOvercome", "visualTags"],
                    },
                    rivals: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                englishName: { type: Type.STRING },
                                age: { type: Type.STRING },
                                occupation: { type: Type.STRING },
                                publicPersona: { type: Type.STRING },
                                hiddenSelf: { type: Type.STRING },
                                pastTrauma: { type: Type.STRING },
                                greatestWeakness: { type: Type.STRING },
                                potentialWhenOvercome: { type: Type.STRING },
                                relationshipWithProtagonist: { type: Type.STRING },
                                goal: { type: Type.STRING },
                                secret: { type: Type.STRING },
                                visualTags: { type: Type.STRING, description: "外見描写。華があり、読者を惹きつけるカリスマ的なデザイン。身体と服のみ。nanobanana形式" },
                            },
                            required: ["name", "englishName", "age", "occupation", "publicPersona", "hiddenSelf", "pastTrauma", "greatestWeakness", "potentialWhenOvercome", "relationshipWithProtagonist", "goal", "secret", "visualTags"],
                        },
                    },
                    supportingCharacters: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                roleType: { type: Type.STRING },
                                name: { type: Type.STRING },
                                englishName: { type: Type.STRING },
                                age: { type: Type.STRING },
                                occupation: { type: Type.STRING },
                                publicPersona: { type: Type.STRING },
                                hiddenSelf: { type: Type.STRING },
                                pastTrauma: { type: Type.STRING },
                                greatestWeakness: { type: Type.STRING },
                                potentialWhenOvercome: { type: Type.STRING },
                                relationshipWithProtagonist: { type: Type.STRING },
                                goal: { type: Type.STRING },
                                secret: { type: Type.STRING },
                                visualTags: { type: Type.STRING, description: "外見描写。役割が一目で分かる印象的なビジュアル。身体と服のみ。nanobanana形式" },
                            },
                            required: ["roleType", "name", "englishName", "age", "occupation", "publicPersona", "hiddenSelf", "pastTrauma", "greatestWeakness", "potentialWhenOvercome", "relationshipWithProtagonist", "goal", "secret", "visualTags"],
                        },
                    },
                },
                required: ["seriesTitle", "volumes", "currentStatus", "unresolvedList", "progress", "worldview", "protagonist", "rivals", "supportingCharacters", "artStyleTags", "backgroundTags"],
            };

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `
                あなたは「最高峰のコンテンツ・アーキテクト」です。
                
                **【指示：主人公・登場人物の絶対的な魅力】**
                作品の顔となるキャラクターは、読者が「このキャラをもっと見たい」と思える圧倒的な魅力（ビジュアル・性格両面）を持たせてください。
                - **健康的で美しい容姿**: どんな苦境にある設定でも、顔立ちは整い、肌は綺麗で、目は輝いているように描写してください。
                - **ネガティブな外見要素の排除**: 目の下の隈（クマ）、疲弊した死んだ目、不潔感のあるボサボサ髪などは「絶対に」避けてください。
                - **カリスマ性の付与**: 解説本であっても、主人公は「魅力的で憧れられるナビゲーター」として設計してください。

                **【指示：キャラクター名の絶対的多様性】**
                名前が似通ったパターンにならないよう、徹底的に個性を出してください。
                
                **【指示：キャラクターの厳密化（ブレ防止）】**
                supportingCharacters を**2〜4名**で設計してください。以下は必須:
                - 家族（母 or 父 など）
                - 同僚（同じ職場の主要人物）
                余裕があれば「メンター」「ライバル/相棒」を追加してください。
                これらの人物は必ず「固有名」と「visualTags」を持つこと。
                以後、物語内で新規の家族/同僚/上司/友人を追加しないこと。
                
                **【指示：情報の完全継承】**
                入力された構成案（Vol.1〜5等）の内容はすべて詳細に継承してください。

                **入力データ:**
                ${JSON.stringify(proposal)}
            `;

            const response = await fetchWithRetry<GenerateContentResponse>(() => 
                ai.models.generateContent({
                    model: "gemini-3-pro-preview",
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: detailedSettingSchema,
                    },
                })
            );

            const jsonStr = response.text?.trim() || "{}";
            setDetailedSetting(JSON.parse(jsonStr));
            setStep(3);
        } catch (e: any) {
            console.error(e);
            setError(`生成に失敗しました: ${e.message || '不明なエラー'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlanAnalysis = (proposal: WorldviewProposal, genreId: string) => {
        const genre = GENRES.find(g => g.id === genreId);
        if (genre) {
            setSelectedGenre(genre);
            handleWorldviewSubmit(proposal, genre);
        }
    };

    const handleImageGenerate = useCallback(async (character: CharacterSetting) => {
        if (!selectedGenre || !detailedSetting) return;
        setIsLoading(true);
        setGeneratedImageData(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const designs = [];
            for(let i=0; i<3; i++) {
                setLoadingMessage(`「${character.name}」の完全な全身立ち絵を生成中... (${i+1}/3)`);
                
                const imagePrompt = `
                    MASTERPIECE character concept art. 
                    STRICTLY ONE CHARISMATIC AND ATTRACTIVE CHARACTER IN THE CENTER. 
                    FULL BODY SHOT, SHOWING HEAD TO TOE. FEET AND SHOES MUST BE FULLY VISIBLE. 
                    STARK, PURE FLAT WHITE BACKGROUND. 
                    ABSOLUTELY NO BACKGROUND ELEMENTS, NO FLOATING OBJECTS, NO UI PANELS, NO GADGETS, NO KEYBOARDS, NO CABLES, NO HEADPHONES. 
                    HANDS MUST BE COMPLETELY EMPTY. HOLDING NOTHING AT ALL. 
                    HEALTHY, BEAUTIFUL, AND CHARMING FACE. NO DARK CIRCLES, NO TIRED EYES, NO EXHAUSTION.
                    THE CHARACTER IS STANDING STRAIGHT IN AN EMPTY SPACE. 
                    Clean, high-quality professional manga line art. 
                    Physical appearance and clothing: ${character.visualTags}.
                    Art Style: ${selectedGenre.artStylePrompt}.
                `;
                
                const response = await fetchWithRetry<GenerateContentResponse>(() => 
                    ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
                        config: { imageConfig: { aspectRatio: "9:16" } }
                    })
                );

                if (response.candidates && response.candidates[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                      if (part.inlineData) {
                        designs.push(`data:image/png;base64,${part.inlineData.data}`);
                        break;
                      }
                    }
                }
            }
            setGeneratedImageData({ 
                characterName: character.name, 
                characterEnglishName: character.englishName, 
                fullBodyDesigns: designs 
            });
        } catch (e: any) { 
            setError(`画像生成に失敗しました: ${e.message}`); 
        } finally { 
            setIsLoading(false); 
        }
    }, [selectedGenre, detailedSetting]);

    const handleCopySettings = useCallback(() => {
        if (!detailedSetting) return;
        const s = detailedSetting;
        
        // 詳細設定をすべてテキスト化
        let text = `--- [SERIES ARCHITECTURE MASTER SHEET: BILINGUAL VERSION] ---\n`;
        text += `【TITLE / シリーズタイトル】\n`;
        text += `${s.seriesTitle}\n\n`;

        text += `【CORE STRATEGY / 核心戦略】\n`;
        text += `- Core Rule / 核心ルール: ${s.worldview.coreRule.name}\n`;
        text += `- Merit / 強み: ${s.worldview.coreRule.merit}\n`;
        text += `- Demerit / 弱み: ${s.worldview.coreRule.demerit}\n`;
        if (s.currentStatus) {
            text += `- Status Analysis / 現状分析: ${s.currentStatus}\n`;
        }
        if (s.progress) {
            text += `- Progress / 進捗: ${s.progress}\n`;
        }
        if (s.artStyleTags) {
            text += `- Art Style Tags / 作画スタイル: ${s.artStyleTags}\n`;
        }
        if (s.backgroundTags) {
            text += `- Background Tags / 背景タグ: ${s.backgroundTags}\n`;
        }
        text += `- Unresolved Roadmap / 執筆ロードマップ:\n`;
        text += `${s.unresolvedList}\n\n`;

        text += `============================================================\n`;
        text += `【WORLDVIEW DETAILS / 世界観詳細】\n`;
        text += `### Key Locations / 主要ロケーション\n`;
        s.worldview.keyLocations.forEach((loc, idx) => {
            text += `- ${idx + 1}. ${loc.name}\n`;
            text += `  - Historical Background: ${loc.historicalBackground}\n`;
            text += `  - Structural Features: ${loc.structuralFeatures}\n`;
        });
        text += `\n`;
        text += `### Organizations / 組織\n`;
        s.worldview.organizations.forEach((org, idx) => {
            text += `- ${idx + 1}. ${org.name}\n`;
            text += `  - Purpose: ${org.purpose}\n`;
            text += `  - Conflict: ${org.conflictRelationship}\n`;
            text += `  - Hierarchy: ${org.hierarchySystem}\n`;
        });
        text += `\n`;

        text += `============================================================\n`;
        text += `【FULL VOLUME CONFIGURATION / 全巻深掘り構成】\n\n`;

        text += `### VOLUMES & CHAPTERS\n`;
        s.volumes.forEach(v => {
            text += `#### Vol.${v.volumeNumber}: ${v.title}\n`;
            text += `Summary: ${v.summary}\n`;
            v.chapters.forEach(c => {
                text += `  Chapter ${c.chapterNumber}: ${c.title} (${c.estimatedPages} pages)\n`;
                c.sections.forEach(sec => {
                    text += `    - ${sec.title}: ${sec.description}\n`;
                });
            });
            text += `\n`;
        });
        
        text += `============================================================\n`;
        text += `【CHARACTERS / キャラクター設定】\n`;
        const chars = [s.protagonist, ...s.rivals, ...(s.supportingCharacters || [])];
        chars.forEach((c, idx) => {
            const roleLabel = idx === 0 ? 'Protagonist' : (c.roleType || 'Sub-Character');
            text += `#### ${roleLabel}: ${c.name} (${c.englishName})\n`;
            text += `- Age: ${c.age} / Occupation: ${c.occupation}\n`;
            text += `- Public Persona: ${c.publicPersona}\n`;
            text += `- Hidden Self: ${c.hiddenSelf}\n`;
            text += `- Trauma: ${c.pastTrauma}\n`;
            if (c.relationshipWithProtagonist) {
                text += `- Relationship: ${c.relationshipWithProtagonist}\n`;
            }
            text += `- Visual Tags: ${c.visualTags}\n\n`;
        });
        
        text += `============================================================\n`;
        text += `【DEVELOPMENT ROADMAP / 執筆ロードマップ】\n`;
        text += s.unresolvedList;

        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        });
    }, [detailedSetting]);

    const renderContent = () => {
        if (isLoading) return <LoadingSpinner message={loadingMessage} />;
        if (error) return (
            <div className="text-center p-12 bg-red-900/10 border border-red-500/20 rounded-[3rem] m-10">
                <p className="text-red-400 font-bold mb-4">{error}</p>
                <button onClick={handleReset} className="px-8 py-3 bg-red-600 text-white rounded-full font-black text-xs uppercase">戻る</button>
            </div>
        );

        switch (step) {
            case 1:
                return (
                    <div className="space-y-12 animate-in fade-in duration-500">
                        <StepHeader step={1} title="ターゲット市場とジャンルの選択" icon={<BookIcon className="w-6 h-6"/>} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <button onClick={() => setTargetMarket('japan')} className={`p-8 rounded-3xl border-2 transition-all group ${targetMarket === 'japan' ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>
                                <p className="text-2xl font-black mb-1">Domestic / 日本国内</p>
                            </button>
                            <button onClick={() => setTargetMarket('english')} className={`p-8 rounded-3xl border-2 transition-all group ${targetMarket === 'english' ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>
                                <p className="text-2xl font-black mb-1">Global / 世界市場</p>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {GENRES.map(g => (
                                <button key={g.id} onClick={() => handleGenreSelect(g)} className="p-8 bg-gray-900 rounded-[2rem] hover:bg-indigo-600 border border-gray-800 text-center transition-all group shadow-lg">
                                    <p className="font-black text-xl text-white group-hover:scale-105 transition-transform">{g.name}</p>
                                    <p className="text-[10px] text-gray-500 group-hover:text-indigo-200 uppercase tracking-widest mt-2">{g.styleDescription}</p>
                                </button>
                            ))}
                        </div>
                        <ProjectPlanAnalyzer onAnalysisComplete={handlePlanAnalysis} />
                    </div>
                );
            case 2:
                return <div className="space-y-6"><StepHeader step={2} title="企画の骨子を確認" icon={<WorldIcon className="w-6 h-6"/>} /><WorldviewInputForm onSubmit={handleWorldviewSubmit} /></div>;
            case 3:
                if (!detailedSetting || !selectedGenre) return null;
                const s = detailedSetting;
                return (
                    <div className="space-y-16 animate-in fade-in duration-700 pb-20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900/90 p-8 rounded-[2.5rem] border border-gray-800 sticky top-4 z-20 shadow-2xl backdrop-blur-2xl space-y-4 md:space-y-0">
                            <StepHeader step={3} title="マスターシート完成 (極限深掘り)" icon={<WandIcon className="w-6 h-6"/>} />
                            <div className="flex space-x-4">
                                <button onClick={handleCopySettings} className={`flex items-center justify-center space-x-4 py-5 px-10 rounded-full font-black text-xs uppercase tracking-widest transition-all ${copyStatus === 'copied' ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 shadow-xl'} text-white`}>
                                    <ClipboardIcon className="w-4 h-4"/>
                                    <span>{copyStatus === 'copied' ? 'コピー完了!' : '設定を全文コピー'}</span>
                                </button>
                                <button onClick={handleReset} className="p-5 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-all text-white"><RestartIcon className="w-5 h-5"/></button>
                            </div>
                        </div>

                        <section className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
                            <div className="bg-gradient-to-r from-indigo-950 via-gray-900 to-indigo-950 p-16 border-b border-gray-800 text-center">
                                <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">{s.seriesTitle}</h3>
                            </div>
                            <div className="p-16 space-y-24">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="bg-indigo-900/10 p-12 rounded-[2rem] border border-indigo-500/20">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-8">核心戦略 / CORE STRATEGY</p>
                                        <p className="text-2xl font-black text-white mb-6 underline decoration-indigo-600 underline-offset-8">{s.worldview.coreRule.name}</p>
                                    </div>
                                    <div className="bg-gray-800/30 p-12 rounded-[2rem] border border-gray-700">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">ロードマップ</p>
                                        <div className="text-[10px] text-gray-400 font-mono leading-relaxed max-h-64 overflow-y-auto bg-black/40 p-6 rounded-2xl whitespace-pre-wrap">
                                            {s.unresolvedList}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-12">
                                    <h4 className="text-3xl font-black text-white border-l-8 border-indigo-600 pl-8 uppercase tracking-widest">全巻構成案</h4>
                                    {s.volumes.map(v => (
                                        <div key={v.volumeNumber} className="bg-gray-950/60 p-12 rounded-[2.5rem] border border-gray-800">
                                            <h5 className="text-3xl font-black text-white mb-6">Vol.{v.volumeNumber}: {v.title}</h5>
                                            <p className="bg-indigo-950/20 p-8 rounded-2xl mb-12 text-indigo-200">{v.summary}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {v.chapters.map(c => (
                                                    <div key={c.chapterNumber} className="p-8 bg-gray-900 rounded-3xl border border-gray-800">
                                                        <p className="text-xl font-black text-white mb-4">{c.chapterNumber}: {c.title}</p>
                                                        {c.sections.map((sec, idx) => (
                                                            <div key={idx} className="mt-4 first:mt-0">
                                                                <p className="text-sm font-black text-indigo-400">■ {sec.title}</p>
                                                                <p className="text-xs text-gray-400 leading-loose">{sec.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                            <div className="lg:col-span-8 space-y-16">
                                <h3 className="text-3xl font-black text-white border-l-8 border-indigo-600 pl-8 uppercase tracking-widest">登場人物プロファイル</h3>
                                <CharacterCard character={s.protagonist} title="主人公" />
                                {s.rivals.map((r, i) => (
                                    <CharacterCard key={i} character={r} title="サブキャラクター" />
                                ))}
                                {(s.supportingCharacters || []).map((r, i) => (
                                    <CharacterCard key={`supporting-${i}`} character={r} title={r.roleType || "サブキャラクター"} />
                                ))}
                            </div>
                            <div className="lg:col-span-4">
                                <div className="sticky top-32 space-y-10">
                                    <h3 className="text-3xl font-black text-white border-l-8 border-indigo-600 pl-8 uppercase tracking-widest text-center lg:text-left">立ち絵ビジュアライザー</h3>
                                    <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 shadow-2xl">
                                        <CharacterVisualizer setting={s} onGenerate={handleImageGenerate} generatedData={generatedImageData} isGenerating={isLoading && loadingMessage.includes('生成中')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-600/30 pb-32">
            <div className="max-w-7xl mx-auto p-4 sm:p-12">
                <header className="flex justify-between items-center mb-20 border-b border-gray-900 pb-12">
                    <div className="flex items-center space-x-8">
                        <div className="p-6 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/30 animate-pulse"><WandIcon className="w-10 h-10 text-white" /></div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Architect <span className="text-indigo-600">MAX</span></h1>
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.6em] mt-3">High-Quality Character & Story Blueprint</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="px-10 py-4 rounded-full bg-gray-900 hover:bg-gray-800 text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-gray-800">Restart</button>
                </header>
                <main>{renderContent()}</main>
            </div>
        </div>
    );
};

export default App;
