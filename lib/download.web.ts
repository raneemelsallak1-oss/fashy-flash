import { Image } from 'react-native';

import type { CatalogDocument } from '@/lib/catalog';
import { buildCatalogHtml } from '@/lib/catalogHtml';
import type { DownloadItem } from '@/lib/download';

/** Web: hand each generated file to the browser as a real download. */
export async function downloadAssetFiles(items: DownloadItem[]): Promise<number> {
  let saved = 0;

  for (const item of items) {
    const resolved = Image.resolveAssetSource(item.source);
    if (!resolved?.uri) continue;

    const link = document.createElement('a');
    link.href = resolved.uri;
    link.download = item.fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    saved += 1;

    await new Promise((resolve) => setTimeout(resolve, 180));
  }

  return saved;
}

/** Resolves once every image in the print document has loaded (or timed out). */
function waitForImages(target: Document): Promise<void> {
  const pending = Array.from(target.images).filter((image) => !image.complete);
  if (pending.length === 0) {
    return new Promise((resolve) => setTimeout(resolve, 250));
  }

  return new Promise((resolve) => {
    let remaining = pending.length;
    const settle = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
    };

    for (const image of pending) {
      image.addEventListener('load', settle, { once: true });
      image.addEventListener('error', settle, { once: true });
    }

    setTimeout(resolve, 5000);
  });
}

/** Fallback when popups are blocked: print the catalog from a hidden frame. */
async function printFromFrame(html: string): Promise<boolean> {
  const frame = document.createElement('iframe');
  frame.setAttribute('title', 'Catalog PDF');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '1px';
  frame.style.height = '1px';
  frame.style.opacity = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);

  const frameDocument = frame.contentDocument;
  const frameWindow = frame.contentWindow;
  if (!frameDocument || !frameWindow) {
    frame.remove();
    return false;
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  await waitForImages(frameDocument);
  frameWindow.focus();
  frameWindow.print();
  setTimeout(() => frame.remove(), 15000);

  return true;
}

/**
 * Web: render the catalog as an A4 print document and open the browser's
 * print dialog, where the user saves it as a PDF.
 */
export async function downloadCatalogPdf(doc: CatalogDocument, fileName: string): Promise<boolean> {
  if (typeof document === 'undefined') return false;

  const popup = window.open('', '_blank');
  if (popup) {
    popup.document.open();
    popup.document.write(buildCatalogHtml(doc, true));
    popup.document.title = fileName.replace(/\.pdf$/i, '');
    popup.document.close();
    return true;
  }

  return printFromFrame(buildCatalogHtml(doc));
}
