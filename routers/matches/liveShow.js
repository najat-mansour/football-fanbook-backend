import express from 'express';
import { registerLiveShow, getAllUserLiveShows, getLiveShows } from '../../controllers/liveShow.js';
import authenticateUser from '../../middleware/authenticate.js'

const router = express.Router();

router.post('/', authenticateUser, registerLiveShow);
router.get('/user/:userId', authenticateUser, getAllUserLiveShows);
router.get('/:matchId', authenticateUser, getLiveShows);

export default router;
