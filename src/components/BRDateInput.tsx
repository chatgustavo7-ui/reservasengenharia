import { ChangeEvent } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}

function formatBR(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join("/");
}

function isValidBRDate(v: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return false;
  const [d, m, y] = v.split('/').map(Number);
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
      inputMode="numeric"
      maxLength={10}
      placeholder={placeholder}
      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required={required}
    />
  );
}

