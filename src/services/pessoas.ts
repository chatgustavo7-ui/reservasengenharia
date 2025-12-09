import { supabase } from "@/lib/supabase";

export interface Pessoa {
  id: number;
  nome: string;
}

export async function listPessoas(): Promise<Pessoa[]> {
  const { data, error } = await supabase
    .from('pessoas')
    .select('*')
    .order('nome', { ascending: true });
  if (error) throw error;
  return (data || []) as Pessoa[];
}
