import html2pdf from 'html2pdf.js';

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
 * Build a self-contained, in-flow DOM element with full styles and preloaded images for html2pdf.
 * Crucial: Do NOT give this element position:fixed or position:absolute or left:-9999px,
 * as html2pdf clones the element into its own container; out-of-flow children cause the container
 * to collapse to 0 height, producing a blank white PDF.
 */
async function buildPdfSourceElement(html: string): Promise<HTMLElement> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract all <style> text from head and body
  const customStyles = Array.from(doc.querySelectorAll('style'))
    .map(s => s.innerHTML)
    .join('\n');

  // Container must be in normal flow (width: 100% or 794px, height: auto)
  const container = document.createElement('div');
  container.className = 'pdf-render-root';
  container.style.width = '100%';
  container.style.maxWidth = '794px';
  container.style.margin = '0 auto';
  container.style.padding = '0';
  container.style.boxSizing = 'border-box';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#111111';
  container.style.fontFamily = "'Times New Roman', Times, serif";
  container.style.fontSize = '11pt';
  container.style.lineHeight = '1.5';

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .pdf-render-root, .pdf-render-root * {
      box-sizing: border-box;
      color: #111111;
      font-family: 'Times New Roman', Times, serif;
    }
    .pdf-render-root table {
      border-collapse: collapse !important;
      width: 100% !important;
    }
    .pdf-render-root table.meta-table {
      margin-top: 14px !important;
      margin-bottom: 18px !important;
      width: 100% !important;
    }
    .pdf-render-root table.meta-table td {
      line-height: 1.6 !important;
      vertical-align: middle !important;
    }
    .pdf-render-root table.main {
      margin-top: 4px !important;
      margin-bottom: 24px !important;
      width: 100% !important;
    }
    .pdf-render-root table.main tr,
    .pdf-render-root tr.no-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .pdf-render-root table.main th {
      background-color: #f2f2f2 !important;
      padding: 7px 8px !important;
      border: 1px solid #222 !important;
      font-size: 10pt !important;
      font-weight: bold !important;
      color: #000 !important;
      text-align: center !important;
    }
    .pdf-render-root table.main td {
      font-size: 10pt !important;
      border: 1px solid #222 !important;
      padding: 6px 8px !important;
      line-height: 1.5 !important;
    }
    .pdf-render-root h1 {
      text-align: center !important;
      font-size: 13.5pt !important;
      margin: 14px 0 8px 0 !important;
      text-decoration: underline !important;
      font-weight: bold !important;
      letter-spacing: 0.5px !important;
    }
    .pdf-render-root img {
      max-width: 100% !important;
      height: auto !important;
      display: inline-block !important;
    }
    /* STRICT PROPORTIONAL SIGNATURE RULES: Prevent giant blown-up signatures */
    .pdf-render-root img.signature-img,
    .pdf-render-root .signature-img {
      width: auto !important;
      max-width: 135px !important;
      height: auto !important;
      max-height: 52px !important;
      object-fit: contain !important;
      display: block !important;
      margin: 2px auto !important;
    }
    /* SIGNATURE BLOCK MUST NEVER BE SLICED ACROSS PAGES */
    .pdf-render-root .signature-block,
    .pdf-render-root .avoid-page-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      display: block !important;
      margin-bottom: 20px !important;
      overflow: visible !important;
    }
    .pdf-render-root .signature-block td {
      overflow: visible !important;
      padding-bottom: 16px !important;
    }
    /* ENSURE NIP AND TEXT ARE NEVER CLIPPED */
    .pdf-render-root .signature-nip,
    .pdf-render-root p.signature-nip {
      font-size: 10.5pt !important;
      line-height: 1.6 !important;
      padding-bottom: 10px !important;
      margin-top: 2px !important;
      margin-bottom: 0 !important;
      white-space: nowrap !important;
      display: block !important;
      overflow: visible !important;
    }
    .pdf-render-root .meta-spacing {
      height: 14px !important;
      width: 100% !important;
    }
    .pdf-render-root .kop-line {
      border-top: 2.5px solid #000 !important;
      border-bottom: 1px solid #000 !important;
      height: 3px !important;
      margin: 6px 0 16px 0 !important;
    }
    ${customStyles}
  `;
  container.appendChild(styleTag);

  const bodyWrapper = document.createElement('div');
  bodyWrapper.innerHTML = doc.body.innerHTML;
  container.appendChild(bodyWrapper);

  // Preload and make images CORS safe if possible
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
            // Keep original src if fetch fails
          }
        }
      } catch {
        // Ignore fetch errors
      }

      if (img.complete && img.naturalWidth > 0) return;
      await new Promise<void>((resolveImg) => {
        img.onload = () => resolveImg();
        img.onerror = () => resolveImg();
        setTimeout(resolveImg, 3000);
      });
    })
  );

  return container;
}

/**
 * Directly generate and download an actual .pdf file using html2pdf
 */
export async function downloadPdfFromHtml(html: string, filename: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const fname = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    const sourceElement = await buildPdfSourceElement(html);

    const opt = {
      margin: [10, 10, 12, 10] as [number, number, number, number],
      filename: fname,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
      },
      pagebreak: { mode: ['css', 'legacy'] },
    };

    // html2pdf clones sourceElement and attaches it inside its own container in document.body
    await html2pdf().set(opt).from(sourceElement).save();
  } catch (err) {
    console.warn('html2pdf direct save failed, opening print dialog fallback:', err);
    printHtml(html);
    throw err;
  }
}
