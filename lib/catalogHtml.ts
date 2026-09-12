import { Image, Platform } from 'react-native';

import type { CatalogDocument, CatalogImage, CatalogPage } from '@/lib/catalog';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Absolute URL for a catalog image so it still loads inside the print document. */
function imageUri(image: CatalogImage): string | null {
  const resolved = Image.resolveAssetSource(image.source);
  if (!resolved?.uri) return null;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      return new URL(resolved.uri, window.location.href).href;
    } catch {
      return resolved.uri;
    }
  }

  return resolved.uri;
}

function overlays(image: CatalogImage): string {
  return image.overlays
    .map(
      (overlay) =>
        `<span class="layer" style="background:${overlay.color};opacity:${overlay.opacity}${
          overlay.blend ? `;mix-blend-mode:${overlay.blend}` : ''
        }"></span>`,
    )
    .join('');
}

type FigureOptions = {
  className?: string;
  caption?: string;
};

function figure(image: CatalogImage | null, options: FigureOptions = {}): string {
  const className = ['frame', options.className].filter(Boolean).join(' ');
  const uri = image ? imageUri(image) : null;

  if (!image || !uri) {
    return `<figure class="${className}"><div class="frame-empty">No image selected</div></figure>`;
  }

  const caption = options.caption ? `<figcaption>${escapeHtml(options.caption)}</figcaption>` : '';

  return `<figure class="${className}">
      <div class="frame-media">
        <img src="${uri}" alt="${escapeHtml(image.label)}" />
        ${overlays(image)}
      </div>
      ${caption}
    </figure>`;
}

function pageChrome(doc: CatalogDocument, label: string, index: number, total: number) {
  return {
    header: `<header class="page-header">
        <span class="tracked">${escapeHtml(label)}</span>
        <span class="tracked muted">${escapeHtml(doc.brand || 'Fashy Flash')}</span>
      </header>`,
    footer: `<footer class="page-footer">
        <span>${escapeHtml(doc.title)}</span>
        <span>${index + 1} / ${total}</span>
      </footer>`,
  };
}

function renderPage(doc: CatalogDocument, page: CatalogPage, index: number, total: number): string {
  const { header, footer } = pageChrome(doc, page.label, index, total);

  if (page.kind === 'cover') {
    const subtitle = [doc.category, doc.material].filter(Boolean).join(' &middot; ');

    return `<section class="page cover">
        <header class="page-header">
          <span class="wordmark">Fashy <em>Flash</em></span>
          <span class="tracked muted">Digital catalog</span>
        </header>
        ${figure(page.hero, { className: 'frame-fill' })}
        <div class="cover-title">
          <span class="tracked accent">${escapeHtml(doc.category || 'New piece')}</span>
          <h1>${escapeHtml(doc.title)}</h1>
          ${subtitle ? `<p class="lead">${subtitle}</p>` : ''}
          <p class="muted small">${escapeHtml(doc.issue)}</p>
        </div>
      </section>`;
  }

  if (page.kind === 'views') {
    const media =
      page.images.length === 0
        ? figure(null, { className: 'frame-fill' })
        : page.images
            .map((image) => figure(image, { className: 'frame-fill', caption: image.label }))
            .join('');

    return `<section class="page">
        ${header}
        <div class="views">${media}</div>
        <div class="page-caption">
          <h2>${escapeHtml(doc.title)}</h2>
          <p class="muted small">${escapeHtml(
            [doc.category, doc.material, doc.fit].filter(Boolean).join(' · '),
          )}</p>
        </div>
        ${footer}
      </section>`;
  }

  const rows = [
    { label: 'Product name', value: doc.title },
    { label: 'Category', value: doc.category || '—' },
    { label: 'Material', value: doc.material || '—' },
    { label: 'Fit', value: doc.fit || '—' },
    ...(doc.brand ? [{ label: 'Brand', value: doc.brand }] : []),
    ...(doc.sku ? [{ label: 'SKU', value: doc.sku }] : []),
  ]
    .map(
      (row) =>
        `<div class="spec-row"><span class="tracked muted">${escapeHtml(
          row.label,
        )}</span><span class="spec-value">${escapeHtml(row.value)}</span></div>`,
    )
    .join('');

  const sizes =
    doc.sizes.length === 0
      ? `<p class="lead">${escapeHtml(doc.sizeRange || 'Size range not set')}</p>`
      : `<div class="sizes">${doc.sizes
          .map((size) => `<span class="size">${escapeHtml(size)}</span>`)
          .join('')}</div>`;

  return `<section class="page">
      ${header}
      <div class="page-intro">
        <h2 class="spec-title">${escapeHtml(doc.title)}</h2>
        <span class="tracked accent">${escapeHtml(doc.category || 'Product data')}</span>
      </div>
      <div class="specs">${rows}</div>
      <div class="block">
        <span class="tracked muted">Available sizes</span>
        ${sizes}
      </div>
      ${
        doc.description
          ? `<div class="block">
              <span class="tracked muted">Description</span>
              <p class="body">${escapeHtml(doc.description)}</p>
            </div>`
          : ''
      }
      <div class="spacer"></div>
      ${footer}
    </section>`;
}

