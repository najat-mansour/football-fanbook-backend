import MatchPrediction from '../models/MatchPrediction.js';
import { getImageUrlInAwsS3 } from '../services/AwsS3.js';
import { UserImageStatus } from '../enums/users.js';

export const registerMatchPrediction = async (req, res, next) => {
    try {
        const { userId, matchId, matchStatus, homeGoals, awayGoals, firstTeamToScore, x2Booster } = req.body;
        const matchPrediction = new MatchPrediction(userId, matchId, matchStatus, homeGoals, awayGoals, firstTeamToScore, x2Booster);
        await matchPrediction.registerMatchPrediction();
        res.status(201).json({ message: 'Match prediction registered successfully' });
        
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};

export const getAllUserMatches = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const [matches] = await MatchPrediction.getAllUserMatches(userId);
        if (matches.length !== 0) {
            for (const match of matches) {
                if (match.image == UserImageStatus.VALID) {
                    match.image = await getImageUrlInAwsS3(match.userId);
                }
            }            
            res.status(200).json(matches);

        } else {
            return res.status(404).json({ error: 'No matches are found!' });

        }

    } catch (error) {
        res.status(400).json({ error: error.message });

    }
};

export const getMatchPredictions = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const [matchPredictions] = await MatchPrediction.getMatchPredictions(matchId);
        for (const matchPrediction of matchPredictions) {
            if (matchPrediction.image == UserImageStatus.VALID) {
                matchPrediction.image = await getImageUrlInAwsS3(matchPrediction.userId);
            }
        }
        res.status(200).json(matchPredictions);

    } catch (error) {
        res.status(400).json({ error: error.message });

    }
};