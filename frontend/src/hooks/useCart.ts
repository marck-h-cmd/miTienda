import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { carritoService } from '@/services/carrito.service';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { ICarrito } from '@/types/index';

import toast from 'react-hot-toast';

export function useCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { setItems, items, getItemCount, getTotal } = useCartStore();

  const { data: carrito, isLoading } =  useQuery<ICarrito | null>({
    queryKey: ['carrito'],
    queryFn: () => carritoService.obtener(),
    enabled: isAuthenticated,
    initialData: {},
    placeholderData: {},
    select: (data) => data || {},
    onSuccess: (data: ICarrito | null | undefined) => {
      if (data?.ord_items_carrito) {
        setItems(data.ord_items_carrito);
      }
    },
  });

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