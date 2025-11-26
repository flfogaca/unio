import { create } from 'zustand';
import apiClient from '@/lib/api';
import { User } from '@/shared/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: { email: string; password: string }) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.login(credentials);

      if (response.success && response.data) {
        const token = (response.data as { token?: string }).token;
        if (token) {
          apiClient.setToken(token);
        }

        const profileResponse = await apiClient.getProfile();
        if (profileResponse.success && profileResponse.data) {
          set({
            user: profileResponse.data as User,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao fazer login';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
    } catch {
      void 0;
    } finally {
      apiClient.clearToken();
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  updateUser: updates =>
    set(state => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const isValid = await apiClient.validateExternalToken(token);

      if (isValid) {
        const localToken = localStorage.getItem('token');
        if (localToken) {
          const profileResponse = await apiClient.getProfile();
          if (profileResponse.success && profileResponse.data) {
            set({
              user: profileResponse.data as User,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } else {
          set({
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else {
        apiClient.clearToken();
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } catch {
      apiClient.clearToken();
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  // Função para recuperar dados do usuário quando necessário
  refreshUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        set({ user: response.data as User });
      }
    } catch {
      void 0;
    }
  },
}));
