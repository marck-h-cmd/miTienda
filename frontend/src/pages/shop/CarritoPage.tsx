import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/stores/cartStore';
import CartItem from '@/components/carrito/CartItem';
import CartSummary from '@/components/carrito/CartSummary';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ShoppingCart } from 'lucide-react';

export default function CarritoPage() {
  const { items, isLoading, total, actualizar, eliminar } = useCart();
  const { setCoupon, discount, couponCode } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0);

  if (isLoading) return <LoadingSpinner />;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Tu carrito está vacío"
          description="Agrega productos desde nuestro catálogo"
          actionLabel="Ver Catálogo"
          actionLink="/catalogo"
          icon={<ShoppingCart size={64} className="text-gray-300" />}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de items */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">{items.length} producto(s)</p>
            <Link to="/catalogo" className="text-primary-600 hover:underline text-sm">
              Seguir comprando
            </Link>
          </div>

          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={(quantity) => actualizar({ itemId: item.id, cantidad: Number(quantity) })}
              onRemove={() => eliminar(item.id)}
            />
          ))}
        </div>

        {/* Resumen */}
          <CartSummary
            subtotal={subtotal}
            itemCount={items.reduce((sum, i) => sum + i.cantidad, 0)}
            discount={discount}
            couponCode={couponCode || undefined}
            onApplyCoupon={(code) => {
              // Simular cupón
              if (code === 'BIENVENIDO10') {
                setCoupon(code, subtotal * 0.1);
              } else if (code === 'DESCUENTO50') {
                setCoupon(code, 50);
              }
            }}
            onCheckout={() => window.location.href = '/checkout'}
          />
        </div>
      </div>

  );
}