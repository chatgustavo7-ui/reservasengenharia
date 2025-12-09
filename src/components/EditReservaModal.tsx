import { useEffect, useState } from "react";
import BRDateInput from "@/components/BRDateInput";
import { brDateToISO, isoDateToBR } from "@/utils/datetime";

interface CarroOption {
  id: number;
  placa: string;
  modelo: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { carroId?: number | null; idaISO?: string; voltaISO?: string }) => Promise<void> | void;
  carros: CarroOption[];
  initial: { carroId: number | null; idaISO: string; voltaISO: string } | null;
}

export default function EditReservaModal({ open, onClose, onConfirm, carros, initial }: Props) {
  const [carroId, setCarroId] = useState<number | null | undefined>(undefined);
  const [idaBr, setIdaBr] = useState<string>("");
  const [voltaBr, setVoltaBr] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCarroId(initial?.carroId ?? null);
    setIdaBr(initial ? isoDateToBR(initial.idaISO) : "");
    setVoltaBr(initial ? isoDateToBR(initial.voltaISO) : "");
  }, [open, initial]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onConfirm({
        carroId: carroId === undefined ? undefined : (carroId ?? null),
        idaISO: idaBr ? brDateToISO(idaBr) : undefined,
        voltaISO: voltaBr ? brDateToISO(voltaBr) : undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Reserva</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carro</label>
            <select
              value={carroId ?? ""}
              onChange={(e) => setCarroId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Sem carro</option>
              {carros.map(c => (
                <option key={c.id} value={c.id}>{c.modelo} ({c.placa})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Ida</label>
            <BRDateInput value={idaBr} onChange={setIdaBr} placeholder="dd/mm/aaaa" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Volta</label>
            <BRDateInput value={voltaBr} onChange={setVoltaBr} placeholder="dd/mm/aaaa" />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
