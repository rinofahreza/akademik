import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, SiswaProfile } from '@/lib/types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  siswa: SiswaProfile | null;
  setAuth: (user: AuthUser, token: string) => void;
  setSiswa: (siswa: SiswaProfile) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      siswa: null,
      setAuth: (user, token) => {
        localStorage.setItem('siswa_token', token);
        set({ user, token });
      },
      setSiswa: (siswa) => set({ siswa }),
      clearAuth: () => {
        localStorage.removeItem('siswa_token');
        set({ user: null, token: null, siswa: null });
      },
    }),
    {
      name: 'siswa-auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, siswa: state.siswa }),
    }
  )
);
