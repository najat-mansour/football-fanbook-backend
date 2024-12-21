import * as deepl from 'deepl-node';
import { ApisKeys } from '../config/api-keys.js';
import TranslateModule from '@google-cloud/translate';

//! DeepL Translation
const authKey = ApisKeys.TRANSLATION;
const translator = new deepl.Translator(authKey);
const translateTextByDeepL = async (text, sourceLanguage, destinationLanguage) => {
    const result = await translator.translateText(text, sourceLanguage, destinationLanguage);
    return result.text;
};

//! Google Cloud Translation
const { Translate } = TranslateModule.v2;
const googleCloudTranslator = new Translate({
    keyFilename: 'resources\\google_service_account.json',
});
const translateTextByGoogleCloud = async (text, targetLanguage) => {
    const [translation] = await googleCloudTranslator.translate(text, targetLanguage);
    return translation;
};

const translateText = async (text, sourceLanguage, destinationLanguage) => {
    const translatedText = await translateTextByGoogleCloud(text, destinationLanguage);
    return translatedText;
};

export const translateQuizData = async (quizData, sourceLanguage, destinationLanguage) => {
    const translatedQuizData = [];

    for (const item of quizData) {
        const translatedItem = {
            ...item,
            question: await translateText(item.question, sourceLanguage, destinationLanguage),
            options: await Promise.all(item.options.map(option => translateText(option, sourceLanguage, destinationLanguage)))
        };
        translatedQuizData.push(translatedItem);
    }

    return translatedQuizData;
};

export const translateMatchesData = async (matchesData, sourceLanguage, destinationLanguage) => {
    const translatedMatches = [];

    for (const match of matchesData) {
        const translatedMatch = {
            ...match,
            league: {
                ...match.league,
                name: await translateText(match.league.name, sourceLanguage, destinationLanguage),
                round: await translateText(match.league.round, sourceLanguage, destinationLanguage),
            },
            teams: {
                home: {
                    ...match.teams.home,
                    name: await translateText(match.teams.home.name, sourceLanguage, destinationLanguage),
                },
                away: {
                    ...match.teams.away,
                    name: await translateText(match.teams.away.name, sourceLanguage, destinationLanguage),
                }
            },
            fixture: {
                ...match.fixture,
                referee: match.fixture.referee ? await translateText(match.fixture.referee, sourceLanguage, destinationLanguage) : null,
                venue: {
                    ...match.fixture.venue,
                    name: await translateText(match.fixture.venue.name, sourceLanguage, destinationLanguage),
                }
            }
        };
        translatedMatches.push(translatedMatch);
    }

    return translatedMatches;
};

export const translatePlayersNamesData = async (playersData, sourceLanguage, destinationLanguage) => {
    const translatedPlayers = [];

    for (const player of playersData) {
        const translatedPlayer = {
            ...player,
            name: await translateText(player.name, sourceLanguage, destinationLanguage)
        };
        translatedPlayers.push(translatedPlayer);
    }

    return translatedPlayers;
};

export const translateMatchEventsData = async (matchEvents, sourceLanguage, destinationLanguage) => {
    const translatedMatchEvents = {};

    for (const team in matchEvents) {
        const translatedEvents = [];

        for (const event of matchEvents[team]) {
            const translatedEvent = {
                ...event,
                player: {
                    ...event.player,
                    name: await translateText(event.player.name, sourceLanguage, destinationLanguage),
                },
                assist: event.assist ? {
                    ...event.assist,
                    name: await translateText(event.assist.name, sourceLanguage, destinationLanguage)
                } : null,
            };
            translatedEvents.push(translatedEvent);
        }

        translatedMatchEvents[team] = translatedEvents;
    }

    return translatedMatchEvents;
};

export const translatePlayerStatsData = async (playerStats, sourceLanguage, destinationLanguage) => {
    const translatedPlayerStats = {
        ...playerStats,
        team: {
            ...playerStats.team,
            name: await translateText(playerStats.team.name, sourceLanguage, destinationLanguage),
        },
        league: {
            ...playerStats.league,
            name: await translateText(playerStats.league.name, sourceLanguage, destinationLanguage),
            country: await translateText(playerStats.league.country, sourceLanguage, destinationLanguage),
        }
    };

    return translatedPlayerStats;
};

export const translateTeamLineUpData = async (teamLineUp, sourceLanguage, destinationLanguage) => {
    const translatedTeam = [];

    for (const line of teamLineUp.team) {
        const translatedLine = await Promise.all(line.map(async (player) => {
            return {
                ...player,
                name: await translateText(player.name, sourceLanguage, destinationLanguage)
            };
        }));
        translatedTeam.push(translatedLine);
    }

    const translatedTeamLineUp = {
        ...teamLineUp,
        team: translatedTeam
    };

    return translatedTeamLineUp;
};

export const translatePlayersData = async (players, sourceLanguage, destinationLanguage) => {
    const translatedPlayers = [];

    for (const playerData of players) {
        const translatedStatistics = await Promise.all(playerData.statistics.map(async (stat) => ({
            ...stat,
            team: {
                ...stat.team,
                name: await translateText(stat.team.name, sourceLanguage, destinationLanguage),
            }
        })));

        const translatedPlayer = {
            ...playerData,
            player: {
                ...playerData.player,
                name: await translateText(playerData.player.name, sourceLanguage, destinationLanguage),
            },
            statistics: translatedStatistics
        };

        translatedPlayers.push(translatedPlayer);
    }

    return translatedPlayers;
};

export const translateLeagueStandingData = async (leagueStanding, sourceLanguage, destinationLanguage) => {
    const translatedStanding = await Promise.all(
        leagueStanding.map(async (teamStanding) => {
            const translatedTeamName = await translateText(
                teamStanding.team.name,
                sourceLanguage,
                destinationLanguage
            );

            return {
                ...teamStanding,
                team: {
                    ...teamStanding.team,
                    name: translatedTeamName,
                },
            };
        })
    );

    return translatedStanding;
};

export const translateCoachData = async (coach, sourceLanguage, destinationLanguage) => { 
    const translatedCoach = {
        ...coach,
        name: await translateText(coach.name, sourceLanguage, destinationLanguage),
    };

    return translatedCoach;
};

export const translateVenueData = async (venue, sourceLanguage, destinationLanguage) => { 
    const translatedVenue = {
        ...venue,
        name: await translateText(venue.name, sourceLanguage, destinationLanguage),
        country: await translateText(venue.country, sourceLanguage, destinationLanguage),
        city: await translateText(venue.city, sourceLanguage, destinationLanguage),
    };

    return translatedVenue;
};