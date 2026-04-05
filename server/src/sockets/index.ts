import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';
import Message from '../models/mongo/Message';
import { pgPool } from '../config/db';

export default function setupSockets(server: HttpServer) {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    // Authentication middleware for sockets
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        try {
            const decoded = verifyToken(token);
            socket.data.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId;
        console.log(`User connected: ${userId} with socket ID: ${socket.id}`);

        // Join a personal room
        socket.join(userId.toString());

        // Handle sending a message
        socket.on('send_message', async (data) => {
            try {
                const { receiverId, content } = data;
                
                // Create sorted conversation id (e.g. "1_2")
                const sortedIds = [userId, receiverId].sort((a, b) => a - b);
                const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;

                // Save to MongoDB
                const newMessage = new Message({
                    conversation_id: conversationId,
                    sender_id: userId,
                    receiver_id: receiverId,
                    content
                });
                const savedMessage = await newMessage.save();

                // Emit to the receiver's personal room
                io.to(receiverId.toString()).emit('receive_message', savedMessage);
                
                // Echo back to sender
                socket.emit('message_sent', savedMessage);

                // --- NEW: Trigger Notification ---
                // Fetch sender name from Postgres
                const senderResult = await pgPool.query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
                const sender = senderResult.rows[0];
                const senderName = sender ? `${sender.first_name} ${sender.last_name}` : 'Someone';

                const { sendNotification } = await import('../services/notifications');
                await sendNotification(io, {
                    recipientId: Number(receiverId),
                    senderId: Number(userId),
                    senderName,
                    type: 'message',
                    referenceId: savedMessage._id.toString(),
                    content: content.substring(0, 50) + (content.length > 50 ? '...' : '')
                });
                // ---------------------------------

                // --- NEW: Custom AI Bot Interception (Spiderman) ---
                if (Number(receiverId) === 9999) {
                    const { generateSpidermanResponse } = await import('../services/ai/spidermanBrain');
                    const aiResponseText = generateSpidermanResponse(content);

                    // Insert AI Response into DB
                    const aiMessage = new Message({
                        conversation_id: conversationId,
                        sender_id: 9999, // Spiderman ID
                        receiver_id: userId,
                        content: aiResponseText
                    });
                    
                    const savedAiMessage = await aiMessage.save();

                    // Introduce a slight delay for realism
                    setTimeout(() => {
                        io.to(userId.toString()).emit('receive_message', savedAiMessage);
                    }, 1000);
                }
                // ----------------------------------------------------
            } catch (error) {
                console.error('Error sending message via socket:', error);
                socket.emit('error', 'Failed to send message');
            }
        });

        // Typing Indicators
        socket.on('typing_start', (data) => {
            const { receiverId } = data;
            io.to(receiverId.toString()).emit('user_typing', { userId });
        });

        socket.on('typing_stop', (data) => {
            const { receiverId } = data;
            io.to(receiverId.toString()).emit('user_stopped_typing', { userId });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
        });
    });

    return io;
}
