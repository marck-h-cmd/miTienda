import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Role } from '@/types';

// Layouts
import ShopLayout from '@/components/layout/ShopLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Shop Pages
import Home from '@/pages/shop/Home';
import Catalogo from '@/pages/shop/Catalogo';
import ProductoDetalle from '@/pages/shop/ProductoDetalle';
import CarritoPage from '@/pages/shop/CarritoPage';
import Checkout from '@/pages/shop/Checkout';
import MisOrdenes from '@/pages/shop/MisOrdenes';
import OrdenDetalle from '@/pages/shop/OrdenDetalle';
import Perfil from '@/pages/shop/Perfil';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import RecuperarPassword from '@/pages/auth/RecuperarPassword';

// Admin Pages
import Dashboard from '@/pages/admin/Dashboard';
import ProductosAdmin from '@/pages/admin/ProductosAdmin';
import ProductoFormPage from '@/pages/admin/ProductoFormPage';
import OrdenesAdmin from '@/pages/admin/OrdenesAdmin';
import OrdenEditPage from '@/pages/admin/OrdenEditPage';
import InventarioAdmin from '@/pages/admin/InventarioAdmin';
import ClientesAdmin from '@/pages/admin/ClientesAdmin';
import Reportes from '@/pages/admin/Reportes';
import Estadisticas from '@/pages/admin/Estadisticas';

import CheckoutExito    from '@/pages/checkout/CheckoutExito';
import CheckoutFallo    from '@/pages/checkout/CheckoutFallo';
import CheckoutPendiente from '@/pages/checkout/CheckoutPendiente';
import Favoritos from '@/pages/shop/Favoritos';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Tienda */}
      <Route element={<ShopLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/producto/:id" element={<ProductoDetalle  />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />

        {/* Checkout Result Pages - Públicas (sin autenticación) */}
        <Route path="/checkout/exito" element={<CheckoutExito />} />
        <Route path="/checkout/fallo" element={<CheckoutFallo />} />
        <Route path="/checkout/pendiente" element={<CheckoutPendiente />} />
        
        {/* Rutas protegidas cliente */}
        <Route element={<ProtectedRoute roles={[Role.CLIENTE]} />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-ordenes" element={<MisOrdenes />} />
          <Route path="/orden/:id" element={<OrdenDetalle />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route
        element={
          <ProtectedRoute
            roles={[Role.ADMINISTRADOR, Role.GERENTE_VENTAS, Role.GERENTE_INVENTARIO, Role.VENDEDOR]}
          />
        }
      >
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/productos" element={<ProductosAdmin />} />
          <Route
            path="/admin/productos/nuevo"
            element={
              <ProtectedRoute roles={[Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO]}>
                <ProductoFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/productos/:id/editar"
            element={
              <ProtectedRoute roles={[Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO]}>
                <ProductoFormPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/ordenes" element={<OrdenesAdmin />} />
          <Route path="/admin/ordenes/:id/editar" element={<OrdenEditPage />} />
          <Route path="/admin/inventario" element={<InventarioAdmin />} />
          <Route path="/admin/clientes" element={<ClientesAdmin />} />
          <Route path="/admin/reportes" element={<Reportes />} />
          <Route path="/admin/estadisticas" element={<Estadisticas />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}