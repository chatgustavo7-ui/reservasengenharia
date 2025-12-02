export interface UF {
  id: number;
  sigla: string;
  nome: string;
}

export interface Municipio {
  id: number;
  nome: string;
}

const BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";

export interface MunicipioWithUF {
  id: number;
  nome: string;
  uf: string;
}

export async function fetchUFs(): Promise<UF[]> {
  const res = await fetch(`${BASE_URL}/estados?orderBy=nome`);
  if (!res.ok) throw new Error("Falha ao carregar estados (UF)");
  const data = await res.json();
  return data as UF[];
}

export async function fetchMunicipiosByUFId(ufId: number): Promise<Municipio[]> {
  const res = await fetch(`${BASE_URL}/estados/${ufId}/municipios?orderBy=nome`);
  if (!res.ok) throw new Error("Falha ao carregar municípios");
  const data = await res.json();
  return data as Municipio[];
}

export async function fetchAllMunicipios(): Promise<MunicipioWithUF[]> {
  const res = await fetch(`${BASE_URL}/municipios?orderBy=nome`);
  if (!res.ok) throw new Error("Falha ao carregar municípios");
  const data = await res.json();
  return (data as { id: number; nome: string; microrregiao?: { mesorregiao?: { UF?: { sigla: string } } } }[]).map((m) => ({
    id: m.id,
    nome: m.nome,
    uf: m.microrregiao?.mesorregiao?.UF?.sigla ?? ""
  }));
}

