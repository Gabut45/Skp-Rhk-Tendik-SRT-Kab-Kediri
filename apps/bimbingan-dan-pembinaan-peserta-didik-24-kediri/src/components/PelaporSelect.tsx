import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Label } from '@project/components/ui/label';
import { PELAPOR_LIST } from '@/lib/pelapor-data';

interface PelaporSelectProps {
  value: string;
  onChange: (nama: string, nip: string) => void;
  label?: string;
  className?: string;
}

export default function PelaporSelect({ value, onChange, label = 'Nama Pelapor', className }: PelaporSelectProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {label && <Label>{label}</Label>}
      <Select
        value={value}
        onValueChange={(nama) => {
          const p = PELAPOR_LIST.find(x => x.nama === nama);
          if (p) onChange(p.nama, p.nip);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Pilih pelapor..." />
        </SelectTrigger>
        <SelectContent>
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
