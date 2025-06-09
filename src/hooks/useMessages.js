import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState, useCallback, useEffect } from 'react';
import messagesService from '../services/messages';
import toast from 'react-hot-toast';

export const useMessages = (bookingId, options = {}) => {
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(false);

  const {
    data: messagesData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['messages', bookingId],
    () => messagesService.getMessages(bookingId),
    {
      enabled: !!bookingId,
      refetchInterval: isPolling ? 5000 : 30000,
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: false,
      staleTime: 10000,
      cacheTime: 60000,
      ...options
    }
  );

  const sendMessageMutation = useMutation(
    (messageData) => messagesService.sendMessage(bookingId, messageData),
    {
      onMutate: async (newMessage) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(['messages', bookingId]);

        // Snapshot previous value
        const previousMessages = queryClient.getQueryData(['messages', bookingId]);

        // Optimisticailly update to new value with temporary message
        if (previousMessages?.messages) {
          const optimisticMessage = {
            id: `temp-${Date.now()}`,
            message_text: newMessage.message_text,
            message_type: newMessage.message_type || 'text',
            sender: options.currentUser || { id: 'current', first_name: 'You' },
            created_at: new Date().toISOString(),
            read_at: null,
            metadata: {}
          };

          queryClient.setQueryData(['messages', bookingId], {
            ...previousMessages,
            messages: [...previousMessages.messages, optimisticMessage]
          });
        }

        // Return context with snapshat
        return { previousMessages };
      },
      onError: (error, newMessage, context) => {
        // Rollback on error
        if (context?.previousMessages) {
          queryClient.setQueryData(['messages', bookingId], context.previousMessages);
        }
        
        const errorMessage = error.response?.data?.error || 'Failed to send message';
        toast.error(errorMessage);
        
        if (options.onError) {
          options.onError(error);
        }
      },
      onSuccess: (data) => {
        // Invaldate and refetch to get the real message from server
        queryClient.invalidateQueries(['messages', bookingId]);
        
        if (options.onMessageSent) {
          options.onMessageSent(data);
        }
      },
      onSettled: () => {
        // Always refetch after mutation
        queryClient.invalidateQueries(['messages', bookingId]);
      }
    }
  );

  const sendMessage = useCallback(async (messageText, messageType = 'text') => {
    if (!messageText?.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    
    try {
      return await sendMessageMutation.mutateAsync({
        message_text: messageText.trim(),
        message_type: messageType
      });
    } catch (error) {
      // Error is already handled in onError
      throw error;
    }
  }, [sendMessageMutation]);

  // Mark messages as read 
  const markAsRead = useCallback((messageId) => {
    // This would require a backend endpoint
    console.log('Mark as read:', messageId);
  }, []);

  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const setTypingIndicator = useCallback((typing) => {
    setIsTyping(typing);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (typing) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 3000); // Stop typing indicator after 3 seconds
      setTypingTimeout(timeout);
    }
  }, [typingTimeout]);

  
  useEffect(() => {
    const handleFocus = () => setIsPolling(true);
    const handleBlur = () => setIsPolling(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  
  const messageStats = {
    total: messagesData?.messages?.length || 0,
    unread: messagesData?.messages?.filter(m => !m.read_at)?.length || 0,
    lastMessage: messagesData?.messages?.[messagesData.messages.length - 1] || null
  };

  return {
  
    messages: messagesData?.messages || [],
    messageStats,
    isLoading,
    isSending: sendMessageMutation.isLoading,
    error,
    
    // Actions
    sendMessage,
    markAsRead,
    refetch,
    
    // Real-time features
    isPolling,
    isTyping,
    setTypingIndicator,
    
    // Pagination (for future use)
    hasNextPage: false, // Implement if you add pagination
    fetchNextPage: () => {}, // Implement if you add pagination
  };
};

export const useUnreadMessageCount = (userId) => {
  return useQuery(
    ['unread-messages-count', userId],
    async () => {

      try {
        // In a real implementation:
        // const response = await api.get('/messages/unread_count');
        // return response.data;
        
        return { count: 0 };
      } catch (error) {
        console.error('Error fetching unread count:', error);
        return { count: 0 };
      }
    },
    {
      enabled: !!userId,
      refetchInterval: 60000,
      staleTime: 30000,
    }
  );
};


export const useMessageNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, booking) => {
    const notification = {
      id: `notification-${message.id}`,
      message,
      booking,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev].slice(0, 10));

    toast.success(
      `New message from ${message.sender.first_name}`,
      {
        duration: 3000,
        onClick: () => {
          // Handle notification click - could open message modal
          console.log('Notification clicked for booking:', booking.id);
        }
      }
    );
  }, []);

  const markNotificationRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification,
    markNotificationRead,
    clearNotifications
  };
};

export const useMessageThreads = (bookingIds = []) => {
  const queryClient = useQueryClient();

  const threads = useQuery(
    ['message-threads', bookingIds.join(',')],
    async () => {
      if (!bookingIds.length) return [];

      const threadPromises = bookingIds.map(async (bookingId) => {
        try {
          const messagesData = await messagesService.getMessages(bookingId);
          return {
            bookingId,
            messages: messagesData.messages || [],
            lastMessage: messagesData.messages?.[messagesData.messages.length - 1] || null,
            unreadCount: messagesData.messages?.filter(m => !m.read_at)?.length || 0
          };
        } catch (error) {
          console.error(`Error fetching messages for booking ${bookingId}:`, error);
          return {
            bookingId,
            messages: [],
            lastMessage: null,
            unreadCount: 0,
            error
          };
        }
      });

      return Promise.all(threadPromises);
    },
    {
      enabled: bookingIds.length > 0,
      refetchInterval: 30000, 
      staleTime: 15000,
    }
  );

  return {
    threads: threads.data || [],
    isLoading: threads.isLoading,
    error: threads.error,
    refetch: threads.refetch
  };
};