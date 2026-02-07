
import { MangaPage } from '../types';

export function parseCSV(csvText: string): MangaPage[] {
  let pages: MangaPage[] = [];
  let strictRows: string[][] = [];
  
  let curRow: string[] = [];
  let curField = '';
  let insideQuote = false;
  
  // Remove potential UTF-8 BOM and normalize line endings
  let normText = csvText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // CSV State Machine to handle quoted fields correctly
  for (let i = 0; i < normText.length; i++) {
    let char = normText[i];
    let nextChar = normText[i + 1];
    
    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        curField += '"';
        i++; // Skip next quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      curRow.push(curField);
      curField = '';
    } else if (char === '\n' && !insideQuote) {
      curRow.push(curField);
      strictRows.push(curRow);
      curRow = [];
      curField = '';
    } else {
      curField += char;
    }
  }
  
  // Handle last field/row if not followed by a newline
  if (curField.length > 0 || curRow.length > 0) {
    curRow.push(curField);
    strictRows.push(curRow);
  }

  if (strictRows.length < 2) return []; // Only header or empty file

  let seenPages = new Set<number>(); // Track page numbers to prevent duplicates

  // Convert to MangaPage objects, skipping header (r=0)
  for (let r = 1; r < strictRows.length; r++) {
    let cols = strictRows[r];
    
    // Skip empty rows completely
    if (cols.length < 1 || cols.every(c => !c.trim())) continue;
    
    let col0 = cols[0] ? cols[0].trim() : '';
    if (!col0) continue; // Page number column must not be empty

    let pageNumber: number | null = null;
    
    // Flexible page number detection
    if (/^(cover|title|表紙)$/i.test(col0)) {
      pageNumber = 0; // Standardize 'Cover' etc. to page 0
    } else {
      // Look for any number in the string, making it more robust to "1 - Chapter Title" or "Page 2"
      let match = col0.match(/(\d+)/); 
      if (match) {
        let parsed = parseInt(match[1], 10);
        if (!isNaN(parsed)) {
          pageNumber = parsed;
        }
      }
    }

    // If pageNumber couldn't be parsed or is a duplicate, skip this row
    if (pageNumber === null || seenPages.has(pageNumber)) {
      continue;
    }

    let template = cols[1] ? cols[1].trim() : 'Standard Layout'; // Default template if empty
    let prompt = cols[2] ? cols[2].trim() : '';

    // FALLBACK: If prompt (col[2]) is empty, but template (col[1]) looks like a prompt,
    // assume it's a 2-column CSV where col[1] is the prompt.
    // This handles CSV exports that might drop empty columns.
    if (!prompt && template.length > 50 && !template.toLowerCase().includes('layout')) {
        prompt = template;
        template = 'Standard Layout'; // Use a default template name
    }

    // Basic validity check for prompt content (must not be too short)
    if (prompt.length < 2) continue;

    seenPages.add(pageNumber); // Mark this page number as seen

    pages.push({
      pageNumber: pageNumber,
      template: template,
      prompt: prompt,
      status: 'idle'
    });
  }

  // Sort pages numerically by pageNumber
  pages.sort((a, b) => a.pageNumber - b.pageNumber);
  return pages;
}
