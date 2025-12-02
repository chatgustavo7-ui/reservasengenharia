import { useEffect, useState } from "react";
import { Wrench, Fuel, AlertTriangle, CheckCircle, Clock, Car, Save, Cog } from "lucide-react";
import { Link } from "react-router-dom";
import { listCarros, updateCarro, confirmarRevisao, getLastTripByCar } from "@/services/carros";
import { isoDateToBR } from "@/utils/datetime";

interface CarroUI {
  id: number;
  placa: string;
  modelo: string;
  ano: number;
  tanque: number;
  ultima_revisao: string | null;
  km_atual: number;
  saving?: boolean;
  editing?: boolean;
}

type RevisaoStatus = 'pendente' | 'concluida' | 'atrasada';

export default function Carros() {
  const [carros, setCarros] = useState<CarroUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [list, lastMap] = await Promise.all([listCarros(), getLastTripByCar()]);
        setCarros(list.map(c => ({ ...c, ultimo_uso: lastMap[c.id] ?? (c as any).ultimo_uso })) as any);
      } catch (e) {
        console.error('Falha ao carregar carros', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onFieldChange = (id: number, field: keyof CarroUI, value: any) => {
    setCarros(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const onSave = async (c: CarroUI) => {
    setCarros(prev => prev.map(x => x.id === c.id ? { ...x, saving: true } : x));
    try {
      await updateCarro(c.id, {
        placa: c.placa,
        modelo: c.modelo,
        ano: c.ano,
        km_atual: c.km_atual,
        tanque: c.tanque,
      });
      alert('Carro atualizado com sucesso');
    } catch (e) {
      console.error('Falha ao salvar carro', e);
      alert('Não foi possível salvar as alterações do carro.');
    } finally {
      setCarros(prev => prev.map(x => x.id === c.id ? { ...x, saving: false, editing: false } : x));
    }
  };

  const toggleEdit = (id: number) => {
    setCarros(prev => prev.map(c => c.id === id ? { ...c, editing: !c.editing } : c));
  };

  const onConfirmarRevisao = async (c: CarroUI) => {
    setCarros(prev => prev.map(x => x.id === c.id ? { ...x, saving: true } : x));
    try {
      await confirmarRevisao(c.id);
      const hoje = new Date();
      const br = hoje.toLocaleDateString('pt-BR');
      setCarros(prev => prev.map(x => x.id === c.id ? { ...x, ultima_revisao: new Date().toISOString(), saving: false } : x));
      alert(`Revisão confirmada em ${br}`);
    } catch (e) {
      console.error('Falha ao confirmar revisão', e);
      alert('Não foi possível confirmar a revisão.');
      setCarros(prev => prev.map(x => x.id === c.id ? { ...x, saving: false } : x));
    }
  };

  const getRevisaoStatus = (kmAtual: number, kmUltima?: number | null): { status: RevisaoStatus; texto: string } => {
    const base = kmUltima ?? 0;
    const diff = kmAtual - base;
    if (diff >= 10000) return { status: 'atrasada', texto: 'Revisão necessária' };
    return { status: 'concluida', texto: `Próxima em ${(10000 - diff).toLocaleString('pt-BR')} km` };
  };

  const getTanqueStatus = (nivel: number): { status: string; texto: string } => {
    if (nivel <= 15) return { status: 'critico', texto: 'Crítico' };
    if (nivel <= 30) return { status: 'baixo', texto: 'Baixo' };
    if (nivel <= 70) return { status: 'medio', texto: 'Médio' };
    return { status: 'alto', texto: 'Alto' };
  };

  const getTanqueStatusColor = (s: string) => (
    s === 'critico' ? 'bg-red-100 text-red-700' :
    s === 'baixo'   ? 'bg-yellow-100 text-yellow-700' :
    s === 'medio'   ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
  );

  const getRevisaoStatusColor = (s: RevisaoStatus) => (
    s === 'concluida' ? 'bg-green-100 text-green-700' : s === 'atrasada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
  );
  const getRevisaoStatusText = (s: RevisaoStatus) => (
    s === 'concluida' ? 'Revisão em dia' : s === 'atrasada' ? 'Revisão atrasada' : 'Revisão pendente'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Carros</h1>
            <p className="text-gray-600">Acompanhe o status da frota</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Carros</h1>
          <p className="text-gray-600">Acompanhe o status da frota</p>
          <div className="mt-4">
            <Link to="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Voltar à tela principal</Link>
          </div>
        </div>

        <div className="space-y-4">
          {carros.map((carro) => {
            const revisaoInfo = getRevisaoStatus(carro.km_atual, (carro as any).km_ultima_revisao);
            const tanqueInfo = getTanqueStatus(carro.tanque);
            const canConfirm = revisaoInfo.status === 'atrasada';
            
            return (
              <div key={carro.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                      <Car className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{carro.modelo} ({carro.placa})</div>
                      {(carro as any).ultimo_uso && (
                        <div className="text-xs text-gray-500">Última viagem: {isoDateToBR(String((carro as any).ultimo_uso).slice(0,10))}</div>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleEdit(carro.id)} className="px-2 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                    <Cog className="w-4 h-4 text-gray-700" />
                  </button>
                </div>

                {carro.editing ? (
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <input type="text" value={carro.placa} onChange={(e) => onFieldChange(carro.id, 'placa', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Placa" />
                    <input type="text" value={carro.modelo} onChange={(e) => onFieldChange(carro.id, 'modelo', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Modelo" />
                    <input type="number" value={carro.ano} onChange={(e) => onFieldChange(carro.id, 'ano', Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ano" />
                    <input type="number" value={carro.km_atual} onChange={(e) => onFieldChange(carro.id, 'km_atual', Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="KM Atual" />
                    <input type="number" value={carro.tanque} onChange={(e) => onFieldChange(carro.id, 'tanque', Math.max(0, Math.min(100, Number(e.target.value))))} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Tanque (%)" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm text-gray-700">
                    <div>Placa: <span className="font-medium">{carro.placa}</span></div>
                    <div>Modelo: <span className="font-medium">{carro.modelo}</span></div>
                    <div>Ano: <span className="font-medium">{carro.ano}</span></div>
                    <div>KM Atual: <span className="font-medium">{carro.km_atual.toLocaleString('pt-BR')}</span></div>
                    <div>Tanque: <span className="font-medium">{carro.tanque}%</span></div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className={`w-4 h-4 ${revisaoInfo.status === 'concluida' ? 'text-green-600' : revisaoInfo.status === 'atrasada' ? 'text-red-600' : 'text-yellow-600'}`} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRevisaoStatusColor(revisaoInfo.status)}`}>{getRevisaoStatusText(revisaoInfo.status)}</span>
                    <span className="text-xs text-gray-500">{revisaoInfo.texto}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Fuel className={`w-4 h-4 ${tanqueInfo.status === 'critico' ? 'text-red-600' : tanqueInfo.status === 'baixo' ? 'text-yellow-600' : tanqueInfo.status === 'medio' ? 'text-blue-600' : 'text-green-600'}`} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTanqueStatusColor(tanqueInfo.status)}`}>Tanque: {tanqueInfo.texto} ({carro.tanque}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => onConfirmarRevisao(carro)} className={`px-3 py-2 rounded-lg text-sm ${canConfirm ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} ${carro.saving ? 'opacity-50' : ''}`} disabled={!canConfirm || carro.saving}>Confirmar revisão</button>
                  {carro.editing && (
                    <button type="button" onClick={() => onSave(carro)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm inline-flex items-center gap-2" disabled={carro.saving}><Save className="w-4 h-4" />Salvar</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {carros.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum carro encontrado
            </h3>
            <p className="text-gray-600">
              Não há veículos cadastrados no sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
