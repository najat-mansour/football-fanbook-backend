import express from 'express';
import { 
    translateQuiz, 
    translateTodaysMatches, 
    translatePlayersNames,
    translateMatchEvents, 
    translatePlayerStats,
    translateTeamLineUp,
    translatePlayers,
    translateLeagueStanding,
    translateCoach,
    translateVenue
} from '../controllers/translator.js';

//! create a router
const router = express.Router();

router.post('/translateTeamsNames', translateTodaysMatches);
router.post('/translateQuizData', translateQuiz);
router.post('/translatePlayersNames', translatePlayersNames);
router.post('/translateMatchEvents', translateMatchEvents);
router.post('/translatePlayerStats', translatePlayerStats);
router.post('/translateTeamLineUp', translateTeamLineUp);
router.post('/translatePlayers', translatePlayers);
router.post('/translateLeagueStanding', translateLeagueStanding);
router.post('/translateCoach', translateCoach);
router.post('/translateVenue', translateVenue);

export default router;