// src/components/common/NotificationTest.jsx - Add this temporarily to test notifications
import React from 'react';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import toast from 'react-hot-toast';

const NotificationTest = () => {
  const { totalUnread, hasUnread, simulateNewMessage, markAsRead } = useUnreadMessages();

  const testNotifications = () => {
    // Simulate a new message event
    window.dispatchEvent(new CustomEvent('newMessage', { 
      detail: { 
        bookingId: 'test-123', 
        message: { 
          id: 'msg-' + Date.now(),
          sender: { id: 'other-user', first_name: 'John' },
          message_text: 'This is a test message'
        } 
      } 
    }));
    
    toast.success('Test notification dispatched!');
  };

  const testMessageRead = () => {
    window.dispatchEvent(new CustomEvent('messageRead', { 
      detail: { bookingId: 'test-123', messageId: 'msg-123' } 
    }));
    
    toast.success('Message marked as read!');
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">
        🧪 Notification System Test (Remove in Production)
      </h3>
      
      <div className="space-y-3">
        <div className="text-sm">
          <strong>Current unread count:</strong> {totalUnread}
          <br />
          <strong>Has unread:</strong> {hasUnread ? 'Yes' : 'No'}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={testNotifications}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Simulate New Message
          </button>
          
          <button 
            onClick={testMessageRead}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Simulate Message Read
          </button>
          
          <button 
            onClick={simulateNewMessage}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            Direct Counter +1
          </button>
          
          <button 
            onClick={() => markAsRead(1)}
            className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
          >
            Direct Counter -1
          </button>
        </div>
        
        <div className="text-xs text-yellow-700">
          Test the notification bell in the header by clicking these buttons. 
          The counter should update in real-time.
        </div>
      </div>
    </div>
  );
};

export default NotificationTest;