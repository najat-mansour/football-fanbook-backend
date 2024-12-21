import express from 'express';
import { login, logout } from '../../controllers/authentication.js';
import authenticateUser from '../../middleware/authenticate.js';

//! create a router
const router = express.Router();

router.post('/login', login);
router.get('/logout', authenticateUser, logout);

export default router;