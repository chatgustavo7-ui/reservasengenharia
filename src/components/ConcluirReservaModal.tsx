import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { carroId?: number; kmAtual?: number; tanqueFracao?: 1|2|3|4 }) => Promise<void> | void;
  carInfo?: { id: number; placa: string; modelo: string } | null;
}

export default function ConcluirReservaModal({ open, onClose, onConfirm, carInfo }: Props) {
  const [carroId, setCarroId] = useState<number | undefined>(undefined);
  const [kmAtual, setKmAtual] = useState<string>("");
  const [tanque, setTanque] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCarroId(carInfo?.id ?? undefined);
  }, [open, carInfo]);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm({
        carroId,
        kmAtual: kmAtual ? Number(kmAtual) : undefined,
        tanqueFracao: tanque ? (Number(tanque) as 1|2|3|4) : undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Concluir viagem</h3>

        <div className="space-y-3">
          {carInfo && (
            <div className="text-sm">
              <span className="font-medium">Carro reservado:</span> {carInfo.modelo} ({carInfo.placa})
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 mb-1">KM atual (opcional)</label>
            <input
              type="number"
              value={kmAtual}
              onChange={(e) => setKmAtual(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ex: 12345"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Nível do tanque (opcional)</label>
            <select
              value={tanque}
              onChange={(e) => setTanque(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecione</option>
              <option value="1">1/4</option>
              <option value="2">2/4</option>
              <option value="3">3/4</option>
              <option value="4">Cheio</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
          <button onClick={handleConfirm} disabled={saving} className="px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Concluir</button>
        </div>
      </div>
    </div>
  );
}

