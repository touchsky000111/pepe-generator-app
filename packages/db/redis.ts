import { Redis } from '@upstash/redis';

// Create Redis client
const redis = new Redis({
  url: 'https://poetic-swine-63150.upstash.io',
  token: 'AfauAAIjcDEwNDU3MTc5YjYyNzk0NmUwOTZhMDVhNzIyZDk0ODQ3OXAxMA',
});

// Keep the in-memory map for testing
const map = new Map<string, any>();

export const kv = process.env.NODE_ENV === 'test'
  ? {
    // Keep test implementation using Map
    get: async (key: string) => {
      return map.get(key);
    },
    set: async (key: string, value: any) => {
      map.set(key, value);
    },
  }
  : {
    // Use Upstash Redis implementation
    get: async (key: string) => {
      return redis.get(key);
    },
    set: async (key: string, value: any) => {
      return redis.set(key, value);
    },
  };