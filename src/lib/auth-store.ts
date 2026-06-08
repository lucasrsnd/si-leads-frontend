import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem('si_token', token);
    localStorage.setItem('si_user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('si_token');
    localStorage.removeItem('si_user');
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  init: () => {
    const token = localStorage.getItem('si_token');
    const userStr = localStorage.getItem('si_user');
    if (token && userStr) {
      try {
        set({ user: JSON.parse(userStr), token });
      } catch {}
    }
  },
}));
