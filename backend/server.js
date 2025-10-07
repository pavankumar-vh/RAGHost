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
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: false, // Disable for widget embedding
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve widget static files
app.use('/widget', express.static(path.join(__dirname, '../widget')));

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

