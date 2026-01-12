import JSZip from 'jszip';
import saveAs from 'file-saver';
import { MangaPage } from '../types';

export function downloadSingleImage(imageUrl: string, pageNumber: number) {
  let link = document.createElement('a');
  link.href = imageUrl;
  link.download = `page_${String(pageNumber).padStart(3, '0')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadAllImagesAsZip(pages: MangaPage[]) {
  let zip = new JSZip();
  let completedPages = pages.filter(p => p.status === 'completed' && p.imageUrl);

  if (completedPages.length === 0) return;

  completedPages.forEach(page => {
    if (page.imageUrl) {
      // Remove data:image/xxx;base64, prefix
      let base64Data = page.imageUrl.split(',')[1];
      zip.file(`page_${String(page.pageNumber).padStart(3, '0')}.png`, base64Data, { base64: true });
    }
  });

  let content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'manga_pages.zip');
}