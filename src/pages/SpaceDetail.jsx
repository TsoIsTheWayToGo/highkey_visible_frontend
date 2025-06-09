import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import spacesService from '../services/spaces';
import bookingsService from '../services/bookings';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MessageModal from '../components/messages/MessageModal';
import useAuthStore from '../store/authStore';
import { formatCurrency, formatSpaceType } from '../utils/formatters';

const bookingSchema = yup.object({
  start_date: yup
    .string()
    .required('Start date is required'),
  end_date: yup
    .string()
    .required('End date is required'),
  creative_brief: yup
    .string()
    .min(20, 'Please provide more details about your campaign')
    .max(1000, 'Creative brief is too long')
    .required('Creative brief is required'),
  special_instructions: yup
    .string()
    .max(500, 'Special instructions are too long'),
  company_name: yup
    .string()
    .max(100, 'Company name is too long'),
});

const SpaceDetail = () => {
  const { id: spaceId } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [messageModal, setMessageModal] = useState({ isOpen: false, booking: null });

  console.log('SpaceDetail - spaceId:', spaceId);

  const { data: spaceResponse, isLoading, error } = useQuery(
    ['space', spaceId],
    () => spacesService.getSpace(spaceId),
    { 
      enabled: !!spaceId,
      onSuccess: (data) => {
        console.log('Space data received:', data);
      },
      onError: (error) => {
        console.error('Space fetch error:', error);
      }
    }
  );

  // Extract space from response - handle different response formats
  const space = spaceResponse?.space || spaceResponse;

  console.log('Processed space data:', space);

  // Check if user has existing bookings with this space owner for messaging
  const { data: userBookingsData } = useQuery(
    ['user-bookings-for-messaging', user?.id],
    () => bookingsService.getBookings(),
    {
      enabled: isAuthenticated && !!user?.id,
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(bookingSchema),
  });

  const createBookingMutation = useMutation(bookingsService.createBooking, {
    onSuccess: (data) => {
      toast.success('Booking request sent successfully!');
      setShowBookingForm(false);
      reset();
      
      if (space?.owner?.first_name) {
        toast.success(
          `Your booking request has been sent to ${space.owner.first_name}. They have 48 hours to respond.`,
          { duration: 6000 }
        );
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.errors?.join(', ') || 
                          error.response?.data?.error || 
                          'Failed to create booking';
      toast.error(errorMessage);
    },
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');

  const calculateBookingCost = () => {
    if (!startDate || !endDate || !space) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (days < (space.minimum_booking_days || 1) || days > (space.maximum_booking_days || 30)) {
      return null;
    }
    
    const subtotal = days * (space.daily_rate || 0);
    const platformFee = Math.round(subtotal * 0.1);
    const total = subtotal + platformFee;
    
    return {
      days,
      subtotal,
      platformFee,
      total,
      isValid: days >= (space.minimum_booking_days || 1) && days <= (space.maximum_booking_days || 30)
    };
  };

  const onSubmitBooking = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to make a booking');
      return;
    }

    if (space?.owner?.id === user?.id) {
      toast.error('You cannot book your own space');
      return;
    }

    const cost = calculateBookingCost();
    if (!cost || !cost.isValid) {
      toast.error(`Booking must be between ${space.minimum_booking_days || 1} and ${space.maximum_booking_days || 30} days`);
      return;
    }

    const bookingData = {
      space_id: space.id,
      start_date: data.start_date,
      end_date: data.end_date,
      creative_brief: data.creative_brief,
      special_instructions: data.special_instructions,
      advertiser_contact_info: {
        phone: user.phone,
        company_name: data.company_name || '',
        email: user.email
      }
    };

    createBookingMutation.mutate(bookingData);
  };

  const handleOpenMessages = (booking) => {
    setMessageModal({ isOpen: true, booking });
  };

  const handleCloseMessages = () => {
    setMessageModal({ isOpen: false, booking: null });
  };

  const handleContactHost = () => {
    const userBookings = userBookingsData?.bookings || [];
    const existingBooking = userBookings.find(booking => 
      (booking.space?.owner?.id === space?.owner?.id) &&
      (booking.advertiser?.id === user?.id || booking.host?.id === user?.id)
    );

    if (existingBooking) {
      handleOpenMessages(existingBooking);
    } else {
      toast.error('You can only message hosts after making a booking request');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Space not found</h2>
          <p className="mt-2 text-gray-600">The space you're looking for doesn't exist.</p>
          <button 
            onClick={() => window.location.href = '/search'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Space not found</h2>
          <p className="mt-2 text-gray-600">The space you're looking for doesn't exist.</p>
          <button 
            onClick={() => window.location.href = '/search'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const bookingCost = calculateBookingCost();
  const isOwner = user?.id === space?.owner?.id;
  const canBook = isAuthenticated && !isOwner;
  
  // Check if user has existing bookings with this host for messaging
  const userBookings = userBookingsData?.bookings || [];
  const existingBookingWithHost = userBookings.find(booking => 
    (booking.space?.owner?.id === space?.owner?.id) &&
    (booking.advertiser?.id === user?.id || booking.host?.id === user?.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-[4/3] w-full">
                <img
                  src={space.primary_image || `https://picsum.photos/800/600?random=${space.id}`}
                  alt={space.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/800/600?random=${space.id}`;
                  }}
                />
              </div>
            </div>

            {/* Space Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 mb-2">
                    {formatSpaceType(space.space_type)}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {space.title}
                  </h1>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {formatCurrency(space.daily_rate)}
                    <span className="text-base font-normal text-gray-500">/day</span>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {space.description}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {space.max_banner_width && (
                    <div>
                      <span className="font-medium text-gray-900">Max Banner Size:</span>
                      <span className="text-gray-600 ml-2">
                        {space.max_banner_width}" × {space.max_banner_height}"
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-900">Min Booking:</span>
                    <span className="text-gray-600 ml-2">
                      {space.minimum_booking_days || 1} day{(space.minimum_booking_days || 1) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Max Booking:</span>
                    <span className="text-gray-600 ml-2">
                      {space.maximum_booking_days || 30} days
                    </span>
                  </div>
                  {space.estimated_daily_views > 0 && (
                    <div>
                      <span className="font-medium text-gray-900">Daily Views:</span>
                      <span className="text-gray-600 ml-2">
                        {space.estimated_daily_views.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Host Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Host</h3>
              <div className="flex items-start gap-4">
                <img
                  src={space.owner?.avatar_url || `https://ui-avatars.com/api/?name=${space.owner?.first_name}&background=3b82f6&color=fff`}
                  alt={space.owner?.first_name}
                  className="h-12 w-12 rounded-full"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${space.owner?.first_name || 'User'}&background=3b82f6&color=fff`;
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {space.owner?.first_name} {space.owner?.last_name}
                  </h4>
                  {space.owner?.bio && (
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {space.owner.bio}
                    </p>
                  )}
                  
                  {/* Contact Host Button */}
                  {isAuthenticated && !isOwner && existingBookingWithHost && (
                    <button
                      onClick={handleContactHost}
                      className="mt-3 flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      Contact Host
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(space.daily_rate)}
                  <span className="text-base font-normal text-gray-500">/day</span>
                </div>
              </div>

              {canBook ? (
                showBookingForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name (Optional)
                      </label>
                      <input
                        {...register('company_name')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        {...register('start_date')}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.start_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        {...register('end_date')}
                        type="date"
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.end_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Creative Brief *
                      </label>
                      <textarea
                        {...register('creative_brief')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe your campaign, target audience, and design requirements..."
                      />
                      {errors.creative_brief && (
                        <p className="mt-1 text-sm text-red-600">{errors.creative_brief.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        {...register('special_instructions')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any special requirements or instructions..."
                      />
                    </div>

                    {bookingCost && bookingCost.isValid && (
                      <div className="border-t pt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{formatCurrency(space.daily_rate)} × {bookingCost.days} days</span>
                            <span>{formatCurrency(bookingCost.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform fee (10%)</span>
                            <span>{formatCurrency(bookingCost.platformFee)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg border-t pt-2">
                            <span>Total</span>
                            <span>{formatCurrency(bookingCost.total)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit(onSubmitBooking)}
                        disabled={createBookingMutation.isLoading || !bookingCost?.isValid}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {createBookingMutation.isLoading ? 'Sending...' : 'Send Request'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Request Booking
                  </button>
                )
              ) : isOwner ? (
                <div className="text-center text-gray-600">
                  <p className="mb-4">This is your space</p>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Manage Space
                  </button>
                </div>
              ) : !isAuthenticated ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Sign in to book this space</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
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

export default SpaceDetail;