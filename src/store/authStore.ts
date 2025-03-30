import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  mobile: string | null;
  login: (mobile: string) => void;
  verifyCode: (code: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      mobile: null,
      login: (mobile: string) => {
        set({ mobile });
      },
      verifyCode: async (code: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (code === '123456') {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false, mobile: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);