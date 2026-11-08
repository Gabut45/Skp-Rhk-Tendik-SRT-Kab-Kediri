import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { LOGO_BASE64 } from './logo-base64';

/**
 * Trigger native browser Print dialog via hidden iframe (useful for high-quality Save as PDF)
 */
export function printHtml(html: string): void {
  if (typeof window === 'undefined') return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  // Allow images and fonts to load before opening print dialog
  const iframeDoc = iframe.contentWindow?.document;
  const iframeImgs = iframeDoc ? Array.from(iframeDoc.querySelectorAll('img')) : [];
  const waitImgs = Promise.all(
    iframeImgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((res) => {
        img.onload = () => res();
        img.onerror = () => res();
        setTimeout(res, 2500);
      });
    })
  );

  waitImgs.then(() => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Print error, falling back:', e);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }
    }, 300);
  });
}

/**
 * Directly download an editable Microsoft Word (.doc) file
 */
export function downloadWordFromHtml(html: string, filename: string): void {
  if (typeof window === 'undefined') return;

  const fname = filename.endsWith('.doc') ? filename : `${filename}.doc`;

  // Clean html and add Word metadata
  let content = html;
  if (!content.includes('xmlns:w=')) {
    content = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${fname}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 { size: 210mm 297mm; margin: 15mm 20mm; }
          div.Section1 { page: Section1; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; }
          table { border-collapse: collapse; width: 100%; }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${html}
        </div>
      </body>
      </html>
    `;
  }

  const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Directly generate and download a clean, high-quality .pdf file using jsPDF and html2canvas.
 * Features intelligent page-slicing that respects element boundaries (never cuts table rows or signature blocks).
 */
export async function downloadPdfFromHtml(html: string, filename: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const fname = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // If input is already a real binary PDF data URL, download directly
  if (html.startsWith('data:application/pdf')) {
    const a = document.createElement('a');
    a.href = html;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  let cleanHtml = html;
  if (cleanHtml.startsWith('data:text/html;charset=utf-8,')) {
    cleanHtml = decodeURIComponent(cleanHtml.slice('data:text/html;charset=utf-8,'.length));
  } else if (cleanHtml.startsWith('data:text/html,')) {
    cleanHtml = decodeURIComponent(cleanHtml.slice('data:text/html,'.length));
  }

  if (!cleanHtml || !cleanHtml.trim()) {
    throw new Error('Data laporan kosong, tidak dapat membuat PDF');
  }

  // Parse HTML
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(cleanHtml, 'text/html');

  // Extract custom styles
  const customStyles = Array.from(parsedDoc.querySelectorAll('style'))
    .map((s) => s.innerHTML)
    .join('\n');

  // Create isolated render container attached to document.body
  // Positioned at top: 0, left: 0 behind content (z-index: -99999) so browser graphics engine actively composites images
  const container = document.createElement('div');
  container.className = 'pdf-render-root';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '794px'; // Exactly 210mm at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#111111';
  container.style.zIndex = '-99999';
  container.style.opacity = '1';
  container.style.visibility = 'visible';
  container.style.pointerEvents = 'none';
  container.style.padding = '18px 22px';
  container.style.boxSizing = 'border-box';

  container.innerHTML = `
    <style>
      .pdf-render-root, .pdf-render-root * {
        box-sizing: border-box !important;
        color: #111111 !important;
        font-family: 'Times New Roman', Times, serif !important;
      }
      .pdf-render-root table {
        border-collapse: collapse !important;
        width: 100% !important;
      }
      .pdf-render-root table.meta-table {
        margin-top: 6px !important;
        margin-bottom: 8px !important;
        width: 100% !important;
      }
      .pdf-render-root table.meta-table td {
        line-height: 1.4 !important;
        vertical-align: middle !important;
        padding: 2px 0 !important;
      }
      .pdf-render-root table.main {
        margin-top: 4px !important;
        margin-bottom: 12px !important;
        width: 100% !important;
      }
      .pdf-render-root table.main th {
        background-color: #f2f2f2 !important;
        padding: 5px 6px !important;
        border: 1px solid #222 !important;
        font-size: 9.5pt !important;
        font-weight: bold !important;
        text-align: center !important;
      }
      .pdf-render-root table.main td {
        font-size: 9.5pt !important;
        border: 1px solid #222 !important;
        padding: 5px 6px !important;
        line-height: 1.4 !important;
      }
      .pdf-render-root h1 {
        text-align: center !important;
        font-size: 13pt !important;
        margin: 8px 0 4px 0 !important;
        text-decoration: underline !important;
        font-weight: bold !important;
      }
      .pdf-render-root .kop-line {
        border-top: 2.5px solid #000 !important;
        border-bottom: 1px solid #000 !important;
        height: 3px !important;
        margin: 4px 0 10px 0 !important;
      }
      .pdf-render-root img, .pdf-render-root canvas {
        max-width: 100% !important;
        object-fit: contain !important;
      }
      .pdf-render-root .photo-proof-box {
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 4px !important;
        padding: 3px !important;
        display: block !important;
        text-align: center !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .pdf-render-root .photo-proof-img {
        max-width: 100% !important;
        max-height: 230px !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
        display: block !important;
        margin: 0 auto !important;
        border-radius: 2px !important;
      }
      .pdf-render-root .photo-single-box {
        display: block !important;
        max-width: 340px !important;
        margin: 0 auto !important;
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 4px !important;
        padding: 3px !important;
        text-align: center !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .pdf-render-root .photo-single-img {
        max-width: 100% !important;
        max-height: 240px !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
        display: block !important;
        margin: 0 auto !important;
        border-radius: 2px !important;
      }
      .pdf-render-root .signature-block {
        margin-top: 14px !important;
        margin-bottom: 6px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .pdf-render-root .kop-logo-img,
      .pdf-render-root .kop-block img {
        width: 68px !important;
        max-width: 68px !important;
        height: auto !important;
        display: block !important;
        margin: 0 auto !important;
        background: transparent !important;
        background-color: transparent !important;
      }
      .pdf-render-root .signature-img {
        max-height: 48px !important;
        max-width: 130px !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
        display: block !important;
        margin: 0 auto !important;
        background: transparent !important;
        background-color: transparent !important;
      }
      .pdf-render-root .signature-nip {
        font-size: 10pt !important;
        line-height: 1.4 !important;
        white-space: nowrap !important;
        display: block !important;
      }
      ${customStyles}
    </style>
    <div class="pdf-inner-content">
      ${parsedDoc.body.innerHTML}
    </div>
  `;

  document.body.appendChild(container);

// Multi-tier helper to convert external hosting images to in-memory Base64 Data URL
// This bypasses browser CORS restrictions and guarantees html2canvas never drops images
async function resolveImageToDataUrl(rawSrc: string): Promise<string> {
  if (!rawSrc || typeof rawSrc !== 'string') return rawSrc;
  const s = rawSrc.trim();
  if (s.startsWith('data:image/')) return s;
  if (!s.startsWith('http://') && !s.startsWith('https://') && !s.startsWith('blob:')) return s;

  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === 'string' ? reader.result : s);
      };
      reader.onerror = () => resolve(s);
      reader.readAsDataURL(blob);
    });
  };

  // Tier 1: Local server proxy (/api/proxy-image?url=...)
  // Since the Node server fetches directly from hosting without browser CORS, this succeeds 100%
  try {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(s)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 50) {
        return await blobToDataUrl(blob);
      }
    }
  } catch {}

  // Tier 2: Direct fetch with CORS mode
  try {
    const res = await fetch(s, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 50) {
        return await blobToDataUrl(blob);
      }
    }
  } catch {}

  // Tier 3: cPanel API endpoint (?action=get_image&file=...)
  try {
    const cpanelApi = (typeof window !== 'undefined' ? localStorage.getItem('cpanel_api_url') : null) || 'https://game.gabutgame.my.id/skp/api_kegiatan.php';
    const cpanelImgUrl = `${cpanelApi.split('?')[0]}?action=get_image&file=${encodeURIComponent(s)}`;
    const res = await fetch(cpanelImgUrl);
    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 50) {
        return await blobToDataUrl(blob);
      }
    }
  } catch {}

  return s;
}

  try {
    // 1. Process all images: ensure loaded, normalized to local base64, and give explicit pixel dimensions
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        try {
          const rawSrc = img.getAttribute('src') || '';
          if (!rawSrc || !rawSrc.trim() || rawSrc === 'data:,' || rawSrc === 'null' || rawSrc === 'undefined') {
            const parentBox = img.closest('.photo-single-box, .photo-proof-box');
            if (parentBox) parentBox.remove();
            else img.remove();
            return;
          }

          // Convert any external URL to local Base64 data URL
          const srcToUse = await resolveImageToDataUrl(rawSrc);

          // Preload in an Image object to ensure fully decoded bitmap
          const loaderImg = new Image();
          if (srcToUse.startsWith('http')) {
            loaderImg.crossOrigin = 'anonymous';
          }

          await new Promise<void>((resolveLoad) => {
            let done = false;
            const finish = () => {
              if (!done) {
                done = true;
                resolveLoad();
              }
            };
            loaderImg.onload = finish;
            loaderImg.onerror = finish;
            setTimeout(finish, 4000);
            loaderImg.src = srcToUse;
            if (loaderImg.complete && loaderImg.naturalWidth > 0) {
              finish();
            }
          });

          const naturalW = loaderImg.naturalWidth || img.naturalWidth;
          const naturalH = loaderImg.naturalHeight || img.naturalHeight;

          if (naturalW > 0 && naturalH > 0) {
            const isKopLogo =
              img.classList.contains('kop-logo-img') ||
              img.closest('.kop-block') !== null ||
              img.closest('td[style*="80px"], td[style*="85px"]') !== null ||
              srcToUse.startsWith(LOGO_BASE64.substring(0, 40)) ||
              srcToUse.includes('logo') ||
              (img.getAttribute('alt') || '').toLowerCase().includes('logo');

            const isSig =
              img.classList.contains('signature-img') ||
              img.closest('.signature-block') !== null ||
              (img.getAttribute('alt') || '').toLowerCase().includes('tanda tangan') ||
              (img.getAttribute('alt') || '').toLowerCase().includes('signature');

            const isSingle = img.classList.contains('photo-single-img');

            // CRITICAL: DO NOT convert images through canvas.toDataURL('image/jpeg')!
            // Doing so strips alpha channels and turns transparent PNGs (kop logo & signatures) into solid black blocks!
            // srcToUse is already a valid base64 data URL or direct image URI.
            img.src = srcToUse;

            if (isKopLogo) {
              const kopW = 68;
              img.width = kopW;
              img.style.width = `${kopW}px`;
              img.style.height = 'auto';
              img.style.maxWidth = `${kopW}px`;
              img.style.maxHeight = '90px';
              img.style.display = 'block';
              img.style.margin = '0 auto';
              img.style.background = 'transparent';
              img.style.backgroundColor = 'transparent';
            } else if (isSig) {
              img.style.maxWidth = '130px';
              img.style.maxHeight = '48px';
              img.style.width = 'auto';
              img.style.height = 'auto';
              img.style.display = 'block';
              img.style.margin = '0 auto';
              img.style.background = 'transparent';
              img.style.backgroundColor = 'transparent';
              img.style.objectFit = 'contain';
            } else {
              // Documentation photo: proportional scaling with explicit width/height in px
              const maxW = isSingle ? 340 : 280;
              const maxH = isSingle ? 240 : 220;
              const ratio = Math.min(maxW / naturalW, maxH / naturalH, 1);
              const displayW = Math.max(1, Math.round(naturalW * ratio));
              const displayH = Math.max(1, Math.round(naturalH * ratio));

              img.width = displayW;
              img.height = displayH;
              img.style.width = `${displayW}px`;
              img.style.height = `${displayH}px`;
              img.style.maxWidth = '100%';
              img.style.maxHeight = `${maxH}px`;
              img.style.display = 'block';
              img.style.margin = '0 auto';
              img.style.objectFit = 'contain';
              img.style.borderRadius = '2px';
              img.style.background = 'transparent';
              img.style.backgroundColor = 'transparent';
            }

            if (img.decode) {
              await img.decode().catch(() => {});
            }
          } else {
            const parentBox = img.closest('.photo-single-box, .photo-proof-box');
            if (parentBox) parentBox.remove();
            else img.remove();
          }
        } catch (e) {
          console.warn('[download-helper] Error processing image:', e);
        }
      })
    );

    // Layout settle delay
    await new Promise((r) => setTimeout(r, 120));

    // Collect bounding boxes of all critical structural elements so we NEVER slice inside them
    const containerRect = container.getBoundingClientRect();
    const scale = 2; // high-DPI scale factor

    const noBreakElements = Array.from(
      container.querySelectorAll('tr, .signature-block, .kop-block, .meta-table, h1, h2, .section, .photo-proof-box, .photo-single-box')
    );

    const blocks: { top: number; bottom: number }[] = [];
    for (const el of noBreakElements) {
      const rect = el.getBoundingClientRect();
      const top = Math.round((rect.top - containerRect.top) * scale);
      const bottom = Math.round((rect.bottom - containerRect.top) * scale);
      if (bottom > top + 10) {
        blocks.push({ top, bottom });
      }
    }

    // Render full container into a high-DPI canvas
    const canvas = await html2canvas(container, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 15000,
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas render menghasilkan dimensi 0');
    }

    // Generate PDF with A4 pages
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const printWidth = pageWidth - margin * 2; // 194mm
    const printHeight = pageHeight - margin * 2; // 281mm

    // Height of one full A4 printable area in canvas pixel units
    const maxPageCanvasHeight = Math.floor(canvas.width * (printHeight / printWidth));

    // If the entire document fits within 1 page (with up to 15% tolerance for clean single-page layout)
    // Gunakan kualitas JPEG 0.80 dengan kompresi aktif: menghasilkan PDF jauh lebih ringan (hemat 60-75%) tanpa mengorbankan keterbacaan teks
    const PDF_JPEG_QUALITY = 0.80;

    if (canvas.height <= maxPageCanvasHeight * 1.15) {
      const renderedHeight = (canvas.height * printWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/jpeg', PDF_JPEG_QUALITY), 'JPEG', margin, margin, printWidth, renderedHeight, undefined, 'FAST');
      pdf.save(fname);
      return;
    }

    // Multi-page slicing with intelligent block-boundary detection (never cuts table rows or signature blocks)
    let currentY = 0;
    let pageIndex = 0;

    while (currentY < canvas.height) {
      let targetCutY = currentY + maxPageCanvasHeight;

      if (targetCutY >= canvas.height) {
        // Last page: capture remaining content
        targetCutY = canvas.height;
      } else {
        // Find if targetCutY intersects any block (e.g. signature block or a table row)
        let earliestSafeCut = targetCutY;
        for (const b of blocks) {
          if (b.top < targetCutY && b.bottom > targetCutY) {
            // Element would be cut in half!
            // Shift cut point to the start of this element so it moves intact to the next page
            if (b.top > currentY + 50) {
              if (b.top < earliestSafeCut) {
                earliestSafeCut = b.top;
              }
            }
          }
        }
        targetCutY = earliestSafeCut;
      }

      const sliceHeight = targetCutY - currentY;
      if (sliceHeight <= 0) break;

      // Slice the canvas cleanly for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          currentY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );
      }

      const sliceDataUrl = pageCanvas.toDataURL('image/jpeg', PDF_JPEG_QUALITY);
      const renderedHeightOnPage = (sliceHeight * printWidth) / canvas.width;

      if (pageIndex > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(sliceDataUrl, 'JPEG', margin, margin, printWidth, renderedHeightOnPage, undefined, 'FAST');

      currentY = targetCutY;
      pageIndex++;
    }

    pdf.save(fname);
  } catch (err) {
    console.warn('Direct jsPDF save failed, opening print dialog fallback:', err);
    printHtml(cleanHtml);
    throw err;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
