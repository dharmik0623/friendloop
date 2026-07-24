import { Response } from 'express';
import Post from '../../models/mongo/Post';
import { AuthRequest } from '../../middleware/auth';
import { pgPool } from '../../config/db';
import { getCache, setCache, invalidateCache } from '../../services/cache';
import { moderatelySafe } from '../../services/ai';
import { sendNotification } from '../../services/notifications';

const invalidateFeedCacheForUserAndFriends = async (userId: string | number) => {
    try {
        await invalidateCache(`feed:${userId}`);
        const friendsResult = await pgPool.query(
            `SELECT u.id 
             FROM users u
             JOIN friendships f ON (u.id = f.requester_id OR u.id = f.addressee_id)
             WHERE (f.requester_id = $1 OR f.addressee_id = $1) 
               AND f.status = 'accepted'
               AND u.id != $1`,
            [userId]
        );
        for (const friend of friendsResult.rows) {
            await invalidateCache(`feed:${friend.id}`);
        }
    } catch (error) {
        console.error('Error invalidating feed caches:', error);
    }
};

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { content } = req.body;
        const authorId = Number(req.userId);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const images = files?.images ? files.images.map(f => `/uploads/${f.filename}`) : [];
        const videos = files?.videos ? files.videos.map(f => `/uploads/${f.filename}`) : [];

        if (!content && images.length === 0 && videos.length === 0) {
            return res.status(400).json({ message: 'Post must have content, images, or videos' });
        }

        // AI Moderation (only if text is present)
        if (content) {
            const isSafe = await moderatelySafe(content);
            if (!isSafe) {
                return res.status(403).json({ message: 'Post violates community guidelines' });
            }
        }

        const newPost = new Post({
            author_id: authorId,
            content,
            images,
            videos,
        });

        const savedPost = await newPost.save();
        
        // --- Spiderman Plagiarism Check ---
        if (content) {
            // Check if any post exists with exact same content, but a different author
            const duplicatePost = await Post.findOne({ 
                content: content, 
                author_id: { $ne: authorId } 
            });

            if (duplicatePost && req.io) {
                const { generateSpidermanResponse } = await import('../../services/ai/spidermanBrain');
                const spideyMessage = "Sharing is caring! Just remember: with great posting power comes great responsibility! Don't go stealing other people's posts!";
                
                // Sorted ID formatting for conversational room
                const spideyId = 9999;
                const sortedIds = [authorId, spideyId].sort((a, b) => a - b);
                const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;

                const { default: Message } = await import('../../models/mongo/Message');
                const newWarning = new Message({
                    conversation_id: conversationId,
                    sender_id: spideyId,
                    receiver_id: authorId,
                    content: spideyMessage
                });
                
                const savedWarning = await newWarning.save();

                // Emit to the user so they get the DM immediately
                req.io.to(authorId.toString()).emit('receive_message', savedWarning);
            }
        }
        // ----------------------------------

        // Fetch author so the frontend can display it immediately
        let author = { id: authorId, username: 'Unknown' };
        if (authorId) {
            const authorResult = await pgPool.query(
                `SELECT id, username, first_name, last_name, profile_picture_url 
                 FROM users 
                 WHERE id = $1`,
                [authorId]
            );
            if (authorResult.rows.length > 0) {
                author = authorResult.rows[0];
            }
        }
        
        const postWithAuthor = {
            ...savedPost.toObject(),
            author
        };

        // Invalidate author's and friends' feed caches on new post
        await invalidateFeedCacheForUserAndFriends(authorId as string | number);
        
        res.status(201).json(postWithAuthor);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error creating post' });
    }
};

export const getFeed = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const cacheKey = `feed:${userId}`;

        // 1. Check Cache
        const cachedFeed = await getCache(cacheKey);
        if (cachedFeed) {
            return res.status(200).json(cachedFeed);
        }

        // 2. Cache miss, fetch from DB
        const friendsResult = await pgPool.query(
            `SELECT u.id 
             FROM users u
             JOIN friendships f ON (u.id = f.requester_id OR u.id = f.addressee_id)
             WHERE (f.requester_id = $1 OR f.addressee_id = $1) 
               AND f.status = 'accepted'
               AND u.id != $1`,
            [userId]
        );

        const friendIds = friendsResult.rows.map(row => Number(row.id));
        const authorsToFetch = [Number(userId), ...friendIds];

        const posts = await Post.find({ author_id: { $in: authorsToFetch } })
            .sort({ createdAt: -1 })
            .limit(20);

        // 3. Fetch author details from Postgres for these posts
        const uniqueAuthorIds = [...new Set(posts.map(post => post.author_id))];
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

        const postsWithAuthors = posts.map(post => ({
            ...post.toObject(),
            author: authorsMap[post.author_id] || { id: post.author_id, username: 'Unknown' }
        }));

        // 4. Save to Cache for 5 minutes
        await setCache(cacheKey, postsWithAuthors, 300);

        res.status(200).json(postsWithAuthors);
    } catch (error) {
        console.error('Error getting feed:', error);
        res.status(500).json({ message: 'Server error fetching feed' });
    }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const authorResult = await pgPool.query(
            `SELECT id, username, first_name, last_name, profile_picture_url 
             FROM users 
             WHERE id = $1`,
            [post.author_id]
        );

        const postWithAuthor = {
            ...post.toObject(),
            author: authorResult.rows[0] || { id: post.author_id, username: 'Unknown' }
        };

        res.status(200).json(postWithAuthor);
    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).json({ message: 'Server error fetching post' });
    }
};

