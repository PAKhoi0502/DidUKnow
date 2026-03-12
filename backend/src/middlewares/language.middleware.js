import { resolveRequestLanguage } from "../config/i18n.js";

export const resolveLanguage = (req, res, next) => {
    req.language = resolveRequestLanguage({
        queryLang: req.query?.lang,
        acceptLanguage: req.headers["accept-language"]
    });

    return next();
};
