import { Response } from 'express';
import Comment from '../../models/mongo/Comment';
import Post from '../../models/mongo/Post';
import { AuthRequest } from '../../middleware/auth';
import { pgPool } from '../../config/db';
import { sendNotification } from '../../services/notifications';

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const authorId = req.userId;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = new Comment({
            post_id: postId,
            author_id: authorId,
            content
        });

        const savedComment = await newComment.save();

        // Notification
        if (req.io) {
            const commenterResult = await pgPool.query('SELECT first_name, last_name FROM users WHERE id = $1', [req.userId]);
            const commenter = commenterResult.rows[0];
            
            if (Number(post.author_id) !== Number(req.userId)) {
                await sendNotification(req.io, {
                    recipientId: Number(post.author_id),
                    senderId: Number(req.userId),
                    senderName: `${commenter.first_name} ${commenter.last_name}`,
                    type: 'comment',
                    referenceId: post._id.toString()
                });
            }
        }

        res.status(201).json(savedComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error adding comment' });
    }
};

export const getComments = async (req: AuthRequest, res: Response) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post_id: postId }).sort({ createdAt: 1 });
        
        if (comments.length === 0) {
            return res.status(200).json([]);
        }

        const uniqueAuthorIds = [...new Set(comments.map(c => c.author_id))];
        const authorsResult = await pgPool.query(
            `SELECT id, username, first_name, last_name, profile_picture_url 
             FROM users 
             WHERE id = ANY($1)`,
            [uniqueAuthorIds]
        );

        const authorsMap = authorsResult.rows.reduce((map: any, user: any) => {
            map[user.id] = user;
            return map;
        }, {});

        const commentsWithAuthors = comments.map(comment => ({
            ...comment.toObject(),
            author: authorsMap[comment.author_id] || { id: comment.author_id, username: 'Unknown' }
        }));

        res.status(200).json(commentsWithAuthors);
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ message: 'Server error getting comments' });
    }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author_id.toString() !== String(req.userId)) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();
        res.status(200).json({ message: 'Comment removed' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error deleting comment' });
    }
};
