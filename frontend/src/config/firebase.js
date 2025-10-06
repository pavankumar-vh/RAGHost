import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
  const missing = requiredKeys.filter(key => !firebaseConfig[key] || firebaseConfig[key].includes('your-'));
  
  if (missing.length > 0) {
    console.error('❌ Firebase configuration error: Missing or invalid values for:', missing);
    console.error('Please update frontend/.env with your Firebase Web App credentials');
    console.error('Get them from: Firebase Console > Project Settings > Your apps > Web app');
    return false;
  }
  return true;
};

// Initialize Firebase
let app;
let auth;

try {
  if (validateConfig()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    // Create a mock auth object for development
    console.warn('⚠️ Using mock auth - Firebase not properly configured');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export { auth };
export default app;

