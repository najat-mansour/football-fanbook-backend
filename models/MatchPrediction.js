import db from '../config/db.js';
import { X2Booster } from '../enums/matches.js'; 
import { InvalidX2BoosterValueError } from '../errors/matches.js';

class MatchPrediction {
    /**
     * @param {string} userId
     * @param {string} matchId   
     * @param {string} matchStatus
     * @param {number} homeGoals
     * @param {number} awayGoals
     * @param {string} firstTeamToScore
     * @param {X2Booster} x2Booster
     */
    constructor(userId, matchId, matchStatus, homeGoals, awayGoals, firstTeamToScore, x2Booster) {
        this.userId = userId;
        this.matchId = matchId;
        this.homeGoals = homeGoals;
        this.awayGoals = awayGoals;
        if (x2Booster != X2Booster.OFF && x2Booster != X2Booster.ON) {
            throw new InvalidX2BoosterValueError();
        }
        this.x2Booster = x2Booster;
        this.score = 0;
        this.matchStatus = matchStatus;
        this.underdogBonusPoints = 0;
        this.firstTeamToScore = firstTeamToScore; 
    }

    async registerMatchPrediction() {
        const sql = /*sql*/`
            INSERT INTO match_prediction (userId, matchId, matchStatus, homeGoals, awayGoals, firstTeamToScore, x2Booster, underdogBonusPoints, score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return await db.execute(sql, [
            this.userId,
            this.matchId,
            this.matchStatus,
            this.homeGoals,
            this.awayGoals,
            this.firstTeamToScore,
            this.x2Booster,
            this.underdogBonusPoints,
            this.score,
        ]);
    }

    /**
     * @param {string} userId
     */
    static async getAllUserMatches(userId) {
        const sql = /*sql*/`
            SELECT mp.userId, mp.matchId, mp.matchStatus, mp.homeGoals, mp.awayGoals, mp.firstTeamToScore, 
                   mp.x2Booster, mp.underdogBonusPoints, mp.score, u.username, u.image
            FROM match_prediction mp
            JOIN users u ON mp.userId = u.id
            WHERE mp.userId = ?
        `;
        return await db.execute(sql, [userId]);
    }

    /**
     * @param {string} userId
     * @param {string} matchId
     */
    static async getMatchPredictions(matchId) {
        const sql = /*sql*/`
            SELECT mp.userId, mp.matchId, mp.matchStatus, mp.homeGoals, mp.awayGoals, mp.firstTeamToScore, 
                   mp.x2Booster, mp.underdogBonusPoints, mp.score, u.username, u.image
            FROM match_prediction mp
            JOIN users u ON mp.userId = u.id
            WHERE mp.matchId = ?
        `;
        return await db.execute(sql, [matchId]);
    }
}

export default MatchPrediction;