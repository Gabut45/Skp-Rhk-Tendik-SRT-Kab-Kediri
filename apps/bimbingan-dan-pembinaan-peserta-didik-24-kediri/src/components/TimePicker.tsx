import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Label } from '@project/components/ui/label';

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

export default function TimePicker({ label, value, onChange }: TimePickerProps) {
  const [h, m] = value ? value.split(':') : ['', ''];

  const setHour = (newH: string) => {
    onChange(`${newH}:${m || '00'}`);
  };
  const setMinute = (newM: string) => {
    onChange(`${h || '00'}:${newM}`);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Select value={h || undefined} onValueChange={setHour}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Jam" />
          </SelectTrigger>
          <SelectContent>
            {hours.map(hr => (
              <SelectItem key={hr} value={hr}>{hr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="flex items-center font-bold text-muted-foreground">:</span>
        <Select value={m || undefined} onValueChange={setMinute}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Mnt" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map(mn => (
              <SelectItem key={mn} value={mn}>{mn}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
