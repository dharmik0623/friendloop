import { createClient } from 'redis';

// Note: Ensure redis package is installed via npm install redis
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

let isConnected = false;

export const connectRedis = async () => {
    try {
        if (!isConnected) {
            await redisClient.connect();
            isConnected = true;
            console.log('🔗 Connected to Redis Cache');
        }
    } catch (err) {
        console.error('❌ Error connecting to Redis:', err);
        isConnected = false;
    }
};

export const isRedisConnected = () => isConnected;

export const getCache = async (key: string) => {
    if (!isConnected) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis Get Error:', error);
        return null;
    }
};

export const setCache = async (key: string, value: any, expirationInSeconds = 3600) => {
    if (!isConnected) return;
    try {
        await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
    } catch (error) {
        console.error('Redis Set Error:', error);
    }
};

export const invalidateCache = async (key: string) => {
    if (!isConnected) return;
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error('Redis Del Error:', error);
    }
};
