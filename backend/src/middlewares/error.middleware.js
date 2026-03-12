import { toMessageKey } from "../config/i18n.js";

export const errorMiddleware = (error, req, res, next) => {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    const message = toMessageKey(error?.message, status);

    const response = { message };

    if (error?.details !== undefined) {
        response.details = error.details;
    }

    if (process.env.NODE_ENV !== "production" && status >= 500 && error?.message) {
        response.error = error.message;
    }

    return res.status(status).json(response);
};
