const redis = require('redis');
const logger = require('./logger');

let redisClient = null;

const createRedisClient = async () => {
  try {
    const client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Too many reconnection attempts');
            return new Error('Too many reconnection attempts');
          }
          return retries * 100; // Reconnect after retries * 100ms
        },
      },
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      logger.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('✅ Redis Client Connected');
      logger.info('✅ Redis Client Connected');
    });

    client.on('ready', () => {
      console.log('✅ Redis Client Ready');
      logger.info('✅ Redis Client Ready');
    });

    await client.connect();
    return client;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    logger.error('Failed to create Redis client:', error);
    return null;
  }
};

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = await createRedisClient();
  }
  return redisClient;
};

// Cache helper functions
const cache = {
  // Get cached data
  get: async (key) => {
    try {
      const client = await getRedisClient();
      if (!client) return null;
      
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  // Set cached data with TTL (time to live in seconds)
  set: async (key, value, ttl = 60) => {
    try {
      const client = await getRedisClient();
      if (!client) return false;
      
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  // Delete cached data
  del: async (key) => {
    try {
      const client = await getRedisClient();
      if (!client) return false;
      
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  // Delete multiple keys by pattern
  delPattern: async (pattern) => {
    try {
      const client = await getRedisClient();
      if (!client) return false;
      
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis DEL PATTERN error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const client = await getRedisClient();
      if (!client) return false;
      
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },
};

module.exports = {
  getRedisClient,
  cache,
};

