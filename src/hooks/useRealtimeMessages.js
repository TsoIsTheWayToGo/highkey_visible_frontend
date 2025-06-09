import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import messagesService from '../services/messages';
import webSocketService from '../services/websocket';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export const useRealtimeMessages = (bookingId, options = {}) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [connectionError, setConnectionError] = useState(null);
  
  const subscriptionRef = useRef(null);
  const typingTimeoutRef = useRef(new Map());
  const isInitializedRef = useRef(false);
  const hasShownToastRef = useRef(new Set());

  const {
    data: messagesData,
    isLoading: isLoadingInitial,
    error: restError,
    refetch
  } = useQuery(
    ['messages', bookingId],
    () => messagesService.getMessages(bookingId),
    {
      enabled: !!bookingId,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      onSuccess: (data) => {
        setMessages(data.messages || []);
      },
      onError: (error) => {
        setConnectionError('Failed to load messages');
      }
    }
  );

  // WebSocket connection setup
  useEffect(() => {
    if (!bookingId || !user || isInitializedRef.current) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setConnectionError('Authentication required');
      return;
    }

    const connectionStatus = webSocketService.getConnectionStatus();
    
    if (!connectionStatus.isConnected) {
      webSocketService.connect(token);
    }

    const setupSubscription = () => {
      const subscription = webSocketService.subscribeToMessages(bookingId, {
        onConnected: () => {
          setIsConnected(true);
          setConnectionError(null);
        },

        onDisconnected: () => {
          setIsConnected(false);
        },

        onConnectionConfirmed: (data) => {
          setIsConnected(true);
          setConnectionError(null);
        },

        onNewMessage: (message) => {
          setMessages(prev => {
            const exists = prev.find(m => m.id === message.id);
            if (exists) return prev;
            
            const newMessages = [...prev, message].sort((a, b) => 
              new Date(a.created_at) - new Date(b.created_at)
            );
            
            return newMessages;
          });

          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(message.sender.id);
            return newSet;
          });

          if (message.sender.id !== user.id && !hasShownToastRef.current.has(message.id)) {
            hasShownToastRef.current.add(message.id);
            
            const messagePreview = message.message_text.length > 50 
              ? `${message.message_text.substring(0, 50)}...` 
              : message.message_text;
            
            toast.success(`💬 ${message.sender.first_name}: ${messagePreview}`, {
              duration: 4000,
              icon: '💬',
              style: { maxWidth: '400px' }
            });
          }

          options.onNewMessage?.(message);
        },

        onUserTyping: (data) => {
          if (data.user_id === user.id) return;

          setTypingUsers(prev => {
            const newSet = new Set(prev);
            
            if (data.is_typing) {
              newSet.add(data.user_id);
              
              if (typingTimeoutRef.current.has(data.user_id)) {
                clearTimeout(typingTimeoutRef.current.get(data.user_id));
              }
              
              const timeoutId = setTimeout(() => {
                setTypingUsers(current => {
                  const updated = new Set(current);
                  updated.delete(data.user_id);
                  return updated;
                });
                typingTimeoutRef.current.delete(data.user_id);
              }, 3000);
              
              typingTimeoutRef.current.set(data.user_id, timeoutId);
            } else {
              newSet.delete(data.user_id);
              if (typingTimeoutRef.current.has(data.user_id)) {
                clearTimeout(typingTimeoutRef.current.get(data.user_id));
                typingTimeoutRef.current.delete(data.user_id);
              }
            }
            
            return newSet;
          });
        },

        onMessageSent: (message) => {
          options.onMessageSent?.(message);
        },

        onError: (error) => {
          setConnectionError(error);
          options.onError?.(error);
        },

        onRejected: (bookingId) => {
          setIsConnected(false);
          setConnectionError('Connection rejected - check permissions');
        }
      });

      subscriptionRef.current = subscription;
    };

    setTimeout(setupSubscription, 2000);
    isInitializedRef.current = true;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      typingTimeoutRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      typingTimeoutRef.current.clear();
      
      setIsConnected(false);
      setTypingUsers(new Set());
      isInitializedRef.current = false;
      hasShownToastRef.current.clear(); // Clear toast tracking
    };
  }, [bookingId, user?.id]);

  // Send message function
  const sendMessage = useCallback(async (messageText, messageType = 'text') => {
    if (!messageText?.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      // Try WebSocket first if connected
      if (isConnected && subscriptionRef.current) {
        const success = webSocketService.sendBookingMessage(bookingId, messageText.trim(), messageType);
        
        if (success) {
          return { success: true, method: 'websocket' };
        }
      }

      // Fallback to REST API
      const response = await messagesService.sendMessage(bookingId, {
        message_text: messageText.trim(),
        message_type: messageType
      });

      // Add message to local state if WebSocket isn't working
      if (!isConnected && response) {
        setMessages(prev => {
          const exists = prev.find(m => m.id === response.id);
          if (exists) return prev;
          
          return [...prev, response].sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
          );
        });
      }

      return { success: true, method: 'rest', data: response };

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send message';
      toast.error(errorMessage);
      throw error;
    }
  }, [bookingId, isConnected]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping) => {
    if (isConnected && subscriptionRef.current) {
      webSocketService.sendTypingIndicator(bookingId, isTyping);
    }
  }, [bookingId, isConnected]);

  // Get typing indicator text
  const getTypingText = useCallback(() => {
    if (typingUsers.size === 0) return '';
    
    if (typingUsers.size === 1) {
      return 'Someone is typing...';
    } else {
      return `${typingUsers.size} people are typing...`;
    }
  }, [typingUsers]);

  // Retry connection
  const retryConnection = useCallback(() => {
    setConnectionError(null);
    
    const token = localStorage.getItem('authToken');
    if (token) {
      webSocketService.connect(token);
    } else {
      setConnectionError('No authentication token found');
    }
  }, []);

  const connectionStatus = webSocketService.getConnectionStatus();

  return {
    // Data
    messages,
    isConnected,
    typingUsers,
    typingText: getTypingText(),
    
    // Loading states  
    isLoading: isLoadingInitial,
    error: restError || connectionError,
    
    // Actions
    sendMessage,
    sendTypingIndicator,
    refetch,
    retryConnection,
    
    // Connection info
    connectionStatus,
    hasWebSocketSupport: connectionStatus.hasActionCable,
    
    // Stats
    messageCount: messages.length,
    hasTypingUsers: typingUsers.size > 0,
    
    // Debug info (minimal for production)
    debugInfo: {
      bookingId,
      isInitialized: isInitializedRef.current,
      hasSubscription: !!subscriptionRef.current,
      connectionStatus
    }
  };
};