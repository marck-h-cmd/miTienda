import { create } from 'zustand';
import { IItemListaDeseos } from '@/types';

interface FavoritosState {
  items: IItemListaDeseos[];
  setItems: (items: IItemListaDeseos[]) => void;
  isFavorito: (productoId: string) => boolean;
  clearFavoritos: () => void;
}

export const useFavoritosStore = create<FavoritosState>()((set, get) => ({
  items: [],

  setItems: (items) => set({ items }),

  isFavorito: (productoId) =>
    get().items.some((item) => item.producto_id === productoId),

  clearFavoritos: () => set({ items: [] }),
}));