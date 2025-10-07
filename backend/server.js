import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import connectDB from './config/database.js';
import initializeFirebase from './config/firebase.js';
import keysRoutes from './routes/keys.js';
import botsRoutes from './routes/bots.js';
import chatRoutes from './routes/chat.js';
import knowledgeRoutes from './routes/knowledge.js';
import widgetRoutes from './routes/widgetRoutes.js';
import analyticsRoutes from './routes/analytics.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: false, // Disable for widget embedding
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

// CORS configuration - allow widget embedding from any origin
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Production and development allowed origins
    const allowedOrigins = [
      'https://rag-host.vercel.app', // Production frontend
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000'
    ];
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('file://') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // For widget embedding, allow all origins (since widgets can be embedded anywhere)
    // If you want to restrict this, uncomment the line below and comment out the return callback
    // return callback(new Error('Not allowed by CORS'));
    return callback(null, true); // Allow all for widget embedding
  },
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve widget static files with proper headers
app.use('/widget', (req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../widget')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/keys', authenticate, keysRoutes);
app.use('/api/bots', authenticate, botsRoutes);
app.use('/api/knowledge', authenticate, knowledgeRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/chat', chatRoutes); // Public chat API (no auth required)
app.use('/api/widget', widgetRoutes); // Widget embed code generation

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize and start server
await connectDB();
initializeFirebase();

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health\n`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Explicit keep-alive to prevent process exit
setInterval(() => {
  // This keeps the event loop active
}, 1000 * 60 * 60); // Run every hour

console.log('✅ Server initialization complete');
console.log('Process ID:', process.pid);

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

