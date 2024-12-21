import express from 'express';
import usersRouter from './profile/users.js';
import verificationRouter from './profile/verification.js';
import authenticationRouter from './profile/authentication.js';

//! create a router
const router = express.Router();

router.use('/users', usersRouter);
router.use('/verification', verificationRouter);
router.use('/authentication', authenticationRouter);

export default router;