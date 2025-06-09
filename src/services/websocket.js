// src/services/websocket.js - Clean production version
class WebSocketService {
  constructor() {
    this.cable = null;
    this.subscriptions = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.connectionCheckInterval = null;
    this.baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/cable';
  }

  connect(token) {
    if (this.cable && this.isConnected) {
      return;
    }

    if (!window.ActionCable) {
      return;
    }

    try {
      this.cable = window.ActionCable.createConsumer(`${this.baseUrl}?token=${encodeURIComponent(token)}`);
      
      if (!this.cable) {
        throw new Error('Failed to create ActionCable consumer');
      }

      this.monitorConnection();
    } catch (error) {
      this.isConnected = false;
      this.handleDisconnection();
    }
  }

  monitorConnection() {
    if (!this.cable) return;

    const checkConnection = () => {
      if (!this.cable) return;

      const wasConnected = this.isConnected;
      const isNowConnected = this.cable.connection && this.cable.connection.isOpen();
      
      if (isNowConnected && !wasConnected) {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.clearReconnectTimeout();
      } else if (!isNowConnected && wasConnected) {
        this.isConnected = false;
        this.handleDisconnection();
      }
    };

    setTimeout(checkConnection, 100);
    this.connectionCheckInterval = setInterval(checkConnection, 1000);
    
    setTimeout(() => {
      if (!this.isConnected && this.connectionCheckInterval) {
        clearInterval(this.connectionCheckInterval);
        this.handleDisconnection();
      }
    }, 30000);
  }

  subscribeToMessages(bookingId, callbacks = {}) {
    if (!this.cable) {
      callbacks.onRejected?.(bookingId);
      return this.createMockSubscription();
    }

    try {
      const subscription = this.cable.subscriptions.create(
        {
          channel: 'MessagesChannel',
          booking_id: bookingId
        },
        {
          connected: () => {
            this.isConnected = true;
            callbacks.onConnected?.();
          },

          disconnected: () => {
            callbacks.onDisconnected?.();
          },

          rejected: () => {
            callbacks.onRejected?.(bookingId);
          },

          received: (data) => {
            this.handleReceivedData(data, callbacks);
          }
        }
      );

      this.subscriptions.set(bookingId, { subscription, callbacks });

      return {
        unsubscribe: () => {
          this.unsubscribeFromMessages(bookingId);
        },
        send: (data) => {
          return this.sendChannelMessage(bookingId, data);
        },
        isConnected: () => {
          return this.isConnected && subscription && subscription.consumer && subscription.consumer.connection.isOpen();
        }
      };

    } catch (error) {
      callbacks.onError?.('Failed to subscribe to messages');
      return this.createMockSubscription();
    }
  }

  handleReceivedData(data, callbacks) {
    try {
      switch (data.type) {
        case 'connection_confirmed':
          callbacks.onConnectionConfirmed?.(data);
          break;
        case 'new_message':
          callbacks.onNewMessage?.(data.message);
          break;
        case 'user_typing':
          callbacks.onUserTyping?.(data);
          break;
        case 'message_sent':
          callbacks.onMessageSent?.(data.message);
          break;
        case 'error':
          callbacks.onError?.(data.error);
          break;
      }
    } catch (error) {
      callbacks.onError?.('Error processing message');
    }
  }

  sendChannelMessage(bookingId, data) {
    const subscriptionData = this.subscriptions.get(bookingId);
    
    if (!subscriptionData || !subscriptionData.subscription) {
      return false;
    }

    try {
      subscriptionData.subscription.send(data);
      return true;
    } catch (error) {
      return false;
    }
  }

  sendBookingMessage(bookingId, messageText, messageType = 'text') {
    return this.sendChannelMessage(bookingId, {
      action: 'send_message',
      message_text: messageText,
      message_type: messageType
    });
  }

  sendTypingIndicator(bookingId, isTyping) {
    this.sendChannelMessage(bookingId, {
      action: 'mark_typing',
      is_typing: isTyping
    });
  }

  unsubscribeFromMessages(bookingId) {
    const subscriptionData = this.subscriptions.get(bookingId);
    if (subscriptionData && subscriptionData.subscription) {
      try {
        subscriptionData.subscription.unsubscribe();
        this.subscriptions.delete(bookingId);
      } catch (error) {
        // Silent fail
      }
    }
  }

  disconnect() {
    try {
      if (this.connectionCheckInterval) {
        clearInterval(this.connectionCheckInterval);
        this.connectionCheckInterval = null;
      }

      this.subscriptions.forEach((subscriptionData, bookingId) => {
        this.unsubscribeFromMessages(bookingId);
      });

      this.clearReconnectTimeout();

      if (this.cable) {
        this.cable.disconnect();
        this.cable = null;
      }

      this.isConnected = false;
      this.subscriptions.clear();
    } catch (error) {
      // Silent fail
    }
  }

  handleDisconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeout = setTimeout(() => {
      const token = localStorage.getItem('authToken');
      if (token) {
        this.connect(token);
      }
    }, delay);
  }

  clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  createMockSubscription() {
    return {
      unsubscribe: () => {},
      send: () => false,
      isConnected: () => false
    };
  }

  getConnectionStatus() {
    const cableStatus = this.cable ? {
      hasCable: true,
      hasConnection: !!this.cable.connection,
      isOpen: this.cable.connection ? this.cable.connection.isOpen() : false,
      state: this.cable.connection ? this.cable.connection.getState() : 'unknown'
    } : { hasCable: false };

    return {
      isConnected: this.isConnected,
      hasSubscriptions: this.subscriptions.size > 0,
      subscriptionCount: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
      hasActionCable: !!window.ActionCable,
      cable: cableStatus,
      connectionType: 'actioncable'
    };
  }

  reset() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
    
    this.disconnect();
    this.reconnectAttempts = 0;
    this.clearReconnectTimeout();
  }
}

const webSocketService = new WebSocketService();

export default webSocketService;