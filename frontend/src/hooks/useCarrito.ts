import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { carritoService } from '@/services/carrito.service';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { ICarrito } from '@/types';

export function useCarrito() {
  const { isAuthenticated } = useAuthStore();
  const { setItems } = useCartStore();
  const queryClient = useQueryClient();

  // Generar un session ID si no está autenticado
  const sessionId = typeof window !== 'undefined' 
    ? localStorage.getItem('sessionId') || (() => {
        const id = `session_${Date.now()}_${Math.random()}`;
        localStorage.setItem('sessionId', id);
        return id;
      })()
    : undefined;

  const { data: carrito, isLoading, error, refetch } = useQuery<ICarrito | null>({
    queryKey: ['carrito', isAuthenticated, sessionId],
    queryFn: () => carritoService.obtener(sessionId),
    enabled: true, // Siempre habilitado, con o sin autenticación
    staleTime: 30000, // 30 segundos
    refetchOnMount: true,
  });

  // Sincronizar carrito con store
  useEffect(() => {
    if (carrito === undefined) return;
    if (carrito === null) {
      setItems([]);
      return;
    }

    const items = (carrito.ord_items_carrito ?? []).map((item: any) => ({
        id: item.id,
        carrito_id: item.carrito_id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: Number(item.precio_unitario ?? 0),
        cat_productos: item.cat_productos,
      }));
      
    setItems(items);
  }, [carrito, setItems]);

  const invalidateCarrito = () => {
    queryClient.invalidateQueries({ queryKey: ['carrito'] });
  };

  return {
    carrito,
    isLoading,
    error,
    refetch,
    invalidateCarrito,
    sessionId,
  };
}
