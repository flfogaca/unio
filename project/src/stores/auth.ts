import { create } from 'zustand'
import apiClient from '@/lib/api'

export type UserRole = 'paciente' | 'dentista' | 'psicologo' | 'medico' | 'admin'

interface User {
  id: string
  name: string
  email: string
  cpf: string
  role: UserRole
  avatar?: string
  isOnline?: boolean
  cro?: string
  specialties?: string[]
  phone?: string
  birthDate?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await apiClient.login(credentials)
      console.log('Login response:', response)
      
      if (response.success) {
        const { user, token } = response.data as { user: User; token: string }
        console.log('Token received:', token ? 'Present' : 'Missing')
        console.log('Token value:', token)
        
        if (token) {
          apiClient.setToken(token)
          console.log('Token stored in localStorage')
        } else {
          console.error('No token in response!')
        }
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        })
      } else {
        set({ 
          error: response.message || 'Erro ao fazer login', 
          isLoading: false 
        })
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Erro ao fazer login', 
        isLoading: false 
      })
      throw error
    }
  },

  logout: async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      apiClient.clearToken()
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      })
    }
  },

  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false })
      return
    }

    try {
      set({ isLoading: true })
      const response = await apiClient.getProfile()
      
      if (response.success && response.data) {
        set({ 
          user: response.data as User, 
          isAuthenticated: true, 
          isLoading: false 
        })
      } else {
        // Se a resposta não foi bem-sucedida, mas temos token, tentar manter a sessão
        console.warn('Profile check failed, but keeping session with token')
        set({ 
          isAuthenticated: true, 
          user: null, // Será preenchido quando necessário
          isLoading: false 
        })
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      // Em caso de erro de rede, manter a sessão se temos token
      if (token) {
        console.warn('Network error during auth check, keeping session')
        set({ 
          isAuthenticated: true, 
          user: null,
          isLoading: false 
        })
      } else {
        apiClient.clearToken()
        set({ 
          isAuthenticated: false, 
          user: null, 
          isLoading: false 
        })
      }
    }
  },

  clearError: () => set({ error: null }),

  // Função para recuperar dados do usuário quando necessário
  refreshUser: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await apiClient.getProfile()
      if (response.success && response.data) {
        set({ user: response.data as User })
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }
}))