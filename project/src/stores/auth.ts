import { create } from 'zustand';
import apiClient from '@/lib/api';
import { User, UserRole } from '@/shared/types';

function mapExternalRoleToInternal(perfilId: number | undefined): UserRole {
  if (!perfilId) return UserRole.PACIENTE;

  const roleMap: Record<number, UserRole> = {
    1: UserRole.PACIENTE,
    2: UserRole.DENTISTA,
    3: UserRole.PSICOLOGO,
    4: UserRole.MEDICO,
    5: UserRole.ADMIN,
  };

  return roleMap[perfilId] || UserRole.PACIENTE;
}

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

      const parts = token.split('.');
      if (parts.length !== 3) {
        apiClient.clearToken();
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
        return;
      }

      try {
        const payload = JSON.parse(atob(parts[1])) as { exp?: number };
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);

        if (exp && exp < now) {
          apiClient.clearToken();
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
          return;
        }
      } catch {
        apiClient.clearToken();
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
        return;
      }

      const validationResult = await apiClient.validateExternalToken(token);

      if (validationResult.valid && validationResult.userData) {
        const externalUser = validationResult.userData;

        const mappedUser: User = {
          id: String(externalUser.id || externalUser.Id || ''),
          name: externalUser.nome || externalUser.name || '',
          email: externalUser.email || '',
          role: mapExternalRoleToInternal(
            externalUser.perfilId || externalUser.PerfilId
          ),
          cpf: externalUser.cpf || '',
          phone: externalUser.telefone || externalUser.phone || '',
        };

        set({
          user: mappedUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } catch {
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
