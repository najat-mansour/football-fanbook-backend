export const sendPublicData = async (req, res, next) => {
    res.status(200).json({
        title: 'This is Football Fanbook backend API',
        developers: ["Najat S. Mansour", "Mohammad Alawneh"]
    });
};