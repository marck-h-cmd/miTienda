import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ICarritoItem } from '@/types';

interface CartState {
  items: ICarritoItem[];
  isOpen: boolean;
  couponCode: string | null;
  discount: number;
  setItems: (items: ICarritoItem[]) => void;
  addItem: (item: ICarritoItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCoupon: (code: string | null, discount: number) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      discount: 0,
      
      setItems: (items) => set({ items }),
      
      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find((i) => i.producto_id === newItem.producto_id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.producto_id === newItem.producto_id
                  ? { ...i, cantidad: i.cantidad + newItem.cantidad }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),
      
      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),
      
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === itemId ? { ...i, cantidad: Math.max(0, quantity) } : i))
            .filter((i) => i.cantidad > 0),
        })),
      
      clearCart: () => set({ items: [], couponCode: null, discount: 0 }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      setCoupon: (code, discount) => set({ couponCode: code, discount }),
      
      getTotal: () => {
        const { items, discount } = get();
        const subtotal = items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0);
        return subtotal - discount;
      },
      
      getItemCount: () => get().items.reduce((sum, item) => sum + item.cantidad, 0),
    }),
    { name: 'cart-storage' }
  )
);