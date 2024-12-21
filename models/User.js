import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { createHash } from 'crypto';
import PasswordChecker from '../helpers/PasswordChecker.js';
import CodeGenerator from '../helpers/CodeGenerator.js';
import { WeakPasswordError, InvalidAppRatingValueError, InvalidNotificationStatusValueError, MissingOldPasswordError } from '../errors/users.js';
import { UserImageStatus, AppRating, NotificationStatus } from '../enums/users.js'; 
import { uploadImageToAwsS3, deleteImageFromAwsS3 } from '../services/AwsS3.js';

class User {
    /**
     * @param {JSON} name 
     * @param {string} username
     * @param {string} password 
     * @param {string} image 
     * @param {string} favoriteNationalTeam
     * @param {string} favoriteClub
     * @param {number} appRating
     * @param {NotificationStatus} notificationStatus 
     */
    constructor(username, email, name, image, password, favoriteNationalTeam, favoriteClub) {
        const { firstName, lastName } = name;
        this.id = uuidv4();
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.image =  image == null ? UserImageStatus.INVALID : UserImageStatus.VALID;
        if (!PasswordChecker.isStrongPassword(password))
            throw new WeakPasswordError();
        this.password = password;
        this.favoriteNationalTeam = favoriteNationalTeam;
        this.favoriteClub = favoriteClub;
        this.score = 0;
        this.appRating = AppRating.INITIALIZED_VALUE;
        this.notificationStatus = NotificationStatus.OFF;
    }

