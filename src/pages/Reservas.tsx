import { useEffect, useState } from "react";
import { Calendar, User, MapPin, Clock, CheckCircle, XCircle, Settings, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import IBGECityFilter from "@/components/IBGECityFilter";
import { fetchUFs, UF } from "@/services/ibge";
import { isoDateToBR } from "@/utils/datetime";
import BRDateInput from "@/components/BRDateInput";
import { supabase } from "@/lib/supabase";

interface Reserva {
  id: number;
  destinos: string[];
  ida: string;
  volta: string;
  status: 'pendente' | 'concluida' | 'em_viagem' | 'cancelada';
  created_at: string;
  carro_id: number | null;
}

interface CarroInfo {
  id: number;
  placa: string;
  modelo: string;
}

interface Pessoa {
  id: number;
  nome: string;
}

interface ReservaPessoa {
  reserva_id: number;
  pessoa_id: number;
  papel: 'condutor' | 'acompanhante';
}

export default function Reservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [reservaPessoas, setReservaPessoas] = useState<ReservaPessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [carros, setCarros] = useState<CarroInfo[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editReservaId, setEditReservaId] = useState<number | null>(null);

  // Filtros
  const [qCidade, setQCidade] = useState("");
  const [qUF, setQUF] = useState("");
  const [qCondutor, setQCondutor] = useState("");
  const [qCarroId, setQCarroId] = useState<number | null>(null);
  const [qMes, setQMes] = useState<string>("");
  const [qDataDe, setQDataDe] = useState<string>("");
  const [qDataAte, setQDataAte] = useState<string>("");
  const [ufs, setUfs] = useState<UF[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const loadUFs = async () => {
      try {
        const list = await fetchUFs();
        setUfs(list);
      } catch {}
    };
    loadUFs();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch reservas
      const { data: reservasData, error: reservasError } = await supabase
        .from('reservas')
        .select('*')
        .order('volta', { ascending: false });

      if (reservasError) throw reservasError;

      // Atualiza status automaticamente: pendente até as 18:00 (BRT) da data de volta
      const toConcludeIds: number[] = [];
      const reservasAjustadas = (reservasData || []).map((r) => {
        const [y, mRaw, dRaw] = String(r.volta).split('-');
        const yN = Number(y);
        const mN = Number(mRaw);
        const dN = Number(dRaw);
        const mStr = String(mN).padStart(2, '0');
        const dStr = String(dN).padStart(2, '0');
        const threshold = new Date(`${yN}-${mStr}-${dStr}T18:00:00-03:00`).getTime();
        const due = Date.now() >= threshold;
        if (due && r.status !== 'concluida') {
          toConcludeIds.push(r.id);
          return { ...r, status: 'concluida' };
        }
        return r;
      });
      if (toConcludeIds.length > 0) {
        await supabase
          .from('reservas')
          .update({ status: 'concluida' })
          .in('id', toConcludeIds);
      }

      // Fetch pessoas
      const { data: pessoasData, error: pessoasError } = await supabase
        .from('pessoas')
        .select('*');

      if (pessoasError) throw pessoasError;

      // Fetch reserva_pessoas
      const { data: reservaPessoasData, error: reservaPessoasError } = await supabase
        .from('reserva_pessoas')
        .select('*');

      if (reservaPessoasError) throw reservaPessoasError;

      // Fetch carros
      const { data: carrosData, error: carrosError } = await supabase
        .from('carros')
        .select('id, placa, modelo');
      if (carrosError) throw carrosError;

      setReservas(reservasAjustadas || []);
      setPessoas(pessoasData || []);
      setReservaPessoas(reservaPessoasData || []);
      setCarros((carrosData || []) as CarroInfo[]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const getCondutorNome = (reservaId: number) => {
    const rp = reservaPessoas.find(r => r.reserva_id === reservaId && r.papel === 'condutor');
    const p = pessoas.find(px => px.id === rp?.pessoa_id);
    return p?.nome || '';
  };

  const filtered = reservas.filter((r) => {
    // Cidade
    if (qCidade && !r.destinos.some(d => d.toLowerCase().includes(qCidade.toLowerCase()))) return false;
    // UF
    if (qUF) {
      const okUF = r.destinos.some(d => d.endsWith(` - ${qUF.toUpperCase()}`) || d.toLowerCase().includes(` - ${qUF.toLowerCase()}`));
      if (!okUF) return false;
    }
    // Condutor
    if (qCondutor) {
      const nome = getCondutorNome(r.id);
      if (!nome.toLowerCase().includes(qCondutor.toLowerCase())) return false;
    }
    // Carro
    if (qCarroId && r.carro_id !== qCarroId) return false;
    // Mês
    if (qMes) {
      const m = Number(qMes);
      const mIda = new Date(r.ida).getMonth() + 1;
      const mVolta = new Date(r.volta).getMonth() + 1;
      if (mIda !== m && mVolta !== m) return false;
    }
    // Data range
    if (qDataDe) {
      const deISO = qDataDe.includes('/') ? `${qDataDe.split('/')[2]}-${qDataDe.split('/')[1]}-${qDataDe.split('/')[0]}` : qDataDe;
      const de = new Date(deISO);
      const ida = new Date(r.ida);
      if (ida < de) return false;
    }
    if (qDataAte) {
      const ateISO = qDataAte.includes('/') ? `${qDataAte.split('/')[2]}-${qDataAte.split('/')[1]}-${qDataAte.split('/')[0]}` : qDataAte;
      const ate = new Date(ateISO);
      const volta = new Date(r.volta);
      if (volta > ate) return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'text-green-600 bg-green-100';
      case 'em_viagem':
        return 'text-blue-600 bg-blue-100';
      case 'pendente':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelada':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'em_viagem':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'em_viagem':
        return 'Em Viagem';
      case 'pendente':
        return 'Pendente';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Desconhecido';
    }
  };

  const getPessoasByReserva = (reservaId: number) => {
    const pessoasDaReserva = reservaPessoas
      .filter(rp => rp.reserva_id === reservaId)
      .map(rp => {
        const pessoa = pessoas.find(p => p.id === rp.pessoa_id);
        return {
          nome: pessoa?.nome || 'Desconhecido',
          papel: rp.papel
        };
      });
    
    return pessoasDaReserva;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservas</h1>
            <p className="text-gray-600">Visualize reservas de veículos</p>
          </div>
          <div className="text-center py-8">
            <div className="animate-pulse text-gray-500">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservas</h1>
          <p className="text-gray-600">Visualize reservas de veículos</p>
          <div className="mt-4">
            <Link to="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Voltar à tela principal</Link>
          </div>
        </div>
        {/* Filtros */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid md:grid-cols-3 gap-3">
            <IBGECityFilter onPick={(city, uf) => { setQCidade(city); setQUF(uf); }} />
            <select value={qUF} onChange={(e) => setQUF(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Estado (UF)</option>
              {ufs.map(u => (<option key={u.id} value={u.sigla}>{u.nome} ({u.sigla})</option>))}
            </select>
            <select value={qCondutor} onChange={(e) => setQCondutor(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Condutor</option>
              {pessoas.map(p => (<option key={p.id} value={p.nome}>{p.nome}</option>))}
            </select>
            <select value={qCarroId ?? ''} onChange={(e) => setQCarroId(e.target.value ? Number(e.target.value) : null)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Carro</option>
              {carros.map(c => (<option key={c.id} value={c.id}>{c.modelo} ({c.placa})</option>))}
            </select>
            <select value={qMes} onChange={(e) => setQMes(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Mês</option>
              {[...Array(12)].map((_,i)=> <option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')}</option>)}
            </select>
            {/* Data de (formato BR) */}
            <div>
              <BRDateInput value={qDataDe} onChange={setQDataDe} placeholder="Data de (dd/mm/aaaa)" required={false} />
            </div>
            {/* Data até (formato BR) */}
            <div>
              <BRDateInput value={qDataAte} onChange={setQDataAte} placeholder="Data até (dd/mm/aaaa)" required={false} />
            </div>
          </div>
          <div className="mt-3">
            <button type="button" onClick={() => { setQCidade(''); setQUF(''); setQCondutor(''); setQCarroId(null); setQMes(''); setQDataDe(''); setQDataAte(''); }} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Limpar filtros</button>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((reserva) => {
            const pessoasReserva = getPessoasByReserva(reserva.id);
            const condutor = pessoasReserva.find(p => p.papel === 'condutor');
            const acompanhantes = pessoasReserva.filter(p => p.papel === 'acompanhante');
            const carro = carros.find(c => c.id === (reserva.carro_id ?? -1));

            return (
              <div key={reserva.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(reserva.status)}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reserva.status)}`}>
                      {getStatusText(reserva.status)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setEditReservaId(reserva.id); setEditOpen(true); }}
                    title="Editar reserva"
                    className="inline-flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-800"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Data de Ida</div>
                      <div className="font-medium">{isoDateToBR(reserva.ida)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Data de Volta</div>
                      <div className="font-medium">{isoDateToBR(reserva.volta)}</div>
                    </div>
                  </div>
                </div>

                {reserva.destinos && reserva.destinos.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Destinos</span>
                    </div>
                    <div className="text-sm text-gray-900">
                      {reserva.destinos.join(', ')}
                    </div>
                  </div>
                )}

                {carro && (
                  <div className="mb-2 text-sm">
                    <span className="font-medium">Carro:</span> {carro.modelo} ({carro.placa})
                  </div>
                )}

                <div className="space-y-2">
                  {condutor && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <span className="font-medium">Condutor:</span> {condutor.nome}
                      </span>
                    </div>
                  )}

                  {acompanhantes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <span className="font-medium">Acompanhantes:</span> {acompanhantes.map(p => p.nome).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {reserva.status !== 'cancelada' && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm('Confirmar exclusão desta reserva?')) return;
                        await deleteReserva(reserva.id);
                        await fetchData();
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir reserva
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {reservas.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-gray-600">
              Não há reservas cadastradas no sistema.
            </p>
          </div>
        )}
      </div>
      <EditReservaModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditReservaId(null); }}
        carros={carros}
        initial={(() => {
          const r = reservas.find(rx => rx.id === editReservaId);
          if (!r) return null;
          return { carroId: r.carro_id, idaISO: r.ida, voltaISO: r.volta };
        })()}
        onConfirm={async ({ carroId, idaISO, voltaISO }) => {
          if (!editReservaId) return;
          await updateReserva({ id: editReservaId, carroId: carroId ?? null, ida: idaISO, volta: voltaISO });
          setEditOpen(false);
          setEditReservaId(null);
          await fetchData();
        }}
      />
    </div>
  );
}
import EditReservaModal from "@/components/EditReservaModal";
import { updateReserva, deleteReserva } from "@/services/reservas";
