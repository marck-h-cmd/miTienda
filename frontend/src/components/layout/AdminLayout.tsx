import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Role } from '@/types';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AdminLayout() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}