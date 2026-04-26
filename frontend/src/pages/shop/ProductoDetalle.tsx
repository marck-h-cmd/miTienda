import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ShoppingCart, Heart, ChevronLeft, Star } from 'lucide-react';
import { productoService } from '@/services/producto.service';
import { carritoService } from '@/services/carrito.service';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cantidad, setCantidad] = useState(1);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const { toggleCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const { data: producto, isLoading } = useQuery({
    queryKey: ['producto', id],
    queryFn: () => productoService.obtener(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!producto) return <div className="text-center py-8">Producto no encontrado</div>;

  const stock = producto.inv_stock_producto?.[0]?.cantidad_fisica ?? 0;
  const precio = producto.precio_oferta || producto.precio_venta;
  const tieneOferta = !!producto.precio_oferta;
  const imagenes = producto.cat_imagenes_producto || [];
  const imagenActual = imagenes[imagenSeleccionada]?.url || '/placeholder.png';

  const handleAgregarCarrito = async () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para agregar al carrito');
      return;
    }

    try {
      await carritoService.agregar({ producto_id: producto.id, cantidad });
      toast.success(`${cantidad} producto(s) agregado(s) al carrito`);
      toggleCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al agregar al carrito');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ChevronLeft size={20} />
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imagenActual}
              alt={producto.nombre}
              className="w-full h-96 object-cover"
            />
          </div>
          {imagenes.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {imagenes.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImagenSeleccionada(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                    idx === imagenSeleccionada ? 'border-primary-600' : 'border-gray-200'
                  }`}
                >
                  <img src={img.url} alt={`${producto.nombre} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-gray-500 uppercase">{producto.cat_categorias?.nombre}</p>
            <h1 className="text-4xl font-bold mt-2">{producto.nombre}</h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(12 reseñas)</span>
            </div>
          </div>

          {/* Precios */}
          <div className="border-y py-4">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-primary-600">S/ {precio}</span>
              {tieneOferta && (
                <span className="text-lg text-gray-400 line-through">S/ {producto.precio_venta}</span>
              )}
              {tieneOferta && (
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                  -{Math.round(((producto.precio_venta - producto.precio_oferta!) / producto.precio_venta) * 100)}%
                </span>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              {stock > 0 ? (
                <span className="text-green-600 font-semibold">✓ {stock} en stock</span>
              ) : (
                <span className="text-red-600 font-semibold">Agotado</span>
              )}
            </p>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="font-semibold mb-2">Descripción</h2>
            <p className="text-gray-700">{producto.descripcion}</p>
          </div>

          {/* Controles de cantidad y agregar */}
          <div className="flex flex-col gap-4 border-t pt-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Cantidad:</span>
              <div className="flex items-center border rounded">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={stock}
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.min(stock, Math.max(1, Number(e.target.value))))}
                  className="w-12 text-center border-0 outline-none"
                />
                <button
                  onClick={() => setCantidad(Math.min(stock, cantidad + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAgregarCarrito}
                disabled={stock === 0}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                {stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Heart size={20} />
              </button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="border-t pt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">SKU</p>
              <p className="font-semibold">{producto.sku}</p>
            </div>
            <div>
              <p className="text-gray-500">Peso</p>
              <p className="font-semibold">-</p>
            </div>
            <div>
              <p className="text-gray-500">Marca</p>
              <p className="font-semibold">{producto.marca || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Código</p>
              <p className="font-semibold">{producto.codigo || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}