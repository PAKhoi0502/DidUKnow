export const errorMiddleware = (error, req, res, next) => {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    const message = status >= 500
        ? "Internal server error"
        : (error?.message || "Request failed");

    const response = { message };

    if (error?.details !== undefined) {
        response.details = error.details;
    }

    if (process.env.NODE_ENV !== "production" && status >= 500 && error?.message) {
        response.error = error.message;
    }

    return res.status(status).json(response);
};
