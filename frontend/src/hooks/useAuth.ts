import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export function useAuth() {
  const { setTokens, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.usuario);
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Registro exitoso. Inicia sesión.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrarse');
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: () => {
      logout();
      navigate('/');
      toast.success('Sesión cerrada');
    },
  };
}