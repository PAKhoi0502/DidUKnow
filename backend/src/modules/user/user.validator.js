import mongoose from "mongoose";
import Role from "../role/role.model.js";
import { SUPPORTED_LANGUAGES } from "../../config/i18n.js";
import { REFRESH_TOKEN_COOKIE_NAME } from "../../utils/refreshTokenCookie.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedLanguages = SUPPORTED_LANGUAGES;

export const validateCreateUser = async (req, res, next) => {
    const {
        username,
        email,
        password,
        avatar_url: avatarUrl,
        language
    } = req.body;

    const errors = [];

    if (!username || typeof username !== "string" || username.trim().length < 3) {
        errors.push("errors.username_min_length_3");
    }

    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        errors.push("errors.email_invalid");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        errors.push("errors.password_min_length_6");
    }

    if (avatarUrl !== undefined && avatarUrl !== null && typeof avatarUrl !== "string") {
        errors.push("errors.avatar_url_string");
    }

    if (language !== undefined && !allowedLanguages.includes(language)) {
        errors.push("errors.language_invalid_vi_en");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        avatar_url: avatarUrl ?? null,
        language: language ?? "en"
    };

    return next();
};

export const validateLoginUser = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        errors.push("errors.email_invalid");
    }

    if (!password || typeof password !== "string") {
        errors.push("errors.password_required");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        email: email.trim().toLowerCase(),
        password
    };

    return next();
};

export const validateRefreshToken = (req, res, next) => {
    const bodyRefreshToken = req.body?.refresh_token;
    const cookieRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    const refreshToken = bodyRefreshToken || cookieRefreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.refresh_token_required"]
        });
    }

    req.validatedBody = {
        refresh_token: refreshToken.trim()
    };

    return next();
};

export const validateLogout = (req, res, next) => {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.refresh_token;

    if (!refreshToken || typeof refreshToken !== "string") {
        req.validatedBody = { refresh_token: null };
        return next();
    }

    req.validatedBody = {
        refresh_token: refreshToken.trim()
    };

    return next();
};

export const validateUpdateLanguage = (req, res, next) => {
    const { language } = req.body;

    if (!language || typeof language !== "string" || !allowedLanguages.includes(language)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.language_invalid_vi_en"]
        });
    }

    req.validatedBody = { language };
    return next();
};

export const validateUserIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.id_invalid"]
        });
    }

    return next();
};

const parsePositiveInt = (rawValue, fallback) => {
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return fallback;
    }
    return parsed;
};

export const validateGetUsersQuery = (req, res, next) => {
    const {
        search,
        status,
        role_id: roleId,
        page,
        limit
    } = req.query || {};
    const errors = [];

    if (status !== undefined && !["active", "inactive", "banned"].includes(String(status))) {
        errors.push("errors.user_status_invalid_active_inactive_banned");
    }

    if (roleId !== undefined && !mongoose.Types.ObjectId.isValid(String(roleId))) {
        errors.push("errors.role_id_invalid");
    }

    const parsedPage = parsePositiveInt(page, 1);
    const parsedLimit = parsePositiveInt(limit, 10);

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.query = {
        ...(search !== undefined ? { search: String(search).trim() } : {}),
        ...(status !== undefined ? { status: String(status) } : {}),
        ...(roleId !== undefined ? { role_id: String(roleId) } : {}),
        page: parsedPage,
        limit: parsedLimit
    };

    return next();
};

export const validateUpdateUser = async (req, res, next) => {
    const payload = req.body || {};
    const allowedFields = ["username", "email", "password", "avatar_url", "language", "status"];
    const inputKeys = Object.keys(payload);

    if (inputKeys.length === 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.update_payload_required"]
        });
    }

    const invalidFields = inputKeys.filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const {
        username,
        email,
        password,
        avatar_url: avatarUrl,
        language,
        status
    } = payload;

    const errors = [];

    if (username !== undefined && (typeof username !== "string" || username.trim().length < 3)) {
        errors.push("errors.username_min_length_3");
    }

    if (email !== undefined && (typeof email !== "string" || !emailRegex.test(email.trim()))) {
        errors.push("errors.email_invalid");
    }

    if (password !== undefined && (typeof password !== "string" || password.length < 6)) {
        errors.push("errors.password_min_length_6");
    }

    if (avatarUrl !== undefined && avatarUrl !== null && typeof avatarUrl !== "string") {
        errors.push("errors.avatar_url_string");
    }

    if (language !== undefined && !allowedLanguages.includes(language)) {
        errors.push("errors.language_invalid_vi_en");
    }

    if (status !== undefined && !["active", "inactive", "banned"].includes(status)) {
        errors.push("errors.user_status_invalid_active_inactive_banned");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        ...(username !== undefined ? { username: username.trim() } : {}),
        ...(email !== undefined ? { email: email.trim().toLowerCase() } : {}),
        ...(password !== undefined ? { password } : {}),
        ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
        ...(language !== undefined ? { language } : {}),
        ...(status !== undefined ? { status } : {})
    };

    return next();
};

export const validateUpdateMyProfile = async (req, res, next) => {
    const payload = req.body || {};
    const allowedFields = ["username", "email", "password", "avatar_url", "language"];
    const inputKeys = Object.keys(payload);

    if (inputKeys.length === 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.update_payload_required"]
        });
    }

    const invalidFields = inputKeys.filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const {
        username,
        email,
        password,
        avatar_url: avatarUrl,
        language
    } = payload;

    const errors = [];

    if (username !== undefined && (typeof username !== "string" || username.trim().length < 3)) {
        errors.push("errors.username_min_length_3");
    }

    if (email !== undefined && (typeof email !== "string" || !emailRegex.test(email.trim()))) {
        errors.push("errors.email_invalid");
    }

    if (password !== undefined && (typeof password !== "string" || password.length < 6)) {
        errors.push("errors.password_min_length_6");
    }

    if (avatarUrl !== undefined && avatarUrl !== null && typeof avatarUrl !== "string") {
        errors.push("errors.avatar_url_string");
    }

    if (language !== undefined && !allowedLanguages.includes(language)) {
        errors.push("errors.language_invalid_vi_en");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        ...(username !== undefined ? { username: username.trim() } : {}),
        ...(email !== undefined ? { email: email.trim().toLowerCase() } : {}),
        ...(password !== undefined ? { password } : {}),
        ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
        ...(language !== undefined ? { language } : {})
    };

    return next();
};

export const validateUpdateUserRole = async (req, res, next) => {
    const { role_id: roleId, reason } = req.body || {};
    const inputKeys = Object.keys(req.body || {});
    const invalidFields = inputKeys.filter((key) => !["role_id", "reason"].includes(key));

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    if (!roleId || typeof roleId !== "string" || !mongoose.Types.ObjectId.isValid(roleId)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.role_id_invalid"]
        });
    }

    if (reason !== undefined && (typeof reason !== "string" || reason.trim().length < 3)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.reason_min_length_3"]
        });
    }

    try {
        const roleExists = await Role.exists({ _id: roleId });
        if (!roleExists) {
            return res.status(400).json({
                message: "errors.validation_failed",
                errors: ["errors.role_id_not_found"]
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "errors.internal_server_error"
        });
    }

    req.validatedBody = {
        role_id: roleId,
        ...(reason !== undefined ? { reason: reason.trim() } : {})
    };
    return next();
};
