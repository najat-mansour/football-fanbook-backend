import nodemailer from 'nodemailer';
import dotenv from 'dotenv/config';

class EmailSender {
    static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_TOKEN
        }
    });

    /**
     * @param {JSON} emailOptions 
     */
    static sendEmail(emailOptions) {
        //! Add 'from' field to email options
        emailOptions.from = process.env.EMAIL_ADDRESS;

        EmailSender.transporter.sendMail(emailOptions, (error, info) => {
            if (error) {
                throw error;
            }
        });
    }
}

export default EmailSender;