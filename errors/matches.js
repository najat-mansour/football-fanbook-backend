export class InvalidX2BoosterValueError extends Error { 
    constructor(message = "Invalid X2 Booster Value") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}