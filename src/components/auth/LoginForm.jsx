import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginForm = ({ onSuccess }) => {
  const { login, loading, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      clearError();
      console.log('Submitting login form with:', data);
      
      const result = await login(data);
      console.log('Login result:', result);
      
      if (result.success) {
        toast.success('Welcome back!', {
          style: {
            background: '#10b981',
            color: '#ffffff',
          },
        });
        reset();
        onSuccess?.();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed', {
        style: {
          background: '#ef4444',
          color: '#ffffff',
        },
      });
    }
  };

  // Quick login function for demo accounts
  const quickLogin = async (email, password) => {
    try {
      clearError();
      console.log('Quick login attempt:', { email });
      
      const result = await login({ email, password });
      console.log('Quick login result:', result);
      
      if (result.success) {
        toast.success('Welcome back!', {
          style: {
            background: '#10b981',
            color: '#ffffff',
          },
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Quick login error:', error);
      toast.error(error.message || 'Login failed', {
        style: {
          background: '#ef4444',
          color: '#ffffff',
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 input-field"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            className="mt-1 input-field"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Demo Login:</p>
        <div className="space-y-2">
          <button
            onClick={() => quickLogin('john.smith@example.com', 'password123')}
            className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <span className="font-medium text-blue-600">Host:</span> john.smith@example.com
          </button>
          <button
            onClick={() => quickLogin('jennifer.marketing@example.com', 'password123')}
            className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <span className="font-medium text-green-600">Advertiser:</span> jennifer.marketing@example.com
          </button>
        </div>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  onSuccess: PropTypes.func,
};

export default LoginForm;