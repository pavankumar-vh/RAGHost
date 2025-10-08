import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas with optimized connection pooling for high concurrency
 * Memory-optimized for 512MB environments (Render free tier)
 */
const connectDB = async () => {
  try {
    // Detect if running on low-memory environment (Render free tier)
    const isLowMemory = process.env.NODE_ENV === 'production' && 
                        !process.env.ENABLE_HIGH_MEMORY;
    
    const poolConfig = isLowMemory 
      ? { maxPoolSize: 5, minPoolSize: 2 }   // Low memory: 5 max, 2 min
      : { maxPoolSize: 50, minPoolSize: 10 }; // High memory: 50 max, 10 min
    
    console.log(`🔧 Database Pool Config: ${isLowMemory ? 'Low Memory Mode' : 'Standard Mode'}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection Pool Configuration (Memory-Optimized)
      ...poolConfig,
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      serverSelectionTimeoutMS: 10000, // Timeout after 10s if can't connect to server
      heartbeatFrequencyMS: 10000, // Check server health every 10s
      
      // Retry Logic
      maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
      retryWrites: true, // Retry failed writes once
      retryReads: true, // Retry failed reads
      
      // Performance Optimizations
      compressors: ['zlib'], // Enable compression for network traffic
      zlibCompressionLevel: 6, // Balance between speed and compression
      
      // Write Concern for Performance
      w: 'majority', // Ensure writes are acknowledged by majority of replica set
      wtimeoutMS: 5000, // Timeout write operations after 5 seconds
      journal: true, // Ensure writes are written to journal
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection Pool: Min=${poolConfig.minPoolSize}, Max=${poolConfig.maxPoolSize}`);
    console.log(`💾 Memory Mode: ${isLowMemory ? '512MB Optimized' : 'Standard'}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
    mongoose.connection.on('reconnectFailed', () => {
      console.error('❌ MongoDB reconnection failed');
    });

    // Monitor connection pool
    mongoose.connection.on('fullsetup', () => {
      console.log('✅ MongoDB replica set fully connected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // In production, you might want to retry instead of exiting
    process.exit(1);
  }
};

export default connectDB;
