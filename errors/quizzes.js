export class InvalidQuizStatusValueError extends Error { 
    constructor(message = "Invalid Quiz Status Value") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class InvalidContainsAiValueError extends Error { 
    constructor(message = "Invalid Contains AI Value") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class InvalidQuizRatingError extends Error { 
    constructor(message = "Invalid App Rating Value") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UserCannotSolveItsOwnQuizError extends Error { 
    constructor(message = "User cannot solve its own quiz") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}