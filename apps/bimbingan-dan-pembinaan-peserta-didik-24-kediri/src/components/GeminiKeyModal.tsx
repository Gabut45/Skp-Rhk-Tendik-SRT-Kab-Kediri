import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@project/components/ui/dialog';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Sparkles, CheckCircle2, AlertCircle, Key, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GeminiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GeminiKeyModal({ open, onOpenChange }: GeminiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ deskripsi: string; rhk: string } | null>(null);

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem('gemini_api_key') || '';
      setApiKey(stored);
      setTestResult(null);
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
      toast.success('Kunci API Gemini berhasil disimpan di browser!');
    } else {
      localStorage.removeItem('gemini_api_key');
      toast.info('Kunci API Gemini dihapus dari browser.');
    }
    onOpenChange(false);
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKey.trim() || localStorage.getItem('gemini_api_key') || '';
    if (!keyToTest) {
      toast.error('Masukkan Kunci API Gemini terlebih dahulu');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const prompt = `Anda adalah sistem AI perumus deskripsi Sasaran Kinerja Pegawai (SKP) / Rencana Hasil Kerja (RHK) Tenaga Kependidikan / Wali Asuh di Sekolah Rakyat Terintegrasi Kab Kediri.
Kata Kunci Kegiatan: "pendampingan sholat dhuha"

Instruksi:
Buat kalimat deskripsi kegiatan formal PNS/PPPK yang relevan dan tentukan RHK.
Keluarkan HANYA format JSON valid:
{"deskripsi": "...", "rhk": "RHK X"}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(keyToTest)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
          }),
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const parsed = JSON.parse(txt);

      setTestResult(parsed);
      localStorage.setItem('gemini_api_key', keyToTest);
      toast.success('Koneksi ke Google Gemini AI Berhasil!');
    } catch (err: any) {
      toast.error('Uji koneksi gagal: ' + (err?.message || 'Kunci API tidak valid'));
    } finally {
      setTesting(false);
    }
  };

  const isConnected = Boolean(apiKey.trim() && apiKey.trim().length > 20);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Pengaturan Kunci API Gemini AI</DialogTitle>
              <DialogDescription className="text-xs">
                Aktifkan perumusan deskripsi kegiatan otomatis menggunakan Google Gemini 2.5 Flash
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status Banner */}
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block">
                {isConnected ? 'Kunci API Siap Digunakan' : 'Kunci API Belum Dikonfigurasi di Browser'}
              </span>
              <span className="text-[11px] opacity-90">
                {isConnected
                  ? 'Setiap perumusan deskripsi di halaman input kegiatan akan menggunakan model resmi Gemini 2.5 Flash secara langsung.'
                  : 'Jika kunci belum dimasukkan, sistem akan menggunakan Bank Kosakata Internal Sekolah Rakyat sebagai cadangan.'}
              </span>
            </div>
          </div>

          {/* Form Input Key */}
          <div className="space-y-2">
            <Label htmlFor="gemini-key" className="text-xs font-semibold flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-normal text-[11px]"
              >
                Dapatkan API Key Gratis
                <ExternalLink className="w-3 h-3" />
              </a>
            </Label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                id="gemini-key"
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pl-9 font-mono text-xs"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Kunci API disimpan secara aman di perangkat Anda.
            </p>
          </div>

          {/* Hasil Tes */}
          {testResult && (
            <div className="p-3 bg-muted rounded-lg border text-xs space-y-1">
              <span className="font-semibold text-primary block">Hasil Uji Coba Gemini AI:</span>
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
              disabled={testing || !apiKey.trim()}
              className="text-xs"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Menguji...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  Uji Koneksi AI
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
                Batal
              </Button>
              <Button type="button" size="sm" onClick={handleSave} className="text-xs font-semibold">
                Simpan Kunci
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
