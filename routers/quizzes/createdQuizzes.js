import express from 'express';
import {
    registerQuiz,
    getAllQuizzes,
    getQuizById,
    getAllUserQuizzes,
    deleteQuiz,
    updateQuiz,
    searchQuizzes,
    getAllAvailableQuizzes
} from '../../controllers/createdQuizzes.js';
import authenticateUser from '../../middleware/authenticate.js';

//! create a router
const router = express.Router();

router.post('/', authenticateUser, registerQuiz);
router.get('/', authenticateUser, getAllQuizzes);
router.get('/quizId/:quizId', authenticateUser, getQuizById);
router.get('/authorId/:authorId', authenticateUser, getAllUserQuizzes);
router.get('/availableQuizzes/:userId', authenticateUser, getAllAvailableQuizzes);
router.delete('/:quizId', authenticateUser, deleteQuiz);
router.patch('/:quizId', authenticateUser, updateQuiz);
router.patch('/', authenticateUser, searchQuizzes);

export default router;