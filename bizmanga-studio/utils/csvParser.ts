import { MangaPage } from '../types';

export function parseCSV(csvText: string): MangaPage[] {
  let pages: MangaPage[] = [];
  let strictRows: string[][] = [];
  
  let curRow: string[] = [];
  let curField = '';
  let insideQuote = false;
  
  // Normalize line endings
  let normText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Simple State Machine Parser
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
  
  // Handle last field/row
  if (curField.length > 0 || curRow.length > 0) {
    curRow.push(curField);
    strictRows.push(curRow);
  }

  // Convert to MangaPage objects
  // Start from 1 to skip header
  for (let r = 1; r < strictRows.length; r++) {
    let cols = strictRows[r];
    
    // Safety check for empty rows
    if (cols.length < 3) continue;
    
    let col0 = cols[0] ? cols[0].trim() : '';
    if (!col0) continue;

    let pageNumStr = col0;
    let pageNumber = 0;
    
    let isSpecial = /cover|title|表紙/i.test(pageNumStr);
    
    if (isSpecial) {
      pageNumber = 0;
    } else {
      // Relaxed parsing: look for the first sequence of digits anywhere in the string
      // This handles "Page 1", "P.1", "Page-10", "1" etc.
      let match = pageNumStr.match(/(\d+)/);
      
      if (match) {
        pageNumber = parseInt(match[0], 10);
      } else {
        // No digits found, skip this row
        continue;
      }
    }

    let template = cols[1] ? cols[1].trim() : '';
    let prompt = cols[2] ? cols[2].trim() : '';

    let newPage: MangaPage = {
      pageNumber: pageNumber,
      template: template,
      prompt: prompt,
      status: 'idle'
    };
    
    pages.push(newPage);
  }

  // Sort
  pages.sort((a, b) => a.pageNumber - b.pageNumber);

  return pages;
}