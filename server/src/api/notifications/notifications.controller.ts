import { Response } from 'express';
import Notification from '../../models/mongo/Notification';
import { AuthRequest } from '../../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const notifications = await Notification.find({ recipient_id: Number(userId) })
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient_id: Number(userId) },
            { $set: { read: true } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error marking as read' });
    }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        await Notification.updateMany(
            { recipient_id: Number(userId), read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Server error marking all as read' });
    }
};
