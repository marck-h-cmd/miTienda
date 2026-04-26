import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/lib/utils';
import { Tag } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  discount?: number;
  couponCode?: string;
  onApplyCoupon?: (code: string) => void;
  onCheckout?: () => void;
}

export default function CartSummary({
  subtotal,
  itemCount,
  discount = 0,
  couponCode,
  onApplyCoupon,
  onCheckout,
}: CartSummaryProps) {
  const [couponInput, setCouponInput] = useState('');
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const igv = (subtotal - discount) * 0.18;
  const total = subtotal - discount + igv;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    onCheckout?.();
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-6 sticky top-20">
      <h3 className="text-lg font-bold mb-4">Resumen del Pedido</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({itemCount} items)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento {couponCode && `(${couponCode})`}</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">IGV (18%)</span>
          <span>{formatCurrency(igv)}</span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Cupón */}
      {onApplyCoupon && (
        <div className="mt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-3 text-gray-400" />
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Código de cupón"
                className="pl-9 text-sm"
              />
            </div>
            <Button
              onClick={() => { onApplyCoupon(couponInput); setCouponInput(''); }}
              variant="outline"
              size="sm"
              disabled={!couponInput}
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}

      {/* Botón Checkout */}
      <Button
        onClick={handleCheckout}
        className="w-full mt-6"
        size="lg"
        disabled={itemCount === 0}
      >
        {isAuthenticated ? 'Proceder al Checkout' : 'Iniciar Sesión para Comprar'}
      </Button>

      {!isAuthenticated && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Necesitas iniciar sesión para completar tu compra
        </p>
      )}
    </div>
  );
}