import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useCartStore } from '@/stores/cartStore';
import { carritoService } from '@/services/carrito.service';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { IProducto } from '@/types';
import toast from 'react-hot-toast';

export default function Favoritos() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, isLoading, eliminar, isToggling } = useFavoritos();
  const { setItems: setCartItems, toggleCart } = useCartStore();

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleAgregarCarrito = async (producto: IProducto) => {
    try {
      const carritoActualizado = await carritoService.agregar({
        producto_id: producto.id,
        cantidad: 1,
      });
      setCartItems(carritoActualizado?.ord_items_carrito ?? []);
      toast.success('Producto agregado al carrito');
      toggleCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al agregar al carrito');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Heart size={28} className="text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold">Mis Favoritos</h1>
        {items.length > 0 && (
          <span className="ml-auto text-gray-500 text-sm">{items.length} producto{items.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyFavoritos />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const producto = item.cat_productos;
            if (!producto) return null;

            const imagenPrincipal =
              producto.cat_imagenes_producto?.find((img) => img.es_principal)?.url ||
              producto.cat_imagenes_producto?.[0]?.url ||
              '/placeholder.png';

            const precio = producto.precio_oferta || producto.precio_venta;
            const tieneOferta = !!producto.precio_oferta;
            const stock = producto.inv_stock_producto?.[0]?.cantidad_fisica ?? 0;

            return (
              <div key={item.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition group bg-white">
                {/* Imagen */}
                <div className="relative">
                  <img
                    src={imagenPrincipal}
                    alt={producto.nombre}
                    onClick={() => navigate(`/producto/${producto.id}`)}
                    className="w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition"
                  />
                  {tieneOferta && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      OFERTA
                    </span>
                  )}
                  {/* Botón eliminar de favoritos */}
                  <button
                    onClick={() => eliminar(producto.id)}
                    disabled={isToggling}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-red-50 transition disabled:opacity-50"
                    title="Quitar de favoritos"
                  >
                    <Trash2 size={16} className="text-red-400 hover:text-red-600" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {producto.cat_categorias?.nombre}
                  </p>
                  <h3
                    onClick={() => navigate(`/producto/${producto.id}`)}
                    className="font-semibold mt-1 truncate cursor-pointer hover:text-primary-600"
                  >
                    {producto.nombre}
                  </h3>

                  <div className="flex items-end gap-2 mt-2">
                    {tieneOferta && (
                      <span className="text-xs text-gray-400 line-through">S/ {producto.precio_venta}</span>
                    )}
                    <span className="text-lg font-bold text-primary-600">S/ {precio}</span>
                  </div>

                  {stock === 0 ? (
                    <p className="text-red-500 text-xs mt-1">Agotado</p>
                  ) : (
                    <p className="text-gray-400 text-xs mt-1">Stock: {stock}</p>
                  )}

                  <button
                    onClick={() => handleAgregarCarrito(producto)}
                    disabled={stock === 0}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ShoppingCart size={16} />
                    {stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyFavoritos() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Heart size={64} className="text-gray-200 mb-4" />
      <h2 className="text-xl font-semibold text-gray-600 mb-2">No tienes favoritos aún</h2>
      <p className="text-gray-400 mb-6">
        Guarda los productos que te gusten para encontrarlos fácilmente después.
      </p>
      <button
        onClick={() => navigate('/catalogo')}
        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
      >
        Explorar Catálogo
      </button>
    </div>
  );
}