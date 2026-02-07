
import { MangaPage, CharacterImage } from '../types';

export interface CharacterStatus {
  name: string; 
  cleanName: string; 
  status: 'linked' | 'missing_image' | 'unused_image';
  matchedImageName?: string;
}

// Regex to extract content inside brackets (captures all bracketed content)
let BRACKET_REGEX = new RegExp('(?:[\\[［])\\s*([^\\]］]+)\\s*(?:[\\]］])', 'gi');

// Mapping line: [Ref: ID] :: Filename.png
// Enhanced to be more robust for various whitespace/symbols around "::"
let MAPPING_LINE_REGEX = /(?:[\[［])\s*Ref:\s*([^\]］\s]+)\s*(?:[\]］])\s*[:：]{2}\s*([^\[［◆\n\r]+?)(?=\s*(?:[\[［]|◆|$))/gi;

function normalizeText(text: string): string {
  return text.normalize('NFC').toLowerCase().trim();
}

export function cleanBracketContent(content: string): string {
  let clean = content;
  
  // Remove "Ref: " prefix if present to get the actual ID/name for matching
  let idMatch = clean.match(/Ref:\s*([^\]］\s\)]+)/i);
  if (idMatch) {
    clean = idMatch[1].trim();
  }

  // Remove content before first ':' or '：' if it's a "Name: Description" format
  if (clean.includes(':')) {
    let parts = clean.split(':');
    clean = parts[parts.length - 1]; // Take the last part, assuming it's the description
  } else if (clean.includes('：')) {
    let parts = clean.split('：');
    clean = parts[parts.length - 1];
  }

  // Remove parenthesized content like (emotion) or (description)
  clean = clean.replace(/\s*\(.*?\)\s*/g, '');
  clean = clean.replace(/['"]/g, ''); // Remove quotes
  return clean.trim();
}

/**
 * Extracts explicit character-to-filename mappings from the prompt.
 * Example: `[Ref: REF_IMG_1] :: Rio_Kanzaki_design_2.png` -> `{ "REF_IMG_1": "Rio_Kanzaki_design_2.png" }`
 */
export function getPromptMapping(prompt: string): Record<string, string> {
  let mapping: Record<string, string> = {};
  let regex = new RegExp(MAPPING_LINE_REGEX.source, 'gi'); // Use a fresh regex instance
  let m;
  while ((m = regex.exec(prompt)) !== null) {
    let id = m[1].trim().toUpperCase(); // e.g., "REF_IMG_1"
    let filename = m[2].trim().replace(/\*+\s*/g, ''); // e.g., "Rio_Kanzaki_design_2.png"
    mapping[id] = filename;
  }
  return mapping;
}

/**
 * Extracts all bracketed contents from the prompt.
 * Example: `[Ref: REF_IMG_1]`, `[Alex (happy)]`
 */
export function extractBracketContents(prompt: string): string[] {
  // Use the inclusive BRACKET_REGEX that captures all bracketed content
  let regex = new RegExp(BRACKET_REGEX.source, 'gi'); 
  let matches = prompt.match(regex);
  if (!matches) return [];
  
  let results: string[] = [];
  for (let m of matches) {
    // strip the brackets themselves
    let stripped = m.replace(/^(?:\[|［)|(?:\]|］)$/g, '').trim();
    
    // If the content is "Ref: SOMETHING", extract SOMETHING
    let refMatch = stripped.match(/^Ref:\s*([^\]］\s]+)$/i);
    if (refMatch) {
      results.push(`Ref: ${refMatch[1].trim()}`); // Store as "Ref: ID"
    } else {
      results.push(stripped);
    }
  }
  return results;
}

/**
 * Finds the best matching CharacterImage object for a given bracketed content string.
 */
export function findBestMatchingImage(bracketContent: string, images: CharacterImage[], promptMapping?: Record<string, string>): CharacterImage | undefined {
  let content = bracketContent;
  
  // Extract the ID part from "Ref: ID" or just use the whole content
  let idMatch = content.match(/Ref:\s*([^\]］\s\)]+)/i);
  let idPart = idMatch ? idMatch[1].trim().toUpperCase() : content.trim().toUpperCase();

  // 1. Prioritize explicit mapping: [Ref: ID] :: Filename
  if (promptMapping && promptMapping[idPart]) {
    let mappedFilename = promptMapping[idPart];
    let normMapped = normalizeText(mappedFilename);
    // Try to find an image by the exact mapped filename (or starts with, for robustness)
    let match = images.find(img => 
      normalizeText(img.name) === normMapped || 
      normalizeText(img.name).replace(/\.[^/.]+$/, "") === normMapped.replace(/\.[^/.]+$/, "")
    );
    if (match) return match;
  }

  // 2. Direct filename/ID match (case-insensitive, with/without extension)
  let normIdPart = normalizeText(idPart);
  let directMatch = images.find(img => {
      let normImgName = normalizeText(img.name);
      let normImgNameNoExt = normImgName.replace(/\.[^/.]+$/, "");
      return normIdPart === normImgName || normIdPart === normImgNameNoExt;
  });
  if (directMatch) return directMatch;


  // 3. Index-based fallback for standard IDs (e.g., REF_IMG_1, REF_IMG_2)
  let indexMatch = idPart.match(/REF_IMG_(\d+)/i);
  if (indexMatch) {
    let idx = parseInt(indexMatch[1], 10) - 1; // Convert to 0-based index
    if (idx >= 0 && idx < images.length) {
      return images[idx]; // Return the image at that index
    }
  }

  // 4. Fuzzy search as a last resort (clean content vs image name)
  let cleanContentForFuzzy = normalizeText(cleanBracketContent(bracketContent));
  if (cleanContentForFuzzy.length > 0) { // Only fuzzy search if we have meaningful cleaned content
    let fuzzyMatch = images.find(img => {
        let normImgName = normalizeText(img.name);
        return normImgName.includes(cleanContentForFuzzy) || cleanContentForFuzzy.includes(normImgName.replace(/\.[^/.]+$/, ""));
    });
    if (fuzzyMatch) return fuzzyMatch;
  }

  return undefined; // No match found
}

