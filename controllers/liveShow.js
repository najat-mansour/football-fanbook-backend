import LiveShow from '../models/LiveShow.js';
import { getImageUrlInAwsS3 } from '../services/AwsS3.js';
import { UserImageStatus } from '../enums/users.js';

export const registerLiveShow = async (req, res, next) => {
    const { userId, matchId, matchStatus, selectedPlayers, x2Booster } = req.body;
    try {
        const liveShow = new LiveShow(userId, matchId, matchStatus, selectedPlayers, x2Booster);
        await liveShow.registerLiveShow();
        res.status(201).json({ message: 'Live show prediction registered successfully' });

    } catch (error) {
        console.log(error.message);
        res.status(400).json({ error: error.message });

    }
};


export const getAllUserLiveShows = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const [matches] = await LiveShow.getAllUserLiveShows(userId);
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


export const getLiveShows = async (req, res, next) => {
    const { matchId } = req.params;
    try {
        const [results] = await LiveShow.getLiveShows(matchId);
        for (const liveShow of results) {
            if (liveShow.image == UserImageStatus.VALID) {
                liveShow.image = await getImageUrlInAwsS3(liveShow.userId);
            }
        }
        res.status(200).json(results);


    } catch (error) {
        res.status(400).json({ error: error.message });

    }
};