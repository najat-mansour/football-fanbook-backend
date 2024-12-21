class CodeGenerator {
    static generatePassword() {
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const digitChars = '0123456789';
        const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

        const allChars = uppercaseChars + lowercaseChars + digitChars + specialChars;

        function getRandomChar(charSet) {
            const randomIndex = Math.floor(Math.random() * charSet.length);
            return charSet.charAt(randomIndex);
        }

        let password = '';

        // Ensure at least one character from each character set
        password += getRandomChar(uppercaseChars);
        password += getRandomChar(lowercaseChars);
        password += getRandomChar(digitChars);
        password += getRandomChar(specialChars);

        // Generate remaining characters
        for (let i = password.length; i < 10; i++) {
            password += getRandomChar(allChars);
        }

        // Shuffle the characters to make the password more secure
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        return password;
    }

    static generateVerificationCode() {
        // Generate a random 4-digit number
        const verificationCode = Math.floor(1000 + Math.random() * 9000);

        return verificationCode;
    }
}

export default CodeGenerator;