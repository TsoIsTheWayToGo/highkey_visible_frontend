import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useAuthStore from '../../store/authStore';
import AuthModal from '../auth/AuthModal';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  if (!isAuthenticated) {
    return (
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;