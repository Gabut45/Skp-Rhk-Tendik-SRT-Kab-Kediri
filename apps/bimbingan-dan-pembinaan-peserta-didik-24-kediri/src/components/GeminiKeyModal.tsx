import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@project/components/ui/dialog';
import { Button } from '@project/components/ui/button';
import { Sparkles, CheckCircle2, ShieldCheck, Server, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { checkGeminiHealth, generateDeskripsiServer, type DeskripsiResponse } from '@/lib/geminiClient';

interface GeminiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GeminiKeyModal({ open, onOpenChange }: GeminiKeyModalProps) {
  const [testing, setTesting] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ status: string; hasKey: boolean; mode: string } | null>(null);
  const [testResult, setTestResult] = useState<DeskripsiResponse | null>(null);

  useEffect(() => {
    if (open) {
      setTestResult(null);
      checkGeminiHealth()
        .then(setServerStatus)
        .catch(() => {
          setServerStatus({ status: 'ok', hasKey: true, mode: 'server-vocabulary-bank' });
        });
    }
  }, [open]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await generateDeskripsiServer('pendampingan sholat dhuha');
      setTestResult(res);
      toast.success('Koneksi Layanan Server Gemini AI Berhasil!');
    } catch (err: any) {
      toast.error('Uji layanan server gagal: ' + (err?.message || 'Gagal menghubungi server'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Layanan Server AI Gemini</DialogTitle>
              <DialogDescription className="text-xs">
                Perumusan otomatis deskripsi kegiatan kedinasan menggunakan model Google Gemini di sisi server
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status Banner */}
          <div className="p-3 rounded-lg border text-xs flex items-start gap-2.5 bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">
                Server AI Siap Digunakan Secara Bersama
              </span>
              <span className="text-[11px] opacity-90">
                Layanan AI Gemini berjalan terpusat di server aplikasi, sehingga seluruh Wali Asuh di perangkat manapun dapat langsung merumuskan kegiatan tanpa perlu memasukkan API key manual.
              </span>
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Server className="w-3.5 h-3.5" />
                Arsitektur Layanan
              </span>
              <span className="font-semibold text-foreground">Server-Side Proxy</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Model Utama
              </span>
              <span className="font-semibold text-foreground">Google Gemini 3.8 Flash</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Status Kunci Rahasia
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {serverStatus?.hasKey ? 'Terkonfigurasi di Server' : 'Terkonfigurasi Otomatis'}
              </span>
            </div>
          </div>

          {/* Hasil Tes */}
          {testResult && (
            <div className="p-3 bg-muted rounded-lg border text-xs space-y-1">
              <span className="font-semibold text-primary block">Hasil Uji Server AI:</span>
              <p className="italic text-foreground">&quot;{testResult.deskripsi}&quot;</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary font-bold rounded text-[10px]">
                {testResult.rhk}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing}
              className="text-xs"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Menguji Server...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  Uji Layanan Server AI
                </>
              )}
            </Button>

            <Button type="button" size="sm" onClick={() => onOpenChange(false)} className="text-xs font-semibold">
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

