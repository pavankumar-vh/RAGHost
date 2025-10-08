import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cluster from 'cluster';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import connectDB from './config/database.js';
import './config/firebase.js'; // Initialize Firebase (will warn if not configured)
import { initializeRedis, isRedisCacheAvailable, getRedisClient } from './config/redis.js';
import { initializeQueues, areQueuesAvailable, getQueueStats, closeQueues } from './config/queue.js';
import { setupCluster, getClusterInfo } from './config/cluster.js';
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

// Trust proxy - important for rate limiting behind reverse proxies (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Memory-optimized mode for 512MB environments (OPT-IN via ENABLE_LOW_MEMORY=true)
// By default, runs in normal mode with full performance
const isLowMemory = process.env.ENABLE_LOW_MEMORY === 'true';

if (isLowMemory) {
  console.log('⚠️  LOW MEMORY MODE ENABLED - Performance will be reduced to fit 512MB');
}

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: isLowMemory ? 4 : 6, // Lower compression level for less CPU/memory usage
  threshold: isLowMemory ? 2048 : 1024, // Compress only larger responses in low memory
  memLevel: isLowMemory ? 7 : 8, // Reduce memory usage for compression
}));

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
}));

// Enhanced rate limiting for different endpoints
// ===================================
// RATE LIMITING (DDoS Protection)
// ===================================
const createRateLimiter = (windowMs, max, message) => {
  const limiterConfig = {
    windowMs,
    max,
    message: { success: false, error: message },
    standardHeaders: true,
    legacyHeaders: false,
  };
  
  // Note: Redis-backed rate limiting would require dynamic import
  // For now, using in-memory rate limiting (works fine for single instance)
  // If you need distributed rate limiting, consider using rate-limit-redis
  
  return rateLimit(limiterConfig);
};

// Different rate limits for different endpoints
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests from this IP, please try again later.'
);

const chatLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  30, // 30 chat messages per minute
  'Too many chat requests, please slow down.'
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 auth attempts
  'Too many authentication attempts, please try again later.'
);

const knowledgeLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50, // 50 knowledge uploads
  'Too many document uploads, please try again later.'
);

// Apply rate limiters
app.use('/api/keys', authenticate, generalLimiter);
app.use('/api/bots', authenticate, generalLimiter);
app.use('/api/analytics', authenticate, generalLimiter);
app.use('/api/chat', chatLimiter); // Stricter for public chat endpoint
app.use('/api/knowledge', authenticate, knowledgeLimiter);

// Memory-optimized body parsing
const bodyLimit = isLowMemory ? '5mb' : '10mb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// Serve widget static files with proper headers
app.use('/widget', (req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../widget')));

// Health check route with comprehensive system status
app.get('/health', async (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const mongoose = (await import('mongoose')).default;
  
  const healthData = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    server: {
      pid: process.pid,
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    },
    database: {
      status: dbState[mongoose.connection.readyState],
      host: mongoose.connection.host,
    },
    firebase: process.env.FIREBASE_PROJECT_ID ? 'configured' : 'not configured',
    redis: isRedisCacheAvailable() ? 'connected' : 'not available',
    queues: areQueuesAvailable() ? 'active' : 'not available',
    clustering: {
      enabled: process.env.ENABLE_CLUSTERING === 'true',
      ...(cluster.isWorker && { workerId: cluster.worker.id }),
    },
  };

  // Add queue statistics if available
  if (areQueuesAvailable()) {
    try {
      healthData.queueStats = await getQueueStats();
    } catch (error) {
      healthData.queueStats = { error: 'Unable to fetch queue stats' };
    }
  }

  res.status(200).json(healthData);
});

// API Routes
// Public bot route (must come before authenticated routes)
app.get('/api/bots/public/:id', async (req, res, next) => {
  try {
    const { getBotById } = await import('./controllers/botsController.js');
    return getBotById(req, res, next);
  } catch (error) {
    next(error);
  }
});

app.use('/api/keys', authenticate, keysRoutes);
app.use('/api/bots', authenticate, botsRoutes);
app.use('/api/knowledge', authenticate, knowledgeRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/chat', chatRoutes); // Public chat API (no auth required)
app.use('/api/widget', widgetRoutes); // Widget embed code generation

// Error handling
app.use(notFound);
app.use(errorHandler);

/**
 * Start the server with optional memory optimizations
 * Set ENABLE_LOW_MEMORY=true for 512MB environments (Render free tier)
 * Default: Normal mode with full performance
 */
const startServer = async () => {
  try {
    console.log(`\n� Starting server...`);
    console.log(`�💾 Memory Mode: ${isLowMemory ? '512MB OPTIMIZED (Reduced Performance)' : 'NORMAL (Full Performance)'}`);
    
    // Initialize database connection
    await connectDB();

    // Initialize Redis cache (optional - improves performance)
    // Can be disabled in low memory mode by not setting ENABLE_CACHING
    if (process.env.ENABLE_CACHING !== 'false') {
      await initializeRedis();
    } else {
      console.log('⚠️  Redis cache disabled by configuration');
    }

    // Initialize Bull queues (requires Redis)
    // Automatically disabled if Redis is not available
    if (isRedisCacheAvailable() && process.env.ENABLE_QUEUES !== 'false') {
      await initializeQueues();
    } else {
      console.log('⚠️  Background job queues disabled (Redis not available or disabled)');
    }

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`\n✅ Server initialization complete`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`💾 Redis Cache: ${isRedisCacheAvailable() ? '✅ Active' : '❌ Not available'}`);
      console.log(`📬 Job Queues: ${areQueuesAvailable() ? '✅ Active' : '❌ Not available'}`);
      console.log(`👷 Clustering: ${process.env.ENABLE_CLUSTERING === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
      
      if (cluster.isWorker) {
        console.log(`🔹 Worker ID: ${cluster.worker.id}, PID: ${process.pid}`);
      }
      console.log('');
    });

    // Set keep-alive timeout for long-polling support
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // Slightly more than keepAliveTimeout

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal) => {
      console.log(`\n📥 ${signal} received: closing HTTP server gracefully...`);
      
      server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
          // Close queue connections
          if (areQueuesAvailable()) {
            await closeQueues();
          }

          // Close database connection
          const mongoose = (await import('mongoose')).default;
          await mongoose.connection.close();
          console.log('✅ Database connection closed');

          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 15 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 15000);
    };

    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Promise Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start server with clustering support if enabled
if (process.env.ENABLE_CLUSTERING === 'true') {
  setupCluster(startServer);
} else {
  startServer();
}