export const getUserPosts = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ author_id: Number(userId) })
            .sort({ createdAt: -1 })
            .limit(20);

        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        const authorResult = await pgPool.query(
            `SELECT id, username, first_name, last_name, profile_picture_url 
             FROM users 
             WHERE id = $1`,
            [userId]
        );

        const author = authorResult.rows[0];
        const postsWithAuthor = posts.map(post => ({
            ...post.toObject(),
            author: author || { id: post.author_id, username: 'Unknown' }
        }));

        res.status(200).json(postsWithAuthor);
    } catch (error) {
        console.error('Error getting user posts:', error);
        res.status(500).json({ message: 'Server error fetching user posts' });
    }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Use String conversion for robust comparison (handles Number vs String IDs)
        if (String(post.author_id) !== String(req.userId)) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();
        
        // Invalidate feed cache for author and friends
        await invalidateFeedCacheForUserAndFriends(post.author_id);
        
        res.status(200).json({ message: 'Post removed' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error deleting post' });
    }
};

export const likePost = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.likes.includes(Number(req.userId))) {
            return res.status(400).json({ message: 'Post already liked' });
        }

        post.likes.push(Number(req.userId));
        await post.save();

        // Notification
        if (req.io) {
            const likerResult = await pgPool.query('SELECT first_name, last_name FROM users WHERE id = $1', [req.userId]);
            const liker = likerResult.rows[0];
            
            if (Number(post.author_id) !== Number(req.userId)) {
                await sendNotification(req.io, {
                    recipientId: Number(post.author_id),
                    senderId: Number(req.userId),
                    senderName: `${liker.first_name} ${liker.last_name}`,
                    type: 'like',
                    referenceId: post._id.toString()
                });
            }
        }

        res.status(200).json(post.likes);
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Server error liking post' });
    }
};

export const unlikePost = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(Number(req.userId));
        if (likeIndex === -1) {
            return res.status(400).json({ message: 'Post has not been liked yet' });
        }

        post.likes.splice(likeIndex, 1);
        await post.save();

        res.status(200).json(post.likes);
    } catch (error) {
        console.error('Error unliking post:', error);
        res.status(500).json({ message: 'Server error unliking post' });
    }
};

export const editPost = async (req: AuthRequest, res: Response) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author_id.toString() !== String(req.userId)) {
            return res.status(403).json({ message: 'Not authorized to edit this post' });
        }

        if (content) {
            const isSafe = await moderatelySafe(content);
            if (!isSafe) {
                return res.status(403).json({ message: 'Post violates community guidelines' });
            }
        }

        post.content = content || '';
        const updatedPost = await post.save();
        
        // Invalidate feed cache for author and friends
        await invalidateFeedCacheForUserAndFriends(post.author_id);

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Error editing post:', error);
        res.status(500).json({ message: 'Server error editing post' });
    }
};

export const bookmarkPost = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.bookmarks.includes(Number(req.userId))) {
            return res.status(400).json({ message: 'Post already bookmarked' });
        }

        post.bookmarks.push(Number(req.userId));
        await post.save();

        res.status(200).json(post.bookmarks);
    } catch (error) {
        console.error('Error bookmarking post:', error);
        res.status(500).json({ message: 'Server error bookmarking post' });
    }
};

export const unbookmarkPost = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const bookmarkIndex = post.bookmarks.indexOf(Number(req.userId));
        if (bookmarkIndex === -1) {
            return res.status(400).json({ message: 'Post has not been bookmarked yet' });
        }

        post.bookmarks.splice(bookmarkIndex, 1);
        await post.save();

        res.status(200).json(post.bookmarks);
    } catch (error) {
        console.error('Error unbookmarking post:', error);
        res.status(500).json({ message: 'Server error unbookmarking post' });
    }
};

export const getSavedPosts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const posts = await Post.find({ bookmarks: Number(userId) })
            .sort({ createdAt: -1 });

        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        const uniqueAuthorIds = [...new Set(posts.map(post => post.author_id))];
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

        const postsWithAuthors = posts.map(post => ({
            ...post.toObject(),
            author: authorsMap[post.author_id] || { id: post.author_id, username: 'Unknown' }
        }));

        res.status(200).json(postsWithAuthors);
    } catch (error) {
        console.error('Error getting saved posts:', error);
        res.status(500).json({ message: 'Server error fetching saved posts' });
    }
};

