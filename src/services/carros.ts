import { supabase } from "@/lib/supabase";

export interface Carro {
  id: number;
  placa: string;
  modelo: string;
  ano: number;
  km_atual: number;
  tanque: number;
  ultima_revisao: string | null; // ISO date string (YYYY-MM-DD) or null
  ultima_reserva?: string | null;
  ultimo_uso?: string | null;
  km_ultima_revisao?: number | null;
}

export async function listCarros(): Promise<Carro[]> {
  const { data, error } = await supabase
    .from('carros')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return (data || []) as Carro[];
}

export async function updateCarro(id: number, changes: Partial<Carro>): Promise<void> {
  const { error } = await supabase
    .from('carros')
    .update(changes)
    .eq('id', id);
  if (error) throw error;
}

export async function confirmarRevisao(id: number): Promise<void> {
  const { data, error } = await supabase
    .from('carros')
    .select('km_atual')
    .eq('id', id)
    .single();
  if (error) throw error;
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const dd = String(hoje.getDate()).padStart(2, '0');
  const isoDate = `${yyyy}-${mm}-${dd}`;
  await updateCarro(id, { ultima_revisao: isoDate, km_ultima_revisao: data.km_atual });
}

export async function getAvailableCar(idaISO: string, voltaISO: string): Promise<Carro | null> {
  const { data: reservas, error: rErr } = await supabase
    .from('reservas')
    .select('carro_id, ida, volta, status');
  if (rErr) throw rErr;
  const overlapping = (reservas || [])
    .filter(r => {
      const blocks = r.status === 'pendente' || r.status === 'em_viagem';
      const overlaps = !(new Date(r.volta) < new Date(idaISO) || new Date(r.ida) > new Date(voltaISO));
      return r.carro_id && blocks && overlaps;
    })
    .map(r => r.carro_id as number);
  const all = await listCarros();
  const free = all.filter(c => !overlapping.includes(c.id));
  if (free.length === 0) return null;
  // Ordenar pelo tempo desde a última viagem (volta) usando reservas
  const lastMap = await getLastTripByCar();
  free.sort((a, b) => {
    const da = lastMap[a.id] ? new Date(lastMap[a.id]).getTime() : 0;
    const db = lastMap[b.id] ? new Date(lastMap[b.id]).getTime() : 0;
    return da - db; // menor timestamp = há mais tempo sem usar
  });
  return free[0];
}

export async function getLastTripByCar(): Promise<Record<number, string>> {
  const { data, error } = await supabase
    .from('reservas')
    .select('carro_id, volta, status')
    .not('carro_id', 'is', null)
    .order('volta', { ascending: false });
  if (error) throw error;
  const map: Record<number, string> = {};
  for (const r of (data || [])) {
    const cid = r.carro_id as number;
    if (map[cid]) continue;
    map[cid] = r.volta as string;
  }
  return map;
}
