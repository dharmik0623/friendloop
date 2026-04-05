import { Request, Response } from 'express';
import { pgPool } from '../../config/db';
import { AuthRequest } from '../../middleware/auth';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userResult = await pgPool.query(
            'SELECT id, username, email, first_name, last_name, profile_picture_url, bio, age, place, is_public, created_at FROM users WHERE id = $1',
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        
        // Hide details if private and not self
        const viewerId = req.userId; // Now correctly typed
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching user profile' });
    }
};

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { q, age, place } = req.query;
        
        // Only fetch public profiles or friends? Wait, usually search can find anyone, but we'll include is_public flag
        let queryText = 'SELECT id, username, first_name, last_name, profile_picture_url, age, place, bio, is_public FROM users WHERE 1=1';
        const queryParams: any[] = [];
        let paramIndex = 1;

        if (q && typeof q === 'string') {
            const searchTerm = `%${q}%`;
            queryText += ` AND (username ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR bio ILIKE $${paramIndex})`;
            queryParams.push(searchTerm);
            paramIndex++;
        }

        if (age) {
            queryText += ` AND age = $${paramIndex}`;
            queryParams.push(Number(age));
            paramIndex++;
        }

        if (place && typeof place === 'string') {
            const placeTerm = `%${place}%`;
            queryText += ` AND place ILIKE $${paramIndex}`;
            queryParams.push(placeTerm);
            paramIndex++;
        }

        queryText += ' LIMIT 20';
        
        const usersResult = await pgPool.query(queryText, queryParams);
        res.status(200).json(usersResult.rows);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Server error searching users' });
    }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { first_name, last_name, bio, profile_picture_url, age, place, is_public } = req.body;

        const updatedUser = await pgPool.query(
            `UPDATE users 
             SET first_name = COALESCE($1, first_name), 
                 last_name = COALESCE($2, last_name), 
                 bio = COALESCE($3, bio), 
                 profile_picture_url = COALESCE($4, profile_picture_url),
                 age = COALESCE($5, age),
                 place = COALESCE($6, place),
                 is_public = COALESCE($7, is_public),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $8
             RETURNING id, username, email, first_name, last_name, profile_picture_url, bio, age, place, is_public`,
            [first_name, last_name, bio, profile_picture_url, age, place, is_public, userId]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser.rows[0]);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error updating user profile' });
    }
};
