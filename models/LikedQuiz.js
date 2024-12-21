import db from '../config/db.js';

class LikedQuiz {
    /**
     * @param {string} userId
     * @param {string} quizId
     */
    constructor(userId, quizId) {
        this.userId = userId;
        this.quizId = quizId;
    }


    async register() {
        const sql = /*sql*/`
            INSERT INTO liked_quizzes (userId, quizId)
            VALUES (?, ?)
        `;
        await db.execute(sql, [this.userId, this.quizId]);
    }

    /**
     * @param {string} userId
     * @param {string} quizId
     */
    static async delete(userId, quizId) {
        const sql = /*sql*/`
            DELETE FROM liked_quizzes
            WHERE userId = ? AND quizId = ?
        `;
        await db.execute(sql, [userId, quizId]);
    }

    /**
     * Check if a user has liked a specific quiz
     * @param {string} userId
     * @param {string} quizId
     */
    static async isLiked(userId, quizId) {
        const sql = /*sql*/`
            SELECT COUNT(*) as count
            FROM liked_quizzes
            WHERE userId = ? AND quizId = ?
        `;
        const [result] = await db.execute(sql, [userId, quizId]);
        return result[0].count > 0;
    }
}

export default LikedQuiz;