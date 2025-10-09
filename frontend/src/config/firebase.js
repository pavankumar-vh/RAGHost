import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Detect if running in incognito/private mode
const isIncognitoMode = () => {
  try {
    // Try to access localStorage
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    
    // Check if we're in a private browsing session
    // In some browsers, localStorage exists but has 0 quota in private mode
    if (localStorage.length === 0 && sessionStorage.length === 0) {
      return true;
    }
    
    return false;
  } catch (e) {
    // If localStorage throws an error, we're likely in incognito
    return true;
  }
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
    
    // Set persistence based on browser mode
    // SESSION: Auth state is only stored in the current session/tab
    // LOCAL: Auth state persists even when browser is closed and reopened
    const persistenceMode = isIncognitoMode() ? browserSessionPersistence : browserLocalPersistence;
    
    setPersistence(auth, persistenceMode)
      .then(() => {
        console.log('✅ Firebase initialized with', isIncognitoMode() ? 'SESSION' : 'LOCAL', 'persistence');
      })
      .catch((error) => {
        console.error('❌ Error setting persistence:', error);
      });
      
  } else {
    // Create a mock auth object for development
    console.warn('⚠️ Using mock auth - Firebase not properly configured');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export { auth };
export default app;

