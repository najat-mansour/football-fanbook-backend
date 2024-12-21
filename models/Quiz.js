import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { ScorePoints } from '../enums/users.js';
import { QuizStatus, AiStatus } from '../enums/quizzes.js';
import { InvalidNotificationStatusValueError } from '../errors/users.js';
import { InvalidContainsAiValueError } from '../errors/quizzes.js';
import User from './User.js';

class Quiz {
    /**
     * @param {JSON} quizData
     * @param {string} authorId
     * @param {number} status
     * @param {number} containsAI
     */
    constructor(quizData, authorId, status, containsAI = AiStatus.AI_FREE) {
        this.quizId = uuidv4();
        this.quizData = quizData;
        this.date = new Date().toISOString().slice(0, 10);
        this.authorId = authorId;
        this.status = status;
        this.containsAI = containsAI;
    }

    async registerQuiz() {
        const sql = /*sql*/`INSERT INTO quizzes (quizId, quizData, date, status, containsAI, authorId) VALUES (?, ?, ?, ?, ?, ?)`;

        return await db.execute(sql, [
            this.quizId,
            JSON.stringify(this.quizData),
            this.date,
            this.status,
            this.containsAI,
            this.authorId,
        ]);
    }

    /**
     * @param {string} quizId
     * @param {JSON} info
     */
    static async updateQuiz(quizId, info) {
        const { quizData, status, containsAI } = info;

        let updateClauses = [];

        // Retrieve the current status of the quiz
        const [currentQuiz] = await db.execute(/*sql*/`SELECT status, authorId FROM quizzes WHERE quizId = ?`, [quizId]);
        if (currentQuiz.length === 0) {
            throw new Error("Quiz not found");
        }

        const { status: currentStatus, authorId } = currentQuiz[0];

        if (quizData) {
            try {
                updateClauses.push({ field: 'quizData', value: JSON.stringify(quizData) });
            } catch (error) {
                console.error("Error stringifying quizData:", error);
                throw new Error("Invalid quizData format");
            }
        }

        if (status) {
            if (status != QuizStatus.SAVED && status != QuizStatus.PUBLISHED) {
                throw new InvalidNotificationStatusValueError();
            }
            updateClauses.push({ field: 'status', value: status });

            // Check if status changes from 0 to 1
            if (currentStatus == QuizStatus.SAVED && status == QuizStatus.PUBLISHED) {
                await User.updateUserScore(authorId, 10);
            }
        }

        if (containsAI) {
            if (containsAI != AiStatus.CONTAINS_AI && containsAI != AiStatus.AI_FREE)
                throw new InvalidContainsAiValueError();
            updateClauses.push({ field: 'containsAI', value: containsAI });
        }

        if (updateClauses.length === 0) {
            //! No updates to perform
            return;
        }

        updateClauses.push({ field: 'date', value: new Date().toISOString().slice(0, 10) });

        const setStatements = updateClauses.map(({ field }) => `${field} = ?`).join(', ');
        const values = updateClauses.map(({ value }) => value);

        const sql = `UPDATE quizzes SET ${setStatements} WHERE quizId = ?`;
        await db.execute(sql, [...values, quizId]);

        // Recalculate and update scores in solved_quizzes
        if (quizData) {
            await this.updateSolvedQuizScores(quizId, quizData);
        }
    }

    /**
     * Recalculates and updates the scores for all solved quizzes for a given quizId.
     * @param {string} quizId
     * @param {JSON} newQuizData
     */
    static async updateSolvedQuizScores(quizId, newQuizData) {
        const [solvedQuizzes] = await db.execute(/*sql*/`SELECT userId, answers FROM solved_quizzes WHERE quizId = ?`, [quizId]);
        const newCorrectOptions = newQuizData.map(q => q.correctOption);

        const updatePromises = solvedQuizzes.map(async (solvedQuiz) => {
            const { userId, answers } = solvedQuiz;
            let parsedAnswers;

            try {
                parsedAnswers = JSON.parse(JSON.stringify(answers));
            } catch (error) {
                console.error("Error parsing answers:", error);
                throw new Error("Invalid answers format");
            }

            let newScore = 0;

            for (let i = 0; i < newCorrectOptions.length; i++) {
                const questionNumber = (i + 1).toString();
                if (parsedAnswers[questionNumber] === newCorrectOptions[i]) {
                    newScore += 1; // Assuming score is incremented by 1 for each correct answer
                }
            }

            await db.execute(/*sql*/`UPDATE solved_quizzes SET score = ? WHERE quizId = ? AND userId = ?`, [newScore, quizId, userId]);
            
            // Update the user score
            await User.updateUserScore(userId, newScore);
        });

        await Promise.all(updatePromises);
    }

    /**
     * @param {string} quizId 
     */
    static async getQuizById(quizId) {
        const sql = /*sql*/`
            SELECT q.quizId, q.quizData, q.date, q.status, q.authorId, u.username AS authorUsername, u.firstName AS authorFirstName, u.lastName AS authorLastName, u.image AS authorImage,
                   COUNT(sq.quizId) AS timesSolved, 
                   IFNULL(AVG(sq.score), 0) AS averageScore, 
                   IFNULL(AVG(sq.rating), 0) AS averageRating
            FROM quizzes q
            LEFT JOIN users u ON q.authorId = u.id
            LEFT JOIN solved_quizzes sq ON q.quizId = sq.quizId
            WHERE q.quizId = ?
            GROUP BY q.quizId, q.quizData, q.date, q.status, q.authorId, u.username, u.firstName, u.lastName, u.image
        `;
        return await db.execute(sql, [quizId]);
    }

