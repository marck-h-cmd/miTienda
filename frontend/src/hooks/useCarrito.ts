import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { carritoService } from '@/services/carrito.service';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

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

  const { data: carrito, isLoading, error, refetch } = useQuery({
    queryKey: ['carrito', isAuthenticated, sessionId],
    queryFn: () => carritoService.obtener(sessionId),
    enabled: true, // Siempre habilitado, con o sin autenticación
    staleTime: 30000, // 30 segundos
    refetchOnMount: true,
  });

  // Sincronizar carrito con store
  useEffect(() => {
    if (carrito?.ord_items_carrito) {
      const items = carrito.ord_items_carrito.map((item: any) => ({
        id: item.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio: item.precio_unitario,
        producto: {
          id: item.cat_productos?.id,
          nombre: item.cat_productos?.nombre,
          imagen: item.cat_productos?.cat_imagenes_producto?.[0]?.url,
          stock: item.cat_productos?.inv_stock_producto?.[0]?.cantidad_fisica ?? 0,
        },
      }));
      
      setItems(items);
      console.log('Carrito sincronizado:', items);
    }
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
