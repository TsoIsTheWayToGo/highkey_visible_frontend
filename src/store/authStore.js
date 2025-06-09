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
            
            // Add helper methods to user object
            const enhancedUser = {
              ...user,
              can_host: user.user_type === 'host' || user.user_type === 'both',
              can_advertise: user.user_type === 'advertiser' || user.user_type === 'both'
            };
            
            set({
              user: enhancedUser,
              token: token,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            return { success: true, user: enhancedUser, token };
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('Login error:', error);
          let errorMessage = 'Login failed';
          
          // Handle different error response formats
          if (error.response?.data) {
            const data = error.response.data;
            if (data.message) {
              errorMessage = data.message;
            } else if (data.error) {
              errorMessage = data.error;
            } else if (data.errors && Array.isArray(data.errors)) {
              errorMessage = data.errors.join(', ');
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
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
            
            // Add helper methods to user object
            const enhancedUser = {
              ...user,
              can_host: user.user_type === 'host' || user.user_type === 'both',
              can_advertise: user.user_type === 'advertiser' || user.user_type === 'both'
            };
            
            set({
              user: enhancedUser,
              token: token,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            return { success: true, user: enhancedUser, token };
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('Registration error:', error);
          let errorMessage = 'Registration failed';
          
          // Handle different error response formats
          if (error.response?.data) {
            const data = error.response.data;
            if (data.message) {
              errorMessage = data.message;
            } else if (data.error) {
              errorMessage = data.error;
            } else if (data.errors && Array.isArray(data.errors)) {
              errorMessage = data.errors.join(', ');
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
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
          // Don't prevent logout on error
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
        set((state) => {
          const updatedUser = { ...state.user, ...userData };
          // Ensure helper methods are preserved
          updatedUser.can_host = updatedUser.user_type === 'host' || updatedUser.user_type === 'both';
          updatedUser.can_advertise = updatedUser.user_type === 'advertiser' || updatedUser.user_type === 'both';
          
          return {
            user: updatedUser,
          };
        });
      },

      clearError: () => set({ error: null }),

      // Initialize auth state from localStorage
      initializeAuth: () => {
        const token = localStorage.getItem('authToken');
        const storedState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        
        console.log('Initializing auth:', { token: !!token, storedState: !!storedState.state?.user });
        
        if (token && storedState.state?.user) {
          const user = storedState.state.user;
          // Add helper methods to stored user
          const enhancedUser = {
            ...user,
            can_host: user.user_type === 'host' || user.user_type === 'both',
            can_advertise: user.user_type === 'advertiser' || user.user_type === 'both'
          };
          
          set({
            token: token,
            user: enhancedUser,
            isAuthenticated: true,
          });
        } else {
          // Clear invalid state
          localStorage.removeItem('authToken');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
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