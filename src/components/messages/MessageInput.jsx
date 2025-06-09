import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageInput = ({ 
  onSendMessage, 
  onTyping, 
  isLoading, 
  disabled = false, 
  disabledReason = "Messaging is not available" 
}) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      await onSendMessage(message.trim());
      setMessage('');
      
      // Stop typing indicator
      if (onTyping) {
        onTyping(false);
      }
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Handle typing indicators
    if (onTyping && !disabled) {
      onTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleBlur = () => {
    // Stop typing indicator when input loses focus
    if (onTyping) {
      onTyping(false);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            placeholder={disabled ? disabledReason : "Type your message..."}
            disabled={disabled || isLoading}
            rows="2"
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 text-sm"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-xs text-gray-500">
              {message.length}/1000 characters
            </span>
            {!disabled && (
              <span className="text-xs text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </span>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
};

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onTyping: PropTypes.func,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  disabledReason: PropTypes.string,
};

export default MessageInput;