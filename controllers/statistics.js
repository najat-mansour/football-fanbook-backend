import Statistics from "../models/Statistics.js";

export const getUserStatistics = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const totalScores = await Statistics.getTotalScores(userId);
        const lastFiveMatchPredictionScores = await Statistics.getLastFiveMatchPredictionScores(userId);
        const lastFiveLiveShowScores = await Statistics.getLastFiveLiveShowScores(userId);
        const matchPredictionScoresStats = await Statistics.getMatchPredictionScoreStats(userId);
        const liveShowScoresStats = await Statistics.getLiveShowScoreStats(userId);
        const quizzesScoreStats = await Statistics.getQuizScoreStats(userId);
        const userQuizzesAiStatusDistribution = await Statistics.getUserQuizzesAiStatusDistribution(userId);
        const userQuizzesScoreDistribution = await Statistics.getUserQuizzesScoreDistribution(userId);
        
        res.status(200).json({ 
            totalScores,
            lastFiveMatchPredictionScores,
            lastFiveLiveShowScores,
            matchPredictionScoresStats,
            liveShowScoresStats,
            quizzesScoreStats,
            userQuizzesAiStatusDistribution,
            userQuizzesScoreDistribution
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
        
    }
};