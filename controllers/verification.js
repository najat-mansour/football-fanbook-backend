import EmailVerifier from '../helpers/EmailVerifier.js';

export const verifyEmail = async (req, res, next) => { 
    try {
        const { email, lang }  = req.params;
        const verificationCode = await EmailVerifier.verifyEmail(email, lang);

        if (verificationCode) {
            res.status(200).json({verificationCode: verificationCode});

        } else {
            res.status(400).json({message: 'Bad Request'});

        }

    } catch(error) {
        res.status(500).json({message: 'Error during the verification'});

    }
}