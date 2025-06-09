import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', {
      user: credentials,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', {
      user: userData,
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.delete('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Don't throw error for logout - always clear local storage
    }
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/current');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.patch('/users', {
      user: userData,
    });
    return response.data;
  },
};

export default authService;