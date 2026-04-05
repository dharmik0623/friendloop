import { Pool } from 'pg';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// PostgreSQL Connection
export const pgPool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'friendloop',
});

pgPool.on('connect', () => {
  console.log('🔗 Connected to PostgreSQL Database');
});

pgPool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// MongoDB Connection
export const connectMongo = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://root:root@localhost:28017/friendloop?authSource=admin';
    await mongoose.connect(mongoURI);
    console.log('🔗 Connected to MongoDB Database');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  }
};
