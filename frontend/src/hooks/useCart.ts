import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { carritoService } from '@/services/carrito.service';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { ICarrito } from '@/types/index';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function useCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { setItems, items, getItemCount, getTotal } = useCartStore();

  // Generar/obtener sessionId para usuarios no autenticados
  const sessionId = typeof window !== 'undefined' 
    ? localStorage.getItem('sessionId') || (() => {
        const id = `session_${Date.now()}_${Math.random()}`;
        localStorage.setItem('sessionId', id);
        return id;
      })()
    : undefined;

  const { data: carrito, isLoading, refetch } = useQuery<ICarrito | null>({
    queryKey: ['carrito', isAuthenticated, sessionId],
    queryFn: () => carritoService.obtener(sessionId),
    enabled: true, // Siempre habilitado
    staleTime: 30000,
  });

  // Sincronizar carrito del servidor con el store local
  useEffect(() => {
    console.log('Carrito del servidor:', carrito);
    if (carrito?.ord_items_carrito && carrito.ord_items_carrito.length > 0) {
      setItems(carrito.ord_items_carrito);
    }
  }, [carrito, setItems]);

  const agregarMutation = useMutation({
    mutationFn: carritoService.agregar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrito'] });
      toast.success('Producto agregado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al agregar');
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: carritoService.eliminarItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrito'] });
      toast.success('Producto eliminado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ itemId, cantidad }: { itemId: string; cantidad: number }) =>
      carritoService.actualizarItem(itemId, cantidad),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrito'] });
      toast.success('Cantidad actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    },
  });

  return {
    carrito,
    items,
    isLoading,
    itemCount: getItemCount(),
    total: getTotal(),
    agregar: agregarMutation.mutate,
    eliminar: eliminarMutation.mutate,
    actualizar: actualizarMutation.mutate,
  };
}