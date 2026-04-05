import { Router } from 'express';
import { addComment, getComments, deleteComment } from './comments.controller';
import { protect } from '../../middleware/auth';

const router = Router();

router.get('/:postId', protect, getComments);
router.post('/:postId', protect, addComment);
router.delete('/:id', protect, deleteComment);

export default router;
