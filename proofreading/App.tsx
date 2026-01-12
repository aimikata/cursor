
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { proofreadImageText } from './services/geminiService';
import type { PageData, AnalysisResult } from './types';
import { ResultCard } from './components/ResultCard';

// Google Drive APIのスコープ
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

/**
 * Reads a file and attempts to decode it, trying UTF-8 first, then Shift_JIS as a fallback.
 * This is to handle common file encoding issues with Japanese text files.
 * @param file The file to read.
 * @returns A promise that resolves with the decoded text content of the file.
 */
const readFileWithCorrectEncoding = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    
    // Try decoding as UTF-8. The `fatal: true` option makes it throw an error
    // on invalid byte sequences, which is a good way to detect if it's not UTF-8.
    try {
        const decoder = new TextDecoder('utf-8', { fatal: true });
        const content = decoder.decode(buffer);
        // Remove Byte Order Mark (BOM) if it exists (common in files from Windows)
        if (content.charCodeAt(0) === 0xFEFF) {
            return content.substring(1);
        }
        return content;
    } catch (error) {
        // If UTF-8 decoding fails, log it and try Shift_JIS as a fallback.
        // This is common for CSV files edited in older versions of Excel on Windows.
        console.warn('Could not decode file as UTF-8, attempting Shift_JIS fallback.', error);
        try {
            const decoder = new TextDecoder('shift-jis');
            return decoder.decode(buffer);
        } catch (shiftJisError) {
            console.error('Failed to decode file as Shift_JIS.', shiftJisError);
            throw new Error("ファイルのエンコーディングを認識できませんでした。UTF-8 または Shift_JIS 形式で保存してください。");
        }
    }
};

const Spinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        <p className="text-lg text-slate-600">AIがページを校正しています...</p>
        <p className="text-sm text-slate-500">ページの枚数が多い場合、数分かかることがあります。</p>
    </div>
);

const FileUploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const StepIcon = ({ number }: { number: number }) => (
    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold mr-3">
        {number}
    </div>
);

const UsageGuide = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            初めての方へ：使い方ガイド
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start">
                <StepIcon number={1} />
                <div>
                    <h3 className="font-bold text-slate-700 mb-1">ファイルの準備</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        「ページ番号」が記載されたスクリプトファイル（CSV/TSV）と、ページ画像を用意します。<br/>
                        <span className="text-xs text-slate-500">※画像ファイル名にはページ番号を含めてください（例: 001.jpg, page_5.png）。</span>
                    </p>
                </div>
            </div>
            <div className="flex items-start">
                <StepIcon number={2} />
                <div>
                    <h3 className="font-bold text-slate-700 mb-1">アップロード・解析</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        両方のファイルをアップロードして「解析を開始」ボタンを押します。<br/>
                        <span className="font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                            ⚠ スムーズに処理するため、一度に5〜10ページ程度ずつ処理することをお勧めします。
                        </span>
                    </p>
                </div>
            </div>
            <div className="flex items-start">
                <StepIcon number={3} />
                <div>
                    <h3 className="font-bold text-slate-700 mb-1">確認・保存</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        AIによる校正結果を確認します。問題なければ結果をCSV形式でダウンロードするか、Googleドライブに保存してください。
                    </p>
                </div>
            </div>
        </div>
    </div>
);

/**
 * Parses CSV/TSV text handling quoted fields with newlines properly.
 */
const parseCSV = (text: string): string[][] => {
    // Normalize newlines to \n for easier processing
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Detect separator based on first line (up to first newline)
    const firstLineEnd = normalizedText.indexOf('\n');
    const firstLine = normalizedText.substring(0, firstLineEnd === -1 ? normalizedText.length : firstLineEnd);
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const separator = tabCount > commaCount ? '\t' : ',';

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < normalizedText.length; i++) {
        const char = normalizedText[i];
        const nextChar = normalizedText[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote: "" -> "
                currentField += '"';
                i++; // Skip the next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === separator && !inQuotes) {
            // End of field
            currentRow.push(currentField);
            currentField = '';
        } else if (char === '\n' && !inQuotes) {
            // End of row
            currentRow.push(currentField);
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
        } else {
            // Regular character
            currentField += char;
        }
    }
    
    // Add the last field/row if exists
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    return rows;
};


