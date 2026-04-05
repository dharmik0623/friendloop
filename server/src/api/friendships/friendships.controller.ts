import { Response } from 'express';
import { pgPool } from '../../config/db';
import { AuthRequest } from '../../middleware/auth';
import { sendNotification } from '../../services/notifications';

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const requesterId = req.userId;
        const addresseeId = req.params.userId;

        if (requesterId == addresseeId) {
            return res.status(400).json({ message: "Cannot send a friend request to yourself" });
        }

        const newRequest = await pgPool.query(
            `INSERT INTO friendships (requester_id, addressee_id, status) 
             VALUES ($1, $2, 'pending') 
             RETURNING id, status, created_at`,
            [requesterId, addresseeId]
        );

        const savedRequest = newRequest.rows[0];

        // Notification
        if (req.io) {
            const senderResult = await pgPool.query('SELECT first_name, last_name FROM users WHERE id = $1', [requesterId]);
            const sender = senderResult.rows[0];
            
            await sendNotification(req.io, {
                recipientId: Number(addresseeId),
                senderId: Number(requesterId),
                senderName: `${sender.first_name} ${sender.last_name}`,
                type: 'friend_request',
                referenceId: savedRequest.id.toString()
            });
        }

        res.status(201).json(savedRequest);
    } catch (error: any) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'Friend request already exists' });
        }
        console.error('Error sending friend request:', error);
        res.status(500).json({ message: 'Server error sending friend request' });
    }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const addresseeId = req.userId;
        const requesterId = req.params.userId;

        const updatedRequest = await pgPool.query(
            `UPDATE friendships 
             SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
             WHERE requester_id = $1 AND addressee_id = $2 AND status = 'pending'
             RETURNING id, status`,
            [requesterId, addresseeId]
        );

        if (updatedRequest.rows.length === 0) {
            return res.status(404).json({ message: 'Pending friend request not found' });
        }

        const savedUpdate = updatedRequest.rows[0];

        // Notification
        if (req.io) {
            const senderResult = await pgPool.query('SELECT first_name, last_name FROM users WHERE id = $1', [addresseeId]);
            const sender = senderResult.rows[0];
            
            await sendNotification(req.io, {
                recipientId: Number(requesterId),
                senderId: Number(addresseeId),
                senderName: `${sender.first_name} ${sender.last_name}`,
                type: 'friend_accept'
            });
        }

        res.status(200).json(savedUpdate);
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ message: 'Server error accepting friend request' });
    }
};

export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const addresseeId = req.userId;
        const requesterId = req.params.userId;

        const deletedRequest = await pgPool.query(
            `DELETE FROM friendships 
             WHERE requester_id = $1 AND addressee_id = $2 AND status = 'pending'
             RETURNING id`,
            [requesterId, addresseeId]
        );

        if (deletedRequest.rows.length === 0) {
            return res.status(404).json({ message: 'Pending friend request not found' });
        }

        res.status(200).json({ message: 'Friend request rejected/deleted' });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ message: 'Server error rejecting friend request' });
    }
};

export const getFriends = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        
        const friendsResult = await pgPool.query(
            `SELECT u.id, u.username, u.first_name, u.last_name, u.profile_picture_url 
             FROM users u
             JOIN friendships f ON (u.id = f.requester_id OR u.id = f.addressee_id)
             WHERE (f.requester_id = $1 OR f.addressee_id = $1) 
               AND f.status = 'accepted'
               AND u.id != $1`,
            [userId]
        );

        res.status(200).json(friendsResult.rows);
    } catch (error) {
        console.error('Error getting friends list:', error);
        res.status(500).json({ message: 'Server error getting friends' });
    }
};

export const getPendingRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        
        const requestsResult = await pgPool.query(
            `SELECT f.id, f.created_at, u.id as requester_id, u.username, u.first_name, u.last_name, u.profile_picture_url
             FROM friendships f
             JOIN users u ON f.requester_id = u.id
             WHERE f.addressee_id = $1 AND f.status = 'pending'`,
            [userId]
        );

        res.status(200).json(requestsResult.rows);
    } catch (error) {
        console.error('Error getting pending requests:', error);
        res.status(500).json({ message: 'Server error getting pending requests' });
    }
};

export const getSentRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        
        const requestsResult = await pgPool.query(
            `SELECT f.id, f.created_at, u.id as addressee_id, u.username, u.first_name, u.last_name, u.profile_picture_url
             FROM friendships f
             JOIN users u ON f.addressee_id = u.id
             WHERE f.requester_id = $1 AND f.status = 'pending'`,
            [userId]
        );

        res.status(200).json(requestsResult.rows);
    } catch (error) {
        console.error('Error getting sent requests:', error);
        res.status(500).json({ message: 'Server error getting sent requests' });
    }
};

export const removeFriend = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const friendId = req.params.userId;

        const deletedFriend = await pgPool.query(
            `DELETE FROM friendships 
             WHERE status = 'accepted' AND 
             ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))
             RETURNING id`,
            [userId, friendId]
        );

        if (deletedFriend.rows.length === 0) {
            return res.status(404).json({ message: 'Friendship not found or already removed' });
        }

        res.status(200).json({ message: 'Friend removed successfully' });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ message: 'Server error removing friend' });
    }
};
