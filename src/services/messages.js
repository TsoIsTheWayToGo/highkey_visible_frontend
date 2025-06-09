// src/services/messages.js - Improved version with better error handling
import api from './api';

const messagesService = {
  // Get all messages for a specific booking
  getMessages: async (bookingId, params = {}) => {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    try {
      console.log('Fetching messages for booking:', bookingId);
      const response = await api.get(`/bookings/${bookingId}/messages`, { params });
      
      return {
        messages: response.data.messages || [],
        pagination: response.data.pagination || {},
        booking: response.data.booking || null
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a new message
  sendMessage: async (bookingId, messageData) => {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    if (!messageData.message_text?.trim()) {
      throw new Error('Message text is required');
    }

    try {
      console.log('Sending message to booking:', bookingId, messageData);
      const response = await api.post(`/bookings/${bookingId}/messages`, {
        message: {
          message_text: messageData.message_text.trim(),
          message_type: messageData.message_type || 'text',
          metadata: messageData.metadata || {}
        }
      });
      
      // Dispatch custom event to update unread counts
      window.dispatchEvent(new CustomEvent('messageSent', { 
        detail: { bookingId, message: response.data } 
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark message as read
  markAsRead: async (bookingId, messageId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/messages/${messageId}/mark_read`);
      
      // Dispatch custom event to update unread counts
      window.dispatchEvent(new CustomEvent('messageRead', { 
        detail: { bookingId, messageId } 
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      // Don't throw error for read receipts - it's not critical
      return null;
    }
  },

  // Get unread message count across all user's bookings - IMPROVED VERSION
  getUnreadCount: async () => {
    try {
      console.log('Fetching unread message count...');
      const response = await api.get('/messages/unread_count');
      console.log('Unread count response:', response.data);
      
      return {
        count: response.data.count || 0,
        success: response.data.success !== false
      };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      
      // Check if it's a 404 (endpoint doesn't exist)
      if (error.response?.status === 404) {
        console.log('Unread messages endpoint not found, using fallback');
        return { count: 0, success: false };
      }
      
      // Check if it's an auth error
      if (error.response?.status === 401) {
        console.log('Not authenticated for unread count');
        return { count: 0, success: false };
      }
      
      // For other errors, return 0 but log the error
      console.error('Unread count API error:', error.response?.data || error.message);
      return { count: 0, success: false };
    }
  },

  // Debug endpoint - call this to troubleshoot unread messages
  debugUnreadMessages: async () => {
    try {
      const response = await api.get('/messages/debug');
      console.log('Debug response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Debug endpoint error:', error);
      return { error: error.message };
    }
  },

  // Search messages
  searchMessages: async (bookingId, query, params = {}) => {
    if (!bookingId || !query) {
      throw new Error('Booking ID and search query are required');
    }

    try {
      const response = await api.get(`/bookings/${bookingId}/messages/search`, {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send typing indicator (for real-time implementation)
  sendTypingIndicator: async (bookingId, isTyping) => {
    try {
      // This would require WebSocket or similar real-time connection
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // Upload attachment
  uploadAttachment: async (bookingId, file) => {
    if (!bookingId || !file) {
      throw new Error('Booking ID and file are required');
    }

    try {
      const formData = new FormData();
      formData.append('attachment', file);
      formData.append('message_type', 'image');

      const response = await api.post(`/bookings/${bookingId}/messages/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (bookingId, messageId) => {
    try {
      const response = await api.delete(`/bookings/${bookingId}/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get message thread summary for dashboard
  getThreadSummary: async (bookingIds) => {
    if (!bookingIds || !bookingIds.length) {
      return [];
    }

    try {
      const response = await api.post('/messages/threads/summary', {
        booking_ids: bookingIds
      });
      return response.data;
    } catch (error) {
      // Return empty array if endpoint doesn't exist
      return [];
    }
  },

  // Notify that a new message was received (for WebSocket integration)
  notifyNewMessage: (bookingId, message) => {
    window.dispatchEvent(new CustomEvent('newMessage', { 
      detail: { bookingId, message } 
    }));
  }
};

export default messagesService;