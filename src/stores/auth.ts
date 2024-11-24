import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthStore = {
  user?: Auth;
  login: (email: string, password: string) => void;
  logout: () => void;
};

interface Auth {
  email: string;
  expireTime: string;
  id: number;
  refreshToken: string;
  token: string;
  type: string;
  username: string;
}

interface User {
  id: number;
  fullname: string;
  email: string;
  employeeNumber: string;
  mobile: string;
  userRole: string;
  userStatus: string;
  otp: string;
  isPdoUser: boolean;
}

const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      login: async (email: string, password: string): Promise<void> => {
        try {
          const { data } = await axios.post<Auth>(
            '/auth/login',
            {
              email,
              password,
            },
            {
              baseURL: 'https://api.ncpdsmz.go.tz/api/dda/v1',
            }
          );
          const { data: user } = await axios.get<User>(
            `https://api.ncpdsmz.go.tz/api/dda/v1/users/${data.id}`
          );

          set({ user: data });
          if (user.userRole === 'STORE') {
            axios.defaults.headers.common['Authorization'] =
              `Bearer ${data.token}`;
          } else {
            throw new Error('You are not a store user');
          }
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        // try {
        //   set({ user_data: null, isAuthenticated: false, access: null });
        //   delete axios.defaults.headers.common['Authorization'];
        //   window.location.href = '/login';
        // } catch (error) {
        //   throw error;
        // }
      },
    }),
    {
      name: 'dispatch-type-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Intercept 401 responses and try to refresh the token
// axios.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         await useAuthStore.getState().refreshToken();
//         return axios(originalRequest);
//       } catch (refreshError) {
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default useAuthStore;
