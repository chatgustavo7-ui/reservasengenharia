import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ReservationCard from "@/components/ReservationCard";
import { criarReserva } from "@/services/reservas";
import { brDateToISO } from "@/utils/datetime";
import { useEffect, useState } from "react";
import { listCarros } from "@/services/carros";
import { AlertTriangle } from "lucide-react";
import RevisionPopout from "@/components/RevisionPopout";
import { pingKeepalive } from "@/services/keepalive";

export default function Home() {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState<{ placa: string; modelo: string; km_atual: number; proxima:number }[]>([]);
  const [quaseRevisao, setQuaseRevisao] = useState<{ placa: string; modelo: string; km_atual: number; faltam:number }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        pingKeepalive();
        const carros = await listCarros();
        const baseKm = (c: any) => (c.km_ultima_revisao ?? 0) as number;
        const diff = (c: any) => c.km_atual - baseKm(c);
        const due = carros.filter(c => diff(c) >= 10000).map(c => ({ placa: c.placa, modelo: c.modelo, km_atual: c.km_atual, proxima: baseKm(c) + 10000 }));
        const near = carros.filter(c => {
          const d = diff(c);
          return d >= 9500 && d < 10000;
        }).map(c => ({ placa: c.placa, modelo: c.modelo, km_atual: c.km_atual, faltam: (baseKm(c) + 10000) - c.km_atual }));
        setAlertas(due);
        setQuaseRevisao(near);
      } catch {}
    };
    load();
  }, []);

  const handleSubmit = async (form: { pickupDate: string; returnDate: string; destinations: string[]; mainDriver: string; companions: string[]; }) => {
    try {
      const idaISO = brDateToISO(form.pickupDate);
      const voltaISO = brDateToISO(form.returnDate);
      const result = await criarReserva({
        destinos: form.destinations,
        ida: idaISO,
        volta: voltaISO,
        condutorNome: form.mainDriver,
        acompanhantesNomes: form.companions,
      });
      alert(`Carro reservado: ${result.carro.modelo} (${result.carro.placa})`);
      navigate('/reservas');
    } catch (e) {
      console.error('Erro ao criar reserva', e);
      const msg = (e as any)?.message || 'Não foi possível criar a reserva.';
      alert(msg.includes('Sem veículos') ? 'Não há carros disponíveis nas datas selecionadas.' : msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Header
          title="Reserve seu Veículo"
          subtitle="Preencha os dados abaixo e nosso sistema selecionará automaticamente o melhor veículo disponível para sua viagem."
          showViewReservations
        />
        {alertas.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Revisão necessária</span>
            </div>
            <ul className="space-y-1 text-sm">
              {alertas.map(a => (
                <li key={a.placa}>
                  {a.modelo} ({a.placa}) • KM Atual: {a.km_atual.toLocaleString('pt-BR')} • Próxima revisão: {a.proxima.toLocaleString('pt-BR')} km
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <button onClick={() => navigate('/carros')} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Ir para Carros</button>
            </div>
          </div>
        )}
        <RevisionPopout items={quaseRevisao} onGoToCarros={() => navigate('/carros')} />
        <ReservationCard onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
