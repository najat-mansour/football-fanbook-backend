import express from 'express';
import {
    registerLike, 
    deleteLike
} from '../../controllers/likedQuizzes.js';
import authenticateUser from '../../middleware/authenticate.js';

//! create a router
const router = express.Router();

router.put('/:userId/:quizId', authenticateUser, registerLike);
router.delete('/:userId/:quizId', authenticateUser, deleteLike);

export default router;