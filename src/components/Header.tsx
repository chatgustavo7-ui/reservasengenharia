import { Link } from "react-router-dom";

interface HeaderProps {
  title: string;
  subtitle: string;
  showViewReservations?: boolean;
}

export default function Header({ title, subtitle, showViewReservations = true }: HeaderProps) {
  return (
    <div className="text-center mb-8">
      {showViewReservations && (
        <div className="mb-6 flex items-center justify-center gap-3">
          <Link
            to="/reservas"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver reservas
          </Link>
          <Link
            to="/carros"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Carros
          </Link>
          <Link
            to="/calendario"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Calendário
          </Link>
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
}
