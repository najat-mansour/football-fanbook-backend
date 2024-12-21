import express from 'express';
import { generateNewQuestion, validateQuiz } from '../controllers/ai.js';

//! create a router
const router = express.Router();

router.post('/new-quiz', generateNewQuestion);
router.post('/quiz-validation', validateQuiz);

export default router;