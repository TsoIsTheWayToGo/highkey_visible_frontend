import { useQuery, useQueryClient } from 'react-query';
import { useState, useEffect } from 'react';
import messagesService from '../services/messages';
import useAuthStore from '../store/authStore';

export const useUnreadMessages = () => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [totalUnread, setTotalUnread] = useState(0);

  // Fetch unread message count with fallback
  const { data: unreadData, refetch, isLoading } = useQuery(
    ['unread-messages', user?.id],
    async () => {
      try {
        return await messagesService.getUnreadCount();
      } catch (error) {
        // If endpoint doesn't exist, return 0
        console.log('Unread messages endpoint not available, using fallback');
        return { count: 0 };
      }
    },
    {
      enabled: isAuthenticated && !!user?.id,
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true,
      staleTime: 15000, // Consider stale after 15 seconds
      retry: false, // Don't retry if endpoint doesn't exist
      onSuccess: (data) => {
        setTotalUnread(data.count || 0);
      },
      onError: () => {
        setTotalUnread(0);
      }
    }
  );

  // Listen for message updates to invalidate the count
  useEffect(() => {
    const handleNewMessage = (event) => {
      const { message } = event.detail || {};
      // Only increment if message is from someone else
      if (message && message.sender.id !== user?.id) {
        setTotalUnread(prev => prev + 1);
      }
      // Also invalidate and refetch for accuracy
      setTimeout(() => {
        queryClient.invalidateQueries(['unread-messages', user?.id]);
      }, 1000);
    };

    const handleMessageSent = () => {
      // Refresh count when user sends a message
      queryClient.invalidateQueries(['unread-messages', user?.id]);
    };

    const handleMessageRead = () => {
      // Decrease unread count when messages are read
      setTotalUnread(prev => Math.max(0, prev - 1));
      // Also invalidate and refetch for accuracy
      setTimeout(() => {
        queryClient.invalidateQueries(['unread-messages', user?.id]);
      }, 1000);
    };

    const handleMessagesOpened = () => {
      // When messages are opened, assume they're read
      setTotalUnread(0);
      queryClient.invalidateQueries(['unread-messages', user?.id]);
    };

    // Listen for custom events
    window.addEventListener('newMessage', handleNewMessage);
    window.addEventListener('messageSent', handleMessageSent);
    window.addEventListener('messageRead', handleMessageRead);
    window.addEventListener('messagesOpened', handleMessagesOpened);
    
    return () => {
      window.removeEventListener('newMessage', handleNewMessage);
      window.removeEventListener('messageSent', handleMessageSent);
      window.removeEventListener('messageRead', handleMessageRead);
      window.removeEventListener('messagesOpened', handleMessagesOpened);
    };
  }, [queryClient, user?.id]);

  // Method to manually refresh the count
  const refreshUnreadCount = () => {
    refetch();
  };

  // Method to mark messages as read (updates the count)
  const markAsRead = (count = 1) => {
    setTotalUnread(prev => Math.max(0, prev - count));
    // Also invalidate the query to get fresh data
    setTimeout(() => {
      queryClient.invalidateQueries(['unread-messages', user?.id]);
    }, 1000);
  };

  return {
    totalUnread: totalUnread || 0,
    hasUnread: totalUnread > 0,
    refreshUnreadCount,
    markAsRead,
    isLoading: isLoading && isAuthenticated
  };
};