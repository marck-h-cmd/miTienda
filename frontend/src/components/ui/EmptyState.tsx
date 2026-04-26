import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = 'No hay elementos',
  description = 'No se encontraron resultados',
  actionLabel,
  actionLink,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon || <PackageOpen size={64} className="text-gray-300 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
      <p className="text-gray-400 mt-1 mb-4">{description}</p>
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}