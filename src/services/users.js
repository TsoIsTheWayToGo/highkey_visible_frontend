import api from './api';

const usersService = {
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

  getDashboard: async () => {
    const response = await api.get('/users/dashboard');
    return response.data;
  },

  getProfile: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

export default usersService;