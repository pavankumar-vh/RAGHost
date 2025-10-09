import mongoose from 'mongoose';

/**
 * Sanitize string to prevent NoSQL injection
 * @param {any} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // Remove MongoDB operators
  const sanitized = input
    .replace(/\$/g, '')  // Remove $ signs used in MongoDB operators
    .replace(/\{/g, '')  // Remove curly braces
    .replace(/\}/g, '')
    .replace(/\[/g, '')  // Remove square brackets
    .replace(/\]/g, '')
    .trim();
  
  return sanitized;
};

/**
 * Sanitize object to prevent NoSQL injection
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip keys that start with $ (MongoDB operators)
    if (key.startsWith('$')) {
      continue;
    }
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - Whether ID is valid
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
};

/**
 * Sanitize HTML to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize file path to prevent directory traversal
 * @param {string} filename - Filename to validate
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }
  
  // Remove path traversal attempts
  let sanitized = filename
    .replace(/\.\./g, '')  // Remove ..
    .replace(/\\/g, '')    // Remove backslashes
    .replace(/\//g, '')    // Remove forward slashes
    .replace(/~/g, '')     // Remove tilde
    .trim();
  
  // Only allow alphanumeric, dots, hyphens, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9.-_]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }
  
  return sanitized;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Middleware to sanitize query parameters
 */
export const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
};

/**
 * Middleware to validate message length
 */
export const validateMessageLength = (req, res, next) => {
  const MAX_MESSAGE_LENGTH = 5000; // 5000 characters max
  
  if (req.body.message && req.body.message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`,
      code: 'MESSAGE_TOO_LONG',
    });
  }
  
  next();
};

/**
 * Middleware to validate bot ID
 */
export const validateBotId = (req, res, next) => {
  const { botId } = req.params;
  
  if (!botId || !isValidObjectId(botId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid bot ID format',
      code: 'INVALID_BOT_ID',
    });
  }
  
  next();
};
