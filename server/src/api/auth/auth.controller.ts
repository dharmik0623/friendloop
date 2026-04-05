import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pgPool } from '../../config/db';
import { signToken } from '../../utils/jwt';

export const register = async (req: Request, res: Response) => {
    const { username, email, password, first_name, last_name, age, place } = req.body;

    if (!age || !place) {
        return res.status(400).json({ message: 'Age and Place are mandatory fields' });
    }

    try {
        // 1. Check if user exists
        const userExists = await pgPool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User with that email or username already exists' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pgPool.query(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, age, place) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, first_name, last_name, age, place',
            [username, email, hashedPassword, first_name, last_name, age, place]
        );

        const user = newUser.rows[0];

        // 4. Generate JWT
        const token = signToken(user.id);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                age: user.age,
                place: user.place
            },
            token
        });

    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // 1. Find user by email or username
        const userResult = await pgPool.query('SELECT * FROM users WHERE email = $1 OR username = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = userResult.rows[0];

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Generate JWT
        const token = signToken(user.id);

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_picture_url: user.profile_picture_url,
                age: user.age,
                place: user.place
            },
            token
        });

    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const getMe = async (req: Request | any, res: Response) => {
    try {
        const userId = req.userId;
        const userResult = await pgPool.query('SELECT id, username, email, first_name, last_name, profile_picture_url, bio, age, place FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(userResult.rows[0]);
    } catch (error) {
        console.error('Error in getMe:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};
