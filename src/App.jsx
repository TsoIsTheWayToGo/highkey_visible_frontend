import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster } from 'react-hot-toast';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

import Home from './pages/Home';
import Search from './pages/Search';
import SpaceDetail from './pages/SpaceDetail';
import Dashboard from './pages/Dashboard';
import CreateSpace from './pages/CreateSpace';
import Profile from './pages/Profile';

import useAuthStore from './store/authStore';
import webSocketService from './services/websocket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    try {
      initializeAuth();
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }, [initializeAuth]);

  useEffect(() => {
    if (!webSocketService) return;

    let unsubscribe = null;

    const setupWebSocket = async () => {
      try {
        const authState = useAuthStore.getState();

        if (authState?.isAuthenticated) {
          const token = localStorage.getItem('authToken');
          if (token) {
            webSocketService.connect(token);
          }
        }

        unsubscribe = useAuthStore.subscribe((state) => {
          try {
            if (!webSocketService) return;

            const status = webSocketService.getConnectionStatus();

            if (state?.isAuthenticated && !status.isConnected) {
              const token = localStorage.getItem('authToken');
              if (token) {
                webSocketService.connect(token);
              }
            } else if (!state?.isAuthenticated && status.isConnected) {
              webSocketService.disconnect();
            }
          } catch (error) {
            console.error('Error in WebSocket auth state handler:', error);
          }
        });
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    };

    setupWebSocket();

    return () => {
      try {
        if (unsubscribe) {
          unsubscribe();
        }
        if (webSocketService) {
          webSocketService.disconnect();
        }
      } catch (error) {
        console.error('Error cleaning up WebSocket:', error);
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/spaces/:id" element={<SpaceDetail />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/spaces/new"
                  element={
                    <ProtectedRoute>
                      <CreateSpace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                          Page Not Found
                        </h1>
                        <p className="text-gray-600 mb-4">
                          The page you're looking for doesn't exist.
                        </p>
                        <button
                          onClick={() => window.location.href = '/'}
                          className="btn-primary"
                        >
                          Go Home
                        </button>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </Router>
        {import.meta.env.DEV && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;