    /**
     * @param {string} authorId 
     */
    static async getAllUserQuizzes(authorId) {
        const sql = /*sql*/`
            SELECT q.quizId, q.quizData, q.date, q.status, q.containsAI, q.authorId, u.username AS authorUsername, u.firstName AS authorFirstName, u.lastName AS authorLastName, u.image AS authorImage,
                   COUNT(sq.quizId) AS timesSolved, 
                   IFNULL(AVG(sq.score), 0) AS averageScore, 
                   IFNULL(AVG(sq.rating), 0) AS averageRating
            FROM quizzes q
            LEFT JOIN users u ON q.authorId = u.id
            LEFT JOIN solved_quizzes sq ON q.quizId = sq.quizId
            WHERE q.authorId = ?
            GROUP BY q.quizId, q.quizData, q.date, q.status, q.authorId, u.username, u.firstName, u.lastName, u.image
        `;
        return await db.execute(sql, [authorId]);
    }

    static async getAllQuizzes() {
        const sql = /*sql*/`
            SELECT q.quizId, q.quizData, q.date, q.status, q.authorId, u.username AS authorUsername, u.firstName AS authorFirstName, u.lastName AS authorLastName, u.image AS authorImage,
                   COUNT(sq.quizId) AS timesSolved, 
                   IFNULL(AVG(sq.score), 0) AS averageScore, 
                   IFNULL(AVG(sq.rating), 0) AS averageRating
            FROM quizzes q
            LEFT JOIN users u ON q.authorId = u.id
            LEFT JOIN solved_quizzes sq ON q.quizId = sq.quizId
            GROUP BY q.quizId, q.quizData, q.date, q.status, q.authorId, u.username, u.firstName, u.lastName, u.image
        `;
        return await db.execute(sql);
    }

    /**
     * @param {string} quizId
     */
    static async deleteQuiz(quizId) {
        // Retrieve the quiz and its author
        const [quizResults] = await db.execute(/*sql*/`SELECT authorId FROM quizzes WHERE quizId = ?`, [quizId]);

        if (quizResults.length === 0) {
            throw new Error("Quiz not found");
        }

        const { authorId } = quizResults[0];

        // Count the number of times the quiz has been solved
        const [solvedResults] = await db.execute(/*sql*/`SELECT COUNT(*) as timesSolved FROM solved_quizzes WHERE quizId = ?`, [quizId]);

        const timesSolved = solvedResults[0].timesSolved;

        // Calculate the decrease in score (use PUBLISH_QUIZ as threshold)
        const scoreDecrease = timesSolved > ScorePoints.PUBLISH_QUIZ ? Math.floor(timesSolved / 2) : ScorePoints.PUBLISH_QUIZ;

        // Update the author's score
        await User.updateUserScore(authorId, -scoreDecrease);

        // Delete the quiz
        const sql = /*sql*/`DELETE FROM quizzes WHERE quizId = ?`;
        await db.execute(sql, [quizId]);

        // Also delete solved quizzes related to the quiz
        const deleteSolvedQuizzesSql = /*sql*/`DELETE FROM solved_quizzes WHERE quizId = ?`;
        return await db.execute(deleteSolvedQuizzesSql, [quizId]);
    }

    /**
     * @param {string} userId 
     */
    static async getAvailableQuizzes(userId) {
        const sql = /*sql*/`
            SELECT 
                q.quizId, q.quizData, q.date, q.status, q.authorId,
                u.username AS authorUsername, u.firstName AS authorFirstName, u.lastName AS authorLastName, u.image AS authorImage,
                IFNULL(AVG(sq.score), 0) AS averageScore, 
                IFNULL(AVG(sq.rating), 0) AS averageRating,
                COUNT(sq.quizId) AS timesSolved
            FROM quizzes q
            LEFT JOIN users u ON q.authorId = u.id
            LEFT JOIN solved_quizzes sq ON q.quizId = sq.quizId
            WHERE q.status = 1 AND q.authorId != ? AND q.quizId NOT IN (
                SELECT quizId FROM solved_quizzes WHERE userId = ?
            )
            GROUP BY q.quizId, q.quizData, q.date, q.status, q.authorId, u.username, u.firstName, u.lastName, u.image
        `;
        return await db.execute(sql, [userId, userId]);
    }

    /**
     * @param {JSON} fields 
     */
    static async search(fields) {
        let query = /*sql*/`
            SELECT q.quizId, q.quizData, q.date, q.status, q.authorId, u.username AS authorUsername, u.firstName AS authorFirstName, u.lastName AS authorLastName, u.image AS authorImage,
                   COUNT(sq.quizId) AS timesSolved, 
                   IFNULL(AVG(sq.score), 0) AS averageScore, 
                   IFNULL(AVG(sq.rating), 0) AS averageRating
            FROM quizzes q
            LEFT JOIN users u ON q.authorId = u.id
            LEFT JOIN solved_quizzes sq ON q.quizId = sq.quizId
            WHERE 1
        `;
        
        const { date, username, name } = fields;
        const values = [];

        if (date) {
            query += /*sql*/` AND q.date = ?`;
            values.push(date);
        }

        if (username) {
            query += /*sql*/` AND u.username = ?`;
            values.push(username);
        }

        if (name) {
            const { firstName, lastName } = name || {};
            if (firstName) {
                query += /*sql*/` AND u.firstName = ?`;
                values.push(firstName);
            }
            if (lastName) {
                query += /*sql*/` AND u.lastName = ?`;
                values.push(lastName);
            }
        }

        query += /*sql*/` GROUP BY q.quizId, q.quizData, q.date, q.status, q.authorId, u.username, u.firstName, u.lastName, u.image`;

        return await db.execute(query, values);
    }
}

export default Quiz;