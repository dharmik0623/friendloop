import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/auth/auth.routes';
import usersRoutes from './api/users/users.routes';
import friendshipsRoutes from './api/friendships/friendships.routes';
import postsRoutes from './api/posts/posts.routes';
import commentsRoutes from './api/comments/comments.routes';
import chatRoutes from './api/chat/chat.routes';
import notificationsRoutes from './api/notifications/notifications.routes';
import { initializePostgres } from './models/postgres/init';
import { connectMongo, pgPool } from './config/db';
import { connectRedis, isRedisConnected } from './services/cache';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config();

const app: Application = express();

// Middleware
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Socket.io to request
app.use((req: any, res, next) => {
    req.io = app.get('io');
    next();
});

// Initialize Databases & Cache
connectMongo();
initializePostgres();
connectRedis();

// Static Files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friendships', friendshipsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check endpoint with deep database check
app.get('/health', async (req: Request, res: Response) => {
    const healthStatus: any = {
        api: 'API is running',
        timestamp: new Date().toISOString(),
        databases: {
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            postgresql: 'checking...',
            redis: isRedisConnected() ? 'connected' : 'disconnected'
        }
    };

    try {
        const pgResult = await pgPool.query('SELECT NOW()');
        healthStatus.databases.postgresql = pgResult.rows.length > 0 ? 'connected' : 'error';
    } catch (err) {
        healthStatus.databases.postgresql = 'disconnected';
    }

    const isHealthy = 
        healthStatus.databases.mongodb === 'connected' && 
        healthStatus.databases.postgresql === 'connected' &&
        healthStatus.databases.redis === 'connected';

    res.status(isHealthy ? 200 : 503).json(healthStatus);
});

export default app;
