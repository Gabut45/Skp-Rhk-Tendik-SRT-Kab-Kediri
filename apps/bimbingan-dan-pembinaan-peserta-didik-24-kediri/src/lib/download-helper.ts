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
      }, 2000);
    }
  }, 600);
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
  // Positioned off-screen with opacity: 1 so layout is fully computed
  const container = document.createElement('div');
  container.className = 'pdf-render-root';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // Exactly 210mm at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#111111';
  container.style.zIndex = '-9999';
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
      .pdf-render-root img {
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
    // Ensure all images are completely loaded and decoded
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        try {
          const src = img.getAttribute('src');
          if (src && src.startsWith('http')) {
            try {
              const res = await fetch(src, { mode: 'cors' });
              if (res.ok) {
                const blob = await res.blob();
                const reader = new FileReader();
                await new Promise<void>((resolveReader) => {
                  reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                      img.src = reader.result;
                    }
                    resolveReader();
                  };
                  reader.readAsDataURL(blob);
                });
              }
            } catch {
              // Proceed with original src
            }
          }

          if (img.complete && img.naturalWidth > 0) return;
          if (img.decode) {
            await img.decode();
            return;
          }
          await new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
            setTimeout(res, 2000);
          });
        } catch {
          // Ignore individual image load failures
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
    if (canvas.height <= maxPageCanvasHeight * 1.15) {
      const renderedHeight = (canvas.height * printWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.96), 'JPEG', margin, margin, printWidth, renderedHeight);
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

      const sliceDataUrl = pageCanvas.toDataURL('image/jpeg', 0.96);
      const renderedHeightOnPage = (sliceHeight * printWidth) / canvas.width;

      if (pageIndex > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(sliceDataUrl, 'JPEG', margin, margin, printWidth, renderedHeightOnPage);

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
