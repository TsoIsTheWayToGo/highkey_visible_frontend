import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { UserIcon, CameraIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import usersService from '../services/users';
import LoadingSpinner from '../components/common/LoadingSpinner';

const profileSchema = yup.object({
  first_name: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  last_name: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  phone: yup
    .string()
    .matches(/^[\+]?[1-9][\d\s\-\(\)]{7,15}$/, 'Invalid phone number')
    .nullable(),
  bio: yup
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .nullable(),
});

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    },
  });

  const updateProfileMutation = useMutation(usersService.updateProfile, {
    onSuccess: (data) => {
      updateUser(data.user);
      queryClient.invalidateQueries('dashboard');
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Failed to update profile');
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const profileData = { ...data };
    
    // For MVP, we'll just store the avatar preview as a data URL
    // In production, you'd upload to S3 and get a URL
    if (avatarPreview) {
      profileData.avatar_url = avatarPreview;
    }

    updateProfileMutation.mutate(profileData);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const getUserTypeDisplay = (userType) => {
    switch (userType) {
      case 'host':
        return 'Space Owner';
      case 'advertiser':
        return 'Advertiser';
      case 'both':
        return 'Space Owner & Advertiser';
      default:
        return userType;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={avatarPreview || user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=3b82f6&color=fff&size=128`}
                      alt={user?.first_name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                    <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                      <CameraIcon className="h-4 w-4 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
                    <p className="text-sm text-gray-500">Upload a new avatar (max 5MB)</p>
                    {avatarFile && (
                      <p className="text-sm text-green-600 mt-1">
                        New photo selected: {avatarFile.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      {...register('first_name')}
                      type="text"
                      className="input-field"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      {...register('last_name')}
                      type="text"
                      className="input-field"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="input-field bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="input-field"
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Type
                    </label>
                    <input
                      type="text"
                      value={getUserTypeDisplay(user?.user_type)}
                      disabled
                      className="input-field bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Contact support to change user type</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="input-field"
                    placeholder="Tell others about yourself, your business, or what you're looking for..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    This will be visible to other users when you book spaces or list your property.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isLoading}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={updateProfileMutation.isLoading}
                    className="btn-primary flex items-center"
                  >
                    {updateProfileMutation.isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                    {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-6">
                  <img
                    src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=3b82f6&color=fff&size=128`}
                    alt={user?.first_name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-gray-600">{getUserTypeDisplay(user?.user_type)}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{user?.first_name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{user?.last_name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user?.phone || 'Not provided'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        User Type
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {getUserTypeDisplay(user?.user_type)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Member Since
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user?.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {user?.bio ? (
                      <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                        {user.bio}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No bio provided yet. Click "Edit Profile" to add one.
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Actions */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </button>
                    
                    {user?.user_type !== 'advertiser' && (
                      <button
                        onClick={() => window.location.href = '/spaces/new'}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <UserIcon className="h-4 w-4 mr-2" />
                        List a Space
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Security</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-500">Last updated: Unknown</p>
                </div>
                <button className="btn-secondary">
                  Change Password
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <button className="btn-secondary">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;