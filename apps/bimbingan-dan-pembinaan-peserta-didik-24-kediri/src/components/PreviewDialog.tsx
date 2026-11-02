import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { Button } from '@project/components/ui/button';
import { FileDown, FileText, Printer, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { downloadPdfFromHtml, downloadWordFromHtml, printHtml } from '@/lib/download-helper';
import { toast } from 'sonner';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  pdfHtml: string;
  wordHtml: string;
  filename?: string;
  onDownloadPdf?: () => void;
  onDownloadWord?: () => void;
  downloadingPdf?: boolean;
  downloadingWord?: boolean;
  title?: string;
}

export default function PreviewDialog({
  open, onClose, pdfHtml, wordHtml, filename = 'laporan',
  onDownloadPdf, onDownloadWord,
  downloadingPdf: externalDownloadingPdf,
  downloadingWord: externalDownloadingWord,
  title = 'Preview Laporan',
}: PreviewDialogProps) {
  const [internalDownloadingPdf, setInternalDownloadingPdf] = useState(false);
  const [internalDownloadingWord, setInternalDownloadingWord] = useState(false);

  const isDownloadingPdf = externalDownloadingPdf || internalDownloadingPdf;
  const isDownloadingWord = externalDownloadingWord || internalDownloadingWord;

  const handleDownloadPdf = async () => {
    setInternalDownloadingPdf(true);
    try {
      if (onDownloadPdf) {
        await onDownloadPdf();
      } else {
        await downloadPdfFromHtml(pdfHtml, `${filename}.pdf`);
        toast.success('File PDF berhasil diunduh!');
      }
    } catch (err: any) {
      toast.error('Gagal mengunduh PDF: ' + (err?.message || 'Error'));
    } finally {
      setInternalDownloadingPdf(false);
    }
  };

  const handleDownloadWord = async () => {
    setInternalDownloadingWord(true);
    try {
      if (onDownloadWord) {
        await onDownloadWord();
      } else {
        downloadWordFromHtml(wordHtml || pdfHtml, `${filename}.doc`);
        toast.success('File Word (.doc) berhasil diunduh!');
      }
    } catch (err: any) {
      toast.error('Gagal mengunduh Word: ' + (err?.message || 'Error'));
    } finally {
      setInternalDownloadingWord(false);
    }
  };

  const handlePrint = () => {
    try {
      printHtml(pdfHtml);
      toast.info('Membuka dialog cetak browser (Simpan sebagai PDF)');
    } catch {
      toast.error('Gagal membuka dialog cetak');
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <DialogTitle className="text-base">{title}</DialogTitle>
              <DialogDescription className="sr-only">Preview dan unduh laporan PDF / Word</DialogDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                {isDownloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                Unduh PDF (.pdf)
              </Button>
              <Button
                onClick={handleDownloadWord}
                disabled={isDownloadingWord}
                size="sm"
                variant="secondary"
                className="gap-2 border shadow-sm"
              >
                {isDownloadingWord ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                Unduh Word (.doc)
              </Button>
              <Button
                onClick={handlePrint}
                size="sm"
                variant="outline"
                className="gap-2"
                title="Buka dialog cetak browser untuk mencetak langsung atau Simpan sebagai PDF kualitas vektor"
              >
                <Printer size={14} />
                Cetak / Simpan PDF (Browser)
              </Button>
            </div>
          </div>
        </DialogHeader>
        <Tabs defaultValue="pdf" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 mt-2 w-fit">
            <TabsTrigger value="pdf">Preview PDF</TabsTrigger>
            <TabsTrigger value="word">Preview Word</TabsTrigger>
          </TabsList>
          <TabsContent value="pdf" className="flex-1 m-0 p-4 pt-2 min-h-0">
            <div className="w-full h-full border rounded-lg overflow-hidden bg-white">
              <iframe
                srcDoc={pdfHtml}
                className="w-full h-full"
                title="PDF Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </TabsContent>
          <TabsContent value="word" className="flex-1 m-0 p-4 pt-2 min-h-0">
            <div className="w-full h-full border rounded-lg overflow-hidden bg-white">
              <iframe
                srcDoc={wordHtml}
                className="w-full h-full"
                title="Word Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
