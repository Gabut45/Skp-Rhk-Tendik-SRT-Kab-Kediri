// Standalone PDF rendering using Blob object URLs
export class ZitePdf {
  static async renderHtml({ html, filename }: { html: string; filename?: string }) {
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      return { url: URL.createObjectURL(blob) };
    }
    return { url: 'data:text/html;charset=utf-8,' + encodeURIComponent(html) };
  }
}

export const Pdf = ZitePdf;
