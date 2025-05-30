import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/users/sign_in', {
      user: credentials,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users', {
      user: userData,
    });
    return response.data;
  },

  logout: async () => {
    await api.delete('/users/sign_out');
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