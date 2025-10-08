import { createClient } from 'redis';

let redisClient = null;
let isRedisAvailable = false;

/**
 * Initialize Redis client for caching (optional - improves performance)
 */
export const initializeRedis = async () => {
  // Redis is optional - if not configured, app will work without caching
  if (!process.env.REDIS_URL) {
    console.log('ℹ️  Redis not configured - running without cache (performance may be slower)');
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis reconnection limit reached');
            return new Error('Redis reconnection limit exceeded');
          }
          // Exponential backoff: 50ms, 100ms, 200ms, etc.
          return Math.min(retries * 50, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
      isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis connected and ready');
      isRedisAvailable = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis initialization failed:', error.message);
    console.log('⚠️  Continuing without Redis cache - performance may be impacted');
    isRedisAvailable = false;
    return null;
  }
};

/**
 * Get cached data from Redis
 */
export const getCachedData = async (key) => {
  if (!isRedisAvailable || !redisClient) return null;

  try {
    const data = await redisClient.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('❌ Redis GET error:', error);
    return null;
  }
};

/**
 * Set data in Redis cache with TTL (time-to-live)
 */
export const setCachedData = async (key, data, ttlSeconds = 300) => {
  if (!isRedisAvailable || !redisClient) return false;

  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('❌ Redis SET error:', error);
    return false;
  }
};

/**
 * Delete cached data
 */
export const deleteCachedData = async (key) => {
  if (!isRedisAvailable || !redisClient) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('❌ Redis DEL error:', error);
    return false;
  }
};

/**
 * Delete multiple cached keys by pattern
 */
export const deleteCachedPattern = async (pattern) => {
  if (!isRedisAvailable || !redisClient) return false;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('❌ Redis pattern delete error:', error);
    return false;
  }
};

/**
 * Check if Redis is available
 */
export const isRedisCacheAvailable = () => isRedisAvailable;

/**
 * Get Redis client
 */
export const getRedisClient = () => redisClient;

export default { 
  initializeRedis, 
  getCachedData, 
  setCachedData, 
  deleteCachedData,
  deleteCachedPattern,
  isRedisCacheAvailable,
  getRedisClient
};
