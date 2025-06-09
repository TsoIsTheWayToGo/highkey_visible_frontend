import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  XMarkIcon, 
  ChatBubbleLeftRightIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import MessageThread from './MessageThread';
import MessageInput from './MessageInput';
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages';
import useAuthStore from '../../store/authStore';

const ConnectionStatus = ({ isConnected, error, onRetry }) => {
  if (isConnected) {
    return (
      <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-red-600 text-sm">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>Connection Error</span>
        </div>
        <button
          onClick={onRetry}
          className="text-blue-600 hover:text-blue-700 text-sm underline transition-colors"
          title="Retry connection"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
      <ArrowPathIcon className="h-4 w-4 animate-spin" />
      <span>Connecting...</span>
    </div>
  );
};

const MessageModal = ({ booking, isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [isSending, setIsSending] = useState(false);

  // Use real-time messages hook
  const {
    messages,
    isConnected,
    typingText,
    isLoading,
    error,
    sendMessage,
    sendTypingIndicator,
    retryConnection
  } = useRealtimeMessages(booking?.id, {
    onMessageSent: () => {
      setIsSending(false);
    },
    onError: (error) => {
      setIsSending(false);
      toast.error(`Messaging error: ${error}`);
    }
  });

  // Check if messaging is allowed for this booking status
  const canMessage = () => {
    if (!booking) return false;
    const allowedStatuses = ['pending', 'approved', 'active', 'completed', 'cancelled'];
    return allowedStatuses.includes(booking.status);
  };

  const getDisabledReason = () => {
    if (!booking) return "Booking not found";
    if (booking.status === 'rejected') {
      return "Messaging disabled for rejected bookings";
    }
    return "Messaging not available";
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      await sendMessage(messageText);
    } catch (error) {
      setIsSending(false);
    }
  };

  const handleTyping = (isTyping) => {
    if (canMessage()) {
      sendTypingIndicator(isTyping);
    }
  };

  // Handle escape key and backdrop clicks
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const otherParty = booking.advertiser.id === user?.id ? booking.host : booking.advertiser;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal panel - Clean and centered */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
        {/* Header - White with border */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {otherParty.first_name} {otherParty.last_name}
                  </h3>
                  <ConnectionStatus 
                    isConnected={isConnected}
                    error={error}
                    onRetry={retryConnection}
                  />
                </div>
                <p className="text-gray-600 text-sm">
                  {booking.space.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Connection Error Banner */}
        {error && !isConnected && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  Real-time messaging temporarily unavailable. Messages will be sent via standard delivery.
                </p>
              </div>
              <button
                onClick={retryConnection}
                className="text-amber-800 hover:text-amber-900 text-sm font-medium underline whitespace-nowrap"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
          <div className="flex-1 overflow-hidden">
            <MessageThread 
              messages={messages}
              isLoading={isLoading}
              error={error && isConnected ? error : null}
            />
          </div>

          {/* Typing indicator */}
          {typingText && (
            <div className="px-6 py-3 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <p className="text-sm text-gray-600 italic">
                  {typingText}
                </p>
              </div>
            </div>
          )}
          
          {/* Message input */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200">
            <MessageInput 
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              isLoading={isSending}
              disabled={!canMessage()}
              disabledReason={getDisabledReason()}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                {booking.start_date} to {booking.end_date}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              booking.status === 'approved' ? 'bg-green-100 text-green-800' :
              booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-200 text-gray-700'
            }`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

MessageModal.propTypes = {
  booking: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

ConnectionStatus.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
};

export default MessageModal;