import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ordenService } from '@/services/orden.service';
import { useCartStore } from '@/stores/cartStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { IOrden } from '@/types';

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [direccionId, setDireccionId] = useState('');
  const [envioId, setEnvioId] = useState('');
  const [cupon, setCupon] = useState('');
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();

  const checkoutMutation = useMutation({
    mutationFn: () =>
      ordenService.iniciarCheckout({
        direccionEnvioId: direccionId,
        metodoEnvioId: envioId,
        cuponCodigo: cupon || undefined,
      }),
    onSuccess: (data) => {
      clearCart();
      window.location.href = data.initPoint; // Redirige a Mercado Pago
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al procesar el checkout');
    },
  });

  const steps = ['Dirección de Envío', 'Método de Envío', 'Resumen y Pago'];

  if (items.length === 0) {
    navigate('/carrito');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 text-center">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${
              step > i + 1 ? 'bg-green-500 text-white' :
              step === i + 1 ? 'bg-primary-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <p className="text-xs mt-1 text-gray-600">{s}</p>
          </div>
        ))}
      </div>

      {/* Paso 1: Dirección */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Selecciona tu dirección de envío</h2>
          <input
            type="text"
            placeholder="Dirección completa"
            value={direccionId}
            onChange={(e) => setDireccionId(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />
          <button onClick={() => setStep(2)} disabled={!direccionId}
            className="bg-primary-600 text-white px-6 py-2 rounded disabled:opacity-50">
            Continuar
          </button>
        </div>
      )}

      {/* Paso 2: Envío */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Método de Envío</h2>
          <div className="space-y-3">
            {[
              { id: 'envio-estandar', name: 'Envío Estándar', price: 15, time: '3-5 días' },
              { id: 'envio-express', name: 'Envío Express', price: 25, time: '1-2 días' },
            ].map((envio) => (
              <label key={envio.id} className={`block border rounded p-4 cursor-pointer ${
                envioId === envio.id ? 'border-primary-600 bg-primary-50' : ''
              }`}>
                <input type="radio" name="envio" value={envio.id} checked={envioId === envio.id}
                  onChange={(e) => setEnvioId(e.target.value)} className="mr-2" />
                <span className="font-semibold">{envio.name}</span>
                <span className="text-gray-500 ml-2">({envio.time})</span>
                <span className="float-right font-bold">S/ {envio.price}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={() => setStep(1)} className="border px-6 py-2 rounded">Atrás</button>
            <button onClick={() => setStep(3)} disabled={!envioId}
              className="bg-primary-600 text-white px-6 py-2 rounded disabled:opacity-50">Continuar</button>
          </div>
        </div>
      )}

      {/* Paso 3: Resumen */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Resumen de tu orden</h2>
          
          <div className="border rounded-lg p-4 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                <span>{item.cat_productos.nombre} x{item.cantidad}</span>
                <span>S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Código de cupón</label>
            <input type="text" value={cupon} onChange={(e) => setCupon(e.target.value)}
              className="border rounded px-3 py-2 w-full" placeholder="Ej: DESCUENTO50" />
          </div>

          <div className="text-right mb-4">
            <p className="text-2xl font-bold">Total: S/ {getTotal().toFixed(2)}</p>
          </div>

          {checkoutMutation.isPending ? (
            <LoadingSpinner />
          ) : (
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="border px-6 py-2 rounded">Atrás</button>
              <button onClick={() => checkoutMutation.mutate()}
                className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 flex-1">
                Pagar con Mercado Pago
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}