/**
 * Analyzes character links for sidebar display, showing status (linked, missing, unused).
 */
export function analyzeCharacterLinks(pages: MangaPage[], images: CharacterImage[]): CharacterStatus[] {
  let statuses: CharacterStatus[] = [];
  let foundIdentifiers = new Set<string>(); // Keep track of unique identifiers encountered in prompts
  let matchedImageNames = new Set<string>(); // Keep track of image files that were successfully linked

  for (let page of pages) {
    let mapping = getPromptMapping(page.prompt);
    let contents = extractBracketContents(page.prompt); 
    
    for (let rawContent of contents) {
      // Define keywords that indicate a system instruction, NOT a character reference
      const systemKeywords = [
        'Format', 'Visual', 'Target', 'Setting', 'Panel', 'Story_Description',
        'NOTE', 'ABSOLUTE', 'PANEL', 'ART', 'ORDER', 'STORY', 'ACTION',
        'VISUALS', 'Background', 'Typography',
      ];

      // Check if rawContent starts with a system keyword (case-insensitive)
      // IMPORTANT: "Ref:" and "Character:" are explicit character references and should NOT be considered system instructions here.
      const isSystemInstruction = systemKeywords.some(keyword =>
        rawContent.toLowerCase().startsWith(keyword.toLowerCase())
      );

      // If it's a system instruction, or contains "::" (which indicates a mapping line rather than a character ID), skip.
      // `extractBracketContents` should prevent "::" from appearing in `rawContent`, but this is a safeguard.
      if (isSystemInstruction || rawContent.includes('::')) {
        continue;
      }
      
      // If we reach here, it's considered a potential character reference.
      let identifierToTrack = rawContent; 
      
      if (foundIdentifiers.has(identifierToTrack)) continue;
      foundIdentifiers.add(identifierToTrack);
      
      let match = findBestMatchingImage(rawContent, images, mapping); 
      let clean = cleanBracketContent(rawContent); 
      
      if (match) {
        matchedImageNames.add(match.name);
        statuses.push({
          name: identifierToTrack, 
          cleanName: clean,       
          status: 'linked',
          matchedImageName: match.name
        });
      } else {
        // Mark as missing if no image found for this potential character reference
        statuses.push({
            name: identifierToTrack,
            cleanName: clean,
            status: 'missing_image'
        });
      }
    }
  }

  // Add statuses for uploaded images that were not used in any prompt
  for (let img of images) {
    if (!matchedImageNames.has(img.name)) {
      statuses.push({
        name: img.name,
        cleanName: img.name,
        status: 'unused_image'
      });
    }
  }

  // Sort: Missing images first, then linked, then unused.
  return statuses.sort((a, b) => {
    let score = (s: string) => s === 'missing_image' ? 0 : s === 'linked' ? 1 : 2;
    return score(a.status) - score(b.status);
  });
}
