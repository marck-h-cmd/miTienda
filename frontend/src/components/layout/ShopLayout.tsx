import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/carrito/CartDrawer';
import { useCart } from '@/hooks/useCart';

export default function ShopLayout() {
  // Cargar carrito al montar el layout
  useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}