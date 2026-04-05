import { Router } from 'express';
import { createPost, getFeed, getPostById, deletePost, likePost, unlikePost, getUserPosts, editPost, bookmarkPost, unbookmarkPost, getSavedPosts } from './posts.controller';
import { protect } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

router.get('/saved', protect, getSavedPosts);
router.get('/', protect, getFeed);
router.post('/', protect, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 2 }]), createPost);
router.get('/user/:userId', protect, getUserPosts);
router.get('/:id', protect, getPostById);
router.put('/:id', protect, editPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.put('/:id/unlike', protect, unlikePost);
router.put('/:id/bookmark', protect, bookmarkPost);
router.put('/:id/unbookmark', protect, unbookmarkPost);

export default router;

