import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoritosService } from '@/services/favoritos.service';
import { useFavoritosStore } from '@/stores/favoritosStore';
import { useAuthStore } from '@/stores/authStore';
import { IListaDeseos } from '@/types';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function useFavoritos() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { setItems, items, isFavorito } = useFavoritosStore();

  const { data: lista, isLoading } = useQuery<IListaDeseos | null>({
    queryKey: ['favoritos'],
    queryFn: favoritosService.obtener,
    enabled: isAuthenticated, // Solo si está autenticado
    staleTime: 60000,
  });

  useEffect(() => {
    if (lista === undefined) return;
    if (lista === null) {
      setItems([]);
      return;
    }
    setItems(lista.cli_items_lista_deseos ?? []);
  }, [lista, setItems]);

  const agregarMutation = useMutation({
    mutationFn: favoritosService.agregar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] });
      toast.success('Agregado a favoritos');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message;
      // Evitar mostrar error si ya estaba en favoritos (puede manejarse silenciosamente)
      if (msg !== 'El producto ya está en favoritos') {
        toast.error(msg || 'Error al agregar a favoritos');
      }
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: favoritosService.eliminar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] });
      toast.success('Eliminado de favoritos');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar de favoritos');
    },
  });

  const toggleFavorito = (productoId: string) => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para guardar favoritos');
      return;
    }
    if (isFavorito(productoId)) {
      eliminarMutation.mutate(productoId);
    } else {
      agregarMutation.mutate(productoId);
    }
  };

  return {
    lista,
    items,
    isLoading,
    isFavorito,
    toggleFavorito,
    agregar: agregarMutation.mutate,
    eliminar: eliminarMutation.mutate,
    isToggling: agregarMutation.isPending || eliminarMutation.isPending,
  };
}