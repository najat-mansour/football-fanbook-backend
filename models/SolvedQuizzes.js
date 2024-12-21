import db from '../config/db.js';
import { ScorePoints } from '../enums/users.js';
import { QuizRating } from '../enums/quizzes.js';
import { InvalidQuizRatingError, UserCannotSolveItsOwnQuizError } from '../errors/quizzes.js';
import User from './User.js';

class SolvedQuiz {
    /**
     * @param {string} quizId
     * @param {string} userId
     * @param {number} score
     * @param {number} rating
     * @param {JSON} answers
     */
    constructor(quizId, userId, score, rating, answers) {
        this.quizId = quizId;
        this.userId = userId;
        this.score = score;
        if (rating < QuizRating.MINIMUM_RATING || rating > QuizRating.MAXIMUM_RATING) {
            throw new InvalidQuizRatingError();
        }
        this.rating = rating;
        this.answers = answers;
    }

    async registerSolvedQuiz() {
        // Check if the user is the author of the quiz
        const [quiz] = await db.execute(/*sql*/`SELECT authorId FROM quizzes WHERE quizId = ?`, [this.quizId]);
        if (quiz.length > 0 && quiz[0].authorId === this.userId) {
            throw new UserCannotSolveItsOwnQuizError();
        }

        // Update user score by adding the score for solving a quiz
        await User.updateUserScore(this.userId, this.score);

        // Update the quiz author's score by adding 1 point
        const authorId = quiz[0].authorId;
        await User.updateUserScore(authorId, ScorePoints.SOLVED_ITS_OWN_QUIZ);

        const sql = /*sql*/`INSERT INTO solved_quizzes (quizId, userId, score, rating, answers) VALUES (?, ?, ?, ?, ?)`;

        return await db.execute(sql, [
            this.quizId,
            this.userId,
            this.score,
            this.rating,
            JSON.stringify(this.answers)
        ]);
    }

    static async getSolvedQuizById(quizId, userId) {
        const sql = /*sql*/`
            SELECT sq.quizId, sq.userId, sq.score, sq.rating, sq.answers,
                   u.username AS userUsername, u.firstName AS userFirstName, u.lastName AS userLastName,
                   q.quizData, q.date, 
                   au.username AS authorUsername, au.firstName AS authorFirstName, au.lastName AS authorLastName, au.image AS authorImage,
                   COUNT(sq2.quizId) AS timesSolved, 
                   IFNULL(AVG(sq2.score), 0) AS averageScore, 
                   IFNULL(AVG(sq2.rating), 0) AS averageRating
            FROM solved_quizzes sq
            INNER JOIN users u ON sq.userId = u.id
            LEFT JOIN solved_quizzes sq2 ON sq.quizId = sq2.quizId
            INNER JOIN quizzes q ON sq.quizId = q.quizId
            INNER JOIN users au ON q.authorId = au.id
            WHERE sq.quizId = ? AND sq.userId = ?
            GROUP BY sq.quizId, sq.userId, sq.score, sq.rating, sq.answers, u.username, u.firstName, u.lastName, q.quizData, q.date, au.username, au.firstName, au.lastName, au.image
        `;
        return await db.execute(sql, [quizId, userId]);
    }

    /**
     * @param {string} userId 
     */
    static async getAllUserSolvedQuizzes(userId) {
        const sql = /*sql*/`
            SELECT sq.quizId, sq.userId, sq.score, sq.rating, sq.answers,
                   u.username AS userUsername, u.firstName AS userFirstName, u.lastName AS userLastName,
                   q.quizData, q.date, 
                   au.id as authorId, au.username AS authorUsername, au.firstName AS authorFirstName, au.lastName AS authorLastName, au.image AS authorImage,
                   COUNT(sq2.quizId) AS timesSolved, 
                   IFNULL(AVG(sq2.score), 0) AS averageScore, 
                   IFNULL(AVG(sq2.rating), 0) AS averageRating
            FROM solved_quizzes sq
            INNER JOIN users u ON sq.userId = u.id
            LEFT JOIN solved_quizzes sq2 ON sq.quizId = sq2.quizId
            INNER JOIN quizzes q ON sq.quizId = q.quizId
            INNER JOIN users au ON q.authorId = au.id
            WHERE sq.userId = ?
            GROUP BY sq.quizId, sq.userId, sq.score, sq.rating, sq.answers, u.username, u.firstName, u.lastName, q.quizData, q.date, au.username, au.firstName, au.lastName, au.image
        `;
        return await db.execute(sql, [userId]);
    }

