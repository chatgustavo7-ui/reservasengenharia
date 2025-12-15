import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { listCarros } from "@/services/carros";
import { Link } from "react-router-dom";

interface Reserva {
  id: number;
  carro_id: number | null;
  ida: string;
  volta: string;
  status: "pendente" | "concluida" | "em_viagem" | "cancelada";
}

export default function Calendario() {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [totalCarros, setTotalCarros] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: reservasData } = await supabase
        .from("reservas")
        .select("*");
      setReservas((reservasData || []) as Reserva[]);
      const carros = await listCarros();
      setTotalCarros(carros.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const days = useMemo(() => {
    const count = new Date(year, month, 0).getDate();
    const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Dom ... 6=Sáb
    const startOffset = (firstDow + 6) % 7; // início pela segunda (Seg=0)
    type Cell = { type: "empty" } | { type: "day"; day: number; iso: string; busy: number; free: number };
    const makeInfo = (d: number) => {
      const yStr = String(year);
      const mStr = String(month).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      const iso = `${yStr}-${mStr}-${dStr}`;
      const busyIds = new Set<number>();
      for (const r of reservas) {
        const blocks = r.status === "pendente" || r.status === "em_viagem";
        if (!blocks) continue;
        const overlaps =
          !(new Date(r.volta) < new Date(iso)) &&
          !(new Date(r.ida) > new Date(iso));
        if (overlaps && r.carro_id) busyIds.add(r.carro_id);
      }
      const busy = busyIds.size;
      const free = Math.max(totalCarros - busy, 0);
      return { day: d, iso, busy, free };
    };
    const cells: Cell[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ type: "empty" });
    for (let d = 1; d <= count; d++) cells.push({ type: "day", ...makeInfo(d) });
    while (cells.length % 7 !== 0) cells.push({ type: "empty" });
    const rows: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [year, month, reservas, totalCarros]);

  const prevMonth = () => {
    const m = month - 1;
    if (m < 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(m);
    }
  };
  const nextMonth = () => {
    const m = month + 1;
    if (m > 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(m);
    }
  };

  const monthName = new Date(year, month - 1, 1).toLocaleString("pt-BR", { month: "long" });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendário de Disponibilidade</h1>
          <p className="text-gray-600">Visualize por dia quantos carros estão livres</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Voltar à tela principal</Link>
            <Link to="/reservas" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Ver reservas</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Anterior</button>
            <div className="text-lg font-medium text-gray-900 capitalize">{monthName} / {year}</div>
            <button onClick={nextMonth} className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Próximo</button>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded bg-green-500" />
              <span>Todos livres</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded bg-yellow-400" />
              <span>Parcialmente livre</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded bg-red-500" />
              <span>Sem carros livres</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Carregando...</div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs text-gray-600">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((w) => (
                  <div key={w} className="py-1">{w}</div>
                ))}
              </div>
              <div className="space-y-2">
                {days.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-7 gap-2">
                    {row.map((cell, jdx) => {
                      if (cell.type === "empty") {
                        return <div key={`e-${idx}-${jdx}`} className="rounded-lg p-3 border border-gray-200 bg-gray-50 h-16" />;
                      }
                      const color =
                        cell.free === totalCarros ? "bg-green-500 text-white" :
                        cell.free === 0 ? "bg-red-500 text-white" :
                        "bg-yellow-100 text-gray-900";
                      const isToday = (() => {
                        const t = new Date();
                        const y = t.getFullYear();
                        const m = t.getMonth() + 1;
                        const d = t.getDate();
                        const iso = `${String(y)}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                        return iso === cell.iso;
                      })();
                      return (
                        <div key={cell.iso} className={`rounded-lg p-3 border border-gray-200 ${color} h-16 ${isToday ? "ring-2 ring-blue-500" : ""}`}>
                          <div className="text-sm font-semibold">{String(cell.day).padStart(2, "0")}</div>
                          <div className="text-xs">Livres {cell.free}/{totalCarros}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
