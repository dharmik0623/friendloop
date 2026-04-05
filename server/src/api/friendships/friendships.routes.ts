import { Router } from 'express';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriends, getPendingRequests, getSentRequests, removeFriend } from './friendships.controller';
import { protect } from '../../middleware/auth';

const router = Router();

router.get('/', protect, getFriends);
router.get('/requests', protect, getPendingRequests);
router.get('/requests/sent', protect, getSentRequests);
router.post('/request/:userId', protect, sendFriendRequest);
router.put('/accept/:userId', protect, acceptFriendRequest);
router.put('/reject/:userId', protect, rejectFriendRequest);
router.delete('/remove/:userId', protect, removeFriend);

export default router;
