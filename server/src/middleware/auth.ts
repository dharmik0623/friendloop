import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { Server as SocketIOServer } from 'socket.io';

export interface AuthRequest extends Request {
    userId?: string | number;
    io?: SocketIOServer;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        const decoded = verifyToken(token);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
