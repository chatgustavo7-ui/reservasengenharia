import { useEffect, useMemo, useState } from "react";
import { fetchAllMunicipios, MunicipioWithUF } from "../services/ibge";

interface Props {
  placeholder?: string;
  onPick: (city: string, uf: string) => void;
}

export default function IBGECityFilter({ placeholder = "Cidade", onPick }: Props) {
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
    return all.filter(c => c.nome.toLowerCase().startsWith(term)).slice(0, 20);
  }, [q, all]);

  const pick = (c: MunicipioWithUF) => {
    onPick(c.nome, c.uf);
    setQ(`${c.nome} - ${c.uf}`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
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

