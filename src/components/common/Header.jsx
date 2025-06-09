import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';
import AuthModal from '../auth/AuthModal';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalUnread, hasUnread } = useUnreadMessages();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleNotificationClick = () => {
    navigate('/dashboard');
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                Highkey Visible
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/search"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Find Spaces
              </Link>
              
              {isAuthenticated && user?.user_type !== 'advertiser' && (
                <Link
                  to="/spaces/new"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  List Your Space
                </Link>
              )}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Dashboard
                  </Link>

                  {/* Notification Bell */}
                  <button
                    onClick={handleNotificationClick}
                    className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Messages"
                  >
                    <BellIcon className="h-6 w-6" />
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                  </button>
                  
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.first_name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium">{user.first_name}</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link
                to="/search"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Spaces
              </Link>
              
              {isAuthenticated && user?.user_type !== 'advertiser' && (
                <Link
                  to="/spaces/new"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  List Your Space
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  {/* Mobile Notification */}
                  <button
                    onClick={handleNotificationClick}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                  >
                    <BellIcon className="h-5 w-5 mr-2" />
                    Messages
                    {hasUnread && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                  </button>
                  
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-blue-600"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;