import { create } from 'zustand'

export type UserRole = 'paciente' | 'dentista' | 'admin'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  isOnline?: boolean
  cro?: string
  especialidades?: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: '1',
    name: 'Dr. João Silva',
    email: 'joao@unio.com',
    role: 'dentista',
    isOnline: true,
    cro: 'CRO-SP 12345',
    especialidades: ['Clínica Geral', 'Endodontia']
  },
  isAuthenticated: true,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  }))
}))