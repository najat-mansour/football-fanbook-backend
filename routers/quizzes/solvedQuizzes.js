import express from 'express';
import {
    registerSolvedQuiz,
    getSolvedQuizById,
    getAllUserSolvedQuizzes,
    searchSolvedQuizzes,
    updateSolvedQuizRating,
    getUsersWhoSolvedQuiz,
    getCorrectAnswersCount,
    getUsersScoreDistribution
} from '../../controllers/solvedQuizzes.js';
import authenticateUser from '../../middleware/authenticate.js';

//! create a router
const router = express.Router();

router.post('/', authenticateUser, registerSolvedQuiz);
router.get('/:userId', authenticateUser, getAllUserSolvedQuizzes);
router.get('/quizId/:quizId', authenticateUser, getSolvedQuizById);
router.get('/quizStats/:quizId', authenticateUser, getUsersWhoSolvedQuiz);
router.get('/correctAnswersCount/:quizId', authenticateUser, getCorrectAnswersCount);
router.get('/scoresRange/:quizId', authenticateUser, getUsersScoreDistribution);
router.patch('/', authenticateUser, searchSolvedQuizzes);
router.patch('/updating', authenticateUser, updateSolvedQuizRating);

export default router;