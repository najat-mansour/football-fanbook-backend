import express from 'express';
import {
    sendPublicData
} from '../controllers/public.js';

//! create a router
const router = express.Router();

router.get('/', sendPublicData);

export default router;