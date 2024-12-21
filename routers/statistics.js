import express from 'express';
import { getUserStatistics } from '../controllers/statistics.js';
import authenticateUser from './../middleware/authenticate.js';

//! create a router
const router = express.Router();

router.get('/:userId', authenticateUser, getUserStatistics);

export default router;