import {
    generateNewQuestionUsingGemni,
    validateQuizUsingGemni
} from '../ai/gemni.js';

export const generateNewQuestion = async (req, res, next) => {
    try {
        const { quiz } = req.body;        
        const newQuestion = await generateNewQuestionUsingGemni(quiz);
        res.status(200).json(newQuestion);

    } catch (error) {
        console.error(error);   
        res.status(400).json({ error: error.message });

    }
};

export const validateQuiz = async (req, res, next) => {
    try {
        const { quiz } = req.body;
        const result = await validateQuizUsingGemni(quiz);
        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({ error: error.message });
        
    }
};