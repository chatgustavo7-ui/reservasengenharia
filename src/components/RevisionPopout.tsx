import { AlertTriangle, Gauge, X } from "lucide-react";
import { useState } from "react";

interface Item {
  placa: string;
  modelo: string;
  km_atual: number;
  faltam: number;
}

interface Props {
  items: Item[];
  onGoToCarros: () => void;
}

export default function RevisionPopout({ items, onGoToCarros }: Props) {
  const [hidden, setHidden] = useState(false);
  if (hidden || items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-white/95 backdrop-blur border border-yellow-200 rounded-xl shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-100 bg-yellow-50 rounded-t-xl">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">Revisão se aproximando</span>
        </div>
        <button aria-label="Fechar" onClick={() => setHidden(true)} className="p-1 rounded hover:bg-yellow-100">
          <X className="w-4 h-4 text-yellow-800" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {items.map((a) => {
          const faltamClamped = Math.max(0, a.faltam);
          const perc = Math.min(100, Math.max(0, Math.round((10000 - faltamClamped) / 100)));
          return (
            <div key={a.placa} className="rounded-lg border border-yellow-100 p-3 bg-yellow-50/40">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-800">
                  <div className="font-medium">{a.modelo} ({a.placa})</div>
                  <div className="text-xs">Faltam ~{faltamClamped.toLocaleString('pt-BR')} km</div>
                </div>
                <Gauge className="w-5 h-5 text-yellow-700" />
              </div>
              <div className="mt-2 h-2 bg-yellow-100 rounded">
                <div className="h-2 bg-yellow-500 rounded" style={{ width: `${perc}%` }} />
              </div>
            </div>
          );
        })}
        <div className="pt-1">
          <button onClick={onGoToCarros} className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Ir para Carros</button>
        </div>
      </div>
    </div>
  );
}

