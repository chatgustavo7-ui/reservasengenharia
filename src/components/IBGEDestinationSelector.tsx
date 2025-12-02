import { useEffect, useState } from "react";
import { fetchUFs, fetchMunicipiosByUFId, UF, Municipio } from "../services/ibge";

interface Props {
  onAdd: (formattedDestination: string) => void;
}

export default function IBGEDestinationSelector({ onAdd }: Props) {
  const [ufs, setUfs] = useState<UF[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedUfId, setSelectedUfId] = useState<number | null>(null);
  const [selectedUfSigla, setSelectedUfSigla] = useState<string>("");
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>("");
  const [loadingUF, setLoadingUF] = useState(false);
  const [loadingMun, setLoadingMun] = useState(false);

  useEffect(() => {
    const loadUFs = async () => {
      setLoadingUF(true);
      try {
        const list = await fetchUFs();
        setUfs(list);
      } finally {
        setLoadingUF(false);
      }
    };
    loadUFs();
  }, []);

  useEffect(() => {
    const loadMunicipios = async () => {
      if (selectedUfId == null) { setMunicipios([]); return; }
      setLoadingMun(true);
      try {
        const list = await fetchMunicipiosByUFId(selectedUfId);
        setMunicipios(list);
      } finally {
        setLoadingMun(false);
      }
    };
    loadMunicipios();
  }, [selectedUfId]);

  const handleAdd = () => {
    if (!selectedUfSigla || !selectedMunicipio) return;
    const formatted = `${selectedMunicipio} - ${selectedUfSigla}`;
    onAdd(formatted);
    setSelectedMunicipio("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <select
          value={selectedUfId ?? ""}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : null;
            setSelectedUfId(id);
            const uf = ufs.find(u => u.id === id);
            setSelectedUfSigla(uf?.sigla ?? "");
            setSelectedMunicipio("");
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{loadingUF ? "Carregando estados..." : "Selecione o estado (UF)"}</option>
          {ufs.map(uf => (
            <option key={uf.id} value={uf.id}>{uf.nome} ({uf.sigla})</option>
          ))}
        </select>

        <select
          value={selectedMunicipio}
          onChange={(e) => setSelectedMunicipio(e.target.value)}
          disabled={!selectedUfId}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">{loadingMun ? "Carregando municípios..." : "Selecione o município"}</option>
          {municipios.map(m => (
            <option key={m.id} value={m.nome}>{m.nome}</option>
          ))}
        </select>
      </div>

      <div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedUfSigla || !selectedMunicipio}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Adicionar destino
        </button>
      </div>
    </div>
  );
}

