import { verifyToken } from '../config/firebase.js';
import User from '../models/User.js';

/**
 * Middleware to verify Firebase ID token
 * Attaches user info to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please include Authorization: Bearer <token>',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify token with Firebase
    const decodedToken = await verifyToken(idToken);

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };

    // Update or create user in MongoDB
    await User.findOneAndUpdate(
      { firebaseUid: decodedToken.uid },
      {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || null,
        photoURL: decodedToken.picture || null,
        lastLogin: new Date(),
      },
      { upsert: true, new: true }
    );

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};
