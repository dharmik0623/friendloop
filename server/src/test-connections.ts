import { pgPool, connectMongo } from './config/db';
import { connectRedis, isRedisConnected } from './services/cache';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testConnections() {
    console.log('🚀 Starting Connection Test...\n');
    let allPassed = true;

    // 1. Test PostgreSQL
    console.log('--- Testing PostgreSQL ---');
    try {
        const result = await pgPool.query('SELECT NOW()');
        console.log('✅ PostgreSQL: Connected! Database time:', result.rows[0].now);
    } catch (err) {
        console.error('❌ PostgreSQL: Failed to connect.', (err as Error).message);
        allPassed = false;
    }

    // 2. Test MongoDB
    console.log('\n--- Testing MongoDB ---');
    try {
        await connectMongo();
        if (mongoose.connection.readyState === 1) {
            console.log('✅ MongoDB: Connected!');
        } else {
            console.error('❌ MongoDB: Not connected.');
            allPassed = false;
        }
    } catch (err) {
        console.error('❌ MongoDB: Failed to connect.', (err as Error).message);
        allPassed = false;
    }

    // 3. Test Redis
    console.log('\n--- Testing Redis ---');
    try {
        await connectRedis();
        if (isRedisConnected()) {
            console.log('✅ Redis: Connected!');
        } else {
            console.error('❌ Redis: Not connected.');
            allPassed = false;
        }
    } catch (err) {
        console.error('❌ Redis: Failed to connect.', (err as Error).message);
        allPassed = false;
    }

    console.log('\n=========================================');
    if (allPassed) {
        console.log('🎉 ALL CONNECTIONS VERIFIED SUCCESSFULLY!');
        process.exit(0);
    } else {
        console.error('⚠️ SOME CONNECTIONS FAILED. Please check Docker and .env settings.');
        process.exit(1);
    }
}

testConnections();
