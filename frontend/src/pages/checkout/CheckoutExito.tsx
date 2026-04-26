import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CheckoutExito() {
  const [params] = useSearchParams();
  const ordenId = params.get('ordenId');
  const [orden, setOrden] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ordenId) return setLoading(false);
    api.get(`/ordenes/${ordenId}`)
      .then(({ data }) => setOrden(data.data ?? data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ordenId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-2 text-gray-900">¡Pago exitoso!</h1>
      <p className="text-gray-500 mb-8">Tu orden ha sido confirmada y está siendo procesada.</p>

      {orden && (
        <div className="border rounded-xl p-5 mb-8 text-left bg-gray-50">
          <p className="text-xs text-gray-400 font-mono mb-1">#{orden.id}</p>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total pagado</span>
            <span className="text-xl font-bold text-gray-900">
              S/ {Number(orden.total).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Estado</span>
            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              {orden.estado}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Link to="/" className="border px-5 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
          Ir al inicio
        </Link>
        <Link to="/ordenes" className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700">
          Ver mis órdenes
        </Link>
      </div>
    </div>
  );
}