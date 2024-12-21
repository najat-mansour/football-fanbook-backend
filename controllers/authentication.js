import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { AuthKeys } from '../config/authentication.js';
import { createHash } from 'crypto';

export const login = async (req, res, next) => { 
    try {
        const { username, password } = req.body;

        //! check the username
        const [user] = await User.getUserPassword(username);
        if (!user || user.length === 0) {
            return res.status(401).json({ error: 'Invalid username!' });

        }

        //! check the password
        const hashedPassword = createHash('sha256').update(password).digest('hex');
        if (hashedPassword !== user[0].password) {
            return res.status(401).json({ error: 'Invalid password!' });

        }

        //! generate the token
        const token = jwt.sign({ username: user.username }, AuthKeys.jwtSecretKey , { expiresIn: AuthKeys.jwtExpiresIn });

        //! Send the token in the response
        res.status(200).json({ token });

    } catch(error) {
        res.status(400).json( { error: 'Invalid Request!' } );

    }
};

//! Revoked tokens set
export const revokedTokens = new Set();

export const logout = async (req, res, next) => { 
    revokedTokens.add(req.headers.authorization);
    res.status(200).json({ message: 'Logout successfully' });
};