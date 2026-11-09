import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Label } from '@project/components/ui/label';
import { PELAPOR_LIST } from '@/lib/pelapor-data';

interface PelaporSelectProps {
  value: string;
  onChange: (nama: string, nip: string) => void;
  label?: string;
  className?: string;
  allowAll?: boolean;
}

export default function PelaporSelect({ value, onChange, label = 'Nama Pelapor', className, allowAll }: PelaporSelectProps) {
  // Deduplikasi daftar pelapor berdasarkan nama
  const uniquePelapor = useMemo(() => {
    const seen = new Set<string>();
    const list: typeof PELAPOR_LIST = [];
    for (const p of PELAPOR_LIST) {
      if (!p || !p.nama) continue;
      const key = p.nama.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(p);
      }
    }
    return list;
  }, [PELAPOR_LIST.length]);

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {label && <Label>{label}</Label>}
      <Select
        value={value}
        onValueChange={(nama) => {
          if (nama === 'Semua Pelapor') {
            onChange('Semua Pelapor', '');
            return;
          }
          const p = uniquePelapor.find(x => x.nama === nama) || PELAPOR_LIST.find(x => x.nama === nama);
          if (p) onChange(p.nama, p.nip);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Pilih pelapor..." />
        </SelectTrigger>
        <SelectContent>
          {allowAll && (
            <SelectItem key="semua_pelapor" value="Semua Pelapor" className="font-semibold text-primary">
              Semua Pelapor (Seluruh Wali Asuh)
            </SelectItem>
          )}
          {uniquePelapor.map((p, idx) => (
            <SelectItem key={`pelapor_${p.nama}_${idx}`} value={p.nama}>
              {p.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

