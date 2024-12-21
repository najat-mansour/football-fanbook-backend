import express from 'express';
import { registerMatchPrediction, getAllUserMatches, getMatchPredictions } from '../../controllers/matchPrediction.js';
import authenticateUser from '../../middleware/authenticate.js'

const router = express.Router();

router.post('/', authenticateUser, registerMatchPrediction);
router.get('/user/:userId', authenticateUser, getAllUserMatches);
router.get('/:matchId', authenticateUser, getMatchPredictions);
export default router;
