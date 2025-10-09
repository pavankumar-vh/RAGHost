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
        code: 'NO_TOKEN',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Basic token format validation
    if (!idToken || idToken.length < 100) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT',
      });
    }

    // Verify token with Firebase
    const decodedToken = await verifyToken(idToken);
    
    // Additional security: Check if email is verified (optional, uncomment if needed)
    // if (!decodedToken.email_verified) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Email not verified',
    //     code: 'EMAIL_NOT_VERIFIED',
    //   });
    // }

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
    
    // Determine error code
    let errorCode = 'INVALID_TOKEN';
    if (error.message.includes('expired')) {
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.message.includes('revoked')) {
      errorCode = 'TOKEN_REVOKED';
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
