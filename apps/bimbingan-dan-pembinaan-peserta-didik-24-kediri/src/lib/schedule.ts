// Schedule computation and data for September 2026

export interface StaffMember {
  code: string;
  name: string;
  gender: 'L' | 'P';
  group: number;
}

export type ShiftType = 'M' | 'L' | 'P' | 'S';

export const STAFF: StaffMember[] = [
  { code: "L1", name: "Suhariyono", gender: "L", group: 0 },
  { code: "L2", name: "Hariadi", gender: "L", group: 0 },
  { code: "L3", name: "Moch. Chabib", gender: "L", group: 1 },
  { code: "L4", name: "Aris Mahmud Syafi'i", gender: "L", group: 1 },
  { code: "L5", name: "A. Zainudin Sholeh", gender: "L", group: 2 },
  { code: "L6", name: "Abisarwan Rafif", gender: "L", group: 2 },
  { code: "L7", name: "Dwi Chusnul Mufid", gender: "L", group: 3 },
  { code: "L8", name: "Amirul Mu'minin Rofico P.K.", gender: "L", group: 3 },
  { code: "L9", name: "Nanang Arifin", gender: "L", group: 4 },
  { code: "L10", name: "Muji Santoso", gender: "L", group: 4 },
  { code: "L11", name: "Teguh Cahyono", gender: "L", group: 5 },
  { code: "L12", name: "Eko Wahyudi", gender: "L", group: 5 },
  { code: "L13", name: "Yusak Wasis Pratonggo", gender: "L", group: 6 },
  { code: "L14", name: "Moh Asrofi", gender: "L", group: 6 },
  { code: "L15", name: "Adityo Rizky Winarno", gender: "L", group: 5 },
  { code: "L16", name: "Akhmad Fadkhurriza I", gender: "L", group: 6 },
  { code: "L17", name: "Hiras Nando Rajagukguk", gender: "L", group: 2 },
  { code: "P1", name: "Rindani", gender: "P", group: 0 },
  { code: "P2", name: "Dewi Askinu", gender: "P", group: 0 },
  { code: "P3", name: "Erna Rizkiani", gender: "P", group: 1 },
  { code: "P4", name: "Chusfia Hanik Wihayati", gender: "P", group: 1 },
  { code: "P5", name: "Siti Maslukah", gender: "P", group: 2 },
  { code: "P6", name: "Anita Kurniawati", gender: "P", group: 2 },
  { code: "P7", name: "Herlina Ratu Belia", gender: "P", group: 3 },
  { code: "P8", name: "Deni Furitrinofi", gender: "P", group: 3 },
  { code: "P9", name: "Ambika Widya Asmara", gender: "P", group: 4 },
  { code: "P10", name: "Retnowati", gender: "P", group: 4 },
  { code: "P11", name: "Eky Venty Pricilia", gender: "P", group: 5 },
  { code: "P12", name: "Afida Saidatul Fuadia", gender: "P", group: 5 },
  { code: "P13", name: "Alifia Senja", gender: "P", group: 6 },
  { code: "P14", name: "Theresa Inganta Ginting", gender: "P", group: 3 },
];

const DAY_NAMES: Record<number, string> = {
  0: "Sen", 1: "Sel", 2: "Rab", 3: "Kam", 4: "Jum", 5: "Sab", 6: "Min"
};

const DAY_FULL: Record<number, string> = {
  0: "Senin", 1: "Selasa", 2: "Rabu", 3: "Kamis", 4: "Jumat", 5: "Sabtu", 6: "Minggu"
};

export function getDow(day: number): number {
  return day % 7; // Sep 1 2026 = Tue(1), Sep 7 = Mon(0)
}

export function getDowName(day: number): string {
  return DAY_NAMES[getDow(day)];
}

export function getDowFull(day: number): string {
  return DAY_FULL[getDow(day)];
}

export function isWeekend(day: number): boolean {
  return getDow(day) === 5 || getDow(day) === 6;
}

export function getShift(group: number, day: number): ShiftType {
  const pos = ((day - (group + 1)) % 7 + 7) % 7;
  if (pos === 0) return 'M';
  if (pos === 1) return 'L';
  if (pos === 2) return 'P';
  return 'S';
}

export interface ScheduleRow {
  staff: StaffMember;
  shifts: ShiftType[];
  counts: Record<ShiftType, number>;
}

export interface DaySummary {
  day: number;
  dow: string;
  dowFull: string;
  weekend: boolean;
  P: number; S: number; M: number; L: number;
  pMales: number; pFemales: number;
  mMales: number; mFemales: number;
}

export function computeSchedule(): { rows: ScheduleRow[]; dailySummary: DaySummary[] } {
  const rows: ScheduleRow[] = STAFF.map(s => {
    const shifts: ShiftType[] = [];
    const counts: Record<ShiftType, number> = { P: 0, S: 0, M: 0, L: 0 };
    for (let d = 1; d <= 30; d++) {
      const sh = getShift(s.group, d);
      shifts.push(sh);
      counts[sh]++;
    }
    return { staff: s, shifts, counts };
  });

  const dailySummary: DaySummary[] = [];
  for (let d = 1; d <= 30; d++) {
    const idx = d - 1;
    let pCount = 0, sCount = 0, mCount = 0, lCount = 0;
    let pM = 0, pF = 0, mM = 0, mF = 0;
    for (const r of rows) {
      const sh = r.shifts[idx];
      if (sh === 'P') { pCount++; if (r.staff.gender === 'L') pM++; else pF++; }
      else if (sh === 'S') sCount++;
      else if (sh === 'M') { mCount++; if (r.staff.gender === 'L') mM++; else mF++; }
      else lCount++;
    }
    dailySummary.push({
      day: d, dow: getDowName(d), dowFull: getDowFull(d),
      weekend: isWeekend(d),
      P: pCount, S: sCount, M: mCount, L: lCount,
      pMales: pM, pFemales: pF, mMales: mM, mFemales: mF,
    });
  }

  return { rows, dailySummary };
}

