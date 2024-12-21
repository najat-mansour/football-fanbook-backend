import Quiz from '../models/Quiz.js';
import LikedQuiz from '../models/LikedQuiz.js';
import { UserImageStatus } from '../enums/users.js';
import { getImageUrlInAwsS3 } from '../services/AwsS3.js';

export const registerQuiz = async (req, res, next) => {
    try {
        const quiz = new Quiz(
            req.body.quizData,
            req.body.authorId,
            req.body.status,
            req.body.containsAI
        );

        await quiz.registerQuiz();
        res.status(201).json({ message: 'Quiz registered successfully!' });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};

export const updateQuiz = async (req, res, next) => {
    try {
        const quizId = req.params.quizId;
        const info = req.body;
        await Quiz.updateQuiz(quizId, info);
        res.status(200).json({ message: 'Quiz updated successfully!' });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};

export const getQuizById = async (req, res, next) => {
    try {
        const quizId = req.params.quizId;
        const [quiz] = await Quiz.getQuizById(quizId);
        if (quiz.length !== 0) {
            if (quiz[0].authorImage == UserImageStatus.VALID)
                quiz[0].authorImage = await getImageUrlInAwsS3(quiz[0].authorId);
            res.status(200).json(quiz[0]);

        } else {
            res.status(404).json({ message: 'Quiz not found!' });

        }

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};

export const getAllUserQuizzes = async (req, res, next) => {
    try {
        const authorId = req.params.authorId;
        const [quizzes] = await Quiz.getAllUserQuizzes(authorId);

        if (quizzes.length !== 0) {
            for (const quiz of quizzes) {
                if (quiz.authorImage == UserImageStatus.VALID)
                    quiz.authorImage = await getImageUrlInAwsS3(quiz.authorId);
            }
            const quizzesWithLikeStatus = await Promise.all(
                quizzes.map(async (quiz) => {
                    const isLikedByUser = await LikedQuiz.isLiked(authorId, quiz.quizId);
                    return {
                        ...quiz,
                        isLikedByUser
                    };
                })
            );

            res.status(200).json(quizzesWithLikeStatus);
        } else {
            res.status(404).json({ message: 'No quizzes found for this user!' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const getAllQuizzes = async (req, res, next) => {
    try {
        const [quizzes] = await Quiz.getAllQuizzes();
        if (quizzes.length !== 0) {
            for (const quiz of quizzes) {
                if (quiz.authorImage == UserImageStatus.VALID)
                    quiz.authorImage = await getImageUrlInAwsS3(quiz.authorId);
            }
            res.status(200).json(quizzes);

        } else {
            res.status(404).json({ message: 'No quizzes found!' });

        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const getAllAvailableQuizzes = async (req, res) => {
    const { userId } = req.params;

    try {
        const [quizzes] = await Quiz.getAvailableQuizzes(userId);

        if (quizzes.length !== 0) {
            for (const quiz of quizzes) {
                if (quiz.authorImage == UserImageStatus.VALID)
                    quiz.authorImage = await getImageUrlInAwsS3(quiz.authorId);
            }
            const quizzesWithLikeStatus = await Promise.all(
                quizzes.map(async (quiz) => {
                    const isLikedByUser = await LikedQuiz.isLiked(userId, quiz.quizId);
                    return {
                        ...quiz,
                        isLikedByUser
                    };
                })
            );

            res.status(200).json(quizzesWithLikeStatus);

        } else {
            res.status(404).json({ message: 'No quizzes found!' });

        }
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteQuiz = async (req, res, next) => {
    try {
        const quizId = req.params.quizId;
        await Quiz.deleteQuiz(quizId);
        res.status(204).json({ message: 'Quiz deleted successfully!' });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const searchQuizzes = async (req, res, next) => {
    try {
        const fields = req.body;
        const [quizzes] = await Quiz.search(fields);

        if (quizzes.length !== 0) {
            for (const quiz of quizzes) {
                if (quiz.authorImage == UserImageStatus.VALID)
                    quiz.authorImage = await getImageUrlInAwsS3(quiz.authorId);
            }
            res.status(200).json(quizzes);

        } else {
            res.status(404).json({ message: 'No quizzes found!' });

        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};