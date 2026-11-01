import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { Button } from '@project/components/ui/button';
import { FileDown, FileText, X, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  pdfHtml: string;
  wordHtml: string;
  onDownloadPdf: () => void;
  onDownloadWord: () => void;
  downloadingPdf?: boolean;
  downloadingWord?: boolean;
  title?: string;
}

export default function PreviewDialog({
  open, onClose, pdfHtml, wordHtml,
  onDownloadPdf, onDownloadWord,
  downloadingPdf, downloadingWord,
  title = 'Preview Laporan',
}: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base">{title}</DialogTitle>
              <DialogDescription className="sr-only">Preview dan cetak laporan</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onDownloadPdf} disabled={downloadingPdf} size="sm" className="gap-2">
                {downloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                Cetak PDF
              </Button>
              <Button onClick={onDownloadWord} disabled={downloadingWord} size="sm" variant="secondary" className="gap-2">
                {downloadingWord ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                Cetak Word
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