export const SHIFT_LABELS: Record<ShiftType, string> = {
  P: 'Pagi (07:00–15:00)',
  S: 'Sore (15:00–23:00)',
  M: 'Malam (23:00–07:00)',
  L: 'Libur',
};

export const SHIFT_COLORS: Record<ShiftType, { bg: string; text: string }> = {
  P: { bg: 'bg-green-100', text: 'text-green-800' },
  S: { bg: 'bg-orange-100', text: 'text-orange-800' },
  M: { bg: 'bg-violet-100', text: 'text-violet-900' },
  L: { bg: 'bg-red-100', text: 'text-red-800' },
};

// Pre-generated Excel file (base64)
export const EXCEL_BASE64 = "UEsDBBQAAAAIAFEwF11Gx01IlQAAAM0AAAAQAAAAZG9jUHJvcHMvYXBwLnhtbE3PTQvCMAwG4L9SdreZih6kDkQ9ip68zy51hbYpbYT67+0EP255ecgboi6JIia2mEXxLuRtMzLHDUDWI/o+y8qhiqHke64x3YGMsRoPpB8eA8OibdeAhTEMOMzit7Dp1C5GZ3XPlkJ3sjpRJsPiWDQ6sScfq9wcChDneiU+ixNLOZcrBf+LU8sVU57mym/8ZAW/B7oXUEsDBBQAAAAIAFEwF10MyvMB6wAAAMsBAAARAAAAZG9jUHJvcHMvY29yZS54bWylkU1rwzAMhv9K8T2Rk7AwTJpLy04bDFbY2M3Yamsaf2BrJP33S7I23dhuO1rvo0cSblQQykd8jj5gJINpNdjOJaHCmh2JggBI6ohWpnwk3BjufbSSxmc8QJDqJA8IJec1WCSpJUmYhFlYjOyi1GpRho/YzQKtADu06ChBkRdwYwmjTX82zMlCDsksVN/3eV/N3LhRAW9Pjy/z8plxiaRTyNpGK6EiSvKxnS4K56Fr4Fuxucz+KqBejRMEnQOu2TV5rTbb3QNrS17WGb/PymrHa8FLUd29T64f/Teh9drszT+MV0HbwK9/az8BUEsDBBQAAAAIAFEwF12ZXJwjEAYAAJwnAAATAAAAeGwvdGhlbWUvdGhlbWUxLnhtbO1aW3PaOBR+76/QeGf2bQvGNoG2tBNzaXbbtJmE7U4fhRFYjWx5ZJGEf79HNhDLlg3tkk26mzwELOn7zkVH5+g4efPuLmLohoiU8nhg2S/b1ru3L97gVzIkEUEwGaev8MAKpUxetVppAMM4fckTEsPcgosIS3gUy9Zc4FsaLyPW6rTb3VaEaWyhGEdkYH1eLGhA0FRRWm9fILTlHzP4FctUjWWjARNXQSa5iLTy+WzF/NrePmXP6TodMoFuMBtYIH/Ob6fkTlqI4VTCxMBqZz9Wa8fR0kiAgsl9lAW6Sfaj0xUIMg07Op1YznZ89sTtn4zK2nQ0bRrg4/F4OLbL0otwHATgUbuewp30bL+kQQm0o2nQZNj22q6RpqqNU0/T933f65tonAqNW0/Ta3fd046Jxq3QeA2+8U+Hw66JxqvQdOtpJif9rmuk6RZoQkbj63oSFbXlQNMgAFhwdtbM0gOWXin6dZQa2R273UFc8FjuOYkR/sbFBNZp0hmWNEZynZAFDgA3xNFMUHyvQbaK4MKS0lyQ1s8ptVAaCJrIgfVHgiHF3K/99Ze7yaQzep19Os5rlH9pqwGn7bubz5P8c+jkn6eT101CznC8LAnx+yNbYYcnbjsTcjocZ0J8z/b2kaUlMs/v+QrrTjxnH1aWsF3Pz+SejHIju932WH32T0duI9epwLMi15RGJEWfyC265BE4tUkNMhM/CJ2GmGpQHAKkCTGWoYb4tMasEeATfbe+CMjfjYj3q2+aPVehWEnahPgQRhrinHPmc9Fs+welRtH2Vbzco5dYFQGXGN80qjUsxdZ4lcDxrZw8HRMSzZQLBkGGlyQmEqk5fk1IE/4rpdr+nNNA8JQvJPpKkY9psyOndCbN6DMawUavG3WHaNI8ev4F+Zw1ChyRGx0CZxuzRiGEabvwHq8kjpqtwhErQj5iGTYacrUWgbZxqYRgWhLG0XhO0rQR/FmsNZM+YMjszZF1ztaRDhGSXjdCPmLOi5ARvx6GOEqa7aJxWAT9nl7DScHogstm/bh+htUzbCyO90fUF0rkDyanP+kyNAejmlkJvYRWap+qhzQ+qB4yCgXxuR4+5Xp4CjeWxrxQroJ7Af/R2jfCq/iCwDl/Ln3Ppe+59D2h0rc3I31nwdOLW95GblvE+64x2tc0LihjV3LNyMdUr5Mp2DmfwOz9aD6e8e362SSEr5pZLSMWkEuBs0EkuPyLyvAqxAnoZFslCctU02U3ihKeQhtu6VP1SpXX5a+5KLg8W+Tpr6F0PizP+Txf57TNCzNDt3JL6raUvrUmOEr0scxwTh7LDDtnPJIdtnegHTX79l125COlMFOXQ7gaQr4Dbbqd3Do4npiRuQrTUpBvw/npxXga4jnZBLl9mFdt59jR0fvnwVGwo+88lh3HiPKiIe6hhpjPw0OHeXtfmGeVxlA0FG1srCQsRrdguNfxLBTgZGAtoAeDr1EC8lJVYDFbxgMrkKJ8TIxF6HDnl1xf49GS49umZbVuryl3GW0iUjnCaZgTZ6vK3mWxwVUdz1Vb8rC+aj20FU7P/lmtyJ8MEU4WCxJIY5QXpkqi8xlTvucrScRVOL9FM7YSlxi84+bHcU5TuBJ2tg8CMrm7Oal6ZTFnpvLfLQwJLFuIWRLiTV3t1eebnK56Inb6l3fBYPL9cMlHD+U751/0XUOufvbd4/pukztITJx5xREBdEUCI5UcBhYXMuRQ7pKQBhMBzZTJRPACgmSmHICY+gu98gy5KRXOrT45f0Usg4ZOXtIlEhSKsAwFIRdy4+/vk2p3jNf6LIFthFQyZNUXykOJwT0zckPYVCXzrtomC4Xb4lTNuxq+JmBLw3punS0n/9te1D20Fz1G86OZ4B6zh3OberjCRaz/WNYe+TLfOXDbOt4DXuYTLEOkfsF9ioqAEativrqvT/klnDu0e/GBIJv81tuk9t3gDHzUq1qlZCsRP0sHfB+SBmOMW/Q0X48UYq2msa3G2jEMeYBY8wyhZjjfh0WaGjPVi6w5jQpvQdVA5T/b1A1o9g00HJEFXjGZtjaj5E4KPNz+7w2wwsSO4e2LvwFQSwMEFAAAAAgAUTAXXfz/n+cLGgAA6ScBABgAAAB4bC93b3Jrc2hlZXRzL3NoZWV0MS54bWydnWtz2lqWhv+Kyh+m09VzEiPhWyZJ1UJcxF0g7t+UGNs6xpDhctLpmh8/MmZzEtiStp6q7pzErEfa62VrvQib159+rNbPm6f5fGv9+2Wx3Hy+eNpuv3/88GHz7Wn+Em7er77Pl/EjD6v1S7iN/7l+/LD5vp6H93voZfHBvry8/vASRsuLL5/2X/PXXz6tdttFtJz7a2uze3kJ1z9L88Xqx+eLwoX6Qj96fNruv/Dhy6fv4eM8mG+H32Mg/ueH43Huo5f5chOtltZ6/vD5QgofpVUs7pl9zSia/9j88nfrtZ2vq9Xz6z/q958vLi9ej76cW/8Ovi+i+IQx/PPw1+sLa7v63po/bN35YvH5onJzYYXfttFfcz8mPl98XW23q5f9QuNlb8Nt/LWH9eo/8+XbAuaLeVwdr+37vjw+1qFW8+DbsV7PlfLwAX9bw9ua5FWx/z00f/G3OK/9/fp3JUJ1/zzFMn4NN3N3tRhH99unzxe3F9b9/CHcLbb91Q9vftD+an/Ab6vFZv+n9eOtOJbo224Tr+cAx+d9iZZv/w3/rZ6zX4DrBMA+APYpYN8mEM6BcE6JpDUVD0DxDHh/lYBcHZArc+T6gFybIzcH5MYcuT0gt+bI3QG5M0cKl+ppvMwBHZ/7syc/BVLPf+FsA6RAagsUzvdAMqS2QSHHPiiojVDIsRMKaisUcuyFgtoMhRy7oaC2QyHHfiioDVHIsSNstSPsHDvCVjvCzrEj7ONEyLEjbLUj7Bw7wlY7ws6xI2y1I+wcO8JWO8LOsSNstSPsHDvCVjvCzrEjbLUj7Bw7wlE7wsmxIxy1I5wcO8JRO8LJsSOco03k2BGO2hHO2Y5IdCO1H5yz/ZCIqN3gnO2GRETtBedsLyQiaic4bzvhw5uH718BlMNt+OXTevXDWu+BV6d3jqIcvT9+XfTttWL/AmNfGH81Wr6+agu26/jRKD7g9ktDymNpWfH/65YEQ88K+gOrYDWlNPRlUOlYzUq53q9bf1hBxR9U2qVK37Iv7etPH7bxsl6P8eFb/P94Occ12W9reh0BSWuy92uyk9a0e1mET5Y/3+4ew81HyylY7wo3Vit8jv5YxH/8t1Uoxo+u5y/fd+Hyn5b1f5blrxbhR6tt/dfj9n+s1tt//Lf/BPuCIHpe7OKD3VheuI6sd9dWc77+M7T+FXfbir7u1v9Macl5a6lwm9ySs2/JSWjJtz5bfvgYn/fy5uPl5R+Fq/jPt5UH8UPBaj2Pe3z94h+2c3yoHT/UDhfhi/Vu/9U/9vDbY634sf26U5Z9dVzd1X51xYTVdVa/H2TPlNKZ5up+rqHcjDOFL6E1DheRJZvdk4Yvp/ONpoappDMFDVJNR2wNUktHHA3ipSNFDVJPR640SCMdudYgzXTkRoO00pFbDdJOR+40SCfjqbzUMN0MRvf8+xmMbgP0MhjdDuhnMLotEGQwuj0wyGB0m2CYweh2wSiD0W2DcQaj2weTjOtTtw+mGYxuH8wyGN0+kIxpaus2gmSMU1u3EyRjmtq6rSAZI/TUu9+gjBlq6zaDZE1R3W6QjDlq67aDZExSR7cfJGOWDlbbcGH5OjJjpL6RgY7MmKxvZFtHZgzYN7KV4vbXhxcp18kvUq73p7g6OcX+Rene8jMedzMeL2c8Xnl7/DqhxWC+0Fl1OtQPv+rMOh1qhi86u06H4pelOsN+g26SetIur5EOtaOlzrSz1NNBLSJ5m0jeIZJ3ieQ+kbxHJO8TyQMi+YBIPiSSj4jkYyL5hEg+JZLPiOQiRHMpEdHFJapLmcguFaK7ZMxZvfCSMWgTlM+YtAnK1zPsRRpZBc2sglZywW9ee5P9hsDN/ki3+yO9fu/sr9cb0b9+6af0VnGXIEJL93rVfWNe39rX6717CtfRz9VSd0dfzjih7tb6cL6kt490r2SqBybp7R3deWoHJvH9E51dH5ikV0y612d1wDQA0wRMC2jdBlp3gNZd0I8PmB5g+oAJgNYDoPUQaD0C/YwBMwHMFDAzoLUIEFtKQG1xQUtSJlCFQFUC1YjkHpFcDdSrX3yu+LvPiRqg17964fVJkZqYN78UXZ3UqAl5q635zaBvsw369u1gd78czD5x6Nt0w9S9O+S+MXaSQ79+9yG8j3T2nHE2nT3fAnu+BfZ8C+z5FtgzYBqAaQKmBbRuA607QOsu6McHTA8wfcAEQOsB0HoItB6BfsaAmQBmCpgZ0FoEiC0loLa4oCUpE6hCoCqBakRyj0iuBmqqPd+a2POtgT3fGtvzXbY9353dPzsn7nyX7pe6b8O4d+n3z+3Vt6f3lvsUfo10b0GUM06ps+i7/Bukepd/f9Tu8m8P7y7/BVkH/TQA0wRMCzBtoHUHaN0FWvugnx5g+oAJADMAWg+B1iOg9Rj0MwHMFDAzwIgAsaUE1BYXyC1l0hMZplIlUI1AHpFcDdRUi77TWPTNqUXfGVj03blFF/UW/eqRWR79WnN6D32y9tKhJtEzdT/44B6gxLtoWUcbqx0+vezureBn+BD9Q3tHnXVunV+rnnIZtoJyObaCclm2gnJ5NumpQaAmgVoEahPJO0TyLpHcJz31CNQnUECgAZF8SCQfEcnHpKcJgaYEmhFIhGguJSK6uER1KaO+0JiVKqJqiPKQ8sdRm2rnqijdz1VVqqGrIhNHLxg4euHstvvq1NAL6aaq+6FE9wAl3njLe2sWRsvdfbS0gqfVYq794fCsU2v9vED8HEA1BeXZMJ6C8lypdQXluVAbpKcmgVoEahOoQyTvEsl9InmP9NQnUECgAYGGRPIRkXxMJJ+QnqYEmhFIBFElIrq4RHUpE9kFjVlBc1ZqiPIQdRy16X5e0Pj57ZmfF879/PRQx9lp4ue2gZ/b53fo16eGbqe7qu4DA+4BSr5D/xptwvWPcGn149vzB62bZ5xX6+Y2cXMA1RSUz81t4uY2cXPQU5NALQK1CdQhkneJ5D6RvEd66hMoINCAQEMi+YhIPiaST0hPUwLNCCSCqBIRXVyiupSJ7ILGrKA5KzVEeYg6jtp0N7eN3Nw2cXPb3M0NPmRecM7uzm9OzdxJN1XdB/ncA5R4d17+EVnu026z3C2s9u4hutfaecaZtXbuEDsHUI1AnoLyXKh1BeW5ThsKynOZNklPLQK1CdQhUJdI7hPJe0TyPukpINCAQEMCjYjkYyL5hEg+JT3NCCSCqBKiXKK6lInsUiG6C5qzggateIg6jtp0O3eM7NwxsXPH3M6LBnZePL85vz3182K6q+o+Y+8eoOSb85dovbfyf7xEyyi+RV89RN9Wlv+++V7r7Blr0Dp7kTg7gGoE8hSUz9mLxNmLxNlBTy0CtQnUIVCXSO4TyXtE8j7pKSDQgEBDAo2I5GMi+YRIPiU9zQgkgqgSolyiupSJ7FIhuguas4IGrXiIOo7adGcvGjl70cTZi+bOfmXg7FdnN+p3p8Z+lW6quhwc9wAl3qh3wmW4fLRkHT1oP+Vfzjqr1sqviJUDqEYgj0B1BeW5RhsKynOJNhWU5wptkZ7aBOoQqEsgn0jeI5L3ieQB6WlAoCGBRgQaE8knRPIpkXxGehJBVAlRLqLKRHapEN2lSoQXNGgFTVo5jtp0K78ysvIrEyu/MrfyawMrvz6/SX/NofzdzK/TbVUbXOkeqMTb9Pbuz8gKwuV2tdHmuWSdVWvm18TMAVQjkEeguoLymfk1MfNrYuagpzaBOgTqEsgnkveI5H0ieUB6GhBoSKARgcZE8gmRfEokn5GeRBBVQpSLqDKRXSpEd6kS4QUNWkGTVo6jNt3Mr43M/NrEzK/NzdwglK2gSWU7jWUrZOWyaYPZChnJbIP54+7JcsOnpHC2rNNqzRwEHlULIFGoRiCPQHUCNQog8KhZAIFHLSJ5m/TUIVCXQD6BekTyPpE8IJIPSE9DAo0INCbQhEg+JZLPiOQipCkpIcpFVBlRFaK7VInwUkPKo0krx1H7q5mffsDsOFozPqumiW87N3NNfluSmRsEuBU0CW6F0wi3QkaqmvZXPbiFjBS3yvPKGsdevtMnuWWdVOvlIB2pqqB8Xg4gj0B1AjUUlM/LQTpSi0jeJj11CNQlkE+gHpG8TyQPiOQD0tOQQCMCjQk0IZJPieQzIrkIaUpKiHIRVUZUheguVSK81JDyaNLKcdSme7ku6u3cyzVZb+dergl7S/Jyg7S3wnnc2+svVPrdyjPS17S/gcktZES+TXeb8Dk28020sfx1uF0tHx/1N+gg/E2dPM++qSooz7apKSifqQOoTqAGgZoKynOttojkbSJ5h/TUJZBPoB6B+kTygEg+IJIPSU8jAo0JNCHQlEg+I5KLEM2lRLoSF1FlRFUQVSXCSw0p7yHlj6M23dR14XBn+a2qKt3UNfFwCQmutkE8nK2Jhyuc5sPZGRlt2t+R6NoZAXHt1ZMlm/XqQXt/nnVOnZXbIFKpaoNEpZoN4oo8AtUJ1CBQ0wZhSi0ieZtI3iE9dQnkE6hHoD6RPCCSD4jkQ9LTiEBjAk0INCWSz4jkIkRzKZGuxEVUGVEVRFWJ8FJDyntI+eOoTbVyVZRu5aoq1cpVkYmVG+TC2ee5cIXTYDg7I51N+5uLXTsrGe4+2v5cWf3oP88/rXG0DNf6759nnV3r6SDqqKqgXO+5E8gjUJ1ADQXles9dQbnecyeSt0lPHQJ1CeQTqEck7xPJAyL5gPQ0JNCIQGMCTYjkUyL5jEguQpqSEqJcRJURVSG6S5UILzWkPJq0chy16Z6uy4Y7e89dVaV7unk2nG2QDWdrsuFOX22U7IyQtoI2Hc7OSod7fnoJ761qeP/8tFuvo/+EVl1r6iAiTrWV70YdxCTVFJTP1AFUJ1CDQE0F5btRB5K3ieQd0lOXQD6BegTqE8kDIvmASD4kPY0INCbQhEBTIvmMSC5CNJcS6UpcRJURVUFUlQgvNaS8h5Q/jtp0U9dFxJ3fqJtExKkikxt1g4g4+zwi7vTVRsnOSGoraEPi7IyQOC9ahxurEy7v47v18M/wcfcc/0/r6iApTp091+fWCFRTUK7gVwXlCn5VUK7gV9JTk0AtArUJ1CGSd4nkPpG8R3rqEygg0IBAQyL5iEg+JpJPSE9TAs0IJIKoEhFdXKK6lInsgsasoDkrNUR5iDqO2tTPrami9M+tqap0VzdPirOLBq5e1Nyqn0bFHYrspN3laz+4pqgkW+9Hy/twqf82etYJtUZezH8NVBWU5xKoKSjPFeApKN/tOYAaBGoSqEUkbxPJO0TyLunJJ1CPQH0CBUTyAZF8SCQfkZ7GBJoQaEqgGZFchGguJSK6uKQtKSOqgqgqompIeQ8pfxy16UZeNLo9L54b+dnvV1NFJrfnBsFw9nkwXOE0Ge5Qk2yr2o+s2RnRcOX5j8iSzXO03Gm9POukWi8HQUdVG+Qc1WwQc+TZIK+oTqAGgZoEahHJ20TyDpG8S3ryCdQjUJ9AAZF8QCQfEslHpKcxgSYEmhJoRiQXIZpLiYguLmlLyoiqIKqKqBpS3kPKH0dtupfrkuHOvVyTDHfu5ZpkuCQvN0iGszXJcPZpMtyhKNlXtR9aU1Ti58/Xy3D/I3FR0q151mm1dk6y4WyQj1SzQTySZ4N0pDrpqUGgJoFaBGoTyTtE8i6R3Cc99QjUJ1BAoAGRfEgkHxHJx6SnCYGmBJoRSIRoLiUiurhEdSmjvtCYlSqiaojykPLHUZtu57psuPMfh9Nkw53buXk2nG2QDWefZ8PZp9lwh5pkW9V/WC0jG+71V6s9RKHlxWb+bI2jp/BnuNXbetb5tbYOwoGqNsg8qtkg8sizQeJRnfTUIFCTQC0CtYnkHSJ5l0juk556BOoTKCDQgEg+JJKPiORj0tOEQFMCzQgkQjSXEhFdXKK6lFFfaMxKFVE1RHlI+eOoTbd1o5Q4VZVu6+YpcbZBSpytSYmzT1PiDkXJvqr/6FpGSlwQbSOrHW4Wu+fwSWvnWafV2jnIB6oSqKagfD8JB6KS6grK95NwoKcmgVoEahOoQyTvEsl9InmP9NQnUECgAYGGRPIRkXxMJJ+QnqYEmhFIBFElIrq4RHUpE9kFjVlBc1ZqiPIQdRy16XauC4o7/0k4k6A4VWRi5wZBcfZ5UJztnLr5XYat6j+zlhEUJ8toG1rN3XoZhT+S7s+zzqw1dJBeVCVQzQaJR54NAo/qNsg7apCemgRqEahNoA6RvEsk94nkPdJTn0ABgQYEGhLJR0TyMZF8QnqaEmhGIBFElYjo4hLVpUxkFzRmBc1ZqSHKQ9Rx1KYbui4k7tzQTULiVJGBoTsGIXGOJiTOPg2JOxQl+6r2E2uKSvzE2nwdfym0+uF2Z5XmiyjUeXrmuXWe7oAYoyqBagTyHJCXVHdAXFLDAWlJTdJTi0BtAnUI1CWS+0TyHpG8T3oKCDQg0JBAIyL5mEg+IZJPSU8zAokgqoQol6guZSK7VIjuguasoEErHqKOozbV01VRuqerqlRPV0Umnm6QFuecp8XZp2lxh5pkW73VWnpGWlx5voys6m4dbdfRMiH9NfPMWkMHCUFVAtUI5Ckon6GDhKWGgvIZOuipRaA2gToE6hLJfSJ5j0jeJz0FBBoQaEigEZF8TCSfEMmnpKcZgUQQVUKUS1SXMpFdKkR3QXNW0KAVD1HHUZtu6LqouHNDN4mKU0Umhm4QFedoouLs06i4Q1Gyr95pHT0rKu7la/QcWuPo/mdoyeYlXOvv0rNOrjV1kGFUJVCNQB6B6grKc7U2FJTrl6ErKNcvQyc9tQnUIVCXQD6RvEck7xPJA9LTgEBDAo0INCaST4jkUyL5jPQkgqgSolxElYnsUiG6S5UIL2jQCpq0chy16aaui4o7N3WTqDhVZGLqBlFxznlUnH0aFXeoScmUudSaekZWXH++Xa6SvomeeU6tlZN8OALVCOQRqK6gfFYO0qKaCspn5SQfjkAdAnUJ5BPJe0TyPpE8ID0NCDQk0IhAYyL5hEg+JZLPSE8iiCohykVUmcguFaK7VInwggatoEkrx1GbbuVG+XCqKt3KzfPhnKKBlRc19+en+XCHohQv1wbEKSz5d6H/tEbz5fan5a+jb1HSd9GzTq419WL+fVNVUD5TB5BHoDqBGgrKc7E2FZTnWm0Rydukpw6BugTyCdQjkveJ5AGRfEB6GhJoRKAxgSZE8imRfEYkFyFNSQlRLqLKiKoQ3aVKhJcaUh5NWjmO2tQod1WU/sk1VZVu6kVzUzfIinPOs+Ls06w4Jyu2raANi3MywuLkIboPrSCM/9zuFlZ1F94n2DqJjXNA4lLVAXFGNQJ5BKoTqOGAsKWmA7KWWkTyNumpQ6AugXwC9YjkfSJ5QCQfkJ6GBBoRaEygCZF8SiSfEclFSFNSQpSLqDKiKkR3qRLhpYaUR5NWjqM23dZ1sXHntq6JjTu3dU1sXJKtG8TGOZrYOOc0Ns7Jym8rOFpfz8iNk0X0GjQTzJd/6u2cxMY5IHGp6oDApZoD0ow8AtUJ1CBQ0wFZSy0ieZtI3iE9dQnkE6hHoD6RPCCSD4jkQ9LTiEBjAk0INCWSz4jkIkRzKZGuxEVUGVEVRFWJ8FJDyntI+eOoTbdzXWzcWQqsqkq3c01sXEIKrGMQG+ecx8Y5p7FxTlZsW0GbG+dk5MYNnubr+Sa06svHcLkNrVq03EbLR62xk+A4B6QMVQlUI5DngDijugNypBoOiJFqkp5aBGoTqEOgLpHcJ5L3iOR90lNAoAGBhgQaEcnHRPIJkXxKepoRSARRJUS5RHUpE9mlQnQXNGcFDVrxEHUctenfU9cFx51/T10THHdu7ObBcc7d3/59iGxJes4aLwvLl1rdeuf/U2uSmo/fn7x8qepqTpZfM6jxDGrqButpGNQ0Dc7VMjhO2+A4HYOarkGNb7CenkFN3+BcgcFxBgbHGRrUjAxqxgbrmRjUTA3ONTM4jojBgeLpbFDkmhSVTdZkcrGKydUq2sv19EgZ1+tvE6l4eZxIxUPgRJIfvE6koNuvWO8C7UQqGnwuuKotOvnuYs3kSJ626OSd1rpJUcOkqGmyppZJUdtEgo7JkbomC/dNinomRX2TNQUmRQMTCYYmRxqZLHxsUjQxKZqarGlmUiRiooGUjI7lmqxdykZV+sv4tEp/HZ+uy+hCFv2VfJcwr/5+B6R4+Dx90qvD13nVlpa0rXdt/cDK/kRj1aCmpqu5Op1W2TV1g3M1DI7TNDhOy6CmbVDTMVhP16DGNzhXz+A4fYPjBAY1A4OaocF6RgY1Y4NzTQyOMzU4zsygRsSkqGSwongwGRSVTU6nvVjPXkKZHEl7uZ4Waa/XpJdQ9t8j6fBp4KuUkdSql4Z9611LP5JSP2p1GEnZNTWDGk9XczaSsmsaBudqGhynZXCctkFNx6Cma7Ae36CmZ3CuvsFxAoPjDAxqhgY1I4P1jA1qJgbnmhocZ2ZwHBGTopJJkWuwpHgkGRSZXKyivVpPj2RyuYr2ek0aScW/R9LhAxDXCSOpPN+G0cLyw8coHkr/0r/ZpA5yk3AQp/UvW/vTkwZgQfsjF1mgnXBGj4J12mPD4IyO9js1dKktutQ2fTo6dKldCvq0xx59Ovp0qQFd6oA+HUO61BEFx7THCX06pnSpM7pUEfp8xM4DFxvbESXLuM/McZ70nEjmPE9cbeZAT1xt5kTXPCtvZvhh8zSfb8vhNvzy6WW+fpy788ViY31b7Zbb15+c+OWr1nr+8PpNmY/iORfWh/NHipcf9++faB6yY8jWPuLcfdy/P6x5qBBDBf2ZCh/3d0S6h+yP+1cmuoeKH/cbIn7ow9+9fvn0PXyct8P1Y7TcWIv5Q9z35fub+PZk/fbzJG//2K6+x68rLqyvq+129bL/69M8vJ+vXwvixx9Wq+3xH69n+LFaP+/F/fL/UEsDBBQAAAAIAFEwF13vQyyArgQAAP0QAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDIueG1sjZhtd+IoFMe/CscXe7pnJ2PAxKirnmOnTuch7ebUduc1KipjEtyErNNvvxeIiTtNyLxoCYF7+QGX/w1OzyI75gfGJPqRxGk+6x2kPE36/XxzYAnN34sTS6FlJ7KESqhm+35+yhjdaqMk7hPXHfYTytPefKrfRdl8KgoZ85RFGcqLJKHZ6y2LxXnWw73Liye+P0j9oj+fnuierZh8OYEBVPuVny1PWJpzkaKM7Wa9BZ7ckqE20V3+5uycXz0jNZu1EEdV+byd9VwFxWK2kcoHheJf9oHFsXIFKP+UXnv1qMry+vni/qNeAOBb05x9EPE3vpWHWW/UQ1u2o0Usn8T5Eysn5WuHGxHn+j86m87E7aFNkUuRlNYwcMJTU9Ifl9W4shj6LRaktCAG3QylQe+opPNpJs4oU93BnXrQ04XuwAuAPFW7s5IZNHMwlPNweb98vFug1afPH5+nfQk+VUN/A3/gq3JIKodEO8SDFofR/51om1tjQ8ZtNnTP0Y0bTFwXOQj7UP5uYRlULAPD4rX4XTWxDOwsK5ExdKMZgIUMOli8isUzLLjF70MTi2dneaAxTdCNhgAYvUA2GL+C8Q0Madv1JhjfDhPydZFZBh9Wgw+1o4H7kyMd4nqkYfNIOqKvXQaVy8AexYvnl6fFI4qWj18Wd98W4eLRAjqqvI6aQS9ecdMqjTrChx/jIkcBOtCMT9BQl+jIsu8U/YGwqcYdSzmuCMd2QtJEOO44bCKmKD/wnZygB/TbXv6JQlNEplg1FhZc7NZq49qBB03ApVH7mjLJYnpA5jic6Xe+Rl3RiK8UENuZvEYm/GtMmqNkUjJmQ6o1FBM7kt+I1KGiFyStpmueU/MEaaFAStVsaLWk4oEdbdiI1iWqJZoW1wNNX6kBNGIr+ZYe0VrEzMD39UbbhA7Xsos9O2/QyNshvCuW8tT5UkDmn5hVnCEPiYym+3doRdeycB54ut8XVatvWm3MtTpj3848amTu0GdzOoDTKVlQziSnJy05Nq5auHGLcl+GGDdytaj5xUivol6mifqE4QmNEUEhPXInhn+gigRFLGPJqaCpjbPOBjjoEG63ETToDFK1XFoayxNNtxTFFemWpuj0K6R1hsFdKaYxx+COJBPRHPZX08hiT3O05cWJvtIjvFqzLKcJteHV6QW35Jc6VeOWbPImV5M6CRDXnq2jxWrxeK/z9fPL/cKWWkgt46RDxquIavwA7ZDzEDsheYfCgRN6UPhOOIQicMIRFGMnxC6UGDph1QtDN6z6YeiIVU8coJtcxMImWuTqG7pD/1vOQzmXrq9p7ERAGQ2cCBgj34mAMAqcCOYSjZ1IzSWCuURqLhHMJcKeDbvODaQlN9ThQloSwdtwqRWcePZw+bp8Xj6ZgPn6193ShlpLLOmQWLXhuDE3kA6djcozVyvYDey+Vlzr7tcySzpkVm3gz1tSsnVo7YWtih9g8yxs/aubY8Kyvb4j52gjilSau031tryIExdu4q7ezzdNHjR5jU1wfceNDcHkNjDBUQ9vfhZ4oNmepzmK2Q5Q3PcBbEtmrtmmIsVJX4vXQsI1WT8eGN2yTHWA9p0QsqqoEapfPOb/AVBLAwQUAAAACABRMBddDz2TBTkEAADMJwAADQAAAHhsL3N0eWxlcy54bWzdWtuO4jgQ/RWUD9hcDLmsAKlJJ9JKM6ORph/mNRAHLDmXTUwvzNePL4Ek3RSEmfSILAjhuHxOnaqUY8swr9iR4m87jNnkkNKsWmg7xoq/db3a7HAaVX/lBc64JcnLNGL8stzqVVHiKK4EKKW6ZRi2nkYk05bzbJ+GKasmm3yfsYVmaBN9OU/yrOkybU318MFRiievEV1ofkTJuiRqdJQSelT9luzZ5DQvJ4zLwRwvu6ofaoBZXwqtNVdKsryUvbpyc83ZuqZp+Sm3ay7cCOWr68zuS0vuojX60t5i8j4m7N767qLtLfb3ohsyCmSaK88anHblmL7pD05rrmaBZQxOG9gz0xie9oLa3jf8FpE7gLwnCzlBN2rr3gru5kl+VRxJKG0ej5amepbzImIMl1nILxRK9r631e2XY8Efj9syOprWTOuPqHJKYuF06wMB6y3sb7JaLpp5aGjWMHTDuiSHZH0S76FZAxRa4fPQrM+mPw284fPqPz9bQ7P6bmD7H6A1MFaDaw39YBr4MKv84nN4nZcxLs+zGGmnruWc4oQJfEm2O9lgeSGfNTljeSpaMYm2eRapWX6CdeByk7bQ2E5usrqLh7EK/Hq+i7EnRz0hcrDS1BPBh57F94So0TeCS3FM9ulbGuRMnWkIhncb9D7A25gLId4GvQuybvDq2GBKvwme70nzoOdch2SiNsz/xHKvLBaEU5PXVd1UNPWF8NSmU+QtXvSLxAV5zdlqz2PI5PW/+5zhryVOyEFeH5JGAURvNvTWG/qoKOjxiZJtlmIVfm+Py3l0wk12eUl+cG9iNd3wDsx3+q+4ZGTT7vmvjIoXfGCnlVw/JLBoqxGNRiMajVH0FCgP85FFG0Cm71B4bcpAN/KhczJrRE9HI9puRM9GI9ppRNujEf1nMy12BZck31LpNiqd0aTWa0S7oxFttp6h3nhUt3YzpjEa2Q6Qa2skorupHotqZ4yi3dGIbq0o45mJf1b0ry6D7alnjia34JLy0GUMLykPLRvaKT20aGin9NCiTWuUOyU0StVT4Pk81GHY7GP5nWHo9fr8sHVK2TmjPPdOxG9bC+2L+B8AbXGs94QyktVXOxLHOOuQK87lnEVrirsO+KgYJ9GespezcaE17c/y1NU7j/oqAqtHNe1P4oi3/nFeHs9yZySL8QHHfn1Zbtedc331koi3ptZP1e9NIEoZAZMwgr5AGSBK4UBf/8e4XDguZQQVupdNLoxyYZTCXTT58g36AlAefwEhex5Ctg2m1/cvy/DBHNq2+ACEoEKBAX0Jb/dm/koBXCmbG7UB3uWrZQOGfKVEwZCvZF6YgBwKjOcBBQD6EhjwpoAVJUQAvkSpASiExH0GFYLT/IrJ80CTKFKgem0bSpQt3sD9AicRQp4HmIQRkIEQaBIT9ooJlCGEgCZU/1nizXqmn9Y5vfn/3vInUEsDBBQAAAAIAFEwF123R+uKwAAAABYCAAALAAAAX3JlbHMvLnJlbHOdkktuAjEMQK8SZV9MqcQCMazYsEOIC7iJ56OZxJFjxPT2jdjAIGgRS/+eni2vDzSgdhxz26VsxjDEXNlWNa0AsmspYJ5xolgqNUtALaE0kND12BAs5vMlyC3Dbta3THP8SfQKkeu6c7RldwoU9QH4rsOaI0pDWtlxgDNL/83czwrUmp2vrOz8pzXwpszz9SCQokdFcCz0kaRMi3aUrz6e3b6k86VjYrR43+j/89CoFD35v50wpYnS10UJJm+w+QVQSwMEFAAAAAgAUTAXXe4CWANYAQAAgwIAAA8AAAB4bC93b3JrYm9vay54bWyNkd2K2zAQhV9F6AFqx7SBDevA0tA2S2hLU/Z+bI3jIfoxo3HS7tNXssnWsLDslTRnhk/njO6vgc9NCGf1x1kfN1zrXmTYFEVse3QQP4QBfep1gR1IKvlUhK6jFnehHR16KaqyXBeMFoSCjz0NUc+097DiwAgm9oji7IxyQF5v72/OfrIqllUQbPNLWc3KE+E1/h/IpbpQpIYsyd9aT3eLWjny5OgZTa1LrWIfrt8C03PwAvbYcrC21qu58YQs1L6Sj9nmb2jipAg0v3LmWq/LBOyIo0wTEx+SyQum4bkaJXwhK8g7EPzKYRzInyZMilEsckyruJ3Kg8NaP4K5glVHHARdg6yqslpnS2lkb2Z7kriLsLyh1OC9mV9Y0g54Qm9AGfDqQUYGv0BVb6Cq2ezNocGOPJrvCRpzI+2rTZ+Vj8lU9fHT6i7tZbT2c9J++EMA8xL59l/bf1BLAwQUAAAACABRMBddq15yLrQAAACNAgAAGgAAAHhsL19yZWxzL3dvcmtib29rLnhtbC5yZWxzxZJNCoMwEEavEnIAR23poqirbtwWLxB0/MHEhMyU6u0rulChi26kq/BNyPseTJInasWdHajtHInR6IFS2TK7OwCVLRpFgXU4zDe19UbxHH0DTpW9ahDiMLyB3zNkluyZopgc/kK0dd2V+LDly+DAX8Dwtr6nFpGlKJRvkFMJo97GBMsRBTNZirxKpc+rSAr4t1F8MIrPNCKeNNKms+ZD/+XMfp7f4la/xHV4XMt1kYDD78s+UEsDBBQAAAAIAFEwF12l4RtYHwEAAGAEAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbMVUy07DMBD8lcjXKnbpgQNqeqFcoQd+wCSbxopf8m5L+vdsEloJVFqqIHGJFe/szHjH8vL1EAGzzlmPhWiI4oNSWDbgNMoQwXOlDslp4t+0VVGXrd6CWszn96oMnsBTTj2HWC3XUOudpeyp4200wRcigUWRPY7AXqsQOkZrSk1cV3tffVPJPxUkdw4YbEzEGQNEps5KDKUfFY6NL3tIyVSQbXSiZ+0YpjqrkA4WUF7mOOMy1LUpoQrlznGLxJhAV9gAkLNyJJ1dkSYeMozfu8kGBpqLigzdpBCRU0twu94xlr47j0wEicyVQ54kmXvyCaFPvILqt+I84feQ2iETVMMyfcxfcz7x32pk8Z9G3kJo//rC96t02viTATU8LKsPUEsBAhQDFAAAAAgAUTAXXUbHTUiVAAAAzQAAABAAAAAAAAAAAAAAAIABAAAAAGRvY1Byb3BzL2FwcC54bWxQSwECFAMUAAAACABRMBddDMrzAesAAADLAQAAEQAAAAAAAAAAAAAAgAHDAAAAZG9jUHJvcHMvY29yZS54bWxQSwECFAMUAAAACABRMBddmVycIxAGAACcJwAAEwAAAAAAAAAAAAAAgAHdAQAAeGwvdGhlbWUvdGhlbWUxLnhtbFBLAQIUAxQAAAAIAFEwF138/5/nCxoAAOknAQAYAAAAAAAAAAAAAACAgR4IAAB4bC93b3Jrc2hlZXRzL3NoZWV0MS54bWxQSwECFAMUAAAACABRMBdd70MsgK4EAAD9EAAAGAAAAAAAAAAAAAAAgIFfIgAAeGwvd29ya3NoZWV0cy9zaGVldDIueG1sUEsBAhQDFAAAAAgAUTAXXQ89kwU5BAAAzCcAAA0AAAAAAAAAAAAAAIABQycAAHhsL3N0eWxlcy54bWxQSwECFAMUAAAACABRMBddt0frisAAAAAWAgAACwAAAAAAAAAAAAAAgAGnKwAAX3JlbHMvLnJlbHNQSwECFAMUAAAACABRMBdd7gJYA1gBAACDAgAADwAAAAAAAAAAAAAAgAGQLAAAeGwvd29ya2Jvb2sueG1sUEsBAhQDFAAAAAgAUTAXXateci60AAAAjQIAABoAAAAAAAAAAAAAAIABFS4AAHhsL19yZWxzL3dvcmtib29rLnhtbC5yZWxzUEsBAhQDFAAAAAgAUTAXXaXhG1gfAQAAYAQAABMAAAAAAAAAAAAAAIABAS8AAFtDb250ZW50X1R5cGVzXS54bWxQSwUGAAAAAAoACgCEAgAAUTAAAAAA";
