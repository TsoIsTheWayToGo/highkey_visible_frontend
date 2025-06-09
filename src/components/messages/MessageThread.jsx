import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageBubble = ({ message, isCurrentUser }) => {
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        <img
          src={message.sender.avatar_url || `https://ui-avatars.com/api/?name=${message.sender.first_name}&background=3b82f6&color=fff&size=32`}
          alt={message.sender.first_name}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        
        {/* Message bubble */}
        <div className={`${isCurrentUser ? 'mr-2' : 'ml-2'} flex-1`}>
          <div
            className={`px-4 py-3 rounded-2xl ${
              isCurrentUser
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
            } shadow-sm`}
          >
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.message_text}
            </p>
          </div>
          
          {/* Timestamp and sender name */}
          <div className={`text-xs text-gray-500 mt-1 px-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
            <span className="font-medium">{message.sender.first_name}</span>
            <span className="mx-1">•</span>
            <span>{formatMessageTime(message.created_at)}</span>
            {message.read_at && isCurrentUser && (
              <span className="ml-1 text-gray-400">✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageThread = ({ messages, isLoading, error }) => {
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Failed to load messages</p>
          <p className="text-gray-500 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 mt-4">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No messages yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Start the conversation by sending a message below
          </p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={date}>
          {/* Date divider */}
          <div className="flex items-center justify-center my-6">
            <div className="bg-white rounded-full px-4 py-2 text-xs text-gray-600 border border-gray-200 shadow-sm font-medium">
              {formatDate(date)}
            </div>
          </div>
          
          {/* Messages for this date */}
          {dayMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.sender.id === user?.id}
            />
          ))}
        </div>
      ))}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

MessageThread.propTypes = {
  messages: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
};

MessageBubble.propTypes = {
  message: PropTypes.object.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
};

export default MessageThread;