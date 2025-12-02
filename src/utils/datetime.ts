export function brDateTimeToISO(date: string, time: string): string {
  // date: dd/mm/aaaa, time: hh:mm
  const [d, m, y] = date.split('/');
  const [hh, mm] = time.split(':');
  if (!d || !m || !y || !hh || !mm) return '';
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T${hh.padStart(2,'0')}:${mm.padStart(2,'0')}:00`;
}

export function brDateToISO(date: string): string {
  const [d, m, y] = date.split('/');
  if (!d || !m || !y) return '';
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}

export function isoDateToBR(iso: string): string {
  // Expect 'YYYY-MM-DD' (date without timezone). Avoid JS Date to prevent timezone shifts.
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`;
}