const STYLES = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #E9E3DA;
    font-family: 'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif;
    color: #232120;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    position: relative;
    width: 210mm;
    height: 297mm;
    padding: 16mm;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
    page-break-after: always;
    break-after: page;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .page.cover { background: #FBF7F2; }
  .page-header { display: flex; align-items: center; justify-content: space-between; gap: 8mm; }
  .page-footer {
    display: flex; align-items: center; justify-content: space-between;
    border-top: 0.4mm solid #E4DACE; padding-top: 3mm; margin-top: 4mm;
    font-size: 8pt; color: #8C837C;
  }
  .wordmark { font-family: 'Playfair Display', Georgia, serif; font-size: 15pt; font-weight: 600; }
  .wordmark em { font-style: normal; font-weight: 400; }
  .tracked { text-transform: uppercase; letter-spacing: 0.18em; font-size: 7.5pt; }
  .muted { color: #8C837C; }
  .accent { color: #C08A85; }
  .small { font-size: 8pt; }
  h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 28pt; font-weight: 500; margin: 2mm 0 0; }
  h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 16pt; font-weight: 500; margin: 0; }
  .spec-title { font-size: 21pt; }
  .lead { font-size: 10pt; color: #615C58; margin: 1mm 0 0; }
  .body { font-size: 9.5pt; line-height: 1.5; color: #615C58; margin: 1mm 0 0; }
  .frame { margin: 0; display: flex; flex-direction: column; gap: 2mm; }
  .frame-fill { flex: 1; min-height: 0; }
  .frame-media { position: relative; flex: 1; min-height: 0; overflow: hidden; border-radius: 1mm; background: #F5F0E9; isolation: isolate; }
  .frame-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .frame-empty {
    flex: 1; display: flex; align-items: center; justify-content: center;
    border: 0.4mm dashed #E4DACE; border-radius: 1mm; color: #8C837C;
    text-transform: uppercase; letter-spacing: 0.16em; font-size: 7.5pt;
  }
  .frame-portrait .frame-media { aspect-ratio: 3 / 4; flex: none; }
  figcaption { font-size: 8.5pt; color: #615C58; }
  .layer { position: absolute; inset: 0; display: block; }
  .cover .frame-fill { margin: 10mm 0 8mm; }
  .cover-title { display: flex; flex-direction: column; gap: 1mm; }
  .views { flex: 1; min-height: 0; display: flex; gap: 5mm; margin: 6mm 0 5mm; }
  .views .frame { flex: 1; }
  .page-caption { display: flex; flex-direction: column; gap: 1mm; }
  .page-intro { display: flex; flex-direction: column; gap: 1.5mm; margin-top: 6mm; }
  .specs { margin-top: 6mm; }
  .spec-row {
    display: flex; align-items: center; justify-content: space-between; gap: 8mm;
    padding: 3mm 0; border-bottom: 0.3mm solid #EFE7DC;
  }
  .spec-value { font-size: 10pt; text-align: right; }
  .block { display: flex; flex-direction: column; gap: 2.5mm; margin-top: 7mm; }
  .sizes { display: flex; flex-wrap: wrap; gap: 2.5mm; }
  .size { border: 0.3mm solid #E4DACE; border-radius: 999px; padding: 1.2mm 3.5mm; font-size: 9pt; }
  .spacer { flex: 1; }
`;

const AUTO_PRINT = `
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.focus(); window.print(); }, 500);
    });
  </script>
`;

/** Renders the catalog document as a print-ready A4 HTML document. */
export function buildCatalogHtml(doc: CatalogDocument, autoPrint = false): string {
  const pages = doc.pages
    .map((page, index) => renderPage(doc, page, index, doc.pages.length))
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(doc.title)} — Digital Catalog</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    <style>${STYLES}</style>
  </head>
  <body>
    ${pages}
    ${autoPrint ? AUTO_PRINT : ''}
  </body>
</html>`;
}
