/**
 * APIキー管理ユーティリティ
 * 機能ごとのAPIキーを管理し、優先順位に従って取得する
 */

export type ApiKeyType = 'default' | 'image_generation' | 'story' | 'research' | 'panel' | 'world' | 'amazon';

const STORAGE_KEYS: Record<ApiKeyType, string> = {
  default: 'gemini_api_key_default',
  image_generation: 'gemini_api_key_image_generation',
  story: 'gemini_api_key_story',
  research: 'gemini_api_key_research',
  panel: 'gemini_api_key_panel',
  world: 'gemini_api_key_world',
  amazon: 'gemini_api_key_amazon',
};

/**
 * 指定された機能タイプのAPIキーを取得
 * 優先順位: 機能固有キー > デフォルトキー > 古いキー名（互換性） > 環境変数
 */
export function getApiKey(type: ApiKeyType = 'default'): string | null {
  if (typeof window === 'undefined') {
    // サーバーサイドでは環境変数のみ
    return process.env.GEMINI_API_KEY || null;
  }

  // 機能固有のキーを優先的に取得
  if (type !== 'default') {
    const specificKey = localStorage.getItem(STORAGE_KEYS[type]);
    if (specificKey) return specificKey;
  }

  // デフォルトキーを取得
  const defaultKey = localStorage.getItem(STORAGE_KEYS.default);
  if (defaultKey) return defaultKey;

  // 古いキー名との互換性（gemini_api_key）
  const legacyKey = localStorage.getItem('gemini_api_key');
  if (legacyKey) return legacyKey;

  return null;
}

/**
 * APIキーを保存
 */
export function setApiKey(type: ApiKeyType, apiKey: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (apiKey) {
    localStorage.setItem(STORAGE_KEYS[type], apiKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS[type]);
  }
}

/**
 * すべてのAPIキーを取得
 */
export function getAllApiKeys(): Record<ApiKeyType, string | null> {
  if (typeof window === 'undefined') {
    return {
      default: process.env.GEMINI_API_KEY || null,
      image_generation: null,
      story: null,
      research: null,
      panel: null,
      world: null,
      amazon: null,
    };
  }

  const keys: Record<ApiKeyType, string | null> = {} as any;
  for (const type of Object.keys(STORAGE_KEYS) as ApiKeyType[]) {
    keys[type] = localStorage.getItem(STORAGE_KEYS[type]);
  }
  return keys;
}

/**
 * 機能タイプの表示名を取得
 */
export function getApiKeyTypeLabel(type: ApiKeyType): string {
  const labels: Record<ApiKeyType, string> = {
    default: 'デフォルト（全機能共通）',
    image_generation: '画像生成',
    story: 'ストーリー生成',
    research: 'リサーチ',
    panel: 'コマ割り',
    world: '世界観構築',
    amazon: 'Amazon KDP',
  };
  return labels[type];
}
