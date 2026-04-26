import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Role } from '@/types';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ClipboardList,
  Users,
  FileText,
  BarChart3,
  Warehouse,
} from 'lucide-react';

const adminMenuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [Role.ADMINISTRADOR, Role.GERENTE_VENTAS, Role.GERENTE_INVENTARIO, Role.VENDEDOR] },
  { path: '/admin/productos', label: 'Productos', icon: Package, roles: [Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO, Role.VENDEDOR] },
  { path: '/admin/ordenes', label: 'Órdenes', icon: ShoppingBag, roles: [Role.ADMINISTRADOR, Role.GERENTE_VENTAS, Role.VENDEDOR] },
  { path: '/admin/inventario', label: 'Inventario', icon: Warehouse, roles: [Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO] },
  { path: '/admin/clientes', label: 'Clientes', icon: Users, roles: [Role.ADMINISTRADOR, Role.GERENTE_VENTAS, Role.VENDEDOR] },
  { path: '/admin/reportes', label: 'Reportes', icon: FileText, roles: [Role.ADMINISTRADOR, Role.GERENTE_VENTAS, Role.GERENTE_INVENTARIO] },
  { path: '/admin/estadisticas', label: 'Estadísticas', icon: BarChart3, roles: [Role.ADMINISTRADOR, Role.GERENTE_VENTAS] },
];

export default function Sidebar() {
  const { hasRole } = useAuthStore();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r overflow-y-auto">
      <nav className="p-4 space-y-1">
        {adminMenuItems
          .filter((item) => hasRole(item.roles))
          .map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
}