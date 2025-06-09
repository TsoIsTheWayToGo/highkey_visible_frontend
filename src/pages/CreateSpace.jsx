import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import { PhotoIcon, MapPinIcon } from '@heroicons/react/24/outline';
import spacesService from '../services/spaces';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SPACE_TYPES } from '../utils/constants';

const spaceSchema = yup.object({
  title: yup
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters')
    .required('Title is required'),
  description: yup
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .required('Description is required'),
  space_type: yup
    .string()
    .required('Space type is required'),
  street_address: yup
    .string()
    .required('Street address is required'),
  city: yup
    .string()
    .required('City is required'),
  state: yup
    .string()
    .required('State is required'),
  zip_code: yup
    .string()
    .matches(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
    .required('ZIP code is required'),
  daily_rate: yup
    .number()
    .min(5, 'Minimum daily rate is $5')
    .max(1000, 'Maximum daily rate is $1000')
    .required('Daily rate is required'),
  max_banner_width: yup
    .number()
    .min(12, 'Minimum width is 12 inches')
    .max(120, 'Maximum width is 120 inches'),
  max_banner_height: yup
    .number()
    .min(6, 'Minimum height is 6 inches')
    .max(96, 'Maximum height is 96 inches'),
  estimated_daily_views: yup
    .number()
    .min(0, 'Views cannot be negative')
    .max(50000, 'Maximum estimated views is 50,000'),
});

const CreateSpace = () => {
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [geocoding, setGeocoding] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(spaceSchema),
    defaultValues: {
      daily_rate: 25,
      max_banner_width: 48,
      max_banner_height: 24,
      estimated_daily_views: 500,
      minimum_booking_days: 1,
      maximum_booking_days: 30,
    },
  });

  const createSpaceMutation = useMutation(spacesService.createSpace, {
    onSuccess: (data) => {
      toast.success('Space created successfully!');
      navigate(`/spaces/${data.space.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Failed to create space');
    },
  });

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const geocodeAddress = async () => {
    const address = `${watch('street_address')}, ${watch('city')}, ${watch('state')} ${watch('zip_code')}`;
    
    if (!address.trim()) {
      toast.error('Please fill in the address fields');
      return;
    }

    setGeocoding(true);
    try {
      const response = await spacesService.geocode(address);
      setCoordinates(response);
      setValue('latitude', response.latitude);
      setValue('longitude', response.longitude);
      toast.success('Address verified!');
    } catch (error) {
      toast.error('Could not verify address. Please check and try again.');
    } finally {
      setGeocoding(false);
    }
  };

  const onSubmit = async (data) => {
    if (!coordinates) {
      toast.error('Please verify your address first');
      return;
    }

    // For MVP, we'll use placeholder images
    // In production, you'd upload to AWS S3 first
    const spaceData = {
      ...data,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      features: {
        lighting: data.lighting || false,
        weather_protected: data.weather_protected || false,
      },
    };

    createSpaceMutation.mutate(spaceData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">List Your Space</h1>
            <p className="text-gray-600 mt-2">
              Create a listing for your advertising space and start earning money.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="input-field"
                    placeholder="e.g., High-Traffic Corner Yard - Perfect for Local Ads"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="input-field"
                    placeholder="Describe your space, its visibility, target audience, and what makes it special for advertisers..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Space Type *
                  </label>
                  <select {...register('space_type')} className="input-field">
                    <option value="">Select space type</option>
                    {SPACE_TYPES.filter(type => type.value).map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.space_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.space_type.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    {...register('street_address')}
                    type="text"
                    className="input-field"
                    placeholder="123 Main Street"
                  />
                  {errors.street_address && (
                    <p className="mt-1 text-sm text-red-600">{errors.street_address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      className="input-field"
                      placeholder="Dallas"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      {...register('state')}
                      type="text"
                      className="input-field"
                      placeholder="TX"
                      maxLength={2}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      {...register('zip_code')}
                      type="text"
                      className="input-field"
                      placeholder="75248"
                    />
                    {errors.zip_code && (
                      <p className="mt-1 text-sm text-red-600">{errors.zip_code.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={geocodeAddress}
                    disabled={geocoding}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {geocoding ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <MapPinIcon className="h-4 w-4" />
                    )}
                    {geocoding ? 'Verifying...' : 'Verify Address'}
                  </button>
                  {coordinates && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Address verified successfully
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Rate * ($)
                  </label>
                  <input
                    {...register('daily_rate')}
                    type="number"
                    min="5"
                    max="1000"
                    step="1"
                    className="input-field"
                    placeholder="25"
                  />
                  {errors.daily_rate && (
                    <p className="mt-1 text-sm text-red-600">{errors.daily_rate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Daily Views
                  </label>
                  <input
                    {...register('estimated_daily_views')}
                    type="number"
                    min="0"
                    max="50000"
                    className="input-field"
                    placeholder="500"
                  />
                  {errors.estimated_daily_views && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimated_daily_views.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Banner Width (inches)
                  </label>
                  <input
                    {...register('max_banner_width')}
                    type="number"
                    min="12"
                    max="120"
                    className="input-field"
                    placeholder="48"
                  />
                  {errors.max_banner_width && (
                    <p className="mt-1 text-sm text-red-600">{errors.max_banner_width.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Banner Height (inches)
                  </label>
                  <input
                    {...register('max_banner_height')}
                    type="number"
                    min="6"
                    max="96"
                    className="input-field"
                    placeholder="24"
                  />
                  {errors.max_banner_height && (
                    <p className="mt-1 text-sm text-red-600">{errors.max_banner_height.message}</p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Features
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      {...register('lighting')}
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Good lighting (visible at night)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...register('weather_protected')}
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Weather protected</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Images Section (Placeholder for MVP) */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Photo upload coming soon!</p>
                <p className="text-sm text-gray-500">
                  For now, placeholder images will be used. Full image upload functionality will be added soon.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSpaceMutation.isLoading || !coordinates}
                  className="btn-primary flex items-center gap-2"
                >
                  {createSpaceMutation.isLoading && <LoadingSpinner size="sm" />}
                  {createSpaceMutation.isLoading ? 'Creating...' : 'Create Space'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSpace;