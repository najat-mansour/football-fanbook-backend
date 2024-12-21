class PasswordChecker {
    /**
     * @param {string} str 
     */
    static containsLowerCase(str) {
        return /[a-z]/.test(str);
    }

    /**
     * @param {string} str 
     */
    static containsUpperCase(str) {
        return /[A-Z]/.test(str);
    }

    /**
     * @param {string} str 
     */
    static containsNumber(str) {
        return /\d/.test(str);
    }

    /**
     * @param {string} str 
     */
    static containsSpecialCharacter(str) {
        return /[^\w\d]/.test(str);
    }

    /**
     * @param {string} str 
     */
    static isAcceptableLength(str) { 
        const MAX_PASSWORD_LENGTH = 10;
        return str.length >= MAX_PASSWORD_LENGTH;
    }

    /**
     * @param {string} str 
     */
    static isStrongPassword(str) {
        return PasswordChecker.containsLowerCase(str)
            && PasswordChecker.containsUpperCase(str)
            && PasswordChecker.containsNumber(str)
            && PasswordChecker.containsSpecialCharacter(str)
            && PasswordChecker.isAcceptableLength(str);
    }
}

export default PasswordChecker;