import React, { useState, useEffect } from 'react';
import { School, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export default function SplashScreen({ onFinish, durationMs = 2200 }: SplashScreenProps) {
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('Menginisialisasi sistem pelaporan...');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const steps = [
      { pct: 35, text: 'Memuat modul bimbingan & pembinaan...', delay: 350 },
      { pct: 68, text: 'Menghubungkan basis data kinerja...', delay: 850 },
      { pct: 90, text: 'Menyiapkan keamanan sesi pengguna...', delay: 1400 },
      { pct: 100, text: 'Sistem siap digunakan.', delay: 1850 },
    ];

    const timers: NodeJS.Timeout[] = [];

    steps.forEach(step => {
      const timer = setTimeout(() => {
        setProgress(step.pct);
        setStatusText(step.text);
      }, step.delay);
      timers.push(timer);
    });

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, durationMs - 350);
    timers.push(fadeTimer);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, durationMs);
    timers.push(finishTimer);

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white transition-opacity duration-500 ease-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Header Badge */}
      <div className="pt-6 flex items-center gap-2 text-xs tracking-wider uppercase text-indigo-300/80 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Pemerintah Kabupaten Kediri &bull; Sekolah Rakyat Terintegrasi Kab Kediri</span>
      </div>

      {/* Main Center Brand Identity */}
      <div className="flex flex-col items-center text-center max-w-md px-4 space-y-6">
        {/* Animated Institutional Emblem */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-24 h-24 rounded-3xl bg-slate-900/90 border border-indigo-400/40 p-4 shadow-2xl flex items-center justify-center backdrop-blur-md">
            <School className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_12px_rgba(129,140,248,0.5)]" />
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full p-1.5 shadow-md border border-slate-900">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
            </div>
          </div>
        </div>

        {/* Institutional Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[11px] font-semibold text-indigo-300">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            <span>PORTAL RESMI PELAPORAN KINERJA</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            SR TERINTEGRASI 1 KEDIRI
          </h1>

          <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed font-light">
            Sistem Informasi Bimbingan, Pengasuhan, & Pelaporan Kinerja Harian Wali Asuh
          </p>
        </div>

        {/* Elegant Progress Indicator */}
        <div className="w-full max-w-xs space-y-2.5 pt-4">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-400 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
            <span className="truncate max-w-[200px] flex items-center gap-1.5 text-slate-300">
              {progress === 100 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              )}
              {statusText}
            </span>
            <span className="font-mono text-indigo-300 font-semibold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pb-6 text-center space-y-1">
        <p className="text-[11px] text-slate-400">
          Sekolah Rakyat Terintegrasi 1 Kabupaten Kediri
        </p>
        <p className="text-[10px] text-slate-500 font-mono">
          E-Kinerja & Bimbingan V2.4 &bull; Terproteksi & Terenkripsi
        </p>
      </div>
    </div>
  );
}
