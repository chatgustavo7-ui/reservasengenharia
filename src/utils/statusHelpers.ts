// Status helper functions for car maintenance and fuel level indicators

export interface CarStatus {
  revisao: {
    status: 'pendente' | 'concluida' | 'atrasada';
    data_proxima: string;
    quilometragem_atual: number;
  };
  tanque: {
    nivel: number;
    status: 'critico' | 'baixo' | 'medio' | 'alto';
  };
}

export const getRevisaoStatusColor = (status: string) => {
  switch (status) {
    case 'concluida':
      return 'text-green-600 bg-green-100';
    case 'pendente':
      return 'text-yellow-600 bg-yellow-100';
    case 'atrasada':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getTanqueStatusColor = (status: string) => {
  switch (status) {
    case 'alto':
      return 'text-green-600 bg-green-100';
    case 'medio':
      return 'text-blue-600 bg-blue-100';
    case 'baixo':
      return 'text-yellow-600 bg-yellow-100';
    case 'critico':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getTanqueStatusText = (nivel: number) => {
  if (nivel <= 15) return 'Crítico';
  if (nivel <= 30) return 'Baixo';
  if (nivel <= 70) return 'Médio';
  return 'Alto';
};

export const getRevisaoStatusText = (status: string) => {
  switch (status) {
    case 'concluida':
      return 'Concluída';
    case 'pendente':
      return 'Pendente';
    case 'atrasada':
      return 'Atrasada';
    default:
      return 'Desconhecido';
  }
};