import User from '../models/User.js';
import fs from 'fs';
import EmailSender from '../services/EmailSender.js';
import { uploadImageToAwsS3, deleteImageFromAwsS3, getImageUrlInAwsS3 } from '../services/AwsS3.js';
import { UserImageStatus } from '../enums/users.js';

export const registerUser = async (req, res, next) => {
    try {
        const user = new User(
            req.params.username,
            req.body.email,
            req.body.name,
            req.body.image,
            req.body.password,
            req.body.favoriteNationalTeam,
            req.body.favoriteClub
        );

        //! Upload the image to AWS S3
        if (user.image == UserImageStatus.VALID) {
            const storedImage = Buffer.from(req.body.image, 'base64');
            await uploadImageToAwsS3(user.id, storedImage);
        }

        await user.registerUser();

        res.status(201).json({ message: 'User is registered successfully!' });
        
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });

    }
};

export const getAllUsers = async (req, res, next) => {
    const [users] = await User.getAllUsers();
    if (users.length !== 0) {
        for (const user of users) {
            if (user.image == UserImageStatus.VALID) {
                user.image = await getImageUrlInAwsS3(user.id);
            }
        }
        res.status(200).json(users);

    } else {
        res.status(404).json({ message: 'There are no users!' });

    }
};

export const getUserByUsername = async (req, res, next) => {
    const username = req.params.username;
    const [user] = await User.getUserByUsername(username);
    if (user.length !== 0) {
        if (user[0].image == UserImageStatus.VALID) {
            user[0].image = await getImageUrlInAwsS3(user[0].id);
        }
        res.status(200).json(user[0]);

    } else {
        res.status(404).json({ message: 'User not found!' });

    }
};

export const getUserById = async (req, res, next) => {
    const id = req.params.id;
    const [user] = await User.getUserById(id);
    if (user.length !== 0) {
        if (user[0].image == UserImageStatus.VALID) {
            user[0].image = await getImageUrlInAwsS3(user[0].id);
        }
        res.status(200).json(user[0]);

    } else {
        res.status(404).json({ message: 'User not found!' });

    }
};

export const getUserByEmail = async (req, res, next) => {
    const email = req.params.email;
    const [user] = await User.getUserByEmail(email);
    if (user.length !== 0) {
        if (user[0].image == UserImageStatus.VALID) {
            user[0].image = await getImageUrlInAwsS3(user[0].id);
        }
        res.status(200).json(user[0]);

    } else {
        res.status(404).json({ message: 'User not found!' });

    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        await User.deleteUser(id);
        //! Delete the user image from AWS S3
        try {
            await deleteImageFromAwsS3(id);

        } catch (error) {
            //! Do nothing if the user doesn't have an image

        }
        res.status(204).json({ message: 'User deleted successfully!' });

    } catch (error) {
        res.status(400).json({ error: error.message });

    }
};

export const updateUserInfo = async (req, res, next) => {
    try {
        const id = req.params.id;
        const info = req.body;
        await User.updateUserInfo(id, info);

        //! Update the image in AWS S3
        const { image } = req.body;
        if (image !== undefined) {
            if (image != null) {
                const storedImage = Buffer.from(image, 'base64');
                await uploadImageToAwsS3(id, storedImage);

            } else {
                await deleteImageFromAwsS3(id);

            }
        }
        res.status(200).json({ message: 'User info are updated successfully!' });

    } catch (error) {
        console.log(error.message);
        res.status(400).json({ error: error.message });

    }
};

export const search = async (req, res, next) => {
    try {
        const fields = req.body;
        const [users] = await User.search(fields);
        if (users.length !== 0) {
            for (const user of users) {
                user.image = await getImageUrlInAwsS3(user.id);
            }
            res.status(200).json(users);

        } else {
            res.status(404).json({ message: 'User not found!' });

        }

    } catch (error) {
        res.status(400).json({ error: error.message });

    }
}

export const handleForgetPassword = async (req, res, next) => {
    try {
        const { username, lang } = req.body;
        const { email, newPassword } = await User.handleForgetPassword(username, lang);

        //! Function to read the HTML content from the file
        const readHtmlTemplate = filename => {
            try {
                return fs.readFileSync(filename, 'utf-8');

            } catch (error) {
                console.error('Error reading HTML template:', error);
                return null;

            }
        };

        //! Read the HTML content from the file
        let htmlTemplate;
        if (lang == 'ar') {
            htmlTemplate = readHtmlTemplate('resources\\html\\arabic\\new-password.html');

        } else {
            htmlTemplate = readHtmlTemplate('resources\\html\\english\\new-password.html');

        }

        if (htmlTemplate) {
            const emailOptions = {
                to: email,
                subject: 'New Password',
                html: htmlTemplate.replace('{{newPassword}}', newPassword)
            };
            EmailSender.sendEmail(emailOptions);

        }

        if (email) { //! email not null
            res.status(200).json({ message: 'Your new password is on the email!' });

        }

    } catch (error) {
        res.status(404).json({ error: 'User not found!' });

    }
}