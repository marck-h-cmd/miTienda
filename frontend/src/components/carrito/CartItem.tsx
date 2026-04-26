import { ICarritoItem } from '@/types';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CartItemProps {
  item: ICarritoItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const imagen = item.cat_productos?.cat_imagenes_producto?.[0]?.url || '/placeholder.png';
  const nombre = item.cat_productos?.nombre || 'Producto';
  const stock = item.cat_productos?.inv_stock_producto?.[0]?.cantidad_fisica ?? 0;

  return (
    <div className="flex gap-4 p-4 border rounded-lg bg-white hover:shadow-sm transition">
      {/* Imagen */}
      <img
        src={imagen}
        alt={nombre}
        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm line-clamp-2">{nombre}</h4>
        
        {item.cat_productos?.cat_producto_atributo && item.cat_productos.cat_producto_atributo.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {item.cat_productos.cat_producto_atributo
              .map((attr) => attr.cat_valores_atributo?.valor)
              .filter(Boolean)
              .join(' - ')}
          </p>
        )}

        <p className="text-primary-600 font-bold mt-1">
          {formatCurrency(item.precio_unitario)}
        </p>

        {stock > 0 && stock <= 5 && (
          <p className="text-orange-500 text-xs mt-1">¡Solo quedan {stock}!</p>
        )}

        {/* Controles de cantidad */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
              disabled={item.cantidad <= 1}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 rounded-l-lg"
            >
              <Minus size={16} />
            </button>
            <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
              {item.cantidad}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
              disabled={item.cantidad >= stock}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 rounded-r-lg"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm text-gray-500">Subtotal</p>
        <p className="font-bold text-primary-600">
          {formatCurrency(item.precio_unitario * item.cantidad)}
        </p>
      </div>
    </div>
  );
}