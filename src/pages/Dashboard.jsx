import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { 
  HomeIcon, 
  CalendarDaysIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import usersService from '../services/users';
import bookingsService from '../services/bookings';
import spacesService from '../services/spaces';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MessageModal from '../components/messages/MessageModal';
import { formatCurrency, formatDate, formatBookingStatus, getStatusColor } from '../utils/formatters';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();
  const [messageModal, setMessageModal] = useState({ isOpen: false, booking: null });
  const { refreshUnreadCount } = useUnreadMessages();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'dashboard',
    usersService.getDashboard,
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch user's bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery(
    'user-bookings',
    () => bookingsService.getBookings({ per_page: 10 }),
    {
      refetchOnWindowFocus: false,
      onSuccess: () => {
        // Refresh unread count when bookings are loaded
        refreshUnreadCount();
      }
    }
  );

  // Fetch user's spaces (if they're a host)
  const { data: spacesData, isLoading: spacesLoading } = useQuery(
    ['user-spaces', user?.id],
    () => spacesService.getUserSpaces(user?.id),
    {
      enabled: user?.can_host && !!user?.id,
      refetchOnWindowFocus: false,
    }
  );

  const handleBookingAction = async (bookingId, action) => {
    try {
      let response;
      switch (action) {
        case 'approve':
          response = await bookingsService.approveBooking(bookingId);
          break;
        case 'reject':
          response = await bookingsService.rejectBooking(bookingId);
          break;
        case 'cancel':
          response = await bookingsService.cancelBooking(bookingId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      // Refetch bookings after action
      await queryClient.invalidateQueries('user-bookings');
      await queryClient.invalidateQueries('dashboard');
      
      toast.success(response.message || `Booking ${action}ed successfully`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.errors?.join(', ') ||
                          error.message ||
                          `Failed to ${action} booking`;
      toast.error(errorMessage);
    }
  };

  const handleOpenMessages = (booking) => {
    setMessageModal({ isOpen: true, booking });
    
    // Dispatch event to update global unread count
    window.dispatchEvent(new CustomEvent('messagesOpened', { 
      detail: { bookingId: booking.id } 
    }));
  };

  const handleCloseMessages = () => {
    setMessageModal({ isOpen: false, booking: null });
    // Refresh unread count when closing messages
    refreshUnreadCount();
    // Refetch bookings to update message indicators
    queryClient.invalidateQueries('user-bookings');
  };

  // Check if booking has unread messages (you can implement this properly based on your backend)
  const hasUnreadMessages = (booking) => {
    // This would come from your backend - for now return false
    return false;
  };

  const getMessageCount = (booking) => {
    // This would come from your backend - placeholder
    return 0;
  };

  const getUnreadCount = (booking) => {
    // This would come from your backend - placeholder  
    return 0;
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentActivity = dashboardData?.recent_activity || [];
  const bookings = bookingsData?.bookings || [];
  const spaces = spacesData?.spaces || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.user_type === 'host' && 'Manage your spaces and bookings from your dashboard.'}
            {user?.user_type === 'advertiser' && 'Track your advertising campaigns and bookings.'}
            {user?.user_type === 'both' && 'Manage your spaces and track your advertising campaigns.'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            {user?.can_host && (
              <button
                onClick={() => setActiveTab('spaces')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'spaces'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Spaces
              </button>
            )}
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user?.can_host && (
                <>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <HomeIcon className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">My Spaces</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.total_spaces || 0}</p>
                        <p className="text-sm text-gray-500">{stats.active_spaces || 0} active</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Total Earnings</h3>
                        <p className="text-3xl font-bold text-green-600">
                          {formatCurrency(stats.total_revenue || 0)}
                        </p>
                        <p className="text-sm text-gray-500">All time</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {user?.can_host ? 'Booking Requests' : 'My Bookings'}
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.total_bookings || 0}</p>
                    <p className="text-sm text-gray-500">{stats.pending_bookings || 0} pending</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Active Campaigns</h3>
                    <p className="text-3xl font-bold text-orange-600">{stats.active_bookings || 0}</p>
                    <p className="text-sm text-gray-500">{stats.completed_bookings || 0} completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {activity.type === 'booking_created' && (
                            <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                          )}
                          {activity.type === 'booking_received' && (
                            <ClockIcon className="h-6 w-6 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                              {formatBookingStatus(activity.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(activity.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Spaces Tab */}
        {activeTab === 'spaces' && user?.can_host && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Spaces</h2>
              <button
                onClick={() => window.location.href = '/spaces/new'}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Add New Space
              </button>
            </div>

            {spacesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : spaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spaces.map((space) => (
                  <div key={space.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img
                      src={space.primary_image || `https://picsum.photos/400/200?random=${space.id}`}
                      alt={space.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{space.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{space.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(space.daily_rate)}/day
                        </span>
                        <div className="flex items-center text-gray-500">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">{space.estimated_daily_views}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.location.href = `/spaces/${space.id}`}
                          className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => window.location.href = `/spaces/${space.id}/edit`}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No spaces yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first space.</p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.href = '/spaces/new'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Create Your First Space
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.can_host ? 'Booking Requests' : 'My Bookings'}
            </h2>

            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 relative">
                    {/* New Message Indicator */}
                    {hasUnreadMessages(booking) && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-red-600">New Messages</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.space.title}
                        </h3>
                        <p className="text-gray-600">
                          {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                          <span className="text-gray-500 ml-2">
                            ({booking.duration_days} days)
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {user?.can_host ? `Requested by: ${booking.advertiser.first_name} ${booking.advertiser.last_name}` 
                                           : `Space owner: ${booking.host.first_name} ${booking.host.last_name}`}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(booking.total_amount)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {formatBookingStatus(booking.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-3">
                      {/* Action buttons for hosts */}
                      {user?.can_host && booking.status === 'pending' && booking.host.id === user.id && (
                        <>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'approve')}
                            className="flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'reject')}
                            className="flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {/* Cancel button for advertisers */}
                      {booking.advertiser.id === user.id && ['pending', 'approved'].includes(booking.status) && (
                        <button
                          onClick={() => handleBookingAction(booking.id, 'cancel')}
                          className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {/* Message button */}
                      {(booking.advertiser.id === user.id || booking.host.id === user.id) && (
                        <button
                          onClick={() => handleOpenMessages(booking)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors relative"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                          Messages
                          {hasUnreadMessages(booking) && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                              {getUnreadCount(booking)}
                            </span>
                          )}
                          {getMessageCount(booking) > 0 && !hasUnreadMessages(booking) && (
                            <span className="ml-2 bg-gray-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                              {getMessageCount(booking) > 9 ? '9+' : getMessageCount(booking)}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {user?.can_host ? 'No booking requests yet' : 'No bookings yet'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.can_host 
                    ? 'When someone requests to book your space, it will appear here.'
                    : 'Start browsing spaces to make your first booking.'}
                </p>
                {user?.user_type === 'advertiser' && (
                  <div className="mt-6">
                    <button
                      onClick={() => window.location.href = '/search'}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                    >
                      Browse Spaces
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Modal */}
      <MessageModal 
        booking={messageModal.booking}
        isOpen={messageModal.isOpen}
        onClose={handleCloseMessages}
      />
    </div>
  );
};

export default Dashboard;