import { useEffect, useMemo, useState } from "react";
import { EllipsisVertical, X } from "lucide-react";
import { fetchAllMunicipios, MunicipioWithUF } from "../services/ibge";

interface Props {
  onAdd: (formattedDestination: string) => void;
  placeholder?: string;
}

export default function IBGECityAutocomplete({ onAdd, placeholder = "Ex: São Paulo - SP" }: Props) {
  const [all, setAll] = useState<MunicipioWithUF[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchAllMunicipios();
        setAll(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const options = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 3) return [];
    return all
      .filter(c => c.nome.toLowerCase().startsWith(term))
      .slice(0, 20);
  }, [q, all]);

  const pick = (c: MunicipioWithUF) => {
    onAdd(`${c.nome} - ${c.uf}`);
    setQ("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <EllipsisVertical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          aria-label="Limpar destino"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Carregando cidades...</div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">Digite ao menos 3 caracteres</div>
          ) : (
            options.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pick(c)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              >
                {c.nome} - {c.uf}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

