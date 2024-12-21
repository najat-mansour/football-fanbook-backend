export class WeakPasswordError extends Error { 
    constructor(message = "Weak password") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class InvalidAppRatingValueError extends Error { 
    constructor(message = "Invalid App Rating Value") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class InvalidNotificationStatusValueError extends Error { 
    constructor(message = "Invalid Notification Status Value") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class MissingOldPasswordError extends Error { 
    constructor(message = "Old Password is Missing") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}