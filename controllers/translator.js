import {
    translateQuizData,
    translateMatchesData,
    translatePlayersNamesData,
    translateMatchEventsData,
    translatePlayerStatsData,
    translateTeamLineUpData,
    translatePlayersData,
    translateLeagueStandingData,
    translateCoachData, 
    translateVenueData
} from '../helpers/Translator.js';

export const translateQuiz = async (req, res, next) => {
    try {
        const { quizData, sourceLanguage, destinationLanguage } = req.body;

        const result = await translateQuizData(quizData, sourceLanguage, destinationLanguage);

        res.status(200).json({ result });

    } catch (error) {
        res.status(400).json({ error: error.message });

    }
};

export const translateTodaysMatches = async (req, res, next) => {
    try {
        const { matchesData, sourceLanguage, destinationLanguage } = req.body;

        const result = await translateMatchesData(matchesData, sourceLanguage, destinationLanguage);

        res.status(200).json({ result });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};

export const translatePlayersNames = async (req, res, next) => {
    try {
        const { playersNames, sourceLanguage, destinationLanguage } = req.body;

        const result = await translatePlayersNamesData(playersNames, sourceLanguage, destinationLanguage);

        res.status(200).json({ result });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};

export const translateMatchEvents = async (req, res, next) => {
    try {
        const { matchEvents, sourceLanguage, destinationLanguage } = req.body;

        const result = await translateMatchEventsData(matchEvents, sourceLanguage, destinationLanguage);

        res.status(200).json({ result });

    } catch (error) {
        console.error(error)
        res.status(400).json({ error: error.message });

    }
};

export const translatePlayerStats = async (req, res, next) => {
    try {
        const { playerStats, sourceLanguage, destinationLanguage } = req.body;

        const result = await translatePlayerStatsData(playerStats, sourceLanguage, destinationLanguage);

        res.status(200).json({ result });

    } catch (error) {
        console.error(error)
        res.status(400).json({ error: error.message });

    }
};

export const translateTeamLineUp = async (req, res, next) => {
    try {
        const { teamLineUp, sourceLanguage, destinationLanguage } = req.body;

        const result = await translateTeamLineUpData(teamLineUp, sourceLanguage, destinationLanguage);

        res.status(200).json({ result });

    } catch (error) {
        console.error(error)
        res.status(400).json({ error: error.message });

    }
};

export const translatePlayers = async (req, res, next) => {
    try {
        const { players, sourceLanguage, destinationLanguage } = req.body;

        const result = await translatePlayersData(players, sourceLanguage, destinationLanguage);

        res.status(200).json({ result });

    } catch (error) {
        console.error(error)
        res.status(400).json({ error: error.message });

    }
};

export const translateLeagueStanding = async (req, res, next) => {
    try {
        const { leagueStanding, sourceLanguage, destinationLanguage } = req.body;

        const result = await translateLeagueStandingData(leagueStanding, sourceLanguage, destinationLanguage);

        res.status(200).json({ result });

    } catch (error) {
        console.error(error)
        res.status(400).json({ error: error.message });

    }
};

export const translateCoach = async (req, res, next) => {
    try {
        const { coach, sourceLanguage, destinationLanguage } = req.body;

        const result = await translateCoachData(coach, sourceLanguage, destinationLanguage);

        res.status(200).json({ result });

    } catch (error) {
        console.error(error)
        res.status(400).json({ error: error.message });

    }
};

export const translateVenue = async (req, res, next) => {
    try {
        const { venue, sourceLanguage, destinationLanguage } = req.body;

        const result = await translateVenueData(venue, sourceLanguage, destinationLanguage);

        res.status(200).json({ result });

    } catch (error) {
        console.error(error)
        res.status(400).json({ error: error.message });

    }
};