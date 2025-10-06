import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = () => {
  try {
    const serviceAccountPath = path.resolve(
      __dirname,
      '..',
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json'
    );

    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('💡 Make sure firebase-service-account.json exists in the backend root');
    process.exit(1);
  }
};

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
export const verifyToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export default initializeFirebase;
