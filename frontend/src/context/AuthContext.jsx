import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      if (!auth) {
        throw new Error('Firebase is not properly configured. Please check your .env file.');
      }
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      if (!auth) {
        throw new Error('Firebase is not properly configured. Please check your .env file.');
      }
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase is not properly configured. Please check your .env file.');
      }
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    if (!auth) {
      return Promise.reject(new Error('Firebase is not properly configured'));
    }
    return signOut(auth);
  };

  // Forgot Password - Send reset email
  const resetPassword = async (email) => {
    try {
      if (!auth) {
        throw new Error('Firebase is not properly configured. Please check your .env file.');
      }
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent! Check your inbox.' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Get ID Token
  const getIdToken = async () => {
    if (currentUser) {
      try {
        // Force token refresh to ensure it's valid
        return await currentUser.getIdToken(true);
      } catch (error) {
        console.error('Error getting ID token:', error);
        // If token refresh fails, user might be logged out
        await logout();
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setError('Firebase is not configured. Please add your Firebase credentials to .env');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        console.log('✅ User authenticated:', user.email);
        
        // Validate token on auth state change
        user.getIdToken(true).catch((error) => {
          console.error('Token validation failed:', error);
          signOut(auth);
        });
      } else {
        console.log('❌ No user authenticated');
      }
    }, (error) => {
      console.error('Auth state change error:', error);
      setError(error.message);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    signInWithGoogle,
    resetPassword,
    getIdToken,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
