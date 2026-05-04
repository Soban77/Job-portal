const redis = require('redis');

let client = null;
const memoryCache = new Map();
const useRedis = Boolean(process.env.REDIS_URL);

const connectCache = async () => {
  if (useRedis) {
    client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', err => console.error('Redis error:', err));
    await client.connect();
    console.log('Redis connected');
    return;
  }
  console.log('Redis not configured, using in-memory cache fallback');
};

const getCache = async (key) => {
  if (client) {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiry && entry.expiry < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
};

const setCache = async (key, value, ttlSeconds = 45) => {
  if (client) {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return;
  }
  memoryCache.set(key, {
    value,
    expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
  });
};

const delCache = async (pattern) => {
  if (client) {
    const keys = await client.keys(pattern);
    if (!keys.length) return;
    await client.del(keys);
    return;
  }
  for (const key of [...memoryCache.keys()]) {
    if (new RegExp(pattern.replace('*', '.*')).test(key)) {
      memoryCache.delete(key);
    }
  }
};

const clearJobCache = async () => {
  return delCache('job:*');
};

module.exports = {
  connectCache,
  getCache,
  setCache,
  delCache,
  clearJobCache
};
