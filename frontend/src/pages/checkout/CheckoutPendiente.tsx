import { useSearchParams, Link } from 'react-router-dom';

export default function CheckoutPendiente() {
  const [params] = useSearchParams();
  const ordenId = params.get('ordenId');

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Pago pendiente</h1>
      <p className="text-gray-500 mb-4">
        Tu pago está siendo procesado. Te notificaremos cuando se confirme.
      </p>
      <p className="text-sm text-gray-400 mb-8">
        Esto puede tardar algunos minutos dependiendo del método de pago elegido.
      </p>

      {ordenId && (
        <p className="text-xs text-gray-400 font-mono mb-6">Referencia: {ordenId}</p>
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