import mongoose from "mongoose";
import Role from "../role/role.model.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedLanguages = ["vi", "en"];

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
        errors.push("username must be at least 3 characters");
    }

    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        errors.push("email is invalid");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        errors.push("password must be at least 6 characters");
    }

    if (avatarUrl !== undefined && avatarUrl !== null && typeof avatarUrl !== "string") {
        errors.push("avatar_url must be a string");
    }

    if (language !== undefined && !allowedLanguages.includes(language)) {
        errors.push("language must be one of: vi, en");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
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
        errors.push("email is invalid");
    }

    if (!password || typeof password !== "string") {
        errors.push("password is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors
        });
    }

    req.validatedBody = {
        email: email.trim().toLowerCase(),
        password
    };

    return next();
};

export const validateUpdateLanguage = (req, res, next) => {
    const { language } = req.body;

    if (!language || typeof language !== "string" || !allowedLanguages.includes(language)) {
        return res.status(400).json({
            message: "Validation failed",
            errors: ["language must be one of: vi, en"]
        });
    }

    req.validatedBody = { language };
    return next();
};

export const validateUserIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "Validation failed",
            errors: ["id must be a valid ObjectId"]
        });
    }

    return next();
};

export const validateUpdateUser = async (req, res, next) => {
    const payload = req.body || {};
    const allowedFields = ["username", "email", "password", "avatar_url", "language", "status"];
    const inputKeys = Object.keys(payload);

    if (inputKeys.length === 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: ["At least one field is required for update"]
        });
    }

    const invalidFields = inputKeys.filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
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
        errors.push("username must be at least 3 characters");
    }

    if (email !== undefined && (typeof email !== "string" || !emailRegex.test(email.trim()))) {
        errors.push("email is invalid");
    }

    if (password !== undefined && (typeof password !== "string" || password.length < 6)) {
        errors.push("password must be at least 6 characters");
    }

    if (avatarUrl !== undefined && avatarUrl !== null && typeof avatarUrl !== "string") {
        errors.push("avatar_url must be a string");
    }

    if (language !== undefined && !allowedLanguages.includes(language)) {
        errors.push("language must be one of: vi, en");
    }

    if (status !== undefined && !["active", "inactive", "banned"].includes(status)) {
        errors.push("status must be one of: active, inactive, banned");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
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

export const validateUpdateUserRole = async (req, res, next) => {
    const { role_id: roleId, reason } = req.body || {};
    const inputKeys = Object.keys(req.body || {});
    const invalidFields = inputKeys.filter((key) => !["role_id", "reason"].includes(key));

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    if (!roleId || typeof roleId !== "string" || !mongoose.Types.ObjectId.isValid(roleId)) {
        return res.status(400).json({
            message: "Validation failed",
            errors: ["role_id must be a valid ObjectId"]
        });
    }

    if (reason !== undefined && (typeof reason !== "string" || reason.trim().length < 3)) {
        return res.status(400).json({
            message: "Validation failed",
            errors: ["reason must be at least 3 characters"]
        });
    }

    try {
        const roleExists = await Role.exists({ _id: roleId });
        if (!roleExists) {
            return res.status(400).json({
                message: "Validation failed",
                errors: ["role_id does not exist"]
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }

    req.validatedBody = {
        role_id: roleId,
        ...(reason !== undefined ? { reason: reason.trim() } : {})
    };
    return next();
};
