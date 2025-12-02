import { supabase } from "@/lib/supabase";
import { getAvailableCar, updateCarro } from "@/services/carros";

export type ReservaStatus = 'pendente' | 'concluida' | 'em_viagem';

export interface NovaReservaInput {
  destinos: string[];
  ida: string;   // YYYY-MM-DD
  volta: string; // YYYY-MM-DD
  condutorNome: string;
  acompanhantesNomes: string[];
  carroId?: number;
}

async function ensurePessoa(nome: string): Promise<number> {
  const { data: existing, error: findErr } = await supabase
    .from('pessoas')
    .select('id')
    .eq('nome', nome)
    .limit(1)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing?.id) return existing.id as number;
  const { data: inserted, error: insertErr } = await supabase
    .from('pessoas')
    .insert({ nome })
    .select('id')
    .single();
  if (insertErr) throw insertErr;
  return inserted.id as number;
}

export async function criarReserva(input: NovaReservaInput): Promise<{ id: number; carro: { id: number; placa: string; modelo: string } }> {
  const available = await getAvailableCar(input.ida, input.volta);
  if (!available) {
    throw new Error('Sem veículos disponíveis para o período selecionado');
  }
  const { data: reserva, error: reservaErr } = await supabase
    .from('reservas')
    .insert({
      destinos: input.destinos,
      ida: input.ida,
      volta: input.volta,
      status: 'pendente' as ReservaStatus,
      carro_id: available.id
    })
    .select('id')
    .single();
  if (reservaErr) throw reservaErr;

  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const dd = String(hoje.getDate()).padStart(2, '0');
  const isoDate = `${yyyy}-${mm}-${dd}`;
  await updateCarro(available.id, { ultima_reserva: isoDate });

  const reservaId = reserva.id as number;
  const condutorId = await ensurePessoa(input.condutorNome);
  const acompanhantesIds: number[] = [];
  for (const nome of input.acompanhantesNomes) {
    const id = await ensurePessoa(nome);
    acompanhantesIds.push(id);
  }

  const relacoes = [
    { reserva_id: reservaId, pessoa_id: condutorId, papel: 'condutor' }
  ].concat(acompanhantesIds.map(id => ({ reserva_id: reservaId, pessoa_id: id, papel: 'acompanhante' })));

  const { error: relErr } = await supabase
    .from('reserva_pessoas')
    .insert(relacoes);
  if (relErr) throw relErr;

  return { id: reservaId, carro: { id: available.id, placa: (available as any).placa, modelo: (available as any).modelo } };
}

export interface ConcluirReservaInput {
  reservaId: number;
  carroId?: number;
  kmAtual?: number;
  tanqueFracao?: 1 | 2 | 3 | 4; // 1/4 ... 4/4 (cheio)
}

export async function concluirReserva(input: ConcluirReservaInput): Promise<void> {
  const { error: upErr } = await supabase
    .from('reservas')
    .update({ status: 'concluida', carro_id: input.carroId ?? null })
    .eq('id', input.reservaId);
  if (upErr) throw upErr;
  // Descobrir carro_id quando não informado: usa a reserva
  let carroId = input.carroId;
  if (!carroId) {
    const { data: r, error: rErr } = await supabase
      .from('reservas')
      .select('carro_id')
      .eq('id', input.reservaId)
      .single();
    if (rErr) throw rErr;
    carroId = r?.carro_id ?? undefined;
  }
  if (carroId) {
    const changes: Record<string, any> = {};
    if (typeof input.kmAtual === 'number') changes.km_atual = input.kmAtual;
    if (typeof input.tanqueFracao === 'number') changes.tanque = Math.round((input.tanqueFracao / 4) * 100);
    if (Object.keys(changes).length > 0) {
      const { error } = await supabase
        .from('carros')
        .update(changes)
        .eq('id', carroId);
      if (error) throw error;
    }
  }
}

