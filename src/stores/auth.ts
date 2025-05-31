import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthStore = {
  user?: DjangoUser;
  login: (username: string, password: string) => void;
  logout: () => void;
};

interface DjangoUser {
  token: string;
  user_id: number;
  username: string;
  email: string;
  role: string;
  branch: number;
}

const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      login: async (username: string, password: string): Promise<void> => {
        try {
          const { data } = await axios.post<DjangoUser>(
            '/users/auth/login/',
            {
              username: username,
              password,
            }
          );
          
          // Set default axios headers for future requests
          axios.defaults.headers.common['Authorization'] = `Token ${data.token}`;
          
          set({ user: data });
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ user: undefined });
          delete axios.defaults.headers.common['Authorization'];
          window.location.href = '/login';
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'django-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
