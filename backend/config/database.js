import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas with optimized connection pooling for high concurrency
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection Pool Configuration for High Load
      maxPoolSize: 50, // Maximum 50 connections in pool (default is 100)
      minPoolSize: 10, // Maintain at least 10 connections
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
    console.log(`📊 Connection Pool: Min=${conn.connection.client.options.minPoolSize}, Max=${conn.connection.client.options.maxPoolSize}`);
    
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
