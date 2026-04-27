import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Settings, Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritosStore } from '@/stores/favoritosStore';

export default function Navbar() {
  const { isAuthenticated, user, hasRole, logout } = useAuthStore();
  const { getItemCount, toggleCart } = useCartStore();
  const { items: favItems } = useFavoritosStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            MiTienda
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-primary-600">Inicio</Link>
            <Link to="/catalogo" className="hover:text-primary-600">Catálogo</Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Favoritos — solo si está autenticado */}
            {isAuthenticated && (
              <Link to="/favoritos" className="relative p-2 hover:bg-gray-100 rounded-full" title="Mis Favoritos">
                <Heart size={22} />
                {favItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {favItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Carrito */}
            <button onClick={toggleCart} className="relative p-2 hover:bg-gray-100 rounded-full">
              <ShoppingCart size={22} />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm">{user?.nombre}</span>

                {hasRole(['ADMINISTRADOR', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO', 'VENDEDOR']) && (
                  <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full" title="Panel Admin">
                    <Settings size={20} />
                  </Link>
                )}

                <Link to="/mis-ordenes" className="p-2 hover:bg-gray-100 rounded-full" title="Mis Órdenes">
                  <Package size={20} />
                </Link>

                <Link to="/perfil" className="p-2 hover:bg-gray-100 rounded-full" title="Perfil">
                  <User size={20} />
                </Link>

                <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full" title="Cerrar Sesión">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}