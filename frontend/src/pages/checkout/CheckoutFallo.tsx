import { useSearchParams, Link } from 'react-router-dom';

export default function CheckoutFallo() {
  const [params] = useSearchParams();
  const ordenId = params.get('ordenId');

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Pago rechazado</h1>
      <p className="text-gray-500 mb-8">
        No pudimos procesar tu pago. Puedes intentarlo nuevamente o elegir otro método.
      </p>

      {ordenId && (
        <p className="text-xs text-gray-400 font-mono mb-6">Referencia: {ordenId}</p>
      )}

      <div className="flex gap-3 justify-center">
        <Link to="/" className="border px-5 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
          Volver al inicio
        </Link>
        <Link to="/carrito" className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700">
          Reintentar pago
        </Link>
      </div>
    </div>
  );
}