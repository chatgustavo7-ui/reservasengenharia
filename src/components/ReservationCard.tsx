import { useEffect, useState } from "react";
import { Calendar, MapPin, User, Users, Car } from "lucide-react";
import IBGECityAutocomplete from "./IBGECityAutocomplete";
import BRDateInput from "./BRDateInput";
import { listPessoas, Pessoa } from "@/services/pessoas";

interface ReservationForm {
  pickupDate: string;
  returnDate: string;
  destinations: string[];
  mainDriver: string;
  companions: string[];
}

interface ReservationCardProps {
  onSubmit: (formData: ReservationForm) => void;
}

export default function ReservationCard({ onSubmit }: ReservationCardProps) {
  const [formData, setFormData] = useState<ReservationForm>({
    pickupDate: "",
    returnDate: "",
    destinations: [],
    mainDriver: "",
    companions: []
  });

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await listPessoas();
        setPessoas(list);
      } catch (e) {
        console.error('Falha ao carregar pessoas', e);
      }
    };
    load();
  }, []);

  const handleInputChange = (field: keyof ReservationForm, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  

  const removeDestination = (index: number) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index)
    }));
  };

  const handleCompanionChange = (companion: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        companions: [...prev.companions, companion]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        companions: prev.companions.filter(c => c !== companion)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Car className="w-5 h-5 text-blue-600" />
        <span className="text-lg font-semibold text-gray-900">Reserva de Veículo</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datas em linha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Data de Retirada</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <BRDateInput
                value={formData.pickupDate}
                onChange={(v) => handleInputChange('pickupDate', v)}
                placeholder="dd/mm/aaaa"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Data de Entrega</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <BRDateInput
                value={formData.returnDate}
                onChange={(v) => handleInputChange('returnDate', v)}
                placeholder="dd/mm/aaaa"
              />
            </div>
          </div>
        </div>

        {/* Destinos da Viagem */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="inline-block w-4 h-4 mr-2" />
            Destinos da Viagem
          </label>
          {/* Pesquisa de cidade via IBGE */}
          <IBGECityAutocomplete
            onAdd={(formatted) => {
              setFormData(prev => ({
                ...prev,
                destinations: [...prev.destinations, formatted]
              }));
            }}
          />

          {/* Lista de destinos adicionados */}
          {formData.destinations.length > 0 && (
            <div className="space-y-2">
              {formData.destinations.map((destination, index) => (
                <div key={index} className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-700">{destination}</span>
                  <button
                    type="button"
                    onClick={() => removeDestination(index)}
                    className="px-3 py-1 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Condutor Principal */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <User className="inline-block w-4 h-4 mr-2" />
            Condutor Principal
          </label>
          <select
            value={formData.mainDriver}
            onChange={(e) => {
              const driver = e.target.value;
              setFormData(prev => ({
                ...prev,
                mainDriver: driver,
                companions: prev.companions.filter(c => c !== driver)
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Selecione o condutor</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.nome}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Acompanhantes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Users className="inline-block w-4 h-4 mr-2" />
            Acompanhantes
          </label>
          <div className="grid grid-cols-2 gap-2">
            {pessoas.filter((x) => x.nome !== formData.mainDriver).map((p) => (
              <label key={p.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.companions.includes(p.nome)}
                  onChange={(e) => handleCompanionChange(p.nome, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{p.nome}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Botão de Submissão */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Reservar Veículo
        </button>
      </form>
    </div>
  );
}
