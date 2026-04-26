import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { ordenService } from '@/services/orden.service';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Tipado mínimo para el SDK global de MP
declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function Checkout() {
  const [step, setStep]               = useState(1);
  const [direccionId, setDireccionId] = useState('');
  const [envioId, setEnvioId]         = useState('');
  const [cupon, setCupon]             = useState('');
  const [mpLoaded, setMpLoaded]       = useState(false);
  const [isOpeningMP, setIsOpeningMP] = useState(false);

  const navigate                       = useNavigate();
  const queryClient                    = useQueryClient();
  const { items, getTotal, clearCart } = useCartStore();
  const accessToken                    = useAuthStore((s) => s.accessToken);

  // ── Cargar SDK de Mercado Pago dinámicamente ──────────────────────────────
  useEffect(() => {
    if (window.MercadoPago) { setMpLoaded(true); return; }

    const script = document.createElement('script');
    script.src   = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload  = () => setMpLoaded(true);
    script.onerror = () => toast.error('Error al cargar el sistema de pagos');
    document.head.appendChild(script);

    return () => {
      const s = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
      s?.remove();
    };
  }, []);

  // ── Opciones de envío ─────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ['opciones-envio'],
    queryFn: async () => {
      const { data } = await api.get('/ordenes/opciones-envio');
      const payload    = data?.data ?? data;
      const direcciones = Array.isArray(payload?.direcciones) ? payload.direcciones : [];
      const metodos     = Array.isArray(payload?.metodos)     ? payload.metodos     : [];
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

  // ── Mutation: crea la orden en backend y devuelve preferenceId ────────────
  const checkoutMutation = useMutation({
    mutationFn: () =>
      ordenService.iniciarCheckout({
        direccionEnvioId: direccionId,
        metodoEnvioId:    envioId,
        cuponCodigo:      cupon || undefined,
      }),
    onSuccess: (res) => {
      // res.initPoint  → URL completa (fallback)
      // res.preferenceId → para el modal SDK  (asegúrate de devolverlo en el backend)
      const preferenceId = (res as any).preferenceId ?? null;

      queryClient.setQueriesData({ queryKey: ['carrito'] }, (oldData: any) => {
        if (oldData === undefined) return oldData;
        if (oldData === null) return oldData;
        if (typeof oldData !== 'object') return oldData;
        return { ...oldData, ord_items_carrito: [] };
      });
      queryClient.invalidateQueries({ queryKey: ['carrito'] });

      if (!mpLoaded || !preferenceId) {
        // Fallback: redirección clásica si no hay SDK o preferenceId
        clearCart();
        setIsOpeningMP(false);
        window.location.href = res.initPoint;
        return;
      }

      try {
        const mp = new window.MercadoPago(
          import.meta.env.VITE_MP_PUBLIC_KEY,
          { locale: 'es-PE' }
        );

        mp.checkout({
          preference: { id: preferenceId },
          autoOpen: true,
          renderMode: 'modal',
        });

        clearCart();
        toast.success('Ventana de pago abierta');
      } catch (err) {
        // Fallback a redirección si el modal falla
        clearCart();
        setIsOpeningMP(false);
        window.location.href = res.initPoint;
      } finally {
        setIsOpeningMP(false);
      }
    },
    onError: (err: any) => {
      setIsOpeningMP(false);
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Error en checkout');
    },
  });

  const handlePagar = () => {
    if (!mpLoaded) {
      toast.error('El sistema de pagos aún no está listo, espera un momento');
      return;
    }
    setIsOpeningMP(true);
    checkoutMutation.mutate();
  };

  if (items.length === 0) { navigate('/carrito'); return null; }
  if (isLoading) return <LoadingSpinner />;

  const steps = ['Dirección de Envío', 'Método de Envío', 'Resumen y Pago'];
  const isBusy = checkoutMutation.isPending || isOpeningMP;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 text-center">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${
              step > i+1 ? 'bg-green-500 text-white'
              : step === i+1 ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-500'
            }`}>
              {step > i+1 ? '✓' : i+1}
            </div>
            <p className="text-xs mt-1 text-gray-600">{s}</p>
          </div>
        ))}
      </div>

      {/* ── Paso 1: Dirección ───────────────────────────────────────────────── */}
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
                    onChange={(e) => setDireccionId(e.target.value)}
                    className="mr-2" />
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

      {/* ── Paso 2: Método de envío ─────────────────────────────────────────── */}
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
                    onChange={(e) => setEnvioId(e.target.value)}
                    className="mr-2" />
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

      {/* ── Paso 3: Resumen y pago ──────────────────────────────────────────── */}
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

          <div className="text-right mb-6">
            <p className="text-2xl font-bold">Total: S/ {getTotal().toFixed(2)}</p>
          </div>

          {isBusy ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <LoadingSpinner />
              <p className="text-sm text-gray-500">
                {checkoutMutation.isPending ? 'Creando orden...' : 'Abriendo ventana de pago...'}
              </p>
            </div>
          ) : (
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="border px-6 py-2 rounded">
                Atrás
              </button>
              <button
                onClick={handlePagar}
                disabled={!mpLoaded}
                className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {/* Logo MP inline para no depender de assets externos */}
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#009EE3"/>
                  <path d="M8 16.5c0-4.14 3.36-7.5 7.5-7.5 2.07 0 3.95.84 5.31 2.19l1.44-1.44A9.44 9.44 0 0015.5 7C10.25 7 6 11.25 6 16.5S10.25 26 15.5 26a9.44 9.44 0 008.25-4.75l-1.44-1.44A7.46 7.46 0 0115.5 24C11.36 24 8 20.64 8 16.5z" fill="white"/>
                  <path d="M22 13h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2z" fill="white"/>
                </svg>
                Pagar con Mercado Pago
              </button>
            </div>
          )}

          {!mpLoaded && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Cargando sistema de pagos...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