const App: React.FC = () => {
    const [scriptFile, setScriptFile] = useState<File | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [pageData, setPageData] = useState<PageData[]>([]);
    const [analysisResults, setAnalysisResults] = useState<Map<number, AnalysisResult>>(new Map());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSavingToDrive, setIsSavingToDrive] = useState<boolean>(false);
    const [driveMessage, setDriveMessage] = useState<string | null>(null);

    const [googleClientId, setGoogleClientId] = useState<string>('');
    const [isGoogleConfigured, setIsGoogleConfigured] = useState<boolean>(false);
    const [tokenClient, setTokenClient] = useState<any>(null);
    const uploadPending = useRef(false);

    // Load Client ID from localStorage on mount
    useEffect(() => {
        const savedClientId = localStorage.getItem('googleClientId');
        if (savedClientId) {
            setGoogleClientId(savedClientId);
            setIsGoogleConfigured(true);
        }
    }, []);

    // Initialize Google API clients when Client ID is configured
    useEffect(() => {
        const loadGis = () => {
            if (window.google && window.gapi && isGoogleConfigured) {
                 window.gapi.load('client', () => {
                    const client = window.google.accounts.oauth2.initTokenClient({
                        client_id: googleClientId,
                        scope: SCOPES,
                        callback: (tokenResponse: any) => {
                            if (tokenResponse && tokenResponse.access_token && uploadPending.current) {
                                uploadPending.current = false;
                                window.gapi.client.setToken(tokenResponse);
                                uploadToDrive();
                            }
                        },
                    });
                    setTokenClient(client);
                 });
            }
        };

        if (isGoogleConfigured) {
            const gisScript = document.getElementById('gis-script');
            if (!gisScript) {
                const script = document.createElement('script');
                script.id = 'gis-script';
                script.src = "https://accounts.google.com/gsi/client";
                script.onload = loadGis;
                document.body.appendChild(script);
            } else {
                 loadGis();
            }
        }
    }, [isGoogleConfigured, googleClientId]);
    
    const handleSaveClientId = () => {
        const trimmedId = googleClientId.trim();
        if (trimmedId && trimmedId.endsWith('.apps.googleusercontent.com')) {
            localStorage.setItem('googleClientId', trimmedId);
            setIsGoogleConfigured(true);
            setError(null);
        } else {
            setError('無効なクライアントIDです。末尾が ".apps.googleusercontent.com" であることを確認してください。');
        }
    };

    const handleClearClientId = () => {
        localStorage.removeItem('googleClientId');
        setGoogleClientId('');
        setIsGoogleConfigured(false);
        setTokenClient(null);
    };


    const handleScriptFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setScriptFile(e.target.files[0]);
        }
        e.target.value = '';
    }, []);

    const handleImageFilesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).sort((a: File, b: File) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            setImageFiles(files);
        }
        e.target.value = '';
    }, []);

    const parseTsvAndMatchImages = useCallback(async (): Promise<PageData[]> => {
        if (!scriptFile || imageFiles.length === 0) {
            throw new Error("スクリプトファイル(TSV/CSV)と画像ファイルの両方をアップロードしてください。");
        }
    
        const content = await readFileWithCorrectEncoding(scriptFile);
        
        // Use the robust parser instead of simple split
        const rows = parseCSV(content).filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''));

        if (rows.length < 1) {
            throw new Error("スクリプトファイルが空か、有効なデータがありません。");
        }

        const header = rows[0];
        
        // Allow for various column names for "Page Number"
        const validPageHeaders = ['ページ番号', 'Page', 'page', 'Page Number', 'PageNumber', 'No.', 'No'];
        const pageNumberIndex = header.findIndex(col => validPageHeaders.includes(col.trim()));
    
        if (pageNumberIndex === -1) {
            console.error("Could not find page number column. Parsed header:", header);
            throw new Error(`スクリプトファイルには 'ページ番号' または 'Page' 列が必要です。検出されたヘッダー: ${header.join(', ')}`);
        }
    
        const dataRows = rows.slice(1);
        const parsedPages: PageData[] = [];
    
        const scriptPageMap = new Map<number, string[]>();
        dataRows.forEach(columns => {
            const pageNumberStr = columns[pageNumberIndex];
            if (pageNumberStr) {
                let pageNumber = -1;
                const cleanStr = pageNumberStr.trim().toLowerCase();
                
                // Handle "Cover" as 0
                if (cleanStr.includes('cover')) {
                    pageNumber = 0;
                } else {
                    // Remove "Page" prefix if present and parse int
                    // e.g., "Page 1" -> "1", "1" -> "1"
                    const numberOnly = cleanStr.replace(/page\s*/, '');
                    pageNumber = parseInt(numberOnly, 10);
                }

                if (!isNaN(pageNumber)) {
                    scriptPageMap.set(pageNumber, columns);
                }
            }
        });
    
        imageFiles.forEach(imageFile => {
            let pageNumber = -1;
            const fileNameLower = imageFile.name.toLowerCase();

            // Explicitly handle "cover" in filename as 0
            if (fileNameLower.includes('cover')) {
                pageNumber = 0;
            } else {
                // Find first number in filename
                const match = imageFile.name.match(/\d+/);
                if (match) {
                    pageNumber = parseInt(match[0], 10);
                }
            }
            
            if (pageNumber !== -1 && scriptPageMap.has(pageNumber)) {
                parsedPages.push({
                    pageNumber,
                    originalText: '(画像からテキストを抽出中...)',
                    imageUrl: URL.createObjectURL(imageFile),
                    fileName: imageFile.name
                });
            }
        });

        if (parsedPages.length === 0) {
            throw new Error("スクリプトのページ番号と一致する画像ファイルが見つかりませんでした。ファイル名にページ番号が含まれているか確認してください (例: '1.png', 'page000.png', 'cover.jpg')。");
        }
        if (parsedPages.length !== imageFiles.length) {
            console.warn(`一部の画像がスクリプトのページ番号と一致しませんでした。一致した${parsedPages.length}件のみを処理します。`);
        }
    
        return parsedPages.sort((a, b) => a.pageNumber - b.pageNumber);
    
    }, [scriptFile, imageFiles]);

    const handleAnalyze = async () => {
        setError(null);
        setDriveMessage(null);
        setIsLoading(true);
        setPageData([]);
        setAnalysisResults(new Map());

        try {
            const pages = await parseTsvAndMatchImages();
            setPageData(pages);

            const imageFileMap = new Map(imageFiles.map(file => [file.name, file]));

            for (const page of pages) {
                try {
                    const imageFile = imageFileMap.get(page.fileName);
                    if (!imageFile) {
                        throw new Error(`画像ファイルが見つかりません: ${page.fileName}`);
                    }
                    
                    const result = await proofreadImageText(imageFile as File);
                    const pageHasMistake = result.corrections.some(c => c.original.trim() !== c.corrected.trim());

                    setPageData(prev => prev.map(p => p.pageNumber === page.pageNumber ? { ...p, originalText: result.originalFullText || '(テキストなし)' } : p));
                    
                    setAnalysisResults(prev => new Map(prev).set(page.pageNumber, { 
                        corrections: result.corrections,
                        pageHasMistake: pageHasMistake,
                        originalFullText: result.originalFullText || '(テキストなし)'
                    }));

                } catch (pageError) {
                    console.error(`Error processing page ${page.pageNumber}:`, pageError);
                    const errorMessage = 'このページの解析中にエラーが発生しました。';
                    setPageData(prev => prev.map(p => p.pageNumber === page.pageNumber ? { ...p, originalText: 'エラー' } : p));
                    setAnalysisResults(prev => new Map(prev).set(page.pageNumber, {
                        corrections: [{ original: 'エラー', corrected: errorMessage }],
                        pageHasMistake: true,
                        originalFullText: 'エラー'
                    }));
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
        } finally {
            setIsLoading(false);
        }
    };
    
    const sortedPageData = useMemo(() => {
        return [...pageData].sort((a, b) => a.pageNumber - b.pageNumber);
    }, [pageData]);

    const generateResultsCsv = useCallback(() => {
        const header = ['ページ番号', '元のテキスト', 'AIの修正案', '修正あり'].join(',');
        const rows = sortedPageData.map(page => {
            const result = analysisResults.get(page.pageNumber);
            if (!result) return '';
            
            // CSV escape: Wrap in quotes, replace double quote with two double quotes
            const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
            const correctedFullText = result.corrections.map(c => c.corrected).join('\n\n');

            return [
                page.pageNumber,
                escapeCsv(result.originalFullText),
                escapeCsv(correctedFullText),
                result.pageHasMistake ? 'はい' : 'いいえ'
            ].join(',');
        });
        return [header, ...rows].join('\n');
    }, [sortedPageData, analysisResults]);

    const handleDownload = () => {
        const csvContent = generateResultsCsv();
        // BOM for Excel compatibility with UTF-8 CSV
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'manga_proofread_results.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveToDrive = () => {
        if (!isGoogleConfigured) {
            setDriveMessage('Googleドライブ連携が設定されていません。上記の手順でクライアントIDを設定してください。');
            return;
        }
        if (tokenClient) {
            uploadPending.current = true;
            tokenClient.requestAccessToken({prompt: ''});
        } else {
            setDriveMessage('Google Driveクライアントの準備ができていません。');
        }
    };

    const uploadToDrive = async () => {
        setIsSavingToDrive(true);
        setDriveMessage(null);
        try {
            await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
            
            const csvContent = generateResultsCsv();
            const fileName = `manga_proofread_results_${new Date().toISOString()}.csv`;
            
            const fileMetadata = {
                'name': fileName,
                'mimeType': 'text/csv'
            };

            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(fileMetadata) +
                delimiter +
                'Content-Type: text/csv; charset=UTF-8\r\n\r\n' +
                csvContent +
                close_delim;

            const request = window.gapi.client.request({
                'path': '/upload/drive/v3/files',
                'method': 'POST',
                'params': { 'uploadType': 'multipart' },
                'headers': {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            });

            await request;
            setDriveMessage('Googleドライブに正常に保存されました。');
        } catch (err: any) {
            console.error("Error saving to Drive:", err);
            setDriveMessage(`Googleドライブへの保存に失敗しました: ${err.result?.error?.message || err.message || '不明なエラー'}`);
        } finally {
            setIsSavingToDrive(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                        マンガ校正AI
                    </h1>
                    <p className="text-slate-500 mt-1">マンガの画像からセリフを自動抽出し、スペルや文法の間違いをチェックします。</p>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <UsageGuide />

                {!isGoogleConfigured ? (
                    <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-6 rounded-md mb-8 shadow">
                        <h3 className="text-xl font-bold mb-3">Googleドライブ連携の設定</h3>
                        <p className="mb-4 text-sm">結果をGoogleドライブに保存するには、Google CloudのクライアントIDが必要です。</p>
                        <ol className="list-decimal list-inside text-sm space-y-1 mb-4">
                            <li><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">Google Cloud Console</a>でOAuthクライアントIDを作成します。</li>
                            <li>アプリケーションの種類は「ウェブアプリケーション」を選択してください。</li>
                            <li>「承認済みのJavaScript生成元」にこのページのURLを追加してください。</li>
                        </ol>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input
                                type="text"
                                value={googleClientId}
                                onChange={(e) => setGoogleClientId(e.target.value)}
                                placeholder="クライアントIDをここに貼り付け"
                                className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button onClick={handleSaveClientId} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                                保存
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md mb-8 flex justify-between items-center">
                        <p className="font-semibold">Googleドライブ連携が設定済みです。</p>
                        <button onClick={handleClearClientId} className="text-sm text-slate-600 hover:underline">設定をクリア</button>
                    </div>
                )}
                
                <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 mb-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-lg font-semibold text-slate-700 mb-2">1. スクリプトファイル(TSV/CSV)をアップロード</label>
                                <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer group-hover:border-indigo-500 transition-colors">
                                    <FileUploadIcon/>
                                    <p className="mt-2 text-sm text-slate-600">
                                        <span className="font-semibold text-indigo-600">クリックしてアップロード</span>
                                        <span className="block text-xs text-slate-500">(ページ番号の紐付けに使用)</span>
                                    </p>
                                    <input type="file" accept=".tsv,.csv" onChange={handleScriptFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                                {scriptFile && <p className="mt-2 text-sm text-slate-500">選択済み: <span className="font-medium text-slate-700">{scriptFile.name}</span></p>}
                            </div>
                            <div className="group">
                                <label className="block text-lg font-semibold text-slate-700 mb-2">2. ページ画像をアップロード</label>
                                <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer group-hover:border-indigo-500 transition-colors">
                                    <FileUploadIcon/>
                                    <p className="mt-2 text-sm text-slate-600">
                                        <span className="font-semibold text-indigo-600">クリックしてアップロード</span>
                                        <span className="block text-xs text-slate-500">(ファイル名にページ番号が必要)</span>
                                    </p>
                                    <input type="file" accept="image/*" multiple onChange={handleImageFilesChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                                {imageFiles.length > 0 && <p className="mt-2 text-sm text-slate-500">選択済み: <span className="font-medium text-slate-700">{imageFiles.length} 画像</span></p>}
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-xl font-bold text-slate-800">校正を開始しますか？</h2>
                            <p className="text-slate-600 mt-2 mb-6">スクリプトの「ページ番号」と画像ファイル名の数字を照合して紐付けます。</p>
                            <button
                                onClick={handleAnalyze}
                                disabled={!scriptFile || imageFiles.length === 0 || isLoading}
                                className="w-full md:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                            >
                                {isLoading ? '解析中...' : '解析を開始'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-8" role="alert">
                        <p className="font-bold">エラー</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {analysisResults.size > 0 && !isLoading && (
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mt-8 text-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">結果のエクスポート</h3>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button onClick={handleDownload} className="w-full sm:w-auto bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transform hover:scale-105 transition-all duration-300">
                                結果をダウンロード (CSV)
                            </button>
                            <button 
                                onClick={handleSaveToDrive} 
                                disabled={!isGoogleConfigured || isSavingToDrive} 
                                className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
                            >
                                {isSavingToDrive ? '保存中...' : 'Googleドライブに保存 (CSV)'}
                            </button>
                        </div>
                         {driveMessage && <p className={`mt-4 text-sm ${driveMessage.includes('失敗') || driveMessage.includes('設定されていません') ? 'text-red-600' : 'text-green-600'}`}>{driveMessage}</p>}
                    </div>
                )}

                <div className="space-y-8 mt-8">
                    {isLoading && <Spinner />}
                    {!isLoading && sortedPageData.map((page) => {
                        const result = analysisResults.get(page.pageNumber);
                        const displayResult = result || { corrections: [], pageHasMistake: false, originalFullText: page.originalText };
                        return <ResultCard key={page.pageNumber} pageData={page} analysisResult={displayResult} />;
                    })}
                </div>
            </main>
        </div>
    );
};

export default App;
