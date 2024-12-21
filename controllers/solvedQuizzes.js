import SolvedQuiz from '../models/SolvedQuizzes.js';
import LikedQuiz from '../models/LikedQuiz.js';
import { UserImageStatus } from '../enums/users.js';
import { getImageUrlInAwsS3 } from '../services/AwsS3.js';

export const registerSolvedQuiz = async (req, res, next) => {
    try {
        const solvedQuiz = new SolvedQuiz(
            req.body.quizId,
            req.body.userId,
            req.body.score,
            req.body.rating,
            req.body.answers
        );

        await solvedQuiz.registerSolvedQuiz();
        res.status(201).json({ message: 'Solved quiz registered successfully!' });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
        
    }
};

export const getSolvedQuizById = async (req, res, next) => {
    try {
        const { quizId, userId } = req.params;
        const [solvedQuiz] = await SolvedQuiz.getSolvedQuizById(quizId, userId);
        if (solvedQuiz.length !== 0) {
            if (solvedQuiz[0].authorImage == UserImageStatus.VALID)
                solvedQuiz[0].authorImage = await getImageUrlInAwsS3(solvedQuiz[0].authorId);
            res.status(200).json(solvedQuiz[0]);

        } else {
            res.status(404).json({ message: 'Solved quiz not found!' });

        }

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};


export const getAllUserSolvedQuizzes = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const [solvedQuizzes] = await SolvedQuiz.getAllUserSolvedQuizzes(userId);

        if (solvedQuizzes.length !== 0) {
            for (const solvedQuiz of solvedQuizzes) {
                if (solvedQuiz.authorImage == UserImageStatus.VALID)
                    solvedQuiz.authorImage = await getImageUrlInAwsS3(solvedQuiz.authorId);                
            }
            const solvedQuizzesWithLikeStatus = await Promise.all(
                solvedQuizzes.map(async (quiz) => {
                    const isLikedByUser = await LikedQuiz.isLiked(userId, quiz.quizId);
                    return {
                        ...quiz,
                        isLikedByUser
                    };
                })
            );

            res.status(200).json(solvedQuizzesWithLikeStatus);   

        } else {
            res.status(404).json({ message: 'No solved quizzes found for this user!' });
            
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const searchSolvedQuizzes = async (req, res, next) => {
    try {
        const fields = req.body;
        const [solvedQuizzes] = await SolvedQuiz.search(fields);

        if (solvedQuizzes.length !== 0) {
            for (const solvedQuiz of solvedQuizzes) {
                if (solvedQuiz.authorImage == UserImageStatus.VALID)
                    solvedQuiz.authorImage = await getImageUrlInAwsS3(solvedQuiz.authorId);
            }
            res.status(200).json(solvedQuizzes);

        } else {
            res.status(404).json({ message: 'No solved quizzes found!' });

        }

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
        
    }
};

export const updateSolvedQuizRating = async (req, res, next) => {
    try {
        const { quizId, userId, newRating } = req.body;
        await SolvedQuiz.updateSolvedQuizRating(quizId, userId, newRating);
        res.status(200).json({ message: 'Quiz rating updated successfully!' });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};

export const getUsersWhoSolvedQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const [users] = await SolvedQuiz.getUsersWhoSolvedQuiz(quizId);
        if (users.length !== 0) { 
            for (const user of users) {
                if (user.image == UserImageStatus.VALID)
                    user.image = await getImageUrlInAwsS3(user.id);
            }
            res.status(200).json(users);

        } else {
            res.status(404).json({ message: 'No users found!' });
        }

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};

export const getCorrectAnswersCount = async (req, res, next) => { 
    try {
        const { quizId } = req.params;
        const questionCorrectCounts = await SolvedQuiz.getCorrectAnswersCount(quizId);
        res.status(200).json({ questionCorrectCounts });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};

export const getUsersScoreDistribution = async (req, res, next) => { 
    try {
        const { quizId } = req.params;
        const scoreRanges = await SolvedQuiz.getUsersScoreDistribution(quizId);
        res.status(200).json({ scoreRanges });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};