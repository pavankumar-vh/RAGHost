/**
 * Security Middleware
 * Protects against common web vulnerabilities
 */

/**
 * Prevent HTTP Parameter Pollution (HPP)
 * Only allow the last value if duplicate parameters exist
 */
export const preventParameterPollution = (req, res, next) => {
  // Clean up duplicate query parameters
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = req.query[key][req.query[key].length - 1];
    }
  }
  next();
};

/**
 * Add security headers
 */
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Don't expose server info
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * Prevent information leakage in errors
 */
export const safeErrorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  const statusCode = err.statusCode || 500;
  const message = isProduction ? 'Internal server error' : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

/**
 * Detect and block SQL/NoSQL injection attempts
 */
export const detectInjection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\$where)/gi,
    /(\$ne)/gi,
    /(\$gt)/gi,
    /(\$lt)/gi,
    /(\$regex)/gi,
    /(javascript:)/gi,
    /(<script)/gi,
    /(onerror=)/gi,
    /(onload=)/gi,
    /(eval\()/gi,
    /(union.*select)/gi,
    /(insert.*into)/gi,
    /(drop.*table)/gi,
  ];
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkValue(value[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Check body
  if (req.body && checkValue(req.body)) {
    console.warn('🚨 Injection attempt detected in body:', req.ip);
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected',
      code: 'INVALID_INPUT',
    });
  }
  
  // Check query
  if (req.query && checkValue(req.query)) {
    console.warn('🚨 Injection attempt detected in query:', req.ip);
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected',
      code: 'INVALID_INPUT',
    });
  }
  
  next();
};

/**
 * Request size limiter to prevent DoS
 */
export const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const maxSizeBytes = parseSize(maxSize);
      if (parseInt(contentLength) > maxSizeBytes) {
        return res.status(413).json({
          success: false,
          error: 'Request entity too large',
          code: 'REQUEST_TOO_LARGE',
        });
      }
    }
    
    next();
  };
};

/**
 * Parse size string to bytes
 */
function parseSize(size) {
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024,
  };
  
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)$/);
  if (!match) {
    return 10 * 1024 * 1024; // Default 10MB
  }
  
  return parseInt(match[1]) * units[match[2]];
}

/**
 * Prevent brute force attacks - Track failed attempts
 */
const failedAttempts = new Map();

export const preventBruteForce = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!failedAttempts.has(identifier)) {
      failedAttempts.set(identifier, { count: 0, resetAt: now + windowMs });
    }
    
    const attempts = failedAttempts.get(identifier);
    
    // Reset if window expired
    if (now > attempts.resetAt) {
      attempts.count = 0;
      attempts.resetAt = now + windowMs;
    }
    
    // Check if blocked
    if (attempts.count >= maxAttempts) {
      const remainingTime = Math.ceil((attempts.resetAt - now) / 1000 / 60);
      return res.status(429).json({
        success: false,
        error: `Too many attempts. Please try again in ${remainingTime} minutes.`,
        code: 'TOO_MANY_ATTEMPTS',
      });
    }
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end to track failures
    res.end = function(...args) {
      if (res.statusCode === 401 || res.statusCode === 403) {
        attempts.count++;
        console.warn(`⚠️ Failed attempt ${attempts.count}/${maxAttempts} from ${identifier}`);
      } else if (res.statusCode < 400) {
        // Success - reset counter
        attempts.count = 0;
      }
      
      originalEnd.apply(res, args);
    };
    
    next();
  };
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [identifier, attempts] of failedAttempts.entries()) {
    if (now > attempts.resetAt) {
      failedAttempts.delete(identifier);
    }
  }
}, 60 * 1000); // Clean every minute