    static async search(fields) {
        let query = /*sql*/`
            SELECT sq.quizId, sq.userId, sq.score, sq.rating, sq.answers,
                   u.username AS userUsername, u.firstName AS userFirstName, u.lastName AS userLastName,
                   q.quizData, q.date, 
                   au.username AS authorUsername, au.firstName AS authorFirstName, au.lastName AS authorLastName, au.image AS authorImage,
                   COUNT(sq2.quizId) AS timesSolved, 
                   IFNULL(AVG(sq2.score), 0) AS averageScore, 
                   IFNULL(AVG(sq2.rating), 0) AS averageRating
            FROM solved_quizzes sq
            INNER JOIN users u ON sq.userId = u.id
            LEFT JOIN solved_quizzes sq2 ON sq.quizId = sq2.quizId
            INNER JOIN quizzes q ON sq.quizId = q.quizId
            INNER JOIN users au ON q.authorId = au.id
            WHERE 1
        `;

        const { quizId, userId, score, rating } = fields;
        const values = [];

        if (quizId) {
            query += /*sql*/` AND sq.quizId = ?`;
            values.push(quizId);
        }

        if (userId) {
            query += /*sql*/` AND sq.userId = ?`;
            values.push(userId);
        }

        if (score !== undefined) {
            query += /*sql*/` AND sq.score = ?`;
            values.push(score);
        }

        if (rating !== undefined) {
            query += /*sql*/` AND sq.rating = ?`;
            values.push(rating);
        }

        query += /*sql*/` GROUP BY sq.quizId, sq.userId, sq.score, sq.rating, sq.answers, u.username, u.firstName, u.lastName, q.quizData, q.date, au.username, au.firstName, au.lastName, au.image`;

        return await db.execute(query, values);
    }

    /**
     * @param {string} quizId
     * @param {string} userId
     * @param {number} newRating
     */
    static async updateSolvedQuizRating(quizId, userId, newRating) {
        if (newRating < QuizRating.MINIMUM_RATING || newRating > QuizRating.MAXIMUM_RATING) {
            throw new InvalidQuizRatingError();
        }

        const sql = /*sql*/`
            UPDATE solved_quizzes
            SET rating = ?
            WHERE quizId = ? AND userId = ?
        `;

        return await db.execute(sql, [newRating, quizId, userId]);
    }

    /**
     * @param {string} quizId
     */
    static async getUsersWhoSolvedQuiz(quizId) {
        const sql = /*sql*/`
        SELECT u.id, u.image, u.username, u.firstName, sq.score, sq.rating, sq.answers, q.quizData
        FROM solved_quizzes sq
        INNER JOIN users u ON sq.userId = u.id
        INNER JOIN quizzes q ON sq.quizId = q.quizId
        WHERE sq.quizId = ?
        ORDER BY sq.score DESC
    `;
        return await db.execute(sql, [quizId]);
    }

    /**
     * @param {string} quizId
     */
    static async getCorrectAnswersCount(quizId) {
        // Retrieve the quizData which includes the correct answers
        const [quizResults] = await db.execute(/*sql*/`
            SELECT quizData
            FROM quizzes
            WHERE quizId = ?
        `, [quizId]);

        if (quizResults.length === 0) {
            throw new Error('Quiz not found');
        }

        const quizData = JSON.parse(JSON.stringify(quizResults[0].quizData));
        const correctOptions = quizData.map(question => question.correctOption);

        // Retrieve all answers from the solved_quizzes table for the given quizId
        const [solvedQuizzes] = await db.execute(/*sql*/`
            SELECT answers
            FROM solved_quizzes
            WHERE quizId = ?
        `, [quizId]);

        const questionCorrectCounts = correctOptions.map(() => 0);

        solvedQuizzes.forEach(solvedQuiz => {
            const userAnswers = JSON.parse(JSON.stringify(solvedQuiz.answers));
            correctOptions.forEach((correctOption, index) => {
                if (userAnswers[index + 1] === correctOption) {
                    questionCorrectCounts[index]++;
                }
            });
        });        

        return questionCorrectCounts;
    }

    /**
     * @param {string} quizId
     */
    static async getUsersScoreDistribution(quizId) {
        // Retrieve the quizData to determine the total number of questions
        const [quizResults] = await db.execute(/*sql*/`
            SELECT quizData
            FROM quizzes
            WHERE quizId = ?
        `, [quizId]);

        if (quizResults.length === 0) {
            throw new Error('Quiz not found');
        }

        const quizData = JSON.parse(JSON.stringify(quizResults[0].quizData));
        const totalQuestions = quizData.length;

        // Retrieve all scores from the solved_quizzes table for the given quizId
        const [solvedQuizzes] = await db.execute(/*sql*/`
            SELECT score
            FROM solved_quizzes
            WHERE quizId = ?
        `, [quizId]);

        const scoreRanges = {
            '0-49%': 0,
            '50-59%': 0,
            '60-69%': 0,
            '70-79%': 0,
            '80-89%': 0,
            '90-100%': 0
        };

        solvedQuizzes.forEach(solvedQuiz => {
            const score = solvedQuiz.score;
            const percentage = (score / totalQuestions) * 100;

            if (percentage >= 0 && percentage <= 49) {
                scoreRanges['0-49%']++;
            } else if (percentage >= 50 && percentage <= 59) {
                scoreRanges['50-59%']++;
            } else if (percentage >= 60 && percentage <= 69) {
                scoreRanges['60-69%']++;
            } else if (percentage >= 70 && percentage <= 79) {
                scoreRanges['70-79%']++;
            } else if (percentage >= 80 && percentage <= 89) {
                scoreRanges['80-89%']++;
            } else if (percentage >= 90 && percentage <= 100) {
                scoreRanges['90-100%']++;
            }
        });

        return scoreRanges;
    }
}

export default SolvedQuiz;