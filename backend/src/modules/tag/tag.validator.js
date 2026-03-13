import mongoose from "mongoose";

const allowedCreateFields = ["name", "slug"];
const allowedUpdateFields = ["name", "slug"];

const getInvalidFields = (payload, allowedFields) => {
    const inputKeys = Object.keys(payload || {});
    return inputKeys.filter((key) => !allowedFields.includes(key));
};

const isValidSlug = (value) => {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
};

export const validateCreateTag = (req, res, next) => {
    const payload = req.body || {};
    const invalidFields = getInvalidFields(payload, allowedCreateFields);

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    const { name, slug } = payload;
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) {
        errors.push("name must be between 2 and 60 characters");
    }

    if (slug !== undefined) {
        if (typeof slug !== "string" || slug.trim().length < 2 || slug.trim().length > 80 || !isValidSlug(slug.trim().toLowerCase())) {
            errors.push("slug must contain lowercase letters, numbers, and hyphens only");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        name: name.trim(),
        ...(slug !== undefined ? { slug: slug.trim().toLowerCase() } : {})
    };

    return next();
};

export const validateUpdateTag = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);

    if (inputKeys.length === 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["At least one field is required for update"]
        });
    }

    const invalidFields = getInvalidFields(payload, allowedUpdateFields);
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    const { name, slug } = payload;
    const errors = [];

    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60)) {
        errors.push("name must be between 2 and 60 characters");
    }

    if (slug !== undefined) {
        if (typeof slug !== "string" || slug.trim().length < 2 || slug.trim().length > 80 || !isValidSlug(slug.trim().toLowerCase())) {
            errors.push("slug must contain lowercase letters, numbers, and hyphens only");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(slug !== undefined ? { slug: slug.trim().toLowerCase() } : {})
    };

    return next();
};

export const validateTagIdParam = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["id must be a valid ObjectId"]
        });
    }

    return next();
};
