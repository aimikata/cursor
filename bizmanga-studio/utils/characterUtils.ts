import { MangaPage, CharacterImage } from '../types';

export interface CharacterStatus {
  name: string; 
  cleanName: string; 
  status: 'linked' | 'missing_image' | 'unused_image';
  matchedImageName?: string;
}

// Using var/let for regex to avoid const initialization issues in some envs
let BRACKET_REGEX = new RegExp('(?:[\\[［])\\s*([^\\]］]+)\\s*(?:[\\]］])', 'gi');

function normalizeText(text: string): string {
  return text.normalize('NFC').toLowerCase().trim();
}

export function cleanBracketContent(content: string): string {
  let clean = content;
  
  if (clean.includes(':')) {
    let parts = clean.split(':');
    clean = parts[parts.length - 1];
  } else if (clean.includes('：')) {
    let parts = clean.split('：');
    clean = parts[parts.length - 1];
  }

  clean = clean.replace(/['"]/g, '');
  return clean.trim();
}

export function extractBracketContents(prompt: string): string[] {
  let matches = prompt.match(BRACKET_REGEX);
  if (!matches) return [];
  
  let results: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    let m = matches[i];
    // Strip the outer brackets
    let stripped = m.replace(/^(?:\[|［)|(?:\]|］)$/g, '').trim();
    results.push(stripped);
  }
  return results;
}

export function findBestMatchingImage(bracketContent: string, images: CharacterImage[]): CharacterImage | undefined {
  let normContent = normalizeText(bracketContent);

  // Priority 1: Direct Inclusion Match
  let inclusionMatches = images.filter((img) => {
    let normImgName = normalizeText(img.name);
    return normContent.includes(normImgName);
  });

  if (inclusionMatches.length > 0) {
    // Sort by length descending
    inclusionMatches.sort((a, b) => b.name.length - a.name.length);
    return inclusionMatches[0];
  }

  // Priority 2: Fuzzy/Clean Match
  let cleanContent = cleanBracketContent(bracketContent);
  let normClean = normalizeText(cleanContent);
  let normCleanNoExt = normClean.replace(/\.[^/.]+$/, "");

  let match = images.find((img) => {
    let normImgName = normalizeText(img.name);
    let normImgNameNoExt = normImgName.replace(/\.[^/.]+$/, "");
    
    if (normClean === normImgName) return true;
    
    if (normCleanNoExt === normImgNameNoExt && normCleanNoExt.length > 0) return true;

    return false;
  });

  return match;
}

export function analyzeCharacterLinks(pages: MangaPage[], images: CharacterImage[]): CharacterStatus[] {
  let statuses: CharacterStatus[] = [];
  let processedPromptNames: string[] = [];

  // 1. Scan all prompts
  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];
    let contents = extractBracketContents(page.prompt);
    
    for (let j = 0; j < contents.length; j++) {
      let rawContent = contents[j];
      
      if (processedPromptNames.indexOf(rawContent) === -1) {
        processedPromptNames.push(rawContent);
        
        let match = findBestMatchingImage(rawContent, images);
        let clean = cleanBracketContent(rawContent);
        
        // Check for file-like pattern
        let looksLikeFile = /\.[a-zA-Z0-9]{3,4}$/.test(clean) || /^(REF|IMG|CHAR|FILE)/i.test(clean);

        if (match) {
          statuses.push({
            name: rawContent,
            cleanName: clean,
            status: 'linked',
            matchedImageName: match.name
          });
        } else if (looksLikeFile) {
          statuses.push({
            name: rawContent,
            cleanName: clean,
            status: 'missing_image'
          });
        }
      }
    }
  }

  // 2. Check for unused images
  for (let k = 0; k < images.length; k++) {
    let img = images[k];
    let isUsed = false;
    for (let s = 0; s < statuses.length; s++) {
      if (statuses[s].matchedImageName === img.name) {
        isUsed = true;
        break;
      }
    }
    
    if (!isUsed) {
      statuses.push({
        name: img.name,
        cleanName: img.name,
        status: 'unused_image'
      });
    }
  }

  // Sort
  statuses.sort((a, b) => {
    let getScore = (s: string) => {
        if (s === 'missing_image') return 0;
        if (s === 'linked') return 1;
        return 2;
    };
    return getScore(a.status) - getScore(b.status);
  });

  return statuses;
}