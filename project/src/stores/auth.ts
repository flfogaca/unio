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
  login: (credentials: { cpf: string; password: string }) => Promise<void>
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
      
      if (response.success) {
        const { user, token } = response.data
        apiClient.setToken(token)
        
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
      set({ isAuthenticated: false, user: null })
      return
    }

    try {
      set({ isLoading: true })
      const response = await apiClient.getProfile()
      
      if (response.success) {
        set({ 
          user: response.data, 
          isAuthenticated: true, 
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
    } catch (error) {
      apiClient.clearToken()
      set({ 
        isAuthenticated: false, 
        user: null, 
        isLoading: false 
      })
    }
  },

  clearError: () => set({ error: null })
}))