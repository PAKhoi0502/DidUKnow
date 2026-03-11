export class AppError extends Error {
    constructor(status, message, details) {
        super(message);
        this.name = "AppError";
        this.status = status;
        if (details !== undefined) {
            this.details = details;
        }
    }
}

export const createHttpError = (status, message, details) => {
    return new AppError(status, message, details);
};
