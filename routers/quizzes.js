import express from 'express';
import createdQuizzesRouter from './quizzes/createdQuizzes.js';
import solvedQuizzesRouter from './quizzes/solvedQuizzes.js';
import likedQuizzesRouter from './quizzes/likedQuizzes.js';

//! create a router
const router = express.Router();

router.use('/createdQuizzes', createdQuizzesRouter);
router.use('/solvedQuizzes', solvedQuizzesRouter);
router.use('/likedQuizzes', likedQuizzesRouter);

export default router;