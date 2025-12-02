import { ChangeEvent } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function formatTime(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  const parts = [digits.slice(0, 2), digits.slice(2, 4)].filter(Boolean);
  return parts.join(":");
}

export default function BRTimeInput({ value, onChange, placeholder = "hh:mm" }: Props) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const f = formatTime(e.target.value);
    onChange(f);
  };
  return (
    <input
      type="text"
      value={value}
      onChange={handle}
      inputMode="numeric"
      maxLength={5}
      placeholder={placeholder}
      pattern="^\\d{2}:\\d{2}$"
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required
    />
  );
}

