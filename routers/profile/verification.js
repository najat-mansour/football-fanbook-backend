import express from 'express';
import { verifyEmail } from '../../controllers/verification.js';

//! create a router
const router = express.Router();

router.get('/:email/:lang', verifyEmail);

export default router;