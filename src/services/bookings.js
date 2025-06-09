import api from './api';

const bookingsService = {
  getBookings: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getBooking: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  createBooking: async (bookingData) => {
    console.log('Creating booking with data:', bookingData);
    const response = await api.post('/bookings', {
      booking: bookingData,
    });
    return response.data;
  },

  approveBooking: async (id) => {
    console.log('Approving booking:', id);
    const response = await api.patch(`/bookings/${id}/approve`);
    console.log('Approve response:', response.data);
    return response.data;
  },

  rejectBooking: async (id) => {
    console.log('Rejecting booking:', id);
    const response = await api.patch(`/bookings/${id}/reject`);
    console.log('Reject response:', response.data);
    return response.data;
  },

  cancelBooking: async (id) => {
    console.log('Cancelling booking:', id);
    const response = await api.patch(`/bookings/${id}/cancel`);
    console.log('Cancel response:', response.data);
    return response.data;
  },

  getMessages: async (bookingId, params = {}) => {
    const response = await api.get(`/bookings/${bookingId}/messages`, { params });
    return response.data;
  },

  sendMessage: async (bookingId, messageData) => {
    const response = await api.post(`/bookings/${bookingId}/messages`, {
      message: messageData,
    });
    return response.data;
  },
};

export default bookingsService;