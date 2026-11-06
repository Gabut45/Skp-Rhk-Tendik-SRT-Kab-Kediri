import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
        display: inline-block !important;
        max-width: 100% !important;
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 4px !important;
        padding: 3px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .pdf-render-root .photo-single-img {
        max-width: 100% !important;
        max-height: 280px !important;
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
      .pdf-render-root .signature-img {
        max-height: 48px !important;
        max-width: 130px !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
        display: block !important;
        margin: 0 auto !important;
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

  try {
    // 1. Process all images: convert them to real raster canvas elements
    // This completely bypasses html2canvas cloning/caching bugs and crossOrigin race conditions
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        try {
          const rawSrc = img.getAttribute('src') || '';
          if (!rawSrc || !rawSrc.trim() || rawSrc === 'data:,' || rawSrc === 'null' || rawSrc === 'undefined') {
            // Remove empty image and clean up empty wrapper boxes
            const parentBox = img.closest('.photo-single-box, .photo-proof-box');
            if (parentBox) parentBox.remove();
            else img.remove();
            return;
          }

          let srcToUse = rawSrc;
          if (rawSrc.startsWith('http')) {
            try {
              const res = await fetch(rawSrc, { mode: 'cors' });
              if (res.ok) {
                const blob = await res.blob();
                const reader = new FileReader();
                srcToUse = await new Promise<string>((resolveReader) => {
                  reader.onloadend = () => {
                    resolveReader(typeof reader.result === 'string' ? reader.result : rawSrc);
                  };
                  reader.onerror = () => resolveReader(rawSrc);
                  reader.readAsDataURL(blob);
                });
                img.src = srcToUse;
              }
            } catch {
              // Keep original src if fetch fails
            }
          }

          // Create an off-screen Image object to guarantee full asynchronous decode
          const loaderImg = new Image();
          if (srcToUse.startsWith('data:') || srcToUse.startsWith('blob:') || rawSrc.startsWith('http')) {
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
            setTimeout(finish, 3500);
            loaderImg.src = srcToUse;
            if (loaderImg.complete && loaderImg.naturalWidth > 0) {
              finish();
            }
          });

          const naturalW = loaderImg.naturalWidth || img.naturalWidth;
          const naturalH = loaderImg.naturalHeight || img.naturalHeight;

          if (naturalW > 0 && naturalH > 0) {
            // Create a high-fidelity <canvas> element to replace <img>
            // html2canvas renders <canvas> directly via ctx.drawImage without caching/cloning lag
            const canvasEl = document.createElement('canvas');
            canvasEl.width = naturalW;
            canvasEl.height = naturalH;
            const cCtx = canvasEl.getContext('2d');
            if (cCtx) {
              cCtx.drawImage(loaderImg, 0, 0, naturalW, naturalH);
            }

            // Copy attributes & classNames
            canvasEl.className = img.className;
            if (img.id) canvasEl.id = img.id;

            // Maintain exact responsive styling so layout matches iframe preview perfectly
            canvasEl.style.maxWidth = img.style.maxWidth || '100%';
            canvasEl.style.maxHeight = img.style.maxHeight || '280px';
            canvasEl.style.width = 'auto';
            canvasEl.style.height = 'auto';
            canvasEl.style.display = img.style.display || 'block';
            canvasEl.style.margin = img.style.margin || '0 auto';
            canvasEl.style.borderRadius = img.style.borderRadius || '2px';
            canvasEl.style.objectFit = 'contain';

            img.parentNode?.replaceChild(canvasEl, img);
          } else {
            // Failed to load pixels, remove blank placeholder
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
