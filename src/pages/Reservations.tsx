export default function Reservations() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Reservas</h1>
          <p className="text-gray-600">Visualize suas reservas de veículos</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <p className="mb-4">Nenhuma reserva encontrada</p>
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fazer Nova Reserva
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}