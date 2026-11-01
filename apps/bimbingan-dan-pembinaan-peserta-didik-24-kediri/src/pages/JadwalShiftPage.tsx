import { useMemo, useState } from 'react';
import { computeSchedule, SHIFT_LABELS, EXCEL_BASE64, type ShiftType, type ScheduleRow, type DaySummary } from '@/lib/schedule';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@project/components/ui/card';
import { Input } from '@project/components/ui/input';
import { toast } from 'sonner';
import { Download, Calendar, Users, Moon, Sun, Sunset, Coffee, Info, Search, Filter } from 'lucide-react';

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
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="schedule-grid w-full border-collapse text-xs">
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
              <td className="sticky left-0 z-10 bg-inherit text-[10px] font-mono text-center">{i + 1}</td>
              <td className={`sticky left-8 z-10 text-[10px] font-bold text-center ${r.staff.gender === 'L' ? 'bg-blue-50 text-blue-800' : 'bg-pink-50 text-pink-800'}`}>
                {r.staff.code}
              </td>
              <td className="sticky left-[72px] z-10 bg-inherit text-left text-[10px] truncate max-w-[160px] pl-2 font-medium" title={r.staff.name}>
                {r.staff.name}
              </td>
              <td className={`text-[10px] font-bold text-center ${r.staff.gender === 'L' ? 'text-blue-700' : 'text-pink-700'}`}>
                {r.staff.gender}
              </td>
              {r.shifts.map((sh, di) => {
                const colors: Record<ShiftType, string> = {
                  P: 'bg-green-100 text-green-800 font-bold',
                  S: 'bg-orange-100 text-orange-800 font-bold',
                  M: 'bg-purple-100 text-purple-900 font-bold',
                  L: 'bg-red-100 text-red-800 font-bold',
                };
                return (
                  <td key={di} className={`text-center py-1 text-[11px] ${colors[sh]}`}>
                    {sh}
                  </td>
                );
              })}
              <td className="text-center font-bold bg-green-50 text-green-800 text-[10px]">{r.counts.P}</td>
              <td className="text-center font-bold bg-orange-50 text-orange-800 text-[10px]">{r.counts.S}</td>
              <td className="text-center font-bold bg-purple-50 text-purple-900 text-[10px]">{r.counts.M}</td>
              <td className="text-center font-bold bg-red-50 text-red-800 text-[10px]">{r.counts.L}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/50"><td colSpan={38} className="h-1"></td></tr>
          {(['P', 'S', 'M', 'L'] as ShiftType[]).map(key => {
            const rowStyles: Record<ShiftType, string> = {
              P: 'bg-green-100/70 text-green-900',
              S: 'bg-orange-100/70 text-orange-900',
              M: 'bg-purple-100/70 text-purple-950',
              L: 'bg-red-100/70 text-red-900',
            };
            return (
              <tr key={key} className={rowStyles[key]}>
                <td colSpan={4} className="text-[10px] font-bold text-left pl-3 py-1">
                  Jml {key === 'P' ? 'PAGI' : key === 'S' ? 'SORE' : key === 'M' ? 'MALAM' : 'LIBUR'}
                </td>
                {dailySummary.map(d => (
                  <td key={d.day} className="text-[10px] font-bold text-center py-1">{d[key]}</td>
                ))}
                <td colSpan={4}></td>
              </tr>
            );
          })}
          <tr className="bg-green-50 text-green-950">
            <td colSpan={4} className="text-[9px] font-semibold text-left pl-3 py-1">Detail Pagi</td>
            {dailySummary.map(d => (
              <td key={d.day} className="text-[8px] text-center font-mono">{d.pMales}L+{d.pFemales}P</td>
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

export default function JadwalShiftPage() {
  const { rows, dailySummary } = useMemo(() => computeSchedule(), []);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL');

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const matchSearch = r.staff.name.toLowerCase().includes(search.toLowerCase()) ||
                          r.staff.code.toLowerCase().includes(search.toLowerCase());
      const matchGender = genderFilter === 'ALL' || r.staff.gender === genderFilter;
      return matchSearch && matchGender;
    });
  }, [rows, search, genderFilter]);

  return (
    <div className="space-y-6">
      {/* Title & Download */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card border rounded-xl p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">
              Jadwal Shift Wali Asuh SRT 1 Kab. Kediri
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            September 2026 · 31 Petugas (17 Laki-laki, 14 Perempuan) · Rotasi Siklus 7 Hari (6 Kerja + 1 Libur)
          </p>
        </div>
        <Button onClick={downloadExcel} className="gap-2 shrink-0">
          <Download className="w-4 h-4" />
          Download Excel (.xlsx)
        </Button>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <Legend />
        </CardContent>
      </Card>

      {/* Stats */}
      <StatsCards dailySummary={dailySummary} />

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau kode petugas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground">Filter Gender:</span>
          <div className="flex rounded-md border p-1 bg-muted/40">
            <button
              onClick={() => setGenderFilter('ALL')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                genderFilter === 'ALL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semua ({rows.length})
            </button>
            <button
              onClick={() => setGenderFilter('L')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                genderFilter === 'L' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Laki-laki (17)
            </button>
            <button
              onClick={() => setGenderFilter('P')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                genderFilter === 'P' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Perempuan (14)
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Matriks Jadwal Shift September 2026
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Pola: M → L → P → S
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-2">
          <ScheduleTable rows={filteredRows} dailySummary={dailySummary} />
        </CardContent>
      </Card>

      {/* Rules Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4" />
            Ketentuan & Aturan Penjadwalan Wali Asuh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Pola Rotasi Shift</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Siklus 7 hari: 6 hari bertugas + 1 hari libur</li>
                <li>• Setelah shift <strong>Malam (M)</strong> wajib langsung <strong>Libur (L)</strong></li>
                <li>• Setelah <strong>Libur (L)</strong> wajib mulai dari shift <strong>Pagi (P)</strong></li>
                <li>• Setelah shift <strong>Pagi (P)</strong> bertransisi ke shift <strong>Sore (S)</strong></li>
                <li>• Rotasi adil dan seimbang untuk seluruh wali asuh</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Distribusi Petugas per Shift</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Shift Pagi (P)</strong> (07:00 – 15:00): Pendampingan aktivitas sekolah, ibadah & pembiasaan</li>
                <li>• <strong>Shift Sore (S)</strong> (15:00 – 23:00): Penyambutan, makan malam, sholat berjamaah & belajar mandiri</li>
                <li>• <strong>Shift Malam (M)</strong> (23:00 – 07:00): Penjagaan asrama malam, apel malam & pembiasaan subuh</li>
                <li>• Proporsi wali asuh laki-laki (L) dan perempuan (P) terjaga setiap hari</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
