import User from "../modules/user/user.model.js";
import { verifyAccessToken } from "../utils/generateToken.js";
import { createHttpError } from "../utils/httpError.js";
import { resolveRequestLanguage } from "../config/i18n.js";

const buildAuthenticatedUser = async (token) => {
    const payload = verifyAccessToken(token);

    if (!payload?.user_id) {
        throw createHttpError(401, "errors.invalid_or_expired_token");
    }

    const user = await User.findById(payload.user_id)
        .select("_id role_id language status")
        .lean();

    if (!user) {
        throw createHttpError(401, "errors.user_not_found");
    }

    if (user.status !== "active") {
        throw createHttpError(403, "errors.user_not_active");
    }

    return {
        id: user._id.toString(),
        role_id: user.role_id?.toString() ?? null,
        language: user.language
    };
};

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(createHttpError(401, "errors.unauthorized"));
    }

    const token = authHeader.slice(7).trim();

    try {
        req.user = await buildAuthenticatedUser(token);
        req.language = resolveRequestLanguage({
            queryLang: req.query?.lang,
            acceptLanguage: req.headers["accept-language"],
            userLanguage: req.user.language
        });
        return next();
    } catch (error) {
        return next(error);
    }
};

export const authenticateOptional = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next();
    }

    if (!authHeader.startsWith("Bearer ")) {
        return next(createHttpError(401, "errors.unauthorized"));
    }

    const token = authHeader.slice(7).trim();

    try {
        req.user = await buildAuthenticatedUser(token);
        req.language = resolveRequestLanguage({
            queryLang: req.query?.lang,
            acceptLanguage: req.headers["accept-language"],
            userLanguage: req.user.language
        });
        return next();
    } catch (error) {
        return next(error);
    }
};
