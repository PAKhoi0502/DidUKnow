import { t, toErrorKey } from "../config/i18n.js";

export const attachMessageText = (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (payload) => {
        if (
            payload
            && typeof payload === "object"
            && !Array.isArray(payload)
            && typeof payload.message === "string"
        ) {
            const response = {
                ...payload,
                message_text: t(payload.message, req.language)
            };

            if (Array.isArray(payload.errors)) {
                const normalizedErrorKeys = payload.errors.map((item) => toErrorKey(item));
                response.errors = normalizedErrorKeys;
                response.errors_text = normalizedErrorKeys.map((item) => t(item, req.language));
            }

            return originalJson(response);
        }

        return originalJson(payload);
    };

    return next();
};
