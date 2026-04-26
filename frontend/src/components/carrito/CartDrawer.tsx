import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';

export default function CartDrawer() {
  const { isOpen, toggleCart, items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { actualizar, eliminar, total } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={toggleCart} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <h2 className="text-lg font-semibold">Carrito ({items.length})</h2>
          </div>
          <button onClick={toggleCart} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 border-b pb-4">
                  <img
                    src={
                      item.cat_productos?.cat_imagenes_producto?.[0]?.url ||
                      item.producto?.imagen ||
                      '/placeholder.png'
                    }
                    alt={item.cat_productos?.nombre || item.producto?.nombre || 'Producto'}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold line-clamp-2">
                      {item.cat_productos?.nombre || item.producto?.nombre}
                    </h4>
                    <p className="text-primary-600 font-bold mt-1">
                      {formatCurrency(item.precio_unitario || item.precio || 0)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => actualizar({ itemId: item.id, cantidad: Math.max(1, item.cantidad - 1) })}
                        className="p-1 border rounded hover:bg-gray-100"
                        disabled={item.cantidad <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.cantidad}</span>
                      <button
                        onClick={() => actualizar({ itemId: item.id, cantidad: item.cantidad + 1 })}
                        className="p-1 border rounded hover:bg-gray-100"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => eliminar(item.id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary-600">{formatCurrency(total)}</span>
            </div>
            {isAuthenticated ? (
              <button
                onClick={() => { toggleCart(); navigate('/checkout'); }}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                Ir al Checkout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={toggleCart}
                className="block text-center w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                Iniciar Sesión para Comprar
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}