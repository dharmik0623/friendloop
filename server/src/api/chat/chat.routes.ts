import { Router } from 'express';
import { getConversation, getRecentChats, clearConversation } from './chat.controller';
import { protect } from '../../middleware/auth';

const router = Router();

router.get('/friends', protect, getRecentChats);
router.get('/:userId', protect, getConversation);
router.delete('/:userId', protect, clearConversation);

export default router;
