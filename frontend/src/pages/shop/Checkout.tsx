import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { ordenService } from '@/services/orden.service';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Checkout() {
  const [step, setStep]               = useState(1);
  const [direccionId, setDireccionId] = useState('');
  const [envioId, setEnvioId]         = useState('');
  const [cupon, setCupon]             = useState('');
  const navigate                      = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const accessToken                   = useAuthStore((s) => s.accessToken);

  const { data, isLoading, error } = useQuery({
    queryKey: ['opciones-envio'],
    queryFn: async () => {
      // api.ts ya inyecta el Bearer token y maneja el refresh automáticamente
      const { data } = await api.get('/ordenes/opciones-envio');
      const payload    = data?.data ?? data;
      const direcciones = Array.isArray(payload?.direcciones) ? payload.direcciones : [];
      const metodos     = Array.isArray(payload?.metodos)     ? payload.metodos     : [];
      console.log('[Checkout] dirs:', direcciones, '| métodos:', metodos);
      return { direcciones, metodos };
    },
    enabled: !!accessToken,
    retry: false,
  });

  const direcciones = data?.direcciones ?? [];
  const metodos     = data?.metodos     ?? [];

  useEffect(() => {
    if (direcciones.length > 0 && !direccionId) {
      const def = direcciones.find((d: any) => d.es_principal) ?? direcciones[0];
      setDireccionId(def.id);
    }
  }, [direcciones]);

  useEffect(() => {
    if (metodos.length > 0 && !envioId) setEnvioId(metodos[0].id);
  }, [metodos]);

  const checkoutMutation = useMutation({
    mutationFn: () => ordenService.iniciarCheckout({
      direccionEnvioId: direccionId,
      metodoEnvioId:    envioId,
      cuponCodigo:      cupon || undefined,
    }),
    onSuccess: (res) => { clearCart(); window.location.href = res.initPoint; },
    onError:   (err: any) => toast.error(err?.response?.data?.message ?? err?.message ?? 'Error en checkout'),
  });

  console.log('Renderizando Checkout | Step:', step, '| DireccionId:', direccionId, '| EnvioId:', envioId, '| Cupon:', cupon);

  if (items.length === 0) { navigate('/carrito'); return null; }
  if (isLoading) return <LoadingSpinner />;

  const steps = ['Dirección de Envío', 'Método de Envío', 'Resumen y Pago'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>


      {/* Stepper */}
      <div className="flex mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 text-center">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${
              step > i+1 ? 'bg-green-500 text-white' : step === i+1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{step > i+1 ? '✓' : i+1}</div>
            <p className="text-xs mt-1 text-gray-600">{s}</p>
          </div>
        ))}
      </div>

      {/* Paso 1 */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Selecciona tu dirección de envío</h2>
          {!accessToken ? (
            <div className="p-4 bg-red-50 border border-red-300 rounded mb-4 text-sm text-red-700">
              No estás autenticado. <a href="/login" className="underline">Inicia sesión</a>.
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-300 rounded mb-4 text-sm text-red-700">
              Error al cargar: {(error as Error).message}
            </div>
          ) : direcciones.length > 0 ? (
            <div className="space-y-3 mb-4">
              {direcciones.map((dir: any) => (
                <label key={dir.id} className={`block border rounded p-4 cursor-pointer transition-colors ${
                  direccionId === dir.id ? 'border-primary-600 bg-primary-50' : 'hover:border-gray-400'
                }`}>
                  <input type="radio" name="direccion" value={dir.id}
                    checked={direccionId === dir.id}
                    onChange={(e) => setDireccionId(e.target.value)} className="mr-2" />
                  <span className="font-semibold">{dir.nombre} {dir.apellido}</span>
                  {dir.es_principal && (
                    <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                      Principal
                    </span>
                  )}
                  <div className="text-gray-600 text-sm mt-1">
                    {dir.direccion}, {dir.ciudad}, {dir.departamento}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border rounded mb-4 text-sm text-gray-600">
              No tienes direcciones guardadas.{' '}
              <a href="/perfil/direcciones" className="text-primary-600 underline">Agrega una</a>.
            </div>
          )}
          <button onClick={() => setStep(2)} disabled={!direccionId}
            className="bg-primary-600 text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed">
            Continuar
          </button>
        </div>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Método de Envío</h2>
          {metodos.length > 0 ? (
            <div className="space-y-3 mb-4">
              {metodos.map((m: any) => (
                <label key={m.id} className={`block border rounded p-4 cursor-pointer transition-colors ${
                  envioId === m.id ? 'border-primary-600 bg-primary-50' : 'hover:border-gray-400'
                }`}>
                  <input type="radio" name="envio" value={m.id}
                    checked={envioId === m.id}
                    onChange={(e) => setEnvioId(e.target.value)} className="mr-2" />
                  <span className="font-semibold">{m.nombre}</span>
                  <span className="text-gray-500 ml-2">({m.tiempo_estimado})</span>
                  <span className="float-right font-bold">S/ {Number(m.precio).toFixed(2)}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-4">No hay métodos de envío disponibles.</p>
          )}
          <div className="flex gap-4 mt-4">
            <button onClick={() => setStep(1)} className="border px-6 py-2 rounded">Atrás</button>
            <button onClick={() => setStep(3)} disabled={!envioId}
              className="bg-primary-600 text-white px-6 py-2 rounded disabled:opacity-50">
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Paso 3 */}
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
            <label className="block text-sm mb-1">Cupón (opcional)</label>
            <input type="text" value={cupon} onChange={(e) => setCupon(e.target.value)}
              className="border rounded px-3 py-2 w-full" placeholder="Ej: DESCUENTO50" />
          </div>
          <div className="text-right mb-4">
            <p className="text-2xl font-bold">Total: S/ {getTotal().toFixed(2)}</p>
          </div>
          {checkoutMutation.isPending ? <LoadingSpinner /> : (
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