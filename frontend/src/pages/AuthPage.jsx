import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DecorativeShapes from '../components/DecorativeShapes';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Handle forgot password
    if (showForgotPassword) {
      try {
        await resetPassword(email);
        setSuccess('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setSuccess('');
        }, 3000);
      } catch (err) {
        console.error('Reset password error:', err);
        setError(
          err.code === 'auth/user-not-found'
            ? 'No account found with this email'
            : err.code === 'auth/invalid-email'
            ? 'Invalid email address'
            : err.message || 'Failed to send reset email. Please try again.'
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // Validation for signup
    if (!isLogin) {
      if (!displayName.trim()) {
        setError('Please enter your name');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Auth error:', err);
      
      // Better error messages
      if (err.message && err.message.includes('Firebase is not properly configured')) {
        setError('⚠️ Firebase configuration missing. Please contact administrator.');
      } else {
        setError(
          err.code === 'auth/wrong-password'
            ? 'Invalid email or password'
            : err.code === 'auth/user-not-found'
            ? 'No account found with this email'
            : err.code === 'auth/email-already-in-use'
            ? 'Email already in use'
            : err.code === 'auth/weak-password'
            ? 'Password should be at least 6 characters'
            : err.code === 'auth/invalid-email'
            ? 'Invalid email address'
            : err.code === 'auth/invalid-credential'
            ? 'Invalid email or password'
            : err.message || 'Failed to authenticate. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative overflow-hidden min-h-screen flex items-center justify-center lg:justify-between px-4 py-8 md:px-12 lg:px-24">
      <DecorativeShapes />

      {/* Left Side - Branding (desktop only) */}
      <div className="hidden lg:flex flex-col justify-center items-start relative z-10 flex-1 max-w-xl">
        <h1 className="text-6xl xl:text-7xl font-bold tracking-tighter text-accent-blue">
          RAGhost
        </h1>
        <p className="text-2xl xl:text-3xl text-gray-300 mt-4 leading-relaxed">
          Bot Hosting. <br />
          Simplified.
        </p>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-auto flex items-center justify-center relative z-10 lg:flex-1 lg:max-w-2xl">
        <div className="bg-dark-card w-full max-w-md lg:max-w-lg p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-700/50">
          {/* Mobile Branding (shown on small screens) */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-4xl font-bold tracking-tighter text-accent-blue">
              RAGhost
            </h1>
            <p className="text-base text-gray-300 mt-2">
              Bot Hosting. Simplified.
            </p>
          </div>

          {/* Header */}
          <div className="text-left mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {showForgotPassword ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              {showForgotPassword 
                ? 'Enter your email to receive a password reset link.' 
                : isLogin ? 'to continue to RAGhost.' : 'Get started with RAGhost.'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input (Only for Sign Up) */}
            {!isLogin && !showForgotPassword && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-dark-bg border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/50 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                />
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/50 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            {!showForgotPassword && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError('');
                        setSuccess('');
                      }}
                      className="text-sm font-medium text-accent-pink hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/50 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>
                {!isLogin && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Must be at least 6 characters
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password Input (Only for Sign Up) */}
            {!isLogin && !showForgotPassword && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    disabled={loading}
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/50 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-accent-blue text-white text-base sm:text-lg font-semibold rounded-lg shadow-md hover:bg-accent-blue/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-accent-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading 
                ? 'Please wait...' 
                : showForgotPassword 
                ? 'Send Reset Email' 
                : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {/* Back to Sign In (if in forgot password mode) */}
            {showForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Sign In
              </button>
            )}
          </form>

          {/* Toggle Sign In/Sign Up */}
          {!showForgotPassword && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                {isLogin ? 'No account?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                    setDisplayName('');
                    setConfirmPassword('');
                  }}
                  className="font-medium text-accent-yellow hover:underline bg-transparent border-none cursor-pointer"
                >
                  {isLogin ? 'Create one' : 'Sign In'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
