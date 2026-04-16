import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ADMIN' | 'MANAGER' | 'CLIENT';

export interface User {
  id: string | number;
  email: string;
  role: UserRole;
  name?: string;
  onboardingStatus?: 'PENDING_ONBOARDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
