import { Response } from 'express';
import Message from '../../models/mongo/Message';
import { AuthRequest } from '../../middleware/auth';
import { pgPool } from '../../config/db';

export const getConversation = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const otherUserId = req.params.userId;

        const sortedIds = [Number(userId), Number(otherUserId)].sort((a, b) => a - b);
        const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;

        const messages = await Message.find({ conversation_id: conversationId }).sort({ createdAt: 1 });
        
        // Mark as read (optional polish)
        await Message.updateMany(
            { conversation_id: conversationId, receiver_id: Number(userId), read: false },
            { $set: { read: true } }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ message: 'Server error fetching conversation' });
    }
};

export const getRecentChats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        // Fetch accepted friends to display in the chat sidebar
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
        console.error('Error fetching recent chats:', error);
        res.status(500).json({ message: 'Server error fetching recent chats' });
    }
};
export const clearConversation = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const otherUserId = req.params.userId;

        const sortedIds = [Number(userId), Number(otherUserId)].sort((a, b) => a - b);
        const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;

        await Message.deleteMany({ conversation_id: conversationId });

        res.status(200).json({ message: 'Conversation cleared successfully' });
    } catch (error) {
        console.error('Error clearing conversation:', error);
        res.status(500).json({ message: 'Server error clearing conversation' });
    }
};
