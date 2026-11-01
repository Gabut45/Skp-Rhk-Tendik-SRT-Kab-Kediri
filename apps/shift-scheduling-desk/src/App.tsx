import { useMemo, useState } from 'react';
import { useAuth } from 'zitejs/auth';
import { computeSchedule, SHIFT_LABELS, EXCEL_BASE64, type ShiftType, type ScheduleRow, type DaySummary } from './lib/schedule';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Toaster } from '@project/components/ui/sonner';
import { toast } from 'sonner';
import { Download, Calendar, Users, Moon, Sun, Sunset, Coffee, Info } from 'lucide-react';

function ShiftBadge({ shift }: { shift: ShiftType }) {
  const cls: Record<ShiftType, string> = {
    P: 'bg-green-100 text-green-800 border-green-300',
    S: 'bg-orange-100 text-orange-700 border-orange-300',
    M: 'bg-violet-100 text-violet-900 border-violet-300',
    L: 'bg-red-100 text-red-700 border-red-300',
  };
  return (
    <span className={`inline-flex items-center justify-center w-7 h-6 rounded text-[11px] font-bold border ${cls[shift]}`}>
      {shift}
    </span>
  );
}

function StatsCards({ dailySummary }: { dailySummary: DaySummary[] }) {
  const totalP = dailySummary.reduce((s, d) => s + d.P, 0);
  const totalS = dailySummary.reduce((s, d) => s + d.S, 0);
  const totalM = dailySummary.reduce((s, d) => s + d.M, 0);
  const totalL = dailySummary.reduce((s, d) => s + d.L, 0);

  const cards = [
    { label: 'Pagi', icon: Sun, value: totalP, avg: (totalP / 30).toFixed(1), color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    { label: 'Sore', icon: Sunset, value: totalS, avg: (totalS / 30).toFixed(1), color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Malam', icon: Moon, value: totalM, avg: (totalM / 30).toFixed(1), color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
    { label: 'Libur', icon: Coffee, value: totalL, avg: (totalL / 30).toFixed(1), color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label} className={`rounded-lg border p-4 ${c.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            <c.icon className={`w-4 h-4 ${c.color}`} />
            <span className={`text-sm font-semibold ${c.color}`}>{c.label}</span>
          </div>
          <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
          <div className="text-xs text-muted-foreground">Rata-rata {c.avg}/hari</div>
        </div>
      ))}
    </div>
  );
}

function ScheduleTable({ rows, dailySummary }: { rows: ScheduleRow[]; dailySummary: DaySummary[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="schedule-grid w-full border-collapse">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            <th className="sticky left-0 z-20 bg-primary px-2 py-2 text-[10px] w-8">No</th>
            <th className="sticky left-8 z-20 bg-primary px-2 py-2 text-[10px] w-14">Kode</th>
            <th className="sticky left-[72px] z-20 bg-primary px-2 py-2 text-left text-[10px] min-w-[160px]">Nama Wali Asuh</th>
            <th className="px-1 py-2 text-[10px] w-6">JK</th>
            {dailySummary.map(d => (
              <th key={d.day} className={`px-1 py-2 text-[10px] w-7 ${d.weekend ? 'bg-amber-600' : ''}`}>
                {d.day}
              </th>
            ))}
            <th className="px-1 py-2 text-[10px] bg-green-700 w-8">ΣP</th>
            <th className="px-1 py-2 text-[10px] bg-orange-700 w-8">ΣS</th>
            <th className="px-1 py-2 text-[10px] bg-violet-800 w-8">ΣM</th>
            <th className="px-1 py-2 text-[10px] bg-red-700 w-8">ΣL</th>
          </tr>
          <tr className="bg-primary/80 text-primary-foreground">
            <th className="sticky left-0 z-20 bg-primary/80" colSpan={4}></th>
            {dailySummary.map(d => (
              <th key={d.day} className={`text-[9px] py-1 font-normal ${d.weekend ? 'bg-amber-500 text-white font-bold' : ''}`}>
                {d.dow}
              </th>
            ))}
            <th colSpan={4}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.staff.code} className={i % 2 === 0 ? 'bg-muted/30' : 'bg-background'}>
              <td className="sticky left-0 z-10 bg-inherit text-[10px] font-mono">{i + 1}</td>
              <td className={`sticky left-8 z-10 text-[10px] font-bold ${r.staff.gender === 'L' ? 'bg-blue-50 text-blue-800' : 'bg-pink-50 text-pink-800'}`}>
                {r.staff.code}
              </td>
              <td className="sticky left-[72px] z-10 bg-inherit text-left text-[10px] truncate max-w-[160px]" title={r.staff.name}>
                {r.staff.name}
              </td>
              <td className={`text-[10px] font-bold ${r.staff.gender === 'L' ? 'text-blue-700' : 'text-pink-700'}`}>
                {r.staff.gender}
              </td>
              {r.shifts.map((sh, di) => (
                <td key={di} className={`shift-${sh}`}>{sh}</td>
              ))}
              <td className="shift-P text-[10px]">{r.counts.P}</td>
              <td className="shift-S text-[10px]">{r.counts.S}</td>
              <td className="shift-M text-[10px]">{r.counts.M}</td>
              <td className="shift-L text-[10px]">{r.counts.L}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/50"><td colSpan={38} className="h-1"></td></tr>
          {(['P', 'S', 'M', 'L'] as ShiftType[]).map(key => (
            <tr key={key} className={`shift-${key}`}>
              <td colSpan={4} className="text-[10px] font-bold text-left pl-2">
                Jml {key === 'P' ? 'PAGI' : key === 'S' ? 'SORE' : key === 'M' ? 'MALAM' : 'LIBUR'}
              </td>
              {dailySummary.map(d => (
                <td key={d.day} className="text-[10px] font-bold">{d[key]}</td>
              ))}
              <td colSpan={4}></td>
            </tr>
          ))}
          <tr className="shift-P">
            <td colSpan={4} className="text-[9px] font-semibold text-left pl-2">Detail Pagi</td>
            {dailySummary.map(d => (
              <td key={d.day} className="text-[8px]">{d.pMales}L+{d.pFemales}P</td>
            ))}
            <td colSpan={4}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Legend() {
  const items: { key: ShiftType; icon: typeof Sun; label: string; time: string }[] = [
    { key: 'P', icon: Sun, label: 'Pagi', time: '07:00 – 15:00' },
    { key: 'S', icon: Sunset, label: 'Sore', time: '15:00 – 23:00' },
    { key: 'M', icon: Moon, label: 'Malam', time: '23:00 – 07:00' },
    { key: 'L', icon: Coffee, label: 'Libur', time: 'Hari Libur' },
  ];
  return (
    <div className="flex flex-wrap gap-4">
      {items.map(it => (
        <div key={it.key} className="flex items-center gap-2">
          <ShiftBadge shift={it.key} />
          <div>
            <span className="text-sm font-medium">{it.label}</span>
            <span className="text-xs text-muted-foreground ml-1">({it.time})</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function downloadExcel() {
  const byteChars = atob(EXCEL_BASE64);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
  const blob = new Blob([new Uint8Array(byteNums)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Jadwal_Wali_Asuh_SRT1_Kediri_September_2026.xlsx';
  a.click();
  URL.revokeObjectURL(url);
  toast.success('File Excel berhasil diunduh!');
}

export default function App() {
  const { user, isLoading } = useAuth();
  const { rows, dailySummary } = useMemo(() => computeSchedule(), []);

  if (isLoading || !user) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Calendar className="w-7 h-7" />
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  Jadwal Wali Asuh SRT 1 Kab. Kediri
                </h1>
              </div>
              <p className="text-primary-foreground/80 text-sm">
                September 2026 · 31 Petugas (17 Laki-laki, 14 Perempuan) · Siklus 7 Hari
              </p>
            </div>
            <Button onClick={downloadExcel} variant="secondary" className="gap-2 shrink-0">
              <Download className="w-4 h-4" />
              Download Excel
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Legend */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <Legend />
          </CardContent>
        </Card>

        {/* Stats */}
        <StatsCards dailySummary={dailySummary} />

        {/* Schedule Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Jadwal Shift September 2026
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Pola: M → L → P → S
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-2">
            <ScheduleTable rows={rows} dailySummary={dailySummary} />
          </CardContent>
        </Card>

        {/* Rules Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4" />
              Aturan Penjadwalan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Pola Shift</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Siklus 7 hari: 6 kerja + 1 libur</li>
                  <li>• Setelah <strong>Malam</strong> wajib <strong>Libur</strong></li>
                  <li>• Setelah <strong>Libur</strong> wajib <strong>Pagi</strong></li>
                  <li>• Setelah <strong>Pagi</strong> boleh Pagi atau Sore</li>
                  <li>• Setelah <strong>Sore</strong> hanya boleh Sore</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Distribusi Harian</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Sen–Jum Pagi: 4–5 orang</li>
                  <li>• Sab–Min Pagi: 5 orang</li>
                  <li>• Malam: 4–5 orang setiap hari</li>
                  <li>• Jum Pagi: min. 2 Laki-laki + 2 Perempuan</li>
                  <li>• Setiap shift wajib ada L dan P</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
