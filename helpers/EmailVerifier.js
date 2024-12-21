import CodeGenerator from './CodeGenerator.js';
import EmailSender from '../services/EmailSender.js';
import fs from 'fs';

//! Function to read the HTML content from the file
const readHtmlTemplate = filename => {
    try {
        return fs.readFileSync(filename, 'utf-8');

    } catch (error) {
        console.error('Error reading HTML template:', error);
        return null;
        
    }
};

class EmailVerifier {
    /**
     * @param {string} email 
     * @param {string} lang 
     */
    static async verifyEmail(email, lang) {
        const verificationCode = CodeGenerator.generateVerificationCode();
        //! Read the HTML content from the file
        let htmlTemplate;
        if (lang == 'ar') {
            htmlTemplate = readHtmlTemplate('resources\\html\\arabic\\email-verification.html');

        } else {
            htmlTemplate = readHtmlTemplate('resources\\html\\english\\email-verification.html');

        }
        

        if (htmlTemplate) {

            const emailOptions = {
                to: email,
                subject: 'Verification Code',
                html: htmlTemplate.replace('{{verificationCode}}', verificationCode)
            };
            EmailSender.sendEmail(emailOptions);

            return verificationCode;
        }
    }
}

export default EmailVerifier;