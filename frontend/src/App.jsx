import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import EmbedPage from './pages/EmbedPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-nb-bg gap-3">
        <div className="w-10 h-10 border-4 border-black border-t-nb-yellow animate-spin" />
        <p className="text-sm font-bold text-nb-muted">Loading...</p>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/auth" />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-nb-bg gap-3">
        <div className="w-10 h-10 border-4 border-black border-t-nb-yellow animate-spin" />
        <p className="text-sm font-bold text-nb-muted">Loading...</p>
      </div>
    );
  }

  return currentUser ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Public Chat Route (for embedded widget) */}
            <Route path="/chat/:botId" element={<ChatPage />} />
            
            {/* Embed Route (for iframe embeds) */}
            <Route path="/embed/:botId" element={<EmbedPage />} />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
