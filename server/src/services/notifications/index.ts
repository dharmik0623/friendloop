import { pgPool } from '../../config/db';
import { Server as SocketIOServer } from 'socket.io';
import Notification from '../../models/mongo/Notification';

export type NotificationType = 'like' | 'comment' | 'friend_request' | 'friend_accept' | 'message';

export interface NotificationPayload {
    recipientId: number;
    senderId: number;
    senderName: string;
    type: NotificationType;
    referenceId?: string; // e.g., postId or messageId
    content?: string;
}

/**
 * Sends a notification, saves it to MongoDB for persistence, and emits via Socket.io.
 */
export const sendNotification = async (io: SocketIOServer, payload: NotificationPayload) => {
    try {
        console.log(`[Notification] Saving & Sending ${payload.type} from ${payload.senderId} to ${payload.recipientId}`);
        
        // 1. Save to MongoDB
        const newNotification = new Notification({
            recipient_id: payload.recipientId,
            sender_id: payload.senderId,
            sender_name: payload.senderName,
            type: payload.type,
            reference_id: payload.referenceId,
            content: payload.content,
            read: false
        });

        const savedNotification = await newNotification.save();

        // 2. Emit real-time via Socket.io
        io.to(payload.recipientId.toString()).emit('receive_notification', {
            _id: savedNotification._id,
            senderId: savedNotification.sender_id,
            senderName: savedNotification.sender_name,
            type: savedNotification.type,
            referenceId: savedNotification.reference_id,
            content: savedNotification.content,
            read: savedNotification.read,
            createdAt: savedNotification.createdAt
        });

        return savedNotification;
    } catch (error) {
        console.error('Error sending/saving notification:', error);
    }
};
