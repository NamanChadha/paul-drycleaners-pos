import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '../types/models'

interface SessionState {
  role: UserRole | null
  username: string | null
  loginLocal: (role: UserRole, username: string) => void
  logoutLocal: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      role: 'admin',
      username: 'admin',
      loginLocal: (role, username) => set({ role, username }),
      logoutLocal: () => set({ role: 'admin', username: 'admin' }),
    }),
    { name: 'paul-drycleaners-session' },
  ),
)
