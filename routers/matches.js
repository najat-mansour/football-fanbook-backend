import express from 'express';
import matchesPredictionRouter from './matches/matchesPrediction.js'
import liveShowRouter from './matches/liveShow.js';

//! create a router
const router = express.Router();

router.use('/matchesPrediction', matchesPredictionRouter);
router.use('/liveShow', liveShowRouter);

export default router;