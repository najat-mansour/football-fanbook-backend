import db from '../config/db.js';
import { X2Booster } from '../enums/matches.js';
import { InvalidX2BoosterValueError } from '../errors/matches.js';

class LiveShow {
    /**
     * @param {string} userId
     * @param {string} matchId
     * @param {string} matchStatus
     * @param {JSON} selectedPlayers
     * @param {number} x2Booster
     * @param {number} score
     */
    constructor(userId, matchId, matchStatus, selectedPlayers, x2Booster) {
        this.userId = userId;
        this.matchId = matchId;
        this.matchStatus = matchStatus;
        this.selectedPlayers = selectedPlayers;
        if (x2Booster != X2Booster.OFF && x2Booster != X2Booster.ON) {
            throw new InvalidX2BoosterValueError();
        }
        this.x2Booster = x2Booster;
        this.playerOnePoints = 0;
        this.playerTwoPoints = 0;
        this.playerThreePoints = 0;
        this.score = 0;
    }

    async registerLiveShow() {        
        const sql = /*sql*/`
            INSERT INTO live_show (userId, matchId, matchStatus, selectedPlayers, x2Booster, playerOnePoints, playerTwoPoints, playerThreePoints, score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        return await db.execute(sql, [
            this.userId,
            this.matchId,
            this.matchStatus,
            JSON.stringify(this.selectedPlayers),
            this.x2Booster,
            this.playerOnePoints,
            this.playerTwoPoints,
            this.playerThreePoints,
            this.score,
        ]);
    }

    /**
     * @param {string} userId
     */
    static async getAllUserLiveShows(userId) {
        const sql = /*sql*/`
            SELECT ls.*, u.username, u.image
            FROM live_show ls
            JOIN users u ON ls.userId = u.id
            WHERE ls.userId = ?
        `;
        return await db.execute(sql, [userId]);
    }

    /**
     * @param {string} userId
     * @param {string} matchId
     */
    static async getLiveShows(matchId) {
        const sql = /*sql*/`
            SELECT ls.*, u.username, u.image
            FROM live_show ls
            JOIN users u ON ls.userId = u.id
            WHERE ls.matchId = ?
        `;
        return await db.execute(sql, [matchId]);
    }
}

export default LiveShow;