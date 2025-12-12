import { ChangeEvent } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}

function formatBR(v: string) {
  const cleaned = v.replace(/[^\d/]/g, "");
  const segments = cleaned.split("/").slice(0, 3);
  const d = (segments[0] ?? "").slice(0, 2);
  const m = (segments[1] ?? "").slice(0, 2);
  const y = (segments[2] ?? "").slice(0, 4);
  let result = d;
  if (segments.length > 1) result += "/" + m;
  if (segments.length > 2) result += "/" + y;
  return result;
}

function isValidBRDate(v: string) {
  if (!/^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})$/.test(v)) return false;
  const [dStr, mStr, yStr] = v.split('/');
  const d = Number(dStr);
  const m = Number(mStr);
  const y = yStr.length === 2 ? 2000 + Number(yStr) : Number(yStr);
  if (m < 1 || m > 12) return false;
  const daysInMonth = new Date(y, m, 0).getDate();
  return d >= 1 && d <= daysInMonth && y >= 1900 && y <= 9999;
}

export default function BRDateInput({ value, onChange, placeholder = "dd/mm/aaaa", required = true }: Props) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const f = formatBR(e.target.value);
    onChange(f);
  };
  const handleInvalid = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    el.setCustomValidity('Informe a data no formato dd/mm/aaaa');
  };
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    if (!required && !el.value) {
      el.setCustomValidity('');
      return;
    }
    if (isValidBRDate(el.value)) {
      const [d, m, y] = el.value.split('/');
      const yFull = y.length === 2 ? `20${y}` : y;
      const normalized = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${yFull}`;
      if (normalized !== el.value) onChange(normalized);
      el.setCustomValidity('');
    } else {
      el.setCustomValidity('Informe a data no formato dd/mm/aaaa');
    }
  };
  return (
    <input
      type="text"
      value={value}
      onChange={handle}
      onInvalid={handleInvalid}
      onBlur={handleBlur}
      inputMode="text"
      maxLength={10}
      placeholder={placeholder}
      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required={required}
    />
  );
}

