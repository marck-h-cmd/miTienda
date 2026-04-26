import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { IProducto } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { carritoService } from '@/services/carrito.service';
import toast from 'react-hot-toast';

interface ProductCardProps {
  producto: IProducto;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ producto, viewMode = 'grid' }: ProductCardProps) {
  const { setItems, toggleCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const imagenPrincipal =
    producto.cat_imagenes_producto?.find((img) => img.es_principal)?.url ||
    producto.cat_imagenes_producto?.[0]?.url ||
    '/placeholder.png';

  const stock = producto.inv_stock_producto?.[0]?.cantidad_fisica ?? 0;
  const precio = producto.precio_oferta || producto.precio_venta;
  const tieneOferta = !!producto.precio_oferta;

  const handleAgregarCarrito = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Inicia sesión para agregar al carrito');
      return;
    }

    try {
      // Llama a la API — devuelve el carrito actualizado completo
      const carritoActualizado = await carritoService.agregar({
        producto_id: producto.id,
        cantidad: 1,
      });

      // Sincroniza el store con los items reales de la DB
      const items = carritoActualizado?.ord_items_carrito ?? [];
      setItems(items);

      toast.success('Producto agregado al carrito');
      toggleCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al agregar al carrito');
    }
  };

  if (viewMode === 'list') {
    return (
      <Link
        to={`/producto/${producto.id}`}
        className="flex border rounded-lg p-4 hover:shadow-md transition gap-4"
      >
        <img
          src={imagenPrincipal}
          alt={producto.nombre}
          className="w-32 h-32 object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{producto.nombre}</h3>
          <p className="text-gray-600 text-sm">{producto.descripcion_corta}</p>
          <div className="flex items-center gap-2 mt-2">
            {tieneOferta && (
              <span className="text-sm text-gray-400 line-through">
                S/ {producto.precio_venta}
              </span>
            )}
            <span className="text-xl font-bold text-primary-600">S/ {precio}</span>
          </div>
          <button
            onClick={handleAgregarCarrito}
            disabled={stock === 0}
            className="mt-2 bg-primary-600 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
          >
            {stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/producto/${producto.id}`}
      className="border rounded-lg overflow-hidden hover:shadow-lg transition group"
    >
      <div className="relative">
        <img
          src={imagenPrincipal}
          alt={producto.nombre}
          className="w-full h-48 object-cover group-hover:scale-105 transition"
        />
        {tieneOferta && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            OFERTA
          </span>
        )}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
        >
          <Heart size={18} className="text-gray-400 hover:text-red-500" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase">{producto.cat_categorias?.nombre}</p>
        <p className="text-sm text-gray-600 mt-1">Stock: {stock}</p>
        <h3 className="font-semibold mt-1 truncate">{producto.nombre}</h3>
        {tieneOferta && (
          <span className="text-xs text-gray-400 line-through">S/ {producto.precio_venta}</span>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-primary-600">S/ {precio}</span>
          <button
            onClick={handleAgregarCarrito}
            disabled={stock === 0}
            className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
        {stock === 0 && <p className="text-red-500 text-xs mt-1">Agotado</p>}
      </div>
    </Link>
  );
}