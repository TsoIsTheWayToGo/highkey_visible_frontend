import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          console.log('Attempting login with:', credentials);
          const response = await authService.login(credentials);
          console.log('Login response:', response);
          
          const token = response.token;
          const user = response.user;
          
          if (token && user) {
            localStorage.setItem('authToken', token);
            
            set({
              user: user,
              token: token,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            return { success: true, user, token };
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('Login error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              error.message || 
                              'Login failed';
          set({ 
            error: errorMessage, 
            loading: false,
            isAuthenticated: false,
            user: null,
            token: null
          });
          throw new Error(errorMessage);
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          console.log('Attempting registration with:', userData);
          const response = await authService.register(userData);
          console.log('Registration response:', response);
          
          const token = response.token;
          const user = response.user;
          
          if (token && user) {
            localStorage.setItem('authToken', token);
            
            set({
              user: user,
              token: token,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            return { success: true, user, token };
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('Registration error:', error);
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              error.response?.data?.errors?.join(', ') ||
                              error.message || 
                              'Registration failed';
          set({ 
            error: errorMessage, 
            loading: false,
            isAuthenticated: false,
            user: null,
            token: null
          });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('authToken');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      clearError: () => set({ error: null }),

      // Initialize auth state from localStorage
      initializeAuth: () => {
        const token = localStorage.getItem('authToken');
        if (token) {
          // In a real app, you'd validate this token
          set({
            token: token,
            isAuthenticated: true,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;