    async registerUser() {
        let sql = /*sql*/`insert into users (id, username, email, firstName, lastName, image, password, favoriteNationalTeam, favoriteClub, score, appRating, notificationStatus) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        return await db.execute(sql, [
            this.id,
            this.username,
            this.email,
            this.firstName,
            this.lastName, 
            this.image,
            createHash('sha256').update(this.password).digest('hex'),
            this.favoriteNationalTeam,
            this.favoriteClub,
            this.score,
            this.appRating,
            this.notificationStatus
        ]);
    }

    static async getAllUsers() {
        let sql = /*sql*/`
            SELECT 
                u.id, u.username, u.email, u.firstName, u.lastName, u.image, u.favoriteNationalTeam, 
                u.favoriteClub, u.score, u.appRating, u.notificationStatus, 
                IFNULL(AVG(sq.rating), 0) AS averageQuizRating
            FROM users u
            LEFT JOIN quizzes q ON u.id = q.authorId
            LEFT JOIN solved_quizzes sq ON q.quizId = sq.quizId
            GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.image, 
                     u.favoriteNationalTeam, u.favoriteClub, u.score, u.appRating, u.notificationStatus
        `;
        return await db.execute(sql);
    }    

    /**
     * @param {string} username 
     */
    static async getUserPassword(username) {
        let sql = /*sql*/`SELECT password FROM users WHERE username = ?`;
        return await db.execute(sql, [username]);
    }

    /**
     * @param {string} username 
     */
    static async getUserByUsername(username) {
        let sql = /*sql*/`
            SELECT 
                u.id, u.username, u.email, u.firstName, u.lastName, u.image, u.favoriteNationalTeam, 
                u.favoriteClub, u.score, u.appRating, u.notificationStatus, 
                IFNULL(AVG(sq.rating), 0) AS averageQuizRating
            FROM users u
            LEFT JOIN quizzes q ON u.id = q.authorId
            LEFT JOIN solved_quizzes sq ON q.quizId = sq.quizId
            WHERE u.username = ?
            GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.image, 
                     u.favoriteNationalTeam, u.favoriteClub, u.score, u.appRating, u.notificationStatus
        `;
        return await db.execute(sql, [username]);
    }    
    

    /**
     * @param {string} id 
     */
    static async getUserById(id) {
        let sql = /*sql*/`
            SELECT 
                u.id, u.username, u.email, u.firstName, u.lastName, u.image, u.favoriteNationalTeam, 
                u.favoriteClub, u.score, u.appRating, u.notificationStatus, 
                IFNULL(AVG(sq.rating), 0) AS averageQuizRating
            FROM users u
            LEFT JOIN quizzes q ON u.id = q.authorId
            LEFT JOIN solved_quizzes sq ON q.quizId = sq.quizId
            WHERE u.id = ?
            GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.image, 
                     u.favoriteNationalTeam, u.favoriteClub, u.score, u.appRating, u.notificationStatus
        `;
        return await db.execute(sql, [id]);
    }    

    /**
     * @param {string} email 
     */
    static async getUserByEmail(email) {
        let sql = /*sql*/`
            SELECT 
                u.id, u.username, u.email, u.firstName, u.lastName, u.image, u.favoriteNationalTeam, 
                u.favoriteClub, u.score, u.appRating, u.notificationStatus, 
                IFNULL(AVG(sq.rating), 0) AS averageQuizRating
            FROM users u
            LEFT JOIN quizzes q ON u.id = q.authorId
            LEFT JOIN solved_quizzes sq ON q.quizId = sq.quizId
            WHERE u.email = ?
            GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.image, 
                     u.favoriteNationalTeam, u.favoriteClub, u.score, u.appRating, u.notificationStatus
        `;
        return await db.execute(sql, [email]);
    }    
    
    /**
     * @param {string} id 
     */
    static async deleteUser(id) {
        let sql = /*sql*/`DELETE FROM users WHERE id = ?`;
        return await db.execute(sql, [id]);
    }

    /**
     * @param {string} username 
     * @param {JSON} info
     */
    static async updateUserInfo(id, info) {
        const { name, username, email, password, oldPassword, image, favoriteNationalTeam, favoriteClub, appRating, notificationStatus } = info;
        
        let updateClauses = [];
    
        if (name) {
            const { firstName, lastName } = name;
            if (firstName) {
                updateClauses.push({ field: 'firstName', value: firstName });
            }
            if (lastName) {
                updateClauses.push({ field: 'lastName', value: lastName });
            }
        }

        if (username) {
            updateClauses.push({ field: 'username', value: username });
        }

        if (email) {
            updateClauses.push({ field: 'email', value: email });
        }
    
        if (password) {
            if (oldPassword) {
                if (!PasswordChecker.isStrongPassword(password))
                    throw new WeakPasswordError();
                updateClauses.push({ field: 'password', value: createHash('sha256').update(password).digest('hex') });

            } else {
                throw new MissingOldPasswordError();

            }
        }
            
        if (image !== undefined) {          
            const updatedImageStatus = image == null ? UserImageStatus.INVALID : UserImageStatus.VALID;
            updateClauses.push({ field: 'image', value: updatedImageStatus });
        }

        if (favoriteNationalTeam) {
            updateClauses.push({ field: 'favoriteNationalTeam', value: favoriteNationalTeam });
        }

        if (favoriteClub) {
            updateClauses.push({ field: 'favoriteClub', value: favoriteClub });
        }

        if (appRating != undefined) {
            if (appRating < AppRating.MINIMUM_RATING || appRating > AppRating.MAXIMUM_RATING)
                throw new InvalidAppRatingValueError();
            updateClauses.push({ field: 'appRating', value: appRating });
        }

        if (notificationStatus != undefined) {
            if (notificationStatus != NotificationStatus.OFF && notificationStatus != NotificationStatus.ON)
                throw new InvalidNotificationStatusValueError();
            updateClauses.push({ field: 'notificationStatus', value: notificationStatus });
        }
    
        if (updateClauses.length === 0) {
            //! No updates to perform
            return;
        }
    
        const setStatements = updateClauses.map(({ field }) => `${field} = ?`).join(', ');
        const values = updateClauses.map(({ value }) => value);
    
        const sql = `UPDATE users SET ${setStatements} WHERE id = ?`;
        return await db.execute(sql, [...values, id]);
    }

    /**
     * @param {JSON} fields
     */
    static async search(fields) {
        let query = /*sql*/`
            SELECT 
                u.id, u.username, u.email, u.firstName, u.lastName, u.image, u.favoriteNationalTeam, 
                u.favoriteClub, u.score, u.appRating, u.notificationStatus, 
                IFNULL(AVG(sq.rating), 0) AS averageQuizRating
            FROM users u
            LEFT JOIN quizzes q ON u.id = q.authorId
            LEFT JOIN solved_quizzes sq ON q.quizId = sq.quizId
            WHERE 1
        `;
    
        const { name, username, email, favoriteNationalTeam, favoriteClub } = fields;
        const values = [];
    
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
    
        if (username) {
            query += /*sql*/` AND u.username = ?`;
            values.push(username);
        }
    
        if (email) {
            query += /*sql*/` AND u.email = ?`;
            values.push(email);
        }
    
        if (favoriteNationalTeam) {
            query += /*sql*/` AND u.favoriteNationalTeam = ?`;
            values.push(favoriteNationalTeam);
        }
    
        if (favoriteClub) {
            query += /*sql*/` AND u.favoriteClub = ?`;
            values.push(favoriteClub);
        }
    
        query += /*sql*/`
            GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.image, 
                     u.favoriteNationalTeam, u.favoriteClub, u.score, u.appRating, u.notificationStatus
        `;
    
        return await db.execute(query, values);
    }

    /**
     * @param {string} username 
     */
    static async handleForgetPassword(username) {
        //! 1- generate a new password
        const newPassword = CodeGenerator.generatePassword();
        
        //! 2- get user email
        let sqlToGetEmail = /*sql*/`SELECT email FROM users WHERE username = ?`;
        const [user, _] = await db.execute(sqlToGetEmail, [username]);
        const email = user[0].email;

        //! 3- update the password in the database
        let sql = /*sql*/`UPDATE users SET password = ? WHERE username = ?`;
        await db.execute(sql, [createHash('sha256').update(newPassword).digest('hex'), username]);

        return { email, newPassword }; 
    }

    /**
     * Updates the user score by adding new points to the current score.
     * @param {string} id - The ID of the user.
     * @param {number} newPoints - The points to add to the user's score.
     */
    static async updateUserScore(id, newPoints) {
        const sqlGetScore = /*sql*/`SELECT score FROM users WHERE id = ?`;
        const [result] = await db.execute(sqlGetScore, [id]);

        if (result.length === 0) {
            throw new Error('User not found');
        }

        const currentScore = result[0].score;
        const updatedScore = currentScore + newPoints;

        const sqlUpdateScore = /*sql*/`UPDATE users SET score = ? WHERE id = ?`;
        return await db.execute(sqlUpdateScore, [updatedScore, id]);
    }
}

export default User;