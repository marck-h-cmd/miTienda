import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from '@/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: IUser | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: IUser) => void;
  hasRole: (roles: string[]) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      
      setUser: (user) => set({ user }),
      
      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;
        return roles.some((role) => user.roles.includes(role));
      },
      
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'auth-storage' }
  )
);