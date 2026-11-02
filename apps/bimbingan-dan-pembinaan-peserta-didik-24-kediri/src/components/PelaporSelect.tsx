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
          const p = PELAPOR_LIST.find(x => x.nama === nama);
          if (p) onChange(p.nama, p.nip);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Pilih pelapor..." />
        </SelectTrigger>
        <SelectContent>
          {allowAll && (
            <SelectItem value="Semua Pelapor" className="font-semibold text-primary">
              Semua Pelapor (Seluruh Wali Asuh)
            </SelectItem>
          )}
          {PELAPOR_LIST.map(p => (
            <SelectItem key={p.nip} value={p.nama}>
              {p.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
