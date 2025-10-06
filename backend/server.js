import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import configurations
import connectDB from './config/database.js';
import initializeFirebase from './config/firebase.js';

// Import routes
import keysRoutes from './routes/keys.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// 1. Initialize Database & Firebase
// ========================================
connectDB();
initializeFirebase();

// ========================================
// 2. Security Middleware
// ========================================
// Helmet - Set security headers
app.use(helmet());

// CORS - Allow frontend origins
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting - Prevent abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ========================================
// 3. Body Parsing
// ========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// 4. Health Check Route
// ========================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 5. API Routes
// ========================================
app.use('/api/keys', keysRoutes);

// ========================================
// 6. Error Handling
// ========================================
app.use(notFound);
app.use(errorHandler);

// ========================================
// 7. Start Server
// ========================================
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});
