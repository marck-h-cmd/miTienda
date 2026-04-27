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

const getItemStock = (item: ICarritoItem): number | undefined =>
  item.cat_productos?.inv_stock_producto?.[0]?.cantidad_fisica;

const clampItemQuantityToStock = (item: ICarritoItem): ICarritoItem => {
  const stock = getItemStock(item);
  if (stock === undefined) return item;
  if (stock <= 0) return { ...item, cantidad: 0 };
  return { ...item, cantidad: Math.min(item.cantidad, stock) };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      discount: 0,
      
      setItems: (items) =>
        set({
          items: items
            .map(clampItemQuantityToStock)
            .filter((i) => i.cantidad > 0),
        }),
      
      addItem: (newItem) =>
        set((state) => {
          const stock = getItemStock(newItem);
          if (stock !== undefined && stock <= 0) return { items: state.items };

          const existing = state.items.find((i) => i.producto_id === newItem.producto_id);
          if (existing) {
            const maxStock = getItemStock(existing) ?? stock;
            const nuevaCantidad =
              maxStock === undefined
                ? existing.cantidad + newItem.cantidad
                : Math.min(existing.cantidad + newItem.cantidad, maxStock);
            if (nuevaCantidad <= 0) return { items: state.items.filter((i) => i.id !== existing.id) };

            return {
              items: state.items.map((i) =>
                i.producto_id === newItem.producto_id
                  ? { ...i, cantidad: nuevaCantidad }
                  : i
              ),
            };
          }
          const cantidadInicial =
            stock === undefined ? newItem.cantidad : Math.min(newItem.cantidad, stock);
          if (cantidadInicial <= 0) return { items: state.items };
          return { items: [...state.items, { ...newItem, cantidad: cantidadInicial }] };
        }),
      
      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),
      
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => {
              if (i.id !== itemId) return i;
              const stock = getItemStock(i);
              const safeQty =
                stock === undefined ? Math.max(0, quantity) : Math.max(0, Math.min(quantity, stock));
              return { ...i, cantidad: safeQty };
            })
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
