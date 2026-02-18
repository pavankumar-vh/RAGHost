import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Bot, Zap, Shield, RefreshCw } from 'lucide-react';

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

    if (showForgotPassword) {
      try {
        await resetPassword(email);
        setSuccess('Password reset email sent! Check your inbox.');
        setTimeout(() => { setShowForgotPassword(false); setSuccess(''); }, 3000);
      } catch (err) {
        setError(
          err.code === 'auth/user-not-found' ? 'No account found with this email' :
          err.code === 'auth/invalid-email' ? 'Invalid email address' :
          err.message || 'Failed to send reset email.'
        );
      } finally { setLoading(false); }
      return;
    }

    if (!isLogin) {
      if (!displayName.trim()) { setError('Please enter your name'); setLoading(false); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    }

    try {
      if (isLogin) await login(email, password);
      else await signup(email, password, displayName);
      navigate('/dashboard');
    } catch (err) {
      if (err.message?.includes('Firebase is not properly configured')) {
        setError('Firebase configuration missing. Please contact administrator.');
      } else {
        setError(
          err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' ? 'Invalid email or password' :
          err.code === 'auth/user-not-found' ? 'No account found with this email' :
          err.code === 'auth/email-already-in-use' ? 'Email already in use' :
          err.code === 'auth/weak-password' ? 'Password should be at least 6 characters' :
          err.code === 'auth/invalid-email' ? 'Invalid email address' :
          err.message || 'Failed to authenticate. Please try again.'
        );
      }
    } finally { setLoading(false); }
  };

  const features = [
    { icon: Bot, label: 'Deploy AI Chatbots', color: 'bg-nb-yellow' },
    { icon: Zap, label: 'RAG-Powered Responses', color: 'bg-nb-pink' },
    { icon: Shield, label: 'Secure & Scalable', color: 'bg-nb-blue' },
  ];

  return (
    <div className="min-h-screen bg-nb-bg flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-black text-white p-12 relative overflow-hidden">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Yellow accent blob */}
        <div className="absolute top-20 right-10 w-48 h-48 bg-nb-yellow rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-nb-pink rounded-full opacity-20 blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-nb-yellow text-black font-bold px-3 py-1 border-2 border-white text-sm mb-6 lg:mb-8">
            <Bot size={16} />
            RAGhost Platform
          </div>
          <h1 className="text-4xl xl:text-6xl font-bold leading-tight tracking-tight">
            Bot Hosting.<br />
            <span className="text-nb-yellow">Simplified.</span>
          </h1>
          <p className="text-gray-400 mt-4 text-base lg:text-lg leading-relaxed max-w-sm">
            Deploy intelligent AI chatbots with your own knowledge base in minutes.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {features.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-8 h-8 ${color} border-2 border-white flex items-center justify-center`}>
                <Icon size={16} className="text-black" />
              </div>
              <span className="text-white font-medium">{label}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-gray-600 text-sm">
          © 2026 RAGhost · All rights reserved
        </p>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-black text-white font-bold px-4 py-2 border-3 border-black shadow-nb mb-2">
              <Bot size={18} />
              RAGhost
            </div>
            <p className="text-nb-muted text-sm mt-1">Bot Hosting. Simplified.</p>
          </div>

          {/* Card */}
          <div className="nb-card p-5 sm:p-8">
            {/* Header */}
            <div className="mb-5 sm:mb-7">
              <h2 className="text-2xl sm:text-3xl font-bold text-nb-text tracking-tight">
                {showForgotPassword ? 'Reset Password' : isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-nb-muted mt-1 text-sm">
                {showForgotPassword
                  ? 'Enter your email to receive a reset link.'
                  : isLogin
                  ? 'Sign in to your RAGhost dashboard.'
                  : 'Get started with RAGhost for free.'}
              </p>
            </div>

            {/* Success */}
            {success && (
              <div className="mb-5 p-3 bg-green-50 border-2 border-nb-green rounded flex items-center gap-2 text-green-700 text-sm font-medium animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-nb-green flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 border-2 border-nb-red rounded flex items-center gap-2 text-red-700 text-sm font-medium animate-shake animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-nb-red flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name - signup only */}
              {!isLogin && !showForgotPassword && (
                <div>
                  <label className="block text-sm font-bold text-nb-text mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      required={!isLogin}
                      disabled={loading}
                      className="nb-input pl-9"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-nb-text mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="nb-input pl-9"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              {!showForgotPassword && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-nb-text">Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(true); setError(''); setSuccess(''); }}
                        className="text-xs font-bold text-black underline underline-offset-2 hover:text-nb-pink transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                      className="nb-input pl-9"
                      placeholder="••••••••"
                    />
                  </div>
                  {!isLogin && <p className="mt-1 text-xs text-nb-muted">At least 6 characters</p>}
                </div>
              )}

              {/* Confirm Password - signup only */}
              {!isLogin && !showForgotPassword && (
                <div>
                  <label className="block text-sm font-bold text-nb-text mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required={!isLogin}
                      disabled={loading}
                      minLength={6}
                      className="nb-input pl-9"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="nb-btn-black nb-btn-lg w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Please wait...
                  </span>
                ) : showForgotPassword ? 'Send Reset Email' : isLogin ? (
                  <span className="flex items-center gap-2">Sign In <ArrowRight size={16} /></span>
                ) : (
                  <span className="flex items-center gap-2">Create Account <ArrowRight size={16} /></span>
                )}
              </button>

              {/* Back to signin */}
              {showForgotPassword && (
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setError(''); setSuccess(''); }}
                  className="w-full py-2 text-sm font-bold text-nb-muted hover:text-black transition-colors text-center"
                >
                  ← Back to Sign In
                </button>
              )}
            </form>

            {/* Toggle */}
            {!showForgotPassword && (
              <div className="mt-6 pt-5 border-t-2 border-gray-100 text-center">
                <p className="text-sm text-nb-muted">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); setDisplayName(''); setConfirmPassword(''); }}
                    className="font-bold text-black underline underline-offset-2 decoration-nb-yellow hover:text-nb-pink transition-colors"
                  >
                    {isLogin ? 'Sign up free' : 'Sign in'}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;


