import React from 'react';
import PropTypes from 'prop-types';
import useAuthStore from '../../store/authStore';
import AuthModal from '../auth/AuthModal';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <AuthModal isOpen={true} onClose={() => {}} />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;