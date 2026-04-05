import { Router } from 'express';
import { getUserProfile, searchUsers, updateUserProfile } from './users.controller';
import { protect } from '../../middleware/auth';

const router = Router();

router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUserProfile);
router.put('/', protect, updateUserProfile);

export default router;
