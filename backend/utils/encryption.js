import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Get encryption key from environment
 * @returns {Buffer}
 */
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY not set in environment variables');
  }

  // Convert hex string to buffer (32 bytes for AES-256)
  return Buffer.from(key, 'hex');
};

/**
 * Encrypt text using AES-256-CBC
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData
 */
export const encrypt = (text) => {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv and encrypted data separated by colon
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt text using AES-256-CBC
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted plain text
 */
export const decrypt = (encryptedText) => {
  try {
    const key = getEncryptionKey();
    const [ivHex, encryptedData] = encryptedText.split(':');
    
    if (!ivHex || !encryptedData) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Generate a random encryption key (for setup purposes)
 * Run: node -e "import('./utils/encryption.js').then(m => console.log(m.generateEncryptionKey()))"
 * @returns {string}
 */
export const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};
