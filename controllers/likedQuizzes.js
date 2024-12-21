import LikedQuiz from '../models/LikedQuiz.js';

export const registerLike = async (req, res) => {
    const { userId, quizId } = req.params;

    try {
        const likedQuiz = new LikedQuiz(userId, quizId);
        await likedQuiz.register();
        res.status(201).json({ message: 'Like registered successfully' });

    } catch (error) {
        console.error(error.message);
        
        res.status(400).json({ error: error.message });

    }
};

export const deleteLike = async (req, res) => {
    const { userId, quizId } = req.params;
    
    try {
        await LikedQuiz.delete(userId, quizId);
        res.status(204).json({ message: 'Like deleted successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: error.message });

    }
};


export const isLikedByUser = async (req, res) => {
    const { userId, quizId } = req.params;
    
    try {
        const isLiked = await LikedQuiz.isLiked(userId, quizId);
        res.status(200).json({ isLiked });

    } catch (error) {
        res.status(500).json({ error: error.message });

    }
};
