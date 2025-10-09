import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security: Validate filename to prevent path traversal
const sanitizeFilename = (filename) => {
  // Remove any path components
  let sanitized = path.basename(filename);
  
  // Remove dangerous characters
  sanitized = sanitized
    .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace special chars with underscore
    .replace(/\.{2,}/g, '.')          // Remove consecutive dots
    .toLowerCase();
  
  // Limit length
  if (sanitized.length > 200) {
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    sanitized = name.substring(0, 200 - ext.length) + ext;
  }
  
  return sanitized;
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate cryptographically secure random filename
    const randomName = crypto.randomBytes(16).toString('hex');
    const sanitizedOriginal = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedOriginal);
    
    // Format: random-timestamp-sanitized.ext
    const filename = `${randomName}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// File filter with strict validation
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimeTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'text/csv',
    'text/markdown',
  ];
  
  // Allowed extensions
  const allowedExtensions = ['.pdf', '.txt', '.docx', '.csv', '.md'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Validate both MIME type and extension
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`), false);
  }
};

// Create multer instance with strict limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Only 1 file at a time
    fields: 10, // Max 10 fields
    fieldSize: 1 * 1024 * 1024, // 1MB per field
  },
});

export default upload;

