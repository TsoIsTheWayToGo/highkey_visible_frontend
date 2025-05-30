import api from './api';

const spacesService = {
  getSpaces: async (params = {}) => {
    const response = await api.get('/spaces', { params });
    return response.data;
  },

  getSpace: async (id) => {
    const response = await api.get(`/spaces/${id}`);
    return response.data;
  },

  createSpace: async (spaceData) => {
    const response = await api.post('/spaces', {
      space: spaceData,
    });
    return response.data;
  },

  updateSpace: async (id, spaceData) => {
    const response = await api.patch(`/spaces/${id}`, {
      space: spaceData,
    });
    return response.data;
  },

  deleteSpace: async (id) => {
    await api.delete(`/spaces/${id}`);
  },

  searchSpaces: async (searchParams) => {
    const response = await api.get('/spaces', { params: searchParams });
    return response.data;
  },

  checkAvailability: async (spaceId, startDate, endDate) => {
    const response = await api.get(`/spaces/${spaceId}/availability`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  geocode: async (address) => {
    const response = await api.post('/geocode', { address });
    return response.data;
  },
};

export default spacesService;