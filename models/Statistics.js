import db from '../config/db.js';

class Statistics {
    /**
     * @param {string} userId 
     */
    static async getTotalScores(userId) {
        const [matchPredictionResult] = await db.execute(/*sql*/`
            SELECT COALESCE(SUM(score), 0) as totalMatchPredictionScore
            FROM match_prediction
            WHERE userId = ?
        `, [userId]);

        const [liveShowResult] = await db.execute(/*sql*/`
            SELECT COALESCE(SUM(score), 0) as totalLiveShowScore
            FROM live_show
            WHERE userId = ?
        `, [userId]);

        const [solvedQuizzesResult] = await db.execute(/*sql*/`
            SELECT COALESCE(SUM(score), 0) as totalQuizScore
            FROM solved_quizzes
            WHERE userId = ?
        `, [userId]);

        return {
            totalMatchPredictionScore: Number(matchPredictionResult[0].totalMatchPredictionScore),
            totalLiveShowScore: Number(liveShowResult[0].totalLiveShowScore),
            totalQuizScore: Number(solvedQuizzesResult[0].totalQuizScore)
        };
    }

    /**
     * @param {string} userId 
     */
    static async getLastFiveMatchPredictionScores(userId) {
        const [lastFiveScoresResult] = await db.execute(/*sql*/`
            SELECT score
            FROM match_prediction
            WHERE userId = ?
            ORDER BY matchId DESC
            LIMIT 5
        `, [userId]);

        return lastFiveScoresResult.map(row => row.score);
    }

    /**
     * @param {string} userId 
     */
    static async getLastFiveLiveShowScores(userId) {
        const [lastFiveScoresResult] = await db.execute(/*sql*/`
            SELECT score
            FROM live_show
            WHERE userId = ?
            ORDER BY matchId DESC
            LIMIT 5
        `, [userId]);

        return lastFiveScoresResult.map(row => row.score);
    }

    /**
     * @param {string} userId 
     */
    static async getMatchPredictionScoreStats(userId) {
        const [result] = await db.execute(/*sql*/`
            SELECT 
                IFNULL(MAX(score), 0) as highestScore, 
                IFNULL(MIN(score), 0) as lowestScore, 
                IFNULL(AVG(score), 0) as averageScore
            FROM match_prediction
            WHERE userId = ?
        `, [userId]);

        return result[0];
    }

    /**
     * @param {string} userId 
     */
    static async getLiveShowScoreStats(userId) {
        const [result] = await db.execute(/*sql*/`
            SELECT 
                IFNULL(MAX(score), 0) as highestScore, 
                IFNULL(MIN(score), 0) as lowestScore, 
                IFNULL(AVG(score), 0) as averageScore
            FROM live_show
            WHERE userId = ?
        `, [userId]);

        return result[0];
    }

    /**
 * @param {string} userId 
 */
    static async getQuizScoreStats(userId) {
        const [result] = await db.execute(/*sql*/`
        WITH RankedScores AS (
            SELECT 
                sq.score AS raw_score,
                sq.score / JSON_LENGTH(q.quizData) AS normalized_score,
                JSON_LENGTH(q.quizData) AS quizLength
            FROM 
                solved_quizzes sq
            INNER JOIN 
                quizzes q ON sq.quizId = q.quizId
            WHERE 
                sq.userId = ?
        ),
        ScoreStats AS (
            SELECT
                raw_score,
                quizLength,
                normalized_score,
                MAX(normalized_score) OVER () AS highestNormalizedScore,
                MIN(normalized_score) OVER () AS lowestNormalizedScore
            FROM RankedScores
        )
        SELECT 
            IFNULL(MAX(CASE WHEN normalized_score = highestNormalizedScore THEN raw_score END), 0) AS highestScore,
            IFNULL(MAX(CASE WHEN normalized_score = highestNormalizedScore THEN quizLength END), 0) AS highestQuizLength,
            IFNULL(MIN(CASE WHEN normalized_score = lowestNormalizedScore THEN raw_score END), 0) AS lowestScore,
            IFNULL(MAX(CASE WHEN normalized_score = lowestNormalizedScore THEN quizLength END), 0) AS lowestQuizLength,
            IFNULL(AVG(raw_score), 0) AS averageScore
        FROM ScoreStats;
    `, [userId]);

        return result[0];
    }

    /**
     * @param {string} userId 
     */
    static async getUserQuizzesAiStatusDistribution(userId) {
        const [result] = await db.execute(/*sql*/`
            SELECT
                SUM(CASE WHEN containsAI = 1 THEN 1 ELSE 0 END) AS withAI,
                SUM(CASE WHEN containsAI = 0 THEN 1 ELSE 0 END) AS withoutAI
            FROM quizzes
            WHERE authorId = ?
        `, [userId]);

        return result[0];
    }

    /**
     * @param {string} authorId 
     */
    static async getUserQuizzesScoreDistribution(authorId) {
        const [result] = await db.execute(/*sql*/`
        SELECT
            SUM(CASE 
                WHEN (sq.score / JSON_LENGTH(q.quizData)) * 100 BETWEEN 0 AND 49 THEN 1
                ELSE 0
            END) AS '0-49%',
            SUM(CASE 
                WHEN (sq.score / JSON_LENGTH(q.quizData)) * 100 BETWEEN 50 AND 59 THEN 1
                ELSE 0
            END) AS '50-59%',
            SUM(CASE 
                WHEN (sq.score / JSON_LENGTH(q.quizData)) * 100 BETWEEN 60 AND 69 THEN 1
                ELSE 0
            END) AS '60-69%',
            SUM(CASE 
                WHEN (sq.score / JSON_LENGTH(q.quizData)) * 100 BETWEEN 70 AND 79 THEN 1
                ELSE 0
            END) AS '70-79%',
            SUM(CASE 
                WHEN (sq.score / JSON_LENGTH(q.quizData)) * 100 BETWEEN 80 AND 89 THEN 1
                ELSE 0
            END) AS '80-89%',
            SUM(CASE 
                WHEN (sq.score / JSON_LENGTH(q.quizData)) * 100 BETWEEN 90 AND 100 THEN 1
                ELSE 0
            END) AS '90-100%'
        FROM solved_quizzes sq
        JOIN quizzes q ON sq.quizId = q.quizId
        WHERE q.authorId = ?
    `, [authorId]);

        return result[0];
    }
}

export default Statistics;